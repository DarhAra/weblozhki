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
      templateAutoModal: doc.getElementById("template-auto-modal"),
      breakdownIntroModal: doc.getElementById("breakdown-intro-modal"),
      breakdownEditorModal: doc.getElementById("breakdown-editor-modal"),
      lowEnergyModal: doc.getElementById("low-energy-modal"),
      lowEnergySwapModal: doc.getElementById("low-energy-swap-modal"),
      helperModal: doc.getElementById("helper-modal"),
      voiceModal: doc.getElementById("voice-modal"),
      inboxVoiceModal: doc.getElementById("inbox-voice-modal"),
      inboxSortModal: doc.getElementById("inbox-sort-modal"),
      sosModal: doc.getElementById("sos-modal"),
      allDoneModal: doc.getElementById("all-done-modal"),
      energyInput: doc.getElementById("energy-input"),
      energyDisplay: doc.getElementById("energy-display"),
      startDayBtn: doc.getElementById("start-day-btn"),
      reviewTasksList: doc.getElementById("review-tasks-list"),
      finishReviewBtn: doc.getElementById("finish-review-btn"),
      morningTitle: doc.getElementById("morning-title"),
      storageStatus: doc.getElementById("storage-status"),
      appHelperAvatar: doc.getElementById("app-helper-avatar"),
      openAppMenuBtn: doc.getElementById("open-app-menu-btn"),
      appMenuPopover: doc.getElementById("app-menu-popover"),
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
      lowEnergyDayPanel: doc.getElementById("low-energy-day-panel"),
      lowEnergyKeptCard: doc.getElementById("low-energy-kept-card"),
      lowEnergyKeptText: doc.getElementById("low-energy-kept-text"),
      openLowEnergySwapBtn: doc.getElementById("open-low-energy-swap-btn"),
      lowEnergyResourceCard: doc.getElementById("low-energy-resource-card"),
      lowEnergyResourceText: doc.getElementById("low-energy-resource-text"),
      changeLowEnergyResourceBtn: doc.getElementById("change-low-energy-resource-btn"),
      mainContentGrid: doc.getElementById("main-content-grid"),
      selfCareSlot: doc.getElementById("self-care-slot"),
      tasksSection: doc.getElementById("tasks-section"),
      tasksTitle: doc.getElementById("tasks-title"),
      tasksList: doc.getElementById("tasks-list"),
      selfCareList: doc.getElementById("self-care-list"),
      addTaskForm: doc.getElementById("add-task-form"),
      taskInput: doc.getElementById("task-text"),
      taskWeightSelect: doc.getElementById("task-weight"),
      openVoiceBtn: doc.getElementById("open-voice-btn"),
      voiceStatus: doc.getElementById("voice-status"),
      inboxSection: doc.getElementById("inbox-section"),
      addInboxForm: doc.getElementById("add-inbox-form"),
      inboxInput: doc.getElementById("inbox-text"),
      openInboxVoiceBtn: doc.getElementById("open-inbox-voice-btn"),
      inboxStatus: doc.getElementById("inbox-status"),
      openInboxSortBtn: doc.getElementById("open-inbox-sort-btn"),
      clearInboxBtn: doc.getElementById("clear-inbox-btn"),
      inboxList: doc.getElementById("inbox-list"),
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
      closeVoiceBtn: doc.getElementById("close-voice-btn"),
      voiceHelperAvatar: doc.getElementById("voice-helper-avatar"),
      voiceModalTitle: doc.getElementById("voice-modal-title"),
      voiceModalSubtitle: doc.getElementById("voice-modal-subtitle"),
      voiceDraftList: doc.getElementById("voice-draft-list"),
      voiceEmptyState: doc.getElementById("voice-empty-state"),
      voiceConfirmBtn: doc.getElementById("voice-confirm-btn"),
      voiceCancelBtn: doc.getElementById("voice-cancel-btn"),
      closeInboxVoiceBtn: doc.getElementById("close-inbox-voice-btn"),
      inboxVoiceHelperAvatar: doc.getElementById("inbox-voice-helper-avatar"),
      inboxVoiceModalTitle: doc.getElementById("inbox-voice-modal-title"),
      inboxVoiceModalSubtitle: doc.getElementById("inbox-voice-modal-subtitle"),
      inboxVoiceDraftList: doc.getElementById("inbox-voice-draft-list"),
      inboxVoiceEmptyState: doc.getElementById("inbox-voice-empty-state"),
      inboxVoiceConfirmBtn: doc.getElementById("inbox-voice-confirm-btn"),
      inboxVoiceCancelBtn: doc.getElementById("inbox-voice-cancel-btn"),
      closeInboxSortBtn: doc.getElementById("close-inbox-sort-btn"),
      inboxSortCard: doc.getElementById("inbox-sort-card"),
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
      closeTemplateAutoBtn: doc.getElementById("close-template-auto-btn"),
      templateAutoTemplateName: doc.getElementById("template-auto-template-name"),
      templateAutoYesBtn: doc.getElementById("template-auto-yes-btn"),
      templateAutoNoBtn: doc.getElementById("template-auto-no-btn"),
      closeBreakdownIntroBtn: doc.getElementById("close-breakdown-intro-btn"),
      breakdownIntroText: doc.getElementById("breakdown-intro-text"),
      breakdownRememberRow: doc.getElementById("breakdown-remember-row"),
      breakdownRememberChoice: doc.getElementById("breakdown-remember-choice"),
      breakdownManualBtn: doc.getElementById("breakdown-manual-btn"),
      breakdownSuggestedBtn: doc.getElementById("breakdown-suggested-btn"),
      closeBreakdownEditorBtn: doc.getElementById("close-breakdown-editor-btn"),
      breakdownEditorTitle: doc.getElementById("breakdown-editor-title"),
      breakdownEditorSubtitle: doc.getElementById("breakdown-editor-subtitle"),
      breakdownDraftList: doc.getElementById("breakdown-draft-list"),
      breakdownConfirmBtn: doc.getElementById("breakdown-confirm-btn"),
      breakdownCancelBtn: doc.getElementById("breakdown-cancel-btn"),
      closeLowEnergyBtn: doc.getElementById("close-low-energy-btn"),
      lowEnergyAvatar: doc.getElementById("low-energy-avatar"),
      lowEnergyText: doc.getElementById("low-energy-text"),
      lowEnergyAcceptBtn: doc.getElementById("low-energy-accept-btn"),
      lowEnergyDeclineBtn: doc.getElementById("low-energy-decline-btn"),
      closeLowEnergySwapBtn: doc.getElementById("close-low-energy-swap-btn"),
      lowEnergySwapList: doc.getElementById("low-energy-swap-list"),
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
      sosDestination: null,
      lowEnergyPromptHandled: false,
      lowEnergyDayApplied: false,
      lowEnergyKeptTaskId: null,
      lowEnergyResourceId: null,
      lowEnergyResourceTaskId: null
    };
  }
  function normalizeCurrentDayMeta(currentDayMeta, date = getLocalDateString()) {
    const base = createCurrentDayMeta(date);
    if (!currentDayMeta || typeof currentDayMeta !== "object") {
      return base;
    }
    return {
      ...base,
      ...currentDayMeta,
      date
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
    const regularTasks = dayTasks.filter((task) => !task.isResource && !task.isBreakdownParent);
    const resourceTasks = dayTasks.filter((task) => task.isResource);
    const completedRegularTasks = regularTasks.filter((task) => task.completed || task.completedAtDate === date);
    const currentDayMeta = ((_a = state.currentDayMeta) == null ? void 0 : _a.date) === date ? normalizeCurrentDayMeta(state.currentDayMeta, date) : createCurrentDayMeta(date);
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
  function isBreakdownParentHidden(task) {
    return Boolean((task == null ? void 0 : task.isBreakdownParent) && (task == null ? void 0 : task.isHiddenFromMainList));
  }
  function isVisibleBreakdownStep(task, state) {
    var _a;
    if (!(task == null ? void 0 : task.isBreakdownStep)) {
      return true;
    }
    if (!task.showOnlyCurrentStep) {
      return true;
    }
    const parentTask = task.breakdownParentId ? state.tasks.find((item) => item.id === task.breakdownParentId) : null;
    if (!parentTask) {
      return task.isCurrentBreakdownStep !== false;
    }
    return ((_a = parentTask.breakdownChildIds.map((id) => state.tasks.find((item) => item.id === id)).filter(Boolean).find((step) => !step.completed)) == null ? void 0 : _a.id) === task.id;
  }
  function isTaskVisibleOnMainList(task, state) {
    if (isBreakdownParentHidden(task)) {
      return false;
    }
    return isVisibleBreakdownStep(task, state);
  }
  function getOverdueTasks(state, today = getLocalDateString()) {
    return state.tasks.filter(
      (task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate && task.targetDate < today && !isBreakdownParentHidden(task)
    );
  }
  function getTodayTasks(state, today = getLocalDateString()) {
    return state.tasks.filter(
      (task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && isTaskVisibleOnMainList(task, state)
    );
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
      (task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && !task.completed && !task.isResource && !isBreakdownParentHidden(task)
    );
  }
  function getLightTaskToKeep(state, today = getLocalDateString()) {
    let selectedTask = null;
    state.tasks.forEach((task) => {
      const isLightCandidate = getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && !task.completed && !task.isResource && !isBreakdownParentHidden(task) && (task.weight || 0) <= 10;
      if (!isLightCandidate) {
        return;
      }
      if (!selectedTask || (task.weight || 0) < (selectedTask.weight || 0)) {
        selectedTask = task;
      }
    });
    return selectedTask;
  }
  function getLowEnergySwapCandidates(state, today = getLocalDateString()) {
    return state.tasks.filter(
      (task) => getTaskStorageStatus(task) === TASK_STORAGE.DEFERRED && task.archivedFromDate === today && !task.completed && !task.isResource && (task.weight || 0) <= 10
    );
  }
  function applyLowEnergyDay(store, today = getLocalDateString()) {
    let keptTaskId = null;
    store.updateState((state) => {
      const taskToKeep = getLightTaskToKeep(state, today);
      keptTaskId = (taskToKeep == null ? void 0 : taskToKeep.id) || null;
      state.tasks.forEach((task) => {
        const shouldMoveToDeferred = getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && !task.completed && !task.isResource && !isBreakdownParentHidden(task) && task.id !== keptTaskId;
        if (!shouldMoveToDeferred) {
          return;
        }
        task.archivedFromDate = today;
        task.targetDate = null;
        setTaskStorageStatus(task, TASK_STORAGE.DEFERRED);
      });
      state.currentDayMeta = {
        ...state.currentDayMeta,
        date: today,
        lowEnergyPromptHandled: true,
        lowEnergyDayApplied: true,
        lowEnergyKeptTaskId: keptTaskId
      };
    });
    return keptTaskId;
  }
  function swapLowEnergyKeptTask(store, { nextTaskId, today = getLocalDateString() }) {
    let swappedTask = null;
    store.updateState((state) => {
      var _a;
      const currentKeptTaskId = ((_a = state.currentDayMeta) == null ? void 0 : _a.lowEnergyKeptTaskId) || null;
      const currentKeptTask = currentKeptTaskId ? state.tasks.find((task) => task.id === currentKeptTaskId) : null;
      const nextTask = state.tasks.find((task) => task.id === nextTaskId);
      const canSwapToNext = nextTask && getTaskStorageStatus(nextTask) === TASK_STORAGE.DEFERRED && nextTask.archivedFromDate === today && !nextTask.completed && !nextTask.isResource && (nextTask.weight || 0) <= 10;
      if (!canSwapToNext) {
        return;
      }
      if (currentKeptTask && getTaskStorageStatus(currentKeptTask) === TASK_STORAGE.ACTIVE && currentKeptTask.targetDate === today) {
        currentKeptTask.archivedFromDate = today;
        currentKeptTask.targetDate = null;
        setTaskStorageStatus(currentKeptTask, TASK_STORAGE.DEFERRED);
      }
      nextTask.targetDate = today;
      setTaskStorageStatus(nextTask, TASK_STORAGE.ACTIVE);
      state.currentDayMeta = {
        ...state.currentDayMeta,
        date: today,
        lowEnergyDayApplied: true,
        lowEnergyKeptTaskId: nextTask.id
      };
      swappedTask = nextTask;
    });
    return swappedTask;
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
      targetDate: targetDate || getLocalDateString(),
      breakdownParentId: null,
      breakdownChildIds: [],
      breakdownIndex: null,
      isBreakdownParent: false,
      isBreakdownStep: false,
      isHiddenFromMainList: false,
      showOnlyCurrentStep: false,
      isCurrentBreakdownStep: false
    };
    store.updateState((state) => {
      state.tasks.push(newTask);
    });
    return newTask;
  }
  function refreshBreakdownGroup(parentTask, state) {
    if (!(parentTask == null ? void 0 : parentTask.isBreakdownParent) || !Array.isArray(parentTask.breakdownChildIds)) {
      return;
    }
    let currentVisibleStepId = null;
    parentTask.breakdownChildIds.forEach((childId) => {
      const childTask = state.tasks.find((task) => task.id === childId);
      if (!childTask) return;
      const isEligibleCurrentStep = !childTask.completed && getTaskStorageStatus(childTask) === TASK_STORAGE.ACTIVE;
      if (!isEligibleCurrentStep || currentVisibleStepId) {
        childTask.isCurrentBreakdownStep = false;
        return;
      }
      childTask.isCurrentBreakdownStep = true;
      currentVisibleStepId = childTask.id;
    });
  }
  function refreshAllBreakdownGroups(state) {
    state.tasks.filter((task) => task.isBreakdownParent).forEach((parentTask) => refreshBreakdownGroup(parentTask, state));
  }
  function getTaskBreakdownParent(state, task) {
    if (!(task == null ? void 0 : task.breakdownParentId)) {
      return null;
    }
    return state.tasks.find((item) => item.id === task.breakdownParentId) || null;
  }
  function shouldShowBreakdownAction(task) {
    return getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && !task.completed && !task.isResource && !task.isBreakdownParent && !task.isBreakdownStep && !task.isHiddenFromMainList && (task.weight || 0) >= 20;
  }
  function createTaskBreakdown(store, { taskId, steps }) {
    let parentTask = null;
    store.updateState((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task || !shouldShowBreakdownAction(task) || !Array.isArray(steps) || steps.length < 2 || steps.length > 3) {
        return;
      }
      const sanitizedSteps = steps.map((step, index) => ({
        id: `task_${Date.now()}_${index}_${Math.floor(Math.random() * 1e6)}`,
        text: String(step.text || "").trim(),
        weight: step.weight === 10 ? 10 : 5
      }));
      if (sanitizedSteps.some((step) => !step.text)) {
        return;
      }
      task.isBreakdownParent = true;
      task.isHiddenFromMainList = true;
      task.showOnlyCurrentStep = true;
      task.breakdownChildIds = sanitizedSteps.map((step) => step.id);
      task.breakdownTotalSteps = sanitizedSteps.length;
      sanitizedSteps.forEach((step, index) => {
        state.tasks.push({
          id: step.id,
          text: step.text,
          weight: step.weight,
          isResource: false,
          completed: false,
          completedAtDate: null,
          storageStatus: TASK_STORAGE.ACTIVE,
          isArchived: false,
          targetDate: task.targetDate,
          breakdownParentId: task.id,
          breakdownChildIds: [],
          breakdownIndex: index,
          breakdownTotalSteps: sanitizedSteps.length,
          isBreakdownParent: false,
          isBreakdownStep: true,
          isHiddenFromMainList: false,
          showOnlyCurrentStep: true,
          isCurrentBreakdownStep: index === 0
        });
      });
      refreshBreakdownGroup(task, state);
      parentTask = task;
    });
    return parentTask;
  }
  function advanceBreakdownAfterCompletion(store, taskId) {
    let nextStepId = null;
    store.updateState((state) => {
      const completedTask = state.tasks.find((task) => task.id === taskId);
      if (!(completedTask == null ? void 0 : completedTask.isBreakdownStep) || !completedTask.breakdownParentId) {
        return;
      }
      const parentTask = state.tasks.find((task) => task.id === completedTask.breakdownParentId);
      if (!parentTask) {
        return;
      }
      refreshBreakdownGroup(parentTask, state);
      const nextVisibleStep = parentTask.breakdownChildIds.map((id) => state.tasks.find((task) => task.id === id)).filter(Boolean).find((step) => !step.completed && getTaskStorageStatus(step) === TASK_STORAGE.ACTIVE);
      nextStepId = (nextVisibleStep == null ? void 0 : nextVisibleStep.id) || null;
    });
    return nextStepId;
  }
  function toggleTask(store, taskId) {
    let updatedTask = null;
    store.updateState((state) => {
      updatedTask = state.tasks.find((task) => task.id === taskId) || null;
      if (updatedTask && getTaskStorageStatus(updatedTask) === TASK_STORAGE.ACTIVE) {
        updatedTask.completed = !updatedTask.completed;
        updatedTask.completedAtDate = updatedTask.completed ? getLocalDateString() : null;
        if (updatedTask.isBreakdownStep && updatedTask.breakdownParentId) {
          const parentTask = state.tasks.find((task) => task.id === updatedTask.breakdownParentId);
          refreshBreakdownGroup(parentTask, state);
        }
      }
    });
    return updatedTask;
  }
  function deleteTask(store, taskId) {
    store.updateState((state) => {
      const taskToDelete = state.tasks.find((task) => task.id === taskId);
      state.tasks = state.tasks.filter((task) => task.id !== taskId);
      if ((taskToDelete == null ? void 0 : taskToDelete.isBreakdownStep) && taskToDelete.breakdownParentId) {
        const parentTask = state.tasks.find((task) => task.id === taskToDelete.breakdownParentId);
        if (parentTask) {
          parentTask.breakdownChildIds = parentTask.breakdownChildIds.filter((id) => id !== taskId);
          refreshBreakdownGroup(parentTask, state);
        }
      }
    });
  }
  function updateTask(store, { taskId, text, weight }) {
    let updatedTask = null;
    store.updateState((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) return;
      task.text = text;
      if (!task.isResource && typeof weight === "number" && !Number.isNaN(weight)) {
        task.weight = weight;
      }
      updatedTask = task;
    });
    return updatedTask;
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
      if (task.isBreakdownStep && task.breakdownParentId) {
        const parentTask = state.tasks.find((item) => item.id === task.breakdownParentId);
        refreshBreakdownGroup(parentTask, state);
      }
    });
  }
  function moveToToday(store, taskId) {
    store.updateState((state) => {
      const task = state.tasks.find((item) => item.id === taskId);
      if (task) {
        task.targetDate = getLocalDateString();
        setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
        if (task.isBreakdownStep && task.breakdownParentId) {
          const parentTask = state.tasks.find((item) => item.id === task.breakdownParentId);
          refreshBreakdownGroup(parentTask, state);
        }
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
        if (task.isBreakdownStep && task.breakdownParentId) {
          const parentTask = state.tasks.find((item) => item.id === task.breakdownParentId);
          refreshBreakdownGroup(parentTask, state);
        }
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
          if (isBreakdownParentHidden(task)) {
            return;
          }
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
          if (isBreakdownParentHidden(task)) {
            return;
          }
          task.targetDate = tomorrow;
          setTaskStorageStatus(task, TASK_STORAGE.ACTIVE);
          movedCount += 1;
        }
      });
      refreshAllBreakdownGroups(state);
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
        (task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && task.isResource === isResource && !isBreakdownParentHidden(task)
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
        if (task.isBreakdownStep && task.breakdownParentId) {
          const parentTask = state.tasks.find((item) => item.id === task.breakdownParentId);
          refreshBreakdownGroup(parentTask, state);
        }
      }
    });
  }
  function reorderWeeklyTasks(store, { dateStr, newOrderIds }) {
    store.updateState((state) => {
      const dayTasks = state.tasks.filter(
        (task) => getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === dateStr && !task.completed && !isBreakdownParentHidden(task)
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
  var API_STATE_URL = "/api/state";
  function getDefaultTemplates() {
    return [
      {
        id: "tpl_1",
        name: "Утро",
        autoAddDaily: false,
        hasAskedAutoAdd: false,
        lastAutoAddedDate: null,
        tasks: [
          { id: "tt_11", text: "Выпить воду", weight: 5 },
          { id: "tt_12", text: "Принять лекарства", weight: 5 },
          { id: "tt_13", text: "Почистить зубы", weight: 5 },
          { id: "tt_14", text: "Завтрак-минимум", weight: 5 }
        ]
      },
      {
        id: "tpl_2",
        name: "Выход из дома",
        autoAddDaily: false,
        hasAskedAutoAdd: false,
        lastAutoAddedDate: null,
        tasks: [
          { id: "tt_21", text: "Ключи", weight: 5 },
          { id: "tt_22", text: "Телефон", weight: 5 },
          { id: "tt_23", text: "Наушники", weight: 5 },
          { id: "tt_24", text: "Проверить плиту", weight: 5 },
          { id: "tt_25", text: "Проверить розетки", weight: 5 },
          { id: "tt_26", text: "Проверить входную дверь", weight: 5 }
        ]
      },
      {
        id: "tpl_3",
        name: "Вечер",
        autoAddDaily: false,
        hasAskedAutoAdd: false,
        lastAutoAddedDate: null,
        tasks: [
          { id: "tt_31", text: "Поставить устройства на зарядку", weight: 5 },
          { id: "tt_32", text: "Проветрить", weight: 5 },
          { id: "tt_33", text: "Вечерние таблетки", weight: 5 }
        ]
      },
      {
        id: "tpl_4",
        name: "SOS-день",
        autoAddDaily: false,
        hasAskedAutoAdd: false,
        lastAutoAddedDate: null,
        tasks: [
          { id: "tt_41", text: "Выпить воды", weight: 5 },
          { id: "tt_42", text: "Поесть или взять перекус", weight: 5 },
          { id: "tt_43", text: "Принять лекарства или проверить базовый уход", weight: 5 },
          { id: "tt_44", text: "Полежать или посидеть в тишине 10 минут", weight: 5 }
        ]
      }
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
      inboxItems: [],
      preferences: {
        breakDownLargeTasksPromptMode: "ask-first-time"
      },
      resources: [
        { id: "res_1", text: "Попить кофе" },
        { id: "res_2", text: "10 минут соцсетей" },
        { id: "res_3", text: "Прогулка 15 минут" }
      ],
      templates: []
    };
  }
  function createDefaultStateWithTemplates() {
    const nextState = getDefaultState();
    nextState.templates = getDefaultTemplates();
    return nextState;
  }
  function ensurePreferenceDefaults(state) {
    if (!state.preferences || typeof state.preferences !== "object") {
      state.preferences = {};
    }
    if (typeof state.preferences.breakDownLargeTasksPromptMode !== "string") {
      state.preferences.breakDownLargeTasksPromptMode = "ask-first-time";
    }
  }
  function ensureTemplateDefaults(template) {
    if (typeof template.autoAddDaily !== "boolean") {
      template.autoAddDaily = false;
    }
    if (typeof template.hasAskedAutoAdd !== "boolean") {
      template.hasAskedAutoAdd = false;
    }
    if (typeof template.lastAutoAddedDate !== "string") {
      template.lastAutoAddedDate = null;
    }
    if (!Array.isArray(template.tasks)) {
      template.tasks = [];
    }
  }
  function ensureTemplateMigrations(state) {
    state.templates.forEach(ensureTemplateDefaults);
    const exitHomeTemplate = state.templates.find((template) => template.id === "tpl_2");
    if (exitHomeTemplate == null ? void 0 : exitHomeTemplate.tasks) {
      if (!exitHomeTemplate.tasks.find((task) => task.id === "tt_25")) {
        exitHomeTemplate.tasks.push({ id: "tt_25", text: "Проверить розетки", weight: 5 });
      }
      if (!exitHomeTemplate.tasks.find((task) => task.id === "tt_26")) {
        exitHomeTemplate.tasks.push({ id: "tt_26", text: "Проверить входную дверь", weight: 5 });
      }
    }
    const sosTemplate = state.templates.find((template) => template.id === "tpl_4");
    if (!(sosTemplate == null ? void 0 : sosTemplate.tasks)) {
      return;
    }
    const sosTaskMap = {
      tt_41: "Выпить воды",
      tt_42: "Поесть или взять перекус",
      tt_43: "Принять лекарства или проверить базовый уход",
      tt_44: "Полежать или посидеть в тишине 10 минут"
    };
    sosTemplate.name = "SOS-день";
    Object.entries(sosTaskMap).forEach(([taskId, text]) => {
      const existingTask = sosTemplate.tasks.find((task) => task.id === taskId);
      if (existingTask) {
        existingTask.text = text;
        existingTask.weight = 5;
      } else {
        sosTemplate.tasks.push({ id: taskId, text, weight: 5 });
      }
    });
  }
  function normalizeLoadedState(rawState, previousState = getDefaultState()) {
    const today = getLocalDateString();
    const nextState = { ...previousState, ...rawState };
    if (!Array.isArray(nextState.tasks)) nextState.tasks = [];
    if (!Array.isArray(nextState.inboxItems)) nextState.inboxItems = [];
    if (!Array.isArray(nextState.resources)) nextState.resources = [];
    nextState.moodHistory = normalizeMoodHistory(nextState.moodHistory);
    ensurePreferenceDefaults(nextState);
    if (!Array.isArray(nextState.templates) || nextState.templates.length === 0) {
      nextState.templates = getDefaultTemplates();
    } else {
      ensureTemplateMigrations(nextState);
    }
    if (typeof nextState.pendingReviewDate !== "string") {
      nextState.pendingReviewDate = null;
    }
    if (!nextState.currentDayMeta || typeof nextState.currentDayMeta !== "object") {
      nextState.currentDayMeta = createCurrentDayMeta(nextState.lastDate);
    } else {
      nextState.currentDayMeta = normalizeCurrentDayMeta(
        nextState.currentDayMeta,
        nextState.currentDayMeta.date || nextState.lastDate || today
      );
    }
    if (nextState.lastDate && nextState.currentDayMeta.date !== nextState.lastDate) {
      nextState.currentDayMeta = createCurrentDayMeta(nextState.lastDate);
    }
    const seenIds = /* @__PURE__ */ new Set();
    nextState.tasks.forEach((task) => {
      if (seenIds.has(task.id)) {
        task.id = `task_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
      }
      seenIds.add(task.id);
      if (typeof task.completedAtDate !== "string") {
        task.completedAtDate = null;
      }
      if (typeof task.breakdownParentId !== "string") {
        task.breakdownParentId = null;
      }
      if (!Array.isArray(task.breakdownChildIds)) {
        task.breakdownChildIds = [];
      }
      if (typeof task.breakdownIndex !== "number") {
        task.breakdownIndex = null;
      }
      if (typeof task.isBreakdownParent !== "boolean") {
        task.isBreakdownParent = false;
      }
      if (typeof task.isBreakdownStep !== "boolean") {
        task.isBreakdownStep = false;
      }
      if (typeof task.isHiddenFromMainList !== "boolean") {
        task.isHiddenFromMainList = false;
      }
      if (typeof task.showOnlyCurrentStep !== "boolean") {
        task.showOnlyCurrentStep = false;
      }
      if (typeof task.isCurrentBreakdownStep !== "boolean") {
        task.isCurrentBreakdownStep = false;
      }
      task.storageStatus = getTaskStorageStatus(task);
      task.isArchived = task.storageStatus === TASK_STORAGE.DEFERRED;
      if (task.storageStatus === TASK_STORAGE.ACTIVE && !task.targetDate) {
        task.targetDate = nextState.lastDate || today;
      }
      if (task.storageStatus !== TASK_STORAGE.ACTIVE) {
        task.targetDate = null;
      }
    });
    nextState.inboxItems = nextState.inboxItems.filter((item) => item && typeof item.text === "string").map((item) => ({
      id: typeof item.id === "string" ? item.id : `inbox_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      text: item.text.trim(),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : (/* @__PURE__ */ new Date()).toISOString()
    })).filter((item) => item.text);
    if (nextState.avatar && !nextState.avatar.includes(".png")) {
      nextState.avatar = "assets/girl.png";
    }
    const hasOverdue = nextState.tasks.some((task) => task.targetDate && task.targetDate < today);
    if (!nextState.pendingReviewDate && nextState.lastDate !== today && hasOverdue) {
      nextState.pendingReviewDate = today;
    }
    return nextState;
  }
  function createStore() {
    let state = createDefaultStateWithTemplates();
    let persistenceStatus = {
      mode: "local-fallback",
      message: "Сейчас работаем локально. Сервер недоступен."
    };
    let persistenceStatusListener = null;
    let saveChain = Promise.resolve();
    function getState() {
      return state;
    }
    function setState(nextState) {
      state = nextState;
      return state;
    }
    function getPersistenceStatus() {
      return persistenceStatus;
    }
    function setPersistenceStatusListener(listener) {
      persistenceStatusListener = listener;
      if (typeof listener === "function") {
        listener({ ...persistenceStatus });
      }
    }
    function updatePersistenceStatus(nextStatus) {
      const nextMode = (nextStatus == null ? void 0 : nextStatus.mode) || "local-fallback";
      const nextMessage = (nextStatus == null ? void 0 : nextStatus.message) || "";
      if (persistenceStatus.mode === nextMode && persistenceStatus.message === nextMessage) {
        return;
      }
      persistenceStatus = {
        mode: nextMode,
        message: nextMessage
      };
      if (typeof persistenceStatusListener === "function") {
        persistenceStatusListener({ ...persistenceStatus });
      }
    }
    function saveStateToLocal(nextState = state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }
    function getLocalSavedState() {
      return localStorage.getItem(STORAGE_KEY);
    }
    async function fetchServerState() {
      const response = await fetch(API_STATE_URL, {
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to load state from server: ${response.status}`);
      }
      const payload = await response.json();
      if (!payload || typeof payload !== "object") {
        return null;
      }
      if (payload.state === null) {
        return null;
      }
      if (typeof payload.state !== "object") {
        throw new Error("Server returned invalid state payload");
      }
      return payload.state;
    }
    async function postServerState(nextState = state) {
      const response = await fetch(API_STATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(nextState)
      });
      if (!response.ok) {
        throw new Error(`Failed to save state to server: ${response.status}`);
      }
      return response.json().catch(() => null);
    }
    function saveState(nextState = state) {
      saveStateToLocal(nextState);
      saveChain = saveChain.catch(() => void 0).then(async () => {
        try {
          await postServerState(nextState);
          updatePersistenceStatus({
            mode: "server",
            message: "Данные читаются и сохраняются через локальный сервер."
          });
        } catch (error) {
          console.warn("Failed to save state to server, using local fallback", error);
          saveStateToLocal(nextState);
          updatePersistenceStatus({
            mode: "local-fallback",
            message: "Сейчас работаем локально. Сервер недоступен."
          });
        }
      });
      return saveChain;
    }
    function updateState(mutator, options = { save: true }) {
      mutator(state);
      if (options.save !== false) {
        void saveState();
      }
      return state;
    }
    async function loadState() {
      const localSaved = getLocalSavedState();
      try {
        const serverState = await fetchServerState();
        if (serverState) {
          state = normalizeLoadedState(serverState, createDefaultStateWithTemplates());
          saveStateToLocal(state);
          updatePersistenceStatus({
            mode: "server",
            message: "Данные читаются и сохраняются через локальный сервер."
          });
          return state;
        }
        if (localSaved) {
          state = normalizeLoadedState(JSON.parse(localSaved), createDefaultStateWithTemplates());
          saveStateToLocal(state);
          try {
            await postServerState(state);
            updatePersistenceStatus({
              mode: "server",
              message: "Данные читаются и сохраняются через локальный сервер."
            });
          } catch (migrationError) {
            console.warn("Failed to migrate local state to server", migrationError);
            updatePersistenceStatus({
              mode: "local-fallback",
              message: "Сейчас работаем локально. Сервер недоступен."
            });
          }
          return state;
        }
        state = createDefaultStateWithTemplates();
        updatePersistenceStatus({
          mode: "server",
          message: "Данные читаются и сохраняются через локальный сервер."
        });
        return state;
      } catch (serverError) {
        console.warn("Failed to load state from server, using local fallback", serverError);
        if (localSaved) {
          try {
            state = normalizeLoadedState(JSON.parse(localSaved), createDefaultStateWithTemplates());
          } catch (localError) {
            console.error("Failed to load local state", localError);
            state = createDefaultStateWithTemplates();
          }
        } else {
          state = createDefaultStateWithTemplates();
        }
        updatePersistenceStatus({
          mode: "local-fallback",
          message: "Сейчас работаем локально. Сервер недоступен."
        });
        return state;
      }
    }
    return {
      getState,
      setState,
      getPersistenceStatus,
      setPersistenceStatusListener,
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
  function assignLowEnergyResource(store, { today = getLocalDateString(), cycle = false } = {}) {
    const state = store.getState();
    const currentDayMeta = state.currentDayMeta || {};
    const activeTodayResources = getTodayTasks(state, today).filter((task) => task.isResource);
    const currentResourceTaskId = currentDayMeta.lowEnergyResourceTaskId || null;
    const currentResourceId = currentDayMeta.lowEnergyResourceId || null;
    const currentResourceTask = currentResourceTaskId ? activeTodayResources.find((task) => task.id === currentResourceTaskId) || null : null;
    const busyResourceTexts = new Set(
      activeTodayResources.filter((task) => task.id !== currentResourceTaskId).map((task) => task.text)
    );
    const availableResources = state.resources.filter(
      (resource) => !busyResourceTexts.has(resource.text)
    );
    if (availableResources.length === 0) {
      return currentResourceTask || null;
    }
    let nextResource = null;
    if (cycle && currentResourceId) {
      const currentIndex = availableResources.findIndex((resource) => resource.id === currentResourceId);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % availableResources.length;
      nextResource = availableResources[nextIndex];
    } else {
      const pool = availableResources.filter((resource) => resource.id !== currentResourceId);
      const selectionPool = pool.length > 0 ? pool : availableResources;
      nextResource = selectionPool[Math.floor(Math.random() * selectionPool.length)];
    }
    if (!nextResource) {
      return currentResourceTask || null;
    }
    let assignedTask = null;
    store.updateState((nextState) => {
      const currentTask = currentResourceTaskId ? nextState.tasks.find(
        (task) => task.id === currentResourceTaskId && getTaskStorageStatus(task) === TASK_STORAGE.ACTIVE && task.targetDate === today && task.isResource
      ) || null : null;
      if (currentTask) {
        currentTask.text = nextResource.text;
        assignedTask = currentTask;
      } else {
        assignedTask = {
          id: `task_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
          text: nextResource.text,
          weight: 0,
          isResource: true,
          completed: false,
          completedAtDate: null,
          storageStatus: TASK_STORAGE.ACTIVE,
          isArchived: false,
          targetDate: today
        };
        nextState.tasks.push(assignedTask);
      }
      nextState.currentDayMeta = {
        ...nextState.currentDayMeta,
        date: today,
        lowEnergyDayApplied: true,
        lowEnergyResourceId: nextResource.id,
        lowEnergyResourceTaskId: (assignedTask == null ? void 0 : assignedTask.id) || null
      };
    }, { save: false });
    store.saveState();
    return assignedTask;
  }

  // js/domain/inbox.js
  function createInboxId() {
    return `inbox_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
  function splitInboxText(input) {
    return String(input || "").split(/\r?\n+/).map((line) => line.trim()).filter(Boolean);
  }
  function getInboxItems(state) {
    return [...state.inboxItems || []].sort((left, right) => (left.createdAt || "").localeCompare(right.createdAt || ""));
  }
  function addInboxItems(store, items) {
    const normalizedItems = (Array.isArray(items) ? items : []).map((item) => typeof item === "string" ? { text: item } : item).map((item) => ({
      id: item.id || createInboxId(),
      text: String(item.text || "").trim(),
      createdAt: item.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    })).filter((item) => item.text);
    if (normalizedItems.length === 0) {
      return [];
    }
    store.updateState((state) => {
      state.inboxItems.push(...normalizedItems);
    });
    return normalizedItems;
  }
  function deleteInboxItem(store, itemId) {
    let deletedItem = null;
    store.updateState((state) => {
      deletedItem = state.inboxItems.find((item) => item.id === itemId) || null;
      state.inboxItems = state.inboxItems.filter((item) => item.id !== itemId);
    });
    return deletedItem;
  }
  function clearInboxItems(store) {
    let removedCount = 0;
    store.updateState((state) => {
      removedCount = state.inboxItems.length;
      state.inboxItems = [];
    });
    return removedCount;
  }
  function convertInboxItemToToday(store, { itemId, weight = 20 }) {
    const state = store.getState();
    const item = state.inboxItems.find((entry) => entry.id === itemId);
    if (!item) {
      return null;
    }
    const task = addTask(store, {
      text: item.text,
      weight,
      isResource: false,
      targetDate: getLocalDateString()
    });
    deleteInboxItem(store, itemId);
    return task;
  }
  function convertInboxItemToDate(store, { itemId, dateStr, weight = 20 }) {
    const state = store.getState();
    const item = state.inboxItems.find((entry) => entry.id === itemId);
    if (!item) {
      return null;
    }
    const task = addTask(store, {
      text: item.text,
      weight,
      isResource: false,
      targetDate: dateStr
    });
    deleteInboxItem(store, itemId);
    return task;
  }
  function convertInboxItemToDeferred(store, itemId) {
    const state = store.getState();
    const item = state.inboxItems.find((entry) => entry.id === itemId);
    if (!item) {
      return null;
    }
    const task = addTask(store, {
      text: item.text,
      weight: 20,
      isResource: false,
      targetDate: getLocalDateString()
    });
    moveToDeferred(store, task.id);
    deleteInboxItem(store, itemId);
    return task;
  }
  function convertInboxItemToResource(store, itemId) {
    const state = store.getState();
    const item = state.inboxItems.find((entry) => entry.id === itemId);
    if (!item) {
      return null;
    }
    const resource = addResource(store, item.text);
    deleteInboxItem(store, itemId);
    return resource;
  }
  function getInboxSortDates(today = getLocalDateString()) {
    return Array.from({ length: 7 }, (_, index) => {
      const date = parseLocalDate(today);
      date.setDate(date.getDate() + index);
      return getLocalDateString(date);
    });
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
  function renderInlineTaskEditor(task, editTaskState) {
    const isResource = task.isResource || editTaskState.isResource;
    const weightSelectHtml = isResource ? '<div class="inline-edit-spacer"></div>' : `
            <select class="inline-edit-weight" data-action="edit-update-weight" data-task-id="${task.id}">
                ${[5, 10, 20, 30, 50].map((weight) => `<option value="${weight}" ${Number(editTaskState.weight) === weight ? "selected" : ""}>${weight}</option>`).join("")}
            </select>
        `;
    return `
        <div class="task-main inline-edit-main">
            <input class="inline-edit-input" type="text" value="${escapeHtml(editTaskState.text)}" data-action="edit-update-text" data-task-id="${task.id}">
        </div>
        ${weightSelectHtml}
        <button class="task-breakdown-btn" type="button" data-action="edit-save-task" data-task-id="${task.id}">Сохранить</button>
        <button class="text-btn inline-edit-cancel" type="button" data-action="edit-cancel-task" data-task-id="${task.id}">Отмена</button>
    `;
  }
  function renderTaskElement(task, editTaskState = null) {
    var _a;
    const taskEl = document.createElement("div");
    taskEl.className = `task-item ${task.completed ? "completed" : ""} ${task.isResource ? "resource-item-drag" : ""}`;
    taskEl.draggable = !editTaskState;
    taskEl.dataset.taskId = task.id;
    if (editTaskState) {
      taskEl.classList.add("editing");
      taskEl.innerHTML = renderInlineTaskEditor(task, editTaskState);
      return taskEl;
    }
    const weightClass = task.isResource ? "resource-weight" : "";
    const weightLabel = task.isResource ? "Ресурс" : `Вес: ${task.weight}`;
    const controlsHtml = !task.isResource && !task.completed ? `
            <button class="postpone-btn" title="На потом" data-action="move-to-deferred" data-task-id="${task.id}">📦</button>
            <button class="postpone-btn" title="На завтра" data-action="postpone-task" data-task-id="${task.id}">➡️</button>
        ` : "";
    const breakdownButtonHtml = shouldShowBreakdownAction(task) ? `<button class="task-breakdown-btn" type="button" title="Разбить на шаги" data-action="open-breakdown" data-task-id="${task.id}">Разбить</button>` : "";
    const taskMetaHtml = task.isBreakdownStep ? `<div class="task-meta">Шаг ${((_a = task.breakdownIndex) != null ? _a : 0) + 1} из ${task.breakdownTotalSteps || 3}</div>` : "";
    taskEl.innerHTML = `
        <div class="task-checkbox-container" data-action="toggle-task" data-task-id="${task.id}">
            <div class="custom-checkbox"></div>
        </div>
        <div class="task-main">
            <div class="task-desc">${escapeHtml(task.text)}</div>
            ${taskMetaHtml}
        </div>
        <div class="task-weight ${weightClass}">${weightLabel}</div>
        ${breakdownButtonHtml}
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
  function formatVoiceDateLabel(date, today = getLocalDateString()) {
    if (date === today) {
      return "Сегодня";
    }
    const tomorrow = /* @__PURE__ */ new Date(`${today}T00:00:00`);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date === getLocalDateString(tomorrow)) {
      return "Завтра";
    }
    return (/* @__PURE__ */ new Date(`${date}T00:00:00`)).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short"
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
    function renderPersistenceStatus() {
      var _a;
      if (!elements.storageStatus) {
        return;
      }
      const status = runtime.persistenceStatus || ((_a = store.getPersistenceStatus) == null ? void 0 : _a.call(store)) || { mode: "local-fallback" };
      const isServerMode = status.mode === "server";
      elements.storageStatus.textContent = isServerMode ? "Сохранение: сервер" : "Сохранение: локально";
      elements.storageStatus.classList.toggle("is-server", isServerMode);
      elements.storageStatus.classList.toggle("is-local", !isServerMode);
      elements.storageStatus.title = isServerMode ? "Данные читаются и сохраняются через локальный сервер." : "Сервер сейчас недоступен, поэтому приложение временно работает через localStorage.";
    }
    function renderVoiceUi() {
      const voice = runtime.voice;
      elements.openVoiceBtn.classList.remove("listening", "processing", "unsupported");
      elements.voiceStatus.classList.add("hidden");
      if (elements.addTaskForm.classList.contains("hidden")) {
        return;
      }
      if (!voice.isSupported) {
        elements.openVoiceBtn.classList.add("unsupported");
        elements.openVoiceBtn.title = "Голосовой ввод недоступен";
        elements.openVoiceBtn.textContent = "🎤";
        if (voice.voiceError) {
          elements.voiceStatus.textContent = voice.voiceError;
          elements.voiceStatus.classList.remove("hidden");
        }
        return;
      }
      if (voice.isListening) {
        elements.openVoiceBtn.classList.add("listening");
        elements.openVoiceBtn.title = "Остановить запись";
        elements.openVoiceBtn.textContent = "🎙️";
        elements.voiceStatus.textContent = "Я слушаю. Можно говорить свободно.";
        elements.voiceStatus.classList.remove("hidden");
        return;
      }
      if (voice.isProcessing) {
        elements.openVoiceBtn.classList.add("processing");
        elements.openVoiceBtn.title = "Обрабатываю голосовой черновик";
        elements.openVoiceBtn.textContent = "⏳";
        elements.voiceStatus.textContent = "Собираю черновик задач...";
        elements.voiceStatus.classList.remove("hidden");
        return;
      }
      elements.openVoiceBtn.title = "Добавить голосом";
      elements.openVoiceBtn.textContent = "🎤";
      if (voice.voiceError) {
        elements.voiceStatus.textContent = voice.voiceError;
        elements.voiceStatus.classList.remove("hidden");
      }
    }
    function renderInboxUi() {
      const inbox = runtime.inbox;
      const inboxItems = getInboxItems(store.getState());
      elements.inboxList.innerHTML = "";
      elements.inboxStatus.classList.add("hidden");
      elements.openInboxVoiceBtn.classList.remove("listening", "processing", "unsupported");
      if (!inbox.isSupported) {
        elements.openInboxVoiceBtn.classList.add("unsupported");
        elements.openInboxVoiceBtn.title = "Голосовой ввод в Облако недоступен";
      } else if (inbox.isListening) {
        elements.openInboxVoiceBtn.classList.add("listening");
        elements.openInboxVoiceBtn.title = "Остановить запись";
        elements.openInboxVoiceBtn.textContent = "🎙️";
        elements.inboxStatus.textContent = "Я слушаю. Можно просто выгрузить поток мыслей.";
        elements.inboxStatus.classList.remove("hidden");
      } else if (inbox.isProcessing) {
        elements.openInboxVoiceBtn.classList.add("processing");
        elements.openInboxVoiceBtn.title = "Собираю мысли в Облако";
        elements.openInboxVoiceBtn.textContent = "⏳";
        elements.inboxStatus.textContent = "Собираю черновик мыслей...";
        elements.inboxStatus.classList.remove("hidden");
      } else {
        elements.openInboxVoiceBtn.textContent = "🎤";
        elements.openInboxVoiceBtn.title = "Надиктовать в Облако";
        if (inbox.error) {
          elements.inboxStatus.textContent = inbox.error;
          elements.inboxStatus.classList.remove("hidden");
        }
      }
      elements.openInboxSortBtn.disabled = inboxItems.length === 0;
      elements.clearInboxBtn.disabled = inboxItems.length === 0;
      if (inboxItems.length === 0) {
        elements.inboxList.innerHTML = "";
        return;
      }
      inboxItems.forEach((item) => {
        const card = document.createElement("div");
        card.className = "inbox-item";
        const isPendingToday = inbox.pendingAction.itemId === item.id && inbox.pendingAction.mode === "today";
        const isPendingWeek = inbox.pendingAction.itemId === item.id && inbox.pendingAction.mode === "week";
        const todayActionHtml = isPendingToday ? `
                    <div class="inbox-action-config">
                        <select data-action="inbox-update-weight" data-inbox-id="${item.id}">
                            ${[5, 10, 20, 30, 50].map((weight) => `<option value="${weight}" ${Number(inbox.pendingAction.weight) === weight ? "selected" : ""}>${weight}</option>`).join("")}
                        </select>
                        <button class="task-breakdown-btn" type="button" data-action="inbox-confirm-today" data-inbox-id="${item.id}">Добавить</button>
                        <button class="text-btn" type="button" data-action="inbox-cancel-action" data-inbox-id="${item.id}">Отмена</button>
                    </div>
                ` : "";
        const weekActionHtml = isPendingWeek ? `
                    <div class="inbox-action-config">
                        <select data-action="inbox-update-date" data-inbox-id="${item.id}">
                            ${getInboxSortDates().map((date) => `<option value="${date}" ${inbox.pendingAction.date === date ? "selected" : ""}>${formatVoiceDateLabel(date)}</option>`).join("")}
                        </select>
                        <select data-action="inbox-update-weight" data-inbox-id="${item.id}">
                            ${[5, 10, 20, 30, 50].map((weight) => `<option value="${weight}" ${Number(inbox.pendingAction.weight) === weight ? "selected" : ""}>${weight}</option>`).join("")}
                        </select>
                        <button class="task-breakdown-btn" type="button" data-action="inbox-confirm-week" data-inbox-id="${item.id}">Добавить</button>
                        <button class="text-btn" type="button" data-action="inbox-cancel-action" data-inbox-id="${item.id}">Отмена</button>
                    </div>
                ` : "";
        card.innerHTML = `
                <div class="inbox-item-text">${escapeHtml(item.text)}</div>
                <div class="inbox-item-actions">
                    <button class="text-btn" type="button" data-action="inbox-open-today" data-inbox-id="${item.id}">На сегодня</button>
                    <button class="text-btn" type="button" data-action="inbox-open-week" data-inbox-id="${item.id}">В план</button>
                    <button class="text-btn" type="button" data-action="inbox-move-deferred" data-inbox-id="${item.id}">На потом</button>
                    <button class="text-btn" type="button" data-action="inbox-to-resource" data-inbox-id="${item.id}">В ресурсы</button>
                    <button class="text-btn" type="button" data-action="inbox-breakdown" data-inbox-id="${item.id}">Разбить</button>
                    <button class="delete-btn" title="Удалить" data-action="inbox-delete" data-inbox-id="${item.id}">&times;</button>
                </div>
                ${todayActionHtml}
                ${weekActionHtml}
            `;
        elements.inboxList.appendChild(card);
      });
    }
    function renderInboxVoiceModal() {
      const state = store.getState();
      const inbox = runtime.inbox;
      const isDraftMode = inbox.modalMode === "draft" && inbox.drafts.length > 0;
      elements.inboxVoiceHelperAvatar.src = state.avatar;
      elements.inboxVoiceDraftList.innerHTML = "";
      elements.inboxVoiceEmptyState.classList.toggle("hidden", isDraftMode);
      elements.inboxVoiceConfirmBtn.classList.toggle("hidden", !isDraftMode);
      if (!isDraftMode) {
        elements.inboxVoiceModalTitle.textContent = "Голос в Облако";
        elements.inboxVoiceModalSubtitle.textContent = inbox.error || "Пока не получилось подготовить черновик мыслей.";
        elements.inboxVoiceEmptyState.textContent = inbox.error || "Можно попробовать ещё раз или записать мысль текстом.";
        return;
      }
      elements.inboxVoiceModalTitle.textContent = "Сохраняем в Облако?";
      elements.inboxVoiceModalSubtitle.textContent = "Вот что я услышал. Можно спокойно поправить перед сохранением.";
      inbox.drafts.forEach((draft) => {
        const row = document.createElement("div");
        row.className = "voice-draft-item";
        row.innerHTML = `
                <input class="voice-draft-input" type="text" value="${escapeHtml(draft.text)}" data-action="inbox-voice-update-text" data-draft-id="${draft.id}">
                <div class="breakdown-draft-note">Мысль</div>
                <div class="breakdown-draft-spacer"></div>
                <button class="delete-btn" title="Удалить" data-action="inbox-voice-remove-draft" data-draft-id="${draft.id}">&times;</button>
            `;
        elements.inboxVoiceDraftList.appendChild(row);
      });
    }
    function renderInboxSortModal() {
      const inboxItems = getInboxItems(store.getState());
      const currentItem = inboxItems[0] || null;
      const inbox = runtime.inbox;
      if (!currentItem) {
        elements.inboxSortCard.innerHTML = '<div class="inbox-empty-state">Сейчас Облако пустое. Можно просто закрыть окно и вернуться позже.</div>';
        return;
      }
      const isPendingToday = inbox.pendingAction.itemId === currentItem.id && inbox.pendingAction.mode === "today";
      const isPendingWeek = inbox.pendingAction.itemId === currentItem.id && inbox.pendingAction.mode === "week";
      elements.inboxSortCard.innerHTML = `
            <div class="inbox-sort-text">${escapeHtml(currentItem.text)}</div>
            <div class="inbox-item-actions inbox-sort-actions">
                <button class="text-btn" type="button" data-action="inbox-open-today" data-inbox-id="${currentItem.id}">На сегодня</button>
                <button class="text-btn" type="button" data-action="inbox-open-week" data-inbox-id="${currentItem.id}">В план</button>
                <button class="text-btn" type="button" data-action="inbox-move-deferred" data-inbox-id="${currentItem.id}">На потом</button>
                <button class="text-btn" type="button" data-action="inbox-to-resource" data-inbox-id="${currentItem.id}">В ресурсы</button>
                <button class="text-btn" type="button" data-action="inbox-breakdown" data-inbox-id="${currentItem.id}">Разбить</button>
                <button class="delete-btn" title="Удалить" data-action="inbox-delete" data-inbox-id="${currentItem.id}">&times;</button>
            </div>
            ${isPendingToday ? `
                <div class="inbox-action-config">
                    <select data-action="inbox-update-weight" data-inbox-id="${currentItem.id}">
                        ${[5, 10, 20, 30, 50].map((weight) => `<option value="${weight}" ${Number(inbox.pendingAction.weight) === weight ? "selected" : ""}>${weight}</option>`).join("")}
                    </select>
                    <button class="task-breakdown-btn" type="button" data-action="inbox-confirm-today" data-inbox-id="${currentItem.id}">Добавить</button>
                    <button class="text-btn" type="button" data-action="inbox-cancel-action" data-inbox-id="${currentItem.id}">Отмена</button>
                </div>
            ` : ""}
            ${isPendingWeek ? `
                <div class="inbox-action-config">
                    <select data-action="inbox-update-date" data-inbox-id="${currentItem.id}">
                        ${getInboxSortDates().map((date) => `<option value="${date}" ${inbox.pendingAction.date === date ? "selected" : ""}>${formatVoiceDateLabel(date)}</option>`).join("")}
                    </select>
                    <select data-action="inbox-update-weight" data-inbox-id="${currentItem.id}">
                        ${[5, 10, 20, 30, 50].map((weight) => `<option value="${weight}" ${Number(inbox.pendingAction.weight) === weight ? "selected" : ""}>${weight}</option>`).join("")}
                    </select>
                    <button class="task-breakdown-btn" type="button" data-action="inbox-confirm-week" data-inbox-id="${currentItem.id}">Добавить</button>
                    <button class="text-btn" type="button" data-action="inbox-cancel-action" data-inbox-id="${currentItem.id}">Отмена</button>
                </div>
            ` : ""}
        `;
    }
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
    function renderLowEnergyPanel(state, todayTasks, isSosView) {
      var _a, _b;
      const isLowEnergyDay = ((_a = state.currentDayMeta) == null ? void 0 : _a.date) === getLocalDateString() && ((_b = state.currentDayMeta) == null ? void 0 : _b.lowEnergyDayApplied);
      elements.lowEnergyDayPanel.classList.toggle("hidden", !isLowEnergyDay || isSosView);
      if (!isLowEnergyDay || isSosView) {
        elements.lowEnergyKeptCard.classList.add("hidden");
        elements.lowEnergyResourceCard.classList.add("hidden");
        return;
      }
      const keptTask = state.currentDayMeta.lowEnergyKeptTaskId ? todayTasks.find((task) => task.id === state.currentDayMeta.lowEnergyKeptTaskId) || null : null;
      const resourceTask = state.currentDayMeta.lowEnergyResourceTaskId ? todayTasks.find((task) => task.id === state.currentDayMeta.lowEnergyResourceTaskId) || null : null;
      const swapCandidates = getLowEnergySwapCandidates(state);
      elements.lowEnergyKeptCard.classList.toggle("hidden", !keptTask);
      elements.lowEnergyResourceCard.classList.toggle("hidden", !resourceTask);
      elements.openLowEnergySwapBtn.disabled = swapCandidates.length === 0;
      elements.changeLowEnergyResourceBtn.disabled = !resourceTask;
      if (keptTask) {
        elements.lowEnergyKeptText.textContent = keptTask.text;
      }
      if (resourceTask) {
        elements.lowEnergyResourceText.textContent = resourceTask.text;
      }
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
        var _a2;
        const editTaskState = ((_a2 = runtime.editTask) == null ? void 0 : _a2.taskId) === task.id ? runtime.editTask : null;
        const taskEl = renderTaskElement(task, editTaskState);
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
      renderLowEnergyPanel(state, todayTasks, isSosView);
      renderInboxUi();
      renderPersistenceStatus();
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
        elements.voiceStatus.classList.add("hidden");
        renderVoiceUi();
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
      renderVoiceUi();
    }
    function renderArchive() {
      const deferredTasks = getDeferredTasks(store.getState());
      elements.archiveList.innerHTML = "";
      if (deferredTasks.length === 0) {
        elements.archiveList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 16px;">Пока ничего не отложено</div>';
        return;
      }
      deferredTasks.forEach((task) => {
        var _a;
        if (((_a = runtime.editTask) == null ? void 0 : _a.taskId) === task.id) {
          elements.archiveList.appendChild(renderTaskElement(task, runtime.editTask));
          return;
        }
        const taskEl = document.createElement("div");
        taskEl.className = "task-item";
        taskEl.dataset.taskId = task.id;
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
        var _a;
        if (((_a = runtime.editTask) == null ? void 0 : _a.taskId) === task.id) {
          elements.completedList.appendChild(renderTaskElement(task, runtime.editTask));
          return;
        }
        const taskEl = document.createElement("div");
        taskEl.className = "task-item completed";
        taskEl.dataset.taskId = task.id;
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
          var _a;
          if (((_a = runtime.editTask) == null ? void 0 : _a.taskId) === task.id) {
            const taskEl2 = document.createElement("div");
            taskEl2.className = "weekly-task editing";
            taskEl2.dataset.taskId = task.id;
            taskEl2.innerHTML = renderInlineTaskEditor(task, runtime.editTask);
            tasksContainer.appendChild(taskEl2);
            return;
          }
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
        const dailyStatus = template.autoAddDaily ? "Каждый день" : "Только вручную";
        const toggleLabel = template.autoAddDaily ? "Выключить ежедневность" : "Включить каждый день";
        const block = document.createElement("div");
        block.className = "template-block";
        block.innerHTML = `
                <div class="template-header">
                    <div class="template-title-group">
                        <h4>${escapeHtml(template.name)}</h4>
                        <div class="template-meta-row">
                            <span class="template-status-pill ${template.autoAddDaily ? "is-active" : ""}">${dailyStatus}</span>
                            <button class="text-btn template-toggle-btn" type="button" data-action="toggle-template-daily" data-template-id="${template.id}">${toggleLabel}</button>
                        </div>
                    </div>
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
    function renderLowEnergySwapModal() {
      const candidates = getLowEnergySwapCandidates(store.getState());
      elements.lowEnergySwapList.innerHTML = "";
      if (candidates.length === 0) {
        elements.lowEnergySwapList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 16px;">Пока нет других лёгких задач, которые можно вернуть на сегодня.</div>';
        return;
      }
      candidates.forEach((task) => {
        const item = document.createElement("div");
        item.className = "task-item";
        item.innerHTML = `
                <div class="task-desc">${escapeHtml(task.text)}</div>
                <div class="task-weight">Вес: ${task.weight}</div>
                <button class="postpone-btn" title="Оставить на сегодня" data-action="choose-low-energy-task" data-task-id="${task.id}">☀️</button>
            `;
        elements.lowEnergySwapList.appendChild(item);
      });
    }
    function renderVoiceModal() {
      const state = store.getState();
      const voice = runtime.voice;
      const isDraftMode = voice.modalMode === "draft" && voice.voiceDraft.length > 0;
      const tomorrow = /* @__PURE__ */ new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateOptions = [getLocalDateString(), getLocalDateString(tomorrow)];
      elements.voiceHelperAvatar.src = state.avatar;
      elements.voiceDraftList.innerHTML = "";
      elements.voiceEmptyState.classList.toggle("hidden", isDraftMode);
      elements.voiceConfirmBtn.classList.toggle("hidden", !isDraftMode);
      if (!isDraftMode) {
        elements.voiceModalTitle.textContent = "Голосовой ввод";
        elements.voiceModalSubtitle.textContent = voice.voiceError || "Пока не получилось подготовить черновик.";
        elements.voiceEmptyState.textContent = voice.voiceError || "Можно попробовать ещё раз или добавить задачу текстом.";
        return;
      }
      elements.voiceModalTitle.textContent = "Проверим, что получилось?";
      elements.voiceModalSubtitle.textContent = "Вот что я записал. Можно спокойно поправить перед добавлением.";
      voice.voiceDraft.forEach((draft) => {
        const row = document.createElement("div");
        row.className = "voice-draft-item";
        row.innerHTML = `
                <input class="voice-draft-input" type="text" value="${escapeHtml(draft.text)}" data-action="voice-update-text" data-draft-id="${draft.id}">
                <select class="voice-draft-select" data-action="voice-update-weight" data-draft-id="${draft.id}">
                    ${[5, 10, 20, 30, 50].map((weight) => `<option value="${weight}" ${draft.suggestedWeight === weight ? "selected" : ""}>${weight}</option>`).join("")}
                </select>
                <select class="voice-draft-select" data-action="voice-update-date" data-draft-id="${draft.id}">
                    ${[draft.suggestedDate, ...dateOptions].filter((value, index, array) => array.indexOf(value) === index).map((date) => `<option value="${date}" ${draft.suggestedDate === date ? "selected" : ""}>${formatVoiceDateLabel(date)}</option>`).join("")}
                </select>
                <button class="delete-btn" title="Удалить" data-action="voice-remove-draft" data-draft-id="${draft.id}">&times;</button>
            `;
        elements.voiceDraftList.appendChild(row);
      });
    }
    function renderBreakdownEditorModal() {
      const { breakdown } = runtime;
      const state = store.getState();
      const task = breakdown.taskId ? state.tasks.find((item) => item.id === breakdown.taskId) : null;
      const parentTask = (task == null ? void 0 : task.isBreakdownStep) ? getTaskBreakdownParent(state, task) : null;
      const sourceTask = parentTask || task || (breakdown.sourceText ? { text: breakdown.sourceText } : null);
      const isSuggested = breakdown.mode === "suggested";
      elements.breakdownDraftList.innerHTML = "";
      elements.breakdownEditorTitle.textContent = isSuggested ? "Проверим маленькие шаги?" : "Соберём три маленьких шага";
      elements.breakdownEditorSubtitle.textContent = sourceTask ? `Для задачи «${sourceTask.text}» оставим только три посильных шага по 5 или 10.` : "Оставим только три посильных шага по 5 или 10.";
      breakdown.drafts.forEach((draft) => {
        var _a;
        const row = document.createElement("div");
        row.className = "voice-draft-item";
        row.innerHTML = `
                <input class="voice-draft-input" type="text" value="${escapeHtml(draft.text)}" data-action="breakdown-update-text" data-draft-id="${draft.id}">
                <select class="voice-draft-select" data-action="breakdown-update-weight" data-draft-id="${draft.id}">
                    ${[5, 10].map((weight) => `<option value="${weight}" ${draft.weight === weight ? "selected" : ""}>${weight}</option>`).join("")}
                </select>
                <div class="breakdown-draft-note">Шаг ${((_a = draft.index) != null ? _a : 0) + 1} из ${breakdown.drafts.length || 3}</div>
                <div class="breakdown-draft-spacer"></div>
            `;
        elements.breakdownDraftList.appendChild(row);
      });
      elements.breakdownConfirmBtn.disabled = breakdown.drafts.some((draft) => !draft.text.trim());
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
      renderPersistenceStatus,
      renderInboxUi,
      renderInboxVoiceModal,
      renderInboxSortModal,
      renderArchive,
      renderCompleted,
      renderHistoryScreen,
      renderWeeklyScreen,
      renderResources,
      renderTemplates,
      renderLowEnergySwapModal,
      renderBreakdownEditorModal,
      renderVoiceModal,
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
      elements.templatesModal.classList.add("hidden");
      elements.templateAutoModal.classList.add("hidden");
      elements.breakdownIntroModal.classList.add("hidden");
      elements.breakdownEditorModal.classList.add("hidden");
      elements.lowEnergyModal.classList.add("hidden");
      elements.lowEnergySwapModal.classList.add("hidden");
      elements.voiceModal.classList.add("hidden");
      elements.inboxVoiceModal.classList.add("hidden");
      elements.inboxSortModal.classList.add("hidden");
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

  // js/domain/voice-parser.js
  function getTomorrowDate(today = getLocalDateString()) {
    const tomorrow = parseLocalDate(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getLocalDateString(tomorrow);
  }
  function cleanupTaskText(text) {
    return text.replace(/^\s*(и\s+)?(еще|ещё)\s+/i, "").replace(/^\s*(а\s+)?(еще|ещё)\s+/i, "").replace(/^\s*(нужно|надо|потом|затем)\s+/i, "").replace(/\s+/g, " ").trim().replace(/^[,.;:\-]+/, "").trim();
  }
  function splitTranscriptIntoParts(transcript) {
    const prepared = transcript.replace(/\s+/g, " ").replace(/\s+(а еще|а ещё|и еще|и ещё|потом|затем)\s+/gi, " | ").replace(/[;\n]+/g, " | ").replace(/,\s+(?=(надо|нужно|завтра|купить|забрать|помыть|написать|ответить|позвонить|сходить|убраться|разобрать))/gi, " | ");
    const parts = prepared.split("|").map((part) => cleanupTaskText(part)).filter(Boolean);
    return parts.length > 0 ? parts : [cleanupTaskText(transcript)].filter(Boolean);
  }
  function createInboxDraft(text, index = 0) {
    return {
      id: `inbox_draft_${Date.now()}_${index}_${Math.floor(Math.random() * 1e5)}`,
      text
    };
  }
  function suggestWeight(text) {
    const normalized = text.toLowerCase();
    if (/(глыба|сил нет|тяжело|тяжёло|разобрать документы|убраться|разобрать|документы)/.test(normalized)) {
      return 50;
    }
    if (/(разобрать|убраться|оформить|договориться|договорится|съездить|сходить|забрать|купить|помыть)/.test(normalized)) {
      return 20;
    }
    if (/(написать|ответить|позвонить|проверить|спросить|уточнить)/.test(normalized)) {
      return 10;
    }
    return 20;
  }
  function suggestDate(text, today) {
    if (/завтра/i.test(text)) {
      return getTomorrowDate(today);
    }
    return today;
  }
  function parseVoiceTranscript(transcript, today = getLocalDateString()) {
    const normalizedTranscript = String(transcript || "").replace(/\s+/g, " ").trim();
    if (!normalizedTranscript) {
      return [];
    }
    return splitTranscriptIntoParts(normalizedTranscript).map((part, index) => {
      const text = cleanupTaskText(part);
      if (!text) {
        return null;
      }
      return {
        id: `voice_draft_${Date.now()}_${index}_${Math.floor(Math.random() * 1e5)}`,
        text,
        suggestedWeight: suggestWeight(text),
        suggestedDate: suggestDate(text, today),
        isResource: false
      };
    }).filter(Boolean);
  }
  function parseInboxTranscript(transcript) {
    const normalizedTranscript = String(transcript || "").replace(/\s+/g, " ").trim();
    if (!normalizedTranscript) {
      return [];
    }
    return splitTranscriptIntoParts(normalizedTranscript).map((part, index) => cleanupTaskText(part)).filter(Boolean).map((text, index) => createInboxDraft(text, index));
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
  function addAllTemplateTasksToDay(store, templateId, targetDate = getLocalDateString()) {
    const state = store.getState();
    const template = state.templates.find((item) => item.id === templateId);
    if (!template) {
      return { template: null, addedCount: 0 };
    }
    let addedCount = 0;
    template.tasks.forEach((task) => {
      addTask(store, {
        text: task.text,
        weight: task.weight,
        isResource: false,
        targetDate
      });
      addedCount += 1;
    });
    return { template, addedCount };
  }
  function setTemplateDailyPreference(store, {
    templateId,
    autoAddDaily,
    hasAskedAutoAdd = true,
    lastAutoAddedDate = null
  }) {
    let updatedTemplate = null;
    store.updateState((state) => {
      const template = state.templates.find((item) => item.id === templateId);
      if (!template) return;
      template.autoAddDaily = autoAddDaily;
      template.hasAskedAutoAdd = hasAskedAutoAdd;
      template.lastAutoAddedDate = autoAddDaily ? lastAutoAddedDate : null;
      updatedTemplate = { ...template };
    });
    return updatedTemplate;
  }
  function applyDailyTemplatesForDate(store, date = getLocalDateString()) {
    const templatesToApply = store.getState().templates.filter(
      (template) => template.autoAddDaily && template.lastAutoAddedDate !== date && Array.isArray(template.tasks) && template.tasks.length > 0
    );
    if (templatesToApply.length === 0) {
      return [];
    }
    templatesToApply.forEach((template) => {
      addAllTemplateTasksToDay(store, template.id, date);
    });
    store.updateState((state) => {
      state.templates.forEach((template) => {
        if (templatesToApply.some((item) => item.id === template.id)) {
          template.lastAutoAddedDate = date;
        }
      });
    });
    return templatesToApply.map((template) => template.id);
  }

  // js/services/voice-input.js
  function normalizeVoiceError(errorCode) {
    switch (errorCode) {
      case "not-allowed":
      case "service-not-allowed":
        return "Не получилось включить микрофон. Можно продолжить обычным вводом.";
      case "audio-capture":
        return "Микрофон сейчас недоступен. Попробуйте ещё раз чуть позже.";
      case "network":
        return "Голосовой ввод сейчас не смог обработать речь. Можно попробовать ещё раз.";
      case "no-speech":
        return "Я ничего не расслышал. Можно попробовать ещё раз в более тихой обстановке.";
      case "aborted":
        return "";
      default:
        return "Голосовой ввод сейчас недоступен. Можно добавить задачу текстом.";
    }
  }
  function createVoiceInputService({ locale = "ru-RU", onStart, onEnd, onError } = {}) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    let recognition = null;
    let latestTranscript = "";
    let isListening = false;
    let hasError = false;
    function isSupported() {
      return Boolean(Recognition);
    }
    function ensureRecognition() {
      if (!Recognition) {
        return null;
      }
      if (recognition) {
        return recognition;
      }
      recognition = new Recognition();
      recognition.lang = locale;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        latestTranscript = "";
        hasError = false;
        isListening = true;
        onStart == null ? void 0 : onStart();
      };
      recognition.onresult = (event) => {
        latestTranscript = Array.from(event.results).map((result) => {
          var _a;
          return ((_a = result[0]) == null ? void 0 : _a.transcript) || "";
        }).join(" ").trim();
      };
      recognition.onerror = (event) => {
        hasError = true;
        isListening = false;
        onError == null ? void 0 : onError(normalizeVoiceError(event.error), event.error);
      };
      recognition.onend = () => {
        const transcript = latestTranscript.trim();
        latestTranscript = "";
        isListening = false;
        onEnd == null ? void 0 : onEnd({ transcript, hadError: hasError });
        hasError = false;
      };
      return recognition;
    }
    function startListening() {
      const instance = ensureRecognition();
      if (!instance || isListening) {
        return false;
      }
      try {
        instance.start();
        return true;
      } catch (error) {
        onError == null ? void 0 : onError("Голосовой ввод пока не удалось запустить. Можно попробовать ещё раз.", "start-failed");
        return false;
      }
    }
    function stopListening() {
      if (!recognition || !isListening) {
        return false;
      }
      recognition.stop();
      return true;
    }
    return {
      isSupported,
      startListening,
      stopListening
    };
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
  function createBreakdownDraft(text = "", weight = 5, index = 0) {
    return {
      id: `breakdown_draft_${Date.now()}_${index}_${Math.floor(Math.random() * 1e5)}`,
      text,
      weight: weight === 10 ? 10 : 5,
      index
    };
  }
  function buildManualBreakdownDrafts() {
    return [0, 1, 2].map((index) => createBreakdownDraft("", 5, index));
  }
  function capitalizeBreakdownStep(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  function looksLikeActionPhrase(text) {
    const firstWord = String(text || "").trim().split(/\s+/)[0] || "";
    return ["ть", "ти", "чь"].some((ending) => firstWord.toLowerCase().endsWith(ending));
  }
  function splitCompoundTaskText(taskText) {
    const normalized = String(taskText || "").trim();
    const directParts = normalized.split(/[\n,;]+/).map((part) => part.trim()).filter(Boolean);
    if (directParts.length > 1) {
      return directParts;
    }
    const andParts = normalized.split(/\s+?\s+/i).map((part) => part.trim()).filter(Boolean);
    if (andParts.length > 1 && andParts.every(looksLikeActionPhrase)) {
      return andParts;
    }
    return [normalized];
  }
  function buildCompactSuggestedBreakdownDrafts(taskText) {
    const normalized = String(taskText || "").trim();
    const lower = normalized.toLowerCase();
    const compoundParts = splitCompoundTaskText(normalized);
    let suggestions;
    if (compoundParts.length > 1) {
      suggestions = compoundParts.slice(0, 3).map(capitalizeBreakdownStep);
    } else if (lower.includes("варить") && lower.includes("картошк")) {
      suggestions = [
        "Подготовить картошку и воду",
        "Поставить картошку вариться",
        "Проверить готовность и слить воду"
      ];
    } else if (lower.includes("мыть пол") || lower.includes("полы")) {
      suggestions = [
        "Подготовить воду или швабру",
        "Помыть одну зону",
        "Домыть остальное и убрать инвентарь"
      ];
    } else if (lower.includes("пылесос")) {
      suggestions = [
        "Достать пылесос",
        "Пропылесосить одну комнату",
        "Убрать пылесос на место"
      ];
    } else if (lower.includes("документ")) {
      suggestions = [
        "Открыть нужные документы",
        "Сделать первую часть",
        "Проверить и отправить"
      ];
    } else if (lower.includes("уборк") || lower.includes("прибрат")) {
      suggestions = [
        "Выбрать один участок",
        "Убрать его 10 минут",
        "Вернуть вещи по местам"
      ];
    } else if (lower.includes("звон") || lower.includes("позвон")) {
      suggestions = [
        "Открыть номер",
        "Сделать короткий звонок",
        "Записать итог"
      ];
    } else if (lower.includes("куп") || lower.includes("магаз")) {
      suggestions = [
        "Составить короткий список",
        "Сходить или открыть доставку",
        "Разложить покупки"
      ];
    } else if (lower.includes("врач") || lower.includes("поликлиник")) {
      suggestions = [
        "Найти контакты",
        "Сделать один звонок",
        "Записать дату или шаг"
      ];
    } else {
      suggestions = [
        "Начать с одного маленького кусочка",
        `Сделать часть: ${normalized}`,
        "Закрыть и проверить"
      ];
    }
    return suggestions.slice(0, 3).map((text, index) => createBreakdownDraft(text, index === 1 ? 10 : 5, index));
  }
  function bindAppEvents(app) {
    var _a;
    const { elements, store, runtime } = app;
    const voiceState = runtime.voice;
    const inboxState = runtime.inbox;
    const breakdownState = runtime.breakdown;
    const editTaskState = runtime.editTask;
    const templateAutoPrompt = runtime.templateAutoPrompt;
    const LOW_ENERGY_TEMPLATE_ID = "tpl_4";
    const breakdownRememberLabel = (_a = elements.breakdownRememberRow) == null ? void 0 : _a.querySelector("span");
    if (breakdownRememberLabel) {
      breakdownRememberLabel.textContent = "Больше не показывать";
    }
    elements.breakdownManualBtn.textContent = "Не сейчас";
    elements.breakdownSuggestedBtn.textContent = "Помоги разбить";
    function closeVoiceModal({ resetDraft = true } = {}) {
      elements.voiceModal.classList.add("hidden");
      voiceState.modalMode = "hidden";
      if (resetDraft) {
        voiceState.voiceDraft = [];
        voiceState.lastTranscript = "";
      }
    }
    function closeInboxVoiceModal({ resetDraft = true } = {}) {
      elements.inboxVoiceModal.classList.add("hidden");
      inboxState.modalMode = "hidden";
      if (resetDraft) {
        inboxState.drafts = [];
      }
    }
    function openInboxVoiceMessage(message) {
      inboxState.isListening = false;
      inboxState.isProcessing = false;
      inboxState.drafts = [];
      inboxState.error = message;
      inboxState.modalMode = "message";
      app.renderers.renderMainScreen();
      app.renderers.renderInboxVoiceModal();
      elements.inboxVoiceModal.classList.remove("hidden");
    }
    function openInboxDraftModal(drafts) {
      inboxState.isListening = false;
      inboxState.isProcessing = false;
      inboxState.drafts = drafts;
      inboxState.error = "";
      inboxState.modalMode = "draft";
      app.renderers.renderMainScreen();
      app.renderers.renderInboxVoiceModal();
      elements.inboxVoiceModal.classList.remove("hidden");
    }
    function closeInboxSortModal() {
      elements.inboxSortModal.classList.add("hidden");
      inboxState.sortMode = "idle";
      inboxState.pendingAction = { itemId: null, mode: null, weight: 20, date: getLocalDateString() };
    }
    function openVoiceMessage(message) {
      voiceState.isListening = false;
      voiceState.isProcessing = false;
      voiceState.voiceDraft = [];
      voiceState.voiceError = message;
      voiceState.modalMode = "message";
      app.renderers.renderMainScreen();
      app.renderers.renderVoiceModal();
      elements.voiceModal.classList.remove("hidden");
    }
    function openVoiceDraftModal(drafts, transcript) {
      voiceState.isListening = false;
      voiceState.isProcessing = false;
      voiceState.lastTranscript = transcript;
      voiceState.voiceDraft = drafts;
      voiceState.voiceError = "";
      voiceState.modalMode = "draft";
      app.renderers.renderMainScreen();
      app.renderers.renderVoiceModal();
      elements.voiceModal.classList.remove("hidden");
    }
    function closeTemplateAutoModal() {
      templateAutoPrompt.templateId = null;
      elements.templateAutoModal.classList.add("hidden");
    }
    function closeBreakdownIntroModal({ preserveTask = false } = {}) {
      elements.breakdownIntroModal.classList.add("hidden");
      if (!preserveTask) {
        breakdownState.taskId = null;
        breakdownState.sourceInboxId = null;
        breakdownState.sourceText = "";
      }
      elements.breakdownRememberChoice.checked = false;
      elements.breakdownRememberRow.classList.remove("hidden");
    }
    function closeBreakdownEditorModal({ reset = true } = {}) {
      elements.breakdownEditorModal.classList.add("hidden");
      if (reset) {
        breakdownState.taskId = null;
        breakdownState.mode = "intro";
        breakdownState.drafts = [];
        breakdownState.sourceInboxId = null;
        breakdownState.sourceText = "";
        elements.breakdownRememberChoice.checked = false;
      }
    }
    function closeAppMenu() {
      elements.appMenuPopover.classList.add("hidden");
      elements.openAppMenuBtn.setAttribute("aria-expanded", "false");
    }
    function toggleAppMenu() {
      const shouldOpen = elements.appMenuPopover.classList.contains("hidden");
      elements.appMenuPopover.classList.toggle("hidden", !shouldOpen);
      elements.openAppMenuBtn.setAttribute("aria-expanded", String(shouldOpen));
    }
    function stopInlineEdit() {
      editTaskState.taskId = null;
      editTaskState.text = "";
      editTaskState.weight = 20;
      editTaskState.isResource = false;
    }
    function startInlineEdit(taskId) {
      const task = store.getState().tasks.find((item) => item.id === taskId);
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
      store.updateState((state) => {
        state.preferences.breakDownLargeTasksPromptMode = "skip-intro-ask";
      });
    }
    function openBreakdownEditor(taskId, mode) {
      const task = store.getState().tasks.find((item) => item.id === taskId);
      if (!task) return;
      breakdownState.taskId = taskId;
      breakdownState.sourceInboxId = null;
      breakdownState.sourceText = task.text;
      breakdownState.mode = mode;
      breakdownState.drafts = mode === "suggested" ? buildCompactSuggestedBreakdownDrafts(task.text) : buildManualBreakdownDrafts();
      closeBreakdownIntroModal({ preserveTask: true });
      app.renderers.renderBreakdownEditorModal();
      elements.breakdownEditorModal.classList.remove("hidden");
    }
    function openBreakdownFlow(taskId) {
      var _a2;
      const task = store.getState().tasks.find((item) => item.id === taskId);
      if (!task) return;
      breakdownState.taskId = taskId;
      breakdownState.sourceInboxId = null;
      breakdownState.sourceText = task.text;
      const shouldSkipIntro = ((_a2 = store.getState().preferences) == null ? void 0 : _a2.breakDownLargeTasksPromptMode) === "skip-intro-ask";
      if (shouldSkipIntro) {
        openBreakdownEditor(taskId, "suggested");
        return;
      }
      elements.breakdownIntroText.textContent = "Задача выглядит тяжеловато. Давай превратим ее в маленькие шаги?";
      elements.breakdownRememberRow.classList.remove("hidden");
      elements.breakdownRememberChoice.checked = false;
      elements.breakdownIntroModal.classList.remove("hidden");
    }
    elements.openAppMenuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleAppMenu();
    });
    elements.appMenuPopover.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    document.addEventListener("click", (event) => {
      if (elements.appMenuPopover.classList.contains("hidden")) {
        return;
      }
      if (elements.openAppMenuBtn.contains(event.target) || elements.appMenuPopover.contains(event.target)) {
        return;
      }
      closeAppMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAppMenu();
      }
    });
    function openBreakdownFromInbox(itemId) {
      var _a2;
      const item = store.getState().inboxItems.find((entry) => entry.id === itemId);
      if (!item) return;
      breakdownState.taskId = null;
      breakdownState.sourceInboxId = itemId;
      breakdownState.sourceText = item.text;
      const shouldSkipIntro = ((_a2 = store.getState().preferences) == null ? void 0 : _a2.breakDownLargeTasksPromptMode) === "skip-intro-ask";
      if (shouldSkipIntro) {
        breakdownState.mode = "suggested";
        breakdownState.drafts = buildCompactSuggestedBreakdownDrafts(item.text);
        app.renderers.renderBreakdownEditorModal();
        elements.breakdownEditorModal.classList.remove("hidden");
        return;
      }
      elements.breakdownIntroText.textContent = "Мысль выглядит большой. Давай превратим ее в маленькие шаги?";
      elements.breakdownRememberRow.classList.remove("hidden");
      elements.breakdownRememberChoice.checked = false;
      elements.breakdownIntroModal.classList.remove("hidden");
    }
    function openTemplateAutoModal(templateId) {
      const template = store.getState().templates.find((item) => item.id === templateId);
      if (!template) return;
      templateAutoPrompt.templateId = templateId;
      elements.templateAutoTemplateName.textContent = template.name;
      elements.templateAutoModal.classList.remove("hidden");
    }
    function shouldOfferLowEnergyDay2(energyBudget, state = store.getState()) {
      var _a2;
      return energyBudget >= 10 && energyBudget <= 15 && ((_a2 = state.currentDayMeta) == null ? void 0 : _a2.date) === getLocalDateString() && !state.currentDayMeta.lowEnergyPromptHandled;
    }
    function closeLowEnergyModal() {
      elements.lowEnergyModal.classList.add("hidden");
    }
    function openLowEnergyModal() {
      const state = store.getState();
      elements.lowEnergyAvatar.src = state.avatar;
      elements.lowEnergyModal.classList.remove("hidden");
    }
    function finalizeLowEnergyDecline() {
      store.updateState((state) => {
        state.currentDayMeta = {
          ...state.currentDayMeta,
          date: getLocalDateString(),
          lowEnergyPromptHandled: true,
          lowEnergyDayApplied: false,
          lowEnergyKeptTaskId: null,
          lowEnergyResourceId: null,
          lowEnergyResourceTaskId: null
        };
      });
      closeLowEnergyModal();
      app.screens.showMainScreen();
    }
    function finalizeLowEnergyAcceptance() {
      const today = getLocalDateString();
      applyLowEnergyDay(store, today);
      addAllTemplateTasksToDay(store, LOW_ENERGY_TEMPLATE_ID, today);
      assignLowEnergyResource(store, { today });
      closeLowEnergyModal();
      app.screens.showMainScreen();
      app.renderers.renderArchive();
      app.renderers.renderWeeklyScreen();
    }
    function closeLowEnergySwapModal() {
      elements.lowEnergySwapModal.classList.add("hidden");
    }
    const voiceService = createVoiceInputService({
      locale: "ru-RU",
      onStart: () => {
        voiceState.isListening = true;
        voiceState.isProcessing = false;
        voiceState.voiceError = "";
        app.renderers.renderMainScreen();
      },
      onEnd: ({ transcript, hadError }) => {
        voiceState.isListening = false;
        if (hadError) {
          app.renderers.renderMainScreen();
          return;
        }
        if (!transcript) {
          voiceState.voiceError = "Я ничего не расслышал. Можно попробовать ещё раз.";
          app.renderers.renderMainScreen();
          return;
        }
        voiceState.isProcessing = true;
        voiceState.lastTranscript = transcript;
        app.renderers.renderMainScreen();
        const drafts = parseVoiceTranscript(transcript, getLocalDateString());
        voiceState.isProcessing = false;
        if (drafts.length === 0) {
          openVoiceMessage("Не получилось собрать понятный черновик. Можно попробовать ещё раз или добавить задачу текстом.");
          return;
        }
        openVoiceDraftModal(drafts, transcript);
      },
      onError: (message) => {
        voiceState.isListening = false;
        voiceState.isProcessing = false;
        if (message) {
          openVoiceMessage(message);
        } else {
          app.renderers.renderMainScreen();
        }
      }
    });
    voiceState.isSupported = voiceService.isSupported();
    const inboxVoiceService = createVoiceInputService({
      locale: "ru-RU",
      onStart: () => {
        inboxState.isListening = true;
        inboxState.isProcessing = false;
        inboxState.error = "";
        app.renderers.renderMainScreen();
      },
      onEnd: ({ transcript, hadError }) => {
        inboxState.isListening = false;
        if (hadError) {
          app.renderers.renderMainScreen();
          return;
        }
        if (!transcript) {
          inboxState.error = "Я ничего не расслышал. Можно попробовать еще раз или записать мысль текстом.";
          app.renderers.renderMainScreen();
          return;
        }
        inboxState.isProcessing = true;
        app.renderers.renderMainScreen();
        const drafts = parseInboxTranscript(transcript);
        inboxState.isProcessing = false;
        if (drafts.length === 0) {
          openInboxVoiceMessage("Не получилось собрать понятный черновик мыслей. Можно попробовать еще раз или записать мысли текстом.");
          return;
        }
        openInboxDraftModal(drafts);
      },
      onError: (message) => {
        inboxState.isListening = false;
        inboxState.isProcessing = false;
        if (message) {
          openInboxVoiceMessage(message);
        } else {
          app.renderers.renderMainScreen();
        }
      }
    });
    inboxState.isSupported = inboxVoiceService.isSupported();
    [
      elements.weeklyTaskModal,
      elements.libraryModal,
      elements.archiveModal,
      elements.completedModal,
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
      elements.allDoneModal
    ].forEach((modal) => {
      modal.addEventListener("click", (event) => {
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
        modal.classList.add("hidden");
      });
    });
    bindSubmitOnEnter(elements.taskInput, elements.addTaskForm);
    bindSubmitOnEnter(elements.inboxInput, elements.addInboxForm);
    bindSubmitOnEnter(elements.resourceInput, elements.addResourceForm);
    bindSubmitOnEnter(elements.weeklyTaskText, elements.addWeeklyTaskForm);
    elements.energyInput.addEventListener("input", (event) => {
      elements.energyDisplay.textContent = event.target.value;
    });
    elements.startDayBtn.addEventListener("click", () => {
      const energyBudget = parseInt(elements.energyInput.value, 10);
      store.updateState((state) => {
        state.energyBudget = energyBudget;
        state.lastDate = getLocalDateString();
        state.currentDayMeta = createCurrentDayMeta(state.lastDate);
      });
      applyDailyTemplatesForDate(store, getLocalDateString());
      runtime.sosView = null;
      if (shouldOfferLowEnergyDay2(energyBudget)) {
        app.screens.showMainScreen();
        openLowEnergyModal();
        return;
      }
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
    elements.closeVoiceBtn.addEventListener("click", () => {
      closeVoiceModal();
      app.renderers.renderMainScreen();
    });
    elements.voiceCancelBtn.addEventListener("click", () => {
      closeVoiceModal();
      app.renderers.renderMainScreen();
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
    function resetInboxPendingAction() {
      inboxState.pendingAction = {
        itemId: null,
        mode: null,
        weight: 20,
        date: getLocalDateString()
      };
    }
    function openInboxPendingAction(itemId, mode) {
      inboxState.pendingAction = {
        itemId,
        mode,
        weight: 20,
        date: getLocalDateString()
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
        weight: parseInt(editTaskState.weight, 10)
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
      if (!input || event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      if (editTaskState.taskId !== input.dataset.taskId) return;
      saveInlineEdit();
    }
    function handleInboxAction(action, itemId) {
      if (!itemId) return;
      if (action === "inbox-open-today") {
        openInboxPendingAction(itemId, "today");
        renderInboxViews();
        return;
      }
      if (action === "inbox-open-week") {
        openInboxPendingAction(itemId, "week");
        renderInboxViews();
        return;
      }
      if (action === "inbox-cancel-action") {
        resetInboxPendingAction();
        renderInboxViews();
        return;
      }
      if (action === "inbox-confirm-today") {
        convertInboxItemToToday(store, {
          itemId,
          weight: parseInt(inboxState.pendingAction.weight, 10) || 20
        });
        resetInboxPendingAction();
        renderAllTaskViews();
        app.renderers.renderInboxSortModal();
        return;
      }
      if (action === "inbox-confirm-week") {
        convertInboxItemToDate(store, {
          itemId,
          dateStr: inboxState.pendingAction.date || getLocalDateString(),
          weight: parseInt(inboxState.pendingAction.weight, 10) || 20
        });
        resetInboxPendingAction();
        renderAllTaskViews();
        app.renderers.renderInboxSortModal();
        return;
      }
      if (action === "inbox-move-deferred") {
        convertInboxItemToDeferred(store, itemId);
        resetInboxPendingAction();
        renderAllTaskViews();
        app.renderers.renderInboxSortModal();
        return;
      }
      if (action === "inbox-to-resource") {
        convertInboxItemToResource(store, itemId);
        resetInboxPendingAction();
        renderInboxViews();
        app.renderers.renderResources();
        return;
      }
      if (action === "inbox-breakdown") {
        openBreakdownFromInbox(itemId);
        resetInboxPendingAction();
        app.renderers.renderInboxSortModal();
        return;
      }
      if (action === "inbox-delete") {
        deleteInboxItem(store, itemId);
        resetInboxPendingAction();
        renderInboxViews();
      }
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
    elements.openVoiceBtn.addEventListener("click", () => {
      if (!voiceState.isSupported) {
        openVoiceMessage("Голосовой ввод в этом браузере пока недоступен. Можно продолжить обычным текстовым вводом.");
        return;
      }
      if (voiceState.isListening) {
        voiceService.stopListening();
        return;
      }
      voiceState.voiceError = "";
      closeVoiceModal();
      app.renderers.renderMainScreen();
      voiceService.startListening();
    });
    elements.addInboxForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const items = splitInboxText(elements.inboxInput.value);
      if (items.length === 0) return;
      addInboxItems(store, items);
      elements.inboxInput.value = "";
      renderInboxViews();
    });
    elements.openInboxVoiceBtn.addEventListener("click", () => {
      if (!inboxState.isSupported) {
        openInboxVoiceMessage("Голосовой ввод в этом браузере пока недоступен. Можно продолжить обычным текстовым вводом.");
        return;
      }
      if (inboxState.isListening) {
        inboxVoiceService.stopListening();
        return;
      }
      inboxState.error = "";
      closeInboxVoiceModal();
      app.renderers.renderMainScreen();
      inboxVoiceService.startListening();
    });
    elements.closeInboxVoiceBtn.addEventListener("click", () => {
      closeInboxVoiceModal();
      app.renderers.renderMainScreen();
    });
    elements.inboxVoiceCancelBtn.addEventListener("click", () => {
      closeInboxVoiceModal();
      app.renderers.renderMainScreen();
    });
    elements.inboxVoiceConfirmBtn.addEventListener("click", () => {
      const drafts = inboxState.drafts.map((draft) => draft.text.trim()).filter(Boolean);
      if (drafts.length === 0) {
        openInboxVoiceMessage("В черновике пока нет мыслей, которые можно сохранить.");
        return;
      }
      addInboxItems(store, drafts);
      closeInboxVoiceModal();
      renderInboxViews();
    });
    elements.openInboxSortBtn.addEventListener("click", () => {
      inboxState.sortMode = "single";
      resetInboxPendingAction();
      app.renderers.renderInboxSortModal();
      elements.inboxSortModal.classList.remove("hidden");
    });
    elements.closeInboxSortBtn.addEventListener("click", closeInboxSortModal);
    elements.clearInboxBtn.addEventListener("click", () => {
      const inboxItems = store.getState().inboxItems || [];
      if (inboxItems.length === 0) return;
      const shouldClear = window.confirm("Очистить все Облако мыслей? Это удалит все сохраненные мысли.");
      if (!shouldClear) return;
      clearInboxItems(store);
      closeInboxSortModal();
      renderInboxViews();
    });
    elements.openLibraryBtn.addEventListener("click", () => {
      closeAppMenu();
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
          ...state.currentDayMeta,
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
          ...state.currentDayMeta,
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
      closeAppMenu();
      app.renderers.renderArchive();
      elements.completedModal.classList.add("hidden");
      elements.archiveModal.classList.remove("hidden");
    });
    elements.openCompletedBtn.addEventListener("click", () => {
      closeAppMenu();
      app.renderers.renderCompleted();
      elements.archiveModal.classList.add("hidden");
      elements.completedModal.classList.remove("hidden");
    });
    elements.openHistoryBtn.addEventListener("click", () => {
      closeAppMenu();
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
    elements.voiceConfirmBtn.addEventListener("click", () => {
      const draftsToAdd = voiceState.voiceDraft.map((draft) => ({
        text: draft.text.trim(),
        weight: parseInt(draft.suggestedWeight, 10),
        targetDate: draft.suggestedDate
      })).filter((draft) => draft.text);
      if (draftsToAdd.length === 0) {
        openVoiceMessage("В черновике пока нет задач, которые можно добавить.");
        return;
      }
      draftsToAdd.forEach((draft) => {
        addTask(store, {
          text: draft.text,
          weight: draft.weight,
          isResource: false,
          targetDate: draft.targetDate
        });
      });
      closeVoiceModal();
      app.renderers.renderMainScreen();
      app.renderers.renderWeeklyScreen();
    });
    elements.openWeeklyBtn.addEventListener("click", () => {
      closeAppMenu();
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
    elements.closeTemplateAutoBtn.addEventListener("click", closeTemplateAutoModal);
    elements.templateAutoYesBtn.addEventListener("click", () => {
      if (!templateAutoPrompt.templateId) return;
      setTemplateDailyPreference(store, {
        templateId: templateAutoPrompt.templateId,
        autoAddDaily: true,
        hasAskedAutoAdd: true,
        lastAutoAddedDate: getLocalDateString()
      });
      closeTemplateAutoModal();
      app.renderers.renderTemplates();
      app.renderers.renderMainScreen();
    });
    elements.templateAutoNoBtn.addEventListener("click", () => {
      if (!templateAutoPrompt.templateId) return;
      setTemplateDailyPreference(store, {
        templateId: templateAutoPrompt.templateId,
        autoAddDaily: false,
        hasAskedAutoAdd: true,
        lastAutoAddedDate: null
      });
      closeTemplateAutoModal();
      app.renderers.renderTemplates();
    });
    elements.closeBreakdownIntroBtn.addEventListener("click", closeBreakdownIntroModal);
    elements.closeBreakdownEditorBtn.addEventListener("click", () => closeBreakdownEditorModal());
    elements.breakdownCancelBtn.addEventListener("click", () => closeBreakdownEditorModal());
    elements.breakdownManualBtn.addEventListener("click", () => {
      closeBreakdownIntroModal();
    });
    elements.breakdownSuggestedBtn.addEventListener("click", () => {
      applyBreakdownPreferenceIfNeeded();
      if (!breakdownState.taskId) return;
      openBreakdownEditor(breakdownState.taskId, "suggested");
    });
    elements.breakdownConfirmBtn.addEventListener("click", () => {
      const steps = breakdownState.drafts.map((draft) => ({
        text: draft.text.trim(),
        weight: draft.weight
      })).filter((step) => step.text);
      if (steps.length < 2) return;
      let breakdownTaskId = breakdownState.taskId;
      if (!breakdownTaskId && breakdownState.sourceInboxId && breakdownState.sourceText) {
        const createdTask = addTask(store, {
          text: breakdownState.sourceText,
          weight: 20,
          isResource: false,
          targetDate: getLocalDateString()
        });
        breakdownTaskId = (createdTask == null ? void 0 : createdTask.id) || null;
        if (!breakdownTaskId) return;
        deleteInboxItem(store, breakdownState.sourceInboxId);
      }
      if (!breakdownTaskId) return;
      const created = createTaskBreakdown(store, {
        taskId: breakdownTaskId,
        steps
      });
      if (!created) return;
      closeBreakdownEditorModal();
      app.renderers.renderMainScreen();
      app.renderers.renderInboxSortModal();
      app.renderers.renderArchive();
      app.renderers.renderWeeklyScreen();
    });
    elements.closeLowEnergyBtn.addEventListener("click", finalizeLowEnergyDecline);
    elements.lowEnergyDeclineBtn.addEventListener("click", finalizeLowEnergyDecline);
    elements.lowEnergyAcceptBtn.addEventListener("click", finalizeLowEnergyAcceptance);
    elements.openLowEnergySwapBtn.addEventListener("click", () => {
      app.renderers.renderLowEnergySwapModal();
      elements.lowEnergySwapModal.classList.remove("hidden");
    });
    elements.closeLowEnergySwapBtn.addEventListener("click", closeLowEnergySwapModal);
    elements.changeLowEnergyResourceBtn.addEventListener("click", () => {
      assignLowEnergyResource(store, { today: getLocalDateString(), cycle: true });
      app.renderers.renderMainScreen();
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
        if (target.dataset.action === "edit-save-task") {
          saveInlineEdit();
        } else if (target.dataset.action === "edit-cancel-task") {
          stopInlineEdit();
          renderAllTaskViews();
        } else if (target.dataset.action === "toggle-task") {
          const updatedTask = toggleTask(store, taskId);
          if (updatedTask == null ? void 0 : updatedTask.completed) {
            advanceBreakdownAfterCompletion(store, taskId);
          }
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
        } else if (target.dataset.action === "open-breakdown") {
          openBreakdownFlow(taskId);
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
      container.addEventListener("dblclick", (event) => {
        const task = event.target.closest(".task-item");
        if (!(task == null ? void 0 : task.dataset.taskId)) return;
        startInlineEdit(task.dataset.taskId);
        renderAllTaskViews();
        focusInlineEditor(task.dataset.taskId);
      });
      container.addEventListener("input", (event) => {
        const target = event.target.closest('[data-action="edit-update-text"]');
        if (!(target == null ? void 0 : target.dataset.taskId)) return;
        if (editTaskState.taskId !== target.dataset.taskId) return;
        editTaskState.text = target.value;
      });
      container.addEventListener("change", (event) => {
        const target = event.target.closest('[data-action="edit-update-weight"]');
        if (!(target == null ? void 0 : target.dataset.taskId)) return;
        if (editTaskState.taskId !== target.dataset.taskId) return;
        editTaskState.weight = parseInt(target.value, 10);
      });
      container.addEventListener("keydown", handleInlineEditEnter);
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
      if (target.dataset.action === "edit-save-task") {
        saveInlineEdit();
        return;
      }
      if (target.dataset.action === "edit-cancel-task") {
        stopInlineEdit();
        renderAllTaskViews();
        return;
      }
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
    elements.archiveList.addEventListener("dblclick", (event) => {
      const task = event.target.closest(".task-item");
      if (!(task == null ? void 0 : task.dataset.taskId)) return;
      startInlineEdit(task.dataset.taskId);
      renderAllTaskViews();
      focusInlineEditor(task.dataset.taskId);
    });
    elements.archiveList.addEventListener("input", (event) => {
      const target = event.target.closest('[data-action="edit-update-text"]');
      if (!(target == null ? void 0 : target.dataset.taskId) || editTaskState.taskId !== target.dataset.taskId) return;
      editTaskState.text = target.value;
    });
    elements.archiveList.addEventListener("change", (event) => {
      const target = event.target.closest('[data-action="edit-update-weight"]');
      if (!(target == null ? void 0 : target.dataset.taskId) || editTaskState.taskId !== target.dataset.taskId) return;
      editTaskState.weight = parseInt(target.value, 10);
    });
    elements.archiveList.addEventListener("keydown", handleInlineEditEnter);
    elements.lowEnergySwapList.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target || target.dataset.action !== "choose-low-energy-task") return;
      const taskId = target.dataset.taskId;
      if (!taskId) return;
      const swappedTask = swapLowEnergyKeptTask(store, { nextTaskId: taskId, today: getLocalDateString() });
      if (!swappedTask) return;
      closeLowEnergySwapModal();
      app.renderers.renderMainScreen();
      app.renderers.renderArchive();
      app.renderers.renderWeeklyScreen();
    });
    elements.completedList.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target) return;
      const taskId = target.dataset.taskId;
      if (!taskId) return;
      if (target.dataset.action === "edit-save-task") {
        saveInlineEdit();
        return;
      }
      if (target.dataset.action === "edit-cancel-task") {
        stopInlineEdit();
        renderAllTaskViews();
        return;
      }
      if (target.dataset.action !== "done-delete-task") return;
      deleteTask(store, taskId);
      app.renderers.renderCompleted();
    });
    elements.completedList.addEventListener("dblclick", (event) => {
      const task = event.target.closest(".task-item");
      if (!(task == null ? void 0 : task.dataset.taskId)) return;
      startInlineEdit(task.dataset.taskId);
      renderAllTaskViews();
      focusInlineEditor(task.dataset.taskId);
    });
    elements.completedList.addEventListener("input", (event) => {
      const target = event.target.closest('[data-action="edit-update-text"]');
      if (!(target == null ? void 0 : target.dataset.taskId) || editTaskState.taskId !== target.dataset.taskId) return;
      editTaskState.text = target.value;
    });
    elements.completedList.addEventListener("change", (event) => {
      const target = event.target.closest('[data-action="edit-update-weight"]');
      if (!(target == null ? void 0 : target.dataset.taskId) || editTaskState.taskId !== target.dataset.taskId) return;
      editTaskState.weight = parseInt(target.value, 10);
    });
    elements.completedList.addEventListener("keydown", handleInlineEditEnter);
    [elements.inboxList, elements.inboxSortCard].forEach((container) => {
      container.addEventListener("click", (event) => {
        const target = closestActionTarget(event.target);
        if (!target) return;
        handleInboxAction(target.dataset.action, target.dataset.inboxId);
      });
      container.addEventListener("change", (event) => {
        const target = event.target.closest("[data-action]");
        if (!target) return;
        if (target.dataset.action === "inbox-update-weight") {
          inboxState.pendingAction.weight = parseInt(target.value, 10) || 20;
          app.renderers.renderMainScreen();
          app.renderers.renderInboxSortModal();
        }
        if (target.dataset.action === "inbox-update-date") {
          inboxState.pendingAction.date = target.value || getLocalDateString();
          app.renderers.renderMainScreen();
          app.renderers.renderInboxSortModal();
        }
      });
    });
    elements.inboxVoiceDraftList.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target || target.dataset.action !== "inbox-voice-remove-draft") return;
      inboxState.drafts = inboxState.drafts.filter((draft) => draft.id !== target.dataset.draftId);
      if (inboxState.drafts.length === 0) {
        openInboxVoiceMessage("Черновик опустел. Можно надиктовать мысли еще раз или записать их текстом.");
        return;
      }
      app.renderers.renderInboxVoiceModal();
    });
    elements.inboxVoiceDraftList.addEventListener("input", (event) => {
      const target = event.target.closest('[data-action="inbox-voice-update-text"]');
      if (!target) return;
      const draft = inboxState.drafts.find((item) => item.id === target.dataset.draftId);
      if (!draft) return;
      draft.text = target.value;
    });
    elements.voiceDraftList.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!target || target.dataset.action !== "voice-remove-draft") return;
      voiceState.voiceDraft = voiceState.voiceDraft.filter((draft) => draft.id !== target.dataset.draftId);
      if (voiceState.voiceDraft.length === 0) {
        openVoiceMessage("Черновик опустел. Можно попробовать надиктовать задачи ещё раз.");
        return;
      }
      app.renderers.renderVoiceModal();
    });
    elements.voiceDraftList.addEventListener("input", (event) => {
      const target = event.target.closest('[data-action="voice-update-text"]');
      if (!target) return;
      const draft = voiceState.voiceDraft.find((item) => item.id === target.dataset.draftId);
      if (!draft) return;
      draft.text = target.value;
    });
    elements.voiceDraftList.addEventListener("change", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;
      const draft = voiceState.voiceDraft.find((item) => item.id === target.dataset.draftId);
      if (!draft) return;
      if (target.dataset.action === "voice-update-weight") {
        draft.suggestedWeight = parseInt(target.value, 10);
      }
      if (target.dataset.action === "voice-update-date") {
        draft.suggestedDate = target.value;
      }
    });
    elements.breakdownDraftList.addEventListener("input", (event) => {
      const target = event.target.closest('[data-action="breakdown-update-text"]');
      if (!target) return;
      const draft = breakdownState.drafts.find((item) => item.id === target.dataset.draftId);
      if (!draft) return;
      draft.text = target.value;
      elements.breakdownConfirmBtn.disabled = breakdownState.drafts.some((item) => !item.text.trim());
    });
    elements.breakdownDraftList.addEventListener("change", (event) => {
      const target = event.target.closest('[data-action="breakdown-update-weight"]');
      if (!target) return;
      const draft = breakdownState.drafts.find((item) => item.id === target.dataset.draftId);
      if (!draft) return;
      draft.weight = parseInt(target.value, 10) === 10 ? 10 : 5;
    });
    elements.breakdownDraftList.addEventListener("keydown", (event) => {
      const input = event.target.closest('[data-action="breakdown-update-text"]');
      if (!input || event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      elements.breakdownConfirmBtn.click();
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
        event.stopImmediatePropagation();
        const { template } = addAllTemplateTasksToDay(store, target.dataset.templateId);
        elements.templatesModal.classList.add("hidden");
        app.renderers.renderMainScreen();
        app.renderers.renderWeeklyScreen();
        if (template && !template.hasAskedAutoAdd) {
          openTemplateAutoModal(template.id);
        }
        return;
      }
      if (target.dataset.action === "toggle-template-daily") {
        event.stopImmediatePropagation();
        const template = store.getState().templates.find((item) => item.id === target.dataset.templateId);
        if (!template) return;
        setTemplateDailyPreference(store, {
          templateId: template.id,
          autoAddDaily: !template.autoAddDaily,
          hasAskedAutoAdd: true,
          lastAutoAddedDate: !template.autoAddDaily ? getLocalDateString() : null
        });
        app.renderers.renderTemplates();
      }
    }, true);
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
    elements.weeklyContainer.addEventListener("dblclick", (event) => {
      const task = event.target.closest(".weekly-task");
      if (!(task == null ? void 0 : task.dataset.taskId)) return;
      startInlineEdit(task.dataset.taskId);
      renderAllTaskViews();
      focusInlineEditor(task.dataset.taskId);
    });
    elements.weeklyContainer.addEventListener("click", (event) => {
      const target = closestActionTarget(event.target);
      if (!(target == null ? void 0 : target.dataset.taskId)) return;
      if (target.dataset.action === "edit-save-task") {
        saveInlineEdit();
        return;
      }
      if (target.dataset.action === "edit-cancel-task") {
        stopInlineEdit();
        renderAllTaskViews();
      }
    });
    elements.weeklyContainer.addEventListener("input", (event) => {
      const target = event.target.closest('[data-action="edit-update-text"]');
      if (!(target == null ? void 0 : target.dataset.taskId) || editTaskState.taskId !== target.dataset.taskId) return;
      editTaskState.text = target.value;
    });
    elements.weeklyContainer.addEventListener("change", (event) => {
      const target = event.target.closest('[data-action="edit-update-weight"]');
      if (!(target == null ? void 0 : target.dataset.taskId) || editTaskState.taskId !== target.dataset.taskId) return;
      editTaskState.weight = parseInt(target.value, 10);
    });
    elements.weeklyContainer.addEventListener("keydown", handleInlineEditEnter);
    elements.weeklyContainer.addEventListener("dragstart", (event) => {
      var _a2;
      const task = event.target.closest(".weekly-task");
      if (!task) return;
      task.classList.add("weekly-dragging");
      (_a2 = event.dataTransfer) == null ? void 0 : _a2.setData("taskId", task.dataset.taskId);
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
  function shouldOfferLowEnergyDay(state, today = getLocalDateString()) {
    var _a;
    return state.lastDate === today && state.energyBudget !== null && state.energyBudget >= 10 && state.energyBudget <= 15 && ((_a = state.currentDayMeta) == null ? void 0 : _a.date) === today && !state.currentDayMeta.lowEnergyPromptHandled;
  }
  async function initApp({ elements }) {
    var _a, _b;
    const store = createStore();
    const app = {
      elements,
      store,
      runtime: {
        builtinAdvices,
        currentAdvice: "",
        currentWeeklyTaskDate: null,
        sosView: null,
        voice: {
          isSupported: false,
          isListening: false,
          isProcessing: false,
          lastTranscript: "",
          voiceDraft: [],
          voiceError: "",
          modalMode: "hidden"
        },
        inbox: {
          isSupported: false,
          isListening: false,
          isProcessing: false,
          drafts: [],
          error: "",
          modalMode: "hidden",
          pendingAction: {
            itemId: null,
            mode: null,
            weight: 20,
            date: getLocalDateString()
          },
          sortMode: false
        },
        breakdown: {
          taskId: null,
          mode: "intro",
          drafts: [],
          sourceInboxId: null,
          sourceText: ""
        },
        editTask: {
          taskId: null,
          text: "",
          weight: 20,
          isResource: false
        },
        templateAutoPrompt: {
          templateId: null
        },
        persistenceStatus: ((_a = store.getPersistenceStatus) == null ? void 0 : _a.call(store)) || {
          mode: "local-fallback",
          message: ""
        }
      }
    };
    app.renderers = createRenderers(app);
    app.onboarding = createOnboardingController(app);
    app.screens = createScreens(app);
    bindAppEvents(app);
    (_b = store.setPersistenceStatusListener) == null ? void 0 : _b.call(store, (status) => {
      app.runtime.persistenceStatus = status;
      app.renderers.renderPersistenceStatus();
    });
    await store.loadState();
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
      applyDailyTemplatesForDate(store, today);
      app.screens.showMainScreen();
      if (shouldOfferLowEnergyDay(store.getState(), today)) {
        elements.lowEnergyAvatar.src = store.getState().avatar;
        elements.lowEnergyModal.classList.remove("hidden");
      }
    }
    return app;
  }
  async function bootstrap() {
    await initApp({ elements: collectElements(document) });
  }
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        void bootstrap();
      });
    } else {
      void bootstrap();
    }
  }
})();
