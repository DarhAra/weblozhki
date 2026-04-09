import { getLocalDateString } from '../utils/date.js';
import { addResourceToDay } from './resources.js';
import { TASK_STORAGE, getOpenRegularTodayTasks, getTaskStorageStatus, getTodayTasks } from './tasks.js';

export const EASY_PATTERN_SCENARIOS = {
    SIMPLIFY_DAY: 'simplify-day',
    KEEP_MAIN: 'keep-main',
    ADD_RESOURCE: 'add-resource',
};

const NOTICEABLE_LOW_ENERGY_LOAD = 20;
const RESOURCE_SCENARIO = EASY_PATTERN_SCENARIOS.ADD_RESOURCE;

function isBreakdownParentHidden(task) {
    return Boolean(task?.isBreakdownParent && task?.isHiddenFromMainList);
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

function getSortedOpenRegularTodayTasks(state, today = getLocalDateString()) {
    const todayTaskIds = getOpenRegularTodayTasks(state, today).map(task => task.id);
    const taskOrder = new Map(todayTaskIds.map((id, index) => [id, index]));

    return [...getOpenRegularTodayTasks(state, today)].sort((left, right) => {
        const weightDiff = (left.weight || 0) - (right.weight || 0);
        if (weightDiff !== 0) {
            return weightDiff;
        }

        return (taskOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (taskOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER);
    });
}

function getTaskIdsToKeep(state, scenario, today = getLocalDateString()) {
    const sortedTasks = getSortedOpenRegularTodayTasks(state, today);
    if (sortedTasks.length === 0) {
        return [];
    }

    if (scenario === EASY_PATTERN_SCENARIOS.SIMPLIFY_DAY) {
        return sortedTasks.slice(0, sortedTasks.length >= 2 ? 2 : 1).map(task => task.id);
    }

    if (scenario === EASY_PATTERN_SCENARIOS.KEEP_MAIN) {
        return sortedTasks.slice(0, 3).map(task => task.id);
    }

    return [];
}

function getOpenRegularTodaySummary(state, today = getLocalDateString()) {
    const openTasks = getOpenRegularTodayTasks(state, today);
    const plannedWeight = openTasks.reduce((sum, task) => sum + (task.weight || 0), 0);

    return {
        openTasks,
        openCount: openTasks.length,
        plannedWeight,
    };
}

export function getEasyPatternTrigger(state, today = getLocalDateString()) {
    if (!state || state.lastDate !== today || state.energyBudget === null) {
        return null;
    }

    const currentDayMeta = state.currentDayMeta || {};
    if (currentDayMeta.date !== today) {
        return null;
    }

    if (currentDayMeta.easyPatternDismissed || currentDayMeta.easyPatternApplied || currentDayMeta.lowEnergyDayApplied) {
        return null;
    }

    const { openCount, plannedWeight } = getOpenRegularTodaySummary(state, today);
    if (openCount === 0) {
        return null;
    }

    if (plannedWeight > state.energyBudget) {
        return 'overload';
    }

    if (state.energyBudget <= 30 && plannedWeight >= NOTICEABLE_LOW_ENERGY_LOAD) {
        return 'low-energy';
    }

    return null;
}

export function shouldOfferEasyPattern(state, today = getLocalDateString()) {
    return Boolean(getEasyPatternTrigger(state, today));
}

export function getEasyPatternMessage(trigger) {
    if (trigger === 'low-energy') {
        return '\u041f\u043e\u0445\u043e\u0436\u0435, \u0441\u0438\u043b \u0441\u0435\u0433\u043e\u0434\u043d\u044f \u043d\u0435\u043c\u043d\u043e\u0433\u043e. \u041c\u043e\u0436\u043d\u043e \u043c\u044f\u0433\u043a\u043e \u0443\u043f\u0440\u043e\u0441\u0442\u0438\u0442\u044c \u0434\u0435\u043d\u044c, \u0447\u0442\u043e\u0431\u044b \u043e\u043d \u043d\u0435 \u0434\u0430\u0432\u0438\u043b.';
    }

    return '\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u043f\u043b\u0430\u043d \u0432\u044b\u0433\u043b\u044f\u0434\u0438\u0442 \u043f\u043b\u043e\u0442\u043d\u043e. \u0415\u0441\u043b\u0438 \u0445\u043e\u0447\u0435\u0448\u044c, \u044f \u043f\u043e\u043c\u043e\u0433\u0443 \u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u043b\u044c\u043a\u043e \u043f\u043e\u0441\u0438\u043b\u044c\u043d\u043e\u0435.';
}

export function getSuggestedEasyPatternResource(state, today = getLocalDateString(), currentResourceId = null) {
    if (!state || !Array.isArray(state.resources) || state.resources.length === 0) {
        return null;
    }

    const busyResourceTexts = new Set(
        getTodayTasks(state, today)
            .filter(task => task.isResource && getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE)
            .map(task => task.text)
    );

    const availableResources = state.resources.filter(resource => !busyResourceTexts.has(resource.text));
    if (availableResources.length === 0) {
        return null;
    }

    if (!currentResourceId) {
        return availableResources[0];
    }

    const currentIndex = availableResources.findIndex(resource => resource.id === currentResourceId);
    if (currentIndex === -1) {
        return availableResources[0];
    }

    return availableResources[(currentIndex + 1) % availableResources.length];
}

export function previewEasyPatternScenario(state, scenario, today = getLocalDateString(), options = {}) {
    if (scenario === RESOURCE_SCENARIO) {
        const resource = getSuggestedEasyPatternResource(state, today, options.resourceId || null);
        return {
            scenario,
            keepCount: 0,
            moveCount: 0,
            addCount: resource ? 1 : 0,
            resource,
            isAvailable: Boolean(resource),
        };
    }

    const openTasks = getOpenRegularTodayTasks(state, today);
    const keepIds = new Set(getTaskIdsToKeep(state, scenario, today));
    const keepCount = openTasks.filter(task => keepIds.has(task.id)).length;

    return {
        scenario,
        keepCount,
        moveCount: Math.max(openTasks.length - keepCount, 0),
        addCount: 0,
        resource: null,
        isAvailable: openTasks.length > 0,
    };
}

function markEasyPatternMeta(currentDayMeta, today, changes = {}) {
    return {
        ...currentDayMeta,
        date: today,
        ...changes,
    };
}

export function dismissEasyPattern(store, today = getLocalDateString(), trigger = null) {
    store.updateState(state => {
        state.currentDayMeta = markEasyPatternMeta(state.currentDayMeta, today, {
            easyPatternDismissed: true,
            easyPatternShown: true,
            easyPatternApplied: false,
            easyPatternLastTrigger: trigger || state.currentDayMeta?.easyPatternLastTrigger || null,
        });
    });
}

export function markEasyPatternShown(store, today = getLocalDateString(), trigger = null) {
    store.updateState(state => {
        state.currentDayMeta = markEasyPatternMeta(state.currentDayMeta, today, {
            easyPatternShown: true,
            easyPatternLastTrigger: trigger || state.currentDayMeta?.easyPatternLastTrigger || null,
        });
    });
}

export function applyEasyPatternScenario(store, scenario, today = getLocalDateString(), options = {}) {
    if (scenario === RESOURCE_SCENARIO) {
        const state = store.getState();
        const resource = getSuggestedEasyPatternResource(state, today, options.resourceId || null);
        if (!resource) {
            return null;
        }

        const createdTask = addResourceToDay(store, resource.id);
        store.updateState(stateAfterResource => {
            stateAfterResource.currentDayMeta = markEasyPatternMeta(stateAfterResource.currentDayMeta, today, {
                easyPatternApplied: true,
                easyPatternDismissed: true,
                easyPatternShown: true,
                easyPatternLastTrigger: options.trigger || stateAfterResource.currentDayMeta?.easyPatternLastTrigger || null,
            });
        });
        return {
            scenario,
            keptTaskIds: [],
            movedTaskIds: [],
            resourceId: resource.id,
            resourceTaskId: createdTask?.id || null,
        };
    }

    const keepIds = new Set(getTaskIdsToKeep(store.getState(), scenario, today));
    const movedTaskIds = [];

    store.updateState(state => {
        state.tasks.forEach(task => {
            const shouldMoveToDeferred =
                getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
                && task.targetDate === today
                && !task.completed
                && !task.isResource
                && !isBreakdownParentHidden(task)
                && !keepIds.has(task.id);

            if (!shouldMoveToDeferred) {
                return;
            }

            task.archivedFromDate = today;
            task.targetDate = null;
            task.completed = false;
            task.storageStatus = TASK_STORAGE.DEFERRED;
            task.isArchived = true;
            movedTaskIds.push(task.id);
        });

        refreshAllBreakdownGroups(state);
        state.currentDayMeta = markEasyPatternMeta(state.currentDayMeta, today, {
            easyPatternApplied: true,
            easyPatternDismissed: true,
            easyPatternShown: true,
            easyPatternLastTrigger: options.trigger || state.currentDayMeta?.easyPatternLastTrigger || null,
        });
    });

    return {
        scenario,
        keptTaskIds: [...keepIds],
        movedTaskIds,
        resourceId: null,
        resourceTaskId: null,
    };
}
