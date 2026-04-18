const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

function parseNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value, fallback = false) {
    if (typeof value !== 'string') {
        return fallback;
    }

    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
    }

    if (['0', 'false', 'no', 'off'].includes(normalized)) {
        return false;
    }

    return fallback;
}

function parseSameSite(value, fallback = 'Lax') {
    if (typeof value !== 'string') {
        return fallback;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized === 'strict') return 'Strict';
    if (normalized === 'none') return 'None';
    if (normalized === 'lax') return 'Lax';
    return fallback;
}

function parseCsvList(value) {
    if (typeof value !== 'string') {
        return [];
    }

    return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const config = {
    nodeEnv,
    isProduction,
    isDevelopment: !isProduction,
    port: parseNumber(process.env.PORT, 3000),
    rootDir: ROOT_DIR,
    dataDir: DATA_DIR,
    databasePath: process.env.DATABASE_PATH || path.join('data', 'app.db'),
    trustProxy: parseBoolean(process.env.TRUST_PROXY, false),
    sessionCookieName: process.env.SESSION_COOKIE_NAME || 'rtodo_sid',
    csrfCookieName: process.env.CSRF_COOKIE_NAME || 'rtodo_csrf',
    sessionCookieSameSite: parseSameSite(process.env.SESSION_COOKIE_SAME_SITE, 'Lax'),
    sessionCookieSecure: parseBoolean(process.env.SESSION_COOKIE_SECURE, isProduction),
    sessionTtlMs: parseNumber(process.env.SESSION_TTL_DAYS, 30) * 24 * 60 * 60 * 1000,
    sessionRenewThresholdMs: 24 * 60 * 60 * 1000,
    passwordResetTtlMs: parseNumber(process.env.PASSWORD_RESET_TTL_MINUTES, 30) * 60 * 1000,
    dataEncryptionKey: process.env.DATA_ENCRYPTION_KEY || '',
    runtimeStateMaxBytes: parseNumber(process.env.RUNTIME_STATE_MAX_BYTES, 256 * 1024),
    privateStateMaxBytes: parseNumber(process.env.PRIVATE_STATE_MAX_BYTES, 768 * 1024),
    offlineStateTtlHours: parseNumber(process.env.OFFLINE_STATE_TTL_HOURS, 168),
    authRateLimitWindowMs: parseNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES, 15) * 60 * 1000,
    loginRateLimitMaxAttempts: parseNumber(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS, 10),
    registerRateLimitMaxAttempts: parseNumber(process.env.REGISTER_RATE_LIMIT_MAX_ATTEMPTS, 5),
    passwordResetRateLimitMaxAttempts: parseNumber(process.env.PASSWORD_RESET_RATE_LIMIT_MAX_ATTEMPTS, 5),
    allowedOrigin: process.env.ALLOWED_ORIGIN || process.env.APP_BASE_URL || '',
    appBaseUrl: process.env.APP_BASE_URL || null,
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseNumber(process.env.SMTP_PORT, 587),
    smtpSecure: parseBoolean(process.env.SMTP_SECURE, false),
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    smtpFromEmail: process.env.SMTP_FROM_EMAIL || '',
    smtpFromName: process.env.SMTP_FROM_NAME || 'Мои ложки',
    yookassaShopId: process.env.YOOKASSA_SHOP_ID || '',
    yookassaSecretKey: process.env.YOOKASSA_SECRET_KEY || '',
    yookassaWebhookSecret: process.env.YOOKASSA_WEBHOOK_SECRET || '',
    yookassaWebhookAllowedIps: parseCsvList(process.env.YOOKASSA_WEBHOOK_ALLOWED_IPS),
    donationAllowedAmounts: parseCsvList(process.env.DONATION_ALLOWED_AMOUNTS)
        .map(value => Number(value))
        .filter(value => Number.isFinite(value) && value > 0),
    donationMinAmount: parseNumber(process.env.DONATION_MIN_AMOUNT, 100),
    donationMaxAmount: parseNumber(process.env.DONATION_MAX_AMOUNT, 5000),
    donationCurrency: process.env.DONATION_CURRENCY || 'RUB',
    legacyStateFile: path.join(DATA_DIR, 'state.json'),
    legacyUserFile: path.join(DATA_DIR, 'users.json'),
    legacyUserStateDir: path.join(DATA_DIR, 'states'),
};

function getSafeRuntimeSummary() {
    return {
        mode: config.nodeEnv,
        port: config.port,
        trustProxy: config.trustProxy,
        databasePath: config.databasePath,
        sessionCookieName: config.sessionCookieName,
        csrfCookieName: config.csrfCookieName,
        sessionCookieSameSite: config.sessionCookieSameSite,
        sessionCookieSecure: config.sessionCookieSecure,
        sessionTtlDays: Math.round(config.sessionTtlMs / (24 * 60 * 60 * 1000)),
        appBaseUrl: config.appBaseUrl,
        allowedOrigin: config.allowedOrigin,
        dataEncryptionConfigured: Boolean(config.dataEncryptionKey || !config.isProduction),
        smtpConfigured: Boolean(config.smtpHost && config.smtpUser && config.smtpPassword && config.smtpFromEmail),
        yookassaConfigured: Boolean(config.yookassaShopId && config.yookassaSecretKey),
    };
}

module.exports = {
    config,
    getSafeRuntimeSummary,
};
