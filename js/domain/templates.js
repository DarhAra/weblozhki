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

export function addAllTemplateTasksToDay(store, templateId) {
    const state = store.getState();
    const template = state.templates.find(item => item.id === templateId);
    if (!template) {
        return;
    }

    template.tasks.forEach(task => {
        addTask(store, {
            text: task.text,
            weight: task.weight,
            isResource: false,
        });
    });
}
