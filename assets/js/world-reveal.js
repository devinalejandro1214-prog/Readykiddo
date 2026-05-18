document.addEventListener('DOMContentLoaded', () => {
    const savedProfile = localStorage.getItem('userProfile');

    if (!savedProfile) {
        window.location.href = 'onboarding.html';
        return;
    }

    try {
        loadWorldReveal(JSON.parse(savedProfile));
    } catch (err) {
        console.error('World reveal failed:', err);
        window.location.href = 'onboarding.html';
    }
});

function loadWorldReveal(profile) {
    const charSlug = slugify(profile.character);
    const styleSlug = slugify(profile.style || 'plain');
    const worldSlug = slugify(profile.theme);
    const vibeSlug = slugify(profile.vibe);

    const characterPath = `assets/images/characters/${charSlug}/${styleSlug}.png`;
    const backgroundPath = `assets/images/world-backgrounds/${worldSlug}/vibes/${vibeSlug}/background.webp`;

    document.getElementById('welcomeTitle').textContent =
        `Hi, ${profile.childName}! Welcome to your ${profile.vibe} ${profile.theme}.`;

    const characterImage = document.getElementById('characterImage');
    characterImage.src = characterPath;
    characterImage.alt = `${profile.character} wearing ${profile.style || 'Plain'} outfit`;
    setupIntroVideo(profile);

    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.src = backgroundPath;
    backgroundImage.alt = `${profile.theme} world, ${profile.vibe} vibe`;

    document.getElementById('themeDisplay').textContent = profile.theme;
    document.getElementById('vibeDisplay').textContent = profile.vibe;
    document.getElementById('styleDisplay').textContent = profile.style || 'Plain';

    document.getElementById('startGameButton').addEventListener('click', () => {
        startGameWithWelcome(profile);
    });

    setupResumeButton(profile);
}

async function startGameWithWelcome(profile) {
    const startButton = document.getElementById('startGameButton');
    if (startButton.disabled) return;

    startButton.disabled = true;
    startButton.querySelector('span:last-child').textContent = 'Starting...';

    // Unlock audio context on press (needed for iOS).
    if (window.RKAudio) RKAudio.unlock();

    // If welcome was blocked on page load, play it now and wait for it to finish
    // before navigating — so the clip is never cut off mid-play.
    if (window._rkWelcomePending) {
        window._rkWelcomePending = false;
        await RKAudio.speakAndWait('welcome');
    }

    localStorage.setItem('gameProfile', JSON.stringify(profile));
    setTimeout(() => {
        window.location.href = 'game-loader.html?game=color-sort';
    }, 300);
}

function setupResumeButton(profile) {
    const resume = getSavedGame(profile);
    const section = document.getElementById('resumeSection');
    const button = document.getElementById('resumeGameButton');
    const hint = document.getElementById('resumeHint');

    if (!resume || !section || !button || !hint) return;

    section.hidden = false;
    button.querySelector('span').textContent = `Resume ${resume.label}`;
    hint.textContent = `Saved ${resume.itemsShown || 0} rounds in.`;

    button.addEventListener('click', () => {
        if (window.RKAudio) RKAudio.unlock();
        localStorage.setItem('gameProfile', JSON.stringify(profile));
        window.location.href = `game-loader.html?game=${resume.gameType}&resume=true`;
    });
}

function getSavedGame(profile) {
    const childId = profile.childId;
    if (!childId) return null;

    // Check dedicated progress keys for games that save mid-session
    const keyedCandidates = [
        { key: `colorSortProgress_${childId}`,       gameType: 'color-sort',       label: 'Color Sort'   },
        { key: `shapeRecognitionProgress_${childId}`, gameType: 'shape-recognition', label: 'Shape Game'   }
    ];

    const fromKeys = keyedCandidates
        .map(candidate => {
            try {
                const saved = JSON.parse(localStorage.getItem(candidate.key) || 'null');
                if (!saved || typeof saved.itemsShown !== 'number') return null;
                return { ...candidate, itemsShown: saved.itemsShown, savedAt: saved.savedAt || 0 };
            } catch (e) { return null; }
        })
        .filter(Boolean);

    return fromKeys.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0] || null;
}

function setupIntroVideo(profile) {
    const characterSlug = slugify(profile.character);
    const styleSlug = slugify(profile.style || 'plain');
    const introPath = getIntroVideoPath(characterSlug, styleSlug);
    const panel = document.querySelector('.reveal-character-panel');
    const video = document.getElementById('introVideo');

    if (!introPath || !panel || !video) return;

    panel.classList.add('has-intro');
    video.src = introPath;
    video.setAttribute('aria-label', `${profile.character} welcomes you to the world`);

    video.addEventListener('ended', () => {
        panel.classList.add('video-finished');
    });

    video.addEventListener('error', () => {
        panel.classList.remove('has-intro');
        panel.classList.add('video-finished');
    });

    video.play().catch(() => {
        video.controls = true;
    });
}

function getIntroVideoPath(characterSlug, styleSlug) {
    const introVideos = {
        'amelia/artist': 'assets/videos/characters/amelia/artist/welcome-wave.mp4',
        'amelia/explorer': 'assets/videos/characters/amelia/explorer/welcome-wave.mp4',
        'amelia/hero': 'assets/videos/characters/amelia/hero/welcome-wave.mp4',
        'amelia/wizard': 'assets/videos/characters/amelia/wizard/welcome-wave.mp4',
        'aria/artist': 'assets/videos/characters/aria/artist/welcome-wave.mp4',
        'aria/explorer': 'assets/videos/characters/aria/explorer/welcome-wave.mp4',
        'aria/hero': 'assets/videos/characters/aria/hero/welcome-wave.mp4',
        'aria/scientist': 'assets/videos/characters/aria/scientist/welcome-wave.mp4',
        'aria/wizard': 'assets/videos/characters/aria/wizard/welcome-wave.mp4',
        'emmett/artist': 'assets/videos/characters/emmett/artist/welcome-wave.mp4',
        'emmett/explorer': 'assets/videos/characters/emmett/explorer/welcome-wave.mp4',
        'emmett/hero': 'assets/videos/characters/emmett/hero/welcome-wave.mp4',
        'emmett/scientist': 'assets/videos/characters/emmett/scientist/welcome-wave.mp4',
        'emmett/wizard': 'assets/videos/characters/emmett/wizard/welcome-wave.mp4',
        'steven/artist': 'assets/videos/characters/steven/artist/welcome-wave.mp4',
        'steven/explorer': 'assets/videos/characters/steven/explorer/welcome-wave.mp4',
        'steven/hero': 'assets/videos/characters/steven/hero/welcome-wave.mp4',
        'steven/scientist': 'assets/videos/characters/steven/scientist/welcome-wave.mp4',
        'steven/wizard': 'assets/videos/characters/steven/wizard/welcome-wave.mp4'
    };

    return introVideos[`${characterSlug}/${styleSlug}`] || null;
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
