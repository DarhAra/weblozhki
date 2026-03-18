import { getLocalDateString } from '../utils/date.js';
import { escapeHtml } from '../utils/dom.js';
import {
    TASK_STORAGE,
    getDeferredTasks,
    getDoneTasks,
    getLowEnergySwapCandidates,
    getTaskBreakdownParent,
    getTaskStorageStatus,
    getTodayTasks,
    shouldShowBreakdownAction,
} from '../domain/tasks.js';
import { getMoodHistoryInsights, normalizeMoodHistory } from '../domain/history.js';

function genderText(state, male, female) {
    return state.gender === 'male' ? male : female;
}

export function spawnHearts(targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const hearts = ['❤', '💖', '💗'];

    for (let index = 0; index < 5; index += 1) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 30}px`;
        heart.style.top = `${rect.top + rect.height / 2}px`;
        heart.style.animationDelay = `${index * 0.1}s`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
    }
}

function formatDoneDate(date) {
    if (!date) {
        return 'Дата не указана';
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
    });
}

function renderInlineTaskEditor(task, editTaskState) {
    const isResource = task.isResource || editTaskState.isResource;
    const weightSelectHtml = isResource
        ? '<div class="inline-edit-spacer"></div>'
        : `
            <select class="inline-edit-weight" data-action="edit-update-weight" data-task-id="${task.id}">
                ${[5, 10, 20, 30, 50].map(weight => `<option value="${weight}" ${Number(editTaskState.weight) === weight ? 'selected' : ''}>${weight}</option>`).join('')}
            </select>
        `;

    return `
        <div class="task-main inline-edit-main">
            <input class="inline-edit-input" type="text" value="${escapeHtml(editTaskState.text)}" data-action="edit-update-text" data-task-id="${task.id}">
        </div>
        ${weightSelectHtml}
        <button class="task-breakdown-btn" type="button" data-action="edit-save-task" data-task-id="${task.id}">Сохранить</button>
        <button class="text-btn inline-edit-cancel" type="button" data-action="edit-cancel-task" data-task-id="${task.id}">Отмена</button>
    `;
}

function renderTaskElement(task, editTaskState = null) {
    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${task.completed ? 'completed' : ''} ${task.isResource ? 'resource-item-drag' : ''}`;
    taskEl.draggable = !editTaskState;
    taskEl.dataset.taskId = task.id;

    if (editTaskState) {
        taskEl.classList.add('editing');
        taskEl.innerHTML = renderInlineTaskEditor(task, editTaskState);
        return taskEl;
    }

    const weightClass = task.isResource ? 'resource-weight' : '';
    const weightLabel = task.isResource ? 'Ресурс' : `Вес: ${task.weight}`;
    const controlsHtml = !task.isResource && !task.completed
        ? `
            <button class="postpone-btn" title="На потом" data-action="move-to-deferred" data-task-id="${task.id}">📦</button>
            <button class="postpone-btn" title="На завтра" data-action="postpone-task" data-task-id="${task.id}">➡️</button>
        `
        : '';
    const breakdownButtonHtml = shouldShowBreakdownAction(task)
        ? `<button class="task-breakdown-btn" type="button" title="Разбить на шаги" data-action="open-breakdown" data-task-id="${task.id}">Разбить</button>`
        : '';
    const taskMetaHtml = task.isBreakdownStep
        ? `<div class="task-meta">Шаг ${(task.breakdownIndex ?? 0) + 1} из 3</div>`
        : '';

    taskEl.innerHTML = `
        <div class="task-checkbox-container" data-action="toggle-task" data-task-id="${task.id}">
            <div class="custom-checkbox"></div>
        </div>
        <div class="task-main">
            <div class="task-desc">${escapeHtml(task.text)}</div>
            ${taskMetaHtml}
        </div>
        <div class="task-weight ${weightClass}">${weightLabel}</div>
        ${breakdownButtonHtml}
        ${controlsHtml}
        <button class="delete-btn" title="Удалить" data-action="delete-task" data-task-id="${task.id}">&times;</button>
    `;

    return taskEl;
}

