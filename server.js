const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { config, getSafeRuntimeSummary } = require('./server/config');
const { createDataEncryptor, createPasswordService } = require('./server/crypto-utils');
const { createDatabase } = require('./server/db');
const { createRepositories } = require('./server/repositories');
const { createMailer } = require('./server/mailer');
const { ensureValidStateSegment, mergeAppState, splitAppState } = require('./server/state-storage');
const { createPaymentError, createYookassaClient } = require('./server/yookassa');
const { createVkLaunchParamsService } = require('./server/vk');
const { createVkOAuthService } = require('./server/vk-oauth');

const app = express();
const PORT = config.port;
const ROOT_DIR = config.rootDir;
const { db, databasePath } = createDatabase({
    rootDir: ROOT_DIR,
    databasePath: config.databasePath,
    legacyPaths: {
        stateFile: config.legacyStateFile,
        userFile: config.legacyUserFile,
        userStateDir: config.legacyUserStateDir,
    },
});
const dataEncryptor = createDataEncryptor({
    secret: config.dataEncryptionKey,
    isProduction: config.isProduction,
});
const passwordService = createPasswordService();
const repositories = createRepositories(db, { encryptor: dataEncryptor });
const mailer = createMailer(config);
const yookassa = createYookassaClient(config);
const vkLaunchParams = createVkLaunchParamsService(config);
const vkOAuth = createVkOAuthService(config);
const rateLimitStore = new Map();

app.set('trust proxy', config.trustProxy);

function logServerError(label, error, meta = {}) {
    const safeMeta = {
        code: meta.code || error?.code || null,
        userId: meta.userId || null,
        donationId: meta.donationId || null,
        paymentId: meta.paymentId || null,
        eventType: meta.eventType || null,
    };

    if (config.isDevelopment) {
        console.error(label, safeMeta, error);
        return;
    }

    console.error(label, {
        ...safeMeta,
        message: error?.message || 'Unknown error',
        statusCode: error?.statusCode || 500,
    });
}

function normalizeEmail(email) {
    if (typeof email !== 'string') {
        return '';
    }
    return email.trim().toLowerCase();
}

function normalizeDisplayName(name) {
    if (typeof name !== 'string') {
        return '';
    }

    return name.trim().replace(/\s+/g, ' ');
}

function isValidEmail(email) {
    return typeof email === 'string' && email.includes('@') && email.length <= 320;
}

function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 6 && password.length <= 200;
}

function hasStrongEnoughPassword(password) {
    if (typeof password !== 'string') {
        return false;
    }

    const checks = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
    ];

    return checks.filter(Boolean).length >= 2;
}

function isValidDisplayName(name) {
    return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 80;
}

function hashToken(rawToken) {
    return crypto.createHash('sha256').update(String(rawToken)).digest('hex');
}

function hashIp(ip) {
    return crypto.createHash('sha256').update(String(ip || '')).digest('hex');
}

function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        vkLinked: Boolean(user.vkUserId),
    };
}

function toPublicDonation(donation) {
    if (!donation) {
        return null;
    }

    return {
        id: donation.id,
        amountValue: donation.amountValue,
        amountCurrency: donation.amountCurrency,
        status: donation.status,
        type: donation.type,
        createdAt: donation.createdAt,
        confirmedAt: donation.confirmedAt,
    };
}

function getLaunchParamsPayload(input) {
    return vkLaunchParams.getReturnParams(input);
}

function getVkAuthErrorStatus(code) {
    if (code === 'VK_AUTH_NOT_CONFIGURED') {
        return 503;
    }

    if (code === 'VK_APP_ID_MISMATCH' || code === 'VK_PARAMS_INVALID' || code === 'VK_SIGN_INVALID') {
        return 400;
    }

    return 500;
}

function linkVkToUserAccount(userId, params) {
    const now = new Date().toISOString();
    return repositories.linkVkUser({
        id: userId,
        vkUserId: String(params.vk_user_id),
        vkLinkedAt: now,
        vkFirstSeenAt: now,
        updatedAt: now,
    });
}

function parseCookies(cookieHeader = '') {
    return cookieHeader
        .split(';')
        .map(part => part.trim())
        .filter(Boolean)
        .reduce((acc, chunk) => {
            const separator = chunk.indexOf('=');
            if (separator < 1) {
                return acc;
            }

            const key = chunk.slice(0, separator).trim();
            const value = decodeURIComponent(chunk.slice(separator + 1).trim());
            acc[key] = value;
            return acc;
        }, {});
}

function buildSessionCookie(sessionId, maxAgeMs = config.sessionTtlMs) {
    const parts = [
        `${config.sessionCookieName}=${encodeURIComponent(sessionId)}`,
        'Path=/',
        'HttpOnly',
        `SameSite=${config.sessionCookieSameSite}`,
        `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    ];

    if (config.sessionCookieSecure) {
        parts.push('Secure');
    }

    return parts.join('; ');
}

function buildCsrfCookie(token, maxAgeMs = config.sessionTtlMs) {
    const parts = [
        `${config.csrfCookieName}=${encodeURIComponent(token)}`,
        'Path=/',
        `SameSite=${config.sessionCookieSameSite}`,
        `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    ];

    if (config.sessionCookieSecure) {
        parts.push('Secure');
    }

    return parts.join('; ');
}

function buildClearSessionCookie() {
    const parts = [
        `${config.sessionCookieName}=`,
        'Path=/',
        'HttpOnly',
        `SameSite=${config.sessionCookieSameSite}`,
        'Max-Age=0',
    ];

    if (config.sessionCookieSecure) {
        parts.push('Secure');
    }

    return parts.join('; ');
}

function buildClearCsrfCookie() {
    const parts = [
        `${config.csrfCookieName}=`,
        'Path=/',
        `SameSite=${config.sessionCookieSameSite}`,
        'Max-Age=0',
    ];

    if (config.sessionCookieSecure) {
        parts.push('Secure');
    }

    return parts.join('; ');
}

function appendResponseCookie(res, cookieValue) {
    const current = res.getHeader('Set-Cookie');
    if (!current) {
        res.setHeader('Set-Cookie', cookieValue);
        return;
    }

    const nextCookies = Array.isArray(current) ? [...current, cookieValue] : [current, cookieValue];
    res.setHeader('Set-Cookie', nextCookies);
}

function setSessionCookie(res, sessionId, maxAgeMs = config.sessionTtlMs) {
    appendResponseCookie(res, buildSessionCookie(sessionId, maxAgeMs));
}

function setCsrfCookie(res, token, maxAgeMs = config.sessionTtlMs) {
    appendResponseCookie(res, buildCsrfCookie(token, maxAgeMs));
}

