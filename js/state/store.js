import { getLocalDateString } from '../utils/date.js';
import { createCurrentDayMeta, normalizeCurrentDayMeta, normalizeMoodHistory } from '../domain/history.js';
import { TASK_STORAGE, getTaskStorageStatus } from '../domain/tasks.js';

const STORAGE_KEY = 'resourceTodoState';
const API_STATE_URL = '/api/state';

function getDefaultTemplates() {
    return [
        {
            id: 'tpl_1',
            name: 'Утро',
            autoAddDaily: false,
            hasAskedAutoAdd: false,
            lastAutoAddedDate: null,
            tasks: [
                { id: 'tt_11', text: 'Выпить воду', weight: 5 },
                { id: 'tt_12', text: 'Принять лекарства', weight: 5 },
                { id: 'tt_13', text: 'Почистить зубы', weight: 5 },
                { id: 'tt_14', text: 'Завтрак-минимум', weight: 5 },
            ],
        },
        {
            id: 'tpl_2',
            name: 'Выход из дома',
            autoAddDaily: false,
            hasAskedAutoAdd: false,
            lastAutoAddedDate: null,
            tasks: [
                { id: 'tt_21', text: 'Ключи', weight: 5 },
                { id: 'tt_22', text: 'Телефон', weight: 5 },
                { id: 'tt_23', text: 'Наушники', weight: 5 },
                { id: 'tt_24', text: 'Проверить плиту', weight: 5 },
                { id: 'tt_25', text: 'Проверить розетки', weight: 5 },
                { id: 'tt_26', text: 'Проверить входную дверь', weight: 5 },
            ],
        },
        {
            id: 'tpl_3',
            name: 'Вечер',
            autoAddDaily: false,
            hasAskedAutoAdd: false,
            lastAutoAddedDate: null,
            tasks: [
                { id: 'tt_31', text: 'Поставить устройства на зарядку', weight: 5 },
                { id: 'tt_32', text: 'Проветрить', weight: 5 },
                { id: 'tt_33', text: 'Вечерние таблетки', weight: 5 },
            ],
        },
        {
            id: 'tpl_4',
            name: 'SOS-день',
            autoAddDaily: false,
            hasAskedAutoAdd: false,
            lastAutoAddedDate: null,
            tasks: [
                { id: 'tt_41', text: 'Выпить воды', weight: 5 },
                { id: 'tt_42', text: 'Поесть или взять перекус', weight: 5 },
                { id: 'tt_43', text: 'Принять лекарства или проверить базовый уход', weight: 5 },
                { id: 'tt_44', text: 'Полежать или посидеть в тишине 10 минут', weight: 5 },
            ],
        },
    ];
}

function getDefaultState() {
    return {
        hasOnboarded: false,
        userName: '',
        gender: 'female',
        avatar: 'assets/girl.png',
        energyBudget: null,
        lastDate: null,
        pendingReviewDate: null,
        currentDayMeta: createCurrentDayMeta(null),
        moodHistory: [],
        tasks: [],
        inboxItems: [],
        preferences: {
            breakDownLargeTasksPromptMode: 'ask-first-time',
        },
        resources: [
            { id: 'res_1', text: 'Попить кофе' },
            { id: 'res_2', text: '10 минут соцсетей' },
            { id: 'res_3', text: 'Прогулка 15 минут' },
        ],
        templates: [],
        syncMeta: {
            lastServerSyncAt: null,
            lastLocalMutationAt: null,
            hasPendingOfflineChanges: false,
        },
    };
}

function createDefaultStateWithTemplates() {
    const nextState = getDefaultState();
    nextState.templates = getDefaultTemplates();
    return nextState;
}

function ensurePreferenceDefaults(state) {
    if (!state.preferences || typeof state.preferences !== 'object') {
        state.preferences = {};
    }

    if (typeof state.preferences.breakDownLargeTasksPromptMode !== 'string') {
        state.preferences.breakDownLargeTasksPromptMode = 'ask-first-time';
    }
}

