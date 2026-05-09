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
    const backgroundPath = `assets/images/world-backgrounds/${worldSlug}/vibes/${vibeSlug}/background.png`;

    document.getElementById('welcomeTitle').textContent =
        `Hi, ${profile.childName}! Welcome to your ${profile.vibe} ${profile.theme}.`;

    const characterImage = document.getElementById('characterImage');
    characterImage.src = characterPath;
    characterImage.alt = `${profile.character} wearing ${profile.style || 'Plain'} outfit`;

    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.src = backgroundPath;
    backgroundImage.alt = `${profile.theme} world, ${profile.vibe} vibe`;

    document.getElementById('themeDisplay').textContent = profile.theme;
    document.getElementById('vibeDisplay').textContent = profile.vibe;
    document.getElementById('styleDisplay').textContent = profile.style || 'Plain';

    document.getElementById('startGameButton').addEventListener('click', () => {
        localStorage.setItem('gameProfile', JSON.stringify(profile));
        window.location.href = 'game.html';
    });
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
