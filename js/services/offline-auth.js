const OFFLINE_AUTH_SNAPSHOT_KEY = 'resourceTodoOfflineAuthSnapshot';

function canUseLocalStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeSnapshot(rawSnapshot) {
    if (!rawSnapshot || typeof rawSnapshot !== 'object') {
        return null;
    }

    const userId = typeof rawSnapshot.userId === 'string' ? rawSnapshot.userId.trim() : '';
    const email = typeof rawSnapshot.email === 'string' ? rawSnapshot.email.trim() : '';
    const name = typeof rawSnapshot.name === 'string' ? rawSnapshot.name.trim() : '';
    const lastAuthenticatedAt = typeof rawSnapshot.lastAuthenticatedAt === 'string'
        ? rawSnapshot.lastAuthenticatedAt
        : null;

    if (!userId || !email) {
        return null;
    }

    return {
        userId,
        email,
        name: name || email,
        lastAuthenticatedAt,
    };
}

export function readOfflineAuthSnapshot() {
    if (!canUseLocalStorage()) {
        return null;
    }

    try {
        const rawValue = window.localStorage.getItem(OFFLINE_AUTH_SNAPSHOT_KEY);
        if (!rawValue) {
            return null;
        }

        return normalizeSnapshot(JSON.parse(rawValue));
    } catch {
        return null;
    }
}

export function saveOfflineAuthSnapshot(user) {
    if (!canUseLocalStorage()) {
        return null;
    }

    const snapshot = normalizeSnapshot({
        userId: user?.id || user?.userId,
        email: user?.email,
        name: user?.name,
        lastAuthenticatedAt: new Date().toISOString(),
    });

    if (!snapshot) {
        return null;
    }

    window.localStorage.setItem(OFFLINE_AUTH_SNAPSHOT_KEY, JSON.stringify(snapshot));
    return snapshot;
}

export function clearOfflineAuthSnapshot() {
    if (!canUseLocalStorage()) {
        return;
    }

    window.localStorage.removeItem(OFFLINE_AUTH_SNAPSHOT_KEY);
}
