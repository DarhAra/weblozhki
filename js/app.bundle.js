/* Generated from js/main.js. Run `npm run build` after editing source modules. */
(() => {
  // js/ui/elements.js
  function collectElements(doc = document) {
    return {
      onboardingScreen: doc.getElementById("onboarding-screen"),
      morningScreen: doc.getElementById("morning-screen"),
      mainScreen: doc.getElementById("main-screen"),
      reviewScreen: doc.getElementById("review-screen"),
      weeklyScreen: doc.getElementById("weekly-screen"),
      historyScreen: doc.getElementById("history-screen"),
      weeklyTaskModal: doc.getElementById("weekly-task-modal"),
      libraryModal: doc.getElementById("library-modal"),
      archiveModal: doc.getElementById("archive-modal"),
      completedModal: doc.getElementById("completed-modal"),
      templatesModal: doc.getElementById("templates-modal"),
      helperModal: doc.getElementById("helper-modal"),
      sosModal: doc.getElementById("sos-modal"),
      allDoneModal: doc.getElementById("all-done-modal"),
      energyInput: doc.getElementById("energy-input"),
      energyDisplay: doc.getElementById("energy-display"),
      startDayBtn: doc.getElementById("start-day-btn"),
      reviewTasksList: doc.getElementById("review-tasks-list"),
      finishReviewBtn: doc.getElementById("finish-review-btn"),
      morningTitle: doc.getElementById("morning-title"),
      appHelperAvatar: doc.getElementById("app-helper-avatar"),
      balanceSection: doc.getElementById("balance-section"),
      usedEnergyEl: doc.getElementById("used-energy"),
      totalEnergyEl: doc.getElementById("total-energy"),
      progressBar: doc.getElementById("progress-bar"),
      balanceMessageContainer: doc.getElementById("balance-message-container"),
      balanceMessageAvatar: doc.getElementById("balance-message-avatar"),
      balanceMessage: doc.getElementById("balance-message"),
      openSosBtn: doc.getElementById("open-sos-btn"),
      sosView: doc.getElementById("sos-view"),
      sosViewCaption: doc.getElementById("sos-view-caption"),
      exitSosViewBtn: doc.getElementById("exit-sos-view-btn"),
      mainContentGrid: doc.getElementById("main-content-grid"),
      selfCareSlot: doc.getElementById("self-care-slot"),
      tasksSection: doc.getElementById("tasks-section"),
      tasksTitle: doc.getElementById("tasks-title"),
      tasksList: doc.getElementById("tasks-list"),
      selfCareList: doc.getElementById("self-care-list"),
      addTaskForm: doc.getElementById("add-task-form"),
      taskInput: doc.getElementById("task-text"),
      taskWeightSelect: doc.getElementById("task-weight"),
      openLibraryBtn: doc.getElementById("open-library-btn"),
      closeLibraryBtn: doc.getElementById("close-library-btn"),
      resourcesList: doc.getElementById("resources-list"),
      addResourceForm: doc.getElementById("add-resource-form"),
      resourceInput: doc.getElementById("resource-text"),
      addSelfCareBtn: doc.getElementById("add-self-care-btn"),
      openArchiveBtn: doc.getElementById("open-archive-btn"),
      clearArchiveBtn: doc.getElementById("clear-archive-btn"),
      closeArchiveBtn: doc.getElementById("close-archive-btn"),
      archiveList: doc.getElementById("archive-list"),
      openCompletedBtn: doc.getElementById("open-completed-btn"),
      clearCompletedBtn: doc.getElementById("clear-completed-btn"),
      closeCompletedBtn: doc.getElementById("close-completed-btn"),
      completedList: doc.getElementById("completed-list"),
      openHistoryBtn: doc.getElementById("open-history-btn"),
      closeHistoryBtn: doc.getElementById("close-history-btn"),
      historyInsights: doc.getElementById("history-insights"),
      historyList: doc.getElementById("history-list"),
      openWeeklyBtn: doc.getElementById("open-weekly-btn"),
      closeWeeklyBtn: doc.getElementById("close-weekly-btn"),
      weeklyContainer: doc.getElementById("weekly-container"),
      closeWeeklyTaskBtn: doc.getElementById("close-weekly-task-btn"),
      addWeeklyTaskForm: doc.getElementById("add-weekly-task-form"),
      weeklyTaskText: doc.getElementById("weekly-task-text"),
      weeklyTaskWeight: doc.getElementById("weekly-task-weight"),
      closeHelperBtn: doc.getElementById("close-helper-btn"),
      adviceAvatar: doc.getElementById("advice-avatar"),
      adviceText: doc.getElementById("advice-text"),
      adviceAddBtn: doc.getElementById("advice-add-btn"),
      adviceRefreshBtn: doc.getElementById("advice-refresh-btn"),
      closeSosBtn: doc.getElementById("close-sos-btn"),
      sosArchiveBtn: doc.getElementById("sos-archive-btn"),
      sosTomorrowBtn: doc.getElementById("sos-tomorrow-btn"),
      sosCancelBtn: doc.getElementById("sos-cancel-btn"),
      allDoneAvatar: doc.getElementById("all-done-avatar"),
      allDoneText: doc.getElementById("all-done-text"),
      allDoneCloseBtn: doc.getElementById("all-done-close-btn"),
      openTemplatesBtn: doc.getElementById("open-templates-btn"),
      closeTemplatesBtn: doc.getElementById("close-templates-btn"),
      templatesContainer: doc.getElementById("templates-container"),
      onboardingStep1: doc.getElementById("onboarding-step-1"),
      onboardingStep2: doc.getElementById("onboarding-step-2"),
      onboardingStep3: doc.getElementById("onboarding-step-3"),
      onboardingStep4: doc.getElementById("onboarding-step-4"),
      avatarOptions: [...doc.querySelectorAll(".avatar-option")],
      onboardingNameInput: doc.getElementById("onboarding-name-input"),
      genderOptions: [...doc.querySelectorAll(".gender-option")],
      resourceTags: [...doc.querySelectorAll(".resource-tag")],
      onboardingCustomResourceInput: doc.getElementById("onboarding-custom-resource-input"),
      onboardingBackBtn: doc.getElementById("onboarding-back-btn"),
      onboardingNextBtn: doc.getElementById("onboarding-next-btn"),
      step3Avatar: doc.getElementById("step-3-avatar"),
      step4Avatar: doc.getElementById("step-4-avatar")
    };
  }

  // js/utils/date.js
  function getLocalDateString(date = /* @__PURE__ */ new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  function parseLocalDate(dateString) {
    if (!dateString) {
      return /* @__PURE__ */ new Date();
    }
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // js/domain/history.js
  var MAX_MOOD_HISTORY_DAYS = 14;
  function createCurrentDayMeta(date = getLocalDateString()) {
    return {
      date,
      usedSos: false,
      sosDestination: null
    };
  }
  function normalizeMoodHistory(moodHistory) {
    if (!Array.isArray(moodHistory)) {
      return [];
    }
    return [...moodHistory].filter((entry) => entry && typeof entry.date === "string").sort((left, right) => right.date.localeCompare(left.date)).slice(0, MAX_MOOD_HISTORY_DAYS);
  }
  function buildMoodHistoryEntry(state, date) {
    var _a;
    if (!date || state.energyBudget === null) {
      return null;
    }
    const dayTasks = state.tasks.filter(
      (task) => task.targetDate === date || task.archivedFromDate === date || task.completedAtDate === date
    );
    const regularTasks = dayTasks.filter((task) => !task.isResource);
    const resourceTasks = dayTasks.filter((task) => task.isResource);
    const completedRegularTasks = regularTasks.filter((task) => task.completed || task.completedAtDate === date);
    const currentDayMeta = ((_a = state.currentDayMeta) == null ? void 0 : _a.date) === date ? state.currentDayMeta : createCurrentDayMeta(date);
    const plannedWeight = regularTasks.reduce((sum, task) => sum + (task.weight || 0), 0);
    const completedWeight = completedRegularTasks.reduce((sum, task) => sum + (task.weight || 0), 0);
    return {
      date,
      energyBudget: state.energyBudget,
      plannedRegularTasks: regularTasks.length,
      completedRegularTasks: completedRegularTasks.length,
      plannedWeight,
      completedWeight,
      resourceTasks: resourceTasks.length,
      usedSos: Boolean(currentDayMeta.usedSos),
      sosDestination: currentDayMeta.sosDestination || null,
      endedOverloaded: plannedWeight > state.energyBudget
    };
  }
  function upsertMoodHistoryEntry(moodHistory, entry) {
    if (!entry) {
      return normalizeMoodHistory(moodHistory);
    }
    const withoutCurrentDate = (Array.isArray(moodHistory) ? moodHistory : []).filter((item) => (item == null ? void 0 : item.date) !== entry.date);
    return normalizeMoodHistory([entry, ...withoutCurrentDate]);
  }
  function getMoodHistoryInsights(moodHistory) {
    const entries = normalizeMoodHistory(moodHistory);
    if (entries.length < 3) {
      return ["История только начинает собираться. Через несколько дней здесь появятся спокойные наблюдения о вашем ритме."];
    }
    const insights = [];
    const lowEnergyDays = entries.filter((entry) => entry.energyBudget <= 30);
    const lowEnergyWithSos = lowEnergyDays.filter((entry) => entry.usedSos);
    if (lowEnergyDays.length >= 2 && lowEnergyWithSos.length >= Math.ceil(lowEnergyDays.length / 2)) {
      insights.push("В дни с более низким запасом сил SOS включался чаще. Возможно, в такие дни лучше сразу планировать мягче.");
    }
    const calmDays = entries.filter((entry) => !entry.endedOverloaded && !entry.usedSos);
    if (calmDays.length >= 2) {
      insights.push("Когда план на день был спокойнее, день чаще проходил без перегруза и экстренной остановки.");
    }
    const resourceRichDays = entries.filter((entry) => entry.resourceTasks >= 2);
    if (resourceRichDays.length >= 2) {
      insights.push("В истории уже есть дни, где рядом с делами было место для ресурсов. Это хороший устойчивый ритм.");
    }
    if (insights.length === 0) {
      insights.push("Пока история выглядит ровной. Ещё немного дней, и здесь станет проще замечать личные паттерны.");
    }
    return insights.slice(0, 2);
  }

  // js/domain/tasks.js
  var TASK_STORAGE = {
    ACTIVE: "active",
    DEFERRED: "deferred",
    DONE: "done"
  };
  function getTaskStorageStatus(task) {
    if ((task == null ? void 0 : task.storageStatus) === TASK_STORAGE.ACTIVE || (task == null ? void 0 : task.storageStatus) === TASK_STORAGE.DEFERRED || (task == null ? void 0 : task.storageStatus) === TASK_STORAGE.DONE) {
      return task.storageStatus;
    }
    if ((task == null ? void 0 : task.completedAtDate) || (task == null ? void 0 : task.completed) && !(task == null ? void 0 : task.targetDate)) {
      return TASK_STORAGE.DONE;
    }
    if ((task == null ? void 0 : task.isArchived) === true || (task == null ? void 0 : task.targetDate) === null) {
      return TASK_STORAGE.DEFERRED;
    }
    return TASK_STORAGE.ACTIVE;
  }
  function setTaskStorageStatus(task, status) {
    task.storageStatus = status;
    task.isArchived = status === TASK_STORAGE.DEFERRED;
  }
  function getOverdueTasks(state, today = getLocalDateString()) {
    return state.tasks.filter((task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate && task.targetDate < today);
  }
  function getTodayTasks(state, today = getLocalDateString()) {
    return state.tasks.filter((task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today);
  }
  function moveCompletedTodayTasksToDone(store, today = getLocalDateString()) {
    let movedCount = 0;
    store.updateState((state) => {
      state.tasks.forEach((task) => {
        if (getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && task.completed) {
          task.targetDate = null;
          task.archivedFromDate = today;
          task.completedAtDate = task.completedAtDate || today;
          task.completed = false;
          setTaskStorageStatus(task, TASK_STORAGE.DONE);
          movedCount += 1;
        }
      });
    });
    return movedCount;
  }
  function getOpenRegularTodayTasks(state, today = getLocalDateString()) {
    return state.tasks.filter(
      (task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && !task.completed && !task.isResource
    );
  }
  function getDeferredTasks(state) {
    return state.tasks.filter((task) => getTaskStorageStatus(task) === TASK_STORAGE.DEFERRED && !task.completed);
  }
  function getDoneTasks(state) {
    return state.tasks.filter((task) => getTaskStorageStatus(task) === TASK_STORAGE.DONE);
  }
  function addTask(store, { text, weight, isResource, targetDate = null }) {
    const newTask = {
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      text,
      weight,
      isResource,
      completed: false,
      completedAtDate: null,
      storageStatus: TASK_STORAGE.ACTIVE,
      isArchived: false,
      targetDate: targetDate || getLocalDateString()
    };
    store.updateState((state) => {
      state.tasks.push(newTask);
    });
    return newTask;
  }
  function toggleTask(store, taskId) {
    let updatedTask = null;
    store.updateState((state) => {
      updatedTask = state.tasks.find((task) => task.id === taskId) || null;
      if (updatedTask && getTaskStorageStatus(updatedTask) === TASK_STORAGE.ACTIVE) {
        updatedTask.completed = !updatedTask.completed;
        updatedTask.completedAtDate = updatedTask.completed ? getLocalDateString() : null;
      }
    });
    return updatedTask;
  }
  function deleteTask(store, taskId) {
    store.updateState((state) => {
      state.tasks = state.tasks.filter((task) => task.id !== taskId);
    });
  }
  function clearDeferredTasks(store) {
    let removedCount = 0;
    store.updateState((state) => {
      state.tasks = state.tasks.filter((task) => {
        const shouldKeep = getTaskStorageStatus(task) !== TASK_STORAGE.DEFERRED || task.completed;
        if (!shouldKeep) {
          removedCount += 1;
        }
        return shouldKeep;
      });
    });
    return removedCount;
  }
  function clearDoneTasks(store) {
    let removedCount = 0;
    store.updateState((state) => {
      state.tasks = state.tasks.filter((task) => {
        const shouldKeep = getTaskStorageStatus(task) !== TASK_STORAGE.DONE;
        if (!shouldKeep) {
          removedCount += 1;
        }
        return shouldKeep;
      });
    });
    return removedCount;
  }
  function postponeTask(store, taskId) {
    store.updateState((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) return;
      const currentDate = parseLocalDate(task.targetDate || getLocalDateString());
      currentDate.setDate(currentDate.getDate() + 1);
      task.targetDate = getLocalDateString(currentDate);
    });
  }
  function moveToToday(store, taskId) {
    store.updateState((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (task) {
        task.targetDate = getLocalDateString();
        setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
      }
    });
  }
  function moveToDeferred(store, taskId) {
    store.updateState((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (task) {
        task.archivedFromDate = task.targetDate || getLocalDateString();
        task.targetDate = null;
        task.completed = false;
        setTaskStorageStatus(task, TASK_STORAGE.DEFERRED);
      }
    });
  }
  function archiveRemainingOverdue(store, today = getLocalDateString()) {
    store.updateState((state) => {
      state.tasks.forEach((task) => {
        if (getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate && task.targetDate < today) {
          task.archivedFromDate = task.targetDate;
          task.targetDate = null;
          setTaskStorageStatus(task, TASK_STORAGE.DEFERRED);
        }
      });
    });
  }
  function archiveOpenRegularTodayTasks(store, today = getLocalDateString()) {
    let movedCount = 0;
    store.updateState((state) => {
      state.tasks.forEach((task) => {
        if (getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && !task.completed && !task.isResource) {
          task.archivedFromDate = today;
          task.targetDate = null;
          setTaskStorageStatus(task, TASK_STORAGE.DEFERRED);
          movedCount += 1;
        }
      });
    });
    return movedCount;
  }
  function moveOpenRegularTodayTasksToTomorrow(store, today = getLocalDateString()) {
    let movedCount = 0;
    const tomorrowDate = parseLocalDate(today);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = getLocalDateString(tomorrowDate);
    store.updateState((state) => {
      state.tasks.forEach((task) => {
        if (getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && !task.completed && !task.isResource) {
          task.targetDate = tomorrow;
          setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
          movedCount += 1;
        }
      });
    });
    return movedCount;
  }
  function completePendingReview(store) {
    store.updateState((state) => {
      state.pendingReviewDate = null;
      state.lastDate = getLocalDateString();
      state.energyBudget = null;
      state.currentDayMeta = createCurrentDayMeta(getLocalDateString());
    });
  }
  function reorderTodayTasks(store, { isResource, newOrderIds, today = getLocalDateString() }) {
    store.updateState((state) => {
      const currentTasks = state.tasks.filter(
        (task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && task.isResource === isResource
      );
      currentTasks.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
      const otherTasks = state.tasks.filter(
        (task) => getTaskStorageStatus(task) !== TASK_STORAGE.ACTIVE || task.targetDate !== today || task.isResource !== isResource
      );
      state.tasks = [...otherTasks, ...currentTasks];
    });
  }
  function moveTaskToDate(store, { taskId, dateStr }) {
    store.updateState((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (task) {
        task.targetDate = dateStr;
        setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
      }
    });
  }
  function reorderWeeklyTasks(store, { dateStr, newOrderIds }) {
    store.updateState((state) => {
      const dayTasks = state.tasks.filter(
        (task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === dateStr && !task.completed
      );
      dayTasks.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
      const otherTasks = state.tasks.filter(
        (task) => getTaskStorageStatus(task) !== TASK_STORAGE.ACTIVE || task.targetDate !== dateStr || task.completed
      );
      state.tasks = [...otherTasks, ...dayTasks];
    });
  }

  // js/state/store.js
  var STORAGE_KEY = "resourceTodoState";
  function getDefaultTemplates() {
    return [
      { id: "tpl_1", name: "Утро", tasks: [{ id: "tt_11", text: "Выпить воду", weight: 5 }, { id: "tt_12", text: "Принять лекарства", weight: 5 }, { id: "tt_13", text: "Почистить зубы", weight: 5 }, { id: "tt_14", text: "Завтрак-минимум", weight: 5 }] },
      { id: "tpl_2", name: "Выход из дома", tasks: [{ id: "tt_21", text: "Ключи", weight: 5 }, { id: "tt_22", text: "Телефон", weight: 5 }, { id: "tt_23", text: "Наушники", weight: 5 }, { id: "tt_24", text: "Проверить плиту", weight: 5 }, { id: "tt_25", text: "Проверить розетки", weight: 5 }, { id: "tt_26", text: "Проверить входную дверь", weight: 5 }] },
      { id: "tpl_3", name: "Вечер", tasks: [{ id: "tt_31", text: "Поставить устройства на зарядку", weight: 5 }, { id: "tt_32", text: "Проветрить", weight: 5 }, { id: "tt_33", text: "Вечерние таблетки", weight: 5 }] },
      { id: "tpl_4", name: "Low Energy Day (SOS)", tasks: [{ id: "tt_41", text: "Делегировать/отложить дела", weight: 5 }, { id: "tt_42", text: "Пить воду", weight: 5 }, { id: "tt_43", text: "Лежать в тишине", weight: 5 }] }
    ];
  }
  function getDefaultState() {
    return {
      hasOnboarded: false,
      userName: "",
      gender: "female",
      avatar: "assets/girl.png",
      energyBudget: null,
      lastDate: null,
      pendingReviewDate: null,
      currentDayMeta: createCurrentDayMeta(null),
      moodHistory: [],
      tasks: [],
      resources: [
        { id: "res_1", text: "Попить кофе" },
        { id: "res_2", text: "10 минут соцсетей" },
        { id: "res_3", text: "Прогулка 15 минут" }
      ],
      templates: []
    };
  }
  function ensureTemplateMigrations(state) {
    const exitHomeTemplate = state.templates.find((template) => template.id === "tpl_2");
    if (!(exitHomeTemplate == null ? void 0 : exitHomeTemplate.tasks)) {
      return;
    }
    if (!exitHomeTemplate.tasks.find((task) => task.id === "tt_25")) {
      exitHomeTemplate.tasks.push({ id: "tt_25", text: "Проверить розетки", weight: 5 });
    }
    if (!exitHomeTemplate.tasks.find((task) => task.id === "tt_26")) {
      exitHomeTemplate.tasks.push({ id: "tt_26", text: "Проверить входную дверь", weight: 5 });
    }
  }
  function createStore() {
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
        if (typeof state.pendingReviewDate !== "string") {
          state.pendingReviewDate = null;
        }
        if (!state.currentDayMeta || typeof state.currentDayMeta !== "object") {
          state.currentDayMeta = createCurrentDayMeta(state.lastDate);
        }
        if (state.lastDate && state.currentDayMeta.date !== state.lastDate) {
          state.currentDayMeta = createCurrentDayMeta(state.lastDate);
        }
        const seenIds = /* @__PURE__ */ new Set();
        state.tasks.forEach((task) => {
          if (seenIds.has(task.id)) {
            task.id = `task_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
          }
          seenIds.add(task.id);
          if (typeof task.completedAtDate !== "string") {
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
        if (state.avatar && !state.avatar.includes(".png")) {
          state.avatar = "assets/girl.png";
        }
        const today = getLocalDateString();
        const hasOverdue = state.tasks.some((task) => task.targetDate && task.targetDate < today);
        if (!state.pendingReviewDate && state.lastDate !== today && hasOverdue) {
          state.pendingReviewDate = today;
        }
      } catch (error) {
        console.error("Failed to load state", error);
      }
      return state;
    }
    return {
      getState,
      setState,
      saveState,
      updateState,
      loadState
    };
  }

  // js/utils/dom.js
  function escapeHtml(unsafe) {
    return String(unsafe).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function closestActionTarget(target) {
    return target.closest("[data-action]");
  }

  // js/ui/renderers.js
  function genderText(state, male, female) {
    return state.gender === "male" ? male : female;
  }
  function spawnHearts(targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const hearts = ["❤", "💖", "💗"];
    for (let index = 0; index < 5; index += 1) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
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
      return "Дата не указана";
    }
    return (/* @__PURE__ */ new Date(`${date}T00:00:00`)).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long"
    });
  }
  function renderTaskElement(task) {
    const taskEl = document.createElement("div");
    taskEl.className = `task-item ${task.completed ? "completed" : ""} ${task.isResource ? "resource-item-drag" : ""}`;
    taskEl.draggable = true;
    taskEl.dataset.taskId = task.id;
    const weightClass = task.isResource ? "resource-weight" : "";
    const weightLabel = task.isResource ? "Ресурс" : `Вес: ${task.weight}`;
    const controlsHtml = !task.isResource && !task.completed ? `
            <button class="postpone-btn" title="На потом" data-action="move-to-deferred" data-task-id="${task.id}">📦</button>
            <button class="postpone-btn" title="На завтра" data-action="postpone-task" data-task-id="${task.id}">➡️</button>
        ` : "";
    taskEl.innerHTML = `
        <div class="task-checkbox-container" data-action="toggle-task" data-task-id="${task.id}">
            <div class="custom-checkbox"></div>
        </div>
        <div class="task-desc">${escapeHtml(task.text)}</div>
        <div class="task-weight ${weightClass}">${weightLabel}</div>
        ${controlsHtml}
        <button class="delete-btn" title="Удалить" data-action="delete-task" data-task-id="${task.id}">&times;</button>
    `;
    return taskEl;
  }
  function formatMoodDate(date) {
    const parsedDate = /* @__PURE__ */ new Date(`${date}T00:00:00`);
    return parsedDate.toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "long"
    });
  }
  function buildMoodNote(entry) {
    if (entry.usedSos) {
      return entry.sosDestination === "tomorrow" ? "День пришлось облегчить, а оставшееся аккуратно перенесено на завтра." : "День пришлось мягко остановить, а оставшееся перенесено в раздел «На потом».";
    }
    if (entry.endedOverloaded) {
      return "План был плотнее, чем запас сил на этот день. Это хороший сигнал планировать мягче.";
    }
    if (entry.completedRegularTasks === entry.plannedRegularTasks && entry.plannedRegularTasks > 0) {
      return "Обычные дела на этот день удалось завершить спокойно и полностью.";
    }
    if (entry.resourceTasks > 0) {
      return "В этом дне нашлось место не только для дел, но и для восстановления.";
    }
    return "День прошёл без резких перегрузок. История постепенно собирает ваш ритм.";
  }
  function createRenderers(app) {
    const { elements, store, runtime } = app;
    function renderReviewTasks(tasks) {
      elements.reviewTasksList.innerHTML = "";
      tasks.forEach((task) => {
        const taskEl = document.createElement("div");
        taskEl.className = "task-item";
        taskEl.innerHTML = `
                <div class="task-desc">${escapeHtml(task.text)}</div>
                <button class="postpone-btn" title="На сегодня" data-action="review-move-today" data-task-id="${task.id}">☀️На сегодня</button>
                <button class="postpone-btn" title="На потом" data-action="review-move-deferred" data-task-id="${task.id}">📦На потом</button>
            `;
        elements.reviewTasksList.appendChild(taskEl);
      });
    }
    function renderMainScreen() {
      var _a;
      const state = store.getState();
      const todayTasks = getTodayTasks(state);
      const isSosView = Boolean((_a = runtime.sosView) == null ? void 0 : _a.active);
      const visibleTodayTasks = isSosView ? todayTasks.filter((task) => task.isResource || task.completed) : todayTasks;
      elements.tasksList.innerHTML = "";
      elements.selfCareList.innerHTML = "";
      let usedEnergy = 0;
      visibleTodayTasks.forEach((task) => {
        const taskEl = renderTaskElement(task);
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
      elements.balanceSection.classList.toggle("hidden", isSosView);
      elements.addTaskForm.classList.toggle("hidden", isSosView);
      elements.openTemplatesBtn.classList.toggle("hidden", isSosView);
      elements.openSosBtn.classList.toggle("hidden", isSosView);
      elements.sosView.classList.toggle("hidden", !isSosView);
      elements.selfCareSlot.classList.toggle("hidden", isSosView && elements.selfCareList.children.length === 0);
      elements.tasksSection.classList.toggle("hidden", isSosView && elements.tasksList.children.length === 0);
      elements.tasksTitle.textContent = isSosView ? "То, что уже осталось с тобой сегодня" : "Задачи";
      if (isSosView) {
        elements.sosViewCaption.textContent = runtime.sosView.destination === "tomorrow" ? "Невыполненное уже перенесено на завтра." : "Невыполненное уже перенесено в «На потом».";
        const existingBtn = document.getElementById("add-break-btn");
        if (existingBtn) {
          existingBtn.remove();
        }
        elements.balanceMessageContainer.classList.add("hidden");
        return;
      }
      const total = state.energyBudget || 1;
      elements.usedEnergyEl.textContent = usedEnergy;
      elements.totalEnergyEl.textContent = total;
      const percentage = Math.min(usedEnergy / total * 100, 100);
      if (usedEnergy > total) {
        elements.progressBar.style.width = "100%";
        elements.progressBar.classList.add("overloaded");
        elements.balanceMessageContainer.classList.remove("hidden");
        elements.balanceMessage.innerHTML = "Сегодня плотный график.<br>Позаботься о себе.";
        let addBreakBtn = document.getElementById("add-break-btn");
        if (!addBreakBtn) {
          addBreakBtn = document.createElement("button");
          addBreakBtn.id = "add-break-btn";
          addBreakBtn.className = "add-break-btn";
          addBreakBtn.textContent = "☕ Добавить паузу";
          addBreakBtn.dataset.action = "add-break";
          elements.balanceMessageContainer.appendChild(addBreakBtn);
        }
      } else {
        elements.progressBar.style.width = `${percentage}%`;
        elements.progressBar.classList.remove("overloaded");
        elements.balanceMessageContainer.classList.add("hidden");
        const existingBtn = document.getElementById("add-break-btn");
        if (existingBtn) {
          existingBtn.remove();
        }
      }
    }
    function renderArchive() {
      const deferredTasks = getDeferredTasks(store.getState());
      elements.archiveList.innerHTML = "";
      if (deferredTasks.length === 0) {
        elements.archiveList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 16px;">Пока ничего не отложено</div>';
        return;
      }
      deferredTasks.forEach((task) => {
        const taskEl = document.createElement("div");
        taskEl.className = "task-item";
        const weightClass = task.isResource ? "resource-weight" : "";
        const weightLabel = task.isResource ? "Ресурс" : `Вес: ${task.weight}`;
        taskEl.innerHTML = `
                <div class="task-desc">${escapeHtml(task.text)}</div>
                <div class="task-weight ${weightClass}">${weightLabel}</div>
                <button class="postpone-btn" title="На сегодня" data-action="deferred-move-today" data-task-id="${task.id}">☀️</button>
                <button class="delete-btn" title="Удалить" data-action="deferred-delete-task" data-task-id="${task.id}">&times;</button>
            `;
        elements.archiveList.appendChild(taskEl);
      });
    }
    function renderCompleted() {
      const doneTasks = getDoneTasks(store.getState());
      elements.completedList.innerHTML = "";
      if (doneTasks.length === 0) {
        elements.completedList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 16px;">Пока здесь нет завершённых задач</div>';
        return;
      }
      doneTasks.sort((left, right) => (right.completedAtDate || "").localeCompare(left.completedAtDate || "")).forEach((task) => {
        const taskEl = document.createElement("div");
        taskEl.className = "task-item completed";
        const weightLabel = task.isResource ? "Ресурс" : `Вес: ${task.weight}`;
        taskEl.innerHTML = `
                    <div class="task-desc">
                        ${escapeHtml(task.text)}
                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Завершено: ${formatDoneDate(task.completedAtDate)}</div>
                    </div>
                    <div class="task-weight ${task.isResource ? "resource-weight" : ""}">${weightLabel}</div>
                    <button class="delete-btn" title="Удалить" data-action="done-delete-task" data-task-id="${task.id}">&times;</button>
                `;
        elements.completedList.appendChild(taskEl);
      });
    }
    function renderWeeklyScreen() {
      const state = store.getState();
      const todayObj = /* @__PURE__ */ new Date();
      elements.weeklyContainer.innerHTML = "";
      for (let index = 0; index < 7; index += 1) {
        const date = new Date(todayObj);
        date.setDate(date.getDate() + index);
        const dateStr = getLocalDateString(date);
        const isToday = index === 0;
        const title = `${date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })}${isToday ? " (Сегодня)" : ""}`;
        const dayTasks = state.tasks.filter(
          (task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === dateStr && !task.completed
        );
        const dayLoad = dayTasks.reduce((sum, task) => sum + (task.weight || 0), 0);
        const loadPercent = Math.min(dayLoad / 80 * 100, 100);
        const isOverloaded = dayLoad > 80;
        const col = document.createElement("div");
        col.className = "weekly-col";
        col.innerHTML = `
                <div class="weekly-col-header">
                    <span>${title}</span>
                    <button class="add-weekly-task-icon-btn" title="Добавить задачу" data-action="open-weekly-task-modal" data-date="${dateStr}">+</button>
                </div>
                <div class="weekly-load-container">
                    <div class="weekly-load-bar ${isOverloaded ? "overloaded" : ""}" style="width: ${loadPercent}%"></div>
                </div>
                ${isOverloaded ? `<div class="weekly-load-warning">⚠ Много тяжёлого (${dayLoad})</div>` : ""}
                <div class="weekly-col-tasks" data-weekly-date="${dateStr}"></div>
            `;
        const tasksContainer = col.querySelector("[data-weekly-date]");
        dayTasks.forEach((task) => {
          const taskEl = document.createElement("div");
          taskEl.className = "weekly-task";
          taskEl.draggable = true;
          taskEl.dataset.taskId = task.id;
          taskEl.innerHTML = `
                    <div class="weekly-task-text">${escapeHtml(task.text)}</div>
                    <div class="weekly-task-weight">${task.weight}</div>
                `;
          tasksContainer.appendChild(taskEl);
        });
        elements.weeklyContainer.appendChild(col);
      }
    }
    function renderResources() {
      const { resources } = store.getState();
      elements.resourcesList.innerHTML = "";
      resources.forEach((resource) => {
        const item = document.createElement("div");
        item.className = "resource-item";
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
      elements.templatesContainer.innerHTML = "";
      templates.forEach((template) => {
        const block = document.createElement("div");
        block.className = "template-block";
        block.innerHTML = `
                <div class="template-header">
                    <h4>${escapeHtml(template.name)}</h4>
                    <button class="add-template-all-btn" data-action="add-template-all" data-template-id="${template.id}">+ Всё</button>
                </div>
                <div class="template-task-list"></div>
            `;
        const taskList = block.querySelector(".template-task-list");
        template.tasks.forEach((task) => {
          const item = document.createElement("div");
          item.className = "template-task-item";
          item.innerHTML = `
                    <div class="task-desc">${escapeHtml(task.text)}</div>
                    <select class="template-task-weight" data-action="change-template-weight" data-template-id="${template.id}" data-template-task-id="${task.id}">
                        ${[5, 10, 20, 30, 50].map((weight) => `<option value="${weight}" ${task.weight === weight ? "selected" : ""}>${weight}</option>`).join("")}
                    </select>
                    <button class="add-template-task-btn" data-action="add-template-task" data-template-id="${template.id}" data-template-task-id="${task.id}">+</button>
                `;
          taskList.appendChild(item);
        });
        elements.templatesContainer.appendChild(block);
      });
    }
    function renderHistoryScreen() {
      const moodHistory = normalizeMoodHistory(store.getState().moodHistory);
      const insights = getMoodHistoryInsights(moodHistory);
      elements.historyInsights.innerHTML = "";
      insights.forEach((insight) => {
        const item = document.createElement("div");
        item.className = "history-insight-card";
        item.textContent = insight;
        elements.historyInsights.appendChild(item);
      });
      elements.historyList.innerHTML = "";
      if (moodHistory.length === 0) {
        elements.historyList.innerHTML = `
                <div class="history-empty-card">
                    <h3>История только начинается</h3>
                    <p>Первые записи появятся после нескольких завершённых дней. Мы не восстанавливаем старые дни задним числом, чтобы не показывать неточные данные.</p>
                </div>
            `;
        return;
      }
      moodHistory.forEach((entry) => {
        const card = document.createElement("article");
        card.className = "history-day-card";
        card.innerHTML = `
                <div class="history-day-header">
                    <h3>${formatMoodDate(entry.date)}</h3>
                    <span class="history-energy-pill">Энергия: ${entry.energyBudget}%</span>
                </div>
                <div class="history-day-metrics">
                    <div class="history-metric"><span>Обычные дела</span><strong>${entry.completedRegularTasks} / ${entry.plannedRegularTasks}</strong></div>
                    <div class="history-metric"><span>Вес задач</span><strong>${entry.completedWeight} / ${entry.plannedWeight}</strong></div>
                    <div class="history-metric"><span>Ресурсы</span><strong>${entry.resourceTasks}</strong></div>
                    <div class="history-metric"><span>Перегруз</span><strong>${entry.endedOverloaded ? "Да" : "Нет"}</strong></div>
                    <div class="history-metric"><span>SOS</span><strong>${entry.usedSos ? entry.sosDestination === "tomorrow" ? "Был, на завтра" : "Был, в «На потом»" : "Не был"}</strong></div>
                </div>
                <p class="history-day-note">${buildMoodNote(entry)}</p>
            `;
        elements.historyList.appendChild(card);
      });
    }
    function maybeShowAllDone(lastUpdatedTask) {
      if (!(lastUpdatedTask == null ? void 0 : lastUpdatedTask.completed)) {
        return;
      }
      const state = store.getState();
      const todayTasks = getTodayTasks(state);
      if (todayTasks.length === 0 || !todayTasks.every((task) => task.completed)) {
        return;
      }
      const displayName = state.userName || "";
      const praises = [
        `${displayName}, ты справ${genderText(state, "ился", "илась")} со всеми делами! Теперь самое время сделать что-то приятное для себя.`,
        `Всё готово, ${displayName}! Я горжусь тобой. Остальное время — твоё.`,
        `${displayName}, какой продуктивный день! Теперь можно выдохнуть и порадовать себя.`
      ];
      elements.allDoneAvatar.src = state.avatar;
      elements.allDoneText.textContent = praises[Math.floor(Math.random() * praises.length)];
      elements.allDoneModal.classList.remove("hidden");
      spawnHearts(elements.allDoneAvatar);
      setTimeout(() => spawnHearts(elements.allDoneAvatar), 300);
    }
    return {
      renderReviewTasks,
      renderMainScreen,
      renderArchive,
      renderCompleted,
      renderHistoryScreen,
      renderWeeklyScreen,
      renderResources,
      renderTemplates,
      maybeShowAllDone
    };
  }

  // js/ui/screens.js
  function createScreens(app) {
    const { elements } = app;
    function hidePrimaryScreens() {
      elements.onboardingScreen.classList.add("hidden");
      elements.morningScreen.classList.add("hidden");
      elements.mainScreen.classList.add("hidden");
      elements.reviewScreen.classList.add("hidden");
      elements.weeklyScreen.classList.add("hidden");
      elements.historyScreen.classList.add("hidden");
    }
    function hideSecondaryModals() {
      elements.libraryModal.classList.add("hidden");
      elements.archiveModal.classList.add("hidden");
      elements.completedModal.classList.add("hidden");
    }
    function showOnboardingScreen() {
      hidePrimaryScreens();
      hideSecondaryModals();
      elements.onboardingScreen.classList.remove("hidden");
      app.onboarding.activate();
    }
    function showMorningScreen() {
      const state = app.store.getState();
      hidePrimaryScreens();
      hideSecondaryModals();
      elements.morningScreen.classList.remove("hidden");
      elements.finishReviewBtn.classList.add("hidden");
      const displayName = state.userName ? `, ${state.userName}` : "";
      elements.morningTitle.textContent = `Доброе утро${displayName}.`;
      elements.energyInput.value = 50;
      elements.energyDisplay.textContent = 50;
    }
    function showMainScreen() {
      const state = app.store.getState();
      hidePrimaryScreens();
      elements.mainScreen.classList.remove("hidden");
      elements.appHelperAvatar.src = state.avatar;
      elements.balanceMessageAvatar.src = state.avatar;
      app.renderers.renderMainScreen();
    }
    function showWeeklyScreen() {
      hidePrimaryScreens();
      hideSecondaryModals();
      elements.weeklyScreen.classList.remove("hidden");
      app.renderers.renderWeeklyScreen();
    }
    function showHistoryScreen() {
      hidePrimaryScreens();
      hideSecondaryModals();
      elements.historyScreen.classList.remove("hidden");
      app.renderers.renderHistoryScreen();
    }
    function showReviewScreen(tasks) {
      hidePrimaryScreens();
      hideSecondaryModals();
      elements.reviewScreen.classList.remove("hidden");
      app.renderers.renderReviewTasks(tasks);
      elements.finishReviewBtn.classList.remove("hidden");
      elements.finishReviewBtn.textContent = "Оставшееся в «На потом»";
    }
    return {
      showOnboardingScreen,
      showMorningScreen,
      showMainScreen,
      showWeeklyScreen,
      showHistoryScreen,
      showReviewScreen
    };
  }

  // js/onboarding/index.js
  function createOnboardingController(app) {
    const { elements, store } = app;
    let currentStep = 1;
    let selectedResources = /* @__PURE__ */ new Set();
    let initialized = false;
    function checkStep3Valid() {
      if (currentStep !== 3) return;
      const hasName = elements.onboardingNameInput.value.trim().length > 0;
      const hasGender = elements.genderOptions.some((option) => option.classList.contains("selected"));
      elements.onboardingNextBtn.disabled = !(hasName && hasGender);
    }
    function checkStep4Valid() {
      if (currentStep !== 4) return;
      elements.onboardingNextBtn.disabled = selectedResources.size === 0 && elements.onboardingCustomResourceInput.value.trim().length === 0;
    }
    function updateSteps() {
      [
        elements.onboardingStep1,
        elements.onboardingStep2,
        elements.onboardingStep3,
        elements.onboardingStep4
      ].forEach((step) => step.classList.add("hidden"));
      elements.onboardingBackBtn.classList.toggle("hidden", currentStep === 1);
      if (currentStep === 1) {
        elements.onboardingStep1.classList.remove("hidden");
        elements.onboardingNextBtn.disabled = false;
        elements.onboardingNextBtn.textContent = "Начать";
      } else if (currentStep === 2) {
        elements.onboardingStep2.classList.remove("hidden");
        elements.onboardingNextBtn.textContent = "Далее";
        elements.onboardingNextBtn.disabled = !elements.avatarOptions.some((option) => option.classList.contains("selected"));
      } else if (currentStep === 3) {
        elements.onboardingStep3.classList.remove("hidden");
        elements.onboardingNextBtn.textContent = "Далее";
        checkStep3Valid();
      } else if (currentStep === 4) {
        elements.onboardingStep4.classList.remove("hidden");
        elements.onboardingNextBtn.textContent = "Завершить";
        checkStep4Valid();
      }
    }
    function reset() {
      currentStep = 1;
      selectedResources = /* @__PURE__ */ new Set();
      elements.onboardingNameInput.value = "";
      elements.onboardingCustomResourceInput.value = "";
      elements.avatarOptions.forEach((option) => option.classList.remove("selected"));
      elements.genderOptions.forEach((option) => option.classList.remove("selected"));
      elements.resourceTags.forEach((tag) => tag.classList.remove("selected"));
    }
    function finishOnboarding() {
      const customResource = elements.onboardingCustomResourceInput.value.trim();
      store.updateState((state) => {
        state.hasOnboarded = true;
        state.userName = elements.onboardingNameInput.value.trim();
        selectedResources.forEach((text) => {
          if (!state.resources.find((resource) => resource.text === text)) {
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
      elements.avatarOptions.forEach((option) => {
        option.addEventListener("click", () => {
          const state = store.getState();
          elements.avatarOptions.forEach((item) => item.classList.remove("selected"));
          option.classList.add("selected");
          state.avatar = option.dataset.avatar;
          elements.step3Avatar.src = state.avatar;
          elements.step4Avatar.src = state.avatar;
          elements.onboardingNextBtn.disabled = false;
        });
      });
      elements.onboardingNameInput.addEventListener("input", checkStep3Valid);
      elements.genderOptions.forEach((option) => {
        option.addEventListener("click", () => {
          const state = store.getState();
          elements.genderOptions.forEach((item) => item.classList.remove("selected"));
          option.classList.add("selected");
          state.gender = option.dataset.gender;
          checkStep3Valid();
        });
      });
      elements.resourceTags.forEach((tag) => {
        tag.addEventListener("click", () => {
          tag.classList.toggle("selected");
          const value = tag.dataset.tag;
          if (selectedResources.has(value)) {
            selectedResources.delete(value);
          } else {
            selectedResources.add(value);
          }
          checkStep4Valid();
        });
      });
      elements.onboardingCustomResourceInput.addEventListener("input", checkStep4Valid);
      elements.onboardingBackBtn.addEventListener("click", () => {
        if (currentStep > 1) {
          currentStep -= 1;
          updateSteps();
        }
      });
      elements.onboardingNextBtn.addEventListener("click", () => {
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

  // js/domain/resources.js
  function addResource(store, text) {
    const resource = { id: `res_${Date.now()}`, text };
    store.updateState((state) => {
      state.resources.push(resource);
    });
    return resource;
  }
  function deleteResource(store, resourceId) {
    store.updateState((state) => {
      state.resources = state.resources.filter((resource) => resource.id !== resourceId);
    });
  }
  function addResourceToDay(store, resourceId) {
    const state = store.getState();
    const resource = state.resources.find((item) => item.id === resourceId);
    if (!resource) {
      return null;
    }
    return addTask(store, {
      text: resource.text,
      weight: 0,
      isResource: true
    });
  }

  // js/domain/templates.js
  function changeTemplateTaskWeight(store, { templateId, taskId, weight }) {
    store.updateState((state) => {
      const template = state.templates.find((item) => item.id === templateId);
      const task = template == null ? void 0 : template.tasks.find((item) => item.id === taskId);
      if (task) {
        task.weight = parseInt(weight, 10);
      }
    });
  }
  function addTemplateTaskToDay(store, { templateId, taskId }) {
    const state = store.getState();
    const template = state.templates.find((item) => item.id === templateId);
    const task = template == null ? void 0 : template.tasks.find((item) => item.id === taskId);
    if (!task) {
      return null;
    }
    return addTask(store, {
      text: task.text,
      weight: task.weight,
      isResource: false
    });
  }
  function addAllTemplateTasksToDay(store, templateId) {
    const state = store.getState();
    const template = state.templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }
    template.tasks.forEach((task) => {
      addTask(store, {
        text: task.text,
        weight: task.weight,
        isResource: false
      });
    });
  }

  // js/ui/bindings.js
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
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      form.requestSubmit();
    });
  }
  function bindAppEvents(app) {
    const { elements, store, runtime } = app;
    [
      elements.weeklyTaskModal,
      elements.libraryModal,
      elements.archiveModal,
      elements.completedModal,
      elements.templatesModal,
      elements.helperModal,
      elements.sosModal,
      elements.allDoneModal
    ].forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target !== modal) return;
        modal.classList.add("hidden");
      });
    });
    bindSubmitOnEnter(elements.taskInput, elements.addTaskForm);
    bindSubmitOnEnter(elements.resourceInput, elements.addResourceForm);
    bindSubmitOnEnter(elements.weeklyTaskText, elements.addWeeklyTaskForm);
    elements.energyInput.addEventListener("input", (event) => {
      elements.energyDisplay.textContent = event.target.value;
    });
    elements.startDayBtn.addEventListener("click", () => {
      store.updateState((state) => {
        state.energyBudget = parseInt(elements.energyInput.value, 10);
        state.lastDate = getLocalDateString();
        state.currentDayMeta = createCurrentDayMeta(state.lastDate);
      });
      runtime.sosView = null;
      app.screens.showMainScreen();
    });
    elements.addTaskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = elements.taskInput.value.trim();
      const weight = parseInt(elements.taskWeightSelect.value, 10);
      if (!text) return;
      addTask(store, { text, weight, isResource: false });
      elements.taskInput.value = "";
      app.screens.showMainScreen();
      if (!elements.weeklyScreen.classList.contains("hidden")) {
        app.renderers.renderWeeklyScreen();
      }
    });
    elements.allDoneCloseBtn.addEventListener("click", () => {
      moveCompletedTodayTasksToDone(store);
      elements.allDoneModal.classList.add("hidden");
      app.renderers.renderMainScreen();
      app.renderers.renderArchive();
      app.renderers.renderCompleted();
      app.renderers.renderWeeklyScreen();
    });
    elements.appHelperAvatar.addEventListener("click", () => {
      const state = store.getState();
      const allAdvices = [...runtime.builtinAdvices, ...state.resources.map((resource) => resource.text)];
      let newAdvice = runtime.currentAdvice;
      if (allAdvices.length > 1) {
        while (newAdvice === runtime.currentAdvice) {
          newAdvice = allAdvices[Math.floor(Math.random() * allAdvices.length)];
        }
      } else {
        newAdvice = allAdvices[0] || "";
      }
      runtime.currentAdvice = newAdvice;
      elements.adviceAvatar.src = state.avatar;
      elements.adviceText.textContent = newAdvice;
      elements.helperModal.classList.remove("hidden");
    });
    elements.closeHelperBtn.addEventListener("click", () => {
      elements.helperModal.classList.add("hidden");
    });
    function closeSosModal() {
      elements.sosModal.classList.add("hidden");
    }
    function activateSosView(destination) {
      runtime.sosView = { active: true, destination };
      closeSosModal();
      app.renderers.renderMainScreen();
      app.renderers.renderArchive();
      app.renderers.renderCompleted();
      app.renderers.renderWeeklyScreen();
    }
    elements.adviceRefreshBtn.addEventListener("click", () => {
      elements.adviceText.style.opacity = 0;
      setTimeout(() => {
        elements.appHelperAvatar.click();
        elements.adviceText.style.opacity = 1;
      }, 200);
    });
    elements.adviceAddBtn.addEventListener("click", () => {
      if (!runtime.currentAdvice) return;
      addTask(store, { text: runtime.currentAdvice, weight: 0, isResource: true });
      app.renderers.renderMainScreen();
      const originalText = elements.adviceAddBtn.textContent;
      elements.adviceAddBtn.textContent = "Добавлено ✓";
      elements.adviceAddBtn.style.backgroundColor = "var(--primary-color)";
      elements.adviceAddBtn.style.color = "white";
      setTimeout(() => {
        elements.adviceAddBtn.textContent = originalText;
        elements.adviceAddBtn.style.backgroundColor = "";
        elements.adviceAddBtn.style.color = "";
        elements.helperModal.classList.add("hidden");
      }, 1e3);
    });
    elements.openLibraryBtn.addEventListener("click", () => {
      app.renderers.renderResources();
      elements.libraryModal.classList.remove("hidden");
    });
    elements.addSelfCareBtn.addEventListener("click", () => {
      app.renderers.renderResources();
      elements.libraryModal.classList.remove("hidden");
    });
    elements.closeLibraryBtn.addEventListener("click", () => {
      elements.libraryModal.classList.add("hidden");
    });
    elements.addResourceForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = elements.resourceInput.value.trim();
      if (!text) return;
      addResource(store, text);
      elements.resourceInput.value = "";
      app.renderers.renderResources();
    });
    elements.openSosBtn.addEventListener("click", () => {
      const hasMovableTasks = getOpenRegularTodayTasks(store.getState()).length > 0;
      elements.sosArchiveBtn.disabled = !hasMovableTasks;
      elements.sosTomorrowBtn.disabled = !hasMovableTasks;
      elements.sosModal.classList.remove("hidden");
    });
    elements.closeSosBtn.addEventListener("click", closeSosModal);
    elements.sosCancelBtn.addEventListener("click", closeSosModal);
    elements.sosArchiveBtn.addEventListener("click", () => {
      store.updateState((state) => {
        state.currentDayMeta = {
          date: getLocalDateString(),
          usedSos: true,
          sosDestination: "deferred"
        };
      }, { save: false });
      archiveOpenRegularTodayTasks(store);
      activateSosView("deferred");
    });
    elements.sosTomorrowBtn.addEventListener("click", () => {
      store.updateState((state) => {
        state.currentDayMeta = {
          date: getLocalDateString(),
          usedSos: true,
          sosDestination: "tomorrow"
        };
      }, { save: false });
      moveOpenRegularTodayTasksToTomorrow(store);
      activateSosView("tomorrow");
    });
    elements.exitSosViewBtn.addEventListener("click", () => {
      runtime.sosView = null;
      app.renderers.renderMainScreen();
    });
    elements.openArchiveBtn.addEventListener("click", () => {
      app.renderers.renderArchive();
      elements.completedModal.classList.add("hidden");
      elements.archiveModal.classList.remove("hidden");
    });
    elements.openCompletedBtn.addEventListener("click", () => {
      app.renderers.renderCompleted();
      elements.archiveModal.classList.add("hidden");
      elements.completedModal.classList.remove("hidden");
    });
    elements.openHistoryBtn.addEventListener("click", () => {
      app.screens.showHistoryScreen();
    });
    elements.closeHistoryBtn.addEventListener("click", () => {
      app.screens.showMainScreen();
    });
    elements.closeArchiveBtn.addEventListener("click", () => {
      elements.archiveModal.classList.add("hidden");
    });
    elements.clearArchiveBtn.addEventListener("click", () => {
      const shouldClear = window.confirm("Очистить весь список «На потом»? Это удалит все отложенные задачи.");
      if (!shouldClear) return;
      clearDeferredTasks(store);
      app.renderers.renderArchive();
      app.renderers.renderMainScreen();
      app.renderers.renderWeeklyScreen();
    });
    elements.closeCompletedBtn.addEventListener("click", () => {
      elements.completedModal.classList.add("hidden");
    });
    elements.clearCompletedBtn.addEventListener("click", () => {
      const shouldClear = window.confirm("Очистить весь список «Сделано»? Это удалит все завершённые задачи из этого раздела.");
      if (!shouldClear) return;
      clearDoneTasks(store);
      app.renderers.renderCompleted();
    });
    elements.openWeeklyBtn.addEventListener("click", () => {
      app.screens.showWeeklyScreen();
    });
    elements.closeWeeklyBtn.addEventListener("click", () => {
      app.screens.showMainScreen();
    });
    elements.closeWeeklyTaskBtn.addEventListener("click", () => {
      elements.weeklyTaskModal.classList.add("hidden");
    });
    elements.addWeeklyTaskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = elements.weeklyTaskText.value.trim();
      const weight = parseInt(elements.weeklyTaskWeight.value, 10);
      if (!text || !runtime.currentWeeklyTaskDate) return;
      addTask(store, {
        text,
        weight,
        isResource: false,
        targetDate: runtime.currentWeeklyTaskDate
      });
      elements.weeklyTaskText.value = "";
      elements.weeklyTaskModal.classList.add("hidden");
      app.renderers.renderWeeklyScreen();
    });
    elements.openTemplatesBtn.addEventListener("click", () => {
      app.renderers.renderTemplates();
      elements.templatesModal.classList.remove("hidden");
    });
    elements.closeTemplatesBtn.addEventListener("click", () => {
      elements.templatesModal.classList.add("hidden");
    });
    elements.finishReviewBtn.addEventListener("click", () => {
      archiveRemainingOverdue(store);
      completePendingReview(store);
      app.screens.showMorningScreen();
    });
    [elements.tasksList, elements.selfCareList].forEach((container) => {
      container.addEventListener("click", (event) => {
        const target = closestActionTarget(event.target);
        if (!target) return;
        const taskId = target.dataset.taskId;
        if (!taskId) return;
        if (target.dataset.action === "toggle-task") {
          const updatedTask = toggleTask(store, taskId);
          app.renderers.renderMainScreen();
          app.renderers.renderWeeklyScreen();
          if ((updatedTask == null ? void 0 : updatedTask.completed) && updatedTask.isResource) {
            elements.appHelperAvatar.classList.add("celebrate");
            spawnHearts(elements.appHelperAvatar);
            setTimeout(() => elements.appHelperAvatar.classList.remove("celebrate"), 800);
          }
          app.renderers.maybeShowAllDone(updatedTask);
        } else if (target.dataset.action === "delete-task") {
          deleteTask(store, taskId);
          app.renderers.renderMainScreen();
          app.renderers.renderWeeklyScreen();
        } else if (target.dataset.action === "move-to-deferred") {
          moveToDeferred(store, taskId);
          app.renderers.renderMainScreen();
          app.renderers.renderArchive();
          app.renderers.renderCompleted();
          app.renderers.renderWeeklyScreen();
        } else if (target.dataset.action === "postpone-task") {
          postponeTask(store, taskId);
          app.renderers.renderMainScreen();
          app.renderers.renderWeeklyScreen();
        }
      });
      container.addEventListener("dragstart", (event) => {
        const task = event.target.closest(".task-item");
        if (!task) return;
        task.classList.add("dragging");
      });
      container.addEventListener("dragend", (event) => {
        const task = event.target.closest(".task-item");
        if (!task) return;
        task.classList.remove("dragging");
      });
      container.addEventListener("dragover", (event) => {
        event.preventDefault();
        const draggable = document.querySelector(".dragging");
        if (!draggable) return;
        if (container === elements.selfCareList && !draggable.classList.contains("resource-item-drag")) return;
        if (container === elements.tasksList && draggable.classList.contains("resource-item-drag")) return;
        const afterElement = getDragAfterElement(container, event.clientY, ".task-item", "dragging");
        if (!afterElement) {
          container.appendChild(draggable);
        } else {
          container.insertBefore(draggable, afterElement);
        }
      });
      container.addEventListener("drop", (event) => {
        event.preventDefault();
        const newOrderIds = [...container.querySelectorAll(".task-item")].map((task) => task.dataset.taskId);
        reorderTodayTasks(store, {
          isResource: container === elements.selfCareList,
          newOrderIds
        });
        app.renderers.renderMainScreen();
      });
    });
    elements.reviewTasksList.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target) return;
      const taskId = target.dataset.taskId;
      if (!taskId) return;
      if (target.dataset.action === "review-move-today") {
        moveToToday(store, taskId);
      } else if (target.dataset.action === "review-move-deferred") {
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
    elements.archiveList.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target) return;
      const taskId = target.dataset.taskId;
      if (!taskId) return;
      if (target.dataset.action === "deferred-move-today") {
        moveToToday(store, taskId);
      } else if (target.dataset.action === "deferred-delete-task") {
        deleteTask(store, taskId);
      } else {
        return;
      }
      app.renderers.renderArchive();
      app.renderers.renderMainScreen();
      app.renderers.renderWeeklyScreen();
    });
    elements.completedList.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target) return;
      const taskId = target.dataset.taskId;
      if (!taskId || target.dataset.action !== "done-delete-task") return;
      deleteTask(store, taskId);
      app.renderers.renderCompleted();
    });
    elements.resourcesList.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target) return;
      const resourceId = target.dataset.resourceId;
      if (!resourceId) return;
      if (target.dataset.action === "add-resource-to-day") {
        addResourceToDay(store, resourceId);
        app.renderers.renderMainScreen();
        const originalText = target.textContent;
        target.textContent = "✓";
        target.style.backgroundColor = "var(--primary-color)";
        target.style.color = "white";
        setTimeout(() => {
          target.textContent = originalText;
          target.style.backgroundColor = "";
          target.style.color = "";
        }, 1e3);
      } else if (target.dataset.action === "delete-resource") {
        deleteResource(store, resourceId);
        app.renderers.renderResources();
      }
    });
    elements.templatesContainer.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target) return;
      if (target.dataset.action === "add-template-all") {
        addAllTemplateTasksToDay(store, target.dataset.templateId);
        elements.templatesModal.classList.add("hidden");
        app.renderers.renderMainScreen();
        return;
      }
      if (target.dataset.action === "add-template-task") {
        addTemplateTaskToDay(store, {
          templateId: target.dataset.templateId,
          taskId: target.dataset.templateTaskId
        });
        app.renderers.renderMainScreen();
        const originalText = target.textContent;
        target.textContent = "✓";
        target.style.backgroundColor = "var(--primary-color)";
        target.style.color = "white";
        setTimeout(() => {
          target.textContent = originalText;
          target.style.backgroundColor = "";
          target.style.color = "";
        }, 1e3);
      }
    });
    elements.templatesContainer.addEventListener("change", (event) => {
      const target = event.target.closest('[data-action="change-template-weight"]');
      if (!target) return;
      changeTemplateTaskWeight(store, {
        templateId: target.dataset.templateId,
        taskId: target.dataset.templateTaskId,
        weight: target.value
      });
    });
    elements.balanceMessageContainer.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target || target.dataset.action !== "add-break") return;
      const state = store.getState();
      const suggestions = [...runtime.builtinAdvices, ...state.resources.map((resource) => resource.text)];
      const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      addTask(store, { text: suggestion, weight: 0, isResource: true });
      app.renderers.renderMainScreen();
    });
    elements.weeklyContainer.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target || target.dataset.action !== "open-weekly-task-modal") return;
      runtime.currentWeeklyTaskDate = target.dataset.date;
      elements.weeklyTaskModal.classList.remove("hidden");
      elements.weeklyTaskText.focus();
    });
    elements.weeklyContainer.addEventListener("dragstart", (event) => {
      var _a;
      const task = event.target.closest(".weekly-task");
      if (!task) return;
      task.classList.add("weekly-dragging");
      (_a = event.dataTransfer) == null ? void 0 : _a.setData("taskId", task.dataset.taskId);
    });
    elements.weeklyContainer.addEventListener("dragend", (event) => {
      const task = event.target.closest(".weekly-task");
      if (!task) return;
      task.classList.remove("weekly-dragging");
    });
    elements.weeklyContainer.addEventListener("dragover", (event) => {
      const container = event.target.closest(".weekly-col-tasks");
      if (!container) return;
      event.preventDefault();
      const draggable = document.querySelector(".weekly-dragging");
      if (!draggable) return;
      const afterElement = getDragAfterElement(container, event.clientY, ".weekly-task", "weekly-dragging");
      if (!afterElement) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
    elements.weeklyContainer.addEventListener("drop", (event) => {
      const container = event.target.closest(".weekly-col-tasks");
      if (!container) return;
      event.preventDefault();
      const draggable = document.querySelector(".weekly-dragging");
      if (!draggable) return;
      const dateStr = container.dataset.weeklyDate;
      moveTaskToDate(store, { taskId: draggable.dataset.taskId, dateStr });
      const newOrderIds = [...container.querySelectorAll(".weekly-task")].map((task) => task.dataset.taskId);
      reorderWeeklyTasks(store, { dateStr, newOrderIds });
      app.renderers.renderWeeklyScreen();
      app.renderers.renderMainScreen();
    });
  }

  // js/main.js
  var builtinAdvices = [
    "Выпить стакан чистой воды",
    "Сделать 5 глубоких вдохов и выдохов",
    "Посмотреть в окно на небо пару минут",
    "Сделать легкую разминку для шеи",
    "Послушать одну любимую спокойную песню",
    "Отложить телефон на 15 минут",
    "Заварить вкусный чай"
  ];
  function initApp({ elements }) {
    const store = createStore();
    const app = {
      elements,
      store,
      runtime: {
        builtinAdvices,
        currentAdvice: "",
        currentWeeklyTaskDate: null,
        sosView: null
      }
    };
    app.renderers = createRenderers(app);
    app.onboarding = createOnboardingController(app);
    app.screens = createScreens(app);
    bindAppEvents(app);
    store.loadState();
    const today = getLocalDateString();
    store.updateState((state2) => {
      state2.tasks.forEach((task) => {
        if (task.postponedTo && !task.targetDate) {
          task.targetDate = task.postponedTo;
          delete task.postponedTo;
        }
        if (task.targetDate === void 0) {
          task.targetDate = state2.lastDate || today;
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
      store.updateState((currentState) => {
        currentState.pendingReviewDate = null;
        currentState.lastDate = today;
        currentState.energyBudget = null;
      });
    }
    if (state.lastDate !== today) {
      store.updateState((currentState) => {
        const previousDayEntry = buildMoodHistoryEntry(currentState, currentState.lastDate);
        currentState.moodHistory = upsertMoodHistoryEntry(currentState.moodHistory, previousDayEntry);
      });
      store.updateState((currentState) => {
        currentState.tasks = currentState.tasks.filter((task) => !task.completed);
      });
      const overdueTasks = getOverdueTasks(store.getState(), today);
      if (overdueTasks.length > 0) {
        store.updateState((currentState) => {
          currentState.pendingReviewDate = today;
          currentState.currentDayMeta = createCurrentDayMeta(today);
        });
        app.screens.showReviewScreen(overdueTasks);
        return app;
      }
      store.updateState((currentState) => {
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
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootstrap);
    } else {
      bootstrap();
    }
  }
})();
