// ── Vibe card color themes ────────────────────────────────────────
const vibeThemes = {
    Cozy:    { bg: 'rgba(255, 220, 200, 0.93)', accent: '#F97316' },
    Exciting: { bg: 'rgba(255, 235, 200, 0.93)', accent: '#EA580C' },
    Magical:  { bg: 'rgba(240, 200, 255, 0.93)', accent: '#A855F7' },
    Silly:    { bg: 'rgba(255, 250, 200, 0.93)', accent: '#FBBF24' },
    Brave:    { bg: 'rgba(255, 220, 215, 0.93)', accent: '#EF4444' }
};

// ── Boot ──────────────────────────────────────────────────────────
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

// ── Main loader ───────────────────────────────────────────────────
function loadWorldReveal(profile) {
    const charSlug  = slugify(profile.character);
    const styleSlug = slugify(profile.style || 'plain');
    const worldSlug = slugify(profile.theme);
    const vibeSlug  = slugify(profile.vibe);

    // Character in their chosen costume
    const characterPath = `assets/images/characters/${charSlug}/${styleSlug}.png`;

    // World background filtered by chosen vibe
    const backgroundPath = `assets/images/world-backgrounds/${worldSlug}/vibes/${vibeSlug}/background.png`;

    // ── Populate DOM ───────────────────────────────────────────────
    document.getElementById('welcomeTitle').textContent = `Welcome, ${profile.childName}!`;

    const characterImage = document.getElementById('characterImage');
    characterImage.src   = characterPath;
    characterImage.alt   = `${profile.character} wearing ${profile.style || 'Plain'} outfit`;

    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.src   = backgroundPath;
    backgroundImage.alt   = `${profile.theme} world — ${profile.vibe} vibe`;

    document.getElementById('themeDisplay').textContent = profile.theme;
    document.getElementById('vibeDisplay').textContent  = profile.vibe;
    document.getElementById('styleDisplay').textContent = profile.style || 'Plain';

    // Apply vibe-matched color to cards
    applyVibeTheme(profile.vibe);

    // ── Start game button ──────────────────────────────────────────
    document.getElementById('startGameButton').addEventListener('click', () => {
        localStorage.setItem('gameProfile', JSON.stringify(profile));
        window.location.href = 'game.html';
    });
}

// ── Apply vibe color to card backgrounds ──────────────────────────
function applyVibeTheme(vibe) {
    const theme = vibeThemes[vibe];
    if (!theme) return;
    document.querySelectorAll('.welcome-card, .game-soon-window')
            .forEach(el => el.style.background = theme.bg);
}

// ── Slugify ───────────────────────────────────────────────────────
function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
