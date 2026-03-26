const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const USER_FILE = path.join(DATA_DIR, 'users.json');
const USER_STATE_DIR = path.join(DATA_DIR, 'states');
const SESSION_COOKIE = 'rtodo_sid';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const sessions = new Map();

async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function readJsonFile(filePath) {
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }

        if (error.name === 'SyntaxError') {
            const parseError = new Error(`Invalid JSON in ${filePath}`);
            parseError.statusCode = 500;
            throw parseError;
        }

        throw error;
    }
}

async function writeJsonFileAtomic(filePath, value) {
    await ensureDir(path.dirname(filePath));
    const tempFile = `${filePath}.tmp`;
    const payload = `${JSON.stringify(value, null, 2)}\n`;
    await fs.writeFile(tempFile, payload, 'utf8');
    await fs.rename(tempFile, filePath);
}

function getUserStateFilePath(userId) {
    return path.join(USER_STATE_DIR, `${userId}.json`);
}

async function readUsersFile() {
    const users = await readJsonFile(USER_FILE);
    if (!users) {
        return [];
    }

    if (!Array.isArray(users)) {
        const error = new Error('users.json must contain an array');
        error.statusCode = 500;
        throw error;
    }

    return users;
}

async function writeUsersFile(users) {
    if (!Array.isArray(users)) {
        throw new Error('Users payload must be an array');
    }
    await writeJsonFileAtomic(USER_FILE, users);
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

function buildSessionCookie(sessionId, maxAgeMs = SESSION_TTL_MS) {
    const parts = [
        `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    ];

    if (process.env.NODE_ENV === 'production') {
        parts.push('Secure');
    }

    return parts.join('; ');
}

function buildClearSessionCookie() {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function createSession(userId) {
    const sessionId = crypto.randomBytes(24).toString('hex');
    sessions.set(sessionId, {
        userId,
        expiresAt: Date.now() + SESSION_TTL_MS,
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

async function attachUser(req, _res, next) {
    try {
        const cookies = parseCookies(req.headers.cookie || '');
        const sessionId = cookies[SESSION_COOKIE];
        const session = getSession(sessionId);
        if (!session) {
            req.user = null;
            req.sessionId = null;
            return next();
        }

        const users = await readUsersFile();
        const user = users.find(item => item.id === session.userId);
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

app.post('/api/auth/register', async (req, res) => {
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
        const users = await readUsersFile();
        if (users.some(user => user.email === email)) {
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

        users.push(user);
        await writeUsersFile(users);

        const sessionId = createSession(user.id);
        res.setHeader('Set-Cookie', buildSessionCookie(sessionId));
        return res.status(201).json({
            ok: true,
            user: toPublicUser(user),
        });
    } catch (error) {
        console.error('Failed to register user', error);
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
        });
    }

    try {
        const users = await readUsersFile();
        const user = users.find(item => item.email === email);
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
        console.error('Failed to log in', error);
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

app.get('/api/state', async (req, res) => {
    try {
        let state;
        if (req.user) {
            state = await readJsonFile(getUserStateFilePath(req.user.id));
        } else {
            state = await readJsonFile(STATE_FILE);
        }
        return res.json({ state });
    } catch (error) {
        console.error('Failed to read state file', error);
        return res.status(error.statusCode || 500).json({
            error: 'STATE_READ_FAILED',
            message: 'Could not read saved state.',
        });
    }
});

app.post('/api/state', async (req, res) => {
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
            await writeJsonFileAtomic(getUserStateFilePath(req.user.id), req.body);
        } else {
            await writeJsonFileAtomic(STATE_FILE, req.body);
        }
        return res.json({ ok: true });
    } catch (error) {
        console.error('Failed to write state file', error);
        return res.status(500).json({
            error: 'STATE_WRITE_FAILED',
            message: 'Could not save state.',
        });
    }
});

app.get('/', (_req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});
