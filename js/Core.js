/**
 * Core.js — Central orchestrator. Manages the 5-stage Onboarding-to-Dashboard lifecycle.
 * Imports and wires State, Environment, Physics, and Audio modules.
 */

import * as State from './State.js';
import * as Env   from './Environment.js';
import * as Phys  from './Physics.js';
import * as Audio from './Audio.js';

// ─── Stage Configuration ───────────────────────────────────────────────────────

const INTERESTS = [
  { id: 'space',      label: 'Deep Space',       icon: '🚀', sub: 'Stars, planets & cosmic adventure' },
  { id: 'horology',   label: 'Clockwork Gears',  icon: '⚙️',  sub: 'Gears, clocks & invention' },
  { id: 'dinosaurs',  label: 'Dino World',        icon: '🦕', sub: 'Prehistoric beasts & discovery' },
  { id: 'deepsea',    label: 'Deep Sea',          icon: '🌊', sub: 'Ocean mysteries & sea creatures' },
  { id: 'jungle',     label: 'Jungle Canopy',     icon: '🌿', sub: 'Wild animals & tropical adventure' },
  { id: 'classiclit', label: 'Classic Stories',   icon: '📖', sub: 'Timeless tales & legendary characters' },
];

const AVATARS = [
  { id: 'sherlock',  label: 'Sherlock Holmes',    icon: '🔍', desc: 'The Great Detective' },
  { id: 'pooh',      label: 'Winnie the Pooh',    icon: '🍯', desc: 'The Honey Bear' },
  { id: 'alice',     label: 'Alice',               icon: '🐇', desc: 'Down the Rabbit Hole' },
  { id: 'robinhood', label: 'Robin Hood',          icon: '🏹', desc: 'The Forest Hero' },
  { id: 'peterpan',  label: 'Peter Pan',           icon: '✨', desc: 'The Boy Who Flew' },
  { id: 'mowgli',    label: 'Mowgli',              icon: '🐆', desc: 'The Jungle Boy' },
  { id: 'dorothy',   label: 'Dorothy',             icon: '👟', desc: 'There\'s No Place Like Home' },
  { id: 'mermaid',   label: 'The Little Mermaid',  icon: '🐠', desc: 'Part of Your World' },
];

const VIBES = [
  { id: 'calm',     label: 'Calm & Focused',  icon: '🌙', desc: 'Slow, gentle, soft animations' },
  { id: 'balanced', label: 'Balanced',         icon: '⚡', desc: 'Smooth, responsive, just right' },
  { id: 'active',   label: 'High Energy',      icon: '🔥', desc: 'Fast, vibrant, dynamic!' },
];

const MUSIC = [
  { id: 'lofi',        label: 'Lo-Fi Nature',          icon: '🍃', desc: 'Rain & vinyl pads' },
  { id: 'orchestral',  label: 'Orchestral Adventure',  icon: '🎻', desc: 'Cinematic strings' },
  { id: 'synthwave',   label: 'Synth-Wave Space',      icon: '🎹', desc: 'Arpeggiated synths' },
  { id: '8bit',        label: '8-Bit Retro',           icon: '🕹️', desc: 'Chiptune melodies' },
];

const PLAY_CONTENT = [
  { id: 'g_dino',  title: 'Dino Diggers',  icon: '🦕', url: 'dino_diggers.html' },
  { id: 'g_robot', title: 'Robot Friends', icon: '🤖', url: 'robot_game.html'  },
  { id: 'g_math',  title: 'Math Monsters', icon: '🔢', url: '#' },
  { id: 'g_spell', title: 'Spell Quest',   icon: '✏️',  url: '#' },
];

const WATCH_CONTENT = [
  { id: 'w1', title: 'Cosmic Explorers',      icon: '🌌' },
  { id: 'w2', title: 'Storytime Adventures',  icon: '📚' },
  { id: 'w3', title: 'Wild Earth',            icon: '🌍' },
];

// ─── Bootstrap ────────────────────────────────────────────────────────────────

