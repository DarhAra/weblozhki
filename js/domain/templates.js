import { getLocalDateString } from '../utils/date.js';
import { addTask } from './tasks.js';

export function changeTemplateTaskWeight(store, { templateId, taskId, weight }) {
    store.updateState(state => {
        const template = state.templates.find(item => item.id === templateId);
        const task = template?.tasks.find(item => item.id === taskId);
        if (task) {
            task.weight = parseInt(weight, 10);
        }
    });
}

export function addTemplateTaskToDay(store, { templateId, taskId }) {
    const state = store.getState();
    const template = state.templates.find(item => item.id === templateId);
    const task = template?.tasks.find(item => item.id === taskId);
    if (!task) {
        return null;
    }

    return addTask(store, {
        text: task.text,
        weight: task.weight,
        isResource: false,
    });
}

export function addAllTemplateTasksToDay(store, templateId, targetDate = getLocalDateString()) {
    const state = store.getState();
    const template = state.templates.find(item => item.id === templateId);
    if (!template) {
        return { template: null, addedCount: 0 };
    }

    let addedCount = 0;
    template.tasks.forEach(task => {
        addTask(store, {
            text: task.text,
            weight: task.weight,
            isResource: false,
            targetDate,
        });
        addedCount += 1;
    });

    return { template, addedCount };
}

export function setTemplateDailyPreference(store, {
    templateId,
    autoAddDaily,
    hasAskedAutoAdd = true,
    lastAutoAddedDate = null,
}) {
    let updatedTemplate = null;

    store.updateState(state => {
        const template = state.templates.find(item => item.id === templateId);
        if (!template) return;

        template.autoAddDaily = autoAddDaily;
        template.hasAskedAutoAdd = hasAskedAutoAdd;
        template.lastAutoAddedDate = autoAddDaily ? lastAutoAddedDate : null;
        updatedTemplate = { ...template };
    });

    return updatedTemplate;
}

export function applyDailyTemplatesForDate(store, date = getLocalDateString()) {
    const templatesToApply = store.getState().templates.filter(template =>
        template.autoAddDaily
        && template.lastAutoAddedDate !== date
        && Array.isArray(template.tasks)
        && template.tasks.length > 0
    );

    if (templatesToApply.length === 0) {
        return [];
    }

    templatesToApply.forEach(template => {
        addAllTemplateTasksToDay(store, template.id, date);
    });

    store.updateState(state => {
        state.templates.forEach(template => {
            if (templatesToApply.some(item => item.id === template.id)) {
                template.lastAutoAddedDate = date;
            }
        });
    });

    return templatesToApply.map(template => template.id);
}