function formatMoodDate(date) {
    const parsedDate = new Date(`${date}T00:00:00`);
    return parsedDate.toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
    });
}

function formatVoiceDateLabel(date, today = getLocalDateString()) {
    if (date === today) {
        return 'Сегодня';
    }

    const tomorrow = new Date(`${today}T00:00:00`);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date === getLocalDateString(tomorrow)) {
        return 'Завтра';
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
    });
}

function buildMoodNote(entry) {
    if (entry.usedSos) {
        return entry.sosDestination === 'tomorrow'
            ? 'День пришлось облегчить, а оставшееся аккуратно перенесено на завтра.'
            : 'День пришлось мягко остановить, а оставшееся перенесено в раздел «На потом».';
    }

    if (entry.endedOverloaded) {
        return 'План был плотнее, чем запас сил на этот день. Это хороший сигнал планировать мягче.';
    }

    if (entry.completedRegularTasks === entry.plannedRegularTasks && entry.plannedRegularTasks > 0) {
        return 'Обычные дела на этот день удалось завершить спокойно и полностью.';
    }

    if (entry.resourceTasks > 0) {
        return 'В этом дне нашлось место не только для дел, но и для восстановления.';
    }

    return 'День прошёл без резких перегрузок. История постепенно собирает ваш ритм.';
}

