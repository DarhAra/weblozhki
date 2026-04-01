import { collectElements } from './ui/elements.js';
import { createStore } from './state/store.js';
import { createRenderers } from './ui/renderers.js';
import { createScreens } from './ui/screens.js';
import { createOnboardingController } from './onboarding/index.js';
import { bindAppEvents } from './ui/bindings.js';
import { getLocalDateString } from './utils/date.js';
import { getOverdueTasks } from './domain/tasks.js';
import { buildMoodHistoryEntry, createCurrentDayMeta, upsertMoodHistoryEntry } from './domain/history.js';
import { applyDailyTemplatesForDate } from './domain/templates.js';
import { createAuthService } from './services/auth.js';

const builtinAdvices = [
    'Выпить стакан чистой воды',
    'Сделать 5 глубоких вдохов и выдохов',
    'Посмотреть в окно на небо пару минут',
    'Сделать легкую разминку для шеи',
    'Послушать одну любимую спокойную песню',
    'Отложить телефон на 15 минут',
    'Заварить вкусный чай',
];

function shouldOfferLowEnergyDay(state, today = getLocalDateString()) {
    return state.lastDate === today
        && state.energyBudget !== null
        && state.energyBudget >= 10
        && state.energyBudget <= 15
        && state.currentDayMeta?.date === today
        && !state.currentDayMeta.lowEnergyPromptHandled;
}

async function startAuthenticatedFlow(app) {
    const { elements, store } = app;
    const today = getLocalDateString();

    await store.loadState({ allowLegacyGuestBootstrap: false });

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
        applyDailyTemplatesForDate(store, today);
        app.screens.showMainScreen();
        if (shouldOfferLowEnergyDay(store.getState(), today)) {
            elements.lowEnergyAvatar.src = store.getState().avatar;
            elements.lowEnergyModal.classList.remove('hidden');
        }
    }

    return app;
}

export async function initApp({ elements }) {
    const store = createStore();
    const auth = createAuthService();
    const app = {
        elements,
        store,
        auth,
        runtime: {
            builtinAdvices,
            currentAdvice: '',
            currentWeeklyTaskDate: null,
            sosView: null,
            auth: {
                status: 'checking',
                mode: 'login',
                user: null,
                error: '',
            },
            voice: {
                isSupported: false,
                isListening: false,
                isProcessing: false,
                lastTranscript: '',
                voiceDraft: [],
                voiceError: '',
                modalMode: 'hidden',
            },
            inbox: {
                isSupported: false,
                isListening: false,
                isProcessing: false,
                drafts: [],
                error: '',
                modalMode: 'hidden',
                pendingAction: {
                    itemId: null,
                    mode: null,
                    weight: 20,
                    date: getLocalDateString(),
                },
                sortMode: false,
            },
            breakdown: {
                taskId: null,
                mode: 'intro',
                drafts: [],
                sourceInboxId: null,
                sourceText: '',
            },
            editTask: {
                taskId: null,
                text: '',
                weight: 20,
                isResource: false,
            },
            copyTask: {
                taskId: null,
                targetDate: getLocalDateString(),
            },
            templateAutoPrompt: {
                templateId: null,
            },
            persistenceStatus: store.getPersistenceStatus?.() || {
                mode: 'local-fallback',
                message: '',
            },
        },
    };

    app.renderers = createRenderers(app);
    app.onboarding = createOnboardingController(app);
    app.screens = createScreens(app);
    app.startAuthenticatedFlow = async user => {
        app.runtime.auth.user = user || null;
        app.runtime.auth.status = 'authenticated';
        app.runtime.auth.error = '';
        store.setSessionContext({
            authenticated: true,
            userId: user?.id || null,
        });
        return startAuthenticatedFlow(app);
    };
    bindAppEvents(app);
    store.setPersistenceStatusListener?.(status => {
        app.runtime.persistenceStatus = status;
        app.renderers.renderPersistenceStatus();
    });

    app.screens.showAuthScreen();

    try {
        const session = await auth.checkSession();
        if (!session.authenticated || !session.user) {
            app.runtime.auth.mode = 'login';
            app.runtime.auth.status = 'guest';
            app.runtime.auth.user = null;
            app.runtime.auth.error = '';
            store.setSessionContext({ authenticated: false, userId: null });
            app.screens.showAuthScreen();
            return app;
        }

        await app.startAuthenticatedFlow(session.user);
    } catch (error) {
        app.runtime.auth.mode = 'login';
        app.runtime.auth.status = 'guest';
        app.runtime.auth.user = null;
        app.runtime.auth.error = error?.friendlyMessage || 'Сейчас не получается проверить вход. Попробуй чуть позже.';
        store.setSessionContext({ authenticated: false, userId: null });
        app.screens.showAuthScreen();
    }

    return app;
}

async function bootstrap() {
    await initApp({ elements: collectElements(document) });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            void bootstrap();
        });
    } else {
        void bootstrap();
    }
}
