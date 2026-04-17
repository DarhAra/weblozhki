const API_AUTH_SESSION_URL = '/api/auth/session';
const API_AUTH_LOGIN_URL = '/api/auth/login';
const API_AUTH_REGISTER_URL = '/api/auth/register';
const API_AUTH_LOGOUT_URL = '/api/auth/logout';
const API_AUTH_FORGOT_PASSWORD_URL = '/api/auth/forgot-password';
const API_AUTH_RESET_PASSWORD_URL = '/api/auth/reset-password';
const API_ACCOUNT_PROFILE_URL = '/api/account/profile';
const API_ACCOUNT_CHANGE_PASSWORD_URL = '/api/account/change-password';
const API_PAYMENT_STATUS_URL = '/api/payments/status';
const API_CREATE_DONATION_SESSION_URL = '/api/payments/create-donation-session';

async function readJsonResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return null;
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
}

function buildFriendlyAuthError(payload, fallbackMessage) {
    const errorCode = payload?.error;
    if (errorCode === 'EMAIL_EXISTS') {
        return 'Этот email уже используется.';
    }
    if (errorCode === 'INVALID_NAME') {
        return 'Укажите имя длиной от 2 до 80 символов.';
    }
    if (errorCode === 'INVALID_PASSWORD') {
        return 'Пароль должен быть не короче 6 символов.';
    }
    if (errorCode === 'INVALID_EMAIL') {
        return 'Пожалуйста, проверь email.';
    }
    if (errorCode === 'AUTH_FAILED' || errorCode === 'INVALID_CREDENTIALS') {
        return 'Не получилось войти. Проверь email и пароль.';
    }
    if (errorCode === 'PASSWORD_RESET_TOKEN_INVALID') {
        return 'Ссылка для восстановления уже недействительна. Запросите новую.';
    }
    if (errorCode === 'AUTH_REQUIRED') {
        return 'Нужно войти в аккаунт заново.';
    }
    if (errorCode === 'INVALID_DONATION_AMOUNT') {
        return 'Выберите корректную сумму поддержки.';
    }
    if (errorCode === 'PAYMENTS_NOT_CONFIGURED') {
        return 'Оплата ещё не настроена на сервере.';
    }
    if (errorCode === 'DONATION_NOT_FOUND') {
        return 'Платёж не найден или больше недоступен.';
    }
    return fallbackMessage;
}

async function requestJson(url, options = {}, fallbackMessage = 'Сейчас не получается связаться с сервером.') {
    let response;

    try {
        response = await fetch(url, {
            credentials: 'same-origin',
            ...options,
        });
    } catch (error) {
        const networkError = new Error('Network request failed');
        networkError.friendlyMessage = fallbackMessage;
        networkError.isNetworkError = true;
        throw networkError;
    }

    const payload = await readJsonResponse(response);
    if (!response.ok) {
        const requestError = new Error(`Request failed with status ${response.status}`);
        requestError.friendlyMessage = buildFriendlyAuthError(payload, fallbackMessage);
        requestError.payload = payload;
        throw requestError;
    }

    return payload;
}

export function createAuthService() {
    async function checkSession() {
        const payload = await requestJson(
            API_AUTH_SESSION_URL,
            {
                headers: {
                    Accept: 'application/json',
                },
            },
            'Сейчас не получается проверить вход. Попробуй чуть позже.',
        );

        return {
            authenticated: Boolean(payload?.authenticated),
            user: payload?.user || null,
        };
    }

    async function login({ email, password }) {
        const payload = await requestJson(
            API_AUTH_LOGIN_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ email, password }),
            },
            'Сейчас не получается войти. Попробуй ещё раз чуть позже.',
        );

        return payload?.user || null;
    }

    async function register({ name, email, password }) {
        const payload = await requestJson(
            API_AUTH_REGISTER_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            },
            'Сейчас не получается создать аккаунт. Попробуй ещё раз чуть позже.',
        );

        return payload?.user || null;
    }

    async function logout() {
        await requestJson(
            API_AUTH_LOGOUT_URL,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
            },
            'Сейчас не получается выйти из аккаунта. Попробуй ещё раз чуть позже.',
        );
    }

    async function forgotPassword({ email }) {
        return requestJson(
            API_AUTH_FORGOT_PASSWORD_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ email }),
            },
            'Сейчас не получается отправить письмо для восстановления.',
        );
    }

    async function resetPassword({ token, password }) {
        return requestJson(
            API_AUTH_RESET_PASSWORD_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ token, password }),
            },
            'Сейчас не получается сменить пароль. Попробуй ещё раз чуть позже.',
        );
    }

    async function getProfile() {
        const payload = await requestJson(
            API_ACCOUNT_PROFILE_URL,
            {
                headers: {
                    Accept: 'application/json',
                },
            },
            'Сейчас не получается открыть данные аккаунта.',
        );

        return payload?.user || null;
    }

    async function updateProfile({ name, email }) {
        const payload = await requestJson(
            API_ACCOUNT_PROFILE_URL,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ name, email }),
            },
            'Сейчас не получается обновить профиль.',
        );

        return payload?.user || null;
    }

    async function changePassword({ currentPassword, newPassword }) {
        return requestJson(
            API_ACCOUNT_CHANGE_PASSWORD_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            },
            'Сейчас не получается сменить пароль.',
        );
    }

    async function getPaymentStatus({ donationId } = {}) {
        const url = new URL(API_PAYMENT_STATUS_URL, window.location.origin);
        if (donationId) {
            url.searchParams.set('donationId', donationId);
        }

        return requestJson(
            `${url.pathname}${url.search}`,
            {
                headers: {
                    Accept: 'application/json',
                },
            },
            'Сейчас не получается проверить статус поддержки.',
        );
    }

    async function createDonationSession({ amount }) {
        return requestJson(
            API_CREATE_DONATION_SESSION_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ amount }),
            },
            'Сейчас не получается открыть страницу оплаты.',
        );
    }

    return {
        checkSession,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        getProfile,
        updateProfile,
        changePassword,
        getPaymentStatus,
        createDonationSession,
    };
}
