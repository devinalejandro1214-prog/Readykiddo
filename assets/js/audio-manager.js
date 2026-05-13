/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Audio Manager
   Handles:
   • Theme song (plays landing → onboarding, stops at world-reveal)
   • Voice clips (preloaded for zero-lag playback)
   • Mute state persisted across pages
   ───────────────────────────────────────────────────────── */
(function () {
  const VOICE_BASE  = 'assets/audio/voice/';
  const THEME_PATH  = 'assets/audio/readykiddo-theme.mp3';
  const MUTE_KEY    = 'rk_muted';
  const THEME_T_KEY = 'rk_theme_t'; // persist playback position

  /* ── Voice clip map ──────────────────────────────────────── */
  const VOICE_MAP = {
    // Game intros
    'match the colors': 'em-match-colors.m4a',
    'match the shapes': 'em-match-shapes.m4a',

    // Color callouts (Round 2)
    'find red':    'em-find-red.m4a',
    'find blue':   'em-find-blue.m4a',
    'find yellow': 'em-find-yellow.m4a',
    'find green':  'em-find-green.m4a',
    'find orange': 'em-find-orange.m4a',
    'find purple': 'em-find-purple.m4a',

    // Shape callouts (Round 2 — only 3 have recordings)
    'find circle':    'em-circle.m4a',
    'find square':    'em-square.m4a',
    'find triangle':  'em-triangle.m4a',
    // star / rectangle / diamond fall back to praise clips
    'find star':      'em-yay.m4a',
    'find rectangle': 'em-great-job.m4a',
    'find diamond':   'em-you-found-it.m4a',

    // Correct feedback (will be picked randomly)
    'you got it':   'em-you-got-it.m4a',
    'you found it': 'em-you-found-it.m4a',
    'great job':    'em-great-job.m4a',
    'good job':     'Em-Good job.m4a',
    'yay':          'em-yay.m4a',
    'impressive':   'Em-impressive.m4a',

    // Wrong feedback
    'try again': 'em-try-again.m4a',
    'aww man':   'em-aww-man.m4a',

    // General
    'keep it up':   'em-keep-it-up.m4a',
    'almost there': 'em-almost-there.m4a',
    'welcome':      'em-welcome-world.m4a',
    'ready':        'em-ready-lets-go.m4a',
    'wow':          'gray-wow.m4a',
  };

  /* ── Preload cache ───────────────────────────────────────── */
  const cache = {}; // path → HTMLAudioElement (preloaded)

  function preloadAll() {
    const paths = Object.values(VOICE_MAP).map(f => VOICE_BASE + f);
    [...new Set(paths)].forEach(path => {
      if (cache[path]) return;
      const a = new Audio();
      a.preload = 'auto';
      a.src = path;
      a.load();
      cache[path] = a;
    });
  }

  /* ── Mute state ──────────────────────────────────────────── */
  function isMuted() {
    return localStorage.getItem(MUTE_KEY) === '1';
  }
  function setMuted(val) {
    localStorage.setItem(MUTE_KEY, val ? '1' : '0');
    // Apply to theme if playing
    if (themeAudio) themeAudio.muted = val;
    // Apply to any current voice
    if (currentVoice) currentVoice.muted = val;
    // Update all mute buttons on the page
    document.querySelectorAll('.rk-mute-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', String(val));
      btn.title = val ? 'Unmute' : 'Mute';
      btn.querySelector('.rk-mute-icon').textContent = val ? '🔇' : '🔊';
    });
  }

  /* ── Theme song ──────────────────────────────────────────── */
  let themeAudio = null;
  let themeStarted = false;

  function initTheme() {
    if (themeAudio) return;
    themeAudio = new Audio(THEME_PATH);
    themeAudio.loop = true;
    themeAudio.volume = 0.35;
    themeAudio.preload = 'auto';
    themeAudio.muted = isMuted();

    // Restore playback position across page navigations
    const savedT = parseFloat(sessionStorage.getItem(THEME_T_KEY) || '0');
    if (savedT > 0) themeAudio.currentTime = savedT;

    // Periodically save current position
    setInterval(() => {
      if (themeAudio && !themeAudio.paused) {
        sessionStorage.setItem(THEME_T_KEY, String(themeAudio.currentTime));
      }
    }, 1000);
  }

  function startTheme() {
    if (themeStarted) return;
    initTheme();
    themeAudio.play().catch(() => {
      // Autoplay blocked — will start on first user interaction
      const startOnce = () => {
        themeAudio.play().catch(() => {});
        themeStarted = true;
        document.removeEventListener('pointerdown', startOnce);
        document.removeEventListener('keydown', startOnce);
      };
      document.addEventListener('pointerdown', startOnce, { once: true });
      document.addEventListener('keydown', startOnce, { once: true });
    });
    themeStarted = true;
  }

  function stopTheme() {
    if (!themeAudio) return;
    themeAudio.pause();
    themeAudio.currentTime = 0;
    sessionStorage.removeItem(THEME_T_KEY);
  }

  /* ── Voice playback ──────────────────────────────────────── */
  let currentVoice = null;

  function getPath(key) {
    const file = VOICE_MAP[key.toLowerCase().trim()];
    return file ? VOICE_BASE + file : null;
  }

  function speak(key) {
    if (isMuted()) return Promise.resolve(false);
    const path = getPath(key);
    if (!path) { console.warn('[Audio] No clip for:', key); return Promise.resolve(false); }

    // Stop any currently playing voice immediately
    if (currentVoice) {
      currentVoice.pause();
      currentVoice.currentTime = 0;
    }

    // Use preloaded element if available, otherwise create new
    let audio = cache[path];
    if (audio) {
      audio.currentTime = 0;
      audio.muted = isMuted();
    } else {
      audio = new Audio(path);
      audio.preload = 'auto';
      audio.muted = isMuted();
      cache[path] = audio;
    }

    currentVoice = audio;

    return audio.play().then(() => true).catch(err => {
      console.warn('[Audio] Playback failed:', path, err.message);
      return false;
    });
  }

  function stopVoice() {
    if (!currentVoice) return;
    currentVoice.pause();
    currentVoice.currentTime = 0;
    currentVoice = null;
  }

  /* ── Mute button factory ─────────────────────────────────── */
  function createMuteButton() {
    const btn = document.createElement('button');
    btn.className = 'rk-mute-btn';
    btn.setAttribute('aria-pressed', String(isMuted()));
    btn.title = isMuted() ? 'Unmute' : 'Mute';
    btn.setAttribute('aria-label', 'Toggle sound');
    btn.innerHTML = `<span class="rk-mute-icon">${isMuted() ? '🔇' : '🔊'}</span>`;
    btn.addEventListener('click', () => setMuted(!isMuted()));
    return btn;
  }

  function injectMuteButton(selector) {
    const container = document.querySelector(selector);
    if (!container) return;
    // Don't add twice
    if (container.querySelector('.rk-mute-btn')) return;
    container.appendChild(createMuteButton());
  }

  /* ── Unlock audio context on first tap ───────────────────── */
  function unlock() {
    // Play a silent buffer to unlock Web Audio on iOS/Safari
    const a = new Audio();
    a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    a.volume = 0;
    a.play().catch(() => {});
  }

  /* ── Export ──────────────────────────────────────────────── */
  window.RKAudio = {
    preloadAll,
    startTheme,
    stopTheme,
    speak,
    stopVoice,
    isMuted,
    setMuted,
    injectMuteButton,
    unlock,
    createMuteButton,
  };

  // Also keep backward compat with old ReadyKiddoAudio
  window.ReadyKiddoAudio = {
    speak,
    stop: stopVoice,
    play: (path) => speak(path),
    unlock,
  };

  // Start preloading immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadAll);
  } else {
    preloadAll();
  }
}());
