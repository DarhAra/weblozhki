function parseStoredJson(raw, label) {
    try {
        return JSON.parse(raw);
    } catch (error) {
        const parseError = new Error(`Invalid JSON stored for ${label}`);
        parseError.statusCode = 500;
        throw parseError;
    }
}

function createRepositories(db) {
    const selectUserByEmail = db.prepare(`
        SELECT id, email, password_salt, password_hash, created_at
        FROM users
        WHERE email = ?
    `);
    const selectUserById = db.prepare(`
        SELECT id, email, password_salt, password_hash, created_at
        FROM users
        WHERE id = ?
    `);
    const insertUser = db.prepare(`
        INSERT INTO users (id, email, password_salt, password_hash, created_at)
        VALUES (@id, @email, @password_salt, @password_hash, @created_at)
    `);
    const selectGuestState = db.prepare(`
        SELECT state_json
        FROM app_state
        WHERE key = ?
    `);
    const upsertGuestState = db.prepare(`
        INSERT INTO app_state (key, state_json, updated_at)
        VALUES (@key, @state_json, @updated_at)
        ON CONFLICT(key) DO UPDATE SET
            state_json = excluded.state_json,
            updated_at = excluded.updated_at
    `);
    const selectUserState = db.prepare(`
        SELECT state_json
        FROM user_states
        WHERE user_id = ?
    `);
    const upsertUserState = db.prepare(`
        INSERT INTO user_states (user_id, state_json, updated_at)
        VALUES (@user_id, @state_json, @updated_at)
        ON CONFLICT(user_id) DO UPDATE SET
            state_json = excluded.state_json,
            updated_at = excluded.updated_at
    `);

    return {
        findUserByEmail(email) {
            const row = selectUserByEmail.get(email);
            if (!row) {
                return null;
            }

            return {
                id: row.id,
                email: row.email,
                passwordSalt: row.password_salt,
                passwordHash: row.password_hash,
                createdAt: row.created_at,
            };
        },

        findUserById(id) {
            const row = selectUserById.get(id);
            if (!row) {
                return null;
            }

            return {
                id: row.id,
                email: row.email,
                passwordSalt: row.password_salt,
                passwordHash: row.password_hash,
                createdAt: row.created_at,
            };
        },

        createUser(user) {
            insertUser.run({
                id: user.id,
                email: user.email,
                password_salt: user.passwordSalt,
                password_hash: user.passwordHash,
                created_at: user.createdAt,
            });
            return user;
        },

        getGuestState() {
            const row = selectGuestState.get('guest');
            return row ? parseStoredJson(row.state_json, 'guest state') : null;
        },

        saveGuestState(state) {
            upsertGuestState.run({
                key: 'guest',
                state_json: JSON.stringify(state),
                updated_at: new Date().toISOString(),
            });
        },

        getUserState(userId) {
            const row = selectUserState.get(userId);
            return row ? parseStoredJson(row.state_json, `user state ${userId}`) : null;
        },

        saveUserState(userId, state) {
            upsertUserState.run({
                user_id: userId,
                state_json: JSON.stringify(state),
                updated_at: new Date().toISOString(),
            });
        },
    };
}

module.exports = {
    createRepositories,
};
