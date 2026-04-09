const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { config, getSafeRuntimeSummary } = require('./server/config');
const { createDatabase } = require('./server/db');
const { createRepositories } = require('./server/repositories');
const { createMailer } = require('./server/mailer');

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

app.set('trust proxy', config.trustProxy);

function logServerError(label, error) {
    if (config.isDevelopment) {
        console.error(label, error);
        return;
    }

    console.error(label, {
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

function getFallbackNameFromEmail(email) {
    const normalized = normalizeEmail(email);
    const separatorIndex = normalized.indexOf('@');
    if (separatorIndex <= 0) {
        return 'Пользователь';
    }

    return normalized.slice(0, separatorIndex);
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

function getResetUrl(rawToken) {
    const baseUrl = config.appBaseUrl || `http://localhost:${PORT}`;
    return new URL(`/?resetToken=${encodeURIComponent(rawToken)}`, baseUrl).toString();
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

function createSessionForUser(res, userId, req) {
    const session = createSessionRecord(userId, req);
    repositories.createSession(session);
    setSessionCookie(res, session.id);
    return session;
}

function revokeCurrentSession(req) {
    if (!req.sessionRecord?.id) {
        return;
    }

    repositories.revokeSession(req.sessionRecord.id);
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
        logServerError('Failed to register user', error);
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

        revokeCurrentSession(req);
        createSessionForUser(res, user.id, req);

        return res.json({
            ok: true,
            user: toPublicUser(user),
        });
    } catch (error) {
        logServerError('Failed to log in', error);
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
        logServerError('Failed to start password reset flow', error);
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
        logServerError('Failed to reset password', error);
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
        logServerError('Failed to update profile', error);
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
        logServerError('Failed to change password', error);
        return res.status(error.statusCode || 500).json({
            error: 'PASSWORD_CHANGE_FAILED',
            message: 'Could not change password right now.',
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
        logServerError('Failed to read state from SQLite', error);
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
        logServerError('Failed to write state to SQLite', error);
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
    logServerError('Unhandled server error', error);

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
});
