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

function isBreakdownParentHidden(task) {
    return Boolean(task?.isBreakdownParent && task?.isHiddenFromMainList);
}

function isVisibleBreakdownStep(task, state) {
    if (!task?.isBreakdownStep) {
        return true;
    }

    if (!task.showOnlyCurrentStep) {
        return true;
    }

    const parentTask = task.breakdownParentId
        ? state.tasks.find(item => item.id === task.breakdownParentId)
        : null;

    if (!parentTask) {
        return task.isCurrentBreakdownStep !== false;
    }

    return parentTask.breakdownChildIds
        .map(id => state.tasks.find(item => item.id === id))
        .filter(Boolean)
        .find(step => !step.completed)?.id === task.id;
}

function isTaskVisibleOnMainList(task, state) {
    if (isBreakdownParentHidden(task)) {
        return false;
    }

    return isVisibleBreakdownStep(task, state);
}

export function getOverdueTasks(state, today = getLocalDateString()) {
    return state.tasks.filter(task =>
        getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
        && task.targetDate
        && task.targetDate < today
        && !isBreakdownParentHidden(task)
    );
}

export function getTodayTasks(state, today = getLocalDateString()) {
    return state.tasks.filter(task =>
        getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
        && task.targetDate === today
        && isTaskVisibleOnMainList(task, state)
    );
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
        && !isBreakdownParentHidden(task)
    );
}

function getLightTaskToKeep(state, today = getLocalDateString()) {
    let selectedTask = null;

    state.tasks.forEach(task => {
        const isLightCandidate =
            getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
            && task.targetDate === today
            && !task.completed
            && !task.isResource
            && !isBreakdownParentHidden(task)
            && (task.weight || 0) <= 10;

        if (!isLightCandidate) {
            return;
        }

        if (!selectedTask || (task.weight || 0) < (selectedTask.weight || 0)) {
            selectedTask = task;
        }
    });

    return selectedTask;
}

export function getLowEnergySwapCandidates(state, today = getLocalDateString()) {
    return state.tasks.filter(task =>
        getTaskStorageStatus(task) === TASK_STORAGE.DEFERRED
        && task.archivedFromDate === today
        && !task.completed
        && !task.isResource
        && (task.weight || 0) <= 10
    );
}

export function applyLowEnergyDay(store, today = getLocalDateString()) {
    let keptTaskId = null;

    store.updateState(state => {
        const taskToKeep = getLightTaskToKeep(state, today);
        keptTaskId = taskToKeep?.id || null;

        state.tasks.forEach(task => {
            const shouldMoveToDeferred =
                getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
                && task.targetDate === today
                && !task.completed
                && !task.isResource
                && !isBreakdownParentHidden(task)
                && task.id !== keptTaskId;

            if (!shouldMoveToDeferred) {
                return;
            }

            task.archivedFromDate = today;
            task.targetDate = null;
            setTaskStorageStatus(task, TASK_STORAGE.DEFERRED);
        });

        state.currentDayMeta = {
            ...state.currentDayMeta,
            date: today,
            lowEnergyPromptHandled: true,
            lowEnergyDayApplied: true,
            lowEnergyKeptTaskId: keptTaskId,
        };
    });

    return keptTaskId;
}