function ensureTemplateDefaults(template) {
    if (typeof template.autoAddDaily !== 'boolean') {
        template.autoAddDaily = false;
    }

    if (typeof template.hasAskedAutoAdd !== 'boolean') {
        template.hasAskedAutoAdd = false;
    }

    if (typeof template.lastAutoAddedDate !== 'string') {
        template.lastAutoAddedDate = null;
    }

    if (!Array.isArray(template.tasks)) {
        template.tasks = [];
    }
}

function ensureTemplateMigrations(state) {
    state.templates.forEach(ensureTemplateDefaults);

    const exitHomeTemplate = state.templates.find(template => template.id === 'tpl_2');
    if (exitHomeTemplate?.tasks) {
        if (!exitHomeTemplate.tasks.find(task => task.id === 'tt_25')) {
            exitHomeTemplate.tasks.push({ id: 'tt_25', text: 'Проверить розетки', weight: 5 });
        }

        if (!exitHomeTemplate.tasks.find(task => task.id === 'tt_26')) {
            exitHomeTemplate.tasks.push({ id: 'tt_26', text: 'Проверить входную дверь', weight: 5 });
        }
    }

    const sosTemplate = state.templates.find(template => template.id === 'tpl_4');
    if (!sosTemplate?.tasks) {
        return;
    }

    const sosTaskMap = {
        tt_41: 'Выпить воды',
        tt_42: 'Поесть или взять перекус',
        tt_43: 'Принять лекарства или проверить базовый уход',
        tt_44: 'Полежать или посидеть в тишине 10 минут',
    };

    sosTemplate.name = 'SOS-день';
    Object.entries(sosTaskMap).forEach(([taskId, text]) => {
        const existingTask = sosTemplate.tasks.find(task => task.id === taskId);
        if (existingTask) {
            existingTask.text = text;
            existingTask.weight = 5;
        } else {
            sosTemplate.tasks.push({ id: taskId, text, weight: 5 });
        }
    });
}

function ensureSyncMetaDefaults(state) {
    if (!state.syncMeta || typeof state.syncMeta !== 'object') {
        state.syncMeta = {};
    }

    if (typeof state.syncMeta.lastServerSyncAt !== 'string') {
        state.syncMeta.lastServerSyncAt = null;
    }

    if (typeof state.syncMeta.lastLocalMutationAt !== 'string') {
        state.syncMeta.lastLocalMutationAt = null;
    }

    if (typeof state.syncMeta.hasPendingOfflineChanges !== 'boolean') {
        state.syncMeta.hasPendingOfflineChanges = false;
    }
}

function cloneStateSnapshot(nextState) {
    return JSON.parse(JSON.stringify(nextState));
}