function clearSessionCookie(res) {
    appendResponseCookie(res, buildClearSessionCookie());
}

function clearCsrfCookie(res) {
    appendResponseCookie(res, buildClearCsrfCookie());
}

function createSessionRecord(userId, req) {
    const now = new Date();
    return {
        id: crypto.randomBytes(24).toString('hex'),
        userId,
        createdAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + config.sessionTtlMs).toISOString(),
        userAgent: String(req.get('user-agent') || '').slice(0, 512),
        ipHash: hashIp(req.ip),
    };
}

function createCsrfToken() {
    return crypto.randomBytes(24).toString('hex');
}

function parseIsoDate(value) {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : NaN;
}

function isSessionExpired(session) {
    return parseIsoDate(session.expiresAt) <= Date.now();
}

function createPasswordResetRecord(userId) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const now = new Date();

    return {
        rawToken,
        token: {
            id: `prt_${crypto.randomUUID()}`,
            userId,
            tokenHash: hashToken(rawToken),
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + config.passwordResetTtlMs).toISOString(),
        },
    };
}

function getBaseUrl() {
    return config.appBaseUrl || `http://localhost:${PORT}`;
}

function getResetUrl(rawToken) {
    return new URL(`/?resetToken=${encodeURIComponent(rawToken)}`, getBaseUrl()).toString();
}
function getAllowedOrigin() {
    if (!config.allowedOrigin) {
        return '';
    }

    try {
        return new URL(config.allowedOrigin).origin;
    } catch {
        return '';
    }
}

function getRequestOrigin(req) {
    const rawOrigin = req.get('origin');
    if (rawOrigin) {
        return rawOrigin;
    }

    const rawReferer = req.get('referer');
    if (!rawReferer) {
        return '';
    }

    try {
        return new URL(rawReferer).origin;
    } catch {
        return '';
    }
}

function isStateChangingMethod(method) {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method || '').toUpperCase());
}

function getRemoteIp(req) {
    return req.ip || req.connection?.remoteAddress || 'unknown';
}

function buildRateLimitKey(scope, req, extraKey = '') {
    return [
        scope,
        getRemoteIp(req),
        String(extraKey || '').toLowerCase(),
    ].join(':');
}

function takeRateLimitSlot({ scope, req, extraKey = '', limit, windowMs }) {
    const now = Date.now();
    const key = buildRateLimitKey(scope, req, extraKey);
    const bucket = rateLimitStore.get(key) || [];
    const nextBucket = bucket.filter(timestamp => now - timestamp < windowMs);
    if (nextBucket.length >= limit) {
        const error = new Error('Too many attempts. Please try again later.');
        error.statusCode = 429;
        error.code = 'RATE_LIMITED';
        throw error;
    }

    nextBucket.push(now);
    rateLimitStore.set(key, nextBucket);
}

function validatePublicOrigin(req, res, next) {
    if (!config.isProduction || !isStateChangingMethod(req.method) || req.path === '/api/payments/yookassa/webhook') {
        return next();
    }

    const allowedOrigin = getAllowedOrigin();
    if (!allowedOrigin) {
        return next();
    }

    const requestOrigin = getRequestOrigin(req);
    if (!requestOrigin || requestOrigin !== allowedOrigin) {
        return res.status(403).json({
            error: 'ORIGIN_FORBIDDEN',
            message: 'Request origin is not allowed.',
        });
    }

    return next();
}

function ensureCsrfContext(req, res, next) {
    const cookies = req.parsedCookies || parseCookies(req.headers.cookie || '');
    req.parsedCookies = cookies;
    req.csrfToken = typeof cookies[config.csrfCookieName] === 'string' && cookies[config.csrfCookieName]
        ? cookies[config.csrfCookieName]
        : createCsrfToken();
    req.shouldSetCsrfCookie = !cookies[config.csrfCookieName];
    if (req.shouldSetCsrfCookie) {
        setCsrfCookie(res, req.csrfToken);
    }
    next();
}

function requireCsrfToken(req, res, next) {
    if (!isStateChangingMethod(req.method) || req.path === '/api/payments/yookassa/webhook' || req.path === '/api/vk/auth') {
        return next();
    }

    const csrfHeader = req.get('x-csrf-token');
    if (!csrfHeader || csrfHeader !== req.csrfToken) {
        return res.status(403).json({
            error: 'CSRF_TOKEN_INVALID',
            message: 'Security token is missing or invalid.',
            csrfToken: req.csrfToken,
        });
    }

    return next();
}

function readRuntimeStateForRequest(req) {
    return req.user
        ? repositories.getUserRuntimeState(req.user.id)
        : repositories.getGuestRuntimeState();
}

function readPrivateStateForRequest(req) {
    if (!req.user) {
        return null;
    }

    return repositories.getUserPrivateState(req.user.id);
}

function readCombinedStateForRequest(req) {
    return mergeAppState({
        runtimeState: readRuntimeStateForRequest(req) || {},
        privateState: readPrivateStateForRequest(req) || {},
    });
}

function saveRuntimeStateForRequest(req, runtimeState) {
    if (req.user) {
        repositories.saveUserRuntimeState(req.user.id, runtimeState);
        return;
    }

    repositories.saveGuestRuntimeState(runtimeState);
}

function savePrivateStateForRequest(req, privateState) {
    if (!req.user) {
        return;
    }

    repositories.saveUserPrivateState(req.user.id, privateState);
}

function validateRuntimeState(runtimeState) {
    return ensureValidStateSegment(runtimeState, 'Runtime state', config.runtimeStateMaxBytes);
}

function validatePrivateState(privateState) {
    return ensureValidStateSegment(privateState, 'Private state', config.privateStateMaxBytes);
}

function refreshSession(req) {
    if (!req.sessionRecord) {
        return null;
    }

    const now = new Date();
    const refreshedExpiresAt = new Date(now.getTime() + config.sessionTtlMs).toISOString();

    repositories.touchSession({
        id: req.sessionRecord.id,
        lastSeenAt: now.toISOString(),
        expiresAt: refreshedExpiresAt,
    });

    req.sessionRecord.lastSeenAt = now.toISOString();
    req.sessionRecord.expiresAt = refreshedExpiresAt;
    req.shouldRefreshSessionCookie = true;
    return req.sessionRecord;
}

function applySessionRefresh(req, res) {
    if (req.shouldRefreshSessionCookie && req.sessionRecord?.id) {
        setSessionCookie(res, req.sessionRecord.id);
    }
}

