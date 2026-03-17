import { getLocalDateString, parseLocalDate } from '../utils/date.js';
import { createCurrentDayMeta } from './history.js';

export const TASK_STORAGE = {
    ACTIVE: 'active',
    DEFERRED: 'deferred',
    DONE: 'done',
};

export function getTaskStorageStatus(task) {
    if (task?.storageStatus === TASK_STORAGE.ACTIVE || task?.storageStatus === TASK_STORAGE.DEFERRED || task?.storageStatus === TASK_STORAGE.DONE) {
        return task.storageStatus;
    }

    if (task?.completedAtDate || (task?.completed && !task?.targetDate)) {
        return TASK_STORAGE.DONE;
    }

    if (task?.isArchived === true || task?.targetDate === null) {
        return TASK_STORAGE.DEFERRED;
    }

    return TASK_STORAGE.ACTIVE;
}

function setTaskStorageStatus(task, status) {
    task.storageStatus = status;
    task.isArchived = status === TASK_STORAGE.DEFERRED;
}

export function getOverdueTasks(state, today = getLocalDateString()) {
    return state.tasks.filter(task => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate && task.targetDate < today);
}

export function getTodayTasks(state, today = getLocalDateString()) {
    return state.tasks.filter(task => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today);
}

export function moveCompletedTodayTasksToDone(store, today = getLocalDateString()) {
    let movedCount = 0;
    store.updateState(state => {
        state.tasks.forEach(task => {
            if (getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && task.completed) {
                task.targetDate = null;
                task.archivedFromDate = today;
                task.completedAtDate = task.completedAtDate || today;
                task.completed = false;
                setTaskStorageStatus(task, TASK_STORAGE.DONE);
                movedCount += 1;
            }
        });
    });
    return movedCount;
}

export function getOpenRegularTodayTasks(state, today = getLocalDateString()) {
    return state.tasks.filter(task =>
        getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
        && task.targetDate === today
        && !task.completed
        && !task.isResource
    );
}

export function getDeferredTasks(state) {
    return state.tasks.filter(task => getTaskStorageStatus(task) === TASK_STORAGE.DEFERRED && !task.completed);
}

export function getDoneTasks(state) {
    return state.tasks.filter(task => getTaskStorageStatus(task) === TASK_STORAGE.DONE);
}

