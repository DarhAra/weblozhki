const crypto = require('crypto');

const DEFAULT_SCRYPT_PARAMS = Object.freeze({
    N: 16384,
    r: 8,
    p: 1,
    keylen: 64,
});

function deriveEncryptionKey(rawKey) {
    return crypto.createHash('sha256').update(String(rawKey)).digest();
}

function createDataEncryptor({ secret, isProduction = false } = {}) {
    if (!secret) {
        if (isProduction) {
            throw new Error('DATA_ENCRYPTION_KEY is required in production.');
        }

        secret = 'dev-local-only-change-me';
    }

    const key = deriveEncryptionKey(secret);

    function encryptJson(value) {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const payload = JSON.stringify(value ?? {});
        const ciphertext = Buffer.concat([
            cipher.update(payload, 'utf8'),
            cipher.final(),
        ]);
        const tag = cipher.getAuthTag();

        return JSON.stringify({
            v: 1,
            alg: 'aes-256-gcm',
            iv: iv.toString('base64'),
            tag: tag.toString('base64'),
            data: ciphertext.toString('base64'),
        });
    }

    function decryptJson(serializedValue) {
        if (!serializedValue) {
            return null;
        }

        const payload = typeof serializedValue === 'string'
            ? JSON.parse(serializedValue)
            : serializedValue;
        if (!payload || payload.v !== 1 || payload.alg !== 'aes-256-gcm') {
            throw new Error('Unsupported encrypted payload format.');
        }

        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            key,
            Buffer.from(payload.iv, 'base64'),
        );
        decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));

        const plaintext = Buffer.concat([
            decipher.update(Buffer.from(payload.data, 'base64')),
            decipher.final(),
        ]).toString('utf8');

        return JSON.parse(plaintext);
    }

    return {
        isConfigured: Boolean(secret),
        encryptJson,
        decryptJson,
    };
}

function buildPasswordHashMeta(params = DEFAULT_SCRYPT_PARAMS) {
    return `scrypt$${params.N}$${params.r}$${params.p}$${params.keylen}`;
}

function parsePasswordHashMeta(passwordHash) {
    if (typeof passwordHash !== 'string' || !passwordHash.startsWith('scrypt$')) {
        return null;
    }

    const parts = passwordHash.split('$');
    if (parts.length !== 6) {
        return null;
    }

    const [, , rawN, rawR, rawP, rawKeylen] = parts;
    const params = {
        N: Number(rawN),
        r: Number(rawR),
        p: Number(rawP),
        keylen: Number(rawKeylen),
    };

    if (!Number.isFinite(params.N) || !Number.isFinite(params.r) || !Number.isFinite(params.p) || !Number.isFinite(params.keylen)) {
        return null;
    }

    return params;
}

function createPasswordService() {
    async function deriveHash(password, salt, params) {
        const maxmem = 128 * params.N * params.r * 2;
        return new Promise((resolve, reject) => {
            crypto.scrypt(
                password,
                salt,
                params.keylen,
                {
                    N: params.N,
                    r: params.r,
                    p: params.p,
                    maxmem,
                },
                (error, derivedKey) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(derivedKey.toString('hex'));
                },
            );
        });
    }

    async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
        const params = { ...DEFAULT_SCRYPT_PARAMS };
        const hash = await deriveHash(password, salt, params);
        return {
            salt,
            hash: `${buildPasswordHashMeta(params)}$${hash}`,
        };
    }

    async function verifyPassword(password, user) {
        const passwordHash = String(user?.passwordHash || '');
        const salt = user?.passwordSalt;
        if (!salt || !passwordHash) {
            return {
                ok: false,
                needsRehash: false,
            };
        }

        const params = parsePasswordHashMeta(passwordHash);
        if (params) {
            const derivedHash = await deriveHash(password, salt, params);
            const expectedHash = passwordHash.split('$').pop();
            const ok = crypto.timingSafeEqual(
                Buffer.from(derivedHash, 'hex'),
                Buffer.from(expectedHash, 'hex'),
            );

            return {
                ok,
                needsRehash: false,
            };
        }

        const legacyHash = crypto.scryptSync(password, salt, 64).toString('hex');
        const ok = legacyHash === passwordHash;
        return {
            ok,
            needsRehash: ok,
        };
    }

    return {
        hashPassword,
        verifyPassword,
    };
}

module.exports = {
    createDataEncryptor,
    createPasswordService,
};
