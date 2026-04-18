const DB_NAME = 'resourceTodoOffline';
const STORE_NAME = 'stateCache';
const LEGACY_STORAGE_KEY = 'resourceTodoState';

let openRequest = null;

function canUseIndexedDb() {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function canUseLocalStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function openDatabase() {
    if (!canUseIndexedDb()) {
        return Promise.resolve(null);
    }

    if (openRequest) {
        return openRequest;
    }

    openRequest = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error || new Error('IndexedDB is unavailable.'));
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
        request.onsuccess = () => resolve(request.result);
    }).catch(error => {
        openRequest = null;
        throw error;
    });

    return openRequest;
}

function createTransactionRequest(storeName, mode, callback) {
    return openDatabase().then(db => {
        if (!db) {
            return null;
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = callback(store);

            transaction.oncomplete = () => resolve(request?.result ?? null);
            transaction.onerror = () => reject(transaction.error || request?.error || new Error('IndexedDB transaction failed.'));
            transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted.'));
        });
    });
}

export async function readOfflineStateCache(key) {
    const entry = await createTransactionRequest(STORE_NAME, 'readonly', store => store.get(key));
    if (!entry) {
        return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await removeOfflineStateCache(key);
        return null;
    }

    return entry.value || null;
}

export async function writeOfflineStateCache(key, value, { ttlMs }) {
    const now = Date.now();
    await createTransactionRequest(STORE_NAME, 'readwrite', store => store.put({
        key,
        value,
        updatedAt: now,
        expiresAt: now + ttlMs,
    }));
}

export async function removeOfflineStateCache(key) {
    await createTransactionRequest(STORE_NAME, 'readwrite', store => store.delete(key));
}

export async function clearOfflineStateCache(prefix = '') {
    const db = await openDatabase();
    if (!db) {
        return;
    }

    await new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const cursorRequest = store.openCursor();

        cursorRequest.onerror = () => reject(cursorRequest.error || new Error('IndexedDB cursor failed.'));
        cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (!cursor) {
                return;
            }

            const shouldDelete = !prefix || String(cursor.key).startsWith(prefix);
            if (shouldDelete) {
                cursor.delete();
            }
            cursor.continue();
        };

        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || new Error('IndexedDB cleanup failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('IndexedDB cleanup aborted.'));
    });
}

export function readLegacyOfflineState(key) {
    if (!canUseLocalStorage()) {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function removeLegacyOfflineState(key) {
    if (!canUseLocalStorage()) {
        return;
    }

    window.localStorage.removeItem(key);
}

export function getLegacyOfflineStateKey(userId = null) {
    return userId ? `${LEGACY_STORAGE_KEY}:${userId}` : LEGACY_STORAGE_KEY;
}
