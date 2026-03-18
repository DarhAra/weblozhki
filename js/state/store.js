import { getLocalDateString } from '../utils/date.js';
import { createCurrentDayMeta, normalizeCurrentDayMeta, normalizeMoodHistory } from '../domain/history.js';
import { TASK_STORAGE, getTaskStorageStatus } from '../domain/tasks.js';

const STORAGE_KEY = 'resourceTodoState';

function getDefaultTemplates() {
    return [
        {
            id: 'tpl_1',
            name: '\u0423\u0442\u0440\u043e',
            autoAddDaily: false,
            hasAskedAutoAdd: false,
            lastAutoAddedDate: null,
            tasks: [
                { id: 'tt_11', text: '\u0412\u044b\u043f\u0438\u0442\u044c \u0432\u043e\u0434\u0443', weight: 5 },
                { id: 'tt_12', text: '\u041f\u0440\u0438\u043d\u044f\u0442\u044c \u043b\u0435\u043a\u0430\u0440\u0441\u0442\u0432\u0430', weight: 5 },
                { id: 'tt_13', text: '\u041f\u043e\u0447\u0438\u0441\u0442\u0438\u0442\u044c \u0437\u0443\u0431\u044b', weight: 5 },
                { id: 'tt_14', text: '\u0417\u0430\u0432\u0442\u0440\u0430\u043a-\u043c\u0438\u043d\u0438\u043c\u0443\u043c', weight: 5 },
            ],
        },
        {
            id: 'tpl_2',
            name: '\u0412\u044b\u0445\u043e\u0434 \u0438\u0437 \u0434\u043e\u043c\u0430',
            autoAddDaily: false,
            hasAskedAutoAdd: false,
            lastAutoAddedDate: null,
            tasks: [
                { id: 'tt_21', text: '\u041a\u043b\u044e\u0447\u0438', weight: 5 },
                { id: 'tt_22', text: '\u0422\u0435\u043b\u0435\u0444\u043e\u043d', weight: 5 },
                { id: 'tt_23', text: '\u041d\u0430\u0443\u0448\u043d\u0438\u043a\u0438', weight: 5 },
                { id: 'tt_24', text: '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u043f\u043b\u0438\u0442\u0443', weight: 5 },
                { id: 'tt_25', text: '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0440\u043e\u0437\u0435\u0442\u043a\u0438', weight: 5 },
                { id: 'tt_26', text: '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0432\u0445\u043e\u0434\u043d\u0443\u044e \u0434\u0432\u0435\u0440\u044c', weight: 5 },
            ],
        },
        {
            id: 'tpl_3',
            name: '\u0412\u0435\u0447\u0435\u0440',
            autoAddDaily: false,
            hasAskedAutoAdd: false,
            lastAutoAddedDate: null,
            tasks: [
                { id: 'tt_31', text: '\u041f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u0430 \u043d\u0430 \u0437\u0430\u0440\u044f\u0434\u043a\u0443', weight: 5 },
                { id: 'tt_32', text: '\u041f\u0440\u043e\u0432\u0435\u0442\u0440\u0438\u0442\u044c', weight: 5 },
                { id: 'tt_33', text: '\u0412\u0435\u0447\u0435\u0440\u043d\u0438\u0435 \u0442\u0430\u0431\u043b\u0435\u0442\u043a\u0438', weight: 5 },
            ],
        },
        {
            id: 'tpl_4',
            name: 'SOS-день',
            autoAddDaily: false,
            hasAskedAutoAdd: false,
            lastAutoAddedDate: null,
            tasks: [
                { id: 'tt_41', text: '\u0412\u044b\u043f\u0438\u0442\u044c \u0432\u043e\u0434\u044b', weight: 5 },
                { id: 'tt_42', text: '\u041f\u043e\u0435\u0441\u0442\u044c \u0438\u043b\u0438 \u0432\u0437\u044f\u0442\u044c \u043f\u0435\u0440\u0435\u043a\u0443\u0441', weight: 5 },
                { id: 'tt_43', text: '\u041f\u0440\u0438\u043d\u044f\u0442\u044c \u043b\u0435\u043a\u0430\u0440\u0441\u0442\u0432\u0430 \u0438\u043b\u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0431\u0430\u0437\u043e\u0432\u044b\u0439 \u0443\u0445\u043e\u0434', weight: 5 },
                { id: 'tt_44', text: '\u041f\u043e\u043b\u0435\u0436\u0430\u0442\u044c \u0438\u043b\u0438 \u043f\u043e\u0441\u0438\u0434\u0435\u0442\u044c \u0432 \u0442\u0438\u0448\u0438\u043d\u0435 10 \u043c\u0438\u043d\u0443\u0442', weight: 5 },
            ],
        },
    ];
}

