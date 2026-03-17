function bootstrapResourceTodoApp() {
    // Р РЋР С•РЎРѓРЎвЂљР С•РЎРЏР Р…Р С‘Р Вµ Р С—РЎР‚Р С‘Р В»Р С•Р В¶Р ВµР Р…Р С‘РЎРЏ
    let state = {
        hasOnboarded: false,
        userName: '',
        gender: 'female',
        avatar: 'assets/girl.png',
        energyBudget: null,
        lastDate: null,
        pendingReviewDate: null,
        tasks: [],
        resources: [
            { id: 'res_1', text: 'Р СџР С•Р С—Р С‘РЎвЂљРЎРЉ Р С”Р С•РЎвЂћР Вµ' },
            { id: 'res_2', text: '10 Р СР С‘Р Р…РЎС“РЎвЂљ РЎРѓР С•РЎвЂ РЎРѓР ВµРЎвЂљР ВµР в„–' },
            { id: 'res_3', text: 'Р СџРЎР‚Р С•Р С–РЎС“Р В»Р С”Р В° 15 Р СР С‘Р Р…РЎС“РЎвЂљ' }
        ],
        templates: []
    };

    // DOM Р В­Р В»Р ВµР СР ВµР Р…РЎвЂљРЎвЂ№
    const onboardingScreen = document.getElementById('onboarding-screen');
    const morningScreen = document.getElementById('morning-screen');
    const mainScreen = document.getElementById('main-screen');
    const reviewScreen = document.getElementById('review-screen');
    const weeklyScreen = document.getElementById('weekly-screen');
    const libraryModal = document.getElementById('library-modal');
    const archiveModal = document.getElementById('archive-modal');
    const templatesModal = document.getElementById('templates-modal');
    const helperModal = document.getElementById('helper-modal');

    const energyInput = document.getElementById('energy-input');
    const energyDisplay = document.getElementById('energy-display');
    const startDayBtn = document.getElementById('start-day-btn');

    const reviewTasksList = document.getElementById('review-tasks-list');
    const finishReviewBtn = document.getElementById('finish-review-btn');

    const morningTitle = document.getElementById('morning-title');
    const appHelperAvatar = document.getElementById('app-helper-avatar');

    const usedEnergyEl = document.getElementById('used-energy');
    const totalEnergyEl = document.getElementById('total-energy');
    const progressBar = document.getElementById('progress-bar');
    const balanceMessageContainer = document.getElementById('balance-message-container');
    const balanceMessageAvatar = document.getElementById('balance-message-avatar');
    const balanceMessage = document.getElementById('balance-message');

    const tasksList = document.getElementById('tasks-list');
    const selfCareList = document.getElementById('self-care-list');
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-text');
    const taskWeightSelect = document.getElementById('task-weight');

    const openLibraryBtn = document.getElementById('open-library-btn');
    const closeLibraryBtn = document.getElementById('close-library-btn');
    const resourcesList = document.getElementById('resources-list');
    const addResourceForm = document.getElementById('add-resource-form');
    const resourceInput = document.getElementById('resource-text');
    const addSelfCareBtn = document.getElementById('add-self-care-btn');

    const openArchiveBtn = document.getElementById('open-archive-btn');
    const closeArchiveBtn = document.getElementById('close-archive-btn');
    const archiveList = document.getElementById('archive-list');

    const openWeeklyBtn = document.getElementById('open-weekly-btn');
    const closeWeeklyBtn = document.getElementById('close-weekly-btn');
    const weeklyContainer = document.getElementById('weekly-container');

    const weeklyTaskModal = document.getElementById('weekly-task-modal');
    const closeWeeklyTaskBtn = document.getElementById('close-weekly-task-btn');
    const addWeeklyTaskForm = document.getElementById('add-weekly-task-form');
    const weeklyTaskText = document.getElementById('weekly-task-text');
    const weeklyTaskWeight = document.getElementById('weekly-task-weight');
    let currentWeeklyTaskDate = null;

    const closeHelperBtn = document.getElementById('close-helper-btn');
    const adviceAvatar = document.getElementById('advice-avatar');
    const adviceText = document.getElementById('advice-text');
    const adviceAddBtn = document.getElementById('advice-add-btn');
    const adviceRefreshBtn = document.getElementById('advice-refresh-btn');

    const allDoneModal = document.getElementById('all-done-modal');
    const allDoneAvatar = document.getElementById('all-done-avatar');
    const allDoneText = document.getElementById('all-done-text');
    const allDoneCloseBtn = document.getElementById('all-done-close-btn');

    // Р вЂ™РЎРѓРЎвЂљРЎР‚Р С•Р ВµР Р…Р Р…РЎвЂ№Р Вµ РЎРѓР С•Р Р†Р ВµРЎвЂљРЎвЂ№ Р Т‘Р В»РЎРЏ Р С—Р С•Р СР С•РЎвЂ°Р Р…Р С‘Р С”Р В°
    const builtinAdvices = [
        "Р вЂ™РЎвЂ№Р С—Р С‘РЎвЂљРЎРЉ РЎРѓРЎвЂљР В°Р С”Р В°Р Р… РЎвЂЎР С‘РЎРѓРЎвЂљР С•Р в„– Р Р†Р С•Р Т‘РЎвЂ№",
        "Р РЋР Т‘Р ВµР В»Р В°РЎвЂљРЎРЉ 5 Р С–Р В»РЎС“Р В±Р С•Р С”Р С‘РЎвЂ¦ Р Р†Р Т‘Р С•РЎвЂ¦Р С•Р Р† Р С‘ Р Р†РЎвЂ№Р Т‘Р С•РЎвЂ¦Р С•Р Р†",
        "Р СџР С•РЎРѓР СР С•РЎвЂљРЎР‚Р ВµРЎвЂљРЎРЉ Р Р† Р С•Р С”Р Р…Р С• Р Р…Р В° Р Р…Р ВµР В±Р С• Р С—Р В°РЎР‚РЎС“ Р СР С‘Р Р…РЎС“РЎвЂљ",
        "Р РЋР Т‘Р ВµР В»Р В°РЎвЂљРЎРЉ Р В»Р ВµР С–Р С”РЎС“РЎР‹ РЎР‚Р В°Р В·Р СР С‘Р Р…Р С”РЎС“ Р Т‘Р В»РЎРЏ РЎв‚¬Р ВµР С‘",
        "Р СџР С•РЎРѓР В»РЎС“РЎв‚¬Р В°РЎвЂљРЎРЉ Р С•Р Т‘Р Р…РЎС“ Р В»РЎР‹Р В±Р С‘Р СРЎС“РЎР‹ РЎРѓР С—Р С•Р С”Р С•Р в„–Р Р…РЎС“РЎР‹ Р С—Р ВµРЎРѓР Р…РЎР‹",
        "Р С›РЎвЂљР В»Р С•Р В¶Р С‘РЎвЂљРЎРЉ РЎвЂљР ВµР В»Р ВµРЎвЂћР С•Р Р… Р Р…Р В° 15 Р СР С‘Р Р…РЎС“РЎвЂљ",
        "Р вЂ”Р В°Р Р†Р В°РЎР‚Р С‘РЎвЂљРЎРЉ Р Р†Р С”РЎС“РЎРѓР Р…РЎвЂ№Р в„– РЎвЂЎР В°Р в„–"
    ];

    let currentAdvice = "";

    const openTemplatesBtn = document.getElementById('open-templates-btn');
    const closeTemplatesBtn = document.getElementById('close-templates-btn');
    const templatesContainer = document.getElementById('templates-container');

    function getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function parseLocalDate(dateString) {
        if (!dateString) return new Date();
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    function getOverdueTasks(today = getLocalDateString()) {
        return state.tasks.filter(t => t.targetDate && t.targetDate < today);
    }

    function completePendingReview() {
        state.pendingReviewDate = null;
        state.lastDate = getLocalDateString();
        state.energyBudget = null;
        saveState();
        reviewScreen.classList.add('hidden');
        showMorningScreen();
    }
    // Р ТђР ВµР В»Р С—Р ВµРЎР‚ Р Т‘Р В»РЎРЏ РЎРѓР С”Р В»Р С•Р Р…Р ВµР Р…Р С‘РЎРЏ Р С—Р С• РЎР‚Р С•Р Т‘РЎС“
    function genderText(male, female) {
        return state.gender === 'male' ? male : female;
    }

    // Р В­РЎвЂћРЎвЂћР ВµР С”РЎвЂљ РЎРѓР ВµРЎР‚Р Т‘Р ВµРЎвЂЎР ВµР С” Р С—РЎР‚Р С‘ Р В·Р В°Р Р†Р ВµРЎР‚РЎв‚¬Р ВµР Р…Р С‘Р С‘ РЎР‚Р ВµРЎРѓРЎС“РЎР‚РЎРѓР Р…Р С•Р в„– Р В·Р В°Р Т‘Р В°РЎвЂЎР С‘
    function spawnHearts(targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const hearts = ['РІСњВ¤', 'СЂСџвЂ™вЂў', 'СЂСџвЂ™вЂ”'];
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('span');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 30) + 'px';
            heart.style.top = (rect.top + rect.height / 2) + 'px';
            heart.style.animationDelay = (i * 0.1) + 's';
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 1200);
        }
    }

    // Р ВР Р…Р С‘РЎвЂ Р С‘Р В°Р В»Р С‘Р В·Р В°РЎвЂ Р С‘РЎРЏ
    function init() {
        loadState();
        const today = getLocalDateString();

        // Р СљР С‘Р С–РЎР‚Р В°РЎвЂ Р С‘РЎРЏ РЎРѓРЎвЂљР В°РЎР‚РЎвЂ№РЎвЂ¦ Р В·Р В°Р Т‘Р В°РЎвЂЎ
        state.tasks.forEach(t => {
            if (t.postponedTo && !t.targetDate) {
                t.targetDate = t.postponedTo;
                delete t.postponedTo;
            }
            if (t.targetDate === undefined) {
                t.targetDate = state.lastDate || today;
            }
        });

        // Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚Р С”Р В° Р Р…Р В° Р С—Р ВµРЎР‚Р Р†РЎвЂ№Р в„– Р В·Р В°Р С—РЎС“РЎРѓР С”
        if (!state.hasOnboarded) {
            showOnboardingScreen();
            return;
        }

        if (state.pendingReviewDate === today) {
            const pendingTasks = getOverdueTasks(today);
            if (pendingTasks.length === 0) {
                completePendingReview();
            } else {
                showReviewScreen(pendingTasks);
            }
            return;
        }

        if (state.lastDate !== today) {
            // Р СњР С•Р Р†РЎвЂ№Р в„– Р Т‘Р ВµР Р…РЎРЉ

            // Р В¤Р С‘Р В»РЎРЉРЎвЂљРЎР‚РЎС“Р ВµР С Р Р†РЎвЂ№Р С—Р С•Р В»Р Р…Р ВµР Р…Р Р…РЎвЂ№Р Вµ
            state.tasks = state.tasks.filter(t => !t.completed);

            const overdueTasks = getOverdueTasks(today);

            if (overdueTasks.length > 0) {
                state.pendingReviewDate = today;
                saveState();
                showReviewScreen(overdueTasks);
            } else {
                state.lastDate = today;
                state.pendingReviewDate = null;
                state.energyBudget = null;
                saveState();
                showMorningScreen();
            }
        } else if (state.energyBudget === null) {
            showMorningScreen();
        } else {
            showMainScreen();
        }
    }

    // Р РЋР В»РЎС“РЎв‚¬Р В°РЎвЂљР ВµР В»Р С‘ РЎС“РЎвЂљРЎР‚Р ВµР Р…Р Р…Р ВµР С–Р С• РЎРЊР С”РЎР‚Р В°Р Р…Р В°
    energyInput.addEventListener('input', (e) => {
        energyDisplay.textContent = e.target.value;
    });

    startDayBtn.addEventListener('click', () => {
        state.energyBudget = parseInt(energyInput.value, 10);
        saveState();
        showMainScreen();
    });

    // Р С›Р В±РЎР‚Р В°Р В±Р С•РЎвЂљР С”Р В° Р В·Р В°Р Т‘Р В°РЎвЂЎ
    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const weight = parseInt(taskWeightSelect.value, 10);
        if (text) {
            addTask(text, weight, false);
            taskInput.value = '';
        }
    });

    function addTask(text, weight, isResource, targetDate = null) {
        if (!targetDate) {
            targetDate = getLocalDateString();
        }
        const uniqueId = 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
        const newTask = {
            id: uniqueId,
            text,
            weight,
            isResource,
            completed: false,
            targetDate: targetDate
        };
        state.tasks.push(newTask);
        saveState();
        renderMainScreen();
        if (!weeklyScreen.classList.contains('hidden')) {
            renderWeeklyScreen();
        }
    }

    function toggleTask(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveState();
            renderMainScreen();
            renderWeeklyScreen();

            // Р В Р В°Р Т‘Р С•РЎРѓРЎвЂљРЎРЉ Р С—Р С•Р СР С•РЎвЂ°Р Р…Р С‘Р С”Р В° Р С—РЎР‚Р С‘ Р В·Р В°Р Р†Р ВµРЎР‚РЎв‚¬Р ВµР Р…Р С‘Р С‘ РЎР‚Р ВµРЎРѓРЎС“РЎР‚РЎРѓР Р…Р С•Р в„– Р В·Р В°Р Т‘Р В°РЎвЂЎР С‘
            if (task.completed && task.isResource && appHelperAvatar) {
                appHelperAvatar.classList.add('celebrate');
                spawnHearts(appHelperAvatar);
                setTimeout(() => {
                    appHelperAvatar.classList.remove('celebrate');
                }, 800);
            }

            // Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚РЎРЏР ВµР С, Р Р†РЎРѓР Вµ Р В»Р С‘ Р Т‘Р ВµР В»Р В° Р Р†РЎвЂ№Р С—Р С•Р В»Р Р…Р ВµР Р…РЎвЂ№
            if (task.completed) {
                checkAllDone();
            }
        }
    }

    function checkAllDone() {
        const today = getLocalDateString();
        const todayTasks = state.tasks.filter(t => t.targetDate === today);
        if (todayTasks.length === 0) return;
        const allCompleted = todayTasks.every(t => t.completed);
        if (allCompleted) {
            const displayName = state.userName || '';
            const praises = [
                `${displayName}, РЎвЂљРЎвЂ№ РЎРѓР С—РЎР‚Р В°Р Р†${genderText('Р С‘Р В»РЎРѓРЎРЏ', 'Р С‘Р В»Р В°РЎРѓРЎРЉ')} РЎРѓР С• Р Р†РЎРѓР ВµР СР С‘ Р Т‘Р ВµР В»Р В°Р СР С‘! Р СћР ВµР С—Р ВµРЎР‚РЎРЉ РЎРѓР В°Р СР С•Р Вµ Р Р†РЎР‚Р ВµР СРЎРЏ РЎРѓР Т‘Р ВµР В»Р В°РЎвЂљРЎРЉ РЎвЂЎРЎвЂљР С•-РЎвЂљР С• Р С—РЎР‚Р С‘РЎРЏРЎвЂљР Р…Р С•Р Вµ Р Т‘Р В»РЎРЏ РЎРѓР ВµР В±РЎРЏ.`,
                `Р вЂ™РЎРѓРЎвЂ Р С–Р С•РЎвЂљР С•Р Р†Р С•, ${displayName}! Р Р‡ Р С–Р С•РЎР‚Р В¶РЎС“РЎРѓРЎРЉ РЎвЂљР С•Р В±Р С•Р в„–. Р С›РЎРѓРЎвЂљР В°Р В»РЎРЉР Р…Р С•Р Вµ Р Р†РЎР‚Р ВµР СРЎРЏ РІР‚вЂќ РЎвЂљР Р†Р С•РЎвЂ.`,
                `${displayName}, Р С”Р В°Р С”Р С•Р в„– Р С—РЎР‚Р С•Р Т‘РЎС“Р С”РЎвЂљР С‘Р Р†Р Р…РЎвЂ№Р в„– Р Т‘Р ВµР Р…РЎРЉ! Р СћР ВµР С—Р ВµРЎР‚РЎРЉ Р СР С•Р В¶Р Р…Р С• Р Р†РЎвЂ№Р Т‘Р С•РЎвЂ¦Р Р…РЎС“РЎвЂљРЎРЉ Р С‘ Р С—Р С•РЎР‚Р В°Р Т‘Р С•Р Р†Р В°РЎвЂљРЎРЉ РЎРѓР ВµР В±РЎРЏ.`
            ];
            allDoneAvatar.src = state.avatar;
            allDoneText.textContent = praises[Math.floor(Math.random() * praises.length)];
            allDoneModal.classList.remove('hidden');
            spawnHearts(allDoneAvatar);
            setTimeout(() => spawnHearts(allDoneAvatar), 300);
        }
    }

    allDoneCloseBtn.addEventListener('click', () => {
        allDoneModal.classList.add('hidden');
    });

    function deleteTask(id, fromArchive) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveState();
        if (fromArchive) renderArchive();
        renderMainScreen();
        renderWeeklyScreen();
    }

    function postponeTask(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            const currentObj = parseLocalDate(task.targetDate || getLocalDateString());
            currentObj.setDate(currentObj.getDate() + 1);
            task.targetDate = getLocalDateString(currentObj);
            saveState();
            renderMainScreen();
            renderWeeklyScreen();
        }
    }

    window.moveToToday = (id, fromReview) => {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.targetDate = getLocalDateString();
            saveState();
            if (fromReview) {
                const overdue = getOverdueTasks();
                if (overdue.length === 0) completePendingReview();
                else showReviewScreen(overdue);
            } else {
                renderMainScreen();
                renderArchive();
                renderWeeklyScreen();
            }
        }
    };

    window.moveToArchive = (id, fromReview) => {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.targetDate = null;
            saveState();
            if (fromReview) {
                const overdue = getOverdueTasks();
                if (overdue.length === 0) completePendingReview();
                else showReviewScreen(overdue);
            } else {
                renderMainScreen();
                renderArchive();
                renderWeeklyScreen();
            }
        }
    };

    // Р РЋР С•Р Р†Р ВµРЎвЂљ Р С•РЎвЂљ Р С—Р С•Р СР С•РЎвЂ°Р Р…Р С‘Р С”Р В°
    function generateAdvice() {
        const userResources = state.resources.map(r => r.text);
        const allAdvices = [...builtinAdvices, ...userResources];
        
        let newAdvice = currentAdvice;
        // Р вЂ”Р В°РЎвЂ°Р С‘РЎвЂљР В° Р С•РЎвЂљ Р С—Р С•Р Р†РЎвЂљР С•РЎР‚Р ВµР Р…Р С‘РЎРЏ Р С—Р С•Р Т‘РЎР‚РЎРЏР Т‘, Р ВµРЎРѓР В»Р С‘ РЎРЊР В»Р ВµР СР ВµР Р…РЎвЂљР С•Р Р† Р В±Р С•Р В»РЎРЉРЎв‚¬Р Вµ 1
        if (allAdvices.length > 1) {
            while (newAdvice === currentAdvice) {
                newAdvice = allAdvices[Math.floor(Math.random() * allAdvices.length)];
            }
        } else {
            newAdvice = allAdvices[0];
        }
        
        currentAdvice = newAdvice;
        adviceText.textContent = currentAdvice;
    }

    appHelperAvatar.addEventListener('click', () => {
        adviceAvatar.src = state.avatar;
        generateAdvice();
        helperModal.classList.remove('hidden');
    });

    closeHelperBtn.addEventListener('click', () => {
        helperModal.classList.add('hidden');
    });

    adviceRefreshBtn.addEventListener('click', () => {
        // Р вЂќР С•Р В±Р В°Р Р†Р С‘Р С Р В»Р ВµР С–Р С”РЎС“РЎР‹ Р В°Р Р…Р С‘Р СР В°РЎвЂ Р С‘РЎР‹ РЎРѓР СР ВµР Р…РЎвЂ№ РЎвЂљР ВµР С”РЎРѓРЎвЂљР В°
        adviceText.style.opacity = 0;
        setTimeout(() => {
            generateAdvice();
            adviceText.style.opacity = 1;
        }, 200);
    });

    adviceAddBtn.addEventListener('click', () => {
        if (currentAdvice) {
            // Р вЂќР С•Р В±Р В°Р Р†Р В»РЎРЏР ВµР С Р С”Р В°Р С” РЎР‚Р ВµРЎРѓРЎС“РЎР‚РЎРѓ (Р Р†Р ВµРЎРѓ 0)
            addTask(currentAdvice, 0, true);
            
            const originalText = adviceAddBtn.textContent;
            adviceAddBtn.textContent = 'Р вЂќР С•Р В±Р В°Р Р†Р В»Р ВµР Р…Р С• РІСљвЂњ';
            adviceAddBtn.style.backgroundColor = 'var(--primary-color)';
            adviceAddBtn.style.color = 'white';

            setTimeout(() => {
                adviceAddBtn.textContent = originalText;
                adviceAddBtn.style.backgroundColor = '';
                adviceAddBtn.style.color = '';
                helperModal.classList.add('hidden');
            }, 1000);
        }
    });

    // Р вЂР С‘Р В±Р В»Р С‘Р С•РЎвЂљР ВµР С”Р В° РЎР‚Р ВµРЎРѓРЎС“РЎР‚РЎРѓР С•Р Р†
    openLibraryBtn.addEventListener('click', () => {
        libraryModal.classList.remove('hidden');
        renderResources();
    });

    addSelfCareBtn.addEventListener('click', () => {
        libraryModal.classList.remove('hidden');
        renderResources();
    });

    closeLibraryBtn.addEventListener('click', () => {
        libraryModal.classList.add('hidden');
    });

    addResourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = resourceInput.value.trim();
        if (text) {
            state.resources.push({ id: 'res_' + Date.now(), text });
            saveState();
            resourceInput.value = '';
            renderResources();
        }
    });

    function deleteResource(id) {
        state.resources = state.resources.filter(r => r.id !== id);
        saveState();
        renderResources();
    }

    // Р С’РЎР‚РЎвЂ¦Р С‘Р Р†
    openArchiveBtn.addEventListener('click', () => {
        archiveModal.classList.remove('hidden');
        renderArchive();
    });
    closeArchiveBtn.addEventListener('click', () => {
        archiveModal.classList.add('hidden');
    });

    // Р СњР ВµР Т‘Р ВµР В»РЎРЏ
    openWeeklyBtn.addEventListener('click', () => {
        showWeeklyScreen();
    });
    closeWeeklyBtn.addEventListener('click', () => {
        showMainScreen();
    });

    window.openWeeklyTaskModal = (dateStr) => {
        currentWeeklyTaskDate = dateStr;
        weeklyTaskModal.classList.remove('hidden');
        weeklyTaskText.focus();
    };

    closeWeeklyTaskBtn.addEventListener('click', () => {
        weeklyTaskModal.classList.add('hidden');
    });

    addWeeklyTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = weeklyTaskText.value.trim();
        const weight = parseInt(weeklyTaskWeight.value, 10);
        if (text && currentWeeklyTaskDate) {
            addTask(text, weight, false, currentWeeklyTaskDate);
            weeklyTaskText.value = '';
            weeklyTaskModal.classList.add('hidden');
        }
    });

    // Р В Р ВµР С•РЎР‚Р С–Р В°Р Р…Р С‘Р В·Р В°РЎвЂ Р С‘РЎРЏ Р В·Р В°Р Т‘Р В°РЎвЂЎ (Drag & Drop)
    tasksList.addEventListener('dragover', e => handleDragOver(e, tasksList));
    tasksList.addEventListener('drop', e => handleDrop(e, tasksList));
    selfCareList.addEventListener('dragover', e => handleDragOver(e, selfCareList));
    selfCareList.addEventListener('drop', e => handleDrop(e, selfCareList));

    function handleDragOver(e, container) {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (!draggable) return;

        // Р СњР Вµ Р Т‘Р В°Р ВµР С Р С—Р ВµРЎР‚Р ВµРЎвЂљР В°РЎРѓР С”Р С‘Р Р†Р В°РЎвЂљРЎРЉ Р В·Р В°Р Т‘Р В°РЎвЂЎР С‘ Р СР ВµР В¶Р Т‘РЎС“ РЎРѓР С—Р С‘РЎРѓР С”Р В°Р СР С‘ РЎР‚Р В°Р В·Р Р…Р С•Р С–Р С• РЎвЂљР С‘Р С—Р В° (РЎР‚Р ВµРЎРѓРЎС“РЎР‚РЎРѓРЎвЂ№/Р С•Р В±РЎвЂ№РЎвЂЎР Р…РЎвЂ№Р Вµ)
        if (container === selfCareList && !draggable.classList.contains('resource-item-drag')) return;
        if (container === tasksList && draggable.classList.contains('resource-item-drag')) return;

        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    }

    function handleDrop(e, container) {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (!draggable) return;
        
        // Р С›Р В±Р Р…Р С•Р Р†Р В»РЎРЏР ВµР С Р С—Р С•РЎР‚РЎРЏР Т‘Р С•Р С” Р Р† state.tasks
        const todayStr = getLocalDateString();
        
        // Р РЋР С•Р В±Р С‘РЎР‚Р В°Р ВµР С Р Р†РЎРѓР Вµ ID Р В·Р В°Р Т‘Р В°РЎвЂЎ Р С‘Р В· Р С”Р С•Р Р…РЎвЂљР ВµР в„–Р Р…Р ВµРЎР‚Р В° Р Р† Р Р…Р С•Р Р†Р С•Р С Р С—Р С•РЎР‚РЎРЏР Т‘Р С”Р Вµ
        const taskElements = [...container.querySelectorAll('.task-item')];
        const newOrderIds = taskElements.map(el => el.dataset.taskId);

        // Р СњР В°РЎвЂ¦Р С•Р Т‘Р С‘Р С Р В·Р В°Р Т‘Р В°РЎвЂЎР С‘, Р С•РЎвЂљР Р…Р С•РЎРѓРЎРЏРЎвЂ°Р С‘Р ВµРЎРѓРЎРЏ Р С” РЎРЊРЎвЂљР С•Р СРЎС“ РЎРѓР С—Р С‘РЎРѓР С”РЎС“ Р Р…Р В° РЎРѓР ВµР С–Р С•Р Т‘Р Р…РЎРЏ
        const isResourceList = container === selfCareList;
        const currentTasks = state.tasks.filter(t => t.targetDate === todayStr && t.isResource === isResourceList);
        
        // Р РЋР С•РЎР‚РЎвЂљР С‘РЎР‚РЎС“Р ВµР С currentTasks РЎРѓР С•Р С–Р В»Р В°РЎРѓР Р…Р С• newOrderIds
        currentTasks.sort((a, b) => {
            const indexA = newOrderIds.indexOf(a.id);
            const indexB = newOrderIds.indexOf(b.id);
            return indexA - indexB;
        });

        // Р вЂ”Р В°Р СР ВµР Р…РЎРЏР ВµР С РЎРѓРЎвЂљР В°РЎР‚РЎвЂ№Р Вµ Р В·Р В°Р Т‘Р В°РЎвЂЎР С‘ Р Р† state.tasks Р Р…Р В° Р С•РЎвЂљРЎРѓР С•РЎР‚РЎвЂљР С‘РЎР‚Р С•Р Р†Р В°Р Р…Р Р…РЎвЂ№Р Вµ
        // Р вЂќР В»РЎРЏ РЎРЊРЎвЂљР С•Р С–Р С• РЎС“Р Т‘Р В°Р В»РЎРЏР ВµР С Р Р†РЎРѓР Вµ РЎРѓРЎвЂљР В°РЎР‚РЎвЂ№Р Вµ Р С‘ Р Р†РЎРѓРЎвЂљР В°Р Р†Р В»РЎРЏР ВµР С Р Р…Р С•Р Р†РЎвЂ№Р Вµ РЎРѓ РЎРѓР С•РЎвЂ¦РЎР‚Р В°Р Р…Р ВµР Р…Р С‘Р ВµР С Р Т‘РЎР‚РЎС“Р С–Р С‘РЎвЂ¦ Р В·Р В°Р Т‘Р В°РЎвЂЎ
        const otherTasks = state.tasks.filter(t => t.targetDate !== todayStr || t.isResource !== isResourceList);
        
        // Р вЂ™Р В°Р В¶Р Р…Р С•: Р Р† selfCareList Р С‘Р В»Р С‘ tasksList Р СР С•Р С–РЎС“РЎвЂљ Р В±РЎвЂ№РЎвЂљРЎРЉ Р В·Р В°Р Р†Р ВµРЎР‚РЎв‚¬РЎвЂР Р…Р Р…РЎвЂ№Р Вµ Р В·Р В°Р Т‘Р В°РЎвЂЎР С‘ (completed)
        // Р В§РЎвЂљР С•Р В±РЎвЂ№ Р Р…Р Вµ РЎРѓР В»Р С•Р СР В°РЎвЂљРЎРЉ РЎРѓР С•РЎР‚РЎвЂљР С‘РЎР‚Р С•Р Р†Р С”РЎС“ Р Р…Р ВµР В·Р В°Р Р†Р ВµРЎР‚РЎв‚¬РЎвЂР Р…Р Р…РЎвЂ№РЎвЂ¦ РЎРѓ Р В·Р В°Р Р†Р ВµРЎР‚РЎв‚¬РЎвЂР Р…Р Р…РЎвЂ№Р СР С‘, Р В»РЎС“РЎвЂЎРЎв‚¬Р Вµ Р В·Р В°Р СР ВµР Р…Р С‘РЎвЂљРЎРЉ Р С‘РЎвЂ¦ РЎвЂ Р ВµР В»Р С‘Р С”Р С•Р С Р Р…Р В° РЎвЂљР С•РЎвЂљ Р В¶Р Вµ Р Т‘Р ВµР Р…РЎРЉ
        state.tasks = [...otherTasks, ...currentTasks];
        saveState();
        renderMainScreen(); // Р вЂ™РЎвЂ№Р В·РЎвЂ№Р Р†Р В°Р ВµР С Р Т‘Р В»РЎРЏ Р Р†Р ВµРЎР‚Р Р…Р С•Р С–Р С• Р С—РЎР‚Р С‘Р СР ВµР Р…Р ВµР Р…Р С‘РЎРЏ Р Р†РЎРѓР ВµРЎвЂ¦ РЎРѓРЎвЂљР С‘Р В»Р ВµР в„– Р С‘ Р С•Р В±РЎР‚Р В°Р В±Р С•РЎвЂљРЎвЂЎР С‘Р С”Р С•Р Р†
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Р РЃР В°Р В±Р В»Р С•Р Р…РЎвЂ№ РЎР‚РЎС“РЎвЂљР С‘Р Р…
    openTemplatesBtn.addEventListener('click', () => {
        templatesModal.classList.remove('hidden');
        renderTemplates();
    });
    closeTemplatesBtn.addEventListener('click', () => {
        templatesModal.classList.add('hidden');
    });

    window.changeTemplateTaskWeight = (templateId, taskId, weight) => {
        const tpl = state.templates.find(t => t.id === templateId);
        if (tpl) {
            const task = tpl.tasks.find(t => t.id === taskId);
            if (task) {
                task.weight = parseInt(weight, 10);
                saveState();
            }
        }
    };

    window.addTemplateTaskToDay = (templateId, taskId) => {
        const tpl = state.templates.find(t => t.id === templateId);
        if (tpl) {
            const task = tpl.tasks.find(t => t.id === taskId);
            if (task) {
                addTask(task.text, task.weight, false);
                
                const btn = document.querySelector(`button[data-ttid="${taskId}"]`);
                if (btn) {
                    const originalText = btn.textContent;
                    btn.textContent = 'РІСљвЂњ';
                    btn.style.backgroundColor = 'var(--primary-color)';
                    btn.style.color = 'white';

                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                    }, 1000);
                }
            }
        }
    };

    window.addAllTemplateTasksToDay = (templateId) => {
        const tpl = state.templates.find(t => t.id === templateId);
        if (tpl) {
            tpl.tasks.forEach(task => {
                addTask(task.text, task.weight, false);
            });
            templatesModal.classList.add('hidden');
        }
    };

    // UI Р В Р ВµР Р…Р Т‘Р ВµРЎР‚Р С‘Р Р…Р С–
    function showReviewScreen(tasks) {
        morningScreen.classList.add('hidden');
        mainScreen.classList.add('hidden');
        weeklyScreen.classList.add('hidden');
        libraryModal.classList.add('hidden');
        archiveModal.classList.add('hidden');
        reviewScreen.classList.remove('hidden');

        reviewTasksList.innerHTML = '';
        tasks.forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-item';
            el.innerHTML = `
                <div class="task-desc">${escapeHtml(task.text)}</div>
                <button class="postpone-btn" title="\u041D\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F" onclick="window.moveToToday('${task.id}', true)">\u2600\uFE0F \u041D\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F</button>
                <button class="postpone-btn" title="\u0412 \u0430\u0440\u0445\u0438\u0432" onclick="window.moveToArchive('${task.id}', true)">\uD83D\uDCE6 \u0412 \u0430\u0440\u0445\u0438\u0432</button>
            `;
            reviewTasksList.appendChild(el);
        });
        finishReviewBtn.classList.remove('hidden');
        finishReviewBtn.textContent = '\u041E\u0441\u0442\u0430\u0432\u0448\u0435\u0435\u0441\u044F \u0432 \u0430\u0440\u0445\u0438\u0432';

        finishReviewBtn.onclick = () => {
            const remaining = getOverdueTasks();
            remaining.forEach(t => t.targetDate = null);
            saveState();
            completePendingReview();
        };
    }

    function showOnboardingScreen() {
        onboardingScreen.classList.remove('hidden');
        morningScreen.classList.add('hidden');
        mainScreen.classList.add('hidden');
        libraryModal.classList.add('hidden');
        archiveModal.classList.add('hidden');
        weeklyScreen.classList.add('hidden');
        reviewScreen.classList.add('hidden');
        initOnboardingLogic();
    }

    function initOnboardingLogic() {
        let currentStep = 1;
        const totalSteps = 4;

        // Р В­Р В»Р ВµР СР ВµР Р…РЎвЂљРЎвЂ№ Р С•Р Р…Р В±Р С•РЎР‚Р Т‘Р С‘Р Р…Р С–Р В°
        const step1 = document.getElementById('onboarding-step-1');
        const step2 = document.getElementById('onboarding-step-2');
        const step3 = document.getElementById('onboarding-step-3');
        const step4 = document.getElementById('onboarding-step-4');

        const avatarOptions = document.querySelectorAll('.avatar-option');
        const nameInput = document.getElementById('onboarding-name-input');
        const genderOptions = document.querySelectorAll('.gender-option');
        const resourceTags = document.querySelectorAll('.resource-tag');
        const customResourceInput = document.getElementById('onboarding-custom-resource-input');

        const backBtn = document.getElementById('onboarding-back-btn');
        const nextBtn = document.getElementById('onboarding-next-btn');

        // Р РЃР В°Р С– 2: Р вЂ™РЎвЂ№Р В±Р С•РЎР‚ Р В°Р Р†Р В°РЎвЂљР В°РЎР‚Р В°
        avatarOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                avatarOptions.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                state.avatar = opt.dataset.avatar;

                // Р С›Р В±Р Р…Р С•Р Р†Р В»РЎРЏР ВµР С Р В°Р Р†Р В°РЎвЂљР В°РЎР‚РЎвЂ№ Р Р…Р В° РЎРѓР В»Р ВµР Т‘РЎС“РЎР‹РЎвЂ°Р С‘РЎвЂ¦ РЎв‚¬Р В°Р С–Р В°РЎвЂ¦
                document.getElementById('step-3-avatar').src = state.avatar;
                document.getElementById('step-4-avatar').src = state.avatar;

                nextBtn.disabled = false;
            });
        });

        // Р РЃР В°Р С– 3: Р вЂ™Р Р†Р С•Р Т‘ Р С‘Р СР ВµР Р…Р С‘ + Р Р†РЎвЂ№Р В±Р С•РЎР‚ Р С—Р С•Р В»Р В°
        function checkStep3Valid() {
            if (currentStep === 3) {
                const hasName = nameInput.value.trim().length > 0;
                const hasGender = document.querySelector('.gender-option.selected') !== null;
                nextBtn.disabled = !(hasName && hasGender);
            }
        }

        nameInput.addEventListener('input', checkStep3Valid);

        genderOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                genderOptions.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                state.gender = opt.dataset.gender;
                checkStep3Valid();
            });
        });

        // Р РЃР В°Р С– 4: Р вЂ™РЎвЂ№Р В±Р С•РЎР‚ РЎР‚Р ВµРЎРѓРЎС“РЎР‚РЎРѓР С•Р Р†
        let selectedResources = new Set();
        resourceTags.forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected');
                const val = tag.dataset.tag;
                if (selectedResources.has(val)) {
                    selectedResources.delete(val);
                } else {
                    selectedResources.add(val);
                }
                checkStep4Valid();
            });
        });

        customResourceInput.addEventListener('input', checkStep4Valid);

        function checkStep4Valid() {
            if (currentStep === 4) {
                nextBtn.disabled = selectedResources.size === 0 && customResourceInput.value.trim().length === 0;
            }
        }

        // Р СњР В°Р Р†Р С‘Р С–Р В°РЎвЂ Р С‘РЎРЏ
        function updateSteps() {
            step1.classList.add('hidden');
            step2.classList.add('hidden');
            step3.classList.add('hidden');
            step4.classList.add('hidden');

            backBtn.classList.remove('hidden');
            if (currentStep === 1) backBtn.classList.add('hidden');

            if (currentStep === 1) {
                step1.classList.remove('hidden');
                nextBtn.disabled = false;
                nextBtn.textContent = 'Р СњР В°РЎвЂЎР В°РЎвЂљРЎРЉ';
            } else if (currentStep === 2) {
                step2.classList.remove('hidden');
                nextBtn.textContent = 'Р вЂќР В°Р В»Р ВµР Вµ';
                nextBtn.disabled = !document.querySelector('.avatar-option.selected');
            } else if (currentStep === 3) {
                step3.classList.remove('hidden');
                nextBtn.textContent = 'Р вЂќР В°Р В»Р ВµР Вµ';
                checkStep3Valid();
            } else if (currentStep === 4) {
                step4.classList.remove('hidden');
                nextBtn.textContent = 'Р вЂ”Р В°Р Р†Р ВµРЎР‚РЎв‚¬Р С‘РЎвЂљРЎРЉ';
                checkStep4Valid();
            }
        }

        backBtn.onclick = () => {
            if (currentStep > 1) {
                currentStep--;
                nextBtn.textContent = 'Р вЂќР В°Р В»Р ВµР Вµ';
                updateSteps();
            }
        };

        nextBtn.onclick = () => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateSteps();
            } else {
                // Р вЂ”Р В°Р Р†Р ВµРЎР‚РЎв‚¬Р ВµР Р…Р С‘Р Вµ Р С•Р Р…Р В±Р С•РЎР‚Р Т‘Р С‘Р Р…Р С–Р В°
                state.hasOnboarded = true;
                state.userName = nameInput.value.trim();
                // state.gender РЎС“Р В¶Р Вµ РЎРѓР С•РЎвЂ¦РЎР‚Р В°Р Р…Р ВµР Р… Р С—РЎР‚Р С‘ Р С”Р В»Р С‘Р С”Р Вµ

                // Р вЂќР С•Р В±Р В°Р Р†Р В»РЎРЏР ВµР С Р Р†РЎвЂ№Р В±РЎР‚Р В°Р Р…Р Р…РЎвЂ№Р Вµ РЎР‚Р ВµРЎРѓРЎС“РЎР‚РЎРѓРЎвЂ№ Р Р† Р В±Р С‘Р В±Р В»Р С‘Р С•РЎвЂљР ВµР С”РЎС“
                selectedResources.forEach(resText => {
                    const exists = state.resources.find(r => r.text === resText);
                    if (!exists) {
                        state.resources.push({ id: 'res_' + Date.now() + Math.random(), text: resText });
                    }
                });

                const customRes = customResourceInput.value.trim();
                if (customRes) {
                    state.resources.push({ id: 'res_' + Date.now() + Math.random(), text: customRes });
                }

                saveState();
                showMorningScreen();
            }
        };

        updateSteps();
    }

    function showMorningScreen() {
        onboardingScreen.classList.add('hidden');
        morningScreen.classList.remove('hidden');
        mainScreen.classList.add('hidden');
        libraryModal.classList.add('hidden');
        archiveModal.classList.add('hidden');
        weeklyScreen.classList.add('hidden');
        reviewScreen.classList.add('hidden');
        finishReviewBtn.classList.add('hidden');

        const displayName = state.userName ? `, ${state.userName}` : '';
        morningTitle.textContent = `Р вЂќР С•Р В±РЎР‚Р С•Р Вµ РЎС“РЎвЂљРЎР‚Р С•${displayName}.`;

        energyInput.value = 50;
        energyDisplay.textContent = 50;
    }

    function showMainScreen() {
        onboardingScreen.classList.add('hidden');
        morningScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        weeklyScreen.classList.add('hidden');
        reviewScreen.classList.add('hidden');

        appHelperAvatar.src = state.avatar;
        balanceMessageAvatar.src = state.avatar;

        renderMainScreen();
    }

    function showWeeklyScreen() {
        morningScreen.classList.add('hidden');
        mainScreen.classList.add('hidden');
        reviewScreen.classList.add('hidden');
        libraryModal.classList.add('hidden');
        archiveModal.classList.add('hidden');
        weeklyScreen.classList.remove('hidden');
        renderWeeklyScreen();
    }

    function renderMainScreen() {
        tasksList.innerHTML = '';
        selfCareList.innerHTML = '';

        let usedEnergy = 0;
        const todayStr = getLocalDateString();

        state.tasks.forEach(task => {
            if (task.targetDate !== todayStr) return;

            const el = document.createElement('div');
            el.className = `task-item ${task.completed ? 'completed' : ''} ${task.isResource ? 'resource-item-drag' : ''}`;
            el.draggable = true;
            el.dataset.taskId = task.id;

            el.addEventListener('dragstart', () => {
                el.classList.add('dragging');
            });

            el.addEventListener('dragend', () => {
                el.classList.remove('dragging');
            });

            const checkboxHtml = `<div class="task-checkbox-container" onclick="window.toggleTask('${task.id}')">
                <div class="custom-checkbox"></div>
            </div>`;

            const weightClass = task.isResource ? 'resource-weight' : '';
            const weightLabel = task.isResource ? 'Р В Р ВµРЎРѓРЎС“РЎР‚РЎРѓ' : `Р вЂ™Р ВµРЎРѓ: ${task.weight}`;

            const controlsHtml = (!task.isResource && !task.completed)
                ? `<button class="postpone-btn" title="Р вЂ™ Р В°РЎР‚РЎвЂ¦Р С‘Р Р†" onclick="window.moveToArchive('${task.id}')">СЂСџвЂњВ¦</button>
                   <button class="postpone-btn" title="Р СњР В° Р В·Р В°Р Р†РЎвЂљРЎР‚Р В°" onclick="window.postponeTask('${task.id}')">РІС›РЋРїС‘РЏ</button>`
                : '';

            el.innerHTML = `
                ${checkboxHtml}
                <div class="task-desc">${escapeHtml(task.text)}</div>
                <div class="task-weight ${weightClass}">${weightLabel}</div>
                ${controlsHtml}
                <button class="delete-btn" title="Р Р€Р Т‘Р В°Р В»Р С‘РЎвЂљРЎРЉ" onclick="window.deleteTask('${task.id}')">&times;</button>
            `;

            if (task.isResource) {
                selfCareList.appendChild(el);
            } else {
                tasksList.appendChild(el);
            }

            if (!task.isResource && !task.completed) {
                usedEnergy += task.weight;
            }
        });

        if (selfCareList.children.length === 0) {
            selfCareList.innerHTML = `<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 8px;">Р вЂќР С•Р В±Р В°Р Р†РЎРЉРЎвЂљР Вµ РЎР‚Р ВµРЎРѓРЎС“РЎР‚РЎРѓ Р С‘Р В· "Р СљР С•Р С‘РЎвЂ¦ РЎР‚Р В°Р Т‘Р С•РЎРѓРЎвЂљР ВµР в„–" РІВвЂў</div>`;
        }

        const total = state.energyBudget || 1;
        usedEnergyEl.textContent = usedEnergy;
        totalEnergyEl.textContent = total;

        const percentage = Math.min((usedEnergy / total) * 100, 100);

        if (usedEnergy > total) {
            progressBar.style.width = '100%';
            progressBar.classList.add('overloaded');
            balanceMessageContainer.classList.remove('hidden');

            balanceMessage.innerHTML = `Р РЋР ВµР С–Р С•Р Т‘Р Р…РЎРЏ Р С—Р В»Р С•РЎвЂљР Р…РЎвЂ№Р в„– Р С–РЎР‚Р В°РЎвЂћР С‘Р С”.<br>Р СџР С•Р В·Р В°Р В±Р С•РЎвЂљРЎРЉРЎРѓРЎРЏ Р С• РЎРѓР ВµР В±Р Вµ.`;

            // Р С™Р Р…Р С•Р С—Р С”Р В° "Р вЂќР С•Р В±Р В°Р Р†Р С‘РЎвЂљРЎРЉ Р С—Р В°РЎС“Р В·РЎС“"
            let addBreakBtn = document.getElementById('add-break-btn');
            if (!addBreakBtn) {
                addBreakBtn = document.createElement('button');
                addBreakBtn.id = 'add-break-btn';
                addBreakBtn.className = 'add-break-btn';
                addBreakBtn.textContent = 'РІВвЂў Р вЂќР С•Р В±Р В°Р Р†Р С‘РЎвЂљРЎРЉ Р С—Р В°РЎС“Р В·РЎС“';
                addBreakBtn.addEventListener('click', () => {
                    const allSuggestions = [...builtinAdvices, ...state.resources.map(r => r.text)];
                    const suggestion = allSuggestions[Math.floor(Math.random() * allSuggestions.length)];
                    addTask(suggestion, 0, true);
                    addBreakBtn.textContent = 'Р вЂќР С•Р В±Р В°Р Р†Р В»Р ВµР Р…Р С• РІСљвЂњ';
                    addBreakBtn.disabled = true;
                    setTimeout(() => {
                        addBreakBtn.textContent = 'РІВвЂў Р вЂќР С•Р В±Р В°Р Р†Р С‘РЎвЂљРЎРЉ Р С—Р В°РЎС“Р В·РЎС“';
                        addBreakBtn.disabled = false;
                    }, 1500);
                });
                balanceMessageContainer.appendChild(addBreakBtn);
            }
        } else {
            progressBar.style.width = `${percentage}%`;
            progressBar.classList.remove('overloaded');
            balanceMessageContainer.classList.add('hidden');
            const existingBtn = document.getElementById('add-break-btn');
            if (existingBtn) existingBtn.remove();
        }
    }

    function renderArchive() {
        archiveList.innerHTML = '';
        const archivedTasks = state.tasks.filter(t => t.targetDate === null);

        if (archivedTasks.length === 0) {
            archiveList.innerHTML = `<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 16px;">Р С’РЎР‚РЎвЂ¦Р С‘Р Р† Р С—РЎС“РЎРѓРЎвЂљ</div>`;
        }

        archivedTasks.forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-item';

            const weightClass = task.isResource ? 'resource-weight' : '';
            const weightLabel = task.isResource ? 'Р В Р ВµРЎРѓРЎС“РЎР‚РЎРѓ' : `Р вЂ™Р ВµРЎРѓ: ${task.weight}`;

            el.innerHTML = `
                <div class="task-desc">${escapeHtml(task.text)}</div>
                <div class="task-weight ${weightClass}">${weightLabel}</div>
                <button class="postpone-btn" title="Р СњР В° РЎРѓР ВµР С–Р С•Р Т‘Р Р…РЎРЏ" onclick="window.moveToToday('${task.id}')">РІВР‚РїС‘РЏ</button>
                <button class="delete-btn" title="Р Р€Р Т‘Р В°Р В»Р С‘РЎвЂљРЎРЉ" onclick="window.deleteTask('${task.id}', true)">&times;</button>
            `;
            archiveList.appendChild(el);
        });
    }

    function renderWeeklyScreen() {
        if (weeklyScreen.classList.contains('hidden')) return;

        weeklyContainer.innerHTML = '';
        const todayObj = new Date();

        // Р В Р ВµР Р…Р Т‘Р ВµРЎР‚Р С‘Р С 7 Р С”Р С•Р В»Р С•Р Р…Р С•Р С”
        for (let i = 0; i < 7; i++) {
            const d = new Date(todayObj);
            d.setDate(d.getDate() + i);
            const dateStr = getLocalDateString(d);
            const isToday = i === 0;
            const title = d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }) + (isToday ? ' (Р РЋР ВµР С–Р С•Р Т‘Р Р…РЎРЏ)' : '');

            const col = document.createElement('div');
            col.className = 'weekly-col';
            // Р РЋРЎвЂЎР С‘РЎвЂљР В°Р ВµР С Р Р…Р В°Р С–РЎР‚РЎС“Р В·Р С”РЎС“ Р Р…Р В° Р Т‘Р ВµР Р…РЎРЉ
            const dayTasksForLoad = state.tasks.filter(t => t.targetDate === dateStr && !t.completed);
            const dayLoad = dayTasksForLoad.reduce((sum, t) => sum + (t.weight || 0), 0);
            const loadPercent = Math.min((dayLoad / 80) * 100, 100);
            const isOverloaded = dayLoad > 80;
            const loadBarClass = isOverloaded ? 'weekly-load-bar overloaded' : 'weekly-load-bar';
            const loadWarning = isOverloaded ? `<div class="weekly-load-warning">РІС™В  Р СљР Р…Р С•Р С–Р С• РЎвЂљРЎРЏР В¶РЎвЂР В»Р С•Р С–Р С• (${dayLoad})</div>` : '';

            col.innerHTML = `
                <div class="weekly-col-header">
                    <span>${title}</span>
                    <button class="add-weekly-task-icon-btn" onclick="window.openWeeklyTaskModal('${dateStr}')" title="Р вЂќР С•Р В±Р В°Р Р†Р С‘РЎвЂљРЎРЉ Р В·Р В°Р Т‘Р В°РЎвЂЎРЎС“">+</button>
                </div>
                <div class="weekly-load-container">
                    <div class="${loadBarClass}" style="width: ${loadPercent}%"></div>
                </div>
                ${loadWarning}
                <div class="weekly-col-tasks" id="weekly-col-${dateStr}" ondrop="window.dropWeeklyTask(event, '${dateStr}')" ondragover="window.allowWeeklyDrop(event, '${dateStr}')">
                </div>
            `;
            weeklyContainer.appendChild(col);

            const tasksDiv = col.querySelector(`#weekly-col-${dateStr}`);

            const dayTasks = state.tasks.filter(t => t.targetDate === dateStr && !t.completed);
            dayTasks.forEach(task => {
                const tel = document.createElement('div');
                tel.className = 'weekly-task';
                tel.draggable = true;
                tel.dataset.taskId = task.id;
                
                tel.ondragstart = (e) => {
                    tel.classList.add('weekly-dragging'); // Р вЂ™Р С‘Р В·РЎС“Р В°Р В»РЎРЉР Р…РЎвЂ№Р в„– РЎРЊРЎвЂћРЎвЂћР ВµР С”РЎвЂљ
                    // Р С›РЎРѓРЎвЂљР В°Р Р†Р В»РЎРЏР ВµР С dataTransfer Р Т‘Р В»РЎРЏ РЎРѓР С•Р Р†Р СР ВµРЎРѓРЎвЂљР С‘Р СР С•РЎРѓРЎвЂљР С‘, Р ВµРЎРѓР В»Р С‘ Р С—Р С•РЎвЂљРЎР‚Р ВµР В±РЎС“Р ВµРЎвЂљРЎРѓРЎРЏ Р С—Р С•РЎвЂљР С•Р С
                    e.dataTransfer.setData('taskId', task.id); 
                };
                
                tel.ondragend = () => {
                    tel.classList.remove('weekly-dragging');
                };

                tel.innerHTML = `
                    <div class="weekly-task-text">${escapeHtml(task.text)}</div>
                    <div class="weekly-task-weight">${task.weight}</div>
                `;
                tasksDiv.appendChild(tel);
            });
        }
    }

    function renderResources() {
        resourcesList.innerHTML = '';
        state.resources.forEach(res => {
            const el = document.createElement('div');
            el.className = 'resource-item';
            el.innerHTML = `
                <button class="add-resource-to-day" onclick="window.addResourceToDay('${res.id}')">+</button>
                <div class="task-desc">${escapeHtml(res.text)}</div>
                <button class="delete-btn" onclick="window.deleteResource('${res.id}')">&times;</button>
            `;
            resourcesList.appendChild(el);
        });
    }

    function renderTemplates() {
        templatesContainer.innerHTML = '';
        state.templates.forEach(tpl => {
            const block = document.createElement('div');
            block.className = 'template-block';
            
            const header = document.createElement('div');
            header.className = 'template-header';
            header.innerHTML = `
                <h4>${escapeHtml(tpl.name)}</h4>
                <button class="add-template-all-btn" onclick="window.addAllTemplateTasksToDay('${tpl.id}')">+ Р вЂ™РЎРѓРЎвЂ</button>
            `;
            block.appendChild(header);

            const taskList = document.createElement('div');
            taskList.className = 'template-task-list';

            tpl.tasks.forEach(task => {
                const item = document.createElement('div');
                item.className = 'template-task-item';
                
                const weights = [5, 10, 20, 30, 50];
                let selectHtml = `<select class="template-task-weight" onchange="window.changeTemplateTaskWeight('${tpl.id}', '${task.id}', this.value)">`;
                weights.forEach(w => {
                    selectHtml += `<option value="${w}" ${task.weight === w ? 'selected' : ''}>${w}</option>`;
                });
                selectHtml += `</select>`;

                item.innerHTML = `
                    <div class="task-desc">${escapeHtml(task.text)}</div>
                    ${selectHtml}
                    <button class="add-template-task-btn" data-ttid="${task.id}" onclick="window.addTemplateTaskToDay('${tpl.id}', '${task.id}')">+</button>
                `;
                taskList.appendChild(item);
            });

            block.appendChild(taskList);
            templatesContainer.appendChild(block);
        });
    }

    // Р вЂњР В»Р С•Р В±Р В°Р В»РЎРЉР Р…РЎвЂ№Р Вµ РЎвЂћРЎС“Р Р…Р С”РЎвЂ Р С‘Р С‘
    window.toggleTask = toggleTask;
    window.deleteTask = deleteTask;
    window.postponeTask = postponeTask;
    window.deleteResource = deleteResource;
    window.addResourceToDay = (id) => {
        const res = state.resources.find(r => r.id === id);
        if (res) {
            addTask(res.text, 0, true);

            // Р вЂ™Р С‘Р В·РЎС“Р В°Р В»РЎРЉР Р…Р В°РЎРЏ Р С•Р В±РЎР‚Р В°РЎвЂљР Р…Р В°РЎРЏ РЎРѓР Р†РЎРЏР В·РЎРЉ Р Р†Р СР ВµРЎРѓРЎвЂљР С• Р В·Р В°Р С”РЎР‚РЎвЂ№РЎвЂљР С‘РЎРЏ Р СР С•Р Т‘Р В°Р В»РЎРЉР Р…Р С•Р С–Р С• Р С•Р С”Р Р…Р В°
            const btn = document.querySelector(`button[onclick="window.addResourceToDay('${id}')"]`);
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'РІСљвЂњ';
                btn.style.backgroundColor = 'var(--primary-color)';
                btn.style.color = 'white';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                }, 1000);
            }
        }
    };
    window.allowWeeklyDrop = (e, dateStr) => {
        e.preventDefault();
        const draggable = document.querySelector('.weekly-dragging');
        if (!draggable) return;

        const container = document.getElementById(`weekly-col-${dateStr}`);
        const afterElement = getWeeklyDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    };

    window.dropWeeklyTask = (e, dateStr) => {
        e.preventDefault();
        const draggable = document.querySelector('.weekly-dragging');
        if (!draggable) return;

        const id = draggable.dataset.taskId;
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            // Р РЋР Р…Р В°РЎвЂЎР В°Р В»Р В° Р СР ВµР Р…РЎРЏР ВµР С Р Т‘Р В°РЎвЂљРЎС“, Р ВµРЎРѓР В»Р С‘ Р С—Р ВµРЎР‚Р ВµР Р…Р ВµРЎРѓР В»Р С‘ Р Р† Р Т‘РЎР‚РЎС“Р С–Р С•Р в„– Р Т‘Р ВµР Р…РЎРЉ
            task.targetDate = dateStr;

            // Р СћР ВµР С—Р ВµРЎР‚РЎРЉ РЎРѓР С•РЎР‚РЎвЂљР С‘РЎР‚РЎС“Р ВµР С Р Р†Р Р…РЎС“РЎвЂљРЎР‚Р С‘ Р Р…Р С•Р Р†Р С•Р С–Р С• Р Т‘Р Р…РЎРЏ
            const container = document.getElementById(`weekly-col-${dateStr}`);
            const taskElements = [...container.querySelectorAll('.weekly-task')];
            const newOrderIds = taskElements.map(el => el.dataset.taskId);

            const dayTasks = state.tasks.filter(t => t.targetDate === dateStr && !t.completed);
            
            dayTasks.sort((a, b) => {
                const indexA = newOrderIds.indexOf(a.id);
                const indexB = newOrderIds.indexOf(b.id);
                return indexA - indexB;
            });

            const otherTasks = state.tasks.filter(t => t.targetDate !== dateStr || t.completed);
            state.tasks = [...otherTasks, ...dayTasks];

            saveState();
            renderWeeklyScreen();
            renderMainScreen(); // Р С›Р В±Р Р…Р С•Р Р†Р В»РЎРЏР ВµР С Р С‘ Р С–Р В»Р В°Р Р†Р Р…РЎвЂ№Р в„– РЎРЊР С”РЎР‚Р В°Р Р…, Р Р†Р Т‘РЎР‚РЎС“Р С– Р Т‘Р В°РЎвЂљР В° "Р РЋР ВµР С–Р С•Р Т‘Р Р…РЎРЏ"
        }
    };

    function getWeeklyDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.weekly-task:not(.weekly-dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Р Р€РЎвЂљР С‘Р В»Р С‘РЎвЂљРЎвЂ№
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function saveState() {
        localStorage.setItem('resourceTodoState', JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem('resourceTodoState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
                if (!Array.isArray(state.tasks)) state.tasks = [];
                if (typeof state.pendingReviewDate !== 'string') state.pendingReviewDate = null;

                // Р ВРЎРѓР С—РЎР‚Р В°Р Р†Р В»Р ВµР Р…Р С‘Р Вµ Р Р†Р С•Р В·Р СР С•Р В¶Р Р…РЎвЂ№РЎвЂ¦ Р Т‘РЎС“Р В±Р В»Р С‘Р С”Р В°РЎвЂљР С•Р Р† ID Р В·Р В°Р Т‘Р В°РЎвЂЎ Р С‘Р В·-Р В·Р В° РЎРѓРЎвЂљР В°РЎР‚Р С•Р С–Р С• Р В±Р В°Р С–Р В°
                const seenIds = new Set();
                state.tasks.forEach(t => {
                    if (seenIds.has(t.id)) {
                        t.id = 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
                    }
                    seenIds.add(t.id);
                });
                if (!Array.isArray(state.resources)) state.resources = [];
                if (!Array.isArray(state.templates) || state.templates.length === 0) {
                    state.templates = [
                        {
                            id: 'tpl_1', name: 'Р Р€РЎвЂљРЎР‚Р С•', tasks: [
                                { id: 'tt_11', text: 'Р вЂ™РЎвЂ№Р С—Р С‘РЎвЂљРЎРЉ Р Р†Р С•Р Т‘РЎС“', weight: 5 },
                                { id: 'tt_12', text: 'Р СџРЎР‚Р С‘Р Р…РЎРЏРЎвЂљРЎРЉ Р В»Р ВµР С”Р В°РЎР‚РЎРѓРЎвЂљР Р†Р В°', weight: 5 },
                                { id: 'tt_13', text: 'Р СџР С•РЎвЂЎР С‘РЎРѓРЎвЂљР С‘РЎвЂљРЎРЉ Р В·РЎС“Р В±РЎвЂ№', weight: 5 },
                                { id: 'tt_14', text: 'Р вЂ”Р В°Р Р†РЎвЂљРЎР‚Р В°Р С”-Р СР С‘Р Р…Р С‘Р СРЎС“Р С', weight: 5 }
                            ]
                        },
                        {
                            id: 'tpl_2', name: 'Р вЂ™РЎвЂ№РЎвЂ¦Р С•Р Т‘ Р С‘Р В· Р Т‘Р С•Р СР В°', tasks: [
                                { id: 'tt_21', text: 'Р С™Р В»РЎР‹РЎвЂЎР С‘', weight: 5 },
                                { id: 'tt_22', text: 'Р СћР ВµР В»Р ВµРЎвЂћР С•Р Р…', weight: 5 },
                                { id: 'tt_23', text: 'Р СњР В°РЎС“РЎв‚¬Р Р…Р С‘Р С”Р С‘', weight: 5 },
                                { id: 'tt_24', text: 'Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚Р С‘РЎвЂљРЎРЉ Р С—Р В»Р С‘РЎвЂљРЎС“', weight: 5 },
                                { id: 'tt_25', text: 'Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚Р С‘РЎвЂљРЎРЉ РЎР‚Р С•Р В·Р ВµРЎвЂљР С”Р С‘', weight: 5 },
                                { id: 'tt_26', text: 'Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚Р С‘РЎвЂљРЎРЉ Р Р†РЎвЂ¦Р С•Р Т‘Р Р…РЎС“РЎР‹ Р Т‘Р Р†Р ВµРЎР‚РЎРЉ', weight: 5 }
                            ]
                        },
                        {
                            id: 'tpl_3', name: 'Р вЂ™Р ВµРЎвЂЎР ВµРЎР‚', tasks: [
                                { id: 'tt_31', text: 'Р СџР С•РЎРѓРЎвЂљР В°Р Р†Р С‘РЎвЂљРЎРЉ РЎС“РЎРѓРЎвЂљРЎР‚Р С•Р в„–РЎРѓРЎвЂљР Р†Р В° Р Р…Р В° Р В·Р В°РЎР‚РЎРЏР Т‘Р С”РЎС“', weight: 5 },
                                { id: 'tt_32', text: 'Р СџРЎР‚Р С•Р Р†Р ВµРЎвЂљРЎР‚Р С‘РЎвЂљРЎРЉ', weight: 5 },
                                { id: 'tt_33', text: 'Р вЂ™Р ВµРЎвЂЎР ВµРЎР‚Р Р…Р С‘Р Вµ РЎвЂљР В°Р В±Р В»Р ВµРЎвЂљР С”Р С‘', weight: 5 }
                            ]
                        },
                        {
                            id: 'tpl_4', name: 'Low Energy Day (SOS)', tasks: [
                                { id: 'tt_41', text: 'Р вЂќР ВµР В»Р ВµР С–Р С‘РЎР‚Р С•Р Р†Р В°РЎвЂљРЎРЉ/Р С•РЎвЂљР В»Р С•Р В¶Р С‘РЎвЂљРЎРЉ Р Т‘Р ВµР В»Р В°', weight: 5 },
                                { id: 'tt_42', text: 'Р СџР С‘РЎвЂљРЎРЉ Р Р†Р С•Р Т‘РЎС“', weight: 5 },
                                { id: 'tt_43', text: 'Р вЂєР ВµР В¶Р В°РЎвЂљРЎРЉ Р Р† РЎвЂљР С‘РЎв‚¬Р С‘Р Р…Р Вµ', weight: 5 }
                            ]
                        }
                    ];
                    saveState();
                } else {
                    // Р СљР С‘Р С–РЎР‚Р В°РЎвЂ Р С‘РЎРЏ: Р Т‘Р С•Р В±Р В°Р Р†Р В»РЎРЏР ВµР С Р Р…Р С•Р Р†РЎвЂ№Р Вµ Р В·Р В°Р Т‘Р В°РЎвЂЎР С‘ Р Р† РЎРѓРЎС“РЎвЂ°Р ВµРЎРѓРЎвЂљР Р†РЎС“РЎР‹РЎвЂ°Р С‘Р в„– РЎв‚¬Р В°Р В±Р В»Р С•Р Р… "Р вЂ™РЎвЂ№РЎвЂ¦Р С•Р Т‘ Р С‘Р В· Р Т‘Р С•Р СР В°"
                    const exitHomeTpl = state.templates.find(t => t.id === 'tpl_2');
                    if (exitHomeTpl && exitHomeTpl.tasks) {
                        if (!exitHomeTpl.tasks.find(t => t.id === 'tt_25')) {
                            exitHomeTpl.tasks.push({ id: 'tt_25', text: 'Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚Р С‘РЎвЂљРЎРЉ РЎР‚Р С•Р В·Р ВµРЎвЂљР С”Р С‘', weight: 5 });
                        }
                        if (!exitHomeTpl.tasks.find(t => t.id === 'tt_26')) {
                            exitHomeTpl.tasks.push({ id: 'tt_26', text: 'Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚Р С‘РЎвЂљРЎРЉ Р Р†РЎвЂ¦Р С•Р Т‘Р Р…РЎС“РЎР‹ Р Т‘Р Р†Р ВµРЎР‚РЎРЉ', weight: 5 });
                        }
                    }
                }
                if (state.avatar && !state.avatar.includes('.png')) state.avatar = 'assets/girl.png';
                const today = getLocalDateString();
                if (!state.pendingReviewDate && state.lastDate !== today && getOverdueTasks(today).length > 0) {
                    state.pendingReviewDate = today;
                }
            } catch (e) {
                console.error("Failed to load state", e);
            }
        }
    }

    init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapResourceTodoApp);
} else {
    bootstrapResourceTodoApp();
}
