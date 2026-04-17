import { getLocalDateString } from '../utils/date.js';
import { closestActionTarget } from '../utils/dom.js';
import { createCurrentDayMeta } from '../domain/history.js';
import { parseInboxTranscript, parseVoiceTranscript } from '../domain/voice-parser.js';
import {
    addInboxItems,
    clearInboxItems,
    convertInboxItemToDate,
    convertInboxItemToDeferred,
    convertInboxItemToResource,
    convertInboxItemToToday,
    deleteInboxItem,
    splitInboxText,
} from '../domain/inbox.js';
import {
    addTask,
    advanceBreakdownAfterCompletion,
    applyLowEnergyDay,
    archiveRemainingOverdue,
    archiveOpenRegularTodayTasks,
    clearDeferredTasks,
    clearDoneTasks,
    completePendingReview,
    copyTaskToDate,
    createTaskBreakdown,
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
    swapLowEnergyKeptTask,
    toggleTask,
    updateTask,
} from '../domain/tasks.js';
import { addResource, addResourceToDay, assignLowEnergyResource, deleteResource } from '../domain/resources.js';
import {
    EASY_PATTERN_SCENARIOS,
    applyEasyPatternScenario,
    dismissEasyPattern,
    getEasyPatternTrigger,
    getSuggestedEasyPatternResource,
    markEasyPatternShown,
    previewEasyPatternScenario,
    shouldOfferEasyPattern,
} from '../domain/easy-pattern.js';
import {
    addAllTemplateTasksToDay,
    addTemplateTaskToDay,
    applyDailyTemplatesForDate,
    changeTemplateTaskWeight,
    setTemplateDailyPreference,
} from '../domain/templates.js';
import { createVoiceInputService } from '../services/voice-input.js';
import { clearOfflineAuthSnapshot } from '../services/offline-auth.js';
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

function createBreakdownDraft(text = '', weight = 5, index = 0) {
    return {
        id: `breakdown_draft_${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`,
        text,
        weight: weight === 10 ? 10 : 5,
        index,
    };
}

function buildManualBreakdownDrafts() {
    return [0, 1, 2].map(index => createBreakdownDraft('', 5, index));
}

