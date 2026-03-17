function normalizeVoiceError(errorCode) {
    switch (errorCode) {
        case 'not-allowed':
        case 'service-not-allowed':
            return 'Не получилось включить микрофон. Можно продолжить обычным вводом.';
        case 'audio-capture':
            return 'Микрофон сейчас недоступен. Попробуйте ещё раз чуть позже.';
        case 'network':
            return 'Голосовой ввод сейчас не смог обработать речь. Можно попробовать ещё раз.';
        case 'no-speech':
            return 'Я ничего не расслышал. Можно попробовать ещё раз в более тихой обстановке.';
        case 'aborted':
            return '';
        default:
            return 'Голосовой ввод сейчас недоступен. Можно добавить задачу текстом.';
    }
}

export function createVoiceInputService({ locale = 'ru-RU', onStart, onEnd, onError } = {}) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    let recognition = null;
    let latestTranscript = '';
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
            latestTranscript = '';
            hasError = false;
            isListening = true;
            onStart?.();
        };

        recognition.onresult = event => {
            latestTranscript = Array.from(event.results)
                .map(result => result[0]?.transcript || '')
                .join(' ')
                .trim();
        };

        recognition.onerror = event => {
            hasError = true;
            isListening = false;
            onError?.(normalizeVoiceError(event.error), event.error);
        };

        recognition.onend = () => {
            const transcript = latestTranscript.trim();
            latestTranscript = '';
            isListening = false;
            onEnd?.({ transcript, hadError: hasError });
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
            onError?.('Голосовой ввод пока не удалось запустить. Можно попробовать ещё раз.', 'start-failed');
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
        stopListening,
    };
}
