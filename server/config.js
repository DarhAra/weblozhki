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
    sessionCookieSameSite: parseSameSite(process.env.SESSION_COOKIE_SAME_SITE, 'Lax'),
    sessionCookieSecure: parseBoolean(process.env.SESSION_COOKIE_SECURE, isProduction),
    sessionTtlMs: parseNumber(process.env.SESSION_TTL_HOURS, 24 * 7) * 60 * 60 * 1000,
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
        sessionCookieSameSite: config.sessionCookieSameSite,
        sessionCookieSecure: config.sessionCookieSecure,
        sessionTtlHours: Math.round(config.sessionTtlMs / (60 * 60 * 1000)),
    };
}

module.exports = {
    config,
    getSafeRuntimeSummary,
};
