const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonFile(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
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

function resolveDatabasePath(rootDir, configuredPath) {
    if (!configuredPath) {
        return path.join(rootDir, 'data', 'app.db');
    }

    if (path.isAbsolute(configuredPath)) {
        return configuredPath;
    }

    return path.join(rootDir, configuredPath);
}

function initSchema(db) {
    db.pragma('foreign_keys = ON');

    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_states (
            user_id TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS app_state (
            key TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    `);
}

function migrateLegacyJsonFiles(db, paths) {
    const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    if (userCount === 0) {
        const legacyUsers = readJsonFile(paths.userFile);
        if (Array.isArray(legacyUsers)) {
            const insertUser = db.prepare(`
                INSERT OR IGNORE INTO users (id, email, password_salt, password_hash, created_at)
                VALUES (@id, @email, @password_salt, @password_hash, @created_at)
            `);

            const transaction = db.transaction(users => {
                users.forEach(user => {
                    if (!user || typeof user !== 'object') {
                        return;
                    }

                    insertUser.run({
                        id: user.id,
                        email: user.email,
                        password_salt: user.passwordSalt,
                        password_hash: user.passwordHash,
                        created_at: user.createdAt,
                    });
                });
            });

            transaction(legacyUsers);
        }
    }

    const guestStateExists = db.prepare('SELECT 1 FROM app_state WHERE key = ?').get('guest');
    if (!guestStateExists) {
        const legacyState = readJsonFile(paths.stateFile);
        if (legacyState && typeof legacyState === 'object' && !Array.isArray(legacyState)) {
            db.prepare(`
                INSERT INTO app_state (key, state_json, updated_at)
                VALUES (?, ?, ?)
            `).run('guest', JSON.stringify(legacyState), new Date().toISOString());
        }
    }

    if (!fs.existsSync(paths.userStateDir)) {
        return;
    }

    const legacyStateFiles = fs.readdirSync(paths.userStateDir, { withFileTypes: true });
    const insertUserState = db.prepare(`
        INSERT OR IGNORE INTO user_states (user_id, state_json, updated_at)
        VALUES (?, ?, ?)
    `);
    const hasUser = db.prepare('SELECT 1 FROM users WHERE id = ?');
    const hasUserState = db.prepare('SELECT 1 FROM user_states WHERE user_id = ?');

    legacyStateFiles.forEach(entry => {
        if (!entry.isFile() || !entry.name.endsWith('.json')) {
            return;
        }

        const userId = entry.name.replace(/\.json$/i, '');
        if (!userId || !hasUser.get(userId) || hasUserState.get(userId)) {
            return;
        }

        const filePath = path.join(paths.userStateDir, entry.name);
        const legacyUserState = readJsonFile(filePath);
        if (!legacyUserState || typeof legacyUserState !== 'object' || Array.isArray(legacyUserState)) {
            return;
        }

        insertUserState.run(userId, JSON.stringify(legacyUserState), new Date().toISOString());
    });
}

function createDatabase(options) {
    const databasePath = resolveDatabasePath(options.rootDir, options.databasePath);
    ensureDir(path.dirname(databasePath));

    const db = new Database(databasePath);
    initSchema(db);
    migrateLegacyJsonFiles(db, options.legacyPaths);

    return {
        db,
        databasePath,
    };
}

module.exports = {
    createDatabase,
};
