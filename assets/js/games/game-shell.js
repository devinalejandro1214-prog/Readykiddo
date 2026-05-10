/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Universal Game Shell
   Provides common game context, utilities, and lifecycle
   ───────────────────────────────────────────────────────── */

class GameShell {
  constructor(gameType) {
    this.gameType = gameType;
    this.gameInstance = null;
    this.context = this.createGameContext();
    this.audioEnabled = true;
    this.audioCache = {};
  }

  /* ─────────────────────────────────────────────────────────
     Initialize game context from onboarding profile
     ───────────────────────────────────────────────────────── */

  createGameContext() {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const worldSlug = slugify(profile.theme || 'space');
    const characterSlug = slugify(profile.character || 'mica');
    const styleSlug = slugify(profile.style || 'plain');
    const vibeSlug = slugify(profile.vibe || 'cozy');

    return {
      // User info
      childName: profile.childName || 'Explorer',
      parentName: profile.parentName || 'Parent',
      childId: profile.childId || `child_${Date.now()}`,

      // World & character selection
      world: profile.theme || 'space',
      worldSlug,
      character: profile.character || 'mica',
      characterSlug,
      style: profile.style || 'plain',
      styleSlug,
      vibe: profile.vibe || 'cozy',
      vibeSlug,

      // Asset paths
      backgroundPath: `assets/images/world-backgrounds/${worldSlug}/vibes/${vibeSlug}/background.webp`,
      characterPath: `assets/images/characters/${characterSlug}/${styleSlug}.png`,

      // Game state
      startTime: Date.now(),
      sessionId: `session_${Date.now()}`,

      // Utilities (passed to game instance)
      playSound: (soundKey) => this.playSound(soundKey),
      speak: (text) => this.speak(text),
      characterAnimation: (type) => this.characterAnimation(type),
      saveSession: (data) => this.saveSession(data),
      goToNextGame: (nextGameType) => this.goToNextGame(nextGameType)
    };
  }

  /* ─────────────────────────────────────────────────────────
     Audio Methods (Web Speech API + fallback)
     ───────────────────────────────────────────────────────── */

  async speak(text) {
    if (!this.audioEnabled) return;

    // Check if Web Speech API is available
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || null;
    const speechSynthesis = window.speechSynthesis || null;

    if (!SpeechSynthesisUtterance || !speechSynthesis) {
      console.log(`[Character says] ${text}`);
      return;
    }

    // Create and configure utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // Speak
    speechSynthesis.cancel(); // Clear any queued speech
    speechSynthesis.speak(utterance);
  }

  playSound(soundKey) {
    if (!this.audioEnabled) return;

    // Map sound keys to audio prompts
    const soundMap = {
      correct: 'assets/sounds/correct.mp3',
      wrong: 'assets/sounds/wrong.mp3',
      levelup: 'assets/sounds/levelup.mp3',
      leveldown: 'assets/sounds/leveldown.mp3',
      celebration: 'assets/sounds/celebration.mp3'
    };

    const soundPath = soundMap[soundKey];
    if (!soundPath) {
      console.log(`[Sound] ${soundKey}`);
      return;
    }

    // For now, just log. Audio files can be added later
    console.log(`[Sound playing] ${soundKey}`);
  }

  /* ─────────────────────────────────────────────────────────
     Character Animations
     ───────────────────────────────────────────────────────── */

  characterAnimation(type) {
    const character = document.querySelector('.game-character img');
    if (!character) return;

    const animations = {
      'cheer': 'cheer 0.6s ease-in-out',
      'nod': 'nod 0.5s ease-in-out',
      'thumbs-up': 'thumbsUp 0.6s ease',
      'wave': 'wave 0.6s ease',
      'celebrate': 'dance 1s ease',
      'sway': 'sway 0.7s ease-in-out'
    };

    const animation = animations[type] || animations.cheer;
    character.style.animation = animation;

    // Reset animation
    setTimeout(() => {
      character.style.animation = 'none';
    }, 1200);
  }

  /* ─────────────────────────────────────────────────────────
     Session Management
     ───────────────────────────────────────────────────────── */

  saveSession(gameSessionData) {
    const fullSession = {
      ...gameSessionData,
      childName: this.context.childName,
      character: this.context.character,
      world: this.context.world,
      vibe: this.context.vibe,
      gameType: this.gameType,
      timestamp: Date.now(),
      sessionId: this.context.sessionId
    };

    // Save to localStorage
    localStorage.setItem('lastGameSession', JSON.stringify(fullSession));

    // Also append to game history
    let gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    gameHistory.push(fullSession);
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));

    console.log('Session saved:', fullSession);
    return fullSession;
  }

  /* ─────────────────────────────────────────────────────────
     Game Navigation
     ───────────────────────────────────────────────────────── */

  goToNextGame(nextGameType) {
    console.log(`Navigating to: ${nextGameType}`);
    // This will be implemented in the routing layer
    // For now, just log it
  }

  /* ─────────────────────────────────────────────────────────
     Game Lifecycle
     ───────────────────────────────────────────────────────── */

  async initialize() {
    console.log(`[GameShell] Initializing ${this.gameType}...`);

    // Set up game container
    this.setupGameDOM();

    // Load background and character
    await this.loadAssets();

    return this.context;
  }

  setupGameDOM() {
    // Create main game container if it doesn't exist
    if (!document.querySelector('.game-container')) {
      const container = document.createElement('div');
      container.className = 'game-container';
      container.innerHTML = `
        <div class="game-background">
          <img class="background-image" id="gameBackground" alt="Game background">
        </div>
        <div class="game-area" id="gameArea"></div>
        <div class="game-character" id="gameCharacter">
          <img id="gameCharacterImg" alt="Character">
        </div>
      `;
      document.body.appendChild(container);
    }
  }

  async loadAssets() {
    // Load background
    const bgEl = document.getElementById('gameBackground');
    if (bgEl && this.context.backgroundPath) {
      bgEl.src = this.context.backgroundPath;
    }

    // Load character
    const charEl = document.getElementById('gameCharacterImg');
    if (charEl && this.context.characterPath) {
      charEl.src = this.context.characterPath;
    }
  }

  /* ─────────────────────────────────────────────────────────
     Utility Methods
     ───────────────────────────────────────────────────────── */

  getWorldName() {
    const worldMap = {
      'space': 'Space',
      'candy-land': 'Candy Land',
      'jungle': 'Jungle',
      'beach': 'Beach',
      'castle': 'Castle',
      'studio': 'Studio'
    };
    return worldMap[this.context.worldSlug] || this.context.world;
  }

  getCharacterName() {
    return this.context.character.charAt(0).toUpperCase() + this.context.character.slice(1);
  }
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ─────────────────────────────────────────────────────────
   Export for global use
   ───────────────────────────────────────────────────────── */

// Make available globally if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameShell;
}
