import { getLocalDateString } from '../utils/date.js';
import { closestActionTarget } from '../utils/dom.js';
import { createCurrentDayMeta } from '../domain/history.js';
import {
    addTask,
    archiveRemainingOverdue,
    archiveOpenRegularTodayTasks,
    clearDeferredTasks,
    clearDoneTasks,
    completePendingReview,
    deleteTask,
    getOverdueTasks,
    getOpenRegularTodayTasks,
    moveCompletedTodayTasksToDone,
    moveOpenRegularTodayTasksToTomorrow,
    moveTaskToDate,
    moveToDeferred,
    moveToToday,
    postponeTask,
    reorderTodayTasks,
    reorderWeeklyTasks,
    toggleTask,
} from '../domain/tasks.js';
import { addResource, addResourceToDay, deleteResource } from '../domain/resources.js';
import { addAllTemplateTasksToDay, addTemplateTaskToDay, changeTemplateTaskWeight } from '../domain/templates.js';
import { spawnHearts } from './renderers.js';

function getDragAfterElement(container, y, selector, draggingClass) {
    const draggableElements = [...container.querySelectorAll(`${selector}:not(.${draggingClass})`)];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function bindSubmitOnEnter(input, form) {
    input.addEventListener('keydown', event => {
        if (event.key !== 'Enter' || event.shiftKey) return;

        event.preventDefault();
        form.requestSubmit();
    });
}

export function bindAppEvents(app) {
    const { elements, store, runtime } = app;

    [
        elements.weeklyTaskModal,
        elements.libraryModal,
        elements.archiveModal,
        elements.completedModal,
        elements.templatesModal,
        elements.helperModal,
        elements.sosModal,
        elements.allDoneModal,
    ].forEach(modal => {
        modal.addEventListener('click', event => {
            if (event.target !== modal) return;
            modal.classList.add('hidden');
        });
    });

    bindSubmitOnEnter(elements.taskInput, elements.addTaskForm);
    bindSubmitOnEnter(elements.resourceInput, elements.addResourceForm);
    bindSubmitOnEnter(elements.weeklyTaskText, elements.addWeeklyTaskForm);

    elements.energyInput.addEventListener('input', event => {
        elements.energyDisplay.textContent = event.target.value;
    });

    elements.startDayBtn.addEventListener('click', () => {
        store.updateState(state => {
            state.energyBudget = parseInt(elements.energyInput.value, 10);
            state.lastDate = getLocalDateString();
            state.currentDayMeta = createCurrentDayMeta(state.lastDate);
        });
        runtime.sosView = null;
        app.screens.showMainScreen();
    });

    elements.addTaskForm.addEventListener('submit', event => {
        event.preventDefault();
        const text = elements.taskInput.value.trim();
        const weight = parseInt(elements.taskWeightSelect.value, 10);
        if (!text) return;

        addTask(store, { text, weight, isResource: false });
        elements.taskInput.value = '';
        app.screens.showMainScreen();
        if (!elements.weeklyScreen.classList.contains('hidden')) {
            app.renderers.renderWeeklyScreen();
        }
    });

    elements.allDoneCloseBtn.addEventListener('click', () => {
        moveCompletedTodayTasksToDone(store);
        elements.allDoneModal.classList.add('hidden');
        app.renderers.renderMainScreen();
        app.renderers.renderArchive();
        app.renderers.renderCompleted();
        app.renderers.renderWeeklyScreen();
    });

    elements.appHelperAvatar.addEventListener('click', () => {
        const state = store.getState();
        const allAdvices = [...runtime.builtinAdvices, ...state.resources.map(resource => resource.text)];
        let newAdvice = runtime.currentAdvice;

        if (allAdvices.length > 1) {
            while (newAdvice === runtime.currentAdvice) {
                newAdvice = allAdvices[Math.floor(Math.random() * allAdvices.length)];
            }
        } else {
            newAdvice = allAdvices[0] || '';
        }

        runtime.currentAdvice = newAdvice;
        elements.adviceAvatar.src = state.avatar;
        elements.adviceText.textContent = newAdvice;
        elements.helperModal.classList.remove('hidden');
    });

    elements.closeHelperBtn.addEventListener('click', () => {
        elements.helperModal.classList.add('hidden');
    });

    function closeSosModal() {
        elements.sosModal.classList.add('hidden');
    }

    function activateSosView(destination) {
        runtime.sosView = { active: true, destination };
        closeSosModal();
        app.renderers.renderMainScreen();
        app.renderers.renderArchive();
        app.renderers.renderCompleted();
        app.renderers.renderWeeklyScreen();
    }

    elements.adviceRefreshBtn.addEventListener('click', () => {
        elements.adviceText.style.opacity = 0;
        setTimeout(() => {
            elements.appHelperAvatar.click();
            elements.adviceText.style.opacity = 1;
        }, 200);
    });

    elements.adviceAddBtn.addEventListener('click', () => {
        if (!runtime.currentAdvice) return;

        addTask(store, { text: runtime.currentAdvice, weight: 0, isResource: true });
        app.renderers.renderMainScreen();

        const originalText = elements.adviceAddBtn.textContent;
        elements.adviceAddBtn.textContent = 'Добавлено ✓';
        elements.adviceAddBtn.style.backgroundColor = 'var(--primary-color)';
        elements.adviceAddBtn.style.color = 'white';

        setTimeout(() => {
            elements.adviceAddBtn.textContent = originalText;
            elements.adviceAddBtn.style.backgroundColor = '';
            elements.adviceAddBtn.style.color = '';
            elements.helperModal.classList.add('hidden');
        }, 1000);
    });

    elements.openLibraryBtn.addEventListener('click', () => {
        app.renderers.renderResources();
        elements.libraryModal.classList.remove('hidden');
    });

    elements.addSelfCareBtn.addEventListener('click', () => {
        app.renderers.renderResources();
        elements.libraryModal.classList.remove('hidden');
    });

    elements.closeLibraryBtn.addEventListener('click', () => {
        elements.libraryModal.classList.add('hidden');
    });

    elements.addResourceForm.addEventListener('submit', event => {
        event.preventDefault();
        const text = elements.resourceInput.value.trim();
        if (!text) return;

        addResource(store, text);
        elements.resourceInput.value = '';
        app.renderers.renderResources();
    });

    elements.openSosBtn.addEventListener('click', () => {
        const hasMovableTasks = getOpenRegularTodayTasks(store.getState()).length > 0;
        elements.sosArchiveBtn.disabled = !hasMovableTasks;
        elements.sosTomorrowBtn.disabled = !hasMovableTasks;
        elements.sosModal.classList.remove('hidden');
    });

    elements.closeSosBtn.addEventListener('click', closeSosModal);
    elements.sosCancelBtn.addEventListener('click', closeSosModal);

    elements.sosArchiveBtn.addEventListener('click', () => {
        store.updateState(state => {
            state.currentDayMeta = {
                date: getLocalDateString(),
                usedSos: true,
                sosDestination: 'deferred',
            };
        }, { save: false });
        archiveOpenRegularTodayTasks(store);
        activateSosView('deferred');
    });

    elements.sosTomorrowBtn.addEventListener('click', () => {
        store.updateState(state => {
            state.currentDayMeta = {
                date: getLocalDateString(),
                usedSos: true,
                sosDestination: 'tomorrow',
            };
        }, { save: false });
        moveOpenRegularTodayTasksToTomorrow(store);
        activateSosView('tomorrow');
    });

    elements.exitSosViewBtn.addEventListener('click', () => {
        runtime.sosView = null;
        app.renderers.renderMainScreen();
    });

    elements.openArchiveBtn.addEventListener('click', () => {
        app.renderers.renderArchive();
        elements.completedModal.classList.add('hidden');
        elements.archiveModal.classList.remove('hidden');
    });

    elements.openCompletedBtn.addEventListener('click', () => {
        app.renderers.renderCompleted();
        elements.archiveModal.classList.add('hidden');
        elements.completedModal.classList.remove('hidden');
    });

    elements.openHistoryBtn.addEventListener('click', () => {
        app.screens.showHistoryScreen();
    });

    elements.closeHistoryBtn.addEventListener('click', () => {
        app.screens.showMainScreen();
    });

    elements.closeArchiveBtn.addEventListener('click', () => {
        elements.archiveModal.classList.add('hidden');
    });

    elements.clearArchiveBtn.addEventListener('click', () => {
        const shouldClear = window.confirm('Очистить весь список «На потом»? Это удалит все отложенные задачи.');
        if (!shouldClear) return;

        clearDeferredTasks(store);
        app.renderers.renderArchive();
        app.renderers.renderMainScreen();
        app.renderers.renderWeeklyScreen();
    });

    elements.closeCompletedBtn.addEventListener('click', () => {
        elements.completedModal.classList.add('hidden');
    });

    elements.clearCompletedBtn.addEventListener('click', () => {
        const shouldClear = window.confirm('Очистить весь список «Сделано»? Это удалит все завершённые задачи из этого раздела.');
        if (!shouldClear) return;

        clearDoneTasks(store);
        app.renderers.renderCompleted();
    });

    elements.openWeeklyBtn.addEventListener('click', () => {
        app.screens.showWeeklyScreen();
    });

    elements.closeWeeklyBtn.addEventListener('click', () => {
        app.screens.showMainScreen();
    });

    elements.closeWeeklyTaskBtn.addEventListener('click', () => {
        elements.weeklyTaskModal.classList.add('hidden');
    });

    elements.addWeeklyTaskForm.addEventListener('submit', event => {
        event.preventDefault();
        const text = elements.weeklyTaskText.value.trim();
        const weight = parseInt(elements.weeklyTaskWeight.value, 10);
        if (!text || !runtime.currentWeeklyTaskDate) return;

        addTask(store, {
            text,
            weight,
            isResource: false,
            targetDate: runtime.currentWeeklyTaskDate,
        });

        elements.weeklyTaskText.value = '';
        elements.weeklyTaskModal.classList.add('hidden');
        app.renderers.renderWeeklyScreen();
    });

    elements.openTemplatesBtn.addEventListener('click', () => {
        app.renderers.renderTemplates();
        elements.templatesModal.classList.remove('hidden');
    });

    elements.closeTemplatesBtn.addEventListener('click', () => {
        elements.templatesModal.classList.add('hidden');
    });

    elements.finishReviewBtn.addEventListener('click', () => {
        archiveRemainingOverdue(store);
        completePendingReview(store);
        app.screens.showMorningScreen();
    });

    [elements.tasksList, elements.selfCareList].forEach(container => {
        container.addEventListener('click', event => {
            const target = closestActionTarget(event.target);
            if (!target) return;

            const taskId = target.dataset.taskId;
            if (!taskId) return;

            if (target.dataset.action === 'toggle-task') {
                const updatedTask = toggleTask(store, taskId);
                app.renderers.renderMainScreen();
                app.renderers.renderWeeklyScreen();

                if (updatedTask?.completed && updatedTask.isResource) {
                    elements.appHelperAvatar.classList.add('celebrate');
                    spawnHearts(elements.appHelperAvatar);
                    setTimeout(() => elements.appHelperAvatar.classList.remove('celebrate'), 800);
                }

                app.renderers.maybeShowAllDone(updatedTask);
            } else if (target.dataset.action === 'delete-task') {
                deleteTask(store, taskId);
                app.renderers.renderMainScreen();
                app.renderers.renderWeeklyScreen();
            } else if (target.dataset.action === 'move-to-deferred') {
                moveToDeferred(store, taskId);
                app.renderers.renderMainScreen();
                app.renderers.renderArchive();
                app.renderers.renderCompleted();
                app.renderers.renderWeeklyScreen();
            } else if (target.dataset.action === 'postpone-task') {
                postponeTask(store, taskId);
                app.renderers.renderMainScreen();
                app.renderers.renderWeeklyScreen();
            }
        });

        container.addEventListener('dragstart', event => {
            const task = event.target.closest('.task-item');
            if (!task) return;
            task.classList.add('dragging');
        });

        container.addEventListener('dragend', event => {
            const task = event.target.closest('.task-item');
            if (!task) return;
            task.classList.remove('dragging');
        });

        container.addEventListener('dragover', event => {
            event.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (!draggable) return;

            if (container === elements.selfCareList && !draggable.classList.contains('resource-item-drag')) return;
            if (container === elements.tasksList && draggable.classList.contains('resource-item-drag')) return;

            const afterElement = getDragAfterElement(container, event.clientY, '.task-item', 'dragging');
            if (!afterElement) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement);
            }
        });

        container.addEventListener('drop', event => {
            event.preventDefault();
            const newOrderIds = [...container.querySelectorAll('.task-item')].map(task => task.dataset.taskId);
            reorderTodayTasks(store, {
                isResource: container === elements.selfCareList,
                newOrderIds,
            });
            app.renderers.renderMainScreen();
        });
    });

    elements.reviewTasksList.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target) return;

        const taskId = target.dataset.taskId;
        if (!taskId) return;

        if (target.dataset.action === 'review-move-today') {
            moveToToday(store, taskId);
        } else if (target.dataset.action === 'review-move-deferred') {
            moveToDeferred(store, taskId);
        } else {
            return;
        }

        const overdue = getOverdueTasks(store.getState());
        if (overdue.length === 0) {
            completePendingReview(store);
            app.screens.showMorningScreen();
        } else {
            app.screens.showReviewScreen(overdue);
        }
    });

    elements.archiveList.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target) return;

        const taskId = target.dataset.taskId;
        if (!taskId) return;

        if (target.dataset.action === 'deferred-move-today') {
            moveToToday(store, taskId);
        } else if (target.dataset.action === 'deferred-delete-task') {
            deleteTask(store, taskId);
        } else {
            return;
        }

        app.renderers.renderArchive();
        app.renderers.renderMainScreen();
        app.renderers.renderWeeklyScreen();
    });

    elements.completedList.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target) return;

        const taskId = target.dataset.taskId;
        if (!taskId || target.dataset.action !== 'done-delete-task') return;

        deleteTask(store, taskId);
        app.renderers.renderCompleted();
    });

    elements.resourcesList.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target) return;

        const resourceId = target.dataset.resourceId;
        if (!resourceId) return;

        if (target.dataset.action === 'add-resource-to-day') {
            addResourceToDay(store, resourceId);
            app.renderers.renderMainScreen();

            const originalText = target.textContent;
            target.textContent = '✓';
            target.style.backgroundColor = 'var(--primary-color)';
            target.style.color = 'white';
            setTimeout(() => {
                target.textContent = originalText;
                target.style.backgroundColor = '';
                target.style.color = '';
            }, 1000);
        } else if (target.dataset.action === 'delete-resource') {
            deleteResource(store, resourceId);
            app.renderers.renderResources();
        }
    });

    elements.templatesContainer.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target) return;

        if (target.dataset.action === 'add-template-all') {
            addAllTemplateTasksToDay(store, target.dataset.templateId);
            elements.templatesModal.classList.add('hidden');
            app.renderers.renderMainScreen();
            return;
        }

        if (target.dataset.action === 'add-template-task') {
            addTemplateTaskToDay(store, {
                templateId: target.dataset.templateId,
                taskId: target.dataset.templateTaskId,
            });
            app.renderers.renderMainScreen();

            const originalText = target.textContent;
            target.textContent = '✓';
            target.style.backgroundColor = 'var(--primary-color)';
            target.style.color = 'white';
            setTimeout(() => {
                target.textContent = originalText;
                target.style.backgroundColor = '';
                target.style.color = '';
            }, 1000);
        }
    });

    elements.templatesContainer.addEventListener('change', event => {
        const target = event.target.closest('[data-action="change-template-weight"]');
        if (!target) return;

        changeTemplateTaskWeight(store, {
            templateId: target.dataset.templateId,
            taskId: target.dataset.templateTaskId,
            weight: target.value,
        });
    });

    elements.balanceMessageContainer.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target || target.dataset.action !== 'add-break') return;

        const state = store.getState();
        const suggestions = [...runtime.builtinAdvices, ...state.resources.map(resource => resource.text)];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        addTask(store, { text: suggestion, weight: 0, isResource: true });
        app.renderers.renderMainScreen();
    });

    elements.weeklyContainer.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target || target.dataset.action !== 'open-weekly-task-modal') return;

        runtime.currentWeeklyTaskDate = target.dataset.date;
        elements.weeklyTaskModal.classList.remove('hidden');
        elements.weeklyTaskText.focus();
    });

    elements.weeklyContainer.addEventListener('dragstart', event => {
        const task = event.target.closest('.weekly-task');
        if (!task) return;
        task.classList.add('weekly-dragging');
        event.dataTransfer?.setData('taskId', task.dataset.taskId);
    });

    elements.weeklyContainer.addEventListener('dragend', event => {
        const task = event.target.closest('.weekly-task');
        if (!task) return;
        task.classList.remove('weekly-dragging');
    });

    elements.weeklyContainer.addEventListener('dragover', event => {
        const container = event.target.closest('.weekly-col-tasks');
        if (!container) return;

        event.preventDefault();
        const draggable = document.querySelector('.weekly-dragging');
        if (!draggable) return;

        const afterElement = getDragAfterElement(container, event.clientY, '.weekly-task', 'weekly-dragging');
        if (!afterElement) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });

    elements.weeklyContainer.addEventListener('drop', event => {
        const container = event.target.closest('.weekly-col-tasks');
        if (!container) return;

        event.preventDefault();
        const draggable = document.querySelector('.weekly-dragging');
        if (!draggable) return;

        const dateStr = container.dataset.weeklyDate;
        moveTaskToDate(store, { taskId: draggable.dataset.taskId, dateStr });
        const newOrderIds = [...container.querySelectorAll('.weekly-task')].map(task => task.dataset.taskId);
        reorderWeeklyTasks(store, { dateStr, newOrderIds });
        app.renderers.renderWeeklyScreen();
        app.renderers.renderMainScreen();
    });
}
