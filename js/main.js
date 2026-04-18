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
import {
    clearOfflineAuthSnapshot,
    readOfflineAuthSnapshot,
    saveOfflineAuthSnapshot,
} from './services/offline-auth.js';

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
                notice: '',
                isOfflineAuthenticated: false,
                hasPendingOfflineChanges: false,
                resetToken: null,
                forgotPassword: {
                    status: 'idle',
                    email: '',
                    error: '',
                    message: '',
                },
                accountProfile: {
                    status: 'idle',
                    error: '',
                },
                payments: {
                    status: 'idle',
                    error: '',
                    support: null,
                    latestDonation: null,
                    checkout: {
                        currency: 'RUB',
                        allowedAmounts: [149, 299, 499],
                        minAmount: 100,
                        maxAmount: 5000,
                    },
                    selectedAmount: 149,
                    customAmount: '',
                    returnDonationId: null,
                    returnStatus: 'idle',
                    returnMessage: '',
                },
                passwordChange: {
                    status: 'idle',
                    error: '',
                    message: '',
                },
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
            easyPattern: {
                selectedScenario: null,
                trigger: null,
                preview: null,
                resourceSuggestionId: null,
                feedback: '',
            },
            templateAutoPrompt: {
                templateId: null,
            },
            persistenceStatus: store.getPersistenceStatus?.() || {
                mode: 'local-fallback',
                message: '',
                hasPendingOfflineChanges: false,
                privateDataAvailableOffline: true,
            },
        },
    };

    app.renderers = createRenderers(app);
    app.onboarding = createOnboardingController(app);
    app.screens = createScreens(app);
    app.startAuthenticatedFlow = async (user, options = {}) => {
        const isOfflineAuthenticated = Boolean(options.isOfflineAuthenticated);
        app.runtime.auth.user = user || null;
        app.runtime.auth.status = 'authenticated';
        app.runtime.auth.error = '';
        app.runtime.auth.isOfflineAuthenticated = isOfflineAuthenticated;
        store.setSessionContext({
            authenticated: true,
            userId: user?.id || null,
        });
        if (!isOfflineAuthenticated && user) {
            saveOfflineAuthSnapshot(user);
        }
        const result = await startAuthenticatedFlow(app);
        if (!isOfflineAuthenticated && typeof app.handlePaymentReturn === 'function') {
            await app.handlePaymentReturn();
        }
        return result;
    };
    bindAppEvents(app);
    store.setPersistenceStatusListener?.(status => {
        app.runtime.persistenceStatus = status;
        app.runtime.auth.hasPendingOfflineChanges = Boolean(status?.hasPendingOfflineChanges);
        app.renderers.renderPersistenceStatus();
    });

    app.screens.showAuthScreen();

    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const resetToken = params.get('resetToken');
        const paymentReturn = params.get('paymentReturn');
        const paymentDonationId = params.get('donationId');
        if (resetToken) {
            app.runtime.auth.mode = 'reset-password';
            app.runtime.auth.resetToken = resetToken;
        }
        if (paymentReturn === '1' && paymentDonationId) {
            app.runtime.auth.payments.returnDonationId = paymentDonationId;
        }

        window.addEventListener('online', async () => {
            const syncSucceeded = await store.syncPendingState?.();
            if (syncSucceeded && app.runtime.auth.isOfflineAuthenticated) {
                try {
                    const session = await auth.checkSession();
                    if (session?.authenticated && session.user) {
                        app.runtime.auth.user = session.user;
                        app.runtime.auth.isOfflineAuthenticated = false;
                        saveOfflineAuthSnapshot(session.user);
                    }
                } catch {
                    // Keep the offline session until the server session is available again.
                }
            }

            app.runtime.persistenceStatus = store.getPersistenceStatus?.() || app.runtime.persistenceStatus;
            app.renderers.renderPersistenceStatus();
            app.renderers.renderMainScreen();
        });

        window.addEventListener('offline', () => {
            app.runtime.persistenceStatus = store.getPersistenceStatus?.() || app.runtime.persistenceStatus;
            app.renderers.renderPersistenceStatus();
            app.renderers.renderMainScreen();
        });
    }

    try {
        const session = await auth.checkSession();
        if (!session.authenticated || !session.user) {
            clearOfflineAuthSnapshot();
            await store.clearOfflineCache?.({ includeGuest: true });
            app.runtime.auth.mode = 'login';
            app.runtime.auth.status = 'guest';
            app.runtime.auth.user = null;
            app.runtime.auth.error = '';
            app.runtime.auth.isOfflineAuthenticated = false;
            store.setSessionContext({ authenticated: false, userId: null });
            app.screens.showAuthScreen();
            return app;
        }

        await app.startAuthenticatedFlow(session.user);
    } catch (error) {
        const offlineSnapshot = error?.isNetworkError ? readOfflineAuthSnapshot() : null;
        if (offlineSnapshot) {
            const offlineUser = {
                id: offlineSnapshot.userId,
                name: offlineSnapshot.name,
                email: offlineSnapshot.email,
                createdAt: offlineSnapshot.lastAuthenticatedAt,
            };

            app.runtime.auth.mode = 'login';
            app.runtime.auth.status = 'authenticated';
            app.runtime.auth.user = offlineUser;
            app.runtime.auth.error = '';
            app.runtime.auth.notice = '';
            app.runtime.auth.isOfflineAuthenticated = true;
            await app.startAuthenticatedFlow(offlineUser, { isOfflineAuthenticated: true });
            return app;
        }

        app.runtime.auth.mode = 'login';
        app.runtime.auth.status = 'guest';
        app.runtime.auth.user = null;
        app.runtime.auth.error = error?.friendlyMessage || 'Сейчас не получается проверить вход. Попробуй чуть позже.';
        app.runtime.auth.isOfflineAuthenticated = false;
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
