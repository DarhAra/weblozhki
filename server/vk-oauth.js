const crypto = require('crypto');

const VK_OAUTH_AUTHORIZE_URL = 'https://id.vk.com/authorize';
const VK_OAUTH_TOKEN_URL = 'https://id.vk.com/oauth2/token';
const VK_OAUTH_USER_INFO_URL = 'https://id.vk.com/oauth2/user_info';
const VK_API_VERSION = '5.199';
const STATE_TTL_MS = 10 * 60 * 1000;

function createVkOAuthService(config) {
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
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code || '',
            client_id: appId,
            client_secret: appSecret,
            redirect_uri: redirectUri,
            device_id: deviceId || '',
        });

        const response = await fetch(VK_OAUTH_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`VK OAuth token exchange failed: ${response.status} ${text}`);
        }

        return response.json();
    }

    async function getUserInfo(accessToken) {
        const params = new URLSearchParams({
            client_id: appId,
            access_token: accessToken,
        });

        const response = await fetch(`${VK_OAUTH_USER_INFO_URL}?${params.toString()}`);

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`VK OAuth user info failed: ${response.status} ${text}`);
        }

        return response.json();
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
