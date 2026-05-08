// ── World Theme Backgrounds ───────────────────────────────────
const themeBackgrounds = {
    'Space': 'assets/images/backgrounds/space-bg.png',
    'Jungle': 'assets/images/backgrounds/jungle-bg.png',
    'Ocean': 'assets/images/backgrounds/ocean-bg.png',
    'Castle': 'assets/images/backgrounds/castle-bg.png',
    'City': 'assets/images/backgrounds/city-bg.png',
    'Candy Land': 'assets/images/backgrounds/candy-land-bg.png',
    'Sports Arena': 'assets/images/backgrounds/sports-arena-bg.png',
    'Music Studio': 'assets/images/backgrounds/music-studio-bg.png'
};

// ── Vibe Color Themes ──────────────────────────────────────────
const vibeThemes = {
    'Chill': { bg: 'rgba(200, 230, 255, 0.94)', accent: '#3B82F6' },
    'Brave': { bg: 'rgba(255, 230, 200, 0.94)', accent: '#EF4444' },
    'Funny': { bg: 'rgba(255, 250, 200, 0.94)', accent: '#FBBF24' },
    'Magical': { bg: 'rgba(240, 200, 255, 0.94)', accent: '#A855F7' },
    'Fast': { bg: 'rgba(255, 200, 230, 0.94)', accent: '#EC4899' },
    'Cozy': { bg: 'rgba(255, 220, 200, 0.94)', accent: '#F97316' }
};

// ── World Music Files ──────────────────────────────────────────
const musicFiles = {
    'Calm': 'assets/audio/music-calm.mp3',
    'Upbeat': 'assets/audio/music-upbeat.mp3',
    'Adventure': 'assets/audio/music-adventure.mp3',
    'Silly': 'assets/audio/music-silly.mp3',
    'No music': null
};

// ── Initialize World Reveal ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));

    if (!userProfile) {
        window.location.href = 'onboarding.html';
        return;
    }

    loadWorldReveal(userProfile);
});

// ── Load and Display World ──────────────────────────────────────
function loadWorldReveal(profile) {
    const {
        childName,
        character,
        theme,
        vibe,
        music,
        style
    } = profile;

    // Set title and subtitle
    document.getElementById('welcomeTitle').textContent = `Welcome, ${childName}!`;
    document.getElementById('welcomeSubtitle').textContent = 'Your personalized world awaits...';

    // Set character image
    const characterImage = document.getElementById('characterImage');
    characterImage.src = `${character}/${character}.Plain.png`;
    characterImage.alt = `${character} the character`;

    // Set background image
    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.src = themeBackgrounds[theme];
    backgroundImage.alt = `${theme} background`;

    // Apply vibe theme
    applyVibeTheme(vibe);

    // Set world details
    document.getElementById('themeDisplay').textContent = theme;
    document.getElementById('vibeDisplay').textContent = vibe;
    document.getElementById('musicDisplay').textContent = music;
    document.getElementById('styleDisplay').textContent = style;

    // Load world music
    const worldMusic = document.getElementById('worldMusic');
    const musicPath = musicFiles[music];
    if (musicPath) {
        worldMusic.src = musicPath;
        worldMusic.play().catch(err => console.log('Audio autoplay prevented:', err));
    }

    // Set up start game button
    document.getElementById('startGameButton').addEventListener('click', () => {
        startFirstGame(profile);
    });
}

// ── Apply Vibe Color Theme ──────────────────────────────────────
function applyVibeTheme(vibe) {
    const themeColors = vibeThemes[vibe];
    if (!themeColors) return;

    const worldContainer = document.querySelector('.world-container');
    worldContainer.style.background = themeColors.bg;

    // You can add more vibe-based styling here
    // For example, adjust accent colors in detail items
}

// ── Start First Game ────────────────────────────────────────────
function startFirstGame(profile) {
    // Store the profile for use in the game
    localStorage.setItem('gameProfile', JSON.stringify(profile));

    // Navigate to the first game
    window.location.href = 'game.html';
}