export function init() {
  _ensureEnvLayer();

  // If we have a complete saved profile, skip onboarding
  if (State.loadFromStorage() && State.isProfileComplete()) {
    _buildWorld();
    return;
  }

  _showStage(1);
}

// ─── Stage Routing ─────────────────────────────────────────────────────────────

function _showStage(n) {
  const app = document.getElementById('app');
  if (!app) return;

  // Clear & animate out
  app.classList.add('stage-exit');
  setTimeout(() => {
    app.innerHTML = '';
    app.classList.remove('stage-exit');
    switch (n) {
      case 1: _stage1_Name(app);     break;
      case 2: _stage2_Interest(app); break;
      case 3: _stage3_Avatar(app);   break;
      case 4: _stage4_Vibe(app);     break;
      case 5: _stage5_Music(app);    break;
    }
    requestAnimationFrame(() => app.classList.add('stage-enter'));
    setTimeout(() => app.classList.remove('stage-enter'), 600);
  }, 400);
}

// ─── Stage 1: Name ─────────────────────────────────────────────────────────────

function _stage1_Name(container) {
  container.innerHTML = `
    <div class="ob-stage">
      <div class="ob-card glass-panel">
        <div class="ob-step-indicator">Step 1 of 5</div>
        <h1 class="ob-title">What's your name, Explorer?</h1>
        <p class="ob-sub">We'll use it to personalise your world.</p>
        <input id="ob-name" class="ob-input" type="text" maxlength="24"
               placeholder="Type your name..." value="${State.getState('name') || ''}">
        <p class="ob-pulse-hint" id="pulse-hint"></p>
        <button id="ob-next" class="ob-btn" disabled>Continue →</button>
      </div>
    </div>`;

  const input = container.querySelector('#ob-name');
  const btn   = container.querySelector('#ob-next');
  const hint  = container.querySelector('#pulse-hint');

  input.addEventListener('input', () => {
    const val = input.value.trim();
    btn.disabled = val.length < 2;
    // Background pulse on keystroke
    document.getElementById('env-layer').style.filter =
      `brightness(${1 + val.length * 0.02})`;
    setTimeout(() => { document.getElementById('env-layer').style.filter = ''; }, 300);
    hint.textContent = val.length >= 2 ? `Nice to meet you, ${val}! 👋` : '';
  });

  btn.addEventListener('click', () => {
    State.setState('name', input.value.trim());
    _showStage(2);
  });

  input.focus();
}

// ─── Stage 2: Interest ─────────────────────────────────────────────────────────

function _stage2_Interest(container) {
  container.innerHTML = `
    <div class="ob-stage">
      <div class="ob-card glass-panel wide">
        <div class="ob-step-indicator">Step 2 of 5 — Hello, ${State.getState('name')}!</div>
        <h1 class="ob-title">Choose your World</h1>
        <p class="ob-sub">This shapes everything about your adventure.</p>
        <div class="ob-grid" id="interest-grid">
          ${INTERESTS.map(i => `
            <button class="ob-choice" data-id="${i.id}">
              <span class="ob-choice-icon">${i.icon}</span>
              <span class="ob-choice-label">${i.label}</span>
              <span class="ob-choice-sub">${i.sub}</span>
            </button>`).join('')}
        </div>
        <button id="ob-next" class="ob-btn" disabled>Continue →</button>
      </div>
    </div>`;

  let selected = State.getState('interest');
  const btn = container.querySelector('#ob-next');
  if (selected) { _markSelected(container, selected); btn.disabled = false; }

  container.querySelectorAll('.ob-choice').forEach(el => {
    el.addEventListener('click', () => {
      selected = el.dataset.id;
      _markSelected(container, selected);
      btn.disabled = false;
      // "Leak" theme into the environment immediately
      Env.activate(selected, document.getElementById('env-layer'));
    });
  });

  btn.addEventListener('click', () => {
    State.setState('interest', selected);
    _showStage(3);
  });
}

// ─── Stage 3: Avatar ───────────────────────────────────────────────────────────

