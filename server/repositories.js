function parseStoredJson(raw, label) {
    try {
        return JSON.parse(raw);
    } catch (error) {
        const parseError = new Error(`Invalid JSON stored for ${label}`);
        parseError.statusCode = 500;
        throw parseError;
    }
}

function mapUserRow(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordSalt: row.password_salt,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        passwordChangedAt: row.password_changed_at,
    };
}

function mapDonationRow(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        userId: row.user_id,
        provider: row.provider,
        providerPaymentId: row.provider_payment_id,
        amountValue: Number(row.amount_value),
        amountCurrency: row.amount_currency,
        status: row.status,
        type: row.type,
        returnUrl: row.return_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        confirmedAt: row.confirmed_at,
    };
}

function mapProcessedWebhookRow(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        provider: row.provider,
        eventType: row.event_type,
        paymentId: row.payment_id,
        donationId: row.donation_id,
        createdAt: row.created_at,
    };
}

function createRepositories(db) {
    const selectUserByEmail = db.prepare(`
        SELECT id, name, email, password_salt, password_hash, created_at, updated_at, password_changed_at
        FROM users
        WHERE email = ?
    `);
    const selectUserById = db.prepare(`
        SELECT id, name, email, password_salt, password_hash, created_at, updated_at, password_changed_at
        FROM users
        WHERE id = ?
    `);
    const insertUser = db.prepare(`
        INSERT INTO users (
            id,
            name,
            email,
            password_salt,
            password_hash,
            created_at,
            updated_at,
            password_changed_at
        )
        VALUES (
            @id,
            @name,
            @email,
            @password_salt,
            @password_hash,
            @created_at,
            @updated_at,
            @password_changed_at
        )
    `);
    const updateUserProfile = db.prepare(`
        UPDATE users
        SET name = @name,
            email = @email,
            updated_at = @updated_at
        WHERE id = @id
    `);
    const updateUserPassword = db.prepare(`
        UPDATE users
        SET password_salt = @password_salt,
            password_hash = @password_hash,
            updated_at = @updated_at,
            password_changed_at = @password_changed_at
        WHERE id = @id
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
    const insertSession = db.prepare(`
        INSERT INTO sessions (
            id,
            user_id,
            created_at,
            last_seen_at,
            expires_at,
            revoked_at,
            user_agent,
            ip_hash
        )
        VALUES (
            @id,
            @user_id,
            @created_at,
            @last_seen_at,
            @expires_at,
            NULL,
            @user_agent,
            @ip_hash
        )
    `);
    const selectSessionById = db.prepare(`
        SELECT id, user_id, created_at, last_seen_at, expires_at, revoked_at, user_agent, ip_hash
        FROM sessions
        WHERE id = ?
    `);
    const updateSessionActivity = db.prepare(`
        UPDATE sessions
        SET last_seen_at = @last_seen_at,
            expires_at = @expires_at
        WHERE id = @id
    `);
    const revokeSession = db.prepare(`
        UPDATE sessions
        SET revoked_at = @revoked_at
        WHERE id = @id AND revoked_at IS NULL
    `);
    const revokeUserSessions = db.prepare(`
        UPDATE sessions
        SET revoked_at = @revoked_at
        WHERE user_id = @user_id AND revoked_at IS NULL
    `);
    const deleteExpiredSessions = db.prepare(`
        DELETE FROM sessions
        WHERE expires_at <= @now_iso OR revoked_at IS NOT NULL
    `);
    const insertPasswordResetToken = db.prepare(`
        INSERT INTO password_reset_tokens (
            id,
            user_id,
            token_hash,
            expires_at,
            used_at,
            created_at
        )
        VALUES (
            @id,
            @user_id,
            @token_hash,
            @expires_at,
            NULL,
            @created_at
        )
    `);
    const selectPasswordResetToken = db.prepare(`
        SELECT id, user_id, token_hash, expires_at, used_at, created_at
        FROM password_reset_tokens
        WHERE token_hash = ?
    `);
    const markPasswordResetTokenUsed = db.prepare(`
        UPDATE password_reset_tokens
        SET used_at = @used_at
        WHERE id = @id AND used_at IS NULL
    `);
    const deleteExpiredPasswordResetTokens = db.prepare(`
        DELETE FROM password_reset_tokens
        WHERE expires_at <= @now_iso OR used_at IS NOT NULL
    `);
    const insertDonation = db.prepare(`
        INSERT INTO donations (
            id,
            user_id,
            provider,
            provider_payment_id,
            amount_value,
            amount_currency,
            status,
            type,
            return_url,
            created_at,
            updated_at,
            confirmed_at
        )
        VALUES (
            @id,
            @user_id,
            @provider,
            @provider_payment_id,
            @amount_value,
            @amount_currency,
            @status,
            @type,
            @return_url,
            @created_at,
            @updated_at,
            @confirmed_at
        )
    `);
    const updateDonationProviderPayment = db.prepare(`
        UPDATE donations
        SET provider_payment_id = @provider_payment_id,
            status = @status,
            updated_at = @updated_at
        WHERE id = @id
    `);
    const updateDonationStatus = db.prepare(`
        UPDATE donations
        SET status = @status,
            updated_at = @updated_at,
            confirmed_at = @confirmed_at
        WHERE id = @id
    `);
    const selectDonationById = db.prepare(`
        SELECT id, user_id, provider, provider_payment_id, amount_value, amount_currency, status, type, return_url, created_at, updated_at, confirmed_at
        FROM donations
        WHERE id = ?
    `);
    const selectDonationByProviderPaymentId = db.prepare(`
        SELECT id, user_id, provider, provider_payment_id, amount_value, amount_currency, status, type, return_url, created_at, updated_at, confirmed_at
        FROM donations
        WHERE provider_payment_id = ?
    `);
    const selectLatestDonationByUserId = db.prepare(`
        SELECT id, user_id, provider, provider_payment_id, amount_value, amount_currency, status, type, return_url, created_at, updated_at, confirmed_at
        FROM donations
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `);
    const selectLatestSucceededDonationByUserId = db.prepare(`
        SELECT id, user_id, provider, provider_payment_id, amount_value, amount_currency, status, type, return_url, created_at, updated_at, confirmed_at
        FROM donations
        WHERE user_id = ? AND status = 'succeeded'
        ORDER BY confirmed_at DESC, updated_at DESC
        LIMIT 1
    `);
    const insertProcessedWebhook = db.prepare(`
        INSERT INTO processed_webhooks (
            id,
            provider,
            event_type,
            payment_id,
            donation_id,
            created_at
        )
        VALUES (
            @id,
            @provider,
            @event_type,
            @payment_id,
            @donation_id,
            @created_at
        )
    `);
    const selectProcessedWebhookById = db.prepare(`
        SELECT id, provider, event_type, payment_id, donation_id, created_at
        FROM processed_webhooks
        WHERE id = ?
    `);

    const markDonationSucceededTransaction = db.transaction(({ donationId, status, updatedAt, confirmedAt, webhook }) => {
        updateDonationStatus.run({
            id: donationId,
            status,
            updated_at: updatedAt,
            confirmed_at: confirmedAt,
        });

        insertProcessedWebhook.run({
            id: webhook.id,
            provider: webhook.provider,
            event_type: webhook.eventType,
            payment_id: webhook.paymentId || null,
            donation_id: donationId,
            created_at: webhook.createdAt,
        });
    });

    const markWebhookProcessedTransaction = db.transaction(({ webhook }) => {
        insertProcessedWebhook.run({
            id: webhook.id,
            provider: webhook.provider,
            event_type: webhook.eventType,
            payment_id: webhook.paymentId || null,
            donation_id: webhook.donationId || null,
            created_at: webhook.createdAt,
        });
    });

    return {
        findUserByEmail(email) {
            return mapUserRow(selectUserByEmail.get(email));
        },

        findUserById(id) {
            return mapUserRow(selectUserById.get(id));
        },

        createUser(user) {
            insertUser.run({
                id: user.id,
                name: user.name,
                email: user.email,
                password_salt: user.passwordSalt,
                password_hash: user.passwordHash,
                created_at: user.createdAt,
                updated_at: user.updatedAt,
                password_changed_at: user.passwordChangedAt,
            });
            return user;
        },

        updateUserProfile(user) {
            updateUserProfile.run({
                id: user.id,
                name: user.name,
                email: user.email,
                updated_at: user.updatedAt,
            });
            return this.findUserById(user.id);
        },

        updateUserPassword(user) {
            updateUserPassword.run({
                id: user.id,
                password_salt: user.passwordSalt,
                password_hash: user.passwordHash,
                updated_at: user.updatedAt,
                password_changed_at: user.passwordChangedAt,
            });
            return this.findUserById(user.id);
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

        createSession(session) {
            insertSession.run({
                id: session.id,
                user_id: session.userId,
                created_at: session.createdAt,
                last_seen_at: session.lastSeenAt,
                expires_at: session.expiresAt,
                user_agent: session.userAgent || '',
                ip_hash: session.ipHash || '',
            });
            return session;
        },

        findSessionById(sessionId) {
            const row = selectSessionById.get(sessionId);
            if (!row) {
                return null;
            }

            return {
                id: row.id,
                userId: row.user_id,
                createdAt: row.created_at,
                lastSeenAt: row.last_seen_at,
                expiresAt: row.expires_at,
                revokedAt: row.revoked_at,
                userAgent: row.user_agent,
                ipHash: row.ip_hash,
            };
        },

        touchSession({ id, lastSeenAt, expiresAt }) {
            updateSessionActivity.run({
                id,
                last_seen_at: lastSeenAt,
                expires_at: expiresAt,
            });
        },

        revokeSession(id, revokedAt = new Date().toISOString()) {
            revokeSession.run({
                id,
                revoked_at: revokedAt,
            });
        },

        revokeSessionsForUser(userId, revokedAt = new Date().toISOString()) {
            revokeUserSessions.run({
                user_id: userId,
                revoked_at: revokedAt,
            });
        },

        pruneExpiredSessions(nowIso = new Date().toISOString()) {
            deleteExpiredSessions.run({ now_iso: nowIso });
        },

        createPasswordResetToken(token) {
            insertPasswordResetToken.run({
                id: token.id,
                user_id: token.userId,
                token_hash: token.tokenHash,
                expires_at: token.expiresAt,
                created_at: token.createdAt,
            });
            return token;
        },

        findPasswordResetTokenByHash(tokenHash) {
            const row = selectPasswordResetToken.get(tokenHash);
            if (!row) {
                return null;
            }

            return {
                id: row.id,
                userId: row.user_id,
                tokenHash: row.token_hash,
                expiresAt: row.expires_at,
                usedAt: row.used_at,
                createdAt: row.created_at,
            };
        },

        markPasswordResetTokenUsed(id, usedAt = new Date().toISOString()) {
            markPasswordResetTokenUsed.run({
                id,
                used_at: usedAt,
            });
        },

        prunePasswordResetTokens(nowIso = new Date().toISOString()) {
            deleteExpiredPasswordResetTokens.run({ now_iso: nowIso });
        },

        createDonation(donation) {
            insertDonation.run({
                id: donation.id,
                user_id: donation.userId,
                provider: donation.provider,
                provider_payment_id: donation.providerPaymentId || null,
                amount_value: donation.amountValue,
                amount_currency: donation.amountCurrency,
                status: donation.status,
                type: donation.type,
                return_url: donation.returnUrl,
                created_at: donation.createdAt,
                updated_at: donation.updatedAt,
                confirmed_at: donation.confirmedAt || null,
            });
            return donation;
        },

        attachProviderPaymentToDonation({ id, providerPaymentId, status, updatedAt }) {
            updateDonationProviderPayment.run({
                id,
                provider_payment_id: providerPaymentId,
                status,
                updated_at: updatedAt,
            });
            return this.findDonationById(id);
        },

        updateDonationStatus({ id, status, updatedAt, confirmedAt = null }) {
            updateDonationStatus.run({
                id,
                status,
                updated_at: updatedAt,
                confirmed_at: confirmedAt,
            });
            return this.findDonationById(id);
        },

        findDonationById(id) {
            return mapDonationRow(selectDonationById.get(id));
        },

        findDonationByProviderPaymentId(providerPaymentId) {
            return mapDonationRow(selectDonationByProviderPaymentId.get(providerPaymentId));
        },

        findLatestDonationByUserId(userId) {
            return mapDonationRow(selectLatestDonationByUserId.get(userId));
        },

        findLatestSucceededDonationByUserId(userId) {
            return mapDonationRow(selectLatestSucceededDonationByUserId.get(userId));
        },

        findProcessedWebhookById(id) {
            return mapProcessedWebhookRow(selectProcessedWebhookById.get(id));
        },

        createProcessedWebhook(webhook) {
            insertProcessedWebhook.run({
                id: webhook.id,
                provider: webhook.provider,
                event_type: webhook.eventType,
                payment_id: webhook.paymentId || null,
                donation_id: webhook.donationId || null,
                created_at: webhook.createdAt,
            });
            return webhook;
        },

        markDonationWebhookProcessed({ donationId, status, updatedAt, confirmedAt = null, webhook }) {
            markDonationSucceededTransaction({
                donationId,
                status,
                updatedAt,
                confirmedAt,
                webhook,
            });
            return this.findDonationById(donationId);
        },

        markWebhookProcessed({ webhook }) {
            markWebhookProcessedTransaction({ webhook });
        },
    };
}

module.exports = {
    createRepositories,
};