function normalizeLoadedState(rawState, previousState = getDefaultState()) {
    const today = getLocalDateString();
    const nextState = { ...previousState, ...rawState };

    if (!Array.isArray(nextState.tasks)) nextState.tasks = [];
    if (!Array.isArray(nextState.inboxItems)) nextState.inboxItems = [];
    if (!Array.isArray(nextState.resources)) nextState.resources = [];
    nextState.moodHistory = normalizeMoodHistory(nextState.moodHistory);
    ensurePreferenceDefaults(nextState);
    ensureSyncMetaDefaults(nextState);

    if (!Array.isArray(nextState.templates) || nextState.templates.length === 0) {
        nextState.templates = getDefaultTemplates();
    } else {
        ensureTemplateMigrations(nextState);
    }

    if (typeof nextState.pendingReviewDate !== 'string') {
        nextState.pendingReviewDate = null;
    }

    if (!nextState.currentDayMeta || typeof nextState.currentDayMeta !== 'object') {
        nextState.currentDayMeta = createCurrentDayMeta(nextState.lastDate);
    } else {
        nextState.currentDayMeta = normalizeCurrentDayMeta(
            nextState.currentDayMeta,
            nextState.currentDayMeta.date || nextState.lastDate || today,
        );
    }

    if (nextState.lastDate && nextState.currentDayMeta.date !== nextState.lastDate) {
        nextState.currentDayMeta = createCurrentDayMeta(nextState.lastDate);
    }

    const seenIds = new Set();
    nextState.tasks.forEach(task => {
        if (seenIds.has(task.id)) {
            task.id = `task_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        }
        seenIds.add(task.id);

        if (typeof task.completedAtDate !== 'string') {
            task.completedAtDate = null;
        }

        if (typeof task.breakdownParentId !== 'string') {
            task.breakdownParentId = null;
        }

        if (!Array.isArray(task.breakdownChildIds)) {
            task.breakdownChildIds = [];
        }

        if (typeof task.breakdownIndex !== 'number') {
            task.breakdownIndex = null;
        }

        if (typeof task.isBreakdownParent !== 'boolean') {
            task.isBreakdownParent = false;
        }

        if (typeof task.isBreakdownStep !== 'boolean') {
            task.isBreakdownStep = false;
        }

        if (typeof task.isHiddenFromMainList !== 'boolean') {
            task.isHiddenFromMainList = false;
        }

        if (typeof task.showOnlyCurrentStep !== 'boolean') {
            task.showOnlyCurrentStep = false;
        }

        if (typeof task.isCurrentBreakdownStep !== 'boolean') {
            task.isCurrentBreakdownStep = false;
        }

        task.storageStatus = getTaskStorageStatus(task);
        task.isArchived = task.storageStatus === TASK_STORAGE.DEFERRED;

        if (task.storageStatus === TASK_STORAGE.ACTIVE && !task.targetDate) {
            task.targetDate = nextState.lastDate || today;
        }

        if (task.storageStatus !== TASK_STORAGE.ACTIVE) {
            task.targetDate = null;
        }
    });

    nextState.inboxItems = nextState.inboxItems
        .filter(item => item && typeof item.text === 'string')
        .map(item => ({
            id: typeof item.id === 'string' ? item.id : `inbox_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
            text: item.text.trim(),
            createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
        }))
        .filter(item => item.text);

    if (nextState.avatar && !nextState.avatar.includes('.png')) {
        nextState.avatar = 'assets/girl.png';
    }

    const hasOverdue = nextState.tasks.some(task => task.targetDate && task.targetDate < today);
    if (!nextState.pendingReviewDate && nextState.lastDate !== today && hasOverdue) {
        nextState.pendingReviewDate = today;
    }

    return nextState;
}