function _stage3_Avatar(container) {
  container.innerHTML = `
    <div class="ob-stage">
      <div class="ob-card glass-panel wide">
        <div class="ob-step-indicator">Step 3 of 5</div>
        <h1 class="ob-title">Choose your Companion</h1>
        <p class="ob-sub">Your guide through every adventure.</p>
        <div class="ob-grid avatar-grid" id="avatar-grid">
          ${AVATARS.map(a => `
            <button class="ob-choice" data-id="${a.id}">
              <span class="ob-choice-icon">${a.icon}</span>
              <span class="ob-choice-label">${a.label}</span>
              <span class="ob-choice-sub">${a.desc}</span>
            </button>`).join('')}
        </div>
        <button id="ob-next" class="ob-btn" disabled>Continue →</button>
      </div>
    </div>`;

  let selected = State.getState('avatar');
  const btn = container.querySelector('#ob-next');
  if (selected) { _markSelected(container, selected); btn.disabled = false; }

  container.querySelectorAll('.ob-choice').forEach(el => {
    el.addEventListener('click', () => {
      selected = el.dataset.id;
      _markSelected(container, selected);
      btn.disabled = false;
      Env.applyAvatar(selected);
    });
  });

  btn.addEventListener('click', () => {
    State.setState('avatar', selected);
    _showStage(4);
  });
}

// ─── Stage 4: Vibe ─────────────────────────────────────────────────────────────

function _stage4_Vibe(container) {
  container.innerHTML = `
    <div class="ob-stage">
      <div class="ob-card glass-panel">
        <div class="ob-step-indicator">Step 4 of 5</div>
        <h1 class="ob-title">Choose your Vibe</h1>
        <p class="ob-sub">This controls speed, animations, and feel.</p>
        <div class="ob-stack" id="vibe-grid">
          ${VIBES.map(v => `
            <button class="ob-choice horiz" data-id="${v.id}">
              <span class="ob-choice-icon">${v.icon}</span>
              <div class="ob-choice-text">
                <span class="ob-choice-label">${v.label}</span>
                <span class="ob-choice-sub">${v.desc}</span>
              </div>
            </button>`).join('')}
        </div>
        <button id="ob-next" class="ob-btn" disabled>Continue →</button>
      </div>
    </div>`;

  let selected = State.getState('vibe');
  const btn = container.querySelector('#ob-next');
  if (selected) { _markSelected(container, selected); btn.disabled = false; }

  container.querySelectorAll('.ob-choice').forEach(el => {
    el.addEventListener('click', () => {
      selected = el.dataset.id;
      _markSelected(container, selected);
      btn.disabled = false;
      Phys.applyVibe(selected);
    });
  });

  btn.addEventListener('click', () => {
    State.setState('vibe', selected);
    _showStage(5);
  });
}

// ─── Stage 5: Music ────────────────────────────────────────────────────────────

function _stage5_Music(container) {
  container.innerHTML = `
    <div class="ob-stage">
      <div class="ob-card glass-panel">
        <div class="ob-step-indicator">Step 5 of 5</div>
        <h1 class="ob-title">Pick your Soundtrack</h1>
        <p class="ob-sub">What sounds best for your adventure?</p>
        <div class="ob-stack" id="music-grid">
          ${MUSIC.map(m => `
            <button class="ob-choice horiz" data-id="${m.id}">
              <span class="ob-choice-icon">${m.icon}</span>
              <div class="ob-choice-text">
                <span class="ob-choice-label">${m.label}</span>
                <span class="ob-choice-sub">${m.desc}</span>
              </div>
            </button>`).join('')}
        </div>
        <button id="ob-next" class="ob-btn" disabled>Build My World →</button>
      </div>
    </div>`;

  let selected = State.getState('music');
  const btn = container.querySelector('#ob-next');
  if (selected) { _markSelected(container, selected); btn.disabled = false; }

  container.querySelectorAll('.ob-choice').forEach(el => {
    el.addEventListener('click', () => {
      selected = el.dataset.id;
      _markSelected(container, selected);
      btn.disabled = false;
      Audio.play(selected);
    });
  });

  btn.addEventListener('click', () => {
    State.setState('music', selected);
    _buildWorld();
  });
}

