import { getLocalDateString, parseLocalDate } from '../utils/date.js';

function getTomorrowDate(today = getLocalDateString()) {
    const tomorrow = parseLocalDate(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getLocalDateString(tomorrow);
}

function cleanupTaskText(text) {
    return text
        .replace(/^\s*(и\s+)?(еще|ещё)\s+/i, '')
        .replace(/^\s*(а\s+)?(еще|ещё)\s+/i, '')
        .replace(/^\s*(нужно|надо|потом|затем)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^[,.;:\-]+/, '')
        .trim();
}

function splitTranscriptIntoParts(transcript) {
    const prepared = transcript
        .replace(/\s+/g, ' ')
        .replace(/\s+(а еще|а ещё|и еще|и ещё|потом|затем)\s+/gi, ' | ')
        .replace(/[;\n]+/g, ' | ')
        .replace(/,\s+(?=(надо|нужно|завтра|купить|забрать|помыть|написать|ответить|позвонить|сходить|убраться|разобрать))/gi, ' | ');

    const parts = prepared
        .split('|')
        .map(part => cleanupTaskText(part))
        .filter(Boolean);

    return parts.length > 0 ? parts : [cleanupTaskText(transcript)].filter(Boolean);
}

function createInboxDraft(text, index = 0) {
    return {
        id: `inbox_draft_${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`,
        text,
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

export function parseVoiceTranscript(transcript, today = getLocalDateString()) {
    const normalizedTranscript = String(transcript || '').replace(/\s+/g, ' ').trim();
    if (!normalizedTranscript) {
        return [];
    }

    return splitTranscriptIntoParts(normalizedTranscript)
        .map((part, index) => {
            const text = cleanupTaskText(part);
            if (!text) {
                return null;
            }

            return {
                id: `voice_draft_${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`,
                text,
                suggestedWeight: suggestWeight(text),
                suggestedDate: suggestDate(text, today),
                isResource: false,
            };
        })
        .filter(Boolean);
}

export function parseInboxTranscript(transcript) {
    const normalizedTranscript = String(transcript || '').replace(/\s+/g, ' ').trim();
    if (!normalizedTranscript) {
        return [];
    }

    return splitTranscriptIntoParts(normalizedTranscript)
        .map((part, index) => cleanupTaskText(part))
        .filter(Boolean)
        .map((text, index) => createInboxDraft(text, index));
}
