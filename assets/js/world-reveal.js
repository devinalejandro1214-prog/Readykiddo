const vibeThemes = {
    Cozy: { bg: 'rgba(255, 220, 200, 0.94)', accent: '#F97316' },
    Exciting: { bg: 'rgba(255, 230, 200, 0.94)', accent: '#EA580C' },
    Magical: { bg: 'rgba(240, 200, 255, 0.94)', accent: '#A855F7' },
    Silly: { bg: 'rgba(255, 250, 200, 0.94)', accent: '#FBBF24' },
    Brave: { bg: 'rgba(255, 230, 200, 0.94)', accent: '#EF4444' }
};

document.addEventListener('DOMContentLoaded', async () => {
    const savedProfile = localStorage.getItem('userProfile');

    if (!savedProfile) {
        window.location.href = 'onboarding.html';
        return;
    }

    try {
        const profile = JSON.parse(savedProfile);
        const manifest = await loadCharacterManifest();
        loadWorldReveal(profile, manifest);
    } catch (error) {
        console.error('Unable to load world reveal:', error);
        window.location.href = 'onboarding.html';
    }
});

async function loadCharacterManifest() {
    const response = await fetch('assets/data/characters.json');
    if (!response.ok) {
        throw new Error(`Manifest request failed: ${response.status}`);
    }
    return response.json();
}

function loadWorldReveal(profile, manifest) {
    const characterSlug = slugify(profile.character);
    const styleSlug = slugify(profile.style || 'Plain');
    const worldSlug = slugify(profile.theme);
    const vibeSlug = slugify(profile.vibe);
    const character = manifest.characters[characterSlug];

    if (!character) {
        throw new Error(`Unknown character: ${profile.character}`);
    }

    const characterPath = character.styles[styleSlug] || character.styles.plain;
    const backgroundPath = `assets/images/world-backgrounds/${worldSlug}/vibes/${vibeSlug}/background.png`;

    document.getElementById('welcomeTitle').textContent = `Welcome, ${profile.childName}!`;
    document.getElementById('welcomeSubtitle').textContent = 'Your personalized world awaits...';

    const characterImage = document.getElementById('characterImage');
    characterImage.src = characterPath;
    characterImage.alt = `${profile.character} in ${profile.style} style`;

    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.src = backgroundPath;
    backgroundImage.alt = `${profile.theme} world with a ${profile.vibe} vibe`;

    const vibeOverlay = document.getElementById('vibeOverlay');
    vibeOverlay.hidden = true;

    applyVibeTheme(profile.vibe);

    document.getElementById('themeDisplay').textContent = profile.theme;
    document.getElementById('vibeDisplay').textContent = profile.vibe;
    document.getElementById('musicDisplay').textContent = 'Later';
    document.getElementById('styleDisplay').textContent = profile.style || 'Plain';

    document.getElementById('startGameButton').addEventListener('click', () => {
        startFirstGame(profile);
    });
}

function applyVibeTheme(vibe) {
    const themeColors = vibeThemes[vibe];
    if (!themeColors) return;

    const worldContainer = document.querySelector('.world-container');
    worldContainer.style.background = themeColors.bg;
    document.documentElement.style.setProperty('--vibe-accent', themeColors.accent);
}

function startFirstGame(profile) {
    localStorage.setItem('gameProfile', JSON.stringify(profile));
    window.location.href = 'game.html';
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