function wrapResponseWithCsrfToken(req, res, next) {
    const originalJson = res.json.bind(res);
    res.json = body => {
        if (body && typeof body === 'object' && !body.csrfToken && req.csrfToken) {
            body = { ...body, csrfToken: req.csrfToken };
        }
        return originalJson(body);
    };
    next();
}

function wrapResponseWithSessionRefresh(req, res, next) {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const originalSendFile = res.sendFile.bind(res);

    res.json = body => {
        applySessionRefresh(req, res);
        return originalJson(body);
    };
    res.send = body => {
        applySessionRefresh(req, res);
        return originalSend(body);
    };
    res.sendFile = (...args) => {
        applySessionRefresh(req, res);
        return originalSendFile(...args);
    };

    next();
}

function revokeCurrentSession(req) {
    if (!req.sessionRecord?.id) {
        return;
    }

    repositories.revokeSession(req.sessionRecord.id);
    req.sessionId = null;
    req.sessionRecord = null;
    req.shouldRefreshSessionCookie = false;
}

function createSessionForUser(res, userId, req) {
    revokeCurrentSession(req);
    const session = createSessionRecord(userId, req);
    repositories.createSession(session);
    req.sessionId = session.id;
    req.sessionRecord = session;
    req.shouldRefreshSessionCookie = false;
    req.csrfToken = createCsrfToken();
    setSessionCookie(res, session.id);
    setCsrfCookie(res, req.csrfToken);
    return session;
}

function requireAuthenticatedUser(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'AUTH_REQUIRED',
            message: 'Please sign in first.',
        });
    }

    return next();
}

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use((req, _res, next) => {
    repositories.pruneExpiredSessions();
    repositories.prunePasswordResetTokens();
    next();
});
app.use((req, _res, next) => {
    try {
        const cookies = parseCookies(req.headers.cookie || '');
        req.parsedCookies = cookies;
        const sessionId = cookies[config.sessionCookieName];
        if (!sessionId) {
            req.user = null;
            req.sessionId = null;
            req.sessionRecord = null;
            req.shouldRefreshSessionCookie = false;
            return next();
        }

        const session = repositories.findSessionById(sessionId);
        if (!session || session.revokedAt || isSessionExpired(session)) {
            if (session?.id) {
                repositories.revokeSession(session.id);
            }
            req.user = null;
            req.sessionId = null;
            req.sessionRecord = null;
            req.shouldRefreshSessionCookie = false;
            return next();
        }

        const user = repositories.findUserById(session.userId);
        if (!user) {
            repositories.revokeSession(session.id);
            req.user = null;
            req.sessionId = null;
            req.sessionRecord = null;
            req.shouldRefreshSessionCookie = false;
            return next();
        }

        req.user = user;
        req.sessionId = session.id;
        req.sessionRecord = session;
        req.shouldRefreshSessionCookie = true;
        refreshSession(req);
        return next();
    } catch (error) {
        return next(error);
    }
});
app.use(validatePublicOrigin);
app.use(ensureCsrfContext);
app.use(wrapResponseWithCsrfToken);
app.use(requireCsrfToken);
app.use(wrapResponseWithSessionRefresh);
app.use((req, res, next) => {
    if (config.isProduction) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self'; connect-src 'self'; frame-ancestors 'self' https://vk.com https://*.vk.com https://vk.ru https://*.vk.ru; base-uri 'self'; form-action 'self'");
    next();
});
app.use(express.static(ROOT_DIR));

app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

app.get('/favicon.ico', (_req, res) => {
    res.status(204).end();
});

app.get('/api/auth/session', (req, res) => {
    if (!req.user) {
        return res.json({
            authenticated: false,
            user: null,
            csrfToken: req.csrfToken,
        });
    }

    return res.json({
        authenticated: true,
        user: toPublicUser(req.user),
        csrfToken: req.csrfToken,
    });
});

app.post('/api/vk/auth', async (req, res) => {
    const verification = vkLaunchParams.verify(req.body?.launchParams);
    if (!verification.ok) {
        console.log('[VK_AUTH] Verification failed:', verification.code, req.body?.launchParams);
        return res.status(getVkAuthErrorStatus(verification.code)).json({
            error: verification.code,
            message: 'Could not verify VK launch parameters.',
            authenticated: false,
            linkingRequired: false,
            csrfToken: req.csrfToken,
        });
    }

    console.log('[VK_AUTH] Verification OK, vk_user_id:', verification.params.vk_user_id);

    const vkUserId = String(verification.params.vk_user_id);
    const linkedUser = repositories.findUserByVkUserId(vkUserId);
    if (linkedUser) {
        createSessionForUser(res, linkedUser.id, req);
        req.user = linkedUser;
        return res.json({
            authenticated: true,
            linkingRequired: false,
            user: toPublicUser(linkedUser),
            csrfToken: req.csrfToken,
        });
    }

    if (req.user) {
        try {
            const updatedUser = linkVkToUserAccount(req.user.id, verification.params);
            req.user = updatedUser;
            return res.json({
                authenticated: true,
                linkingRequired: false,
                user: toPublicUser(updatedUser),
                csrfToken: req.csrfToken,
            });
        } catch (error) {
            logServerError('Failed to auto-link VK account', error, {
                code: 'VK_LINK_FAILED',
                userId: req.user?.id || null,
            });
            return res.status(error.statusCode || 500).json({
                error: 'VK_LINK_FAILED',
                message: 'Could not link VK account right now.',
                authenticated: true,
                linkingRequired: false,
                csrfToken: req.csrfToken,
            });
        }
    }

    const vkFirstName = String(verification.params.vk_first_name || '').trim();
    const vkLastName = String(verification.params.vk_last_name || '').trim();
    const vkDisplayName = [vkFirstName, vkLastName].filter(Boolean).join(' ') || `VK User ${vkUserId}`;
    const vkEmail = `vk_${vkUserId}@vk.miniapp`;
    const vkPassword = crypto.randomBytes(24).toString('base64').replace(/[/+]/g, '') + 'Aa1';

    try {
        const { salt, hash } = await passwordService.hashPassword(vkPassword);
        const now = new Date().toISOString();
        const newUser = {
            id: `usr_${crypto.randomUUID()}`,
            name: vkDisplayName.slice(0, 80),
            email: vkEmail,
            passwordSalt: salt,
            passwordHash: hash,
            createdAt: now,
            updatedAt: now,
            passwordChangedAt: now,
            vkUserId,
            vkLinkedAt: now,
            vkFirstSeenAt: now,
        };

        repositories.createUser(newUser);
        createSessionForUser(res, newUser.id, req);
        req.user = newUser;

        return res.json({
            authenticated: true,
            linkingRequired: false,
            user: toPublicUser(newUser),
            csrfToken: req.csrfToken,
        });
    } catch (error) {
        logServerError('Failed to auto-register VK user', error, {
            code: 'VK_AUTO_REGISTER_FAILED',
            vkUserId,
        });
        return res.status(error.statusCode || 500).json({
            error: 'VK_AUTO_REGISTER_FAILED',
            message: 'Could not complete VK sign-in.',
            authenticated: false,
            linkingRequired: false,
            csrfToken: req.csrfToken,
        });
    }
});

