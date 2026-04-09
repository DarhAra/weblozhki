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
import {
    EASY_PATTERN_SCENARIOS,
    getEasyPatternMessage,
    getEasyPatternTrigger,
    previewEasyPatternScenario,
    shouldOfferEasyPattern,
} from '../domain/easy-pattern.js';
import { getInboxItems, getInboxSortDates } from '../domain/inbox.js';
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
        <div class="inline-edit-actions">
            ${weightSelectHtml}
            <button class="task-breakdown-btn" type="button" data-action="edit-save-task" data-task-id="${task.id}">Сохранить</button>
            <button class="text-btn inline-edit-cancel" type="button" data-action="edit-cancel-task" data-task-id="${task.id}">Отмена</button>
        </div>
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
    const copyButtonHtml = `
        <button class="task-copy-btn" title="Скопировать" data-action="open-copy-task" data-task-id="${task.id}">⧉</button>
    `;
    const taskMetaHtml = task.isBreakdownStep
        ? `<div class="task-meta">\u0428\u0430\u0433 ${(task.breakdownIndex ?? 0) + 1} \u0438\u0437 ${task.breakdownTotalSteps || 3}</div>`
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
        ${copyButtonHtml}
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

    function renderPersistenceStatus() {
        if (!elements.storageStatus) {
            return;
        }

        const status = runtime.persistenceStatus || store.getPersistenceStatus?.() || { mode: 'local-fallback' };
        const isServerMode = status.mode === 'server';
        const isOfflineAuthenticated = status.mode === 'offline-authenticated';
        elements.storageStatus.textContent = isServerMode
            ? 'Сохранение: сервер'
            : isOfflineAuthenticated
                ? 'Офлайн-режим'
                : 'Сохранение: локально';
        elements.storageStatus.classList.toggle('is-server', isServerMode);
        elements.storageStatus.classList.toggle('is-local', !isServerMode);
        elements.storageStatus.classList.toggle('is-offline', isOfflineAuthenticated);
        elements.storageStatus.title = status.message || (isServerMode
            ? 'Данные синхронизированы с сервером.'
            : 'Изменения пока сохраняются только на этом устройстве.');
    }

    function renderAuthScreen() {
        const auth = runtime.auth || {
            status: 'guest',
            mode: 'login',
            error: '',
            notice: '',
        };
        const isRegisterMode = auth.mode === 'register';
        const isResetMode = auth.mode === 'reset-password';
        const isChecking = auth.status === 'checking';
        const isSubmitting = auth.status === 'submitting';
        const isBusy = isChecking || isSubmitting;

        elements.authTitle.textContent = isResetMode
            ? 'Придумай новый пароль'
            : isRegisterMode
                ? 'Создать аккаунт'
                : 'Вход в аккаунт';
        elements.authSubtitle.textContent = isResetMode
            ? 'Ссылка уже открыта. Остаётся только задать новый пароль для своего аккаунта.'
            : isRegisterMode
                ? 'Полноценный аккаунт хранит твои личные данные, настройки и историю только для тебя.'
                : 'Войдите один раз, и приложение будет помнить ваш аккаунт между визитами.';
        elements.authLoading?.classList.toggle('hidden', !isChecking);
        elements.authModeSwitcher?.classList.toggle('hidden', isChecking || isResetMode);
        elements.authLoginModeBtn?.classList.toggle('is-active', !isRegisterMode && !isResetMode);
        elements.authRegisterModeBtn?.classList.toggle('is-active', isRegisterMode);
        elements.authNameField?.classList.toggle('hidden', !isRegisterMode);
        elements.authPasswordConfirmField?.classList.toggle('hidden', !isRegisterMode && !isResetMode);
        elements.authForgotPasswordBtn?.classList.toggle('hidden', isRegisterMode || isResetMode);
        if (elements.authName) {
            elements.authName.disabled = isBusy || !isRegisterMode;
            elements.authName.required = isRegisterMode;
        }
        if (elements.authEmail) {
            elements.authEmail.disabled = isBusy || isResetMode;
        }
        if (elements.authPassword) {
            elements.authPassword.disabled = isBusy;
            elements.authPassword.autocomplete = isRegisterMode || isResetMode ? 'new-password' : 'current-password';
        }
        if (elements.authPasswordConfirm) {
            elements.authPasswordConfirm.disabled = isBusy || (!isRegisterMode && !isResetMode);
            elements.authPasswordConfirm.required = isRegisterMode || isResetMode;
        }
        if (elements.authSubmitBtn) {
            elements.authSubmitBtn.disabled = isBusy;
        }
        elements.authSubmitBtn.textContent = isChecking
            ? 'Проверяем вход...'
            : isSubmitting
                ? (isResetMode
                    ? 'Сохраняем пароль...'
                    : isRegisterMode
                        ? 'Создаём аккаунт...'
                        : 'Входим...')
                : (isResetMode
                    ? 'Сохранить новый пароль'
                    : isRegisterMode
                        ? 'Создать аккаунт'
                        : 'Войти');
        if (elements.authNotice) {
            elements.authNotice.textContent = auth.notice || '';
            elements.authNotice.classList.toggle('hidden', !auth.notice);
        }
        if (elements.authError) {
            elements.authError.textContent = auth.error || '';
            elements.authError.classList.toggle('hidden', !auth.error);
        }
    }

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

    function renderInboxUi() {
        const inbox = runtime.inbox;
        const inboxItems = getInboxItems(store.getState());

        elements.inboxList.innerHTML = '';
        elements.inboxStatus.classList.add('hidden');
        elements.openInboxVoiceBtn.classList.remove('listening', 'processing', 'unsupported');

        if (!inbox.isSupported) {
            elements.openInboxVoiceBtn.classList.add('unsupported');
            elements.openInboxVoiceBtn.title = 'Голосовой ввод в Облако недоступен';
        } else if (inbox.isListening) {
            elements.openInboxVoiceBtn.classList.add('listening');
            elements.openInboxVoiceBtn.title = 'Остановить запись';
            elements.openInboxVoiceBtn.textContent = '🎙️';
            elements.inboxStatus.textContent = 'Я слушаю. Можно просто выгрузить поток мыслей.';
            elements.inboxStatus.classList.remove('hidden');
        } else if (inbox.isProcessing) {
            elements.openInboxVoiceBtn.classList.add('processing');
            elements.openInboxVoiceBtn.title = 'Собираю мысли в Облако';
            elements.openInboxVoiceBtn.textContent = '⏳';
            elements.inboxStatus.textContent = 'Собираю черновик мыслей...';
            elements.inboxStatus.classList.remove('hidden');
        } else {
            elements.openInboxVoiceBtn.textContent = '🎤';
            elements.openInboxVoiceBtn.title = 'Надиктовать в Облако';
            if (inbox.error) {
                elements.inboxStatus.textContent = inbox.error;
                elements.inboxStatus.classList.remove('hidden');
            }
        }

        elements.openInboxSortBtn.disabled = inboxItems.length === 0;
        elements.clearInboxBtn.disabled = inboxItems.length === 0;

        if (inboxItems.length === 0) {
            elements.inboxList.innerHTML = '';
            return;
        }

        inboxItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'inbox-item';

            const isPendingToday = inbox.pendingAction.itemId === item.id && inbox.pendingAction.mode === 'today';
            const isPendingWeek = inbox.pendingAction.itemId === item.id && inbox.pendingAction.mode === 'week';
            const todayActionHtml = isPendingToday
                ? `
                    <div class="inbox-action-config">
                        <select data-action="inbox-update-weight" data-inbox-id="${item.id}">
                            ${[5, 10, 20, 30, 50].map(weight => `<option value="${weight}" ${Number(inbox.pendingAction.weight) === weight ? 'selected' : ''}>${weight}</option>`).join('')}
                        </select>
                        <button class="task-breakdown-btn" type="button" data-action="inbox-confirm-today" data-inbox-id="${item.id}">Добавить</button>
                        <button class="text-btn" type="button" data-action="inbox-cancel-action" data-inbox-id="${item.id}">Отмена</button>
                    </div>
                `
                : '';
            const weekActionHtml = isPendingWeek
                ? `
                    <div class="inbox-action-config">
                        <select data-action="inbox-update-date" data-inbox-id="${item.id}">
                            ${getInboxSortDates().map(date => `<option value="${date}" ${inbox.pendingAction.date === date ? 'selected' : ''}>${formatVoiceDateLabel(date)}</option>`).join('')}
                        </select>
                        <select data-action="inbox-update-weight" data-inbox-id="${item.id}">
                            ${[5, 10, 20, 30, 50].map(weight => `<option value="${weight}" ${Number(inbox.pendingAction.weight) === weight ? 'selected' : ''}>${weight}</option>`).join('')}
                        </select>
                        <button class="task-breakdown-btn" type="button" data-action="inbox-confirm-week" data-inbox-id="${item.id}">Добавить</button>
                        <button class="text-btn" type="button" data-action="inbox-cancel-action" data-inbox-id="${item.id}">Отмена</button>
                    </div>
                `
                : '';

            card.innerHTML = `
                <div class="inbox-item-text">${escapeHtml(item.text)}</div>
                <div class="inbox-item-actions">
                    <button class="text-btn" type="button" data-action="inbox-open-today" data-inbox-id="${item.id}">На сегодня</button>
                    <button class="text-btn" type="button" data-action="inbox-open-week" data-inbox-id="${item.id}">В план</button>
                    <button class="text-btn" type="button" data-action="inbox-move-deferred" data-inbox-id="${item.id}">На потом</button>
                    <button class="text-btn" type="button" data-action="inbox-to-resource" data-inbox-id="${item.id}">В ресурсы</button>
                    <button class="text-btn" type="button" data-action="inbox-breakdown" data-inbox-id="${item.id}">Разбить</button>
                    <button class="delete-btn" title="Удалить" data-action="inbox-delete" data-inbox-id="${item.id}">&times;</button>
                </div>
                ${todayActionHtml}
                ${weekActionHtml}
            `;
            elements.inboxList.appendChild(card);
        });
    }

    function renderInboxVoiceModal() {
        const state = store.getState();
        const inbox = runtime.inbox;
        const isDraftMode = inbox.modalMode === 'draft' && inbox.drafts.length > 0;

        elements.inboxVoiceHelperAvatar.src = state.avatar;
        elements.inboxVoiceDraftList.innerHTML = '';
        elements.inboxVoiceEmptyState.classList.toggle('hidden', isDraftMode);
        elements.inboxVoiceConfirmBtn.classList.toggle('hidden', !isDraftMode);

        if (!isDraftMode) {
            elements.inboxVoiceModalTitle.textContent = 'Голос в Облако';
            elements.inboxVoiceModalSubtitle.textContent = inbox.error || 'Пока не получилось подготовить черновик мыслей.';
            elements.inboxVoiceEmptyState.textContent = inbox.error || 'Можно попробовать ещё раз или записать мысль текстом.';
            return;
        }

        elements.inboxVoiceModalTitle.textContent = 'Сохраняем в Облако?';
        elements.inboxVoiceModalSubtitle.textContent = 'Вот что я услышал. Можно спокойно поправить перед сохранением.';

        inbox.drafts.forEach(draft => {
            const row = document.createElement('div');
            row.className = 'voice-draft-item';
            row.innerHTML = `
                <input class="voice-draft-input" type="text" value="${escapeHtml(draft.text)}" data-action="inbox-voice-update-text" data-draft-id="${draft.id}">
                <div class="breakdown-draft-note">Мысль</div>
                <div class="breakdown-draft-spacer"></div>
                <button class="delete-btn" title="Удалить" data-action="inbox-voice-remove-draft" data-draft-id="${draft.id}">&times;</button>
            `;
            elements.inboxVoiceDraftList.appendChild(row);
        });
    }

    function renderInboxSortModal() {
        const inboxItems = getInboxItems(store.getState());
        const currentItem = inboxItems[0] || null;
        const inbox = runtime.inbox;

        if (!currentItem) {
            elements.inboxSortCard.innerHTML = '<div class="inbox-empty-state">Сейчас Облако пустое. Можно просто закрыть окно и вернуться позже.</div>';
            return;
        }

        const isPendingToday = inbox.pendingAction.itemId === currentItem.id && inbox.pendingAction.mode === 'today';
        const isPendingWeek = inbox.pendingAction.itemId === currentItem.id && inbox.pendingAction.mode === 'week';

        elements.inboxSortCard.innerHTML = `
            <div class="inbox-sort-text">${escapeHtml(currentItem.text)}</div>
            <div class="inbox-item-actions inbox-sort-actions">
                <button class="text-btn" type="button" data-action="inbox-open-today" data-inbox-id="${currentItem.id}">На сегодня</button>
                <button class="text-btn" type="button" data-action="inbox-open-week" data-inbox-id="${currentItem.id}">В план</button>
                <button class="text-btn" type="button" data-action="inbox-move-deferred" data-inbox-id="${currentItem.id}">На потом</button>
                <button class="text-btn" type="button" data-action="inbox-to-resource" data-inbox-id="${currentItem.id}">В ресурсы</button>
                <button class="text-btn" type="button" data-action="inbox-breakdown" data-inbox-id="${currentItem.id}">Разбить</button>
                <button class="delete-btn" title="Удалить" data-action="inbox-delete" data-inbox-id="${currentItem.id}">&times;</button>
            </div>
            ${isPendingToday ? `
                <div class="inbox-action-config">
                    <select data-action="inbox-update-weight" data-inbox-id="${currentItem.id}">
                        ${[5, 10, 20, 30, 50].map(weight => `<option value="${weight}" ${Number(inbox.pendingAction.weight) === weight ? 'selected' : ''}>${weight}</option>`).join('')}
                    </select>
                    <button class="task-breakdown-btn" type="button" data-action="inbox-confirm-today" data-inbox-id="${currentItem.id}">Добавить</button>
                    <button class="text-btn" type="button" data-action="inbox-cancel-action" data-inbox-id="${currentItem.id}">Отмена</button>
                </div>
            ` : ''}
            ${isPendingWeek ? `
                <div class="inbox-action-config">
                    <select data-action="inbox-update-date" data-inbox-id="${currentItem.id}">
                        ${getInboxSortDates().map(date => `<option value="${date}" ${inbox.pendingAction.date === date ? 'selected' : ''}>${formatVoiceDateLabel(date)}</option>`).join('')}
                    </select>
                    <select data-action="inbox-update-weight" data-inbox-id="${currentItem.id}">
                        ${[5, 10, 20, 30, 50].map(weight => `<option value="${weight}" ${Number(inbox.pendingAction.weight) === weight ? 'selected' : ''}>${weight}</option>`).join('')}
                    </select>
                    <button class="task-breakdown-btn" type="button" data-action="inbox-confirm-week" data-inbox-id="${currentItem.id}">Добавить</button>
                    <button class="text-btn" type="button" data-action="inbox-cancel-action" data-inbox-id="${currentItem.id}">Отмена</button>
                </div>
            ` : ''}
        `;
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

    function getEasyPatternScenarioLabel(scenario) {
        if (scenario === EASY_PATTERN_SCENARIOS.SIMPLIFY_DAY) {
            return '\u041e\u0431\u043b\u0435\u0433\u0447\u0438\u0442\u044c \u0434\u0435\u043d\u044c';
        }

        if (scenario === EASY_PATTERN_SCENARIOS.KEEP_MAIN) {
            return '\u041e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0433\u043b\u0430\u0432\u043d\u043e\u0435';
        }

        return '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0440\u0435\u0441\u0443\u0440\u0441';
    }

    function renderEasyPatternPanel(state, isSosView) {
        const today = getLocalDateString();
        const easyPattern = runtime.easyPattern || {};
        const trigger = easyPattern.trigger || getEasyPatternTrigger(state, today);
        const hasFeedback = Boolean(easyPattern.feedback);
        const canOfferPattern =
            !isSosView
            && !state.currentDayMeta?.lowEnergyDayApplied
            && shouldOfferEasyPattern(state, today);
        const shouldShow = hasFeedback || canOfferPattern;

        elements.easyPatternPanel.classList.toggle('hidden', !shouldShow);
        if (!shouldShow) {
            elements.easyPatternPanel.innerHTML = '';
            return { visible: false, message: '' };
        }

        if (hasFeedback) {
            elements.easyPatternPanel.innerHTML = `
                <div class="easy-pattern-card easy-pattern-card-feedback">
                    <div class="easy-pattern-actions">
                        <button class="secondary-btn easy-pattern-btn" type="button" data-action="easy-pattern-clear-feedback">\u0425\u043e\u0440\u043e\u0448\u043e</button>
                    </div>
                </div>
            `;
            return { visible: true, message: easyPattern.feedback };
        }

        const selectedScenario = easyPattern.selectedScenario || null;
        const preview = selectedScenario
            ? (easyPattern.preview || previewEasyPatternScenario(state, selectedScenario, today, {
                resourceId: easyPattern.resourceSuggestionId || null,
            }))
            : null;
        const resourcePreviewText = preview?.resource
            ? escapeHtml(preview.resource.text)
            : '\u0421\u0435\u0439\u0447\u0430\u0441 \u043d\u0435 \u043d\u0430\u0448\u043b\u043e\u0441\u044c \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0439 \u0440\u0430\u0434\u043e\u0441\u0442\u0438 \u0431\u0435\u0437 \u0434\u0443\u0431\u043b\u044f.';
        const selectionSummary = selectedScenario
            ? selectedScenario === EASY_PATTERN_SCENARIOS.ADD_RESOURCE
                ? `${getEasyPatternScenarioLabel(selectedScenario)}: ${resourcePreviewText}`
                : `${getEasyPatternScenarioLabel(selectedScenario)}: останется ${preview?.keepCount || 0}, перенесётся ${preview?.moveCount || 0}`
            : '';
        const helperMessage = getEasyPatternMessage(trigger);

        elements.easyPatternPanel.innerHTML = `
            <div class="easy-pattern-card">
                ${selectedScenario ? `<div class="easy-pattern-inline-note">${selectionSummary}</div>` : ''}
                ${selectedScenario ? `
                    <div class="easy-pattern-actions">
                        ${selectedScenario === EASY_PATTERN_SCENARIOS.ADD_RESOURCE ? `
                            <button class="secondary-btn easy-pattern-btn" type="button" data-action="easy-pattern-cycle-resource" ${preview?.isAvailable ? '' : 'disabled'}>\u0414\u0440\u0443\u0433\u043e\u0435</button>
                        ` : ''}
                        <button class="primary-btn easy-pattern-btn" type="button" data-action="easy-pattern-confirm" ${preview?.isAvailable ? '' : 'disabled'}>${selectedScenario === EASY_PATTERN_SCENARIOS.ADD_RESOURCE ? '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c' : '\u041f\u0440\u0438\u043c\u0435\u043d\u0438\u0442\u044c'}</button>
                        <button class="text-btn easy-pattern-text-btn" type="button" data-action="easy-pattern-back">\u041d\u0430\u0437\u0430\u0434</button>
                    </div>
                ` : `
                    <div class="easy-pattern-actions easy-pattern-actions-grid">
                        <button class="secondary-btn easy-pattern-btn" type="button" data-action="easy-pattern-select" data-scenario="${EASY_PATTERN_SCENARIOS.SIMPLIFY_DAY}">\u041e\u0431\u043b\u0435\u0433\u0447\u0438\u0442\u044c \u0434\u0435\u043d\u044c</button>
                        <button class="secondary-btn easy-pattern-btn" type="button" data-action="easy-pattern-select" data-scenario="${EASY_PATTERN_SCENARIOS.KEEP_MAIN}">\u041e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0433\u043b\u0430\u0432\u043d\u043e\u0435</button>
                        <button class="secondary-btn easy-pattern-btn" type="button" data-action="easy-pattern-select" data-scenario="${EASY_PATTERN_SCENARIOS.ADD_RESOURCE}">\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0440\u0435\u0441\u0443\u0440\u0441</button>
                        <button class="text-btn easy-pattern-text-btn" type="button" data-action="easy-pattern-dismiss">\u041d\u0435 \u0441\u0435\u0439\u0447\u0430\u0441</button>
                    </div>
                `}
            </div>
        `;
        return { visible: true, message: helperMessage };
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
        const easyPatternInfo = renderEasyPatternPanel(state, isSosView);
        renderInboxUi();
        renderPersistenceStatus();
        if (elements.offlineBanner) {
            const shouldShowOfflineBanner = runtime.persistenceStatus?.mode && runtime.persistenceStatus.mode !== 'server';
            elements.offlineBanner.textContent = runtime.persistenceStatus?.message || '';
            elements.offlineBanner.classList.toggle('hidden', !shouldShowOfflineBanner || !runtime.persistenceStatus?.message);
        }

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
        const shouldShowHelperStrip = usedEnergy > total || easyPatternInfo.visible;
        if (usedEnergy > total) {
            elements.progressBar.style.width = '100%';
            elements.progressBar.classList.add('overloaded');
        } else {
            elements.progressBar.style.width = `${percentage}%`;
            elements.progressBar.classList.remove('overloaded');
            const existingBtn = document.getElementById('add-break-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }
        elements.balanceMessageContainer.classList.toggle('hidden', !shouldShowHelperStrip);
        if (shouldShowHelperStrip) {
            elements.balanceMessage.textContent = easyPatternInfo.visible
                ? easyPatternInfo.message
                : 'Сегодня плотный график. Позаботься о себе.';
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
                <button class="task-copy-btn" title="Скопировать" data-action="open-copy-task" data-task-id="${task.id}">⧉</button>
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
                    <button class="task-copy-btn" title="Скопировать" data-action="open-copy-task" data-task-id="${task.id}">⧉</button>
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
                    <div class="weekly-task-actions">
                        <div class="weekly-task-weight">${task.weight}</div>
                        <button class="delete-btn weekly-task-delete-btn" title="Удалить задачу" data-action="weekly-delete-task" data-task-id="${task.id}">&times;</button>
                    </div>
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
        const sourceTask = parentTask || task || (breakdown.sourceText ? { text: breakdown.sourceText } : null);
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
                <div class="breakdown-draft-note">\u0428\u0430\u0433 ${(draft.index ?? 0) + 1} \u0438\u0437 ${breakdown.drafts.length || 3}</div>
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
        renderAuthScreen,
        renderMainScreen,
        renderPersistenceStatus,
        renderInboxUi,
        renderInboxVoiceModal,
        renderInboxSortModal,
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
