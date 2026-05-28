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

    const rawSearch = (window.location.search || '').replace(/^\?/, '');
    const parsed = parseURLSearchParamsForGetLaunchParams(window.location.search);
    const params = {};

    Object.entries(parsed || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }
        params[key] = String(value);
    });

    return {
        isVkMiniApp: hasLaunchParams(params),
        rawLaunchParams: rawSearch,
        launchParams: params,
    };
}

function buildLaunchParamsQuery(params) {
    if (!params) return '';
    return Object.entries(params)
        .filter(([key]) => key === 'sign' || key.startsWith('vk_'))
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&');
}

export function createVkService() {
    const state = {
        isVkMiniApp: false,
        rawLaunchParams: '',
        launchParams: {},
        initPromise: null,
        bridgeAvailable: false,
    };

    async function init() {
        if (state.initPromise) return state.initPromise;

        state.initPromise = (async () => {
            const detected = collectLaunchParamsFromLocation();
            state.rawLaunchParams = detected.rawLaunchParams;
            state.launchParams = detected.launchParams;

            try {
                await bridge.send('VKWebAppInit');

                const bridgeResult = await getBridgeLaunchParams();
                if (bridgeResult) {
                    state.isVkMiniApp = true;
                    state.bridgeAvailable = true;
                    state.rawLaunchParams = bridgeResult.rawLaunchParams;
                    state.launchParams = { ...state.launchParams, ...bridgeResult.launchParams };
                }
            } catch {
                // Bridge not available — outside VK Mini App or bridge error.
                // Fall back to URL launch params if present.
                state.isVkMiniApp = detected.isVkMiniApp;
                state.bridgeAvailable = false;
            }

            return {
                isVkMiniApp: state.isVkMiniApp,
                rawLaunchParams: state.rawLaunchParams,
                launchParams: { ...state.launchParams },
                bridgeAvailable: state.bridgeAvailable,
            };
        })();

        return state.initPromise;
    }

    async function getBridgeLaunchParams() {
        try {
            const result = await bridge.send('VKWebAppGetLaunchParams');
            if (result && hasLaunchParams(result)) {
                return {
                    launchParams: result,
                    rawLaunchParams: buildLaunchParamsQuery(result),
                };
            }
        } catch {
            // Not in VK context or bridge unavailable
        }
        return null;
    }

    async function getAuthToken(scope = '') {
        try {
            const appId = Number(state.launchParams.vk_app_id);
            if (!appId) return '';

            const result = await bridge.send('VKWebAppGetAuthToken', {
                app_id: appId,
                scope,
            });
            return result?.access_token || '';
        } catch {
            return '';
        }
    }

    async function openUrl(url) {
        if (!url) {
            return false;
        }

        if (state.bridgeAvailable) {
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
        getAuthToken,
    };
}