app.get('/api/auth/vk/oauth/url', (req, res) => {
    if (!vkOAuth.isConfigured) {
        return res.status(503).json({
            error: 'VK_OAUTH_NOT_CONFIGURED',
            message: 'VK OAuth is not configured.',
        });
    }

    const { state, codeChallenge } = vkOAuth.generateState();
    const url = vkOAuth.getAuthorizeUrl(state, codeChallenge);

    return res.json({ url });
});

app.get('/api/auth/vk/oauth/callback', async (req, res) => {
    const code = typeof req.query?.code === 'string' ? req.query.code.trim() : '';
    const state = typeof req.query?.state === 'string' ? req.query.state.trim() : '';
    const deviceId = typeof req.query?.device_id === 'string' ? req.query.device_id.trim() : '';
    const error = typeof req.query?.error === 'string' ? req.query.error.trim() : '';
    const errorDescription = typeof req.query?.error_description === 'string' ? req.query.error_description.trim() : '';
    const baseUrl = config.appBaseUrl || '/';

    if (error) {
        console.log('[VK] Auth error:', error, errorDescription);
        return res.redirect(`${baseUrl}?vkAuthError=${encodeURIComponent(errorDescription || error)}`);
    }

    if (!code || !state) {
        return res.redirect(`${baseUrl}?vkAuthError=${encodeURIComponent('Missing authorization code.')}`);
    }

    const codeVerifier = vkOAuth.consumeState(state);
    if (!codeVerifier) {
        return res.redirect(`${baseUrl}?vkAuthError=${encodeURIComponent('Invalid or expired request.')}`);
    }

    let tokenData;
    try {
        tokenData = await vkOAuth.exchangeCode(code, deviceId, codeVerifier);
    } catch (exchangeError) {
        logServerError('VK token exchange failed', exchangeError, { code: 'VK_TOKEN_EXCHANGE_FAILED' });
        return res.redirect(`${baseUrl}?vkAuthError=${encodeURIComponent('Could not complete VK authorization.')}`);
    }

    const accessToken = String(tokenData.access_token || '');
    const vkUserId = String(tokenData.user_id || '');

    if (!accessToken || !vkUserId) {
        return res.redirect(`${baseUrl}?vkAuthError=${encodeURIComponent('Could not complete VK authorization.')}`);
    }

    const vkEmail = String(tokenData.email || '').trim().toLowerCase();

    let userInfo;
    try {
        userInfo = await vkOAuth.getUserInfo(accessToken);
    } catch (infoError) {
        logServerError('VK user info failed', infoError, { code: 'VK_USER_INFO_FAILED' });
        return res.redirect(`${baseUrl}?vkAuthError=${encodeURIComponent('Could not get VK profile.')}`);
    }

    const vkProfile = userInfo?.user || {};
    const vkFirstName = String(vkProfile.first_name || '').trim();
    const vkLastName = String(vkProfile.last_name || '').trim();
    const email = vkEmail || String(vkProfile.email || '').trim().toLowerCase() || `vk_${vkUserId}@vk.miniapp`;
    const name = [vkFirstName, vkLastName].filter(Boolean).join(' ').slice(0, 80) || `VK User ${vkUserId}`;

    const existingByVk = repositories.findUserByVkUserId(vkUserId);
    if (existingByVk) {
        createSessionForUser(res, existingByVk.id, req);
        req.user = existingByVk;
        return res.redirect(baseUrl);
    }

    const existingByEmail = email.includes('@') && !email.endsWith('@vk.miniapp')
        ? repositories.findUserByEmail(email)
        : null;

    if (existingByEmail) {
        try {
            const now = new Date().toISOString();
            const updatedUser = repositories.linkVkUser({
                id: existingByEmail.id,
                vkUserId,
                vkLinkedAt: now,
                vkFirstSeenAt: now,
                updatedAt: now,
            });
            createSessionForUser(res, updatedUser.id, req);
            req.user = updatedUser;
            return res.redirect(baseUrl);
        } catch (linkError) {
            logServerError('Failed to link VK account', linkError, { code: 'VK_LINK_FAILED', userId: existingByEmail.id });
            return res.redirect(`${baseUrl}?vkAuthError=${encodeURIComponent('Could not link VK account.')}`);
        }
    }

    try {
        const { salt, hash } = await passwordService.hashPassword(
            crypto.randomBytes(24).toString('base64').replace(/[/+]/g, '') + 'Aa1',
        );
        const now = new Date().toISOString();
        const newUser = {
            id: `usr_${crypto.randomUUID()}`,
            name,
            email,
            passwordSalt: salt,
            passwordHash: hash,
            createdAt: now,
            updatedAt: now,
            passwordChangedAt: now,
            vkUserId,
            vkLinkedAt: now,
            vkFirstSeenAt: now,
        };

        repositories.createUser(newUser);
        createSessionForUser(res, newUser.id, req);
        req.user = newUser;
        return res.redirect(baseUrl);
    } catch (createError) {
        logServerError('Failed to create user via VK', createError, { code: 'VK_CREATE_USER_FAILED', vkUserId });
        return res.redirect(`${baseUrl}?vkAuthError=${encodeURIComponent('Could not create account.')}`);
    }
});

