(function () {
    const AUDIO_BASE = 'assets/audio/voice/';

    const AUDIO_MAP = {
        welcome: 'em-welcome-world.m4a',
        'welcome to your': 'em-welcome-world.m4a',
        'excited welcome': 'em-excited-welcome.m4a',
        ready: 'em-ready-lets-go.m4a',
        'let us play': 'em-ready-lets-go.m4a',
        "let's play": 'em-ready-lets-go.m4a',
        'match the colors': 'em-match-colors.m4a',
        'find all the colors': 'em-match-colors.m4a',
        'sort items by color': 'em-match-colors.m4a',
        'matching color': 'em-match-colors.m4a',
        'match the shapes': 'em-match-shapes.m4a',
        'find all the shapes': 'em-match-shapes.m4a',
        'find some shapes': 'em-match-shapes.m4a',
        'matching shape': 'em-match-shapes.m4a',

        red: 'em-find-red.m4a',
        blue: 'em-find-blue.m4a',
        yellow: 'em-find-yellow.m4a',
        green: 'em-find-green.m4a',
        orange: 'em-find-orange.m4a',
        purple: 'em-find-purple.m4a',

        circle: 'em-circle.m4a',
        square: 'em-square.m4a',
        triangle: 'em-triangle.m4a',
        star: 'em-yay.m4a',
        rectangle: 'em-great-job.m4a',

        correct: 'em-you-got-it.m4a',
        'you got it': 'em-you-got-it.m4a',
        'you found it': 'em-you-found-it.m4a',
        'great job': 'em-great-job.m4a',
        'that is right': 'em-you-got-it.m4a',
        "that's right": 'em-you-got-it.m4a',
        yay: 'em-yay.m4a',
        amazing: 'em-yay.m4a',
        wow: 'gray-wow.m4a',

        wrong: 'em-try-again.m4a',
        'try again': 'em-try-again.m4a',
        'look at the shape': 'em-try-again.m4a',
        'we need': 'em-try-again.m4a',
        'aww man': 'em-aww-man.m4a',
        'almost there': 'em-almost-there.m4a',
        'easier colors': 'em-almost-there.m4a',
        'easier shapes': 'em-almost-there.m4a',
        'keep it up': 'em-keep-it-up.m4a',
        funny: 'em-funny.m4a'
    };

    let currentAudio = null;
    let audioQueue = Promise.resolve();
    let unlocked = false;

    function normalize(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/[’]/g, "'")
            .replace(/[^a-z0-9' ]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getAudioPath(text) {
        const lower = normalize(text);
        if (!lower) return null;
        if (AUDIO_MAP[lower]) return AUDIO_BASE + AUDIO_MAP[lower];

        let bestKey = null;
        let bestLength = 0;
        for (const key of Object.keys(AUDIO_MAP)) {
            if (lower.includes(key) && key.length > bestLength) {
                bestKey = key;
                bestLength = key.length;
            }
        }

        return bestKey ? AUDIO_BASE + AUDIO_MAP[bestKey] : null;
    }

    function playNow(path) {
        return new Promise(resolve => {
            if (!path) {
                resolve(false);
                return;
            }

            const audio = new Audio(path);
            currentAudio = audio;
            audio.volume = 1;
            audio.preload = 'auto';

            let settled = false;
            const finish = played => {
                if (settled) return;
                settled = true;
                if (currentAudio === audio) currentAudio = null;
                resolve(played);
            };

            audio.addEventListener('ended', () => finish(true), { once: true });
            audio.addEventListener('error', () => {
                console.warn(`[ReadyKiddoAudio] Missing recorded audio: ${path}`);
                finish(false);
            }, { once: true });

            audio.play().catch(error => {
                console.warn(`[ReadyKiddoAudio] Recorded audio blocked: ${error.message}`);
                finish(false);
            });
        });
    }

    function playPath(path) {
        stop();
        audioQueue = Promise.resolve().then(() => playNow(path));
        return audioQueue;
    }

    function speak(text) {
        return playPath(getAudioPath(text));
    }

    function stop() {
        if (!currentAudio) return;
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    function unlock() {
        if (unlocked) return Promise.resolve(true);
        const path = getAudioPath('ready');
        if (!path) {
            unlocked = true;
            return Promise.resolve(true);
        }
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.muted = true;
        audio.volume = 0;
        return audio.play()
            .then(() => {
                audio.pause();
                audio.currentTime = 0;
                audio.muted = false;
                unlocked = true;
                return true;
            })
            .catch(() => {
                unlocked = true;
                return false;
            });
    }

    window.ReadyKiddoAudio = {
        getAudioPath,
        play: playPath,
        speak,
        stop,
        unlock
    };
}());
