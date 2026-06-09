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
  'number-matching': {
    name: 'Number Matching',
    description: 'Count and match quantities',
    class: 'NumberMatchingGame',
    scriptPath: 'assets/js/games/number-matching-game.js',
    cssPath: 'assets/css/number-matching-game.css',
    isActive: true,
    order: 3
  },
  'pattern-next': {
    name: 'Pattern Quest',
    description: 'What comes next in the pattern?',
    class: 'PatternNextGame',
    scriptPath: 'assets/js/games/pattern-next-game.js',
    cssPath: 'assets/css/adventure-screen.css',
    isActive: true,
    order: 4
  },
  'space-pattern': {
    name: 'Space Pattern',
    description: 'Deprecated — merged into Pattern Quest (pattern-next) v2.0.',
    class: 'SpacePatternGame',
    scriptPath: 'assets/js/games/space-pattern-game.js',
    cssPath: 'assets/css/space-pattern-game.css',
    isActive: false,
    order: 5
  },
  'space-defender': {
    name: 'Space Defender',
    description: 'Defend your world from incoming enemies!',
    class: 'SpaceDefenderGame',
    scriptPath: 'assets/js/games/space-defender-game.js',
    cssPath: 'assets/css/space-defender-game.css',
    isActive: true,
    order: 6
  },
  'feed-alien': {
    name: 'Feed the Alien',
    description: 'Count and feed your new alien friend!',
    class: 'FeedAlienGame',
    scriptPath: 'assets/js/games/feed-alien-game.js',
    cssPath: 'assets/css/feed-alien-game.css',
    isActive: true,
    order: 7
  },
  'number-line': {
    name: 'Letter Line',
    description: 'Fill in the missing letters on the line!',
    class: 'NumberLineGame',
    scriptPath: 'assets/js/games/number-line-game.js',
    cssPath: 'assets/css/number-line-game.css',
    isActive: true,
    order: 8
  },
  'feed-by-sound': {
    name: 'Feed by Sound',
    description: 'Hear a sound and feed Gumblop the right foods!',
    class: 'FeedBySoundGame',
    scriptPath: 'assets/js/games/feed-by-sound-game.js',
    cssPath: 'assets/css/feed-by-sound-game.css',
    isActive: true,
    order: 9
  },
  'abc-match': {
    name: 'ABC Match',
    description: 'Tap the picture that starts with the letter!',
    class: 'ABCMatchGame',
    scriptPath: 'assets/js/games/abc-match-game.js',
    cssPath: 'assets/css/abc-match-game.css',
    isActive: true,
    order: 10
  },
  'draw-it': {
    name: 'Draw It. Snap It.',
    description: 'Draw a mission together, then snap it into your world!',
    class: 'DrawItGame',
    scriptPath: 'assets/js/games/draw-it-game.js',
    cssPath: 'assets/css/draw-it-game.css',
    worldCategory: 'Family',
    difficulty: 'All Ages',
    isActive: true,
    order: 11
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

/* All failure paths prefer the kid-friendly Zoey error screen when the
   host page provides one (game-loader.html). The inline fallback only
   renders on legacy pages without it — and must NEVER wipe document.body,
   which would destroy the host page's overlays. */

function rkFallbackErrorScreen(title, sub) {
  if (window.showKidGameError) { window.showKidGameError(); return; }
  const container = document.getElementById('gameArea');
  if (!container) return; // no game area yet — host page handles messaging
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #fff; font-family: 'Fredoka', sans-serif;">
      <h2>${title}</h2>
      <p>${sub}</p>
      <a href="child-home.html" style="
        display: inline-block;
        padding: 12px 24px;
        background: #f28c18;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        margin-top: 20px;">
        Back to my world 🚀
      </a>
    </div>
  `;
}

function showGameNotFound(gameType) {
  rkFallbackErrorScreen('Oops! That one\'s napping. 😴', 'Let\'s pick a different adventure instead!');
}

function showGameNotAvailable(gameType) {
  const gameName = GAME_REGISTRY[gameType]?.name || gameType;
  rkFallbackErrorScreen('Coming Soon!', `${gameName} isn't ready yet — let's play another one!`);
}

function showGameError(gameType, errorMessage) {
  console.error(`[GameRegistry] ${gameType} failed:`, errorMessage);
  rkFallbackErrorScreen('Oops! That one\'s napping. 😴', 'Let\'s pick a different adventure instead!');
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
    return 'space-defender'; // Forward progression in the game chain
  }

  if (currentGameType === 'number-matching') {
    return 'space-defender'; // Counting match transitions into Space Defender
  }

  if (currentGameType === 'space-defender') {
    return 'feed-alien'; // Befriend the alien after defense
  }

  if (currentGameType === 'feed-alien') {
    return 'number-line'; // Number line is next after feeding the alien
  }

  if (currentGameType === 'number-line') {
    return 'feed-by-sound'; // Phonics after the letter line
  }

  if (currentGameType === 'feed-by-sound') {
    return 'abc-match'; // Letter matching after phonics
  }

  if (currentGameType === 'abc-match') {
    return 'pattern-next'; // Visual pattern recognition follows letter recognition naturally
  }

  if (currentGameType === 'pattern-next') {
    return 'world-reveal'; // Pattern Quest is the final game; celebrate at the world
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