function capitalizeBreakdownStep(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function looksLikeActionPhrase(text) {
    const firstWord = String(text || '').trim().split(/\s+/)[0] || '';
    return ['\u0442\u044c', '\u0442\u0438', '\u0447\u044c'].some(ending => firstWord.toLowerCase().endsWith(ending));
}

function splitCompoundTaskText(taskText) {
    const normalized = String(taskText || '').trim();
    const directParts = normalized
        .split(/[\n,;]+/)
        .map(part => part.trim())
        .filter(Boolean);
    if (directParts.length > 1) {
        return directParts;
    }
    const andParts = normalized
        .split(/\s+?\s+/i)
        .map(part => part.trim())
        .filter(Boolean);
    if (andParts.length > 1 && andParts.every(looksLikeActionPhrase)) {
        return andParts;
    }
    return [normalized];
}
function buildCompactSuggestedBreakdownDrafts(taskText) {
    const normalized = String(taskText || '').trim();
    const lower = normalized.toLowerCase();
    const compoundParts = splitCompoundTaskText(normalized);
    let suggestions;
    if (compoundParts.length > 1) {
        suggestions = compoundParts.slice(0, 3).map(capitalizeBreakdownStep);
    } else if (lower.includes('\u0432\u0430\u0440\u0438\u0442\u044c') && lower.includes('\u043a\u0430\u0440\u0442\u043e\u0448\u043a')) {
        suggestions = [
            '\u041f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u0438\u0442\u044c \u043a\u0430\u0440\u0442\u043e\u0448\u043a\u0443 \u0438 \u0432\u043e\u0434\u0443',
            '\u041f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043a\u0430\u0440\u0442\u043e\u0448\u043a\u0443 \u0432\u0430\u0440\u0438\u0442\u044c\u0441\u044f',
            '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0433\u043e\u0442\u043e\u0432\u043d\u043e\u0441\u0442\u044c \u0438 \u0441\u043b\u0438\u0442\u044c \u0432\u043e\u0434\u0443',
        ];
    } else if (lower.includes('\u043c\u044b\u0442\u044c \u043f\u043e\u043b') || lower.includes('\u043f\u043e\u043b\u044b')) {
        suggestions = [
            '\u041f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u0438\u0442\u044c \u0432\u043e\u0434\u0443 \u0438\u043b\u0438 \u0448\u0432\u0430\u0431\u0440\u0443',
            '\u041f\u043e\u043c\u044b\u0442\u044c \u043e\u0434\u043d\u0443 \u0437\u043e\u043d\u0443',
            '\u0414\u043e\u043c\u044b\u0442\u044c \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u043e\u0435 \u0438 \u0443\u0431\u0440\u0430\u0442\u044c \u0438\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u044c',
        ];
    } else if (lower.includes('\u043f\u044b\u043b\u0435\u0441\u043e\u0441')) {
        suggestions = [
            '\u0414\u043e\u0441\u0442\u0430\u0442\u044c \u043f\u044b\u043b\u0435\u0441\u043e\u0441',
            '\u041f\u0440\u043e\u043f\u044b\u043b\u0435\u0441\u043e\u0441\u0438\u0442\u044c \u043e\u0434\u043d\u0443 \u043a\u043e\u043c\u043d\u0430\u0442\u0443',
            '\u0423\u0431\u0440\u0430\u0442\u044c \u043f\u044b\u043b\u0435\u0441\u043e\u0441 \u043d\u0430 \u043c\u0435\u0441\u0442\u043e',
        ];
    } else if (lower.includes('\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442')) {
        suggestions = [
            '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u0443\u0436\u043d\u044b\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b',
            '\u0421\u0434\u0435\u043b\u0430\u0442\u044c \u043f\u0435\u0440\u0432\u0443\u044e \u0447\u0430\u0441\u0442\u044c',
            '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c',
        ];
    } else if (lower.includes('\u0443\u0431\u043e\u0440\u043a') || lower.includes('\u043f\u0440\u0438\u0431\u0440\u0430\u0442')) {
        suggestions = [
            '\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u043e\u0434\u0438\u043d \u0443\u0447\u0430\u0441\u0442\u043e\u043a',
            '\u0423\u0431\u0440\u0430\u0442\u044c \u0435\u0433\u043e 10 \u043c\u0438\u043d\u0443\u0442',
            '\u0412\u0435\u0440\u043d\u0443\u0442\u044c \u0432\u0435\u0449\u0438 \u043f\u043e \u043c\u0435\u0441\u0442\u0430\u043c',
        ];
    } else if (lower.includes('\u0437\u0432\u043e\u043d') || lower.includes('\u043f\u043e\u0437\u0432\u043e\u043d')) {
        suggestions = [
            '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u043e\u043c\u0435\u0440',
            '\u0421\u0434\u0435\u043b\u0430\u0442\u044c \u043a\u043e\u0440\u043e\u0442\u043a\u0438\u0439 \u0437\u0432\u043e\u043d\u043e\u043a',
            '\u0417\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u0438\u0442\u043e\u0433',
        ];
    } else if (lower.includes('\u043a\u0443\u043f') || lower.includes('\u043c\u0430\u0433\u0430\u0437')) {
        suggestions = [
            '\u0421\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043a\u043e\u0440\u043e\u0442\u043a\u0438\u0439 \u0441\u043f\u0438\u0441\u043e\u043a',
            '\u0421\u0445\u043e\u0434\u0438\u0442\u044c \u0438\u043b\u0438 \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0443',
            '\u0420\u0430\u0437\u043b\u043e\u0436\u0438\u0442\u044c \u043f\u043e\u043a\u0443\u043f\u043a\u0438',
        ];
    } else if (lower.includes('\u0432\u0440\u0430\u0447') || lower.includes('\u043f\u043e\u043b\u0438\u043a\u043b\u0438\u043d\u0438\u043a')) {
        suggestions = [
            '\u041d\u0430\u0439\u0442\u0438 \u043a\u043e\u043d\u0442\u0430\u043a\u0442\u044b',
            '\u0421\u0434\u0435\u043b\u0430\u0442\u044c \u043e\u0434\u0438\u043d \u0437\u0432\u043e\u043d\u043e\u043a',
            '\u0417\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u0434\u0430\u0442\u0443 \u0438\u043b\u0438 \u0448\u0430\u0433',
        ];
    } else {
        suggestions = [
            '\u041d\u0430\u0447\u0430\u0442\u044c \u0441 \u043e\u0434\u043d\u043e\u0433\u043e \u043c\u0430\u043b\u0435\u043d\u044c\u043a\u043e\u0433\u043e \u043a\u0443\u0441\u043e\u0447\u043a\u0430',
            `\u0421\u0434\u0435\u043b\u0430\u0442\u044c \u0447\u0430\u0441\u0442\u044c: ${normalized}`,
            '\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c',
        ];
    }
    return suggestions.slice(0, 3).map((text, index) => createBreakdownDraft(text, index === 1 ? 10 : 5, index));
}

function buildSuggestedBreakdownDrafts(taskText) {
    const normalized = String(taskText || '').trim();
    const lower = normalized.toLowerCase();
    let suggestions;

    if (lower.includes('документ')) {
        suggestions = [
            'Открыть список нужных документов',
            'Подготовить или заполнить первую часть',
            'Проверить и отправить документы',
        ];
    } else if (lower.includes('уборк') || lower.includes('прибрат')) {
        suggestions = [
            'Выбрать один маленький участок для уборки',
            'Убрать только этот участок 10 минут',
            'Вынести мусор или убрать вещи на место',
        ];
    } else if (lower.includes('звон') || lower.includes('позвон')) {
        suggestions = [
            'Открыть номер и подготовить пару фраз',
            'Сделать короткий звонок',
            'Записать итог звонка или следующий шаг',
        ];
    } else if (lower.includes('куп') || lower.includes('магаз')) {
        suggestions = [
            'Составить короткий список покупок',
            'Сходить или открыть доставку',
            'Разложить покупки по местам',
        ];
    } else if (lower.includes('врач') || lower.includes('поликлиник')) {
        suggestions = [
            'Найти контакты или запись к врачу',
            'Сделать один короткий звонок или заявку',
            'Записать дату, время или следующий шаг',
        ];
    } else {
        suggestions = [
            `Подготовить всё нужное для: ${normalized}`,
            `Сделать маленькую основную часть: ${normalized}`,
            `Проверить и закрыть шаг по задаче: ${normalized}`,
        ];
    }

    return suggestions.map((text, index) => createBreakdownDraft(text, index === 1 ? 10 : 5, index));
}

export function bindAppEvents(app) {
    const { elements, store, runtime } = app;
    const authState = runtime.auth;
    const voiceState = runtime.voice;
    const inboxState = runtime.inbox;
    const breakdownState = runtime.breakdown;
    const editTaskState = runtime.editTask;
    const copyTaskState = runtime.copyTask;
    const easyPatternState = runtime.easyPattern;
    const templateAutoPrompt = runtime.templateAutoPrompt;
    const LOW_ENERGY_TEMPLATE_ID = 'tpl_4';
    const breakdownRememberLabel = elements.breakdownRememberRow?.querySelector('span');
    if (breakdownRememberLabel) {
        breakdownRememberLabel.textContent = '\u0411\u043e\u043b\u044c\u0448\u0435 \u043d\u0435 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c';
    }
    elements.breakdownManualBtn.textContent = '\u041d\u0435 \u0441\u0435\u0439\u0447\u0430\u0441';
    elements.breakdownSuggestedBtn.textContent = '\u041f\u043e\u043c\u043e\u0433\u0438 \u0440\u0430\u0437\u0431\u0438\u0442\u044c';

    function closeVoiceModal({ resetDraft = true } = {}) {
        elements.voiceModal.classList.add('hidden');
        voiceState.modalMode = 'hidden';
        if (resetDraft) {
            voiceState.voiceDraft = [];
            voiceState.lastTranscript = '';
        }
    }

    function closeInboxVoiceModal({ resetDraft = true } = {}) {
        elements.inboxVoiceModal.classList.add('hidden');
        inboxState.modalMode = 'hidden';
        if (resetDraft) {
            inboxState.drafts = [];
        }
    }

    function openInboxVoiceMessage(message) {
        inboxState.isListening = false;
        inboxState.isProcessing = false;
        inboxState.drafts = [];
        inboxState.error = message;
        inboxState.modalMode = 'message';
        app.renderers.renderMainScreen();
        app.renderers.renderInboxVoiceModal();
        elements.inboxVoiceModal.classList.remove('hidden');
    }

    function openInboxDraftModal(drafts) {
        inboxState.isListening = false;
        inboxState.isProcessing = false;
        inboxState.drafts = drafts;
        inboxState.error = '';
        inboxState.modalMode = 'draft';
        app.renderers.renderMainScreen();
        app.renderers.renderInboxVoiceModal();
        elements.inboxVoiceModal.classList.remove('hidden');
    }

    function closeInboxSortModal() {
        elements.inboxSortModal.classList.add('hidden');
        inboxState.sortMode = 'idle';
        inboxState.pendingAction = { itemId: null, mode: null, weight: 20, date: getLocalDateString() };
    }

    function openVoiceMessage(message) {
        voiceState.isListening = false;
        voiceState.isProcessing = false;
        voiceState.voiceDraft = [];
        voiceState.voiceError = message;
        voiceState.modalMode = 'message';
        app.renderers.renderMainScreen();
        app.renderers.renderVoiceModal();
        elements.voiceModal.classList.remove('hidden');
    }

    function openVoiceDraftModal(drafts, transcript) {
        voiceState.isListening = false;
        voiceState.isProcessing = false;
        voiceState.lastTranscript = transcript;
        voiceState.voiceDraft = drafts;
        voiceState.voiceError = '';
        voiceState.modalMode = 'draft';
        app.renderers.renderMainScreen();
        app.renderers.renderVoiceModal();
        elements.voiceModal.classList.remove('hidden');
    }

    function closeTemplateAutoModal() {
        templateAutoPrompt.templateId = null;
        elements.templateAutoModal.classList.add('hidden');
    }

    function closeBreakdownIntroModal({ preserveTask = false } = {}) {
        elements.breakdownIntroModal.classList.add('hidden');
        if (!preserveTask) {
            breakdownState.taskId = null;
            breakdownState.sourceInboxId = null;
            breakdownState.sourceText = '';
        }
        elements.breakdownRememberChoice.checked = false;
        elements.breakdownRememberRow.classList.remove('hidden');
    }

    function closeBreakdownEditorModal({ reset = true } = {}) {
        elements.breakdownEditorModal.classList.add('hidden');
        if (reset) {
            breakdownState.taskId = null;
            breakdownState.mode = 'intro';
            breakdownState.drafts = [];
            breakdownState.sourceInboxId = null;
            breakdownState.sourceText = '';
            elements.breakdownRememberChoice.checked = false;
        }
    }

    function closeCopyTaskModal() {
        copyTaskState.taskId = null;
        copyTaskState.targetDate = getLocalDateString();
        elements.copyTaskModal.classList.add('hidden');
        if (elements.copyTaskDate) {
            elements.copyTaskDate.value = copyTaskState.targetDate;
        }
        if (elements.copyTaskPreview) {
            elements.copyTaskPreview.textContent = '';
        }
    }

    function openCopyTaskModal(taskId) {
        const task = store.getState().tasks.find(item => item.id === taskId);
        if (!task) {
            return;
        }

        stopInlineEdit();
        copyTaskState.taskId = task.id;
        copyTaskState.targetDate = getLocalDateString();
        elements.copyTaskPreview.textContent = task.text;
        elements.copyTaskDate.value = copyTaskState.targetDate;
        elements.copyTaskModal.classList.remove('hidden');
        setTimeout(() => elements.copyTaskDate.focus(), 0);
    }

    function resetEasyPatternState() {
        easyPatternState.selectedScenario = null;
        easyPatternState.trigger = null;
        easyPatternState.preview = null;
        easyPatternState.resourceSuggestionId = null;
        easyPatternState.feedback = '';
    }

    function clearEasyPatternSelection({ keepFeedback = true } = {}) {
        easyPatternState.selectedScenario = null;
        easyPatternState.trigger = null;
        easyPatternState.preview = null;
        easyPatternState.resourceSuggestionId = null;
        if (!keepFeedback) {
            easyPatternState.feedback = '';
        }
    }

    function selectEasyPatternScenario(scenario) {
        const today = getLocalDateString();
        const state = store.getState();
        const trigger = getEasyPatternTrigger(state, today);
        if (!trigger || !shouldOfferEasyPattern(state, today)) {
            clearEasyPatternSelection({ keepFeedback: false });
            app.renderers.renderMainScreen();
            return;
        }

        let resourceSuggestionId = null;
        if (scenario === EASY_PATTERN_SCENARIOS.ADD_RESOURCE) {
            resourceSuggestionId = getSuggestedEasyPatternResource(state, today)?.id || null;
        }

        easyPatternState.selectedScenario = scenario;
        easyPatternState.trigger = trigger;
        easyPatternState.resourceSuggestionId = resourceSuggestionId;
        easyPatternState.preview = previewEasyPatternScenario(state, scenario, today, {
            resourceId: resourceSuggestionId,
        });
        easyPatternState.feedback = '';

        if (!state.currentDayMeta?.easyPatternShown) {
            markEasyPatternShown(store, today, trigger);
        }

        app.renderers.renderMainScreen();
    }

    function cycleEasyPatternResource() {
        const today = getLocalDateString();
        const state = store.getState();
        const nextResource = getSuggestedEasyPatternResource(state, today, easyPatternState.resourceSuggestionId || null);
        easyPatternState.resourceSuggestionId = nextResource?.id || null;
        easyPatternState.preview = previewEasyPatternScenario(state, EASY_PATTERN_SCENARIOS.ADD_RESOURCE, today, {
            resourceId: easyPatternState.resourceSuggestionId,
        });
        app.renderers.renderMainScreen();
    }

    function applySelectedEasyPatternScenario() {
        const scenario = easyPatternState.selectedScenario;
        if (!scenario) return;

        const today = getLocalDateString();
        const result = applyEasyPatternScenario(store, scenario, today, {
            resourceId: easyPatternState.resourceSuggestionId || null,
            trigger: easyPatternState.trigger || getEasyPatternTrigger(store.getState(), today),
        });
        if (!result) return;

        clearEasyPatternSelection({ keepFeedback: true });
        easyPatternState.feedback = scenario === EASY_PATTERN_SCENARIOS.ADD_RESOURCE
            ? '\u0413\u043e\u0442\u043e\u0432\u043e. \u0414\u043e\u0431\u0430\u0432\u0438\u043b\u0438 \u043e\u0434\u043d\u0443 \u0442\u0438\u0445\u0443\u044e \u043e\u043f\u043e\u0440\u0443 \u043d\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f.'
            : '\u0413\u043e\u0442\u043e\u0432\u043e. \u0422\u0435\u043f\u0435\u0440\u044c \u0434\u0435\u043d\u044c \u0432\u044b\u0433\u043b\u044f\u0434\u0438\u0442 \u0441\u043f\u043e\u043a\u043e\u0439\u043d\u0435\u0435.';

        renderAllTaskViews();
    }

    function dismissTodayEasyPattern() {
        const today = getLocalDateString();
        dismissEasyPattern(store, today, easyPatternState.trigger || getEasyPatternTrigger(store.getState(), today));
        clearEasyPatternSelection({ keepFeedback: false });
        app.renderers.renderMainScreen();
    }

    function closeAppMenu() {
        elements.appMenuPopover.classList.add('hidden');
        elements.openAppMenuBtn.setAttribute('aria-expanded', 'false');
    }

    function openAccountModal() {
        const currentUser = runtime.auth?.user || null;
        elements.accountProfileName.value = currentUser?.name || '';
        elements.accountProfileEmail.value = currentUser?.email || '';
        authState.accountProfile.status = 'idle';
        authState.accountProfile.error = '';
        authState.payments.error = '';
        authState.passwordChange.error = '';
        authState.passwordChange.message = '';
        elements.accountProfileError.textContent = '';
        elements.accountProfileError.classList.add('hidden');
        elements.accountProfileMessage.textContent = '';
        elements.accountProfileMessage.classList.add('hidden');
        elements.accountSupportCustomAmount.value = '';
        elements.accountSupportError.textContent = '';
        elements.accountSupportError.classList.add('hidden');
        elements.accountSupportMessage.classList.add('hidden');
        elements.accountModal.classList.remove('hidden');
    }

    function closeAccountModal() {
        elements.accountModal.classList.add('hidden');
    }

    function closePaymentReturnModal() {
        elements.paymentReturnModal.classList.add('hidden');
        authState.payments.returnStatus = 'idle';
        authState.payments.returnMessage = '';
        authState.payments.returnDonationId = null;
        elements.paymentReturnError.textContent = '';
        elements.paymentReturnError.classList.add('hidden');
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('paymentReturn');
            url.searchParams.delete('donationId');
            window.history.replaceState({}, '', `${url.pathname}${url.search}`);
        }
    }

    function getSelectedSupportAmount() {
        const customValue = elements.accountSupportCustomAmount?.value?.trim();
        if (customValue) {
            return Number(customValue);
        }

        return Number(authState.payments.selectedAmount || authState.payments.checkout?.allowedAmounts?.[0] || 149);
    }

    function renderSupportAmountButtons() {
        if (!elements.accountSupportAmounts) {
            return;
        }

        const selectedAmount = Number(authState.payments.selectedAmount);
        const allowedAmounts = authState.payments.checkout?.allowedAmounts?.length
            ? authState.payments.checkout.allowedAmounts
            : [149, 299, 499];

        elements.accountSupportAmounts.innerHTML = allowedAmounts
            .map(amount => `
                <button class="secondary-btn support-amount-btn ${amount === selectedAmount && !elements.accountSupportCustomAmount.value ? 'is-selected' : ''}" type="button" data-support-amount="${amount}">
                    ${amount} ₽
                </button>
            `)
            .join('');
    }

    function renderPaymentSummary() {
        const payments = authState.payments;
        const support = payments.support;
        const latestDonation = payments.latestDonation;
        const hasSupported = Boolean(support?.hasSupported);
        const pendingOffline = Boolean(runtime.auth.isOfflineAuthenticated || runtime.persistenceStatus?.mode === 'offline-authenticated');

        elements.accountSupportBadge.classList.toggle('hidden', !hasSupported);
        elements.accountSupportSummary.textContent = hasSupported
            ? `Последняя поддержка ${support.lastDonationAt ? new Date(support.lastDonationAt).toLocaleDateString('ru-RU') : 'уже получена'}. Оплата всё равно проходит только через защищённую страницу YooKassa.`
            : 'Оплата проходит на защищённой стороне YooKassa. Карта не сохраняется в приложении.';

        if (latestDonation?.status === 'pending') {
            elements.accountSupportMessage.textContent = 'Есть незавершённая оплата. После подтверждения YooKassa статус обновится автоматически.';
            elements.accountSupportMessage.classList.remove('hidden');
        } else if (pendingOffline) {
            elements.accountSupportMessage.textContent = 'В офлайн-режиме оплату открыть нельзя. Нужна живая связь с сервером.';
            elements.accountSupportMessage.classList.remove('hidden');
        } else if (!authState.payments.error) {
            elements.accountSupportMessage.classList.add('hidden');
        }

        elements.accountSupportSubmitBtn.disabled = payments.status === 'submitting' || pendingOffline;
        elements.accountSupportSubmitBtn.textContent = payments.status === 'submitting'
            ? 'Открываем оплату…'
            : 'Перейти к оплате';
        elements.accountSupportCustomAmount.min = String(payments.checkout?.minAmount || 100);
        renderSupportAmountButtons();
    }

    async function refreshPaymentStatus({ donationId, openReturnModal = false } = {}) {
        authState.payments.status = 'loading';
        authState.payments.error = '';
        elements.accountSupportError.textContent = '';
        elements.accountSupportError.classList.add('hidden');

        try {
            const payload = await app.auth.getPaymentStatus({ donationId });
            authState.payments.support = payload?.support || null;
            authState.payments.latestDonation = payload?.latestDonation || null;
            authState.payments.checkout = payload?.checkout || authState.payments.checkout;
            if (!authState.payments.selectedAmount && authState.payments.checkout?.allowedAmounts?.length) {
                authState.payments.selectedAmount = authState.payments.checkout.allowedAmounts[0];
            }
            authState.payments.status = 'idle';
            renderPaymentSummary();

            if (openReturnModal && donationId) {
                const latestStatus = payload?.latestDonation?.status;
                authState.payments.returnStatus = latestStatus || 'pending';
                elements.paymentReturnMessage.textContent = latestStatus === 'succeeded'
                    ? 'Поддержка получена. Спасибо, это очень помогает проекту.'
                    : latestStatus === 'canceled'
                        ? 'Платёж не был завершён. Ничего страшного, можно вернуться позже.'
                        : 'Платёж ещё проверяется. Финальный статус приходит только после уведомления от YooKassa.';
                elements.paymentReturnError.classList.add('hidden');
                elements.paymentReturnModal.classList.remove('hidden');
            }
        } catch (error) {
            authState.payments.status = 'idle';
            authState.payments.error = error?.friendlyMessage || 'Сейчас не получается проверить статус поддержки.';
            elements.accountSupportError.textContent = authState.payments.error;
            elements.accountSupportError.classList.remove('hidden');

            if (openReturnModal) {
                elements.paymentReturnMessage.textContent = 'Сейчас не удалось проверить платёж автоматически.';
                elements.paymentReturnError.textContent = authState.payments.error;
                elements.paymentReturnError.classList.remove('hidden');
                elements.paymentReturnModal.classList.remove('hidden');
            }
        }
    }

    async function startDonationCheckout() {
        if (!navigator.onLine || runtime.auth.isOfflineAuthenticated || runtime.persistenceStatus?.mode === 'offline-authenticated') {
            elements.accountSupportError.textContent = 'Для оплаты нужно подключение к интернету и активная серверная сессия.';
            elements.accountSupportError.classList.remove('hidden');
            return;
        }

        const amount = getSelectedSupportAmount();
        if (!Number.isFinite(amount)) {
            elements.accountSupportError.textContent = 'Выберите сумму поддержки.';
            elements.accountSupportError.classList.remove('hidden');
            return;
        }

        elements.accountSupportError.classList.add('hidden');
        elements.accountSupportMessage.classList.add('hidden');
        authState.payments.status = 'submitting';
        renderPaymentSummary();

        try {
            const payload = await app.auth.createDonationSession({ amount });
            authState.payments.status = 'idle';
            if (payload?.confirmationUrl) {
                window.location.href = payload.confirmationUrl;
                return;
            }

            elements.accountSupportError.textContent = 'Сервер не вернул ссылку на оплату.';
            elements.accountSupportError.classList.remove('hidden');
        } catch (error) {
            authState.payments.status = 'idle';
            elements.accountSupportError.textContent = error?.friendlyMessage || 'Сейчас не получается открыть страницу оплаты.';
            elements.accountSupportError.classList.remove('hidden');
        } finally {
            renderPaymentSummary();
        }
    }

    function openForgotPasswordModal() {
        if (!elements.forgotPasswordModal || !elements.forgotPasswordEmail) {
            authState.error = 'Модальное окно восстановления пароля пока недоступно. Попробуйте позже.';
            app.renderers.renderAuthScreen();
            return;
        }

        authState.forgotPassword.status = 'idle';
        authState.forgotPassword.error = '';
        authState.forgotPassword.message = '';
        elements.forgotPasswordEmail.value = elements.authEmail.value.trim();
        elements.forgotPasswordError.textContent = '';
        elements.forgotPasswordError.classList.add('hidden');
        elements.forgotPasswordMessage.textContent = '';
        elements.forgotPasswordMessage.classList.add('hidden');
        elements.forgotPasswordModal.classList.remove('hidden');
    }

    function closeForgotPasswordModal() {
        elements.forgotPasswordModal.classList.add('hidden');
    }

    function openChangePasswordModal() {
        if (!elements.changePasswordModal || !elements.currentPasswordInput) {
            return;
        }

        authState.passwordChange.status = 'idle';
        authState.passwordChange.error = '';
        authState.passwordChange.message = '';
        elements.currentPasswordInput.value = '';
        elements.newPasswordInput.value = '';
        elements.confirmNewPasswordInput.value = '';
        elements.changePasswordError.textContent = '';
        elements.changePasswordError.classList.add('hidden');
        elements.changePasswordMessage.textContent = '';
        elements.changePasswordMessage.classList.add('hidden');
        elements.changePasswordModal.classList.remove('hidden');
    }

    function closeChangePasswordModal() {
        elements.changePasswordModal.classList.add('hidden');
    }

    function toggleAppMenu() {
        const shouldOpen = elements.appMenuPopover.classList.contains('hidden');
        elements.appMenuPopover.classList.toggle('hidden', !shouldOpen);
        elements.openAppMenuBtn.setAttribute('aria-expanded', String(shouldOpen));
    }

    function resetAuthForm({ preserveEmail = true } = {}) {
        if (!preserveEmail) {
            elements.authEmail.value = '';
        }
        elements.authName.value = '';
        elements.authPassword.value = '';
        elements.authPasswordConfirm.value = '';
    }

    function switchAuthMode(mode) {
        authState.mode = mode === 'register' ? 'register' : 'login';
        authState.error = '';
        authState.notice = '';
        authState.resetToken = null;
        authState.status = 'guest';
        app.renderers.renderAuthScreen();
    }

    async function submitAuthForm() {
        const name = elements.authName.value.trim();
        const email = elements.authEmail.value.trim();
        const password = elements.authPassword.value;
        const passwordConfirm = elements.authPasswordConfirm.value;

        if (authState.mode === 'reset-password') {
            if (!password || !passwordConfirm) {
                authState.error = 'Заполни новый пароль и его подтверждение.';
                authState.status = 'guest';
                app.renderers.renderAuthScreen();
                return;
            }

            if (password !== passwordConfirm) {
                authState.error = 'Пароли не совпадают.';
                authState.status = 'guest';
                app.renderers.renderAuthScreen();
                return;
            }

            authState.status = 'submitting';
            authState.error = '';
            authState.notice = '';
            app.renderers.renderAuthScreen();

            try {
                await app.auth.resetPassword({
                    token: authState.resetToken,
                    password,
                });

                authState.mode = 'login';
                authState.resetToken = null;
                authState.status = 'guest';
                authState.notice = 'Пароль обновлён. Теперь можно войти с новым паролем.';
                authState.error = '';
                resetAuthForm({ preserveEmail: false });
                if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', window.location.pathname);
                }
                app.renderers.renderAuthScreen();
            } catch (error) {
                authState.status = 'guest';
                authState.error = error?.friendlyMessage || 'Сейчас не получается обновить пароль. Попробуй ещё раз чуть позже.';
                app.renderers.renderAuthScreen();
            }
            return;
        }

        if (!email || !password || (authState.mode === 'register' && !name)) {
            authState.error = 'Заполни, пожалуйста, все обязательные поля.';
            authState.status = 'guest';
            app.renderers.renderAuthScreen();
            return;
        }

        if (authState.mode === 'register' && password !== passwordConfirm) {
            authState.error = 'Пароли не совпадают.';
            authState.status = 'guest';
            app.renderers.renderAuthScreen();
            return;
        }

        authState.status = 'submitting';
        authState.error = '';
        authState.notice = '';
        app.renderers.renderAuthScreen();

        try {
            const user = authState.mode === 'register'
                ? await app.auth.register({ name, email, password })
                : await app.auth.login({ email, password });

            resetAuthForm();
            await app.startAuthenticatedFlow(user);
        } catch (error) {
            authState.status = 'guest';
            authState.error = error?.friendlyMessage || 'Сейчас не получается продолжить. Попробуй ещё раз чуть позже.';
            app.renderers.renderAuthScreen();
        }
    }

    function stopInlineEdit() {
        editTaskState.taskId = null;
        editTaskState.text = '';
        editTaskState.weight = 20;
        editTaskState.isResource = false;
    }

    function startInlineEdit(taskId) {
        const task = store.getState().tasks.find(item => item.id === taskId);
        if (!task) return;

        editTaskState.taskId = taskId;
        editTaskState.text = task.text;
        editTaskState.weight = task.weight || 5;
        editTaskState.isResource = Boolean(task.isResource);
    }

    function applyBreakdownPreferenceIfNeeded() {
        if (!elements.breakdownRememberChoice.checked) {
            return;
        }

        store.updateState(state => {
            state.preferences.breakDownLargeTasksPromptMode = 'skip-intro-ask';
        });
    }

    function openBreakdownEditor(taskId, mode) {
        const task = store.getState().tasks.find(item => item.id === taskId);
        if (!task) return;

        breakdownState.taskId = taskId;
        breakdownState.sourceInboxId = null;
        breakdownState.sourceText = task.text;
        breakdownState.mode = mode;
        breakdownState.drafts = mode === 'suggested'
            ? buildCompactSuggestedBreakdownDrafts(task.text)
            : buildManualBreakdownDrafts();

        closeBreakdownIntroModal({ preserveTask: true });
        app.renderers.renderBreakdownEditorModal();
        elements.breakdownEditorModal.classList.remove('hidden');
    }

    function openBreakdownFlow(taskId) {
        const task = store.getState().tasks.find(item => item.id === taskId);
        if (!task) return;

        breakdownState.taskId = taskId;
        breakdownState.sourceInboxId = null;
        breakdownState.sourceText = task.text;
        const shouldSkipIntro = store.getState().preferences?.breakDownLargeTasksPromptMode === 'skip-intro-ask';
        if (shouldSkipIntro) {
            openBreakdownEditor(taskId, 'suggested');
            return;
        }

        elements.breakdownIntroText.textContent = '\u0417\u0430\u0434\u0430\u0447\u0430 \u0432\u044b\u0433\u043b\u044f\u0434\u0438\u0442 \u0442\u044f\u0436\u0435\u043b\u043e\u0432\u0430\u0442\u043e. \u0414\u0430\u0432\u0430\u0439 \u043f\u0440\u0435\u0432\u0440\u0430\u0442\u0438\u043c \u0435\u0435 \u0432 \u043c\u0430\u043b\u0435\u043d\u044c\u043a\u0438\u0435 \u0448\u0430\u0433\u0438?';
        elements.breakdownRememberRow.classList.remove('hidden');
        elements.breakdownRememberChoice.checked = false;
        elements.breakdownIntroModal.classList.remove('hidden');
    }

    elements.openAppMenuBtn.addEventListener('click', event => {
        event.stopPropagation();
        toggleAppMenu();
    });

    elements.authLoginModeBtn.addEventListener('click', () => {
        switchAuthMode('login');
    });

    elements.authRegisterModeBtn.addEventListener('click', () => {
        switchAuthMode('register');
    });

    elements.authForm.addEventListener('submit', event => {
        event.preventDefault();
        void submitAuthForm();
    });

    if (elements.authForgotPasswordBtn) {
        elements.authForgotPasswordBtn.addEventListener('click', () => {
            openForgotPasswordModal();
        });
    }

    if (elements.closeForgotPasswordBtn) {
        elements.closeForgotPasswordBtn.addEventListener('click', () => {
            closeForgotPasswordModal();
        });
    }

    if (elements.forgotPasswordCancelBtn) {
        elements.forgotPasswordCancelBtn.addEventListener('click', () => {
            closeForgotPasswordModal();
        });
    }

    if (elements.forgotPasswordForm) {
        elements.forgotPasswordForm.addEventListener('submit', async event => {
        event.preventDefault();
        const email = elements.forgotPasswordEmail.value.trim();
        if (!email) {
            elements.forgotPasswordError.textContent = 'Укажи email для восстановления.';
            elements.forgotPasswordError.classList.remove('hidden');
            return;
        }

        elements.forgotPasswordError.classList.add('hidden');
        elements.forgotPasswordMessage.classList.add('hidden');
        elements.forgotPasswordSubmitBtn.disabled = true;

        try {
            const result = await app.auth.forgotPassword({ email });
            elements.forgotPasswordMessage.textContent = result?.message || 'Если такой аккаунт существует, письмо уже отправлено.';
            elements.forgotPasswordMessage.classList.remove('hidden');
        } catch (error) {
            elements.forgotPasswordError.textContent = error?.friendlyMessage || 'Сейчас не получается отправить письмо для восстановления.';
            elements.forgotPasswordError.classList.remove('hidden');
        } finally {
            elements.forgotPasswordSubmitBtn.disabled = false;
        }
        });
    }

    if (elements.accountProfileForm) {
        elements.accountProfileForm.addEventListener('submit', async event => {
        event.preventDefault();
        const name = elements.accountProfileName.value.trim();
        const email = elements.accountProfileEmail.value.trim();

        if (!name || !email) {
            elements.accountProfileError.textContent = 'Заполни имя и email.';
            elements.accountProfileError.classList.remove('hidden');
            return;
        }

        elements.accountProfileError.classList.add('hidden');
        elements.accountProfileMessage.classList.add('hidden');
        elements.accountProfileSubmitBtn.disabled = true;

        try {
            const user = await app.auth.updateProfile({ name, email });
            authState.user = user;
            elements.accountProfileMessage.textContent = 'Профиль обновлён.';
            elements.accountProfileMessage.classList.remove('hidden');
        } catch (error) {
            elements.accountProfileError.textContent = error?.friendlyMessage || 'Сейчас не получается обновить профиль.';
            elements.accountProfileError.classList.remove('hidden');
        } finally {
            elements.accountProfileSubmitBtn.disabled = false;
        }
        });
    }

    if (elements.accountSupportAmounts) {
        elements.accountSupportAmounts.addEventListener('click', event => {
            const button = event.target.closest('[data-support-amount]');
            if (!button) {
                return;
            }

            authState.payments.selectedAmount = Number(button.dataset.supportAmount);
            elements.accountSupportCustomAmount.value = '';
            renderSupportAmountButtons();
        });
    }

    if (elements.accountSupportCustomAmount) {
        elements.accountSupportCustomAmount.addEventListener('input', () => {
            renderSupportAmountButtons();
        });
    }

    if (elements.accountSupportSubmitBtn) {
        elements.accountSupportSubmitBtn.addEventListener('click', () => {
            void startDonationCheckout();
        });
    }

    if (elements.openChangePasswordBtn) {
        elements.openChangePasswordBtn.addEventListener('click', () => {
            openChangePasswordModal();
        });
    }

    if (elements.closeChangePasswordBtn) {
        elements.closeChangePasswordBtn.addEventListener('click', () => {
            closeChangePasswordModal();
        });
    }

    if (elements.changePasswordCancelBtn) {
        elements.changePasswordCancelBtn.addEventListener('click', () => {
            closeChangePasswordModal();
        });
    }

    if (elements.changePasswordForm) {
        elements.changePasswordForm.addEventListener('submit', async event => {
        event.preventDefault();
        const currentPassword = elements.currentPasswordInput.value;
        const newPassword = elements.newPasswordInput.value;
        const confirmPassword = elements.confirmNewPasswordInput.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            elements.changePasswordError.textContent = 'Заполни все поля для смены пароля.';
            elements.changePasswordError.classList.remove('hidden');
            return;
        }

        if (newPassword !== confirmPassword) {
            elements.changePasswordError.textContent = 'Новые пароли не совпадают.';
            elements.changePasswordError.classList.remove('hidden');
            return;
        }

        elements.changePasswordError.classList.add('hidden');
        elements.changePasswordMessage.classList.add('hidden');
        elements.changePasswordSubmitBtn.disabled = true;

        try {
            await app.auth.changePassword({ currentPassword, newPassword });
            closeChangePasswordModal();
            closeAccountModal();
            resetEasyPatternState();
            store.setSessionContext({ authenticated: false, userId: null });
            authState.user = null;
            authState.mode = 'login';
            authState.notice = 'Пароль изменён. Войди заново с новым паролем.';
            authState.status = 'guest';
            resetAuthForm({ preserveEmail: false });
            app.screens.showAuthScreen();
        } catch (error) {
            elements.changePasswordError.textContent = error?.friendlyMessage || 'Сейчас не получается сменить пароль.';
            elements.changePasswordError.classList.remove('hidden');
        } finally {
            elements.changePasswordSubmitBtn.disabled = false;
        }
        });
    }

    if (elements.closePaymentReturnBtn) {
        elements.closePaymentReturnBtn.addEventListener('click', () => {
            closePaymentReturnModal();
        });
    }

    if (elements.paymentReturnCloseBtn) {
        elements.paymentReturnCloseBtn.addEventListener('click', () => {
            closePaymentReturnModal();
        });
    }

    elements.appMenuPopover.addEventListener('click', event => {
        event.stopPropagation();
    });

    document.addEventListener('click', event => {
        if (elements.appMenuPopover.classList.contains('hidden')) {
            return;
        }

        if (elements.openAppMenuBtn.contains(event.target) || elements.appMenuPopover.contains(event.target)) {
            return;
        }

        closeAppMenu();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeAppMenu();
        }
    });

    elements.accountLogoutBtn.addEventListener('click', async () => {
        closeAccountModal();
        closePaymentReturnModal();
        resetEasyPatternState();
        clearOfflineAuthSnapshot();
        authState.payments.support = null;
        authState.payments.latestDonation = null;
        authState.payments.error = '';

        try {
            await app.auth.logout();
        } catch (error) {
            runtime.auth.error = error?.friendlyMessage || 'Сейчас не получается выйти из аккаунта.';
        }

        store.setSessionContext({ authenticated: false, userId: null });
        authState.user = null;
        authState.mode = 'login';
        authState.status = 'guest';
        authState.isOfflineAuthenticated = false;
        resetAuthForm({ preserveEmail: false });
        app.screens.showAuthScreen();
    });

    function openBreakdownFromInbox(itemId) {
        const item = store.getState().inboxItems.find(entry => entry.id === itemId);
        if (!item) return;

        breakdownState.taskId = null;
        breakdownState.sourceInboxId = itemId;
        breakdownState.sourceText = item.text;
        const shouldSkipIntro = store.getState().preferences?.breakDownLargeTasksPromptMode === 'skip-intro-ask';
        if (shouldSkipIntro) {
            breakdownState.mode = 'suggested';
            breakdownState.drafts = buildCompactSuggestedBreakdownDrafts(item.text);
            app.renderers.renderBreakdownEditorModal();
            elements.breakdownEditorModal.classList.remove('hidden');
            return;
        }

        elements.breakdownIntroText.textContent = '\u041c\u044b\u0441\u043b\u044c \u0432\u044b\u0433\u043b\u044f\u0434\u0438\u0442 \u0431\u043e\u043b\u044c\u0448\u043e\u0439. \u0414\u0430\u0432\u0430\u0439 \u043f\u0440\u0435\u0432\u0440\u0430\u0442\u0438\u043c \u0435\u0435 \u0432 \u043c\u0430\u043b\u0435\u043d\u044c\u043a\u0438\u0435 \u0448\u0430\u0433\u0438?';
        elements.breakdownRememberRow.classList.remove('hidden');
        elements.breakdownRememberChoice.checked = false;
        elements.breakdownIntroModal.classList.remove('hidden');
    }

    function openTemplateAutoModal(templateId) {
        const template = store.getState().templates.find(item => item.id === templateId);
        if (!template) return;

        templateAutoPrompt.templateId = templateId;
        elements.templateAutoTemplateName.textContent = template.name;
        elements.templateAutoModal.classList.remove('hidden');
    }

    function shouldOfferLowEnergyDay(energyBudget, state = store.getState()) {
        return energyBudget >= 10
            && energyBudget <= 15
            && state.currentDayMeta?.date === getLocalDateString()
            && !state.currentDayMeta.lowEnergyPromptHandled;
    }

    function closeLowEnergyModal() {
        elements.lowEnergyModal.classList.add('hidden');
    }

    function openLowEnergyModal() {
        const state = store.getState();
        elements.lowEnergyAvatar.src = state.avatar;
        elements.lowEnergyModal.classList.remove('hidden');
    }

    function finalizeLowEnergyDecline() {
        resetEasyPatternState();
        store.updateState(state => {
            state.currentDayMeta = {
                ...state.currentDayMeta,
                date: getLocalDateString(),
                lowEnergyPromptHandled: true,
                lowEnergyDayApplied: false,
                lowEnergyKeptTaskId: null,
                lowEnergyResourceId: null,
                lowEnergyResourceTaskId: null,
            };
        });
        closeLowEnergyModal();
        app.screens.showMainScreen();
    }

    function finalizeLowEnergyAcceptance() {
        const today = getLocalDateString();
        resetEasyPatternState();
        applyLowEnergyDay(store, today);
        addAllTemplateTasksToDay(store, LOW_ENERGY_TEMPLATE_ID, today);
        assignLowEnergyResource(store, { today });
        closeLowEnergyModal();
        app.screens.showMainScreen();
        app.renderers.renderArchive();
        app.renderers.renderWeeklyScreen();
    }

    function closeLowEnergySwapModal() {
        elements.lowEnergySwapModal.classList.add('hidden');
    }

    const voiceService = createVoiceInputService({
        locale: 'ru-RU',
        onStart: () => {
            voiceState.isListening = true;
            voiceState.isProcessing = false;
            voiceState.voiceError = '';
            app.renderers.renderMainScreen();
        },
        onEnd: ({ transcript, hadError }) => {
            voiceState.isListening = false;
            if (hadError) {
                app.renderers.renderMainScreen();
                return;
            }

            if (!transcript) {
                voiceState.voiceError = 'Я ничего не расслышал. Можно попробовать ещё раз.';
                app.renderers.renderMainScreen();
                return;
            }

            voiceState.isProcessing = true;
            voiceState.lastTranscript = transcript;
            app.renderers.renderMainScreen();

            const drafts = parseVoiceTranscript(transcript, getLocalDateString());
            voiceState.isProcessing = false;

            if (drafts.length === 0) {
                openVoiceMessage('Не получилось собрать понятный черновик. Можно попробовать ещё раз или добавить задачу текстом.');
                return;
            }

            openVoiceDraftModal(drafts, transcript);
        },
        onError: message => {
            voiceState.isListening = false;
            voiceState.isProcessing = false;
            if (message) {
                openVoiceMessage(message);
            } else {
                app.renderers.renderMainScreen();
            }
        },
    });

    voiceState.isSupported = voiceService.isSupported();

    const inboxVoiceService = createVoiceInputService({
        locale: 'ru-RU',
        onStart: () => {
            inboxState.isListening = true;
            inboxState.isProcessing = false;
            inboxState.error = '';
            app.renderers.renderMainScreen();
        },
        onEnd: ({ transcript, hadError }) => {
            inboxState.isListening = false;
            if (hadError) {
                app.renderers.renderMainScreen();
                return;
            }

            if (!transcript) {
                inboxState.error = 'Я ничего не расслышал. Можно попробовать ещё раз или записать мысль текстом.';
                app.renderers.renderMainScreen();
                return;
            }

            inboxState.isProcessing = true;
            app.renderers.renderMainScreen();
            const drafts = parseInboxTranscript(transcript);
            inboxState.isProcessing = false;

            if (drafts.length === 0) {
                openInboxVoiceMessage('Не получилось собрать понятный черновик мыслей. Можно попробовать ещё раз или записать мысль текстом.');
                return;
            }

            openInboxDraftModal(drafts);
        },
        onError: message => {
            inboxState.isListening = false;
            inboxState.isProcessing = false;
            if (message) {
                openInboxVoiceMessage(message);
            } else {
                app.renderers.renderMainScreen();
            }
        },
    });

    inboxState.isSupported = inboxVoiceService.isSupported();

    [
        elements.weeklyTaskModal,
        elements.copyTaskModal,
        elements.libraryModal,
        elements.archiveModal,
        elements.completedModal,
        elements.accountModal,
        elements.templatesModal,
        elements.templateAutoModal,
        elements.breakdownIntroModal,
        elements.breakdownEditorModal,
        elements.lowEnergyModal,
        elements.lowEnergySwapModal,
        elements.helperModal,
        elements.voiceModal,
        elements.inboxVoiceModal,
        elements.inboxSortModal,
        elements.sosModal,
        elements.allDoneModal,
    ].forEach(modal => {
        modal.addEventListener('click', event => {
            if (event.target !== modal) return;
            if (modal === elements.voiceModal) {
                closeVoiceModal();
                app.renderers.renderMainScreen();
                return;
            }
            if (modal === elements.inboxVoiceModal) {
                closeInboxVoiceModal();
                app.renderers.renderMainScreen();
                return;
            }
            if (modal === elements.inboxSortModal) {
                closeInboxSortModal();
                return;
            }
            if (modal === elements.templateAutoModal) {
                closeTemplateAutoModal();
                return;
            }
            if (modal === elements.copyTaskModal) {
                closeCopyTaskModal();
                return;
            }
            if (modal === elements.breakdownIntroModal) {
                closeBreakdownIntroModal();
                return;
            }
            if (modal === elements.breakdownEditorModal) {
                closeBreakdownEditorModal();
                return;
            }
            if (modal === elements.lowEnergyModal) {
                finalizeLowEnergyDecline();
                return;
            }
            if (modal === elements.lowEnergySwapModal) {
                closeLowEnergySwapModal();
                return;
            }
            modal.classList.add('hidden');
        });
    });

    bindSubmitOnEnter(elements.taskInput, elements.addTaskForm);
    bindSubmitOnEnter(elements.inboxInput, elements.addInboxForm);
    bindSubmitOnEnter(elements.resourceInput, elements.addResourceForm);
    bindSubmitOnEnter(elements.weeklyTaskText, elements.addWeeklyTaskForm);

    elements.energyInput.addEventListener('input', event => {
        elements.energyDisplay.textContent = event.target.value;
    });

    elements.startDayBtn.addEventListener('click', () => {
        const energyBudget = parseInt(elements.energyInput.value, 10);
        resetEasyPatternState();
        store.updateState(state => {
            state.energyBudget = energyBudget;
            state.lastDate = getLocalDateString();
            state.currentDayMeta = createCurrentDayMeta(state.lastDate);
        });
        applyDailyTemplatesForDate(store, getLocalDateString());
        runtime.sosView = null;
        if (shouldOfferLowEnergyDay(energyBudget)) {
            app.screens.showMainScreen();
            openLowEnergyModal();
            return;
        }

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

    elements.closeVoiceBtn.addEventListener('click', () => {
        closeVoiceModal();
        app.renderers.renderMainScreen();
    });

    elements.voiceCancelBtn.addEventListener('click', () => {
        closeVoiceModal();
        app.renderers.renderMainScreen();
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

    function resetInboxPendingAction() {
        inboxState.pendingAction = {
            itemId: null,
            mode: null,
            weight: 20,
            date: getLocalDateString(),
        };
    }

    function openInboxPendingAction(itemId, mode) {
        inboxState.pendingAction = {
            itemId,
            mode,
            weight: 20,
            date: getLocalDateString(),
        };
    }

    function renderAllTaskViews() {
        app.renderers.renderMainScreen();
        app.renderers.renderArchive();
        app.renderers.renderCompleted();
        app.renderers.renderWeeklyScreen();
    }

    function renderInboxViews() {
        app.renderers.renderMainScreen();
        app.renderers.renderInboxVoiceModal();
        app.renderers.renderInboxSortModal();
    }

    function saveInlineEdit() {
        if (!editTaskState.taskId) return;

        const text = editTaskState.text.trim();
        if (!text) return;

        updateTask(store, {
            taskId: editTaskState.taskId,
            text,
            weight: parseInt(editTaskState.weight, 10),
        });

        stopInlineEdit();
        renderAllTaskViews();
    }

    function focusInlineEditor(taskId) {
        setTimeout(() => {
            const input = document.querySelector(`[data-action="edit-update-text"][data-task-id="${taskId}"]`);
            if (!input) return;

            input.focus();
            input.select();
        }, 0);
    }

    function handleInlineEditEnter(event) {
        const input = event.target.closest('[data-action="edit-update-text"]');
        if (!input || event.key !== 'Enter' || event.shiftKey) return;

        event.preventDefault();
        if (editTaskState.taskId !== input.dataset.taskId) return;
        saveInlineEdit();
    }

    function handleInboxAction(action, itemId) {
        if (!itemId) return;

        if (action === 'inbox-open-today') {
            openInboxPendingAction(itemId, 'today');
            renderInboxViews();
            return;
        }

        if (action === 'inbox-open-week') {
            openInboxPendingAction(itemId, 'week');
            renderInboxViews();
            return;
        }

        if (action === 'inbox-cancel-action') {
            resetInboxPendingAction();
            renderInboxViews();
            return;
        }

        if (action === 'inbox-confirm-today') {
            convertInboxItemToToday(store, {
                itemId,
                weight: parseInt(inboxState.pendingAction.weight, 10) || 20,
            });
            resetInboxPendingAction();
            renderAllTaskViews();
            app.renderers.renderInboxSortModal();
            return;
        }

        if (action === 'inbox-confirm-week') {
            convertInboxItemToDate(store, {
                itemId,
                dateStr: inboxState.pendingAction.date || getLocalDateString(),
                weight: parseInt(inboxState.pendingAction.weight, 10) || 20,
            });
            resetInboxPendingAction();
            renderAllTaskViews();
            app.renderers.renderInboxSortModal();
            return;
        }

        if (action === 'inbox-move-deferred') {
            convertInboxItemToDeferred(store, itemId);
            resetInboxPendingAction();
            renderAllTaskViews();
            app.renderers.renderInboxSortModal();
            return;
        }

        if (action === 'inbox-to-resource') {
            convertInboxItemToResource(store, itemId);
            resetInboxPendingAction();
            renderInboxViews();
            app.renderers.renderResources();
            return;
        }

        if (action === 'inbox-breakdown') {
            openBreakdownFromInbox(itemId);
            resetInboxPendingAction();
            app.renderers.renderInboxSortModal();
            return;
        }

        if (action === 'inbox-delete') {
            deleteInboxItem(store, itemId);
            resetInboxPendingAction();
            renderInboxViews();
        }
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
        elements.adviceAddBtn.textContent = 'Добавлено';
        elements.adviceAddBtn.style.backgroundColor = 'var(--primary-color)';
        elements.adviceAddBtn.style.color = 'white';

        setTimeout(() => {
            elements.adviceAddBtn.textContent = originalText;
            elements.adviceAddBtn.style.backgroundColor = '';
            elements.adviceAddBtn.style.color = '';
            elements.helperModal.classList.add('hidden');
        }, 1000);
    });

    elements.openVoiceBtn.addEventListener('click', () => {
        if (!voiceState.isSupported) {
            openVoiceMessage('Голосовой ввод в этом браузере пока недоступен. Можно продолжить обычным текстовым вводом.');
            return;
        }

        if (voiceState.isListening) {
            voiceService.stopListening();
            return;
        }

        voiceState.voiceError = '';
        closeVoiceModal();
        app.renderers.renderMainScreen();
        voiceService.startListening();
    });

    elements.addInboxForm.addEventListener('submit', event => {
        event.preventDefault();
        const items = splitInboxText(elements.inboxInput.value);
        if (items.length === 0) return;

        addInboxItems(store, items);
        elements.inboxInput.value = '';
        renderInboxViews();
    });

    elements.openInboxVoiceBtn.addEventListener('click', () => {
        if (!inboxState.isSupported) {
            openInboxVoiceMessage('Голосовой ввод в этом браузере пока недоступен. Можно продолжить обычным текстовым вводом.');
            return;
        }

        if (inboxState.isListening) {
            inboxVoiceService.stopListening();
            return;
        }

        inboxState.error = '';
        closeInboxVoiceModal();
        app.renderers.renderMainScreen();
        inboxVoiceService.startListening();
    });

    elements.closeInboxVoiceBtn.addEventListener('click', () => {
        closeInboxVoiceModal();
        app.renderers.renderMainScreen();
    });

    elements.inboxVoiceCancelBtn.addEventListener('click', () => {
        closeInboxVoiceModal();
        app.renderers.renderMainScreen();
    });

    elements.inboxVoiceConfirmBtn.addEventListener('click', () => {
        const drafts = inboxState.drafts
            .map(draft => draft.text.trim())
            .filter(Boolean);

        if (drafts.length === 0) {
            openInboxVoiceMessage('В черновике пока нет мыслей, которые можно сохранить.');
            return;
        }

        addInboxItems(store, drafts);
        closeInboxVoiceModal();
        renderInboxViews();
    });

    elements.openInboxSortBtn.addEventListener('click', () => {
        inboxState.sortMode = 'single';
        resetInboxPendingAction();
        app.renderers.renderInboxSortModal();
        elements.inboxSortModal.classList.remove('hidden');
    });

    elements.closeInboxSortBtn.addEventListener('click', closeInboxSortModal);

    elements.clearInboxBtn.addEventListener('click', () => {
        const inboxItems = store.getState().inboxItems || [];
        if (inboxItems.length === 0) return;

        const shouldClear = window.confirm('Очистить всё Облако мыслей? Это удалит все сохранённые мысли.');
        if (!shouldClear) return;

        clearInboxItems(store);
        closeInboxSortModal();
        renderInboxViews();
    });

    elements.openLibraryBtn.addEventListener('click', () => {
        closeAppMenu();
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
                ...state.currentDayMeta,
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
                ...state.currentDayMeta,
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
        closeAppMenu();
        app.renderers.renderArchive();
        elements.completedModal.classList.add('hidden');
        elements.archiveModal.classList.remove('hidden');
    });

    elements.openCompletedBtn.addEventListener('click', () => {
        closeAppMenu();
        app.renderers.renderCompleted();
        elements.archiveModal.classList.add('hidden');
        elements.completedModal.classList.remove('hidden');
    });

    elements.openHistoryBtn.addEventListener('click', () => {
        closeAppMenu();
        app.screens.showHistoryScreen();
    });

    elements.openAccountBtn.addEventListener('click', () => {
        closeAppMenu();
        openAccountModal();
    });

    elements.closeAccountBtn.addEventListener('click', () => {
        closeAccountModal();
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

    elements.voiceConfirmBtn.addEventListener('click', () => {
        const draftsToAdd = voiceState.voiceDraft
            .map(draft => ({
                text: draft.text.trim(),
                weight: parseInt(draft.suggestedWeight, 10),
                targetDate: draft.suggestedDate,
            }))
            .filter(draft => draft.text);

        if (draftsToAdd.length === 0) {
            openVoiceMessage('В черновике пока нет задач, которые можно добавить.');
            return;
        }

        draftsToAdd.forEach(draft => {
            addTask(store, {
                text: draft.text,
                weight: draft.weight,
                isResource: false,
                targetDate: draft.targetDate,
            });
        });

        closeVoiceModal();
        app.renderers.renderMainScreen();
        app.renderers.renderWeeklyScreen();
    });

    app.handlePaymentReturn = async () => {
        authState.payments.returnDonationId = null;
    };

    elements.openWeeklyBtn.addEventListener('click', () => {
        closeAppMenu();
        app.screens.showWeeklyScreen();
    });

    elements.closeWeeklyBtn.addEventListener('click', () => {
        app.screens.showMainScreen();
    });

    elements.closeWeeklyTaskBtn.addEventListener('click', () => {
        elements.weeklyTaskModal.classList.add('hidden');
    });

    elements.closeCopyTaskBtn.addEventListener('click', closeCopyTaskModal);
    elements.copyTaskCancelBtn.addEventListener('click', closeCopyTaskModal);

    elements.copyTaskDate.addEventListener('change', event => {
        copyTaskState.targetDate = event.target.value || getLocalDateString();
    });

    elements.copyTaskDate.addEventListener('keydown', event => {
        if (event.key !== 'Enter' || event.shiftKey) return;

        event.preventDefault();
        elements.copyTaskConfirmBtn.click();
    });

    elements.copyTaskConfirmBtn.addEventListener('click', () => {
        if (!copyTaskState.taskId) return;

        const targetDate = elements.copyTaskDate.value || copyTaskState.targetDate || getLocalDateString();
        const copiedTask = copyTaskToDate(store, {
            taskId: copyTaskState.taskId,
            targetDate,
        });
        if (!copiedTask) return;

        closeCopyTaskModal();
        renderAllTaskViews();
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

    elements.closeTemplateAutoBtn.addEventListener('click', closeTemplateAutoModal);

    elements.templateAutoYesBtn.addEventListener('click', () => {
        if (!templateAutoPrompt.templateId) return;

        setTemplateDailyPreference(store, {
            templateId: templateAutoPrompt.templateId,
            autoAddDaily: true,
            hasAskedAutoAdd: true,
            lastAutoAddedDate: getLocalDateString(),
        });
        closeTemplateAutoModal();
        app.renderers.renderTemplates();
        app.renderers.renderMainScreen();
    });

    elements.templateAutoNoBtn.addEventListener('click', () => {
        if (!templateAutoPrompt.templateId) return;

        setTemplateDailyPreference(store, {
            templateId: templateAutoPrompt.templateId,
            autoAddDaily: false,
            hasAskedAutoAdd: true,
            lastAutoAddedDate: null,
        });
        closeTemplateAutoModal();
        app.renderers.renderTemplates();
    });

    elements.closeBreakdownIntroBtn.addEventListener('click', closeBreakdownIntroModal);
    elements.closeBreakdownEditorBtn.addEventListener('click', () => closeBreakdownEditorModal());
    elements.breakdownCancelBtn.addEventListener('click', () => closeBreakdownEditorModal());

    elements.breakdownManualBtn.addEventListener('click', () => {
        closeBreakdownIntroModal();
    });

    elements.breakdownSuggestedBtn.addEventListener('click', () => {
        applyBreakdownPreferenceIfNeeded();
        if (!breakdownState.taskId) return;

        openBreakdownEditor(breakdownState.taskId, 'suggested');
    });

    elements.breakdownConfirmBtn.addEventListener('click', () => {
        const steps = breakdownState.drafts
            .map(draft => ({
                text: draft.text.trim(),
                weight: draft.weight,
            }))
            .filter(step => step.text);

        if (steps.length < 2) return;

        let breakdownTaskId = breakdownState.taskId;

        if (!breakdownTaskId && breakdownState.sourceInboxId && breakdownState.sourceText) {
            const createdTask = addTask(store, {
                text: breakdownState.sourceText,
                weight: 20,
                isResource: false,
                targetDate: getLocalDateString(),
            });
            breakdownTaskId = createdTask?.id || null;
            if (!breakdownTaskId) return;
            deleteInboxItem(store, breakdownState.sourceInboxId);
        }

        if (!breakdownTaskId) return;

        const created = createTaskBreakdown(store, {
            taskId: breakdownTaskId,
            steps,
        });

        if (!created) return;

        closeBreakdownEditorModal();
        app.renderers.renderMainScreen();
        app.renderers.renderInboxSortModal();
        app.renderers.renderArchive();
        app.renderers.renderWeeklyScreen();
    });

    elements.closeLowEnergyBtn.addEventListener('click', finalizeLowEnergyDecline);
    elements.lowEnergyDeclineBtn.addEventListener('click', finalizeLowEnergyDecline);
    elements.lowEnergyAcceptBtn.addEventListener('click', finalizeLowEnergyAcceptance);
    elements.openLowEnergySwapBtn.addEventListener('click', () => {
        app.renderers.renderLowEnergySwapModal();
        elements.lowEnergySwapModal.classList.remove('hidden');
    });
    elements.closeLowEnergySwapBtn.addEventListener('click', closeLowEnergySwapModal);
    elements.changeLowEnergyResourceBtn.addEventListener('click', () => {
        assignLowEnergyResource(store, { today: getLocalDateString(), cycle: true });
        app.renderers.renderMainScreen();
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

            if (target.dataset.action === 'edit-save-task') {
                saveInlineEdit();
            } else if (target.dataset.action === 'edit-cancel-task') {
                stopInlineEdit();
                renderAllTaskViews();
            } else if (target.dataset.action === 'toggle-task') {
                const updatedTask = toggleTask(store, taskId);
                if (updatedTask?.completed) {
                    advanceBreakdownAfterCompletion(store, taskId);
                }
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
            } else if (target.dataset.action === 'open-copy-task') {
                openCopyTaskModal(taskId);
            } else if (target.dataset.action === 'open-breakdown') {
                openBreakdownFlow(taskId);
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

        container.addEventListener('dblclick', event => {
            const task = event.target.closest('.task-item');
            if (!task?.dataset.taskId) return;

            startInlineEdit(task.dataset.taskId);
            renderAllTaskViews();
            focusInlineEditor(task.dataset.taskId);
        });

        container.addEventListener('input', event => {
            const target = event.target.closest('[data-action="edit-update-text"]');
            if (!target?.dataset.taskId) return;

            if (editTaskState.taskId !== target.dataset.taskId) return;
            editTaskState.text = target.value;
        });

        container.addEventListener('change', event => {
            const target = event.target.closest('[data-action="edit-update-weight"]');
            if (!target?.dataset.taskId) return;

            if (editTaskState.taskId !== target.dataset.taskId) return;
            editTaskState.weight = parseInt(target.value, 10);
        });

        container.addEventListener('keydown', handleInlineEditEnter);
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

        if (target.dataset.action === 'edit-save-task') {
            saveInlineEdit();
            return;
        }

        if (target.dataset.action === 'edit-cancel-task') {
            stopInlineEdit();
            renderAllTaskViews();
            return;
        }

        if (target.dataset.action === 'open-copy-task') {
            openCopyTaskModal(taskId);
            return;
        }

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

    elements.archiveList.addEventListener('dblclick', event => {
        const task = event.target.closest('.task-item');
        if (!task?.dataset.taskId) return;

        startInlineEdit(task.dataset.taskId);
        renderAllTaskViews();
        focusInlineEditor(task.dataset.taskId);
    });

    elements.archiveList.addEventListener('input', event => {
        const target = event.target.closest('[data-action="edit-update-text"]');
        if (!target?.dataset.taskId || editTaskState.taskId !== target.dataset.taskId) return;

        editTaskState.text = target.value;
    });

    elements.archiveList.addEventListener('change', event => {
        const target = event.target.closest('[data-action="edit-update-weight"]');
        if (!target?.dataset.taskId || editTaskState.taskId !== target.dataset.taskId) return;

        editTaskState.weight = parseInt(target.value, 10);
    });

    elements.archiveList.addEventListener('keydown', handleInlineEditEnter);

    elements.lowEnergySwapList.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target || target.dataset.action !== 'choose-low-energy-task') return;

        const taskId = target.dataset.taskId;
        if (!taskId) return;

        const swappedTask = swapLowEnergyKeptTask(store, { nextTaskId: taskId, today: getLocalDateString() });
        if (!swappedTask) return;

        closeLowEnergySwapModal();
        app.renderers.renderMainScreen();
        app.renderers.renderArchive();
        app.renderers.renderWeeklyScreen();
    });

    elements.completedList.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target) return;

        const taskId = target.dataset.taskId;
        if (!taskId) return;

        if (target.dataset.action === 'edit-save-task') {
            saveInlineEdit();
            return;
        }

        if (target.dataset.action === 'edit-cancel-task') {
            stopInlineEdit();
            renderAllTaskViews();
            return;
        }

        if (target.dataset.action === 'open-copy-task') {
            openCopyTaskModal(taskId);
            return;
        }

        if (target.dataset.action !== 'done-delete-task') return;

        deleteTask(store, taskId);
        app.renderers.renderCompleted();
    });

    elements.completedList.addEventListener('dblclick', event => {
        const task = event.target.closest('.task-item');
        if (!task?.dataset.taskId) return;

        startInlineEdit(task.dataset.taskId);
        renderAllTaskViews();
        focusInlineEditor(task.dataset.taskId);
    });

    elements.completedList.addEventListener('input', event => {
        const target = event.target.closest('[data-action="edit-update-text"]');
        if (!target?.dataset.taskId || editTaskState.taskId !== target.dataset.taskId) return;

        editTaskState.text = target.value;
    });

    elements.completedList.addEventListener('change', event => {
        const target = event.target.closest('[data-action="edit-update-weight"]');
        if (!target?.dataset.taskId || editTaskState.taskId !== target.dataset.taskId) return;

        editTaskState.weight = parseInt(target.value, 10);
    });

    elements.completedList.addEventListener('keydown', handleInlineEditEnter);

    [elements.inboxList, elements.inboxSortCard].forEach(container => {
        container.addEventListener('click', event => {
            const target = closestActionTarget(event.target);
            if (!target) return;

            handleInboxAction(target.dataset.action, target.dataset.inboxId);
        });

        container.addEventListener('change', event => {
            const target = event.target.closest('[data-action]');
            if (!target) return;

            if (target.dataset.action === 'inbox-update-weight') {
                inboxState.pendingAction.weight = parseInt(target.value, 10) || 20;
                app.renderers.renderMainScreen();
                app.renderers.renderInboxSortModal();
            }

            if (target.dataset.action === 'inbox-update-date') {
                inboxState.pendingAction.date = target.value || getLocalDateString();
                app.renderers.renderMainScreen();
                app.renderers.renderInboxSortModal();
            }
        });
    });

    elements.inboxVoiceDraftList.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target || target.dataset.action !== 'inbox-voice-remove-draft') return;

        inboxState.drafts = inboxState.drafts.filter(draft => draft.id !== target.dataset.draftId);
        if (inboxState.drafts.length === 0) {
            openInboxVoiceMessage('Черновик опустел. Можно надиктовать мысли ещё раз или записать их текстом.');
            return;
        }

        app.renderers.renderInboxVoiceModal();
    });

    elements.inboxVoiceDraftList.addEventListener('input', event => {
        const target = event.target.closest('[data-action="inbox-voice-update-text"]');
        if (!target) return;

        const draft = inboxState.drafts.find(item => item.id === target.dataset.draftId);
        if (!draft) return;

        draft.text = target.value;
    });

    elements.voiceDraftList.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target || target.dataset.action !== 'voice-remove-draft') return;

        voiceState.voiceDraft = voiceState.voiceDraft.filter(draft => draft.id !== target.dataset.draftId);
        if (voiceState.voiceDraft.length === 0) {
            openVoiceMessage('Черновик опустел. Можно попробовать надиктовать задачи ещё раз.');
            return;
        }

        app.renderers.renderVoiceModal();
    });

    elements.voiceDraftList.addEventListener('input', event => {
        const target = event.target.closest('[data-action="voice-update-text"]');
        if (!target) return;

        const draft = voiceState.voiceDraft.find(item => item.id === target.dataset.draftId);
        if (!draft) return;

        draft.text = target.value;
    });

    elements.voiceDraftList.addEventListener('change', event => {
        const target = event.target.closest('[data-action]');
        if (!target) return;

        const draft = voiceState.voiceDraft.find(item => item.id === target.dataset.draftId);
        if (!draft) return;

        if (target.dataset.action === 'voice-update-weight') {
            draft.suggestedWeight = parseInt(target.value, 10);
        }

        if (target.dataset.action === 'voice-update-date') {
            draft.suggestedDate = target.value;
        }
    });

    elements.breakdownDraftList.addEventListener('input', event => {
        const target = event.target.closest('[data-action="breakdown-update-text"]');
        if (!target) return;

        const draft = breakdownState.drafts.find(item => item.id === target.dataset.draftId);
        if (!draft) return;

        draft.text = target.value;
        elements.breakdownConfirmBtn.disabled = breakdownState.drafts.some(item => !item.text.trim());
    });

    elements.breakdownDraftList.addEventListener('change', event => {
        const target = event.target.closest('[data-action="breakdown-update-weight"]');
        if (!target) return;

        const draft = breakdownState.drafts.find(item => item.id === target.dataset.draftId);
        if (!draft) return;

        draft.weight = parseInt(target.value, 10) === 10 ? 10 : 5;
    });

    elements.breakdownDraftList.addEventListener('keydown', event => {
        const input = event.target.closest('[data-action="breakdown-update-text"]');
        if (!input || event.key !== 'Enter' || event.shiftKey) return;

        event.preventDefault();
        elements.breakdownConfirmBtn.click();
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
            target.textContent = 'OK';
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
            event.stopImmediatePropagation();

            const { template } = addAllTemplateTasksToDay(store, target.dataset.templateId);
            elements.templatesModal.classList.add('hidden');
            app.renderers.renderMainScreen();
            app.renderers.renderWeeklyScreen();

            if (template && !template.hasAskedAutoAdd) {
                openTemplateAutoModal(template.id);
            }
            return;
        }

        if (target.dataset.action === 'toggle-template-daily') {
            event.stopImmediatePropagation();

            const template = store.getState().templates.find(item => item.id === target.dataset.templateId);
            if (!template) return;

            setTemplateDailyPreference(store, {
                templateId: template.id,
                autoAddDaily: !template.autoAddDaily,
                hasAskedAutoAdd: true,
                lastAutoAddedDate: !template.autoAddDaily ? getLocalDateString() : null,
            });
            app.renderers.renderTemplates();
        }
    }, true);

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
            target.textContent = 'OK';
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

    elements.easyPatternPanel.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target) return;

        if (target.dataset.action === 'easy-pattern-select') {
            selectEasyPatternScenario(target.dataset.scenario);
            return;
        }

        if (target.dataset.action === 'easy-pattern-back') {
            clearEasyPatternSelection({ keepFeedback: true });
            app.renderers.renderMainScreen();
            return;
        }

        if (target.dataset.action === 'easy-pattern-dismiss') {
            dismissTodayEasyPattern();
            return;
        }

        if (target.dataset.action === 'easy-pattern-cycle-resource') {
            cycleEasyPatternResource();
            return;
        }

        if (target.dataset.action === 'easy-pattern-confirm') {
            applySelectedEasyPatternScenario();
            return;
        }

        if (target.dataset.action === 'easy-pattern-clear-feedback') {
            easyPatternState.feedback = '';
            app.renderers.renderMainScreen();
        }
    });

    elements.weeklyContainer.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target || target.dataset.action !== 'open-weekly-task-modal') return;

        runtime.currentWeeklyTaskDate = target.dataset.date;
        elements.weeklyTaskModal.classList.remove('hidden');
        elements.weeklyTaskText.focus();
    });

    elements.weeklyContainer.addEventListener('dblclick', event => {
        const task = event.target.closest('.weekly-task');
        if (!task?.dataset.taskId) return;

        startInlineEdit(task.dataset.taskId);
        renderAllTaskViews();
        focusInlineEditor(task.dataset.taskId);
    });

    elements.weeklyContainer.addEventListener('click', event => {
        const target = closestActionTarget(event.target);
        if (!target?.dataset.taskId) return;

        if (target.dataset.action === 'weekly-delete-task') {
            deleteTask(store, target.dataset.taskId);
            if (editTaskState.taskId === target.dataset.taskId) {
                stopInlineEdit();
            }
            renderAllTaskViews();
            return;
        }

        if (target.dataset.action === 'edit-save-task') {
            saveInlineEdit();
            return;
        }

        if (target.dataset.action === 'edit-cancel-task') {
            stopInlineEdit();
            renderAllTaskViews();
        }
    });

    elements.weeklyContainer.addEventListener('input', event => {
        const target = event.target.closest('[data-action="edit-update-text"]');
        if (!target?.dataset.taskId || editTaskState.taskId !== target.dataset.taskId) return;

        editTaskState.text = target.value;
    });

    elements.weeklyContainer.addEventListener('change', event => {
        const target = event.target.closest('[data-action="edit-update-weight"]');
        if (!target?.dataset.taskId || editTaskState.taskId !== target.dataset.taskId) return;

        editTaskState.weight = parseInt(target.value, 10);
    });

    elements.weeklyContainer.addEventListener('keydown', handleInlineEditEnter);

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