app.post('/api/auth/vk/complete', async (req, res) => {
    const accessToken = typeof req.body?.access_token === 'string' ? req.body.access_token.trim() : '';
    const vkUserId = typeof req.body?.user_id === 'string' ? req.body.user_id.trim() : '';
    const vkEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const displayName = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 80) : '';

    if (!accessToken || !vkUserId) {
        return res.status(400).json({
            error: 'VK_AUTH_INVALID',
            message: 'Missing access token or user ID.',
        });
    }

    const verification = await vkOAuth.verifyAccessToken(accessToken, vkUserId);
    if (!verification.ok) {
        console.log('[VK_COMPLETE] Verification failed:', verification.error);
        return res.status(401).json({
            error: 'VK_AUTH_FAILED',
            message: 'Could not verify VK identity.',
        });
    }

    const vkProfile = verification.user;
    const email = vkEmail || `vk_${vkUserId}@vk.miniapp`;
    const name = displayName || [vkProfile.firstName, vkProfile.lastName].filter(Boolean).join(' ') || `VK User ${vkUserId}`;

    const existingByVk = repositories.findUserByVkUserId(vkUserId);
    if (existingByVk) {
        createSessionForUser(res, existingByVk.id, req);
        req.user = existingByVk;
        return res.json({
            authenticated: true,
            user: toPublicUser(existingByVk),
            csrfToken: req.csrfToken,
        });
    }

    const existingByEmail = email.includes('@') && !email.endsWith('@vk.miniapp')
        ? repositories.findUserByEmail(email)
        : null;

    if (existingByEmail) {
        try {
            const now = new Date().toISOString();
            const updatedUser = repositories.linkVkUser({
                id: existingByEmail.id,
                vkUserId,
                vkLinkedAt: now,
                vkFirstSeenAt: now,
                updatedAt: now,
            });
            createSessionForUser(res, updatedUser.id, req);
            req.user = updatedUser;
            return res.json({
                authenticated: true,
                user: toPublicUser(updatedUser),
                csrfToken: req.csrfToken,
            });
        } catch (linkError) {
            logServerError('Failed to link VK account', linkError, {
                code: 'VK_LINK_FAILED',
                userId: existingByEmail.id,
            });
            return res.status(500).json({
                error: 'VK_LINK_FAILED',
                message: 'Could not link VK account.',
            });
        }
    }

    try {
        const { salt, hash } = await passwordService.hashPassword(
            crypto.randomBytes(24).toString('base64').replace(/[/+]/g, '') + 'Aa1',
        );
        const now = new Date().toISOString();
        const newUser = {
            id: `usr_${crypto.randomUUID()}`,
            name,
            email,
            passwordSalt: salt,
            passwordHash: hash,
            createdAt: now,
            updatedAt: now,
            passwordChangedAt: now,
            vkUserId,
            vkLinkedAt: now,
            vkFirstSeenAt: now,
        };

        repositories.createUser(newUser);
        createSessionForUser(res, newUser.id, req);
        req.user = newUser;

        return res.json({
            authenticated: true,
            user: toPublicUser(newUser),
            csrfToken: req.csrfToken,
        });
    } catch (createError) {
        logServerError('Failed to create user via VK', createError, {
            code: 'VK_CREATE_USER_FAILED',
            vkUserId,
        });
        return res.status(500).json({
            error: 'VK_CREATE_USER_FAILED',
            message: 'Could not create account.',
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    console.log('[LOGIN] Attempt:', { email: req.body?.email, ip: req.ip });
    const name = normalizeDisplayName(req.body?.name);
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!isValidDisplayName(name)) {
        return res.status(400).json({
            error: 'INVALID_NAME',
            message: 'Please provide a name between 2 and 80 characters.',
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            error: 'INVALID_EMAIL',
            message: 'Please provide a valid email.',
        });
    }

    if (!isValidPassword(password)) {
        return res.status(400).json({
            error: 'INVALID_PASSWORD',
            message: 'Password should be between 6 and 200 characters.',
        });
    }

    if (!hasStrongEnoughPassword(password)) {
        return res.status(400).json({
            error: 'PASSWORD_TOO_WEAK',
            message: 'Please choose a stronger password.',
        });
    }

    try {
        takeRateLimitSlot({
            scope: 'register',
            req,
            extraKey: email,
            limit: config.registerRateLimitMaxAttempts,
            windowMs: config.authRateLimitWindowMs,
        });

        if (repositories.findUserByEmail(email)) {
            return res.status(409).json({
                error: 'EMAIL_EXISTS',
                message: 'A user with this email already exists.',
            });
        }

        const { salt, hash } = await passwordService.hashPassword(password);
        const now = new Date().toISOString();
        const user = {
            id: `usr_${crypto.randomUUID()}`,
            name,
            email,
            passwordSalt: salt,
            passwordHash: hash,
            createdAt: now,
            updatedAt: now,
            passwordChangedAt: now,
        };

        repositories.createUser(user);
        createSessionForUser(res, user.id, req);

        return res.status(201).json({
            ok: true,
            user: toPublicUser(user),
            csrfToken: req.csrfToken,
        });
    } catch (error) {
        logServerError('Failed to register user', error, {
            code: 'REGISTER_FAILED',
        });
        return res.status(error.statusCode || 500).json({
            error: 'REGISTER_FAILED',
            message: 'Could not register user right now.',
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!isValidEmail(email) || typeof password !== 'string') {
        return res.status(400).json({
            error: 'INVALID_CREDENTIALS',
            message: 'Email and password are required.',
            csrfToken: req.csrfToken,
        });
    }

    try {
        takeRateLimitSlot({
            scope: 'login',
            req,
            extraKey: email,
            limit: config.loginRateLimitMaxAttempts,
            windowMs: config.authRateLimitWindowMs,
        });

        const user = repositories.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                error: 'AUTH_FAILED',
                message: 'Invalid email or password.',
                csrfToken: req.csrfToken,
            });
        }

        const verification = await passwordService.verifyPassword(password, user);
        if (!verification.ok) {
            return res.status(401).json({
                error: 'AUTH_FAILED',
                message: 'Invalid email or password.',
                csrfToken: req.csrfToken,
            });
        }

        if (verification.needsRehash) {
            const { salt, hash } = await passwordService.hashPassword(password);
            repositories.updateUserPassword({
                id: user.id,
                passwordSalt: salt,
                passwordHash: hash,
                updatedAt: new Date().toISOString(),
                passwordChangedAt: user.passwordChangedAt || user.createdAt,
            });
        }

        createSessionForUser(res, user.id, req);

        return res.json({
            ok: true,
            user: toPublicUser(user),
            csrfToken: req.csrfToken,
        });
    } catch (error) {
        logServerError('Failed to log in', error, {
            code: 'LOGIN_FAILED',
        });
        return res.status(error.statusCode || 500).json({
            error: 'LOGIN_FAILED',
            message: 'Could not log in right now.',
            csrfToken: req.csrfToken,
        });
    }
});

