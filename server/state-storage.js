const RUNTIME_STATE_KEYS = Object.freeze([
    'hasOnboarded',
    'userName',
    'gender',
    'avatar',
    'energyBudget',
    'lastDate',
    'pendingReviewDate',
    'currentDayMeta',
    'resources',
    'templates',
    'preferences',
]);

const PRIVATE_STATE_KEYS = Object.freeze([
    'tasks',
    'inboxItems',
    'moodHistory',
]);

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function pickKeys(source, keys) {
    const result = {};
    keys.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            result[key] = source[key];
        }
    });
    return result;
}

function splitAppState(state) {
    const safeState = isPlainObject(state) ? state : {};
    return {
        runtimeState: pickKeys(safeState, RUNTIME_STATE_KEYS),
        privateState: pickKeys(safeState, PRIVATE_STATE_KEYS),
    };
}

function mergeAppState({ runtimeState = {}, privateState = {} } = {}) {
    return {
        ...(isPlainObject(runtimeState) ? runtimeState : {}),
        ...(isPlainObject(privateState) ? privateState : {}),
    };
}

function ensureValidStateSegment(segment, label, maxBytes) {
    if (!isPlainObject(segment)) {
        const error = new Error(`${label} should be a JSON object.`);
        error.statusCode = 400;
        throw error;
    }

    const byteLength = Buffer.byteLength(JSON.stringify(segment), 'utf8');
    if (byteLength > maxBytes) {
        const error = new Error(`${label} is too large.`);
        error.statusCode = 413;
        throw error;
    }

    return segment;
}

module.exports = {
    PRIVATE_STATE_KEYS,
    RUNTIME_STATE_KEYS,
    ensureValidStateSegment,
    mergeAppState,
    splitAppState,
};
