export function createOnboardingController(app) {
    const { elements, store } = app;
    let currentStep = 1;
    let selectedResources = new Set();
    let initialized = false;

    function checkStep3Valid() {
        if (currentStep !== 3) return;
        const hasName = elements.onboardingNameInput.value.trim().length > 0;
        const hasGender = elements.genderOptions.some(option => option.classList.contains('selected'));
        elements.onboardingNextBtn.disabled = !(hasName && hasGender);
    }

    function checkStep4Valid() {
        if (currentStep !== 4) return;
        elements.onboardingNextBtn.disabled = selectedResources.size === 0
            && elements.onboardingCustomResourceInput.value.trim().length === 0;
    }

    function updateSteps() {
        [
            elements.onboardingStep1,
            elements.onboardingStep2,
            elements.onboardingStep3,
            elements.onboardingStep4,
        ].forEach(step => step.classList.add('hidden'));

        elements.onboardingBackBtn.classList.toggle('hidden', currentStep === 1);

        if (currentStep === 1) {
            elements.onboardingStep1.classList.remove('hidden');
            elements.onboardingNextBtn.disabled = false;
            elements.onboardingNextBtn.textContent = 'Начать';
        } else if (currentStep === 2) {
            elements.onboardingStep2.classList.remove('hidden');
            elements.onboardingNextBtn.textContent = 'Далее';
            elements.onboardingNextBtn.disabled = !elements.avatarOptions.some(option => option.classList.contains('selected'));
        } else if (currentStep === 3) {
            elements.onboardingStep3.classList.remove('hidden');
            elements.onboardingNextBtn.textContent = 'Далее';
            checkStep3Valid();
        } else if (currentStep === 4) {
            elements.onboardingStep4.classList.remove('hidden');
            elements.onboardingNextBtn.textContent = 'Завершить';
            checkStep4Valid();
        }
    }

    function reset() {
        currentStep = 1;
        selectedResources = new Set();
        elements.onboardingNameInput.value = '';
        elements.onboardingCustomResourceInput.value = '';
        elements.avatarOptions.forEach(option => option.classList.remove('selected'));
        elements.genderOptions.forEach(option => option.classList.remove('selected'));
        elements.resourceTags.forEach(tag => tag.classList.remove('selected'));
    }

    function finishOnboarding() {
        const customResource = elements.onboardingCustomResourceInput.value.trim();
        store.updateState(state => {
            state.hasOnboarded = true;
            state.userName = elements.onboardingNameInput.value.trim();
            selectedResources.forEach(text => {
                if (!state.resources.find(resource => resource.text === text)) {
                    state.resources.push({ id: `res_${Date.now()}_${Math.random()}`, text });
                }
            });
            if (customResource) {
                state.resources.push({ id: `res_${Date.now()}_${Math.random()}`, text: customResource });
            }
        });
        app.screens.showMorningScreen();
    }

    function bindOnce() {
        if (initialized) return;
        initialized = true;

        elements.avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                const state = store.getState();
                elements.avatarOptions.forEach(item => item.classList.remove('selected'));
                option.classList.add('selected');
                state.avatar = option.dataset.avatar;
                elements.step3Avatar.src = state.avatar;
                elements.step4Avatar.src = state.avatar;
                elements.onboardingNextBtn.disabled = false;
            });
        });

        elements.onboardingNameInput.addEventListener('input', checkStep3Valid);
        elements.genderOptions.forEach(option => {
            option.addEventListener('click', () => {
                const state = store.getState();
                elements.genderOptions.forEach(item => item.classList.remove('selected'));
                option.classList.add('selected');
                state.gender = option.dataset.gender;
                checkStep3Valid();
            });
        });

        elements.resourceTags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected');
                const value = tag.dataset.tag;
                if (selectedResources.has(value)) {
                    selectedResources.delete(value);
                } else {
                    selectedResources.add(value);
                }
                checkStep4Valid();
            });
        });

        elements.onboardingCustomResourceInput.addEventListener('input', checkStep4Valid);

        elements.onboardingBackBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep -= 1;
                updateSteps();
            }
        });

        elements.onboardingNextBtn.addEventListener('click', () => {
            if (currentStep < 4) {
                currentStep += 1;
                updateSteps();
                return;
            }
            finishOnboarding();
        });
    }

    function activate() {
        bindOnce();
        reset();
        updateSteps();
    }

    return { activate };
}