export function createRenderers(app) {
    const { elements, store, runtime } = app;

    function renderVoiceUi() {
        const voice = runtime.voice;

        elements.openVoiceBtn.classList.remove('listening', 'processing', 'unsupported');
        elements.voiceStatus.classList.add('hidden');

        if (elements.addTaskForm.classList.contains('hidden')) {
            return;
        }

        if (!voice.isSupported) {
            elements.openVoiceBtn.classList.add('unsupported');
            elements.openVoiceBtn.title = 'Голосовой ввод недоступен';
            elements.openVoiceBtn.textContent = '🎤';
            if (voice.voiceError) {
                elements.voiceStatus.textContent = voice.voiceError;
                elements.voiceStatus.classList.remove('hidden');
            }
            return;
        }

        if (voice.isListening) {
            elements.openVoiceBtn.classList.add('listening');
            elements.openVoiceBtn.title = 'Остановить запись';
            elements.openVoiceBtn.textContent = '🎙️';
            elements.voiceStatus.textContent = 'Я слушаю. Можно говорить свободно.';
            elements.voiceStatus.classList.remove('hidden');
            return;
        }

        if (voice.isProcessing) {
            elements.openVoiceBtn.classList.add('processing');
            elements.openVoiceBtn.title = 'Обрабатываю голосовой черновик';
            elements.openVoiceBtn.textContent = '⏳';
            elements.voiceStatus.textContent = 'Собираю черновик задач...';
            elements.voiceStatus.classList.remove('hidden');
            return;
        }

        elements.openVoiceBtn.title = 'Добавить голосом';
        elements.openVoiceBtn.textContent = '🎤';
        if (voice.voiceError) {
            elements.voiceStatus.textContent = voice.voiceError;
            elements.voiceStatus.classList.remove('hidden');
        }
    }

    function renderReviewTasks(tasks) {
        elements.reviewTasksList.innerHTML = '';
        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            taskEl.innerHTML = `
                <div class="task-desc">${escapeHtml(task.text)}</div>
                <button class="postpone-btn" title="На сегодня" data-action="review-move-today" data-task-id="${task.id}">☀️На сегодня</button>
                <button class="postpone-btn" title="На потом" data-action="review-move-deferred" data-task-id="${task.id}">📦На потом</button>
            `;
            elements.reviewTasksList.appendChild(taskEl);
        });
    }

    function renderLowEnergyPanel(state, todayTasks, isSosView) {
        const isLowEnergyDay = state.currentDayMeta?.date === getLocalDateString() && state.currentDayMeta?.lowEnergyDayApplied;
        elements.lowEnergyDayPanel.classList.toggle('hidden', !isLowEnergyDay || isSosView);

        if (!isLowEnergyDay || isSosView) {
            elements.lowEnergyKeptCard.classList.add('hidden');
            elements.lowEnergyResourceCard.classList.add('hidden');
            return;
        }

        const keptTask = state.currentDayMeta.lowEnergyKeptTaskId
            ? todayTasks.find(task => task.id === state.currentDayMeta.lowEnergyKeptTaskId) || null
            : null;
        const resourceTask = state.currentDayMeta.lowEnergyResourceTaskId
            ? todayTasks.find(task => task.id === state.currentDayMeta.lowEnergyResourceTaskId) || null
            : null;
        const swapCandidates = getLowEnergySwapCandidates(state);

        elements.lowEnergyKeptCard.classList.toggle('hidden', !keptTask);
        elements.lowEnergyResourceCard.classList.toggle('hidden', !resourceTask);
        elements.openLowEnergySwapBtn.disabled = swapCandidates.length === 0;
        elements.changeLowEnergyResourceBtn.disabled = !resourceTask;

        if (keptTask) {
            elements.lowEnergyKeptText.textContent = keptTask.text;
        }

        if (resourceTask) {
            elements.lowEnergyResourceText.textContent = resourceTask.text;
        }
    }

    function renderMainScreen() {
        const state = store.getState();
        const todayTasks = getTodayTasks(state);
        const isSosView = Boolean(runtime.sosView?.active);
        const visibleTodayTasks = isSosView
            ? todayTasks.filter(task => task.isResource || task.completed)
            : todayTasks;

        elements.tasksList.innerHTML = '';
        elements.selfCareList.innerHTML = '';

        let usedEnergy = 0;
        visibleTodayTasks.forEach(task => {
            const editTaskState = runtime.editTask?.taskId === task.id ? runtime.editTask : null;
            const taskEl = renderTaskElement(task, editTaskState);
            if (task.isResource) {
                elements.selfCareList.appendChild(taskEl);
            } else {
                elements.tasksList.appendChild(taskEl);
            }

            if (!task.isResource && !task.completed) {
                usedEnergy += task.weight;
            }
        });

        if (!isSosView && elements.selfCareList.children.length === 0) {
            elements.selfCareList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 8px;">Добавьте ресурс из «Моих радостей» ☕</div>';
        }

        renderLowEnergyPanel(state, todayTasks, isSosView);

        elements.balanceSection.classList.toggle('hidden', isSosView);
        elements.addTaskForm.classList.toggle('hidden', isSosView);
        elements.openTemplatesBtn.classList.toggle('hidden', isSosView);
        elements.openSosBtn.classList.toggle('hidden', isSosView);
        elements.sosView.classList.toggle('hidden', !isSosView);
        elements.selfCareSlot.classList.toggle('hidden', isSosView && elements.selfCareList.children.length === 0);
        elements.tasksSection.classList.toggle('hidden', isSosView && elements.tasksList.children.length === 0);
        elements.tasksTitle.textContent = isSosView ? 'То, что уже осталось с тобой сегодня' : 'Задачи';

        if (isSosView) {
            elements.sosViewCaption.textContent = runtime.sosView.destination === 'tomorrow'
                ? 'Невыполненное уже перенесено на завтра.'
                : 'Невыполненное уже перенесено в «На потом».';

            const existingBtn = document.getElementById('add-break-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
            elements.balanceMessageContainer.classList.add('hidden');
            elements.voiceStatus.classList.add('hidden');
            renderVoiceUi();
            return;
        }

        const total = state.energyBudget || 1;
        elements.usedEnergyEl.textContent = usedEnergy;
        elements.totalEnergyEl.textContent = total;

        const percentage = Math.min((usedEnergy / total) * 100, 100);
        if (usedEnergy > total) {
            elements.progressBar.style.width = '100%';
            elements.progressBar.classList.add('overloaded');
            elements.balanceMessageContainer.classList.remove('hidden');
            elements.balanceMessage.innerHTML = 'Сегодня плотный график.<br>Позаботься о себе.';

            let addBreakBtn = document.getElementById('add-break-btn');
            if (!addBreakBtn) {
                addBreakBtn = document.createElement('button');
                addBreakBtn.id = 'add-break-btn';
                addBreakBtn.className = 'add-break-btn';
                addBreakBtn.textContent = '☕ Добавить паузу';
                addBreakBtn.dataset.action = 'add-break';
                elements.balanceMessageContainer.appendChild(addBreakBtn);
            }
        } else {
            elements.progressBar.style.width = `${percentage}%`;
            elements.progressBar.classList.remove('overloaded');
            elements.balanceMessageContainer.classList.add('hidden');
            const existingBtn = document.getElementById('add-break-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }

        renderVoiceUi();
    }

    function renderArchive() {
        const deferredTasks = getDeferredTasks(store.getState());
        elements.archiveList.innerHTML = '';

        if (deferredTasks.length === 0) {
            elements.archiveList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 16px;">Пока ничего не отложено</div>';
            return;
        }

        deferredTasks.forEach(task => {
            if (runtime.editTask?.taskId === task.id) {
                elements.archiveList.appendChild(renderTaskElement(task, runtime.editTask));
                return;
            }

            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            taskEl.dataset.taskId = task.id;
            const weightClass = task.isResource ? 'resource-weight' : '';
            const weightLabel = task.isResource ? 'Ресурс' : `Вес: ${task.weight}`;

            taskEl.innerHTML = `
                <div class="task-desc">${escapeHtml(task.text)}</div>
                <div class="task-weight ${weightClass}">${weightLabel}</div>
                <button class="postpone-btn" title="На сегодня" data-action="deferred-move-today" data-task-id="${task.id}">☀️</button>
                <button class="delete-btn" title="Удалить" data-action="deferred-delete-task" data-task-id="${task.id}">&times;</button>
            `;
            elements.archiveList.appendChild(taskEl);
        });
    }

    function renderCompleted() {
        const doneTasks = getDoneTasks(store.getState());
        elements.completedList.innerHTML = '';

        if (doneTasks.length === 0) {
            elements.completedList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 16px;">Пока здесь нет завершённых задач</div>';
            return;
        }

        doneTasks
            .sort((left, right) => (right.completedAtDate || '').localeCompare(left.completedAtDate || ''))
            .forEach(task => {
                if (runtime.editTask?.taskId === task.id) {
                    elements.completedList.appendChild(renderTaskElement(task, runtime.editTask));
                    return;
                }

                const taskEl = document.createElement('div');
                taskEl.className = 'task-item completed';
                taskEl.dataset.taskId = task.id;
                const weightLabel = task.isResource ? 'Ресурс' : `Вес: ${task.weight}`;

                taskEl.innerHTML = `
                    <div class="task-desc">
                        ${escapeHtml(task.text)}
                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Завершено: ${formatDoneDate(task.completedAtDate)}</div>
                    </div>
                    <div class="task-weight ${task.isResource ? 'resource-weight' : ''}">${weightLabel}</div>
                    <button class="delete-btn" title="Удалить" data-action="done-delete-task" data-task-id="${task.id}">&times;</button>
                `;
                elements.completedList.appendChild(taskEl);
            });
    }

    function renderWeeklyScreen() {
        const state = store.getState();
        const todayObj = new Date();
        elements.weeklyContainer.innerHTML = '';

        for (let index = 0; index < 7; index += 1) {
            const date = new Date(todayObj);
            date.setDate(date.getDate() + index);
            const dateStr = getLocalDateString(date);
            const isToday = index === 0;
            const title = `${date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}${isToday ? ' (Сегодня)' : ''}`;

            const dayTasks = state.tasks.filter(task =>
                getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE
                && task.targetDate === dateStr
                && !task.completed
            );
            const dayLoad = dayTasks.reduce((sum, task) => sum + (task.weight || 0), 0);
            const loadPercent = Math.min((dayLoad / 80) * 100, 100);
            const isOverloaded = dayLoad > 80;

            const col = document.createElement('div');
            col.className = 'weekly-col';
            col.innerHTML = `
                <div class="weekly-col-header">
                    <span>${title}</span>
                    <button class="add-weekly-task-icon-btn" title="Добавить задачу" data-action="open-weekly-task-modal" data-date="${dateStr}">+</button>
                </div>
                <div class="weekly-load-container">
                    <div class="weekly-load-bar ${isOverloaded ? 'overloaded' : ''}" style="width: ${loadPercent}%"></div>
                </div>
                ${isOverloaded ? `<div class="weekly-load-warning">⚠ Много тяжёлого (${dayLoad})</div>` : ''}
                <div class="weekly-col-tasks" data-weekly-date="${dateStr}"></div>
            `;

            const tasksContainer = col.querySelector('[data-weekly-date]');
            dayTasks.forEach(task => {
                if (runtime.editTask?.taskId === task.id) {
                    const taskEl = document.createElement('div');
                    taskEl.className = 'weekly-task editing';
                    taskEl.dataset.taskId = task.id;
                    taskEl.innerHTML = renderInlineTaskEditor(task, runtime.editTask);
                    tasksContainer.appendChild(taskEl);
                    return;
                }

                const taskEl = document.createElement('div');
                taskEl.className = 'weekly-task';
                taskEl.draggable = true;
                taskEl.dataset.taskId = task.id;
                taskEl.innerHTML = `
                    <div class="weekly-task-text">${escapeHtml(task.text)}</div>
                    <div class="weekly-task-weight">${task.weight}</div>
                `;
                tasksContainer.appendChild(taskEl);
            });

            elements.weeklyContainer.appendChild(col);
        }
    }

    function renderResources() {
        const { resources } = store.getState();
        elements.resourcesList.innerHTML = '';
        resources.forEach(resource => {
            const item = document.createElement('div');
            item.className = 'resource-item';
            item.innerHTML = `
                <button class="add-resource-to-day" data-action="add-resource-to-day" data-resource-id="${resource.id}">+</button>
                <div class="task-desc">${escapeHtml(resource.text)}</div>
                <button class="delete-btn" data-action="delete-resource" data-resource-id="${resource.id}">&times;</button>
            `;
            elements.resourcesList.appendChild(item);
        });
    }

    function renderTemplates() {
        const { templates } = store.getState();
        elements.templatesContainer.innerHTML = '';
        templates.forEach(template => {
            const dailyStatus = template.autoAddDaily ? 'Каждый день' : 'Только вручную';
            const toggleLabel = template.autoAddDaily
                ? 'Выключить ежедневность'
                : 'Включить каждый день';

            const block = document.createElement('div');
            block.className = 'template-block';
            block.innerHTML = `
                <div class="template-header">
                    <div class="template-title-group">
                        <h4>${escapeHtml(template.name)}</h4>
                        <div class="template-meta-row">
                            <span class="template-status-pill ${template.autoAddDaily ? 'is-active' : ''}">${dailyStatus}</span>
                            <button class="text-btn template-toggle-btn" type="button" data-action="toggle-template-daily" data-template-id="${template.id}">${toggleLabel}</button>
                        </div>
                    </div>
                    <button class="add-template-all-btn" data-action="add-template-all" data-template-id="${template.id}">+ Всё</button>
                </div>
                <div class="template-task-list"></div>
            `;

            const taskList = block.querySelector('.template-task-list');
            template.tasks.forEach(task => {
                const item = document.createElement('div');
                item.className = 'template-task-item';
                item.innerHTML = `
                    <div class="task-desc">${escapeHtml(task.text)}</div>
                    <select class="template-task-weight" data-action="change-template-weight" data-template-id="${template.id}" data-template-task-id="${task.id}">
                        ${[5, 10, 20, 30, 50].map(weight => `<option value="${weight}" ${task.weight === weight ? 'selected' : ''}>${weight}</option>`).join('')}
                    </select>
                    <button class="add-template-task-btn" data-action="add-template-task" data-template-id="${template.id}" data-template-task-id="${task.id}">+</button>
                `;
                taskList.appendChild(item);
            });

            elements.templatesContainer.appendChild(block);
        });
    }

    function renderLowEnergySwapModal() {
        const candidates = getLowEnergySwapCandidates(store.getState());
        elements.lowEnergySwapList.innerHTML = '';

        if (candidates.length === 0) {
            elements.lowEnergySwapList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 16px;">Пока нет других лёгких задач, которые можно вернуть на сегодня.</div>';
            return;
        }

        candidates.forEach(task => {
            const item = document.createElement('div');
            item.className = 'task-item';
            item.innerHTML = `
                <div class="task-desc">${escapeHtml(task.text)}</div>
                <div class="task-weight">Вес: ${task.weight}</div>
                <button class="postpone-btn" title="Оставить на сегодня" data-action="choose-low-energy-task" data-task-id="${task.id}">☀️</button>
            `;
            elements.lowEnergySwapList.appendChild(item);
        });
    }

    function renderVoiceModal() {
        const state = store.getState();
        const voice = runtime.voice;
        const isDraftMode = voice.modalMode === 'draft' && voice.voiceDraft.length > 0;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateOptions = [getLocalDateString(), getLocalDateString(tomorrow)];

        elements.voiceHelperAvatar.src = state.avatar;
        elements.voiceDraftList.innerHTML = '';
        elements.voiceEmptyState.classList.toggle('hidden', isDraftMode);
        elements.voiceConfirmBtn.classList.toggle('hidden', !isDraftMode);

        if (!isDraftMode) {
            elements.voiceModalTitle.textContent = 'Голосовой ввод';
            elements.voiceModalSubtitle.textContent = voice.voiceError || 'Пока не получилось подготовить черновик.';
            elements.voiceEmptyState.textContent = voice.voiceError || 'Можно попробовать ещё раз или добавить задачу текстом.';
            return;
        }

        elements.voiceModalTitle.textContent = 'Проверим, что получилось?';
        elements.voiceModalSubtitle.textContent = 'Вот что я записал. Можно спокойно поправить перед добавлением.';

        voice.voiceDraft.forEach(draft => {
            const row = document.createElement('div');
            row.className = 'voice-draft-item';
            row.innerHTML = `
                <input class="voice-draft-input" type="text" value="${escapeHtml(draft.text)}" data-action="voice-update-text" data-draft-id="${draft.id}">
                <select class="voice-draft-select" data-action="voice-update-weight" data-draft-id="${draft.id}">
                    ${[5, 10, 20, 30, 50].map(weight => `<option value="${weight}" ${draft.suggestedWeight === weight ? 'selected' : ''}>${weight}</option>`).join('')}
                </select>
                <select class="voice-draft-select" data-action="voice-update-date" data-draft-id="${draft.id}">
                    ${[draft.suggestedDate, ...dateOptions]
                        .filter((value, index, array) => array.indexOf(value) === index)
                        .map(date => `<option value="${date}" ${draft.suggestedDate === date ? 'selected' : ''}>${formatVoiceDateLabel(date)}</option>`)
                        .join('')}
                </select>
                <button class="delete-btn" title="Удалить" data-action="voice-remove-draft" data-draft-id="${draft.id}">&times;</button>
            `;
            elements.voiceDraftList.appendChild(row);
        });
    }

    function renderBreakdownEditorModal() {
        const { breakdown } = runtime;
        const state = store.getState();
        const task = breakdown.taskId
            ? state.tasks.find(item => item.id === breakdown.taskId)
            : null;
        const parentTask = task?.isBreakdownStep ? getTaskBreakdownParent(state, task) : null;
        const sourceTask = parentTask || task;
        const isSuggested = breakdown.mode === 'suggested';

        elements.breakdownDraftList.innerHTML = '';
        elements.breakdownEditorTitle.textContent = isSuggested ? 'Проверим маленькие шаги?' : 'Соберём три маленьких шага';
        elements.breakdownEditorSubtitle.textContent = sourceTask
            ? `Для задачи «${sourceTask.text}» оставим только три посильных шага по 5 или 10.`
            : 'Оставим только три посильных шага по 5 или 10.';

        breakdown.drafts.forEach(draft => {
            const row = document.createElement('div');
            row.className = 'voice-draft-item';
            row.innerHTML = `
                <input class="voice-draft-input" type="text" value="${escapeHtml(draft.text)}" data-action="breakdown-update-text" data-draft-id="${draft.id}">
                <select class="voice-draft-select" data-action="breakdown-update-weight" data-draft-id="${draft.id}">
                    ${[5, 10].map(weight => `<option value="${weight}" ${draft.weight === weight ? 'selected' : ''}>${weight}</option>`).join('')}
                </select>
                <div class="breakdown-draft-note">Шаг ${(draft.index ?? 0) + 1} из 3</div>
                <div class="breakdown-draft-spacer"></div>
            `;
            elements.breakdownDraftList.appendChild(row);
        });

        elements.breakdownConfirmBtn.disabled = breakdown.drafts.some(draft => !draft.text.trim());
    }

    function renderHistoryScreen() {
        const moodHistory = normalizeMoodHistory(store.getState().moodHistory);
        const insights = getMoodHistoryInsights(moodHistory);

        elements.historyInsights.innerHTML = '';
        insights.forEach(insight => {
            const item = document.createElement('div');
            item.className = 'history-insight-card';
            item.textContent = insight;
            elements.historyInsights.appendChild(item);
        });

        elements.historyList.innerHTML = '';
        if (moodHistory.length === 0) {
            elements.historyList.innerHTML = `
                <div class="history-empty-card">
                    <h3>История только начинается</h3>
                    <p>Первые записи появятся после нескольких завершённых дней. Мы не восстанавливаем старые дни задним числом, чтобы не показывать неточные данные.</p>
                </div>
            `;
            return;
        }

        moodHistory.forEach(entry => {
            const card = document.createElement('article');
            card.className = 'history-day-card';
            card.innerHTML = `
                <div class="history-day-header">
                    <h3>${formatMoodDate(entry.date)}</h3>
                    <span class="history-energy-pill">Энергия: ${entry.energyBudget}%</span>
                </div>
                <div class="history-day-metrics">
                    <div class="history-metric"><span>Обычные дела</span><strong>${entry.completedRegularTasks} / ${entry.plannedRegularTasks}</strong></div>
                    <div class="history-metric"><span>Вес задач</span><strong>${entry.completedWeight} / ${entry.plannedWeight}</strong></div>
                    <div class="history-metric"><span>Ресурсы</span><strong>${entry.resourceTasks}</strong></div>
                    <div class="history-metric"><span>Перегруз</span><strong>${entry.endedOverloaded ? 'Да' : 'Нет'}</strong></div>
                    <div class="history-metric"><span>SOS</span><strong>${entry.usedSos ? (entry.sosDestination === 'tomorrow' ? 'Был, на завтра' : 'Был, в «На потом»') : 'Не был'}</strong></div>
                </div>
                <p class="history-day-note">${buildMoodNote(entry)}</p>
            `;
            elements.historyList.appendChild(card);
        });
    }

    function maybeShowAllDone(lastUpdatedTask) {
        if (!lastUpdatedTask?.completed) {
            return;
        }

        const state = store.getState();
        const todayTasks = getTodayTasks(state);
        if (todayTasks.length === 0 || !todayTasks.every(task => task.completed)) {
            return;
        }

        const displayName = state.userName || '';
        const praises = [
            `${displayName}, ты справ${genderText(state, 'ился', 'илась')} со всеми делами! Теперь самое время сделать что-то приятное для себя.`,
            `Всё готово, ${displayName}! Я горжусь тобой. Остальное время — твоё.`,
            `${displayName}, какой продуктивный день! Теперь можно выдохнуть и порадовать себя.`,
        ];

        elements.allDoneAvatar.src = state.avatar;
        elements.allDoneText.textContent = praises[Math.floor(Math.random() * praises.length)];
        elements.allDoneModal.classList.remove('hidden');
        spawnHearts(elements.allDoneAvatar);
        setTimeout(() => spawnHearts(elements.allDoneAvatar), 300);
    }

    return {
        renderReviewTasks,
        renderMainScreen,
        renderArchive,
        renderCompleted,
        renderHistoryScreen,
        renderWeeklyScreen,
        renderResources,
        renderTemplates,
        renderLowEnergySwapModal,
        renderBreakdownEditorModal,
        renderVoiceModal,
        maybeShowAllDone,
    };
}
