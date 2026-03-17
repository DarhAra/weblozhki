import { addTask } from './tasks.js';

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
