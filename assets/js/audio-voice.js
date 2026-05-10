(function () {
    const VOICE_PRIORITY = [
        'aria',
        'jenny',
        'ava',
        'samantha',
        'karen',
        'google us english',
        'google uk english female',
        'microsoft zira',
        'microsoft heera',
        'microsoft hazel',
        'alex'
    ];

    let voicesPromise = null;

    function loadVoices() {
        const synth = window.speechSynthesis;
        if (!synth) return Promise.resolve([]);

        if (voicesPromise) return voicesPromise;

        voicesPromise = new Promise(resolve => {
            const existing = synth.getVoices();
            if (existing.length) {
                resolve(existing);
                return;
            }

            const done = () => resolve(synth.getVoices());
            synth.addEventListener('voiceschanged', done, { once: true });
            setTimeout(done, 700);
        });

        return voicesPromise;
    }

    function pickVoice(voices) {
        const englishVoices = voices.filter(voice => /^en(-|_)?/i.test(voice.lang || ''));
        const pool = englishVoices.length ? englishVoices : voices;

        for (const preferred of VOICE_PRIORITY) {
            const match = pool.find(voice => voice.name.toLowerCase().includes(preferred));
            if (match) return match;
        }

        const natural = pool.find(voice => /natural|premium|enhanced|neural/i.test(voice.name));
        return natural || pool[0] || null;
    }

    async function speak(text, options = {}) {
        const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || null;
        const synth = window.speechSynthesis || null;

        if (!SpeechSynthesisUtterance || !synth || !text) {
            console.log(`[Character says] ${text}`);
            return;
        }

        const voices = await loadVoices();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = pickVoice(voices);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang || 'en-US';
        } else {
            utterance.lang = 'en-US';
        }

        utterance.rate = options.rate || 0.88;
        utterance.pitch = options.pitch || 1.08;
        utterance.volume = options.volume || 1;

        return new Promise(resolve => {
            let finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                resolve();
            };

            utterance.onend = finish;
            utterance.onerror = finish;

            synth.cancel();
            synth.speak(utterance);

            const fallbackMs = Math.max(1600, Math.min(6500, text.length * 75));
            setTimeout(finish, fallbackMs);
        });
    }

    window.ReadyKiddoAudio = {
        loadVoices,
        speak
    };

    loadVoices();
}());