function getDefaultState() {
    return {
        hasOnboarded: false,
        userName: '',
        gender: 'female',
        avatar: 'assets/girl.png',
        energyBudget: null,
        lastDate: null,
        pendingReviewDate: null,
        currentDayMeta: createCurrentDayMeta(null),
        moodHistory: [],
        tasks: [],
        preferences: {
            breakDownLargeTasksPromptMode: 'ask-first-time',
        },
        resources: [
            { id: 'res_1', text: '\u041f\u043e\u043f\u0438\u0442\u044c \u043a\u043e\u0444\u0435' },
            { id: 'res_2', text: '10 \u043c\u0438\u043d\u0443\u0442 \u0441\u043e\u0446\u0441\u0435\u0442\u0435\u0439' },
            { id: 'res_3', text: '\u041f\u0440\u043e\u0433\u0443\u043b\u043a\u0430 15 \u043c\u0438\u043d\u0443\u0442' },
        ],
        templates: [],
    };
}

function ensurePreferenceDefaults(state) {
    if (!state.preferences || typeof state.preferences !== 'object') {
        state.preferences = {};
    }

    if (typeof state.preferences.breakDownLargeTasksPromptMode !== 'string') {
        state.preferences.breakDownLargeTasksPromptMode = 'ask-first-time';
    }
}

function ensureTemplateDefaults(template) {
    if (typeof template.autoAddDaily !== 'boolean') {
        template.autoAddDaily = false;
    }

    if (typeof template.hasAskedAutoAdd !== 'boolean') {
        template.hasAskedAutoAdd = false;
    }

    if (typeof template.lastAutoAddedDate !== 'string') {
        template.lastAutoAddedDate = null;
    }

    if (!Array.isArray(template.tasks)) {
        template.tasks = [];
    }
}

function ensureTemplateMigrations(state) {
    state.templates.forEach(ensureTemplateDefaults);

    const exitHomeTemplate = state.templates.find(template => template.id === 'tpl_2');
    if (!exitHomeTemplate?.tasks) {
        return;
    }

    if (!exitHomeTemplate.tasks.find(task => task.id === 'tt_25')) {
        exitHomeTemplate.tasks.push({ id: 'tt_25', text: '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0440\u043e\u0437\u0435\u0442\u043a\u0438', weight: 5 });
    }

    if (!exitHomeTemplate.tasks.find(task => task.id === 'tt_26')) {
        exitHomeTemplate.tasks.push({ id: 'tt_26', text: '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0432\u0445\u043e\u0434\u043d\u0443\u044e \u0434\u0432\u0435\u0440\u044c', weight: 5 });
    }

    const sosTemplate = state.templates.find(template => template.id === 'tpl_4');
    if (!sosTemplate?.tasks) {
        return;
    }

    const sosTaskMap = {
        tt_41: '\u0412\u044b\u043f\u0438\u0442\u044c \u0432\u043e\u0434\u044b',
        tt_42: '\u041f\u043e\u0435\u0441\u0442\u044c \u0438\u043b\u0438 \u0432\u0437\u044f\u0442\u044c \u043f\u0435\u0440\u0435\u043a\u0443\u0441',
        tt_43: '\u041f\u0440\u0438\u043d\u044f\u0442\u044c \u043b\u0435\u043a\u0430\u0440\u0441\u0442\u0432\u0430 \u0438\u043b\u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0431\u0430\u0437\u043e\u0432\u044b\u0439 \u0443\u0445\u043e\u0434',
        tt_44: '\u041f\u043e\u043b\u0435\u0436\u0430\u0442\u044c \u0438\u043b\u0438 \u043f\u043e\u0441\u0438\u0434\u0435\u0442\u044c \u0432 \u0442\u0438\u0448\u0438\u043d\u0435 10 \u043c\u0438\u043d\u0443\u0442',
    };

    sosTemplate.name = 'SOS-день';
    Object.entries(sosTaskMap).forEach(([taskId, text]) => {
        const existingTask = sosTemplate.tasks.find(task => task.id === taskId);
        if (existingTask) {
            existingTask.text = text;
            existingTask.weight = 5;
        } else {
            sosTemplate.tasks.push({ id: taskId, text, weight: 5 });
        }
    });
}

