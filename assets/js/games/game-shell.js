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
    if (!profile.childId) {
      profile.childId = `child_${Date.now()}`;
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }

    const worldSlug = slugify(profile.theme || 'space');
    const characterSlug = slugify(profile.character || 'mica');
    const styleSlug = slugify(profile.style || 'plain');
    const vibeSlug = slugify(profile.vibe || 'cozy');

    return {
      // User info
      childName: profile.childName || 'Explorer',
      parentName: profile.parentName || 'Parent',
      childId: profile.childId,

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
    if (window.RKAudio) {
      return RKAudio.speak(text);
    }
    if (window.ReadyKiddoAudio) {
      await window.ReadyKiddoAudio.speak(text);
      return;
    }
    console.log(`[Audio] ${text}`);
  }

  playSound(soundKey) {
    if (!this.audioEnabled) return;

    const soundMap = {
      correct: 'correct',
      wrong: 'try again',
      levelup: 'ready',
      leveldown: 'almost there',
      celebration: 'yay'
    };

    const prompt = soundMap[soundKey];
    if (!prompt || !window.ReadyKiddoAudio) {
      console.log(`[Sound] ${soundKey}`);
      return;
    }

    window.ReadyKiddoAudio.speak(prompt);
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
    if (nextGameType === 'world-reveal') {
      window.location.href = 'world-reveal.html';
    } else {
      window.location.href = `game-loader.html?game=${nextGameType}`;
    }
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

    // Require interaction to unlock mobile audio context
    await this.requireInteraction();

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

  requireInteraction() {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'interaction-overlay';
      overlay.innerHTML = `
        <div class="interaction-panel">
          <h2>Ready to Play?</h2>
          <button class="start-btn" id="tapToStartBtn">Start Game</button>
        </div>
      `;
      Object.assign(overlay.style, {
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(6, 12, 26, 0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      });

      const style = document.createElement('style');
      style.textContent = \`
        .interaction-panel { text-align: center; color: white; font-family: "Fredoka", sans-serif; animation: panelSlide 0.5s ease-out; }
        .interaction-panel h2 { font-size: 32px; margin-bottom: 24px; text-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        .start-btn { 
          padding: 16px 36px; font-size: 24px; font-weight: 700; font-family: inherit;
          color: white; background: linear-gradient(135deg, #09395f 0%, #0b5f95 100%); 
          border: 3px solid rgba(255,255,255,0.2); border-radius: 999px;
          box-shadow: 0 8px 24px rgba(11, 95, 149, 0.4); cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .start-btn:active { transform: scale(0.95); }
      \`;
      document.head.appendChild(style);
      document.body.appendChild(overlay);

      const btn = document.getElementById('tapToStartBtn');
      btn.addEventListener('click', () => {
        if (window.RKAudio) window.RKAudio.unlock();
        if (window.ReadyKiddoAudio && window.ReadyKiddoAudio.unlock) window.ReadyKiddoAudio.unlock();
        overlay.remove();
        style.remove();
        
        // Ensure loading spinner is gone so game is instantly visible
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
        
        resolve();
      }, { once: true });
    });
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
