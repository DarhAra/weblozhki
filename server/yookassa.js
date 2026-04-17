const crypto = require('crypto');

const YOOKASSA_API_BASE = 'https://api.yookassa.ru/v3';
const DEFAULT_ALLOWED_IPS = [
    '185.71.76.0/27',
    '185.71.77.0/27',
    '77.75.153.0/25',
    '77.75.156.11',
    '77.75.156.35',
    '77.75.154.128/25',
    '2a02:5180::/32',
];

function createPaymentError(message, statusCode = 500, code = 'PAYMENT_PROVIDER_ERROR') {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
}

function normalizeIp(ip) {
    if (typeof ip !== 'string') {
        return '';
    }

    const trimmed = ip.trim();
    if (!trimmed) {
        return '';
    }

    if (trimmed.startsWith('::ffff:')) {
        return trimmed.slice(7);
    }

    return trimmed;
}

function ipv4ToBigInt(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) {
        return null;
    }

    let value = 0n;
    for (const part of parts) {
        if (!/^\d+$/.test(part)) {
            return null;
        }

        const octet = Number(part);
        if (octet < 0 || octet > 255) {
            return null;
        }

        value = (value << 8n) + BigInt(octet);
    }

    return value;
}

function expandIpv6(ip) {
    const normalized = normalizeIp(ip).toLowerCase();
    if (!normalized) {
        return null;
    }

    const [head, tail] = normalized.split('::');
    if (tail !== undefined && normalized.indexOf('::') !== normalized.lastIndexOf('::')) {
        return null;
    }

    const headParts = head ? head.split(':').filter(Boolean) : [];
    const tailParts = tail ? tail.split(':').filter(Boolean) : [];
    const missingBlocks = 8 - (headParts.length + tailParts.length);

    if (tail === undefined) {
        if (headParts.length !== 8) {
            return null;
        }
        return headParts;
    }

    if (missingBlocks < 0) {
        return null;
    }

    return [
        ...headParts,
        ...new Array(missingBlocks).fill('0'),
        ...tailParts,
    ];
}

function ipv6ToBigInt(ip) {
    const parts = expandIpv6(ip);
    if (!parts || parts.length !== 8) {
        return null;
    }

    let value = 0n;
    for (const part of parts) {
        if (!/^[0-9a-f]{0,4}$/i.test(part)) {
            return null;
        }

        const segment = Number.parseInt(part || '0', 16);
        if (!Number.isFinite(segment) || segment < 0 || segment > 0xffff) {
            return null;
        }

        value = (value << 16n) + BigInt(segment);
    }

    return value;
}

function ipToBigInt(ip) {
    const normalized = normalizeIp(ip);
    if (normalized.includes(':')) {
        return {
            family: 6,
            value: ipv6ToBigInt(normalized),
        };
    }

    return {
        family: 4,
        value: ipv4ToBigInt(normalized),
    };
}

function cidrContains(ip, candidate) {
    const [range, prefixRaw] = candidate.split('/');
    const ipParsed = ipToBigInt(ip);
    const rangeParsed = ipToBigInt(range);
    if (!ipParsed.value || !rangeParsed.value || ipParsed.family !== rangeParsed.family) {
        return false;
    }

    const totalBits = ipParsed.family === 4 ? 32 : 128;
    const prefix = prefixRaw === undefined ? totalBits : Number(prefixRaw);
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > totalBits) {
        return false;
    }

    const shift = BigInt(totalBits - prefix);
    const mask = prefix === 0
        ? 0n
        : ((1n << BigInt(totalBits)) - 1n) ^ ((1n << shift) - 1n);

    return (ipParsed.value & mask) === (rangeParsed.value & mask);
}

function formatAmountValue(amount) {
    return Number(amount).toFixed(2);
}

function parseYookassaResponse(response, fallbackMessage) {
    return response.text().then(rawText => {
        let payload = null;
        try {
            payload = rawText ? JSON.parse(rawText) : null;
        } catch {
            payload = null;
        }

        if (!response.ok) {
            throw createPaymentError(
                payload?.description || payload?.message || fallbackMessage,
                response.status,
                payload?.code || 'PAYMENT_PROVIDER_ERROR',
            );
        }

        if (!payload || typeof payload !== 'object') {
            throw createPaymentError(fallbackMessage, 502, 'PAYMENT_PROVIDER_INVALID_RESPONSE');
        }

        return payload;
    });
}

function createYookassaClient(config) {
    const isConfigured = Boolean(config.yookassaShopId && config.yookassaSecretKey);
    const authHeader = `Basic ${Buffer.from(`${config.yookassaShopId}:${config.yookassaSecretKey}`).toString('base64')}`;

    async function request(path, options = {}) {
        if (!isConfigured) {
            throw createPaymentError('YooKassa is not configured.', 500, 'PAYMENT_PROVIDER_NOT_CONFIGURED');
        }

        const response = await fetch(`${YOOKASSA_API_BASE}${path}`, {
            ...options,
            headers: {
                Authorization: authHeader,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        return parseYookassaResponse(response, 'YooKassa did not return a valid response.');
    }

    return {
        isConfigured,
        allowedWebhookIps: Array.isArray(config.yookassaWebhookAllowedIps) && config.yookassaWebhookAllowedIps.length > 0
            ? config.yookassaWebhookAllowedIps
            : DEFAULT_ALLOWED_IPS,

        isAllowedWebhookIp(ip) {
            const normalized = normalizeIp(ip);
            if (!normalized) {
                return false;
            }

            return this.allowedWebhookIps.some(candidate => cidrContains(normalized, candidate));
        },

        async createPayment({ amount, currency, description, returnUrl, donationId, userId }) {
            const idempotenceKey = crypto.randomUUID();
            return request('/payments', {
                method: 'POST',
                headers: {
                    'Idempotence-Key': idempotenceKey,
                },
                body: JSON.stringify({
                    amount: {
                        value: formatAmountValue(amount),
                        currency,
                    },
                    capture: true,
                    confirmation: {
                        type: 'redirect',
                        return_url: returnUrl,
                    },
                    description,
                    metadata: {
                        donationId,
                        userId,
                    },
                }),
            });
        },

        async getPayment(paymentId) {
            if (!paymentId) {
                throw createPaymentError('Payment id is required.', 400, 'PAYMENT_ID_REQUIRED');
            }

            return request(`/payments/${encodeURIComponent(paymentId)}`, {
                method: 'GET',
            });
        },
    };
}

module.exports = {
    createPaymentError,
    createYookassaClient,
};