export function createStore() {
    let state = getDefaultState();

    function getState() {
        return state;
    }

    function setState(nextState) {
        state = nextState;
        return state;
    }

    function saveState(nextState = state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }

    function updateState(mutator, options = { save: true }) {
        mutator(state);
        if (options.save !== false) {
            saveState();
        }
        return state;
    }

    function loadState() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            state.templates = getDefaultTemplates();
            return state;
        }

        try {
            const today = getLocalDateString();
            state = { ...state, ...JSON.parse(saved) };

            if (!Array.isArray(state.tasks)) state.tasks = [];
            if (!Array.isArray(state.resources)) state.resources = [];
            state.moodHistory = normalizeMoodHistory(state.moodHistory);
            ensurePreferenceDefaults(state);

            if (!Array.isArray(state.templates) || state.templates.length === 0) {
                state.templates = getDefaultTemplates();
            } else {
                ensureTemplateMigrations(state);
            }

            if (typeof state.pendingReviewDate !== 'string') {
                state.pendingReviewDate = null;
            }

            if (!state.currentDayMeta || typeof state.currentDayMeta !== 'object') {
                state.currentDayMeta = createCurrentDayMeta(state.lastDate);
            } else {
                state.currentDayMeta = normalizeCurrentDayMeta(state.currentDayMeta, state.currentDayMeta.date || state.lastDate || today);
            }

            if (state.lastDate && state.currentDayMeta.date !== state.lastDate) {
                state.currentDayMeta = createCurrentDayMeta(state.lastDate);
            }

            const seenIds = new Set();
            state.tasks.forEach(task => {
                if (seenIds.has(task.id)) {
                    task.id = `task_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
                }
                seenIds.add(task.id);

                if (typeof task.completedAtDate !== 'string') {
                    task.completedAtDate = null;
                }

                if (typeof task.breakdownParentId !== 'string') {
                    task.breakdownParentId = null;
                }

                if (!Array.isArray(task.breakdownChildIds)) {
                    task.breakdownChildIds = [];
                }

                if (typeof task.breakdownIndex !== 'number') {
                    task.breakdownIndex = null;
                }

                if (typeof task.isBreakdownParent !== 'boolean') {
                    task.isBreakdownParent = false;
                }

                if (typeof task.isBreakdownStep !== 'boolean') {
                    task.isBreakdownStep = false;
                }

                if (typeof task.isHiddenFromMainList !== 'boolean') {
                    task.isHiddenFromMainList = false;
                }

                if (typeof task.showOnlyCurrentStep !== 'boolean') {
                    task.showOnlyCurrentStep = false;
                }

                if (typeof task.isCurrentBreakdownStep !== 'boolean') {
                    task.isCurrentBreakdownStep = false;
                }

                task.storageStatus = getTaskStorageStatus(task);
                task.isArchived = task.storageStatus === TASK_STORAGE.DEFERRED;

                if (task.storageStatus === TASK_STORAGE.ACTIVE && !task.targetDate) {
                    task.targetDate = state.lastDate || today;
                }

                if (task.storageStatus !== TASK_STORAGE.ACTIVE) {
                    task.targetDate = null;
                }
            });

            if (state.avatar && !state.avatar.includes('.png')) {
                state.avatar = 'assets/girl.png';
            }

            const hasOverdue = state.tasks.some(task => task.targetDate && task.targetDate < today);
            if (!state.pendingReviewDate && state.lastDate !== today && hasOverdue) {
                state.pendingReviewDate = today;
            }
        } catch (error) {
            console.error('Failed to load state', error);
            state = getDefaultState();
            state.templates = getDefaultTemplates();
        }

        return state;
    }

    return {
        getState,
        setState,
        saveState,
        updateState,
        loadState,
    };
}