export function addTask(store, { text, weight, isResource, targetDate = null }) {
    const newTask = {
        id: `task_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        text,
        weight,
        isResource,
        completed: false,
        completedAtDate: null,
        storageStatus: TASK_STORAGE.ACTIVE,
        isArchived: false,
        targetDate: targetDate || getLocalDateString(),
    };

    store.updateState(state => {
        state.tasks.push(newTask);
    });

    return newTask;
}

export function toggleTask(store, taskId) {
    let updatedTask = null;
    store.updateState(state => {
        updatedTask = state.tasks.find(task => task.id === taskId) || null;
        if (updatedTask && getTaskStorageStatus(updatedTask) === TASK_STORAGE.ACTIVE) {
            updatedTask.completed = !updatedTask.completed;
            updatedTask.completedAtDate = updatedTask.completed ? getLocalDateString() : null;
        }
    });
    return updatedTask;
}

export function deleteTask(store, taskId) {
    store.updateState(state => {
        state.tasks = state.tasks.filter(task => task.id !== taskId);
    });
}

export function clearDeferredTasks(store) {
    let removedCount = 0;
    store.updateState(state => {
        state.tasks = state.tasks.filter(task => {
            const shouldKeep = getTaskStorageStatus(task) !== TASK_STORAGE.DEFERRED || task.completed;
            if (!shouldKeep) {
                removedCount += 1;
            }
            return shouldKeep;
        });
    });
    return removedCount;
}

export function clearDoneTasks(store) {
    let removedCount = 0;
    store.updateState(state => {
        state.tasks = state.tasks.filter(task => {
            const shouldKeep = getTaskStorageStatus(task) !== TASK_STORAGE.DONE;
            if (!shouldKeep) {
                removedCount += 1;
            }
            return shouldKeep;
        });
    });
    return removedCount;
}

export function postponeTask(store, taskId) {
    store.updateState(state => {
        const task = state.tasks.find(item => item.id === taskId);
        if (!task) return;

        const currentDate = parseLocalDate(task.targetDate || getLocalDateString());
        currentDate.setDate(currentDate.getDate() + 1);
        task.targetDate = getLocalDateString(currentDate);
    });
}

export function moveToToday(store, taskId) {
    store.updateState(state => {
        const task = state.tasks.find(item => item.id === taskId);
        if (task) {
            task.targetDate = getLocalDateString();
            setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
        }
    });
}

export function moveToDeferred(store, taskId) {
    store.updateState(state => {
        const task = state.tasks.find(item => item.id === taskId);
        if (task) {
            task.archivedFromDate = task.targetDate || getLocalDateString();
            task.targetDate = null;
            task.completed = false;
            setTaskStorageStatus(task, TASK_STORAGE.DEFERRED);
        }
    });
}

export function archiveRemainingOverdue(store, today = getLocalDateString()) {
    store.updateState(state => {
        state.tasks.forEach(task => {
            if (getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate && task.targetDate < today) {
                task.archivedFromDate = task.targetDate;
                task.targetDate = null;
                setTaskStorageStatus(task, TASK_STORAGE.DEFERRED);
            }
        });
    });
}

export function archiveOpenRegularTodayTasks(store, today = getLocalDateString()) {
    let movedCount = 0;
    store.updateState(state => {
        state.tasks.forEach(task => {
            if (getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && !task.completed && !task.isResource) {
                task.archivedFromDate = today;
                task.targetDate = null;
                setTaskStorageStatus(task, TASK_STORAGE.DEFERRED);
                movedCount += 1;
            }
        });
    });
    return movedCount;
}

export function moveOpenRegularTodayTasksToTomorrow(store, today = getLocalDateString()) {
    let movedCount = 0;
    const tomorrowDate = parseLocalDate(today);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = getLocalDateString(tomorrowDate);

    store.updateState(state => {
        state.tasks.forEach(task => {
            if (getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && !task.completed && !task.isResource) {
                task.targetDate = tomorrow;
                setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
                movedCount += 1;
            }
        });
    });

    return movedCount;
}

export function completePendingReview(store) {
    store.updateState(state => {
        state.pendingReviewDate = null;
        state.lastDate = getLocalDateString();
        state.energyBudget = null;
        state.currentDayMeta = createCurrentDayMeta(getLocalDateString());
    });
}

export function reorderTodayTasks(store, { isResource, newOrderIds, today = getLocalDateString() }) {
    store.updateState(state => {
        const currentTasks = state.tasks.filter(task =>
            getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
            && task.targetDate === today
            && task.isResource === isResource
        );
        currentTasks.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));

        const otherTasks = state.tasks.filter(task =>
            getTaskStorageStatus(task) !== TASK_STORAGE.ACTIVE
            || task.targetDate !== today
            || task.isResource !== isResource
        );
        state.tasks = [...otherTasks, ...currentTasks];
    });
}

export function moveTaskToDate(store, { taskId, dateStr }) {
    store.updateState(state => {
        const task = state.tasks.find(item => item.id === taskId);
        if (task) {
            task.targetDate = dateStr;
            setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
        }
    });
}

export function reorderWeeklyTasks(store, { dateStr, newOrderIds }) {
    store.updateState(state => {
        const dayTasks = state.tasks.filter(task =>
            getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
            && task.targetDate === dateStr
            && !task.completed
        );
        dayTasks.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));

        const otherTasks = state.tasks.filter(task =>
            getTaskStorageStatus(task) !== TASK_STORAGE.ACTIVE
            || task.targetDate !== dateStr
            || task.completed
        );
        state.tasks = [...otherTasks, ...dayTasks];
    });
}
