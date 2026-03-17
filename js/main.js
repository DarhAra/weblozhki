import { collectElements } from './ui/elements.js';
import { createStore } from './state/store.js';
import { createRenderers } from './ui/renderers.js';
import { createScreens } from './ui/screens.js';
import { createOnboardingController } from './onboarding/index.js';
import { bindAppEvents } from './ui/bindings.js';
import { getLocalDateString } from './utils/date.js';
import { getOverdueTasks } from './domain/tasks.js';
import { buildMoodHistoryEntry, createCurrentDayMeta, upsertMoodHistoryEntry } from './domain/history.js';

const builtinAdvices = [
    'Выпить стакан чистой воды',
    'Сделать 5 глубоких вдохов и выдохов',
    'Посмотреть в окно на небо пару минут',
    'Сделать легкую разминку для шеи',
    'Послушать одну любимую спокойную песню',
    'Отложить телефон на 15 минут',
    'Заварить вкусный чай',
];

export function initApp({ elements }) {
    const store = createStore();
    const app = {
        elements,
        store,
        runtime: {
            builtinAdvices,
            currentAdvice: '',
            currentWeeklyTaskDate: null,
            sosView: null,
            voice: {
                isSupported: false,
                isListening: false,
                isProcessing: false,
                lastTranscript: '',
                voiceDraft: [],
                voiceError: '',
                modalMode: 'hidden',
            },
        },
    };

    app.renderers = createRenderers(app);
    app.onboarding = createOnboardingController(app);
    app.screens = createScreens(app);
    bindAppEvents(app);

    store.loadState();

    const today = getLocalDateString();
    store.updateState(state => {
        state.tasks.forEach(task => {
            if (task.postponedTo && !task.targetDate) {
                task.targetDate = task.postponedTo;
                delete task.postponedTo;
            }
            if (task.targetDate === undefined) {
                task.targetDate = state.lastDate || today;
            }
        });
    });

    const state = store.getState();
    if (!state.hasOnboarded) {
        app.screens.showOnboardingScreen();
        return app;
    }

    if (state.pendingReviewDate === today) {
        const pendingTasks = getOverdueTasks(state, today);
        if (pendingTasks.length > 0) {
            app.screens.showReviewScreen(pendingTasks);
            return app;
        }

        store.updateState(currentState => {
            currentState.pendingReviewDate = null;
            currentState.lastDate = today;
            currentState.energyBudget = null;
        });
    }

    if (state.lastDate !== today) {
        store.updateState(currentState => {
            const previousDayEntry = buildMoodHistoryEntry(currentState, currentState.lastDate);
            currentState.moodHistory = upsertMoodHistoryEntry(currentState.moodHistory, previousDayEntry);
        });

        store.updateState(currentState => {
            currentState.tasks = currentState.tasks.filter(task => !task.completed);
        });

        const overdueTasks = getOverdueTasks(store.getState(), today);
        if (overdueTasks.length > 0) {
            store.updateState(currentState => {
                currentState.pendingReviewDate = today;
                currentState.currentDayMeta = createCurrentDayMeta(today);
            });
            app.screens.showReviewScreen(overdueTasks);
            return app;
        }

        store.updateState(currentState => {
            currentState.lastDate = today;
            currentState.pendingReviewDate = null;
            currentState.energyBudget = null;
            currentState.currentDayMeta = createCurrentDayMeta(today);
        });
        app.screens.showMorningScreen();
        return app;
    }

    if (state.energyBudget === null) {
        app.screens.showMorningScreen();
    } else {
        app.screens.showMainScreen();
    }

    return app;
}

function bootstrap() {
    initApp({ elements: collectElements(document) });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
}