// ─── Dashboard: Build World ────────────────────────────────────────────────────

function _buildWorld() {
  const profile = State.getProfile();
  const avatar  = Env.AVATAR_PALETTES[profile.avatar] || Env.AVATAR_PALETTES.sherlock;
  const theme   = Env.INTEREST_THEMES[profile.interest] || Env.INTEREST_THEMES.space;

  // Apply environment + vibe + avatar
  Env.activate(profile.interest, document.getElementById('env-layer'));
  Env.applyAvatar(profile.avatar);
  Phys.applyVibe(profile.vibe);
  Audio.play(profile.music);

  const app = document.getElementById('app');
  app.classList.add('stage-exit');

  setTimeout(() => {
    app.classList.remove('stage-exit');
    app.innerHTML = `
      <div id="dashboard">
        <!-- TOP NAV -->
        <header class="dash-header glass-panel">
          <div class="dash-logo">ReadyKiddo</div>
          <div class="dash-search">
            <input type="text" placeholder="Search..." class="dash-search-input">
          </div>
          <div class="dash-profile" id="profile-btn">
            <span class="avatar-icon">${_avatarIcon(profile.avatar)}</span>
            <span class="profile-name">${profile.name}</span>
          </div>
        </header>

        <!-- HERO -->
        <div class="dash-hero glass-panel">
          <div class="hero-avatar floating" id="hero-avatar">
            <span class="hero-avatar-icon">${_avatarIcon(profile.avatar)}</span>
          </div>
          <div class="hero-text">
            <h2 class="hero-greeting">Welcome back, <span style="color:var(--avatar-accent)">${profile.name}</span>!</h2>
            <p class="hero-sub">Your ${theme.accent ? `<span style="color:var(--theme-accent)">${_interestLabel(profile.interest)}</span>` : _interestLabel(profile.interest)} world is ready.</p>
          </div>
        </div>

        <!-- PLAY RAIL -->
        <section class="dash-rail">
          <h3 class="rail-title">▶ PLAY</h3>
          <div class="rail-track" id="play-rail">
            ${PLAY_CONTENT.map(c => _cardHTML(c, 'play')).join('')}
          </div>
        </section>

        <!-- WATCH RAIL -->
        <section class="dash-rail">
          <h3 class="rail-title">📺 WATCH</h3>
          <div class="rail-track" id="watch-rail">
            ${WATCH_CONTENT.map(c => _cardHTML(c, 'watch')).join('')}
          </div>
        </section>

        <!-- RESET LINK -->
        <div style="text-align:center;padding-bottom:2rem;">
          <button id="reset-btn" class="subtle-btn">Change my world →</button>
        </div>
      </div>

      <!-- GAME LAYER -->
      <div id="game-layer" class="game-layer hidden">
        <div class="game-layer-header glass-panel">
          <button id="back-btn" class="ob-btn" style="width:auto;padding:.8rem 1.5rem;">← Back to World</button>
          <h2 id="game-title" style="color:white;margin:0;"></h2>
          <div style="width:160px;"></div>
        </div>
        <div id="game-iframe-container" class="game-iframe-container glass-panel">
          <p style="color:rgba(255,255,255,.5);font-size:1.2rem;">Game loading...</p>
        </div>
      </div>`;

    // ── Magnetic Card Interactions ──
    _initMagneticCards();

    // ── Game open/close ──
    document.querySelectorAll('.dash-card').forEach(card => {
      card.addEventListener('click', () => {
        const url   = card.dataset.url;
        const title = card.dataset.title;
        const type  = card.dataset.type;
        if (type === 'play' && url && url !== '#') {
          window.ReadyKiddo.openGame(url, title);
        }
      });
    });

    document.getElementById('back-btn')?.addEventListener('click', () => {
      window.ReadyKiddo.closeGame();
    });

    document.getElementById('reset-btn')?.addEventListener('click', () => {
      State.resetProfile();
      Audio.stop();
      Env.teardown();
      _showStage(1);
    });

    document.getElementById('profile-btn')?.addEventListener('click', () => {
      State.resetProfile();
      Audio.stop();
      Env.teardown();
      _showStage(1);
    });

    requestAnimationFrame(() => app.classList.add('stage-enter'));
    setTimeout(() => app.classList.remove('stage-enter'), 600);
  }, 400);
}

