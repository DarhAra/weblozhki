const crypto = require('crypto');

const VK_OAUTH_AUTHORIZE_URL = 'https://id.vk.com/authorize';
const VK_OAUTH_TOKEN_URL = 'https://id.vk.com/oauth2/token';
const VK_OAUTH_USER_INFO_URL = 'https://id.vk.com/oauth2/user_info';
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
            response_type: 'code',
            client_id: appId,
            redirect_uri: redirectUri,
            scope: 'email',
            state,
            v: VK_API_VERSION,
        });
        return `${VK_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
    }

    async function exchangeCode(code, deviceId) {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code || '',
            client_id: appId,
            client_secret: appSecret,
            redirect_uri: redirectUri,
            device_id: deviceId || '',
        });

        logger.log('[VK_OAUTH] Token exchange request:', {
            url: VK_OAUTH_TOKEN_URL,
            client_id: appId,
            redirect_uri: redirectUri,
            code_length: (code || '').length,
            device_id_length: (deviceId || '').length,
        });

        let response;
        try {
            response = await fetch(VK_OAUTH_TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
                signal: AbortSignal.timeout(15000),
            });
        } catch (fetchError) {
            logger.log('[VK_OAUTH] Token exchange FETCH ERROR:', fetchError.message, fetchError.code || '');
            if (fetchError.code === 'UND_ERR_CONNECT_TIMEOUT' || fetchError.code === 'ETIMEDOUT' || fetchError.name === 'TimeoutError') {
                throw new Error('VK OAuth token exchange timed out');
            }
            throw new Error(`VK OAuth token exchange network error: ${fetchError.message}`);
        }

        const status = response.status;
        let bodyText;
        try {
            bodyText = await response.text();
        } catch {
            bodyText = '<unreadable>';
        }

        logger.log('[VK_OAUTH] Token exchange response:', { status, body: bodyText.slice(0, 500) });

        if (!response.ok) {
            throw new Error(`VK OAuth token exchange failed: ${status} ${bodyText.slice(0, 300)}`);
        }

        let parsed;
        try {
            parsed = JSON.parse(bodyText);
        } catch {
            throw new Error(`VK OAuth token exchange response not JSON: ${bodyText.slice(0, 200)}`);
        }

        return parsed;
    }

    async function getUserInfo(accessToken) {
        const query = new URLSearchParams({
            client_id: appId,
            access_token: accessToken,
        });
        const url = `${VK_OAUTH_USER_INFO_URL}?${query.toString()}`;

        logger.log('[VK_OAUTH] User info request:', { url: url.slice(0, 100) + '...' });

        let response;
        try {
            response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        } catch (fetchError) {
            logger.log('[VK_OAUTH] User info FETCH ERROR:', fetchError.message);
            throw new Error(`VK OAuth user info network error: ${fetchError.message}`);
        }

        const status = response.status;
        let bodyText;
        try {
            bodyText = await response.text();
        } catch {
            bodyText = '<unreadable>';
        }

        logger.log('[VK_OAUTH] User info response:', { status, body: bodyText.slice(0, 500) });

        if (!response.ok) {
            throw new Error(`VK OAuth user info failed: ${status} ${bodyText.slice(0, 300)}`);
        }

        let parsed;
        try {
            parsed = JSON.parse(bodyText);
        } catch {
            throw new Error(`VK OAuth user info response not JSON: ${bodyText.slice(0, 200)}`);
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
