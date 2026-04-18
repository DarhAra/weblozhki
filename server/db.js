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

function hasColumn(db, tableName, columnName) {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.some(column => column.name === columnName);
}

function ensureUserColumns(db) {
    const userColumns = [
        ['name', "TEXT NOT NULL DEFAULT ''"],
        ['updated_at', "TEXT NOT NULL DEFAULT ''"],
        ['password_changed_at', "TEXT NOT NULL DEFAULT ''"],
    ];

    userColumns.forEach(([columnName, definition]) => {
        if (!hasColumn(db, 'users', columnName)) {
            db.exec(`ALTER TABLE users ADD COLUMN ${columnName} ${definition}`);
        }
    });

    db.prepare(`
        UPDATE users
        SET
            name = CASE
                WHEN trim(COALESCE(name, '')) = '' THEN substr(email, 1, instr(email, '@') - 1)
                ELSE name
            END,
            updated_at = CASE
                WHEN trim(COALESCE(updated_at, '')) = '' THEN created_at
                ELSE updated_at
            END,
            password_changed_at = CASE
                WHEN trim(COALESCE(password_changed_at, '')) = '' THEN created_at
                ELSE password_changed_at
            END
    `).run();
}

function initSchema(db) {
    db.pragma('foreign_keys = ON');

    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            name TEXT NOT NULL DEFAULT '',
            updated_at TEXT NOT NULL DEFAULT '',
            password_changed_at TEXT NOT NULL DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS user_states (
            user_id TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_runtime_state (
            user_id TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_private_state (
            user_id TEXT PRIMARY KEY,
            encrypted_state TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS app_state (
            key TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS app_runtime_state (
            key TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_seen_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            revoked_at TEXT,
            user_agent TEXT NOT NULL DEFAULT '',
            ip_hash TEXT NOT NULL DEFAULT '',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at TEXT NOT NULL,
            used_at TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS donations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            provider TEXT NOT NULL,
            provider_payment_id TEXT UNIQUE,
            amount_value REAL NOT NULL,
            amount_currency TEXT NOT NULL,
            status TEXT NOT NULL,
            type TEXT NOT NULL,
            return_url TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            confirmed_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS processed_webhooks (
            id TEXT PRIMARY KEY,
            provider TEXT NOT NULL,
            event_type TEXT NOT NULL,
            payment_id TEXT,
            donation_id TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_runtime_state_updated_at ON user_runtime_state(updated_at);
        CREATE INDEX IF NOT EXISTS idx_user_private_state_updated_at ON user_private_state(updated_at);
        CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
        CREATE INDEX IF NOT EXISTS idx_donations_provider_payment_id ON donations(provider_payment_id);
        CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
        CREATE INDEX IF NOT EXISTS idx_processed_webhooks_payment_id ON processed_webhooks(payment_id);
    `);

    ensureUserColumns(db);
}

function migrateLegacyJsonFiles(db, paths) {
    const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    if (userCount === 0) {
        const legacyUsers = readJsonFile(paths.userFile);
        if (Array.isArray(legacyUsers)) {
            const insertUser = db.prepare(`
                INSERT OR IGNORE INTO users (
                    id,
                    email,
                    password_salt,
                    password_hash,
                    created_at,
                    name,
                    updated_at,
                    password_changed_at
                )
                VALUES (
                    @id,
                    @email,
                    @password_salt,
                    @password_hash,
                    @created_at,
                    @name,
                    @updated_at,
                    @password_changed_at
                )
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
                        name: typeof user.name === 'string' ? user.name : '',
                        updated_at: user.updatedAt || user.createdAt,
                        password_changed_at: user.passwordChangedAt || user.createdAt,
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