// ─── GameAPI Bridge ─────────────────────────────────────────────────────────────

export function initGameAPI() {
  window.ReadyKiddo = {
    openGame(url, title) {
      const gameLayer = document.getElementById('game-layer');
      const dashboard = document.getElementById('dashboard');
      const gameTitle = document.getElementById('game-title');
      const container = document.getElementById('game-iframe-container');
      if (!gameLayer) return;

      if (gameTitle) gameTitle.textContent = title || 'Game';
      if (container) container.innerHTML = url && url !== '#'
        ? `<iframe src="${url}" class="game-iframe" allowfullscreen></iframe>`
        : `<p style="color:white;font-size:2rem;text-align:center;">🚧 Coming Soon!</p>`;

      // Zoom-into-world transition
      if (dashboard) {
        dashboard.style.transform = 'scale(5)';
        dashboard.style.opacity   = '0';
        dashboard.style.transition = 'transform 1s ease-in, opacity 0.5s 0.4s ease-in';
      }
      setTimeout(() => {
        if (dashboard) dashboard.style.display = 'none';
        gameLayer.classList.remove('hidden');
        gameLayer.style.opacity = '0';
        requestAnimationFrame(() => {
          gameLayer.style.transition = 'opacity 0.5s ease-out';
          gameLayer.style.opacity    = '1';
        });
      }, 900);
    },

    closeGame() {
      const gameLayer = document.getElementById('game-layer');
      const dashboard = document.getElementById('dashboard');
      if (!gameLayer) return;

      gameLayer.style.opacity = '0';
      setTimeout(() => {
        gameLayer.classList.add('hidden');
        gameLayer.style.opacity = '';
        if (dashboard) {
          dashboard.style.display = '';
          dashboard.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
          dashboard.style.transform = 'scale(1)';
          dashboard.style.opacity   = '1';
        }
        // Clean iframe to stop any game audio
        const c = document.getElementById('game-iframe-container');
        if (c) c.innerHTML = '';
        Env.triggerReward(State.getState('interest'));
      }, 500);
    },

    sendReward(interest) {
      Env.triggerReward(interest || State.getState('interest'));
      Audio.playChime();
    },

    requestFullScreen() {
      document.getElementById('game-layer')?.requestFullscreen?.();
    }
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _ensureEnvLayer() {
  if (!document.getElementById('env-layer')) {
    const div = document.createElement('div');
    div.id = 'env-layer';
    div.style.cssText = 'position:fixed;inset:0;z-index:-1;overflow:hidden;';
    document.body.prepend(div);
  }
  // Default space environment on load
  Env.activate('space', document.getElementById('env-layer'));
}

function _avatarIcon(id) {
  const icons = { sherlock:'🔍',pooh:'🍯',alice:'🐇',robinhood:'🏹',
                  peterpan:'✨',mowgli:'🐆',dorothy:'👟',mermaid:'🐠' };
  return icons[id] || '⭐';
}

function _interestLabel(id) {
  return INTERESTS.find(i => i.id === id)?.label || id;
}

function _cardHTML(item, type) {
  return `
    <div class="dash-card glass-panel" data-type="${type}"
         data-url="${item.url||'#'}" data-title="${item.title}">
      <div class="card-icon">${item.icon}</div>
      <div class="card-label">${item.title}</div>
    </div>`;
}

function _markSelected(container, id) {
  container.querySelectorAll('.ob-choice').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
}

function _initMagneticCards() {
  const { getMagneticPull } = Phys;
  document.querySelectorAll('.dash-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * 18;
      const ry = ((e.clientX - rect.left) / rect.width  - 0.5) * -18;
      const { x, y } = getMagneticPull(e, rect, 0.3);
      card.style.transform = `rotate3d(${rx}, ${ry}, 0, 12deg) translate(${x}px, ${y}px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
