const crypto = require('crypto');

function toBase64Url(buffer) {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function constantTimeEqual(left, right) {
    if (typeof left !== 'string' || typeof right !== 'string') {
        return false;
    }

    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeLaunchParams(input) {
    const params = new URLSearchParams(
        typeof input === 'string'
            ? input.replace(/^\?/, '')
            : new URLSearchParams(input || {}).toString(),
    );
    const result = {};

    for (const [key, value] of params.entries()) {
        if (key === 'sign' || key.startsWith('vk_')) {
            result[key] = value;
        }
    }

    return result;
}

function buildSignPayload(params) {
    return Object.keys(params)
        .filter(key => key.startsWith('vk_'))
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
}

function createVkLaunchParamsService(config) {
    const appSecret = typeof config.vkAppSecret === 'string' ? config.vkAppSecret.trim() : '';
    const appId = typeof config.vkAppId === 'string' ? config.vkAppId.trim() : '';

    return {
        isConfigured: Boolean(appSecret),

        normalizeLaunchParams,

        getReturnParams(input) {
            return normalizeLaunchParams(input);
        },

        verify(input) {
            if (!appSecret) {
                return {
                    ok: false,
                    code: 'VK_AUTH_NOT_CONFIGURED',
                    params: {},
                };
            }

            const params = normalizeLaunchParams(input);
            const sign = typeof params.sign === 'string' ? params.sign.trim() : '';
            if (!sign || !params.vk_user_id) {
                return {
                    ok: false,
                    code: 'VK_PARAMS_INVALID',
                    params,
                };
            }

            if (appId && params.vk_app_id && params.vk_app_id !== appId) {
                return {
                    ok: false,
                    code: 'VK_APP_ID_MISMATCH',
                    params,
                };
            }

            const expectedSign = toBase64Url(
                crypto
                    .createHmac('sha256', appSecret)
                    .update(buildSignPayload(params))
                    .digest(),
            );

            if (!constantTimeEqual(expectedSign, sign)) {
                return {
                    ok: false,
                    code: 'VK_SIGN_INVALID',
                    params,
                };
            }

            return {
                ok: true,
                code: null,
                params,
            };
        },
    };
}

module.exports = {
    createVkLaunchParamsService,
};