export function swapLowEnergyKeptTask(store, { nextTaskId, today = getLocalDateString() }) {
    let swappedTask = null;

    store.updateState(state => {
        const currentKeptTaskId = state.currentDayMeta?.lowEnergyKeptTaskId || null;
        const currentKeptTask = currentKeptTaskId
            ? state.tasks.find(task => task.id === currentKeptTaskId)
            : null;
        const nextTask = state.tasks.find(task => task.id === nextTaskId);

        const canSwapToNext =
            nextTask
            && getTaskStorageStatus(nextTask) === TASK_STORAGE.DEFERRED
            && nextTask.archivedFromDate === today
            && !nextTask.completed
            && !nextTask.isResource
            && (nextTask.weight || 0) <= 10;

        if (!canSwapToNext) {
            return;
        }

        if (currentKeptTask && getTaskStorageStatus(currentKeptTask) === TASK_STORAGE.ACTIVE && currentKeptTask.targetDate === today) {
            currentKeptTask.archivedFromDate = today;
            currentKeptTask.targetDate = null;
            setTaskStorageStatus(currentKeptTask, TASK_STORAGE.DEFERRED);
        }

        nextTask.targetDate = today;
        setTaskStorageStatus(nextTask, TASK_STORAGE.ACTIVE);
        state.currentDayMeta = {
            ...state.currentDayMeta,
            date: today,
            lowEnergyDayApplied: true,
            lowEnergyKeptTaskId: nextTask.id,
        };
        swappedTask = nextTask;
    });

    return swappedTask;
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
        breakdownParentId: null,
        breakdownChildIds: [],
        breakdownIndex: null,
        isBreakdownParent: false,
        isBreakdownStep: false,
        isHiddenFromMainList: false,
        showOnlyCurrentStep: false,
        isCurrentBreakdownStep: false,
    };

    store.updateState(state => {
        state.tasks.push(newTask);
    });

    return newTask;
}

function refreshBreakdownGroup(parentTask, state) {
    if (!parentTask?.isBreakdownParent || !Array.isArray(parentTask.breakdownChildIds)) {
        return;
    }

    let currentVisibleStepId = null;
    parentTask.breakdownChildIds.forEach(childId => {
        const childTask = state.tasks.find(task => task.id === childId);
        if (!childTask) return;

        const isEligibleCurrentStep =
            !childTask.completed
            && getTaskStorageStatus(childTask) === TASK_STORAGE.ACTIVE;

        if (!isEligibleCurrentStep || currentVisibleStepId) {
            childTask.isCurrentBreakdownStep = false;
            return;
        }

        childTask.isCurrentBreakdownStep = true;
        currentVisibleStepId = childTask.id;
    });
}

function refreshAllBreakdownGroups(state) {
    state.tasks
        .filter(task => task.isBreakdownParent)
        .forEach(parentTask => refreshBreakdownGroup(parentTask, state));
}

export function getTaskBreakdownParent(state, task) {
    if (!task?.breakdownParentId) {
        return null;
    }

    return state.tasks.find(item => item.id === task.breakdownParentId) || null;
}

export function shouldShowBreakdownAction(task) {
    return getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
        && !task.completed
        && !task.isResource
        && !task.isBreakdownParent
        && !task.isBreakdownStep
        && !task.isHiddenFromMainList
        && (task.weight || 0) >= 20;
}

export function createTaskBreakdown(store, { taskId, steps }) {
    let parentTask = null;

    store.updateState(state => {
        const task = state.tasks.find(item => item.id === taskId);
        if (!task || !shouldShowBreakdownAction(task) || !Array.isArray(steps) || steps.length !== 3) {
            return;
        }

        const sanitizedSteps = steps.map((step, index) => ({
            id: `task_${Date.now()}_${index}_${Math.floor(Math.random() * 1000000)}`,
            text: String(step.text || '').trim(),
            weight: step.weight === 10 ? 10 : 5,
        }));

        if (sanitizedSteps.some(step => !step.text)) {
            return;
        }

        task.isBreakdownParent = true;
        task.isHiddenFromMainList = true;
        task.showOnlyCurrentStep = true;
        task.breakdownChildIds = sanitizedSteps.map(step => step.id);

        sanitizedSteps.forEach((step, index) => {
            state.tasks.push({
                id: step.id,
                text: step.text,
                weight: step.weight,
                isResource: false,
                completed: false,
                completedAtDate: null,
                storageStatus: TASK_STORAGE.ACTIVE,
                isArchived: false,
                targetDate: task.targetDate,
                breakdownParentId: task.id,
                breakdownChildIds: [],
                breakdownIndex: index,
                isBreakdownParent: false,
                isBreakdownStep: true,
                isHiddenFromMainList: false,
                showOnlyCurrentStep: true,
                isCurrentBreakdownStep: index === 0,
            });
        });

        refreshBreakdownGroup(task, state);
        parentTask = task;
    });

    return parentTask;
}

