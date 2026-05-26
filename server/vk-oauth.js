const crypto = require('crypto');

const VK_AUTHORIZE_URL = 'https://oauth.vk.com/authorize';
const VK_ACCESS_TOKEN_URL = 'https://oauth.vk.com/access_token';
const VK_API_BASE = 'https://api.vk.com/method';
const VK_API_VERSION = '5.199';
const STATE_TTL_MS = 10 * 60 * 1000;

function createVkOAuthService(config, logger = console) {
    const appId = config.vkAppId || '';
    const appSecret = config.vkAppSecret || '';
    const redirectUri = config.vkOauthRedirectUri || '';
    const isConfigured = Boolean(appId && appSecret && redirectUri);

    const stateStore = new Map();

    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of stateStore) {
            if (now - entry.createdAt > STATE_TTL_MS) {
                stateStore.delete(key);
            }
        }
    }, 60_000);

    function generateState() {
        const state = crypto.randomBytes(24).toString('hex');
        stateStore.set(state, { createdAt: Date.now() });
        return state;
    }

    function consumeState(state) {
        const entry = stateStore.get(state);
        if (!entry) return false;
        stateStore.delete(state);
        return (Date.now() - entry.createdAt) < STATE_TTL_MS;
    }

    function getAuthorizeUrl(state) {
        const params = new URLSearchParams({
            client_id: appId,
            redirect_uri: redirectUri,
            scope: 'email',
            response_type: 'code',
            display: 'page',
            state,
            v: VK_API_VERSION,
        });
        return `${VK_AUTHORIZE_URL}?${params.toString()}`;
    }

    async function exchangeCode(code) {
        const url = `${VK_ACCESS_TOKEN_URL}?${new URLSearchParams({
            client_id: appId,
            client_secret: appSecret,
            redirect_uri: redirectUri,
            code: code || '',
        }).toString()}`;

        logger.log('[VK_OAUTH] Token exchange GET:', url.slice(0, 120) + '...');

        let response;
        try {
            response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        } catch (fetchError) {
            logger.log('[VK_OAUTH] Token exchange FETCH ERROR:', fetchError.message);
            throw new Error(`VK token exchange network error: ${fetchError.message}`);
        }

        const status = response.status;
        let bodyText;
        try {
            bodyText = await response.text();
        } catch {
            bodyText = '<unreadable>';
        }

        logger.log('[VK_OAUTH] Token exchange response:', { status, body: bodyText.slice(0, 600) });

        if (!response.ok) {
            throw new Error(`VK token exchange failed: ${status} ${bodyText.slice(0, 300)}`);
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

    async function getUserInfo(accessToken, userId) {
        const params = new URLSearchParams({
            user_ids: String(userId || ''),
            fields: 'photo_200',
            access_token: accessToken,
            v: VK_API_VERSION,
        });
        const url = `${VK_API_BASE}/users.get?${params.toString()}`;

        logger.log('[VK_OAUTH] User info request:', { url: url.slice(0, 100) + '...' });

        let response;
        try {
            response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        } catch (fetchError) {
            logger.log('[VK_OAUTH] User info FETCH ERROR:', fetchError.message);
            throw new Error(`VK user info network error: ${fetchError.message}`);
        }

        const status = response.status;
        let bodyText;
        try {
            bodyText = await response.text();
        } catch {
            bodyText = '<unreadable>';
        }

        logger.log('[VK_OAUTH] User info response:', { status, body: bodyText.slice(0, 600) });

        if (!response.ok) {
            throw new Error(`VK user info failed: ${status} ${bodyText.slice(0, 300)}`);
        }

        let parsed;
        try {
            parsed = JSON.parse(bodyText);
        } catch {
            throw new Error(`VK user info response not JSON: ${bodyText.slice(0, 200)}`);
        }

        if (parsed.error) {
            throw new Error(`VK API error: ${parsed.error.code} — ${parsed.error.msg || ''}`);
        }

        return parsed;
    }

    return {
        isConfigured,
        generateState,
        consumeState,
        getAuthorizeUrl,
        exchangeCode,
        getUserInfo,
    };
}

module.exports = {
    createVkOAuthService,
};