export function createStore() {
    let state = createDefaultStateWithTemplates();
    let sessionContext = {
        authenticated: false,
        userId: null,
    };
    let persistenceStatus = {
        mode: 'local-fallback',
        message: 'Сохранение: локально, сеть недоступна.',
        hasPendingOfflineChanges: false,
    };
    let persistenceStatusListener = null;
    let saveChain = Promise.resolve();

    function getState() {
        return state;
    }

    function setState(nextState) {
        state = nextState;
        ensureSyncMetaDefaults(state);
        return state;
    }

    function getPersistenceStatus() {
        return persistenceStatus;
    }

    function getStorageKey() {
        if (sessionContext.authenticated && sessionContext.userId) {
            return `${STORAGE_KEY}:${sessionContext.userId}`;
        }

        return STORAGE_KEY;
    }

    function setSessionContext(nextContext = {}) {
        sessionContext = {
            authenticated: Boolean(nextContext.authenticated),
            userId: typeof nextContext.userId === 'string' ? nextContext.userId : null,
        };
    }

    function setPersistenceStatusListener(listener) {
        persistenceStatusListener = listener;
        if (typeof listener === 'function') {
            listener({ ...persistenceStatus });
        }
    }

    function updatePersistenceStatus(nextStatus) {
        const nextMode = nextStatus?.mode || 'local-fallback';
        const nextMessage = nextStatus?.message || '';
        const nextPending = Boolean(nextStatus?.hasPendingOfflineChanges);
        if (
            persistenceStatus.mode === nextMode
            && persistenceStatus.message === nextMessage
            && Boolean(persistenceStatus.hasPendingOfflineChanges) === nextPending
        ) {
            return;
        }

        persistenceStatus = {
            mode: nextMode,
            message: nextMessage,
            hasPendingOfflineChanges: nextPending,
        };

        if (typeof persistenceStatusListener === 'function') {
            persistenceStatusListener({ ...persistenceStatus });
        }
    }

    function saveStateToLocal(nextState = state) {
        localStorage.setItem(getStorageKey(), JSON.stringify(nextState));
    }

    function getLocalSavedState() {
        return localStorage.getItem(getStorageKey());
    }

    function markLocalMutation(nextState = state) {
        ensureSyncMetaDefaults(nextState);
        nextState.syncMeta.lastLocalMutationAt = new Date().toISOString();
        nextState.syncMeta.hasPendingOfflineChanges = true;
    }

    function markServerSyncSuccess(syncTarget, syncedAt = new Date().toISOString()) {
        ensureSyncMetaDefaults(syncTarget);
        syncTarget.syncMeta.lastServerSyncAt = syncedAt;
        syncTarget.syncMeta.hasPendingOfflineChanges = false;

        ensureSyncMetaDefaults(state);
        state.syncMeta.lastServerSyncAt = syncedAt;
        if (state.syncMeta.lastLocalMutationAt === syncTarget.syncMeta.lastLocalMutationAt) {
            state.syncMeta.hasPendingOfflineChanges = false;
        }
    }

    function getOfflineStatusMessage() {
        return sessionContext.authenticated
            ? 'Офлайн-режим: данные сохраняются на этом устройстве и будут синхронизированы позже.'
            : 'Сохранение: локально, сеть недоступна.';
    }

    async function fetchServerState() {
        const response = await fetch(API_STATE_URL, {
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to load state from server: ${response.status}`);
        }

        const payload = await response.json();
        if (!payload || typeof payload !== 'object') {
            return null;
        }

        if (payload.state === null) {
            return null;
        }

        if (typeof payload.state !== 'object') {
            throw new Error('Server returned invalid state payload');
        }

        return payload.state;
    }

    async function postServerState(nextState = state) {
        const response = await fetch(API_STATE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(nextState),
        });

        if (!response.ok) {
            throw new Error(`Failed to save state to server: ${response.status}`);
        }

        return response.json().catch(() => null);
    }

    async function syncPendingState() {
        if (!sessionContext.authenticated) {
            return false;
        }

        const snapshot = cloneStateSnapshot(state);
        ensureSyncMetaDefaults(snapshot);

        try {
            if (snapshot.syncMeta.hasPendingOfflineChanges) {
                await postServerState(snapshot);
                markServerSyncSuccess(snapshot);
                saveStateToLocal(state);
            } else {
                await fetchServerState();
            }

            updatePersistenceStatus({
                mode: 'server',
                message: 'Сохранение: сервер',
                hasPendingOfflineChanges: Boolean(state.syncMeta?.hasPendingOfflineChanges),
            });
            return true;
        } catch (error) {
            updatePersistenceStatus({
                mode: sessionContext.authenticated ? 'offline-authenticated' : 'local-fallback',
                message: getOfflineStatusMessage(),
                hasPendingOfflineChanges: Boolean(state.syncMeta?.hasPendingOfflineChanges),
            });
            return false;
        }
    }

    function saveState(nextState = state) {
        saveStateToLocal(nextState);
        const stateSnapshot = cloneStateSnapshot(nextState);

        saveChain = saveChain
            .catch(() => undefined)
            .then(async () => {
                try {
                    await postServerState(stateSnapshot);
                    markServerSyncSuccess(stateSnapshot);
                    saveStateToLocal(state);
                    updatePersistenceStatus({
                        mode: 'server',
                        message: 'Сохранение: сервер',
                        hasPendingOfflineChanges: Boolean(state.syncMeta?.hasPendingOfflineChanges),
                    });
                } catch (error) {
                    console.warn('Failed to save state to server, using local fallback', error);
                    saveStateToLocal(nextState);
                    updatePersistenceStatus({
                        mode: sessionContext.authenticated ? 'offline-authenticated' : 'local-fallback',
                        message: getOfflineStatusMessage(),
                        hasPendingOfflineChanges: true,
                    });
                }
            });

        return saveChain;
    }

    function updateState(mutator, options = { save: true }) {
        mutator(state);
        if (options.save !== false) {
            markLocalMutation(state);
            void saveState();
        }
        return state;
    }

    async function loadState(options = {}) {
        const localSaved = getLocalSavedState();
        const allowLegacyGuestBootstrap = options.allowLegacyGuestBootstrap !== false;
        let normalizedLocalState = null;

        if (localSaved) {
            try {
                normalizedLocalState = normalizeLoadedState(JSON.parse(localSaved), createDefaultStateWithTemplates());
            } catch (localParseError) {
                console.error('Failed to parse local state', localParseError);
            }
        }

        try {
            const serverState = await fetchServerState();

            if (normalizedLocalState?.syncMeta?.hasPendingOfflineChanges) {
                state = normalizedLocalState;
                saveStateToLocal(state);

                try {
                    await postServerState(state);
                    markServerSyncSuccess(state);
                    saveStateToLocal(state);
                    updatePersistenceStatus({
                        mode: 'server',
                        message: 'Сохранение: сервер',
                        hasPendingOfflineChanges: false,
                    });
                } catch (migrationError) {
                    console.warn('Failed to sync pending local state to server', migrationError);
                    updatePersistenceStatus({
                        mode: 'offline-authenticated',
                        message: getOfflineStatusMessage(),
                        hasPendingOfflineChanges: true,
                    });
                }
                return state;
            }

            if (serverState) {
                state = normalizeLoadedState(serverState, createDefaultStateWithTemplates());
                saveStateToLocal(state);
                updatePersistenceStatus({
                    mode: 'server',
                    message: 'Сохранение: сервер',
                    hasPendingOfflineChanges: Boolean(state.syncMeta?.hasPendingOfflineChanges),
                });
                return state;
            }

            if (normalizedLocalState) {
                state = normalizedLocalState;
                saveStateToLocal(state);
                try {
                    await postServerState(state);
                    markServerSyncSuccess(state);
                    saveStateToLocal(state);
                    updatePersistenceStatus({
                        mode: 'server',
                        message: 'Сохранение: сервер',
                        hasPendingOfflineChanges: false,
                    });
                } catch (migrationError) {
                    console.warn('Failed to migrate local state to server', migrationError);
                    updatePersistenceStatus({
                        mode: sessionContext.authenticated ? 'offline-authenticated' : 'local-fallback',
                        message: getOfflineStatusMessage(),
                        hasPendingOfflineChanges: Boolean(state.syncMeta?.hasPendingOfflineChanges),
                    });
                }
                return state;
            }

            if (
                sessionContext.authenticated
                && allowLegacyGuestBootstrap
                && getStorageKey() !== STORAGE_KEY
                && localStorage.getItem(STORAGE_KEY)
            ) {
                state = createDefaultStateWithTemplates();
                updatePersistenceStatus({
                    mode: 'server',
                    message: 'Сохранение: сервер',
                    hasPendingOfflineChanges: false,
                });
                return state;
            }

            state = createDefaultStateWithTemplates();
            updatePersistenceStatus({
                mode: 'server',
                message: 'Сохранение: сервер',
                hasPendingOfflineChanges: false,
            });
            return state;
        } catch (serverError) {
            console.warn('Failed to load state from server, using local fallback', serverError);

            if (normalizedLocalState) {
                state = normalizedLocalState;
            } else {
                state = createDefaultStateWithTemplates();
            }

            updatePersistenceStatus({
                mode: sessionContext.authenticated ? 'offline-authenticated' : 'local-fallback',
                message: sessionContext.authenticated
                    ? 'Офлайн-режим: данные сохраняются на этом устройстве.'
                    : 'Сохранение: локально, сеть недоступна.',
                hasPendingOfflineChanges: Boolean(state.syncMeta?.hasPendingOfflineChanges),
            });
            return state;
        }
    }

    return {
        getState,
        setState,
        setSessionContext,
        getPersistenceStatus,
        setPersistenceStatusListener,
        saveState,
        updateState,
        loadState,
        syncPendingState,
    };
}
