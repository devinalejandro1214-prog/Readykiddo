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

  /* ── Female characters use Amara's voice ────────────────── */
  // Aria, Trish, Amelia → Amara clips
  // Mica, Steven, Emmett → Em clips
  const FEMALE_CHARS = ['aria', 'trish', 'amelia'];

  function getCharacter() {
    try {
      const p = JSON.parse(localStorage.getItem('userProfile') || '{}');
      return (p.character || '').toLowerCase().trim();
    } catch(e) { return ''; }
  }

  function isFemaleChar() {
    return FEMALE_CHARS.includes(getCharacter());
  }

  /* ── Em voice map (Mica, Steven, Emmett + all game clips) ── */
  const EM_MAP = {
    // Game intros
    'match the colors': 'em-match-colors.m4a',
    'match the shapes': 'em-match-shapes.m4a',

    // Color callouts — only Em has these recordings
    'find red':    'em-find-red.m4a',
    'find blue':   'em-find-blue.m4a',
    'find yellow': 'em-find-yellow.m4a',
    'find green':  'em-find-green.m4a',
    'find orange': 'em-find-orange.m4a',
    'find purple': 'em-find-purple.m4a',

    // Shape callouts — only Em has these recordings
    'find circle':    'em-circle.m4a',
    'find square':    'em-square.m4a',
    'find triangle':  'em-triangle.m4a',
    'find star':      'em-yay.m4a',
    'find rectangle': 'em-great-job.m4a',
    'find diamond':   'em-you-found-it.m4a',

    // Correct feedback
    'you got it':   'em-you-got-it.m4a',
    'you found it': 'em-you-found-it.m4a',
    'great job':    'em-great-job.m4a',
    'good job':     'Em-Good job.m4a',
    'yay':          'em-yay.m4a',
    'impressive':   'Em-impressive.m4a',
    'i cant believe it': 'Em-I canâ€™t believe it.m4a',
    'laugh':        'Em-Laugh.m4a',

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

  /* ── Amara map (Aria, Trish, Amelia) ─────────────────────── */
  // Game-specific clips (color/shape callouts) fall through to Em
  // since only Em has those recordings
  const AMARA_MAP = {
    // Game intros — use Em's since Amara has no game-specific clips
    'match the colors': 'em-match-colors.m4a',
    'match the shapes': 'em-match-shapes.m4a',

    // Color/shape callouts — always Em (only Em has these)
    'find red':       'em-find-red.m4a',
    'find blue':      'em-find-blue.m4a',
    'find yellow':    'em-find-yellow.m4a',
    'find green':     'em-find-green.m4a',
    'find orange':    'em-find-orange.m4a',
    'find purple':    'em-find-purple.m4a',
    'find circle':    'em-circle.m4a',
    'find square':    'em-square.m4a',
    'find triangle':  'em-triangle.m4a',
    'find star':      'Amara-Yay.m4a',
    'find rectangle': 'Amara-You so smart .m4a',
    'find diamond':   'Amara-Wow.m4a',

    // Correct feedback — Amara's voice
    'you got it':   'Amara-Yay.m4a',
    'you found it': 'Amara-Yay we did it!.m4a',
    'great job':    'Amara-You so smart .m4a',
    'good job':     'Amara-You so smart .m4a',
    'yay':          'Amara-Yay.m4a',
    'impressive':   'Amara-You look so cool.m4a',
    'wow':          'Amara-Wow.m4a',

    // Wrong feedback — Amara's voice
    'try again':    'Amara-Itâ€™s okay, try again!.m4a',
    'aww man':      'Amara-Oh man.m4a',
    'oh no':        'Amara-Oh no!.m4a',

    // General — Amara's voice
    'keep it up':   'Amara-Keep going.m4a',
    'almost there': 'Amara-Almost there .m4a',
    'welcome':      'Amara-Welcome to your world .m4a',
    'hello':        'Amara-Hello, hello there .m4a',
    'hi':           'Amara-Hi.m4a',
    'nice to meet': 'Amara-Hi nice to meet you .m4a',
    'you look cool':'Amara-You look so cool.m4a',
    'you so smart': 'Amara-You so smart .m4a',

    // Fall through to Em for anything else
    'ready':        'em-ready-lets-go.m4a',
  };

  function getVoiceMap() {
    return isFemaleChar() ? AMARA_MAP : EM_MAP;
  }


  /* ── Preload cache ───────────────────────────────────────── */
  const cache = {}; // path → HTMLAudioElement (preloaded)

  function preloadAll() {
    // Preload both maps so clips are ready regardless of character selection timing
    const allFiles = [
      ...Object.values(EM_MAP),
      ...Object.values(AMARA_MAP)
    ];
    [...new Set(allFiles)].map(f => VOICE_BASE + f).forEach(path => {
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
    themeAudio.loop = false;   // play once, stop naturally at end
    themeAudio.volume = 0.35;
    themeAudio.preload = 'auto';
    themeAudio.muted = isMuted();
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
  }

  /* ── Voice playback ──────────────────────────────────────── */
  let currentVoice = null;
  let currentUtterance = null;

  function getPath(key) {
    const map = getVoiceMap();
    const file = map[key.toLowerCase().trim()];
    return file ? VOICE_BASE + file : null;
  }

  function speakFallbackText(text) {
    if (isMuted() || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      return Promise.resolve(false);
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = 0.95;
      utterance.pitch = isFemaleChar() ? 1.08 : 0.98;
      currentUtterance = utterance;

      return new Promise(resolve => {
        utterance.onend = () => {
          if (currentUtterance === utterance) currentUtterance = null;
          resolve(true);
        };
        utterance.onerror = () => {
          if (currentUtterance === utterance) currentUtterance = null;
          resolve(false);
        };
        window.speechSynthesis.speak(utterance);
      });
    } catch (err) {
      console.warn('[Audio] Speech fallback failed:', err.message);
      return Promise.resolve(false);
    }
  }

  function speak(key) {
    if (isMuted()) return Promise.resolve(false);
    const path = getPath(key);
    if (!path) {
      return speakFallbackText(key);
    }

    // Stop any currently playing voice immediately
    if (currentVoice) {
      currentVoice.pause();
      currentVoice.currentTime = 0;
    }
    if (currentUtterance && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
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
    if (currentVoice) {
      currentVoice.pause();
      currentVoice.currentTime = 0;
      currentVoice = null;
    }
    if (currentUtterance && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    }
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
