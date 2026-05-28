const crypto = require('crypto');

const VK_AUTHORIZE_URL = 'https://id.vk.com/authorize';
const VK_TOKEN_URL = 'https://id.vk.com/oauth2/auth';
const VK_USER_INFO_URL = 'https://id.vk.com/oauth2/user_info';
const VK_API_BASE = 'https://api.vk.com/method';
const VK_API_VERSION = '5.199';
const STATE_TTL_MS = 10 * 60 * 1000;

function base64Url(input) {
    return input
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function createVkOAuthService(config, logger = console) {
    const appId = config.vkSiteAppId || '';
    const appSecret = config.vkSiteAppSecret || '';
    const redirectUri = (config.appBaseUrl || '') + '/api/auth/vk/oauth/callback';
    const isConfigured = Boolean(appId && appSecret && config.appBaseUrl);

    const store = new Map();

    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (now - entry.createdAt > STATE_TTL_MS) {
                store.delete(key);
            }
        }
    }, 60_000);

    function generateState() {
        const state = crypto.randomBytes(24).toString('hex');
        const codeVerifier = base64Url(crypto.randomBytes(64));
        const codeChallenge = base64Url(
            crypto.createHash('sha256').update(codeVerifier).digest(),
        );
        store.set(state, { codeVerifier, createdAt: Date.now() });
        return { state, codeVerifier, codeChallenge };
    }

    function consumeState(state) {
        const entry = store.get(state);
        if (!entry) return null;
        store.delete(state);
        return (Date.now() - entry.createdAt) < STATE_TTL_MS ? entry.codeVerifier : null;
    }

    function getAuthorizeUrl(state, codeChallenge) {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: appId,
            redirect_uri: redirectUri,
            scope: 'email',
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });
        return `${VK_AUTHORIZE_URL}?${params.toString()}`;
    }

    async function exchangeCode(code, deviceId, codeVerifier) {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code || '',
            client_id: appId,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier || '',
            device_id: deviceId || '',
        });

        logger.log('[VK] Token exchange POST:', VK_TOKEN_URL);

        let response;
        try {
            response = await fetch(VK_TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
                signal: AbortSignal.timeout(15000),
            });
        } catch (fetchError) {
            throw new Error(`VK token exchange network error: ${fetchError.message}`);
        }

        let bodyText;
        try {
            bodyText = await response.text();
        } catch {
            bodyText = '<unreadable>';
        }

        logger.log('[VK] Token exchange response:', { status: response.status, body: bodyText.slice(0, 600) });

        if (!response.ok) {
            throw new Error(`VK token exchange failed: ${response.status} ${bodyText.slice(0, 300)}`);
        }

        let parsed;
        try {
            parsed = JSON.parse(bodyText);
        } catch {
            throw new Error(`VK token exchange response not JSON: ${bodyText.slice(0, 200)}`);
        }

        if (parsed.error) {
            throw new Error(`VK API error: ${parsed.error} — ${parsed.error_description || ''}`);
        }

        return parsed;
    }

    async function getUserInfo(accessToken) {
        const body = new URLSearchParams({
            client_id: appId,
            access_token: accessToken || '',
        });

        logger.log('[VK] User info POST');

        let response;
        try {
            response = await fetch(VK_USER_INFO_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
                signal: AbortSignal.timeout(15000),
            });
        } catch (fetchError) {
            throw new Error(`VK user info network error: ${fetchError.message}`);
        }

        let bodyText;
        try {
            bodyText = await response.text();
        } catch {
            bodyText = '<unreadable>';
        }

        logger.log('[VK] User info response:', { status: response.status, body: bodyText.slice(0, 600) });

        if (!response.ok) {
            throw new Error(`VK user info failed: ${response.status} ${bodyText.slice(0, 300)}`);
        }

        let parsed;
        try {
            parsed = JSON.parse(bodyText);
        } catch {
            throw new Error(`VK user info response not JSON: ${bodyText.slice(0, 200)}`);
        }

        if (parsed.error) {
            throw new Error(`VK API error: ${parsed.error} — ${parsed.error_description || ''}`);
        }

        return parsed;
    }

    async function verifyAccessToken(accessToken, userId) {
        const params = new URLSearchParams({
            user_ids: String(userId || ''),
            fields: 'photo_200',
            access_token: accessToken,
            v: VK_API_VERSION,
        });
        const url = `${VK_API_BASE}/users.get?${params.toString()}`;

        let response;
        try {
            response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        } catch (fetchError) {
            return { ok: false, error: `network: ${fetchError.message}` };
        }

        let bodyText;
        try {
            bodyText = await response.text();
        } catch {
            return { ok: false, error: 'unreadable_response' };
        }

        if (!response.ok) return { ok: false, error: `http_${response.status}` };

        let parsed;
        try {
            parsed = JSON.parse(bodyText);
        } catch {
            return { ok: false, error: 'invalid_json' };
        }

        if (parsed.error) {
            return { ok: false, error: parsed.error.error_msg || parsed.error.error || 'api_error' };
        }

        const users = Array.isArray(parsed.response) ? parsed.response : [];
        const profile = users[0];

        if (!profile || String(profile.id) !== String(userId)) {
            return { ok: false, error: 'user_id_mismatch' };
        }

        return {
            ok: true,
            user: {
                id: String(profile.id),
                firstName: String(profile.first_name || '').trim(),
                lastName: String(profile.last_name || '').trim(),
                photo: String(profile.photo_200 || '').trim(),
            },
        };
    }

    return {
        isConfigured,
        generateState,
        consumeState,
        getAuthorizeUrl,
        exchangeCode,
        getUserInfo,
        verifyAccessToken,
    };
}

module.exports = {
    createVkOAuthService,
};