app.post('/api/auth/logout', (req, res) => {
    revokeCurrentSession(req);
    clearSessionCookie(res);
    clearCsrfCookie(res);
    res.json({ ok: true });
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const genericResponse = {
        ok: true,
        message: 'If an account with this email exists, recovery instructions have been sent.',
    };

    if (!isValidEmail(email)) {
        return res.json(genericResponse);
    }

    try {
        takeRateLimitSlot({
            scope: 'forgot-password',
            req,
            extraKey: email,
            limit: config.passwordResetRateLimitMaxAttempts,
            windowMs: config.authRateLimitWindowMs,
        });

        const user = repositories.findUserByEmail(email);
        if (!user) {
            return res.json(genericResponse);
        }

        const { rawToken, token } = createPasswordResetRecord(user.id);
        repositories.createPasswordResetToken(token);

        await mailer.sendPasswordResetEmail({
            email: user.email,
            name: user.name,
            resetUrl: getResetUrl(rawToken),
        });

        return res.json(genericResponse);
    } catch (error) {
        logServerError('Failed to start password reset flow', error, {
            code: 'PASSWORD_RESET_REQUEST_FAILED',
            userId: repositories.findUserByEmail(email)?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'PASSWORD_RESET_REQUEST_FAILED',
            message: 'Could not start password recovery right now.',
        });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    const password = req.body?.password;

    if (!token || !isValidPassword(password)) {
        return res.status(400).json({
            error: 'INVALID_PASSWORD_RESET',
            message: 'A valid token and password are required.',
        });
    }

    try {
        takeRateLimitSlot({
            scope: 'reset-password',
            req,
            extraKey: token.slice(0, 12),
            limit: config.passwordResetRateLimitMaxAttempts,
            windowMs: config.authRateLimitWindowMs,
        });

        const tokenRecord = repositories.findPasswordResetTokenByHash(hashToken(token));
        if (!tokenRecord || tokenRecord.usedAt || parseIsoDate(tokenRecord.expiresAt) <= Date.now()) {
            return res.status(400).json({
                error: 'PASSWORD_RESET_TOKEN_INVALID',
                message: 'The recovery link is invalid or expired.',
            });
        }

        const user = repositories.findUserById(tokenRecord.userId);
        if (!user) {
            return res.status(400).json({
                error: 'PASSWORD_RESET_TOKEN_INVALID',
                message: 'The recovery link is invalid or expired.',
            });
        }

        if (!hasStrongEnoughPassword(password)) {
            return res.status(400).json({
                error: 'PASSWORD_TOO_WEAK',
                message: 'Please choose a stronger password.',
            });
        }

        const { salt, hash } = await passwordService.hashPassword(password);
        const now = new Date().toISOString();
        repositories.updateUserPassword({
            id: user.id,
            passwordSalt: salt,
            passwordHash: hash,
            updatedAt: now,
            passwordChangedAt: now,
        });
        repositories.markPasswordResetTokenUsed(tokenRecord.id, now);
        repositories.revokeSessionsForUser(user.id, now);
        clearSessionCookie(res);
        clearCsrfCookie(res);

        return res.json({ ok: true });
    } catch (error) {
        logServerError('Failed to reset password', error, {
            code: 'PASSWORD_RESET_FAILED',
        });
        return res.status(error.statusCode || 500).json({
            error: 'PASSWORD_RESET_FAILED',
            message: 'Could not reset password right now.',
        });
    }
});

app.get('/api/account/profile', requireAuthenticatedUser, (req, res) => {
    res.json({
        user: toPublicUser(req.user),
    });
});

app.patch('/api/account/profile', requireAuthenticatedUser, (req, res) => {
    const nextName = normalizeDisplayName(req.body?.name);
    const nextEmail = normalizeEmail(req.body?.email);

    if (!isValidDisplayName(nextName)) {
        return res.status(400).json({
            error: 'INVALID_NAME',
            message: 'Please provide a name between 2 and 80 characters.',
        });
    }

    if (!isValidEmail(nextEmail)) {
        return res.status(400).json({
            error: 'INVALID_EMAIL',
            message: 'Please provide a valid email.',
        });
    }

    try {
        const existing = repositories.findUserByEmail(nextEmail);
        if (existing && existing.id !== req.user.id) {
            return res.status(409).json({
                error: 'EMAIL_EXISTS',
                message: 'A user with this email already exists.',
            });
        }

        const user = repositories.updateUserProfile({
            id: req.user.id,
            name: nextName,
            email: nextEmail,
            updatedAt: new Date().toISOString(),
        });

        req.user = user;
        return res.json({
            ok: true,
            user: toPublicUser(user),
        });
    } catch (error) {
        logServerError('Failed to update profile', error, {
            code: 'PROFILE_UPDATE_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'PROFILE_UPDATE_FAILED',
            message: 'Could not update the profile right now.',
        });
    }
});

app.post('/api/account/link-vk', requireAuthenticatedUser, (req, res) => {
    const verification = vkLaunchParams.verify(req.body?.launchParams);
    if (!verification.ok) {
        console.log('[VK_LINK] Verification failed:', verification.code, req.body?.launchParams);
        return res.status(getVkAuthErrorStatus(verification.code)).json({
            error: verification.code,
            message: 'Could not verify VK launch parameters.',
        });
    }

    const vkUserId = String(verification.params.vk_user_id);
    const existingUser = repositories.findUserByVkUserId(vkUserId);
    if (existingUser && existingUser.id !== req.user.id) {
        return res.status(409).json({
            error: 'VK_ALREADY_LINKED',
            message: 'This VK account is already linked to another user.',
        });
    }

    try {
        const user = linkVkToUserAccount(req.user.id, verification.params);
        req.user = user;
        return res.json({
            ok: true,
            user: toPublicUser(user),
            csrfToken: req.csrfToken,
        });
    } catch (error) {
        logServerError('Failed to link VK account', error, {
            code: 'VK_LINK_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'VK_LINK_FAILED',
            message: 'Could not link the VK account right now.',
        });
    }
});

app.post('/api/account/change-password', requireAuthenticatedUser, async (req, res) => {
    const currentPassword = req.body?.currentPassword;
    const nextPassword = req.body?.newPassword;

    if (typeof currentPassword !== 'string' || !isValidPassword(nextPassword)) {
        return res.status(400).json({
            error: 'INVALID_PASSWORD',
            message: 'Please provide the current password and a new password.',
        });
    }

    try {
        const verification = await passwordService.verifyPassword(currentPassword, req.user);
        if (!verification.ok) {
            return res.status(401).json({
                error: 'AUTH_FAILED',
                message: 'Current password is incorrect.',
            });
        }

        if (!hasStrongEnoughPassword(nextPassword)) {
            return res.status(400).json({
                error: 'PASSWORD_TOO_WEAK',
                message: 'Please choose a stronger password.',
            });
        }

        const { salt, hash } = await passwordService.hashPassword(nextPassword);
        const now = new Date().toISOString();
        repositories.updateUserPassword({
            id: req.user.id,
            passwordSalt: salt,
            passwordHash: hash,
            updatedAt: now,
            passwordChangedAt: now,
        });
        repositories.revokeSessionsForUser(req.user.id, now);
        clearSessionCookie(res);
        clearCsrfCookie(res);

        return res.json({
            ok: true,
            user: toPublicUser(user),
            csrfToken: req.csrfToken,
        });
    } catch (error) {
        logServerError('Failed to change password', error, {
            code: 'PASSWORD_CHANGE_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'PASSWORD_CHANGE_FAILED',
            message: 'Could not change password right now.',
        });
    }
});

function parseDonationAmount(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
        throw createPaymentError('Invalid donation amount.', 400, 'INVALID_DONATION_AMOUNT');
    }
    return value;
}

