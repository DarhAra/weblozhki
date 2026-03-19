import { getLocalDateString, parseLocalDate } from '../utils/date.js';
import { TASK_STORAGE, addTask, moveToDeferred } from './tasks.js';
import { addResource } from './resources.js';

function createInboxId() {
    return `inbox_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

function createTaskId() {
    return `task_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

export function splitInboxText(input) {
    return String(input || '')
        .split(/\r?\n+/)
        .map(line => line.trim())
        .filter(Boolean);
}

export function getInboxItems(state) {
    return [...(state.inboxItems || [])]
        .sort((left, right) => (left.createdAt || '').localeCompare(right.createdAt || ''));
}

export function addInboxItems(store, items) {
    const normalizedItems = (Array.isArray(items) ? items : [])
        .map(item => typeof item === 'string' ? { text: item } : item)
        .map(item => ({
            id: item.id || createInboxId(),
            text: String(item.text || '').trim(),
            createdAt: item.createdAt || new Date().toISOString(),
        }))
        .filter(item => item.text);

    if (normalizedItems.length === 0) {
        return [];
    }

    store.updateState(state => {
        state.inboxItems.push(...normalizedItems);
    });

    return normalizedItems;
}

export function deleteInboxItem(store, itemId) {
    let deletedItem = null;

    store.updateState(state => {
        deletedItem = state.inboxItems.find(item => item.id === itemId) || null;
        state.inboxItems = state.inboxItems.filter(item => item.id !== itemId);
    });

    return deletedItem;
}

export function clearInboxItems(store) {
    let removedCount = 0;

    store.updateState(state => {
        removedCount = state.inboxItems.length;
        state.inboxItems = [];
    });

    return removedCount;
}

export function convertInboxItemToToday(store, { itemId, weight = 20 }) {
    const state = store.getState();
    const item = state.inboxItems.find(entry => entry.id === itemId);
    if (!item) {
        return null;
    }

    const task = addTask(store, {
        text: item.text,
        weight,
        isResource: false,
        targetDate: getLocalDateString(),
    });
    deleteInboxItem(store, itemId);
    return task;
}

export function convertInboxItemToDate(store, { itemId, dateStr, weight = 20 }) {
    const state = store.getState();
    const item = state.inboxItems.find(entry => entry.id === itemId);
    if (!item) {
        return null;
    }

    const task = addTask(store, {
        text: item.text,
        weight,
        isResource: false,
        targetDate: dateStr,
    });
    deleteInboxItem(store, itemId);
    return task;
}

export function convertInboxItemToDeferred(store, itemId) {
    const state = store.getState();
    const item = state.inboxItems.find(entry => entry.id === itemId);
    if (!item) {
        return null;
    }

    const task = addTask(store, {
        text: item.text,
        weight: 20,
        isResource: false,
        targetDate: getLocalDateString(),
    });
    moveToDeferred(store, task.id);
    deleteInboxItem(store, itemId);
    return task;
}

export function convertInboxItemToResource(store, itemId) {
    const state = store.getState();
    const item = state.inboxItems.find(entry => entry.id === itemId);
    if (!item) {
        return null;
    }

    const resource = addResource(store, item.text);
    deleteInboxItem(store, itemId);
    return resource;
}

export function convertInboxItemToBreakdown(store, itemId) {
    const state = store.getState();
    const item = state.inboxItems.find(entry => entry.id === itemId);
    if (!item) {
        return null;
    }

    const task = {
        id: createTaskId(),
        text: item.text,
        weight: 20,
        isResource: false,
        completed: false,
        completedAtDate: null,
        storageStatus: TASK_STORAGE.ACTIVE,
        isArchived: false,
        targetDate: getLocalDateString(),
        breakdownParentId: null,
        breakdownChildIds: [],
        breakdownIndex: null,
        isBreakdownParent: false,
        isBreakdownStep: false,
        isHiddenFromMainList: false,
        showOnlyCurrentStep: false,
        isCurrentBreakdownStep: false,
    };

    store.updateState(nextState => {
        nextState.tasks.push(task);
        nextState.inboxItems = nextState.inboxItems.filter(entry => entry.id !== itemId);
    });

    return task;
}

export function getInboxSortDates(today = getLocalDateString()) {
    return Array.from({ length: 7 }, (_, index) => {
        const date = parseLocalDate(today);
        date.setDate(date.getDate() + index);
        return getLocalDateString(date);
    });
}
