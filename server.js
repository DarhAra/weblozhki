const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { config, getSafeRuntimeSummary } = require('./server/config');
const { createDatabase } = require('./server/db');
const { createRepositories } = require('./server/repositories');
const { createMailer } = require('./server/mailer');
const { createPaymentError, createYookassaClient } = require('./server/yookassa');

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
const repositories = createRepositories(db);
const mailer = createMailer(config);
const yookassa = createYookassaClient(config);

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

function isValidDisplayName(name) {
    return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 80;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
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

function setSessionCookie(res, sessionId, maxAgeMs = config.sessionTtlMs) {
    res.setHeader('Set-Cookie', buildSessionCookie(sessionId, maxAgeMs));
}

function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', buildClearSessionCookie());
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
    setSessionCookie(res, session.id);
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

function getAllowedDonationAmounts() {
    if (Array.isArray(config.donationAllowedAmounts) && config.donationAllowedAmounts.length > 0) {
        return [...new Set(config.donationAllowedAmounts)]
            .filter(value => Number.isFinite(value) && value >= config.donationMinAmount && value <= config.donationMaxAmount)
            .sort((left, right) => left - right);
    }

    return [149, 299, 499].filter(value => value >= config.donationMinAmount && value <= config.donationMaxAmount);
}

function parseDonationAmount(rawAmount) {
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount)) {
        return null;
    }

    return Math.round(amount);
}

function isAllowedDonationAmount(amount) {
    if (!Number.isFinite(amount) || amount < config.donationMinAmount || amount > config.donationMaxAmount) {
        return false;
    }

    const allowedAmounts = getAllowedDonationAmounts();
    if (allowedAmounts.length === 0) {
        return true;
    }

    return allowedAmounts.includes(amount);
}

function ensureSecurePublicBaseUrl() {
    const baseUrl = config.appBaseUrl;
    if (!baseUrl) {
        throw createPaymentError('APP_BASE_URL is required for payments.', 500, 'PAYMENT_PUBLIC_URL_MISSING');
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(baseUrl);
    } catch {
        throw createPaymentError('APP_BASE_URL is invalid.', 500, 'PAYMENT_PUBLIC_URL_INVALID');
    }

    if (config.isProduction && parsedUrl.protocol !== 'https:') {
        throw createPaymentError('Payments require HTTPS in production.', 500, 'PAYMENT_PUBLIC_URL_INSECURE');
    }

    return parsedUrl;
}

function buildDonationReturnUrl(donationId) {
    const baseUrl = ensureSecurePublicBaseUrl();
    baseUrl.pathname = '/';
    baseUrl.searchParams.set('paymentReturn', '1');
    baseUrl.searchParams.set('donationId', donationId);
    return baseUrl.toString();
}

function getDonationCheckoutConfig() {
    return {
        currency: config.donationCurrency,
        allowedAmounts: getAllowedDonationAmounts(),
        minAmount: config.donationMinAmount,
        maxAmount: config.donationMaxAmount,
    };
}

function getPaymentSummary(userId, donation = null) {
    const latestDonation = donation || repositories.findLatestDonationByUserId(userId);
    const latestSucceededDonation = repositories.findLatestSucceededDonationByUserId(userId);

    return {
        support: {
            hasSupported: Boolean(latestSucceededDonation),
            lastDonationAt: latestSucceededDonation?.confirmedAt || latestSucceededDonation?.createdAt || null,
            lastDonationAmount: latestSucceededDonation?.amountValue || null,
            lastDonationCurrency: latestSucceededDonation?.amountCurrency || config.donationCurrency,
            lastDonationStatus: latestDonation?.status || latestSucceededDonation?.status || null,
        },
        latestDonation: toPublicDonation(latestDonation),
        checkout: getDonationCheckoutConfig(),
    };
}

function createDonationRecord(userId, amountValue) {
    const now = new Date().toISOString();
    const donationId = `don_${crypto.randomUUID()}`;
    return {
        id: donationId,
        userId,
        provider: 'yookassa',
        providerPaymentId: null,
        amountValue,
        amountCurrency: config.donationCurrency,
        status: 'pending',
        type: 'one_time',
        returnUrl: buildDonationReturnUrl(donationId),
        createdAt: now,
        updatedAt: now,
        confirmedAt: null,
    };
}

function getYookassaWebhookSecretFromRequest(req) {
    if (typeof req.query?.key !== 'string') {
        return '';
    }

    return req.query.key.trim();
}

function isYookassaWebhookSecretValid(req) {
    if (!config.yookassaWebhookSecret) {
        return true;
    }

    return getYookassaWebhookSecretFromRequest(req) === config.yookassaWebhookSecret;
}

function getRemoteIp(req) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
        return forwardedFor.split(',')[0].trim();
    }

    return req.ip || req.socket?.remoteAddress || '';
}

function buildWebhookRecord({ eventId, eventType, paymentId, donationId = null }) {
    return {
        id: eventId,
        provider: 'yookassa',
        eventType,
        paymentId,
        donationId,
        createdAt: new Date().toISOString(),
    };
}