export function advanceBreakdownAfterCompletion(store, taskId) {
    let nextStepId = null;

    store.updateState(state => {
        const completedTask = state.tasks.find(task => task.id === taskId);
        if (!completedTask?.isBreakdownStep || !completedTask.breakdownParentId) {
            return;
        }

        const parentTask = state.tasks.find(task => task.id === completedTask.breakdownParentId);
        if (!parentTask) {
            return;
        }

        refreshBreakdownGroup(parentTask, state);
        const nextVisibleStep = parentTask.breakdownChildIds
            .map(id => state.tasks.find(task => task.id === id))
            .filter(Boolean)
            .find(step => !step.completed && getTaskStorageStatus(step) === TASK_STORAGE.ACTIVE);

        nextStepId = nextVisibleStep?.id || null;
    });

    return nextStepId;
}

export function toggleTask(store, taskId) {
    let updatedTask = null;
    store.updateState(state => {
        updatedTask = state.tasks.find(task => task.id === taskId) || null;
        if (updatedTask && getTaskStorageStatus(updatedTask) === TASK_STORAGE.ACTIVE) {
            updatedTask.completed = !updatedTask.completed;
            updatedTask.completedAtDate = updatedTask.completed ? getLocalDateString() : null;
            if (updatedTask.isBreakdownStep && updatedTask.breakdownParentId) {
                const parentTask = state.tasks.find(task => task.id === updatedTask.breakdownParentId);
                refreshBreakdownGroup(parentTask, state);
            }
        }
    });
    return updatedTask;
}

export function deleteTask(store, taskId) {
    store.updateState(state => {
        const taskToDelete = state.tasks.find(task => task.id === taskId);
        state.tasks = state.tasks.filter(task => task.id !== taskId);

        if (taskToDelete?.isBreakdownStep && taskToDelete.breakdownParentId) {
            const parentTask = state.tasks.find(task => task.id === taskToDelete.breakdownParentId);
            if (parentTask) {
                parentTask.breakdownChildIds = parentTask.breakdownChildIds.filter(id => id !== taskId);
                refreshBreakdownGroup(parentTask, state);
            }
        }
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
        if (task.isBreakdownStep && task.breakdownParentId) {
            const parentTask = state.tasks.find(item => item.id === task.breakdownParentId);
            refreshBreakdownGroup(parentTask, state);
        }
    });
}

export function moveToToday(store, taskId) {
    store.updateState(state => {
        const task = state.tasks.find(item => item.id === taskId);
        if (task) {
            task.targetDate = getLocalDateString();
            setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
            if (task.isBreakdownStep && task.breakdownParentId) {
                const parentTask = state.tasks.find(item => item.id === task.breakdownParentId);
                refreshBreakdownGroup(parentTask, state);
            }
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
            if (task.isBreakdownStep && task.breakdownParentId) {
                const parentTask = state.tasks.find(item => item.id === task.breakdownParentId);
                refreshBreakdownGroup(parentTask, state);
            }
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
                if (isBreakdownParentHidden(task)) {
                    return;
                }
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
                if (isBreakdownParentHidden(task)) {
                    return;
                }
                task.targetDate = tomorrow;
                setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
                movedCount += 1;
            }
        });

        refreshAllBreakdownGroups(state);
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
            && !isBreakdownParentHidden(task)
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
            if (task.isBreakdownStep && task.breakdownParentId) {
                const parentTask = state.tasks.find(item => item.id === task.breakdownParentId);
                refreshBreakdownGroup(parentTask, state);
            }
        }
    });
}

export function reorderWeeklyTasks(store, { dateStr, newOrderIds }) {
    store.updateState(state => {
        const dayTasks = state.tasks.filter(task =>
            getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
            && task.targetDate === dateStr
            && !task.completed
            && !isBreakdownParentHidden(task)
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
