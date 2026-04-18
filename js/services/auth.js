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

let csrfToken = '';

function setCsrfToken(nextToken) {
    csrfToken = typeof nextToken === 'string' ? nextToken : '';
}

function getCsrfToken() {
    return csrfToken;
}

export function getCsrfTokenValue() {
    return getCsrfToken();
}

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
    if (errorCode === 'PASSWORD_TOO_WEAK') {
        return 'Пароль нужен чуть сильнее: лучше с буквами разного регистра и цифрами.';
    }
    if (errorCode === 'INVALID_EMAIL') {
        return 'Пожалуйста, проверьте email.';
    }
    if (errorCode === 'AUTH_FAILED' || errorCode === 'INVALID_CREDENTIALS') {
        return 'Не получилось войти. Проверьте email и пароль.';
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
    if (errorCode === 'RATE_LIMITED') {
        return 'Слишком много попыток. Попробуйте чуть позже.';
    }
    if (errorCode === 'CSRF_TOKEN_INVALID') {
        return 'Защитная сессия обновилась. Повторите действие ещё раз.';
    }
    if (errorCode === 'ORIGIN_FORBIDDEN') {
        return 'Запрос отклонён из соображений безопасности.';
    }
    return fallbackMessage;
}

async function requestJson(url, options = {}, fallbackMessage = 'Сейчас не получается связаться с сервером.') {
    let response;

    try {
        const headers = new Headers(options.headers || {});
        if (!headers.has('Accept')) {
            headers.set('Accept', 'application/json');
        }
        if (csrfToken && !headers.has('X-CSRF-Token')) {
            headers.set('X-CSRF-Token', csrfToken);
        }

        response = await fetch(url, {
            credentials: 'same-origin',
            ...options,
            headers,
        });
    } catch (error) {
        const networkError = new Error('Network request failed');
        networkError.friendlyMessage = fallbackMessage;
        networkError.isNetworkError = true;
        throw networkError;
    }

    const payload = await readJsonResponse(response);
    if (payload?.csrfToken) {
        setCsrfToken(payload.csrfToken);
    }

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
            {},
            'Сейчас не получается проверить вход. Попробуйте чуть позже.',
        );

        return {
            authenticated: Boolean(payload?.authenticated),
            user: payload?.user || null,
            csrfToken: payload?.csrfToken || '',
        };
    }

    async function login({ email, password }) {
        const payload = await requestJson(
            API_AUTH_LOGIN_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            },
            'Сейчас не получается войти. Попробуйте ещё раз чуть позже.',
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
                },
                body: JSON.stringify({ name, email, password }),
            },
            'Сейчас не получается создать аккаунт. Попробуйте ещё раз чуть позже.',
        );

        return payload?.user || null;
    }

    async function logout() {
        await requestJson(
            API_AUTH_LOGOUT_URL,
            {
                method: 'POST',
            },
            'Сейчас не получается выйти из аккаунта. Попробуйте ещё раз чуть позже.',
        );
        setCsrfToken('');
    }

    async function forgotPassword({ email }) {
        return requestJson(
            API_AUTH_FORGOT_PASSWORD_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
                },
                body: JSON.stringify({ token, password }),
            },
            'Сейчас не получается сменить пароль. Попробуйте ещё раз чуть позже.',
        );
    }

    async function getProfile() {
        const payload = await requestJson(
            API_ACCOUNT_PROFILE_URL,
            {},
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
            {},
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
        setCsrfToken,
        getCsrfToken,
    };
}
