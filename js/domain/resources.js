import { getLocalDateString } from '../utils/date.js';
import { getTaskStorageStatus, getTodayTasks, TASK_STORAGE } from './tasks.js';

export function addResource(store, text) {
    const resource = { id: `res_${Date.now()}`, text };
    store.updateState(state => {
        state.resources.push(resource);
    });
    return resource;
}

export function deleteResource(store, resourceId) {
    store.updateState(state => {
        state.resources = state.resources.filter(resource => resource.id !== resourceId);
    });
}

export function addResourceToDay(store, resourceId) {
    const state = store.getState();
    const resource = state.resources.find(item => item.id === resourceId);
    if (!resource) {
        return null;
    }

    return addTask(store, {
        text: resource.text,
        weight: 0,
        isResource: true,
    });
}

export function assignLowEnergyResource(store, { today = getLocalDateString(), cycle = false } = {}) {
    const state = store.getState();
    const currentDayMeta = state.currentDayMeta || {};
    const activeTodayResources = getTodayTasks(state, today).filter(task => task.isResource);
    const currentResourceTaskId = currentDayMeta.lowEnergyResourceTaskId || null;
    const currentResourceId = currentDayMeta.lowEnergyResourceId || null;
    const currentResourceTask = currentResourceTaskId
        ? activeTodayResources.find(task => task.id === currentResourceTaskId) || null
        : null;

    const busyResourceTexts = new Set(
        activeTodayResources
            .filter(task => task.id !== currentResourceTaskId)
            .map(task => task.text)
    );

    const availableResources = state.resources.filter(resource =>
        !busyResourceTexts.has(resource.text)
    );

    if (availableResources.length === 0) {
        return currentResourceTask || null;
    }

    let nextResource = null;
    if (cycle && currentResourceId) {
        const currentIndex = availableResources.findIndex(resource => resource.id === currentResourceId);
        const nextIndex = currentIndex === -1
            ? 0
            : (currentIndex + 1) % availableResources.length;
        nextResource = availableResources[nextIndex];
    } else {
        const pool = availableResources.filter(resource => resource.id !== currentResourceId);
        const selectionPool = pool.length > 0 ? pool : availableResources;
        nextResource = selectionPool[Math.floor(Math.random() * selectionPool.length)];
    }

    if (!nextResource) {
        return currentResourceTask || null;
    }

    let assignedTask = null;
    store.updateState(nextState => {
        const currentTask = currentResourceTaskId
            ? nextState.tasks.find(task =>
                task.id === currentResourceTaskId
                && getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
                && task.targetDate === today
                && task.isResource
            ) || null
            : null;

        if (currentTask) {
            currentTask.text = nextResource.text;
            assignedTask = currentTask;
        } else {
            assignedTask = {
                id: `task_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
                text: nextResource.text,
                weight: 0,
                isResource: true,
                completed: false,
                completedAtDate: null,
                storageStatus: TASK_STORAGE.ACTIVE,
                isArchived: false,
                targetDate: today,
            };
            nextState.tasks.push(assignedTask);
        }

        nextState.currentDayMeta = {
            ...nextState.currentDayMeta,
            date: today,
            lowEnergyDayApplied: true,
            lowEnergyResourceId: nextResource.id,
            lowEnergyResourceTaskId: assignedTask?.id || null,
        };
    }, { save: false });

    store.saveState();
    return assignedTask;
}