function isAllowedDonationAmount(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
        return false;
    }
    if (amount < config.donationMinAmount || amount > config.donationMaxAmount) {
        return false;
    }
    if (config.donationAllowedAmounts.length > 0 && !config.donationAllowedAmounts.includes(amount)) {
        return false;
    }
    return true;
}

function createDonationRecord(userId, amount, launchParams) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    return {
        id,
        userId,
        provider: 'yookassa',
        providerPaymentId: null,
        amountValue: amount,
        amountCurrency: config.donationCurrency,
        status: 'pending',
        type: 'one-time',
        returnUrl: `${config.appBaseUrl}/?donationId=${id}`,
        createdAt: now,
        updatedAt: now,
        confirmedAt: null,
    };
}

function getPaymentSummary(userId, donation) {
    const latestDonation = donation || repositories.findLatestSucceededDonationByUserId(userId) || null;
    return {
        support: {
            hasSupported: Boolean(latestDonation && latestDonation.status === 'succeeded'),
            lastDonationAt: latestDonation?.confirmedAt || null,
        },
        latestDonation: donation || null,
        checkout: {
            minAmount: config.donationMinAmount,
            maxAmount: config.donationMaxAmount,
            allowedAmounts: config.donationAllowedAmounts,
        },
    };
}

async function trySyncDonationStatusFromProvider(donation) {
    if (!donation || donation.status !== 'pending' || !donation.providerPaymentId) {
        return donation;
    }

    try {
        const remotePayment = await yookassa.getPayment(donation.providerPaymentId);
        if (!remotePayment?.id) {
            return donation;
        }

        const remoteStatus = typeof remotePayment.status === 'string' ? remotePayment.status : '';

        if (remoteStatus === 'succeeded' || remoteStatus === 'canceled') {
            const newStatus = remoteStatus === 'succeeded' ? 'succeeded' : 'canceled';
            repositories.updateDonationStatus({
                id: donation.id,
                status: newStatus,
                updatedAt: new Date().toISOString(),
                confirmedAt: newStatus === 'succeeded' ? new Date().toISOString() : null,
            });
            return repositories.findDonationById(donation.id);
        }

        return donation;
    } catch {
        return donation;
    }
}

function isYookassaWebhookSecretValid(req) {
    const key = typeof req.query?.key === 'string' ? req.query.key.trim() : '';
    return Boolean(key && config.yookassaWebhookSecret && key === config.yookassaWebhookSecret);
}

function buildWebhookRecord({ eventId, eventType, paymentId, donationId }) {
    return {
        id: eventId,
        provider: 'yookassa',
        eventType,
        paymentId: paymentId || null,
        donationId: donationId || null,
        createdAt: new Date().toISOString(),
    };
}

app.get('/api/payments/status', requireAuthenticatedUser, (req, res) => {
    const donationId = typeof req.query?.donationId === 'string' ? req.query.donationId.trim() : '';

    return Promise.resolve().then(async () => {
        let donation = null;
        if (donationId) {
            donation = repositories.findDonationById(donationId);
            if (!donation || donation.userId !== req.user.id) {
                return res.status(404).json({
                    error: 'DONATION_NOT_FOUND',
                    message: 'Donation was not found.',
                });
            }

            donation = await trySyncDonationStatusFromProvider(donation);
        } else {
            donation = await trySyncDonationStatusFromProvider(repositories.findLatestDonationByUserId(req.user.id));
        }

        return res.json(getPaymentSummary(req.user.id, donation));
    }).catch(error => {
        logServerError('Failed to read payment status', error, {
            code: 'PAYMENT_STATUS_FAILED',
            userId: req.user?.id || null,
            donationId,
        });
        return res.status(error.statusCode || 500).json({
            error: 'PAYMENT_STATUS_FAILED',
            message: 'Could not read payment status right now.',
        });
    });
});

app.post('/api/payments/create-donation-session', requireAuthenticatedUser, async (req, res) => {
    const amount = parseDonationAmount(req.body?.amount);
    const launchParams = req.body?.launchParams || null;
    if (!isAllowedDonationAmount(amount)) {
        return res.status(400).json({
            error: 'INVALID_DONATION_AMOUNT',
            message: 'Please choose a valid support amount.',
        });
    }

    if (!yookassa.isConfigured) {
        return res.status(503).json({
            error: 'PAYMENTS_NOT_CONFIGURED',
            message: 'Payments are not configured yet.',
        });
    }

    try {
        const donation = createDonationRecord(req.user.id, amount, launchParams);
        repositories.createDonation(donation);

        const payment = await yookassa.createPayment({
            amount,
            currency: config.donationCurrency,
            description: 'Поддержка проекта "Мои ложки"',
            returnUrl: donation.returnUrl,
            donationId: donation.id,
            userId: req.user.id,
        });

        const confirmationUrl = payment?.confirmation?.confirmation_url;
        if (!payment?.id || !confirmationUrl) {
            repositories.updateDonationStatus({
                id: donation.id,
                status: 'failed',
                updatedAt: new Date().toISOString(),
            });
            throw createPaymentError('YooKassa did not return a confirmation URL.', 502, 'PAYMENT_PROVIDER_INVALID_RESPONSE');
        }

        repositories.attachProviderPaymentToDonation({
            id: donation.id,
            providerPaymentId: payment.id,
            status: payment.status || 'pending',
            updatedAt: new Date().toISOString(),
        });

        return res.status(201).json({
            donationId: donation.id,
            confirmationUrl,
        });
    } catch (error) {
        logServerError('Failed to create donation session', error, {
            code: 'DONATION_SESSION_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: error.code || 'DONATION_SESSION_FAILED',
            message: error.message || 'Could not start the payment right now.',
        });
    }
});

