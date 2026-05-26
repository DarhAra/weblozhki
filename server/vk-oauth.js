const VK_API_VERSION = '5.199';

function createVkOAuthService(config, logger = console) {
    const appId = config.vkAppId || '';
    const isConfigured = Boolean(appId);

    async function verifyAccessToken(accessToken, userId) {
        const params = new URLSearchParams({
            user_ids: String(userId || ''),
            fields: 'photo_200',
            access_token: accessToken,
            v: VK_API_VERSION,
        });
        const url = `https://api.vk.com/method/users.get?${params.toString()}`;

        logger.log('[VK_VERIFY] Request:', { url: url.slice(0, 100) + '...' });

        let response;
        try {
            response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        } catch (fetchError) {
            logger.log('[VK_VERIFY] Network error:', fetchError.message);
            return { ok: false, error: 'network_error' };
        }

        let bodyText;
        try {
            bodyText = await response.text();
        } catch {
            return { ok: false, error: 'unreadable_response' };
        }

        logger.log('[VK_VERIFY] Response:', { status: response.status, body: bodyText.slice(0, 400) });

        if (!response.ok) {
            return { ok: false, error: `http_${response.status}` };
        }

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
        verifyAccessToken,
    };
}

module.exports = {
    createVkOAuthService,
};
