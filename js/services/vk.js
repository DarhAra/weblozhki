import bridge, { parseURLSearchParamsForGetLaunchParams } from '@vkontakte/vk-bridge';

function hasLaunchParams(params) {
    return Boolean(params?.vk_app_id && params?.vk_user_id && params?.sign);
}

function collectLaunchParamsFromLocation() {
    if (typeof window === 'undefined') {
        return {
            isVkMiniApp: false,
            rawLaunchParams: '',
            launchParams: {},
        };
    }

    const parsed = parseURLSearchParamsForGetLaunchParams(window.location.search);
    const params = {};

    Object.entries(parsed || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }
        params[key] = String(value);
    });

    const rawLaunchParams = new URLSearchParams(params).toString();
    return {
        isVkMiniApp: hasLaunchParams(params),
        rawLaunchParams,
        launchParams: params,
    };
}

export function createVkService() {
    const state = {
        isVkMiniApp: false,
        rawLaunchParams: '',
        launchParams: {},
        initialized: false,
    };

    async function init() {
        const detected = collectLaunchParamsFromLocation();
        state.isVkMiniApp = detected.isVkMiniApp;
        state.rawLaunchParams = detected.rawLaunchParams;
        state.launchParams = detected.launchParams;

        if (state.isVkMiniApp && !state.initialized) {
            state.initialized = true;
            try {
                await bridge.send('VKWebAppInit');
            } catch {
                // Keep the app usable even if bridge is temporarily unavailable.
            }
        }

        return {
            isVkMiniApp: state.isVkMiniApp,
            rawLaunchParams: state.rawLaunchParams,
            launchParams: { ...state.launchParams },
        };
    }

    async function openUrl(url) {
        if (!url) {
            return false;
        }

        if (state.isVkMiniApp) {
            try {
                await bridge.send('VKWebAppOpenURL', { url });
                return true;
            } catch {
                // Fall back to the browser redirect below.
            }
        }

        if (typeof window !== 'undefined') {
            window.location.href = url;
            return true;
        }

        return false;
    }

    function getLaunchParamsQuery() {
        return state.rawLaunchParams;
    }

    return {
        init,
        openUrl,
        getLaunchParamsQuery,
    };
}