app.post('/api/payments/yookassa/webhook', async (req, res) => {
    const remoteIp = getRemoteIp(req);
    if (!isYookassaWebhookSecretValid(req)) {
        return res.status(403).json({
            error: 'WEBHOOK_FORBIDDEN',
            message: 'Webhook secret is invalid.',
        });
    }

    if (!yookassa.isAllowedWebhookIp(remoteIp)) {
        return res.status(403).json({
            error: 'WEBHOOK_FORBIDDEN',
            message: 'Webhook IP is not allowed.',
        });
    }

    const eventType = typeof req.body?.event === 'string' ? req.body.event.trim() : '';
    const paymentId = typeof req.body?.object?.id === 'string' ? req.body.object.id.trim() : '';
    const eventId = paymentId ? `yookassa:${eventType}:${paymentId}` : '';

    if (!eventType || !eventId || !paymentId) {
        return res.status(400).json({
            error: 'INVALID_WEBHOOK',
            message: 'Webhook payload is incomplete.',
        });
    }

    try {
        const alreadyProcessed = repositories.findProcessedWebhookById(eventId);
        if (alreadyProcessed) {
            return res.json({ ok: true, duplicate: true });
        }

        const donation = repositories.findDonationByProviderPaymentId(paymentId);
        if (!donation) {
            repositories.markWebhookProcessed({
                webhook: buildWebhookRecord({
                    eventId,
                    eventType,
                    paymentId,
                }),
            });
            return res.json({ ok: true, skipped: true });
        }

        const remotePayment = await yookassa.getPayment(paymentId);
        if (!remotePayment?.id || remotePayment.id !== paymentId) {
            throw createPaymentError('Payment verification failed.', 400, 'PAYMENT_VERIFICATION_FAILED');
        }

        const remoteAmount = Number(remotePayment.amount?.value);
        if (!Number.isFinite(remoteAmount) || Math.round(remoteAmount) !== Math.round(donation.amountValue)) {
            throw createPaymentError('Payment amount does not match.', 400, 'PAYMENT_AMOUNT_MISMATCH');
        }

        const webhook = buildWebhookRecord({
            eventId,
            eventType,
            paymentId,
            donationId: donation.id,
        });

        const remoteStatus = typeof remotePayment.status === 'string' ? remotePayment.status : 'pending';
        repositories.markDonationWebhookProcessed({
            donationId: donation.id,
            status: remoteStatus === 'succeeded'
                ? 'succeeded'
                : remoteStatus === 'canceled'
                    ? 'canceled'
                    : 'pending',
            updatedAt: new Date().toISOString(),
            confirmedAt: remoteStatus === 'succeeded' ? new Date().toISOString() : null,
            webhook,
        });

        return res.json({ ok: true });
    } catch (error) {
        logServerError('Failed to process YooKassa webhook', error, {
            code: 'WEBHOOK_PROCESSING_FAILED',
            donationId: repositories.findDonationByProviderPaymentId(paymentId)?.id || null,
            paymentId,
            eventType,
        });
        return res.status(error.statusCode || 500).json({
            error: error.code || 'WEBHOOK_PROCESSING_FAILED',
            message: error.message || 'Could not process webhook.',
        });
    }
});

app.get('/api/state/runtime', (req, res) => {
    try {
        const runtimeState = readRuntimeStateForRequest(req) || {};
        return res.json({ state: runtimeState });
    } catch (error) {
        logServerError('Failed to read runtime state from SQLite', error, {
            code: 'RUNTIME_STATE_READ_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'RUNTIME_STATE_READ_FAILED',
            message: 'Could not read saved runtime state.',
        });
    }
});

app.post('/api/state/runtime', (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({
            error: 'UNSUPPORTED_CONTENT_TYPE',
            message: 'JSON content expected.',
        });
    }

    try {
        const runtimeState = validateRuntimeState(req.body || {});
        saveRuntimeStateForRequest(req, runtimeState);
        return res.json({ ok: true });
    } catch (error) {
        logServerError('Failed to write runtime state to SQLite', error, {
            code: 'RUNTIME_STATE_WRITE_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'RUNTIME_STATE_WRITE_FAILED',
            message: 'Could not save runtime state.',
        });
    }
});

app.get('/api/private-state', requireAuthenticatedUser, (req, res) => {
    try {
        const privateState = readPrivateStateForRequest(req) || {};
        return res.json({ state: privateState });
    } catch (error) {
        logServerError('Failed to read private state from SQLite', error, {
            code: 'PRIVATE_STATE_READ_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'PRIVATE_STATE_READ_FAILED',
            message: 'Could not read saved private state.',
        });
    }
});

app.post('/api/private-state', requireAuthenticatedUser, (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({
            error: 'UNSUPPORTED_CONTENT_TYPE',
            message: 'JSON content expected.',
        });
    }

    try {
        const privateState = validatePrivateState(req.body || {});
        savePrivateStateForRequest(req, privateState);
        return res.json({ ok: true });
    } catch (error) {
        logServerError('Failed to write private state to SQLite', error, {
            code: 'PRIVATE_STATE_WRITE_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'PRIVATE_STATE_WRITE_FAILED',
            message: 'Could not save private state.',
        });
    }
});

app.get('/api/state', (req, res) => {
    try {
        const state = readCombinedStateForRequest(req);
        return res.json({ state });
    } catch (error) {
        logServerError('Failed to read state from SQLite', error, {
            code: 'STATE_READ_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'STATE_READ_FAILED',
            message: 'Could not read saved state.',
        });
    }
});

app.post('/api/state', (req, res) => {
    if (!req.is('application/json')) {
        return res.status(415).json({
            error: 'UNSUPPORTED_CONTENT_TYPE',
            message: 'JSON content expected.',
        });
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
            error: 'INVALID_STATE',
            message: 'State should be a JSON object.',
        });
    }

    try {
        const { runtimeState, privateState } = splitAppState(req.body);
        saveRuntimeStateForRequest(req, validateRuntimeState(runtimeState));
        if (req.user) {
            savePrivateStateForRequest(req, validatePrivateState(privateState));
        }
        return res.json({ ok: true });
    } catch (error) {
        logServerError('Failed to write split state to SQLite', error, {
            code: 'STATE_WRITE_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(error.statusCode || 500).json({
            error: 'STATE_WRITE_FAILED',
            message: 'Could not save state.',
        });
    }
});

app.get('/', (_req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.use((error, req, res, _next) => {
    logServerError('Unhandled server error', error, {
        code: 'INTERNAL_SERVER_ERROR',
        userId: req.user?.id || null,
    });

    if (res.headersSent) {
        return;
    }

    if (req.sessionRecord?.id && !req.user) {
        clearSessionCookie(res);
    }

    res.status(error?.statusCode || 500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: config.isDevelopment
            ? (error?.message || 'Unexpected server error.')
            : 'Something went wrong on the server.',
    });
});

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});
