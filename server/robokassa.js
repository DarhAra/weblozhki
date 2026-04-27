const crypto = require('crypto');

const ROBOKASSA_PAYMENT_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx';
const ROBOKASSA_OPSTATE_URL = 'https://auth.robokassa.ru/Merchant/WebService/Service.asmx/OpStateExt';
const DEFAULT_ALLOWED_IPS = [
    '185.59.216.65',
    '185.59.217.65',
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

function formatAmountValue(amount) {
    return Number(amount).toFixed(2);
}

function resolveHashAlgorithm(algorithm) {
    const normalized = typeof algorithm === 'string' ? algorithm.trim().toLowerCase() : '';
    if (['md5', 'sha256', 'sha384', 'sha512'].includes(normalized)) {
        return normalized;
    }

    return 'md5';
}

function hashSignature(value, algorithm) {
    return crypto.createHash(resolveHashAlgorithm(algorithm)).update(String(value)).digest('hex');
}

function constantTimeEqual(left, right) {
    if (typeof left !== 'string' || typeof right !== 'string') {
        return false;
    }

    const leftBuffer = Buffer.from(left.toLowerCase());
    const rightBuffer = Buffer.from(right.toLowerCase());
    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function buildShpEntries(params = {}) {
    return Object.entries(params)
        .filter(([key, value]) => key.startsWith('Shp_') && value !== undefined && value !== null && String(value) !== '')
        .sort(([left], [right]) => left.localeCompare(right));
}

function buildSignatureParts(baseParts, shpParams = {}) {
    const parts = [...baseParts];
    buildShpEntries(shpParams).forEach(([key, value]) => {
        parts.push(`${key}=${String(value)}`);
    });
    return parts.join(':');
}

function extractXmlValue(xml, tagName) {
    if (typeof xml !== 'string' || !xml) {
        return '';
    }

    const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = xml.match(new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)</${escapedTag}>`, 'i'));
    return match ? match[1].trim() : '';
}

function normalizeInvoiceStateCode(code) {
    const numericCode = Number(code);
    if (!Number.isFinite(numericCode)) {
        return 'pending';
    }

    if (numericCode === 100) {
        return 'succeeded';
    }

    if ([10, 60, 80].includes(numericCode)) {
        return 'canceled';
    }

    return 'pending';
}

function createRobokassaClient(config) {
    const isConfigured = Boolean(config.robokassaMerchantLogin && config.robokassaPassword1 && config.robokassaPassword2);
    const hashAlgorithm = resolveHashAlgorithm(config.robokassaHashAlgorithm);

    function assertConfigured() {
        if (!isConfigured) {
            throw createPaymentError('Robokassa is not configured.', 500, 'PAYMENT_PROVIDER_NOT_CONFIGURED');
        }
    }

    async function requestInvoiceState(invoiceId) {
        assertConfigured();

        const signature = hashSignature(
            `${config.robokassaMerchantLogin}:${invoiceId}:${config.robokassaPassword2}`,
            hashAlgorithm,
        );
        const url = new URL(ROBOKASSA_OPSTATE_URL);
        url.searchParams.set('MerchantLogin', config.robokassaMerchantLogin);
        url.searchParams.set('InvoiceID', String(invoiceId));
        url.searchParams.set('Signature', signature);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/xml, text/xml;q=0.9, */*;q=0.1',
            },
        });
        const rawText = await response.text();

        if (!response.ok) {
            throw createPaymentError(
                'Robokassa did not return a valid invoice state.',
                response.status,
                'PAYMENT_PROVIDER_ERROR',
            );
        }

        const code = extractXmlValue(rawText, 'Code');
        const stateCode = extractXmlValue(rawText, 'StateCode');
        const outSum = extractXmlValue(rawText, 'OutSum');
        const invoice = extractXmlValue(rawText, 'InvoiceID') || String(invoiceId);

        if (code && code !== '0') {
            throw createPaymentError('Robokassa status verification failed.', 502, 'PAYMENT_VERIFICATION_FAILED');
        }

        return {
            invoiceId: invoice,
            stateCode,
            amountValue: outSum ? Number(outSum) : null,
            status: normalizeInvoiceStateCode(stateCode),
        };
    }

    return {
        isConfigured,
        allowedWebhookIps: Array.isArray(config.robokassaWebhookAllowedIps) && config.robokassaWebhookAllowedIps.length > 0
            ? config.robokassaWebhookAllowedIps
            : DEFAULT_ALLOWED_IPS,

        isAllowedWebhookIp(ip) {
            const normalized = normalizeIp(ip);
            if (!normalized) {
                return false;
            }

            return this.allowedWebhookIps.includes(normalized);
        },

        createPaymentUrl({ amount, description, returnUrl, failUrl, invoiceId, donationId, email }) {
            assertConfigured();

            const outSum = formatAmountValue(amount);
            const shpParams = {
                Shp_donationId: donationId,
            };
            const signature = hashSignature(
                buildSignatureParts([
                    config.robokassaMerchantLogin,
                    outSum,
                    String(invoiceId),
                    config.robokassaPassword1,
                ], shpParams),
                hashAlgorithm,
            );

            const url = new URL(ROBOKASSA_PAYMENT_URL);
            url.searchParams.set('MerchantLogin', config.robokassaMerchantLogin);
            url.searchParams.set('OutSum', outSum);
            url.searchParams.set('InvoiceID', String(invoiceId));
            url.searchParams.set('Description', description);
            url.searchParams.set('SignatureValue', signature);
            url.searchParams.set('Culture', 'ru');
            url.searchParams.set('Encoding', 'utf-8');
            url.searchParams.set('IsTest', config.robokassaIsTest ? '1' : '0');
            url.searchParams.set('SuccessUrl2', returnUrl);
            url.searchParams.set('FailUrl2', failUrl);
            if (email) {
                url.searchParams.set('Email', email);
            }
            Object.entries(shpParams).forEach(([key, value]) => {
                url.searchParams.set(key, String(value));
            });

            return {
                invoiceId: String(invoiceId),
                confirmationUrl: url.toString(),
            };
        },

        verifyResultSignature({ outSum, invoiceId, signatureValue, shpParams = {} }) {
            assertConfigured();
            const expectedSignature = hashSignature(
                buildSignatureParts([
                    formatAmountValue(outSum),
                    String(invoiceId),
                    config.robokassaPassword2,
                ], shpParams),
                hashAlgorithm,
            );
            return constantTimeEqual(expectedSignature, signatureValue || '');
        },

        async getInvoiceState(invoiceId) {
            return requestInvoiceState(invoiceId);
        },
    };
}

module.exports = {
    createPaymentError,
    createRobokassaClient,
};
