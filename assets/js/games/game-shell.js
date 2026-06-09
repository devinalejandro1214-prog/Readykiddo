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

    // Prefer the real account child (sessionStorage rk_child) so sessions
    // log against the same row the dashboard reads. Fall back to the
    // onboarding profile's childId, and only fabricate a local id as a
    // last resort (offline/preview play).
    const activeChild = window.RK?.getActiveChild?.();
    if (activeChild?.id) {
      profile.childId = activeChild.id;
      if (!profile.childName) profile.childName = activeChild.name;
      if (!profile.ageGroup)  profile.ageGroup  = activeChild.age_range;
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } else if (!profile.childId) {
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
      ageGroup: profile.ageGroup || '4-5',

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
      speakAndWait: (text) => this.speakAndWait(text),
      speakInstruction: (text) => this.speakInstruction(text),
      speakInstructionAndWait: (text) => this.speakInstructionAndWait(text),
      speakPraise: (text) => this.speakPraise(text),
      characterAnimation: (type) => this.characterAnimation(type),
      saveSession: (data) => this.saveSession(data),
      goToNextGame: (nextGameType) => this.goToNextGame(nextGameType),
      randomEncouragement: () => this.randomEncouragement(),
      reportProgress: (current, total) => this.reportProgress(current, total),
      showCelebration: (opts) => this.showCelebration(opts),
      syncPhase: (itemsShown) => this.syncPhase(itemsShown)
    };
  }

  /* ─────────────────────────────────────────────────────────
     Audio Methods (Web Speech API + fallback)
     ───────────────────────────────────────────────────────── */

  async speak(text) {
    this.showCaption(text);
    if (window.RKAudio) {
      return RKAudio.speak(text);
    }
    if (window.ReadyKiddoAudio) {
      await window.ReadyKiddoAudio.speak(text);
      return;
    }
    console.log(`[Audio] ${text}`);
  }

  // Returns a Promise that resolves when the clip *finishes* playing.
  // Use when you need to chain audio back-to-back without overlapping.
  async speakAndWait(text) {
    this.showCaption(text);
    if (window.RKAudio && window.RKAudio.speakAndWait) {
      return RKAudio.speakAndWait(text);
    }
    // Fallback: regular speak + small buffer
    return this.speak(text);
  }

  /* ── Op 9: intent-aware audio ────────────────────────────────
     speakInstruction → the TEACHER voice (directions / what to do)
     speakPraise       → the CHARACTER voice (encouragement / reactions)
     Both gracefully fall back to speak() when RKAudio is unavailable. */
  async speakInstruction(text) {
    this.showCaption(text);
    if (window.RKAudio && window.RKAudio.speakInstruction) {
      return RKAudio.speakInstruction(text);
    }
    return this.speak(text);
  }

  async speakInstructionAndWait(text) {
    this.showCaption(text);
    if (window.RKAudio && window.RKAudio.speakInstructionAndWait) {
      return RKAudio.speakInstructionAndWait(text);
    }
    return this.speakAndWait(text);
  }

  async speakPraise(text) {
    this.showCaption(text);
    if (window.RKAudio && window.RKAudio.speakPraise) {
      return RKAudio.speakPraise(text);
    }
    return this.speak(text);
  }

  /* ─────────────────────────────────────────────────────────
     Caption bar — mirrors every spoken line as text so the
     game stays playable with sound off (muted devices, deaf/
     hard-of-hearing kids, noisy rooms).
     ───────────────────────────────────────────────────────── */

  showCaption(text) {
    if (!text || typeof text !== 'string') return;
    let bar = document.getElementById('rkCaptionBar');
    if (!bar) {
      const css = document.createElement('style');
      css.textContent = `
        #rkCaptionBar {
          position: fixed;
          left: 50%;
          bottom: 14px;
          transform: translateX(-50%);
          z-index: 8500;
          max-width: min(560px, 92vw);
          background: rgba(9, 20, 40, 0.82);
          color: #fff;
          font-family: 'Fredoka', system-ui, sans-serif;
          font-size: clamp(15px, 3.6vw, 19px);
          font-weight: 600;
          line-height: 1.35;
          text-align: center;
          padding: 10px 20px;
          border-radius: 16px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        #rkCaptionBar.rk-cap-show { opacity: 1; }
      `;
      document.head.appendChild(css);
      bar = document.createElement('div');
      bar.id = 'rkCaptionBar';
      bar.setAttribute('role', 'status');
      bar.setAttribute('aria-live', 'polite');
      document.body.appendChild(bar);
    }
    bar.textContent = text;
    bar.classList.add('rk-cap-show');
    clearTimeout(this._captionTimer);
    // Linger long enough to be read aloud by a parent (~70ms/char, min 3.5s)
    const ms = Math.max(3500, text.length * 70);
    this._captionTimer = setTimeout(() => bar.classList.remove('rk-cap-show'), ms);
  }

  playSound(soundKey) {
    if (!this.audioEnabled) return;

    // Kind-mistake choreography: a wrong answer gets a gentle nod from the
    // character and a warm caption — never a buzzer, never silence.
    if (soundKey === 'wrong') {
      this.characterAnimation('nod');
      this.showCaption('Almost! Try again 💛');
    }

    if (window.RKAudio && window.RKAudio.playSfx && window.RKAudio.playSfx(soundKey)) {
      return;
    }

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
    // Pull topic info from SessionMgr when available; fall back to registry
    const topic = (window.SessionMgr) ? SessionMgr.getTopic(this.gameType) : null;
    const gameConfig = (typeof GAME_REGISTRY !== 'undefined' && GAME_REGISTRY[this.gameType]) || {};
    const topicIcon    = topic?.icon    || '⭐';
    const topicName    = topic?.name    || gameConfig.name        || 'Get Ready!';

    // Story framing: the learning is the means, the story is the goal.
    // Each game opens with a "why" instead of a lesson description.
    const charName = this.getCharacterName();
    const STORY_INTROS = {
      'shape-recognition': `${charName} is on a shape treasure hunt — help find them all!`,
      'color-sort':        `Oh no, ${charName}'s boxes got all mixed up — help sort them out!`,
      'number-matching':   `${charName} is counting snacks for the party — match them up!`,
      'abc-match':         `${charName} found secret letters — help crack the code!`,
      'space-pattern':     `The stars made a secret pattern — can you copy it?`,
      'space-defender':    `Protect ${charName}'s ship from the silly space rocks!`,
      'feed-alien':        `The little alien is SO hungry — feed it just the right amount!`,
      'number-line':       `Help ${charName} hop across the number bridge!`,
      'feed-by-sound':     `Listen close — feed the friend whose sound you hear!`,
      'draw-it':           `${charName} needs an artist — trace the magic shapes!`,
      'candyland':         `Sweet! Help ${charName} explore Candy Land!`,
    };
    const topicSubline = STORY_INTROS[this.gameType] || topic?.subline
      || gameConfig.description || 'Your adventure is about to begin.';

    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'interaction-overlay';
      overlay.innerHTML = `
        <div class="interaction-panel">
          <div class="interaction-adventure-label">Today's Adventure</div>
          <div class="interaction-topic-icon" aria-hidden="true">${topicIcon}</div>
          <div class="interaction-topic-name">${topicName}</div>
          <p class="interaction-desc">${topicSubline}</p>
          <button class="start-btn" id="tapToStartBtn">
            <span class="start-btn-icon">▶</span> Let's Go!
          </button>
        </div>
      `;
      Object.assign(overlay.style, {
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(6, 12, 26, 0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)'
      });

      const style = document.createElement('style');
      style.textContent = `
        @keyframes rkPanelPop {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rkBtnPulse {
          0%,100% { box-shadow: 0 8px 24px rgba(11,95,149,0.4); }
          50%     { box-shadow: 0 12px 34px rgba(242,140,24,0.45); }
        }
        .interaction-panel {
          text-align: center; color: white;
          font-family: "Fredoka", sans-serif;
          animation: rkPanelPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
          max-width: min(480px, 88vw);
          padding: 36px 32px;
          background: rgba(9,57,95,0.72);
          border: 2px solid rgba(255,255,255,0.14);
          border-radius: 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .interaction-adventure-label {
          display: inline-block;
          padding: 5px 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, #f28c18, #ffb23e);
          color: #09395f;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .interaction-topic-icon {
          font-size: clamp(52px, 16vw, 72px);
          line-height: 1;
          margin-bottom: 8px;
        }
        .interaction-topic-name {
          font-size: clamp(22px, 6.5vw, 30px);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 10px;
        }
        .interaction-desc {
          font-size: clamp(14px, 4vw, 18px);
          font-weight: 600;
          line-height: 1.3;
          margin-bottom: 26px;
          opacity: 0.80;
        }
        .start-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 38px; font-size: 24px; font-weight: 700; font-family: inherit;
          color: white; background: linear-gradient(135deg, #09395f 0%, #0b5f95 100%);
          border: 3px solid rgba(255,255,255,0.22); border-radius: 999px;
          box-shadow: 0 8px 24px rgba(11,95,149,0.4); cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: rkBtnPulse 2.2s ease-in-out 0.8s infinite;
        }
        .start-btn:hover { transform: translateY(-3px) scale(1.03); }
        .start-btn:active { transform: scale(0.96); }
        .start-btn-icon {
          display: grid; width: 36px; height: 36px; place-items: center;
          border-radius: 50%; background: rgba(255,255,255,0.18);
          font-size: 14px;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(overlay);

      const btn = document.getElementById('tapToStartBtn');
      btn.addEventListener('click', () => {
        if (window.RKAudio) {
          // unlock() activates the iOS audio context on this tap gesture
          // speak('ready') plays immediately after — no warmUp needed
          RKAudio.unlock();
          RKAudio.speak('ready');
        }
        overlay.remove();
        style.remove();

        // Init session manager and inject the phase badge
        if (window.SessionMgr) {
          SessionMgr.init(this.gameType);
          SessionMgr.injectBadge(document.body);
        }

        // Ensure loading spinner is gone so game is instantly visible
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';

        resolve();
      }, { once: true });
    });
  }

  /* ─────────────────────────────────────────────────────────
     Session Manager bridge
     ───────────────────────────────────────────────────────── */

  async reportProgress(current, total) {
    if (window.SessionMgr) {
      return SessionMgr.reportProgress(current, total, this.context);
    }
  }

  async showCelebration(opts = {}) {
    if (window.SessionMgr) {
      return SessionMgr.showCelebration(opts);
    }
  }

  syncPhase(itemsShown) {
    if (window.SessionMgr) SessionMgr.syncPhase(itemsShown);
  }

  /* ─────────────────────────────────────────────────────────
     Random Encouragement — pulls from full recorded clip pool
     ───────────────────────────────────────────────────────── */

  randomEncouragement() {
    const pool = [
      'you got it',
      'you found it',
      'great job',
      'good job',
      'yay',
      'impressive',
      'i cant believe it',
      'laugh',
      'wow',
      'keep it up'
    ];
    const key = pool[Math.floor(Math.random() * pool.length)];
    // Use speakCourtesy so encouragement never cuts off an active instruction
    // or callout clip.  Falls back to regular speak() if RKAudio isn't ready.
    if (window.RKAudio && typeof RKAudio.speakCourtesy === 'function') {
      RKAudio.speakCourtesy(key);
    } else {
      this.speak(key);
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