app.use(express.json({ limit: '2mb' }));
app.use((req, _res, next) => {
    repositories.pruneExpiredSessions();
    repositories.prunePasswordResetTokens();
    next();
});
app.use((req, _res, next) => {
    try {
        const cookies = parseCookies(req.headers.cookie || '');
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
app.use(wrapResponseWithSessionRefresh);
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
        });
    }

    return res.json({
        authenticated: true,
        user: toPublicUser(req.user),
    });
});

app.post('/api/auth/register', (req, res) => {
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

    try {
        if (repositories.findUserByEmail(email)) {
            return res.status(409).json({
                error: 'EMAIL_EXISTS',
                message: 'A user with this email already exists.',
            });
        }

        const { salt, hash } = hashPassword(password);
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

app.post('/api/auth/login', (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!isValidEmail(email) || typeof password !== 'string') {
        return res.status(400).json({
            error: 'INVALID_CREDENTIALS',
            message: 'Email and password are required.',
        });
    }

    try {
        const user = repositories.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                error: 'AUTH_FAILED',
                message: 'Invalid email or password.',
            });
        }

        const { hash } = hashPassword(password, user.passwordSalt);
        if (hash !== user.passwordHash) {
            return res.status(401).json({
                error: 'AUTH_FAILED',
                message: 'Invalid email or password.',
            });
        }

        createSessionForUser(res, user.id, req);

        return res.json({
            ok: true,
            user: toPublicUser(user),
        });
    } catch (error) {
        logServerError('Failed to log in', error, {
            code: 'LOGIN_FAILED',
        });
        return res.status(error.statusCode || 500).json({
            error: 'LOGIN_FAILED',
            message: 'Could not log in right now.',
        });
    }
});

app.post('/api/auth/logout', (req, res) => {
    revokeCurrentSession(req);
    clearSessionCookie(res);
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

app.post('/api/auth/reset-password', (req, res) => {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    const password = req.body?.password;

    if (!token || !isValidPassword(password)) {
        return res.status(400).json({
            error: 'INVALID_PASSWORD_RESET',
            message: 'A valid token and password are required.',
        });
    }

    try {
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

        const { salt, hash } = hashPassword(password);
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

app.post('/api/account/change-password', requireAuthenticatedUser, (req, res) => {
    const currentPassword = req.body?.currentPassword;
    const nextPassword = req.body?.newPassword;

    if (typeof currentPassword !== 'string' || !isValidPassword(nextPassword)) {
        return res.status(400).json({
            error: 'INVALID_PASSWORD',
            message: 'Please provide the current password and a new password.',
        });
    }

    try {
        const { hash: currentHash } = hashPassword(currentPassword, req.user.passwordSalt);
        if (currentHash !== req.user.passwordHash) {
            return res.status(401).json({
                error: 'AUTH_FAILED',
                message: 'Current password is incorrect.',
            });
        }

        const { salt, hash } = hashPassword(nextPassword);
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

        return res.json({
            ok: true,
            requireLogin: true,
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

app.get('/api/payments/status', requireAuthenticatedUser, (req, res) => {
    const donationId = typeof req.query?.donationId === 'string' ? req.query.donationId.trim() : '';

    try {
        let donation = null;
        if (donationId) {
            donation = repositories.findDonationById(donationId);
            if (!donation || donation.userId !== req.user.id) {
                return res.status(404).json({
                    error: 'DONATION_NOT_FOUND',
                    message: 'Donation was not found.',
                });
            }
        }

        return res.json(getPaymentSummary(req.user.id, donation));
    } catch (error) {
        logServerError('Failed to read payment status', error, {
            code: 'PAYMENT_STATUS_FAILED',
            userId: req.user?.id || null,
            donationId,
        });
        return res.status(error.statusCode || 500).json({
            error: 'PAYMENT_STATUS_FAILED',
            message: 'Could not read payment status right now.',
        });
    }
});

app.post('/api/payments/create-donation-session', requireAuthenticatedUser, async (req, res) => {
    const amount = parseDonationAmount(req.body?.amount);
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
        const donation = createDonationRecord(req.user.id, amount);
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

app.get('/api/state', (req, res) => {
    try {
        const state = req.user
            ? repositories.getUserState(req.user.id)
            : repositories.getGuestState();
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
        if (req.user) {
            repositories.saveUserState(req.user.id, req.body);
        } else {
            repositories.saveGuestState(req.body);
        }
        return res.json({ ok: true });
    } catch (error) {
        logServerError('Failed to write state to SQLite', error, {
            code: 'STATE_WRITE_FAILED',
            userId: req.user?.id || null,
        });
        return res.status(500).json({
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
    const summary = getSafeRuntimeSummary();
    console.log(`Server started: http://localhost:${PORT}`);
    console.log(`SQLite ready: ${databasePath}`);
    console.log(`Mode: ${summary.mode}`);
    console.log(`Trust proxy: ${summary.trustProxy ? 'enabled' : 'disabled'}`);
    console.log(`Cookie: ${summary.sessionCookieName}, SameSite=${summary.sessionCookieSameSite}, Secure=${summary.sessionCookieSecure}`);
    console.log(`Session TTL days: ${summary.sessionTtlDays}`);
    console.log(`SMTP configured: ${summary.smtpConfigured ? 'yes' : 'no'}`);
    console.log(`YooKassa configured: ${summary.yookassaConfigured ? 'yes' : 'no'}`);
});
