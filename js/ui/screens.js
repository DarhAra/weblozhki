export function createScreens(app) {
    const { elements } = app;

    function hidePrimaryScreens() {
        elements.authScreen.classList.add('hidden');
        elements.onboardingScreen.classList.add('hidden');
        elements.morningScreen.classList.add('hidden');
        elements.mainScreen.classList.add('hidden');
        elements.reviewScreen.classList.add('hidden');
        elements.weeklyScreen.classList.add('hidden');
        elements.historyScreen.classList.add('hidden');
    }

    function hideSecondaryModals() {
        elements.weeklyTaskModal.classList.add('hidden');
        elements.libraryModal.classList.add('hidden');
        elements.archiveModal.classList.add('hidden');
        elements.completedModal.classList.add('hidden');
        elements.accountModal.classList.add('hidden');
        elements.forgotPasswordModal.classList.add('hidden');
        elements.changePasswordModal.classList.add('hidden');
        elements.templatesModal.classList.add('hidden');
        elements.templateAutoModal.classList.add('hidden');
        elements.breakdownIntroModal.classList.add('hidden');
        elements.breakdownEditorModal.classList.add('hidden');
        elements.lowEnergyModal.classList.add('hidden');
        elements.lowEnergySwapModal.classList.add('hidden');
        elements.helperModal.classList.add('hidden');
        elements.voiceModal.classList.add('hidden');
        elements.inboxVoiceModal.classList.add('hidden');
        elements.inboxSortModal.classList.add('hidden');
        elements.sosModal.classList.add('hidden');
        elements.allDoneModal.classList.add('hidden');
    }

    function showOnboardingScreen() {
        hidePrimaryScreens();
        hideSecondaryModals();
        elements.onboardingScreen.classList.remove('hidden');
        app.onboarding.activate();
    }

    function showAuthScreen() {
        hidePrimaryScreens();
        hideSecondaryModals();
        elements.authScreen.classList.remove('hidden');
        app.renderers.renderAuthScreen();
    }

    function showMorningScreen() {
        const state = app.store.getState();
        hidePrimaryScreens();
        hideSecondaryModals();
        elements.morningScreen.classList.remove('hidden');
        elements.finishReviewBtn.classList.add('hidden');

        const displayName = state.userName ? `, ${state.userName}` : '';
        elements.morningTitle.textContent = `Доброе утро${displayName}.`;
        elements.energyInput.value = 50;
        elements.energyDisplay.textContent = 50;
    }

    function showMainScreen() {
        const state = app.store.getState();
        hidePrimaryScreens();
        elements.mainScreen.classList.remove('hidden');
        elements.appHelperAvatar.src = state.avatar;
        elements.balanceMessageAvatar.src = state.avatar;
        app.renderers.renderMainScreen();
    }

    function showWeeklyScreen() {
        hidePrimaryScreens();
        hideSecondaryModals();
        elements.weeklyScreen.classList.remove('hidden');
        app.renderers.renderWeeklyScreen();
    }

    function showHistoryScreen() {
        hidePrimaryScreens();
        hideSecondaryModals();
        elements.historyScreen.classList.remove('hidden');
        app.renderers.renderHistoryScreen();
    }

    function showReviewScreen(tasks) {
        hidePrimaryScreens();
        hideSecondaryModals();
        elements.reviewScreen.classList.remove('hidden');
        app.renderers.renderReviewTasks(tasks);
        elements.finishReviewBtn.classList.remove('hidden');
        elements.finishReviewBtn.textContent = 'Оставшееся в «На потом»';
    }

    return {
        showAuthScreen,
        showOnboardingScreen,
        showMorningScreen,
        showMainScreen,
        showWeeklyScreen,
        showHistoryScreen,
        showReviewScreen,
    };
}
