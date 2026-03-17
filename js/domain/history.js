import { getLocalDateString } from '../utils/date.js';

export const MAX_MOOD_HISTORY_DAYS = 14;

export function createCurrentDayMeta(date = getLocalDateString()) {
    return {
        date,
        usedSos: false,
        sosDestination: null,
        lowEnergyPromptHandled: false,
        lowEnergyDayApplied: false,
        lowEnergyKeptTaskId: null,
        lowEnergyResourceId: null,
        lowEnergyResourceTaskId: null,
    };
}

export function normalizeCurrentDayMeta(currentDayMeta, date = getLocalDateString()) {
    const base = createCurrentDayMeta(date);
    if (!currentDayMeta || typeof currentDayMeta !== 'object') {
        return base;
    }

    return {
        ...base,
        ...currentDayMeta,
        date,
    };
}

export function normalizeMoodHistory(moodHistory) {
    if (!Array.isArray(moodHistory)) {
        return [];
    }

    return [...moodHistory]
        .filter(entry => entry && typeof entry.date === 'string')
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, MAX_MOOD_HISTORY_DAYS);
}

export function buildMoodHistoryEntry(state, date) {
    if (!date || state.energyBudget === null) {
        return null;
    }

    const dayTasks = state.tasks.filter(task =>
        task.targetDate === date
        || task.archivedFromDate === date
        || task.completedAtDate === date
    );
    const regularTasks = dayTasks.filter(task => !task.isResource);
    const resourceTasks = dayTasks.filter(task => task.isResource);
    const completedRegularTasks = regularTasks.filter(task => task.completed || task.completedAtDate === date);
    const currentDayMeta = state.currentDayMeta?.date === date
        ? normalizeCurrentDayMeta(state.currentDayMeta, date)
        : createCurrentDayMeta(date);

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
        endedOverloaded: plannedWeight > state.energyBudget,
    };
}

export function upsertMoodHistoryEntry(moodHistory, entry) {
    if (!entry) {
        return normalizeMoodHistory(moodHistory);
    }

    const withoutCurrentDate = (Array.isArray(moodHistory) ? moodHistory : [])
        .filter(item => item?.date !== entry.date);

    return normalizeMoodHistory([entry, ...withoutCurrentDate]);
}

export function getMoodHistoryInsights(moodHistory) {
    const entries = normalizeMoodHistory(moodHistory);
    if (entries.length < 3) {
        return ['История только начинает собираться. Через несколько дней здесь появятся спокойные наблюдения о вашем ритме.'];
    }

    const insights = [];
    const lowEnergyDays = entries.filter(entry => entry.energyBudget <= 30);
    const lowEnergyWithSos = lowEnergyDays.filter(entry => entry.usedSos);
    if (lowEnergyDays.length >= 2 && lowEnergyWithSos.length >= Math.ceil(lowEnergyDays.length / 2)) {
        insights.push('В дни с более низким запасом сил SOS включался чаще. Возможно, в такие дни лучше сразу планировать мягче.');
    }

    const calmDays = entries.filter(entry => !entry.endedOverloaded && !entry.usedSos);
    if (calmDays.length >= 2) {
        insights.push('Когда план на день был спокойнее, день чаще проходил без перегруза и экстренной остановки.');
    }

    const resourceRichDays = entries.filter(entry => entry.resourceTasks >= 2);
    if (resourceRichDays.length >= 2) {
        insights.push('В истории уже есть дни, где рядом с делами было место для ресурсов. Это хороший устойчивый ритм.');
    }

    if (insights.length === 0) {
        insights.push('Пока история выглядит ровной. Ещё немного дней, и здесь станет проще замечать личные паттерны.');
    }

    return insights.slice(0, 2);
}
