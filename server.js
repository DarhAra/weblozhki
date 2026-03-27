const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { config, getSafeRuntimeSummary } = require('./server/config');
const { createDatabase } = require('./server/db');
const { createRepositories } = require('./server/repositories');

const app = express();
const PORT = config.port;
const ROOT_DIR = config.rootDir;
const sessions = new Map();
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

function isValidEmail(email) {
    return typeof email === 'string' && email.includes('@') && email.length <= 320;
}

function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 6 && password.length <= 200;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
}

function toPublicUser(user) {
    return {
        id: user.id,
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

function createSession(userId) {
    const sessionId = crypto.randomBytes(24).toString('hex');
    sessions.set(sessionId, {
        userId,
        expiresAt: Date.now() + config.sessionTtlMs,
    });
    return sessionId;
}

function getSession(sessionId) {
    if (!sessionId) {
        return null;
    }

    const session = sessions.get(sessionId);
    if (!session) {
        return null;
    }

    if (session.expiresAt <= Date.now()) {
        sessions.delete(sessionId);
        return null;
    }

    return session;
}

function deleteSession(sessionId) {
    if (!sessionId) {
        return;
    }
    sessions.delete(sessionId);
}

function attachUser(req, _res, next) {
    try {
        const cookies = parseCookies(req.headers.cookie || '');
        const sessionId = cookies[config.sessionCookieName];
        const session = getSession(sessionId);
        if (!session) {
            req.user = null;
            req.sessionId = null;
            return next();
        }

        const user = repositories.findUserById(session.userId);
        if (!user) {
            deleteSession(sessionId);
            req.user = null;
            req.sessionId = null;
            return next();
        }

        req.user = user;
        req.sessionId = sessionId;
        return next();
    } catch (error) {
        return next(error);
    }
}

app.use(express.json({ limit: '2mb' }));
app.use(attachUser);
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
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

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
        const user = {
            id: `usr_${crypto.randomUUID()}`,
            email,
            passwordSalt: salt,
            passwordHash: hash,
            createdAt: new Date().toISOString(),
        };

        repositories.createUser(user);

        const sessionId = createSession(user.id);
        res.setHeader('Set-Cookie', buildSessionCookie(sessionId));
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

        if (req.sessionId) {
            deleteSession(req.sessionId);
        }

        const sessionId = createSession(user.id);
        res.setHeader('Set-Cookie', buildSessionCookie(sessionId));
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
    deleteSession(req.sessionId);
    res.setHeader('Set-Cookie', buildClearSessionCookie());
    res.json({ ok: true });
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

app.use((error, _req, res, _next) => {
    logServerError('Unhandled server error', error);

    if (res.headersSent) {
        return;
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
});
