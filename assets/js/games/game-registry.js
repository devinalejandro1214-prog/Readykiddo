/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Game Registry
   Centralized registry for all games and dynamic loading
   ───────────────────────────────────────────────────────── */

const GAME_REGISTRY = {
  'color-sort': {
    name: 'Color Sorting Adventure',
    description: 'Sort items by color and master your world',
    class: 'ColorSortGame',
    scriptPath: 'assets/js/games/color-sort-game.js',
    cssPath: 'assets/css/color-sort-game.css',
    isActive: true,
    order: 1
  },
  'shape-recognition': {
    name: 'Shape Discovery',
    description: 'Learn shapes by finding matching objects',
    class: 'ShapeRecognitionGame',
    scriptPath: 'assets/js/games/shape-recognition-game.js',
    cssPath: 'assets/css/shape-recognition-game.css',
    isActive: true,
    order: 2
  },
  'coming-soon-1': {
    name: 'Number Matching',
    description: 'Count and match quantities (Coming Soon)',
    class: null,
    scriptPath: null,
    cssPath: null,
    isActive: false,
    order: 3
  },
  'coming-soon-2': {
    name: 'Pattern Builder',
    description: 'Complete sequences and patterns (Coming Soon)',
    class: null,
    scriptPath: null,
    cssPath: null,
    isActive: false,
    order: 4
  },
  'space-defender': {
    name: 'Space Defender',
    description: 'Defend your world from incoming enemies!',
    class: 'SpaceDefenderGame',
    scriptPath: 'assets/js/games/space-defender-game.js',
    cssPath: 'assets/css/space-defender-game.css',
    isActive: true,
    order: 5
  },
  'feed-alien': {
    name: 'Feed the Alien',
    description: 'Count and feed your new alien friend!',
    class: 'FeedAlienGame',
    scriptPath: 'assets/js/games/feed-alien-game.js',
    cssPath: 'assets/css/feed-alien-game.css',
    isActive: true,
    order: 6
  }
};

/* ─────────────────────────────────────────────────────────
   Load and Initialize a Game
   ───────────────────────────────────────────────────────── */

async function loadGame(gameType) {
  console.log(`[GameRegistry] Loading game: ${gameType}`);

  const gameConfig = GAME_REGISTRY[gameType];

  if (!gameConfig) {
    console.error(`Game not found in registry: ${gameType}`);
    showGameNotFound(gameType);
    return null;
  }

  if (!gameConfig.isActive) {
    console.error(`Game not yet available: ${gameType}`);
    showGameNotAvailable(gameType);
    return null;
  }

  try {
    // Load CSS
    await loadCSS(gameConfig.cssPath);

    // Load script
    await loadScript(gameConfig.scriptPath);

    // Initialize game shell
    const shell = new GameShell(gameType);
    await shell.initialize();

    // Get the game class
    const GameClass = window[gameConfig.class];
    if (!GameClass) {
      throw new Error(`Game class not found: ${gameConfig.class}`);
    }

    // Create and start game instance
    const gameInstance = new GameClass(shell.context);
    await gameInstance.startGame();

    console.log(`[GameRegistry] Game initialized: ${gameType}`);
    return gameInstance;
  } catch (error) {
    console.error(`Failed to load game ${gameType}:`, error);
    showGameError(gameType, error.message);
    return null;
  }
}

/* ─────────────────────────────────────────────────────────
   Asset Loading Utilities
   ───────────────────────────────────────────────────────── */

function loadCSS(path) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    link.onload = resolve;
    link.onerror = () => reject(new Error(`Failed to load CSS: ${path}`));
    document.head.appendChild(link);
  });
}

function loadScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = path;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${path}`));
    document.body.appendChild(script);
  });
}

/* ─────────────────────────────────────────────────────────
   Error Display
   ───────────────────────────────────────────────────────── */

function showGameNotFound(gameType) {
  const container = document.getElementById('gameArea') || document.body;
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #333;">
      <h2>Game Not Found</h2>
      <p>The game "${gameType}" could not be found.</p>
      <a href="world-reveal.html" style="
        display: inline-block;
        padding: 12px 24px;
        background: #0b5f95;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        margin-top: 20px;">
        Back to World
      </a>
    </div>
  `;
}

function showGameNotAvailable(gameType) {
  const container = document.getElementById('gameArea') || document.body;
  const gameName = GAME_REGISTRY[gameType]?.name || gameType;
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #333;">
      <h2>Coming Soon!</h2>
      <p>${gameName} is not yet available.</p>
      <a href="world-reveal.html" style="
        display: inline-block;
        padding: 12px 24px;
        background: #0b5f95;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        margin-top: 20px;">
        Back to World
      </a>
    </div>
  `;
}

function showGameError(gameType, errorMessage) {
  const container = document.getElementById('gameArea') || document.body;
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #333;">
      <h2>Oops! An Error Occurred</h2>
      <p>We had trouble loading the game.</p>
      <p style="font-size: 12px; color: #999; margin-top: 10px;">Error: ${errorMessage}</p>
      <a href="world-reveal.html" style="
        display: inline-block;
        padding: 12px 24px;
        background: #0b5f95;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        margin-top: 20px;">
        Back to World
      </a>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────
   Helper: Get Recommended Next Game
   ───────────────────────────────────────────────────────── */

function getNextGameRecommendation(currentGameType, finalBranch, accuracy) {
  // Simple recommendation logic
  // Can be enhanced based on performance data

  if (currentGameType === 'color-sort') {
    return 'shape-recognition'; // Natural progression
  }

  if (currentGameType === 'shape-recognition') {
    if (accuracy > 0.85 && finalBranch === 'hard') {
      return 'coming-soon-1'; // User is advanced
    }
    return 'color-sort'; // Review colors or try again
  }

  if (currentGameType === 'space-defender') {
    return 'feed-alien'; // Befriend the alien after defense
  }

  if (currentGameType === 'feed-alien') {
    return 'world-reveal'; // Finish the loop and head back to the world
  }

  return 'color-sort'; // Default fallback
}

/* ─────────────────────────────────────────────────────────
   Helper: Get Active Games List
   ───────────────────────────────────────────────────────── */

function getActiveGames() {
  return Object.entries(GAME_REGISTRY)
    .filter(([_, config]) => config.isActive)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, config]) => ({ key, ...config }));
}

function getAllGames() {
  return Object.entries(GAME_REGISTRY)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, config]) => ({ key, ...config }));
}
