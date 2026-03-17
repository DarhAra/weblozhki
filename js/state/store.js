import { getLocalDateString } from '../utils/date.js';
import { createCurrentDayMeta, normalizeMoodHistory } from '../domain/history.js';
import { TASK_STORAGE, getTaskStorageStatus } from '../domain/tasks.js';

const STORAGE_KEY = 'resourceTodoState';

function getDefaultTemplates() {
    return [
        { id: 'tpl_1', name: 'Утро', tasks: [{ id: 'tt_11', text: 'Выпить воду', weight: 5 }, { id: 'tt_12', text: 'Принять лекарства', weight: 5 }, { id: 'tt_13', text: 'Почистить зубы', weight: 5 }, { id: 'tt_14', text: 'Завтрак-минимум', weight: 5 }] },
        { id: 'tpl_2', name: 'Выход из дома', tasks: [{ id: 'tt_21', text: 'Ключи', weight: 5 }, { id: 'tt_22', text: 'Телефон', weight: 5 }, { id: 'tt_23', text: 'Наушники', weight: 5 }, { id: 'tt_24', text: 'Проверить плиту', weight: 5 }, { id: 'tt_25', text: 'Проверить розетки', weight: 5 }, { id: 'tt_26', text: 'Проверить входную дверь', weight: 5 }] },
        { id: 'tpl_3', name: 'Вечер', tasks: [{ id: 'tt_31', text: 'Поставить устройства на зарядку', weight: 5 }, { id: 'tt_32', text: 'Проветрить', weight: 5 }, { id: 'tt_33', text: 'Вечерние таблетки', weight: 5 }] },
        { id: 'tpl_4', name: 'Low Energy Day (SOS)', tasks: [{ id: 'tt_41', text: 'Делегировать/отложить дела', weight: 5 }, { id: 'tt_42', text: 'Пить воду', weight: 5 }, { id: 'tt_43', text: 'Лежать в тишине', weight: 5 }] },
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
        resources: [
            { id: 'res_1', text: 'Попить кофе' },
            { id: 'res_2', text: '10 минут соцсетей' },
            { id: 'res_3', text: 'Прогулка 15 минут' },
        ],
        templates: [],
    };
}

function ensureTemplateMigrations(state) {
    const exitHomeTemplate = state.templates.find(template => template.id === 'tpl_2');
    if (!exitHomeTemplate?.tasks) {
        return;
    }

    if (!exitHomeTemplate.tasks.find(task => task.id === 'tt_25')) {
        exitHomeTemplate.tasks.push({ id: 'tt_25', text: 'Проверить розетки', weight: 5 });
    }

    if (!exitHomeTemplate.tasks.find(task => task.id === 'tt_26')) {
        exitHomeTemplate.tasks.push({ id: 'tt_26', text: 'Проверить входную дверь', weight: 5 });
    }
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
            return state;
        }

        try {
            state = { ...state, ...JSON.parse(saved) };
            if (!Array.isArray(state.tasks)) state.tasks = [];
            if (!Array.isArray(state.resources)) state.resources = [];
            state.moodHistory = normalizeMoodHistory(state.moodHistory);

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

            const today = getLocalDateString();
            const hasOverdue = state.tasks.some(task => task.targetDate && task.targetDate < today);
            if (!state.pendingReviewDate && state.lastDate !== today && hasOverdue) {
                state.pendingReviewDate = today;
            }
        } catch (error) {
            console.error('Failed to load state', error);
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
