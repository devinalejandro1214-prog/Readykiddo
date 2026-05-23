/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Audio Manager
   Handles:
   • Theme song (plays landing → onboarding, stops at world-reveal)
   • Voice clips (preloaded for zero-lag playback)
   • Mute state persisted across pages
   ───────────────────────────────────────────────────────── */
(function () {
  const VOICE_BASE  = 'assets/audio/voice/';
  const SFX_BASE    = 'assets/audio/sfx/';
  const THEME_PATH  = 'assets/audio/readykiddo-theme.mp3';
  const MUTE_KEY    = 'rk_muted';
  const SFX_MAP = {
    'space-shot':      { path: 'space-defender/laser-shot.mp3', volume: 0.28 },
    'space-hit':       { path: 'space-defender/ship-hit.mp3', volume: 0.36 },
    'space-destroyed': { path: 'space-defender/ship-destroyed.mp3', volume: 0.48 },
  };

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
    'find star':      'em-star.wav',
    'find rectangle': 'em-rectangle.wav',
    'find diamond':   'em-diamond.wav',

    // New generated gameplay callouts
    'find b':         'em-find-b.wav',
    'find a':         'em-find-a.wav',
    'find c':         'em-find-c.wav',
    'find d':         'em-find-d.wav',
    'find e':         'em-find-e.wav',
    'find f':         'em-find-f.wav',
    'find g':         'em-find-g.wav',
    'find h':         'em-find-h.wav',
    'find i':         'em-find-i.wav',
    'find j':         'em-find-j.wav',
    'find k':         'em-find-k.wav',
    'find l':         'em-find-l.wav',
    'find m':         'em-find-m.wav',
    'find n':         'em-find-n.wav',
    'find o':         'em-find-o.wav',
    'find p':         'em-find-p.wav',
    'find q':         'em-find-q.wav',
    'find r':         'em-find-r.wav',
    'find s':         'em-find-s.wav',
    'find t':         'em-find-t.wav',
    'find u':         'em-find-u.wav',
    'find v':         'em-find-v.wav',
    'find w':         'em-find-w.wav',
    'find x':         'em-find-x.wav',
    'find y':         'em-find-y.wav',
    'find z':         'em-find-z.wav',
    'where does a go': 'em-where-a-go.wav',
    'where does b go': 'em-where-b-go.wav',
    'where does c go': 'em-where-c-go.wav',
    'where does d go': 'em-where-d-go.wav',
    'where does e go': 'em-where-e-go.wav',
    'where does f go': 'em-where-f-go.wav',
    'where does g go': 'em-where-g-go.wav',
    'where does h go': 'em-where-h-go.wav',
    'where does i go': 'em-where-i-go.wav',
    'where does j go': 'em-where-j-go.wav',
    'where does k go': 'em-where-k-go.wav',
    'where does l go': 'em-where-l-go.wav',
    'where does m go': 'em-where-m-go.wav',
    'where does n go': 'em-where-n-go.wav',
    'where does o go': 'em-where-o-go.wav',
    'where does p go': 'em-where-p-go.wav',
    'where does q go': 'em-where-q-go.wav',
    'where does r go': 'em-where-r-go.wav',
    'where does s go': 'em-where-s-go.wav',
    'where does t go': 'em-where-t-go.wav',
    'where does u go': 'em-where-u-go.wav',
    'where does v go': 'em-where-v-go.wav',
    'where does w go': 'em-where-w-go.wav',
    'where does x go': 'em-where-x-go.wav',
    'where does y go': 'em-where-y-go.wav',
    'where does z go': 'em-where-z-go.wav',
    'starts with the sound buh': 'em-fbs-b.wav',
    'starts with the sound sss': 'em-fbs-s.wav',
    'starts with the sound mmm': 'em-fbs-m.wav',
    'starts with the sound fff': 'em-fbs-f.wav',
    'starts with the sound puh': 'em-fbs-p.wav',
    'starts with the sound duh': 'em-fbs-d.wav',
    '1': 'em-num-1.wav',
    '2': 'em-num-2.wav',
    '3': 'em-num-3.wav',
    '4': 'em-num-4.wav',
    '5': 'em-num-5.wav',
    '6': 'em-num-6.wav',
    '7': 'em-num-7.wav',
    '8': 'em-num-8.wav',
    '9': 'em-num-9.wav',
    '10': 'em-num-10.wav',
    'feed the alien 1 item': 'em-feed-alien-1.wav',
    'feed the alien 2 items': 'em-feed-alien-2.wav',
    'feed the alien 3 items': 'em-feed-alien-3.wav',
    'feed the alien 4 items': 'em-feed-alien-4.wav',
    'feed the alien 5 items': 'em-feed-alien-5.wav',
    'feed the alien 6 items': 'em-feed-alien-6.wav',
    'feed the alien 7 items': 'em-feed-alien-7.wav',
    'feed the alien 8 items': 'em-feed-alien-8.wav',
    'feed the alien 9 items': 'em-feed-alien-9.wav',
    'feed the alien 10 items': 'em-feed-alien-10.wav',
    'feed the alien 1 piece of food from the basket': 'em-feed-basket-1.wav',
    'feed the alien 2 pieces of food from the basket': 'em-feed-basket-2.wav',
    'feed the alien 3 pieces of food from the basket': 'em-feed-basket-3.wav',
    'feed the alien 4 pieces of food from the basket': 'em-feed-basket-4.wav',
    'feed the alien 5 pieces of food from the basket': 'em-feed-basket-5.wav',
    'feed the alien 6 pieces of food from the basket': 'em-feed-basket-6.wav',
    'feed the alien 7 pieces of food from the basket': 'em-feed-basket-7.wav',
    'feed the alien 8 pieces of food from the basket': 'em-feed-basket-8.wav',
    'feed the alien 9 pieces of food from the basket': 'em-feed-basket-9.wav',
    'feed the alien 10 pieces of food from the basket': 'em-feed-basket-10.wav',
    'ready for action': 'em-sd-ready.wav',
    'great effort': 'em-sd-great-effort.wav',
    'cleared all 5 levels': 'em-sd-all-clear.wav',

    // Correct feedback
    'you got it':   'em-you-got-it.m4a',
    'you found it': 'em-you-found-it.m4a',
    'great job':    'em-great-job.m4a',
    'good job':     'Em-Good job.m4a',
    'perfect':      'em-great-job.m4a',
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
    'find star':      'em-star.wav',
    'find rectangle': 'em-rectangle.wav',
    'find diamond':   'em-diamond.wav',
    'find b':         'em-find-b.wav',
    'find a':         'em-find-a.wav',
    'find c':         'em-find-c.wav',
    'find d':         'em-find-d.wav',
    'find e':         'em-find-e.wav',
    'find f':         'em-find-f.wav',
    'find g':         'em-find-g.wav',
    'find h':         'em-find-h.wav',
    'find i':         'em-find-i.wav',
    'find j':         'em-find-j.wav',
    'find k':         'em-find-k.wav',
    'find l':         'em-find-l.wav',
    'find m':         'em-find-m.wav',
    'find n':         'em-find-n.wav',
    'find o':         'em-find-o.wav',
    'find p':         'em-find-p.wav',
    'find q':         'em-find-q.wav',
    'find r':         'em-find-r.wav',
    'find s':         'em-find-s.wav',
    'find t':         'em-find-t.wav',
    'find u':         'em-find-u.wav',
    'find v':         'em-find-v.wav',
    'find w':         'em-find-w.wav',
    'find x':         'em-find-x.wav',
    'find y':         'em-find-y.wav',
    'find z':         'em-find-z.wav',
    'where does a go': 'em-where-a-go.wav',
    'where does b go': 'em-where-b-go.wav',
    'where does c go': 'em-where-c-go.wav',
    'where does d go': 'em-where-d-go.wav',
    'where does e go': 'em-where-e-go.wav',
    'where does f go': 'em-where-f-go.wav',
    'where does g go': 'em-where-g-go.wav',
    'where does h go': 'em-where-h-go.wav',
    'where does i go': 'em-where-i-go.wav',
    'where does j go': 'em-where-j-go.wav',
    'where does k go': 'em-where-k-go.wav',
    'where does l go': 'em-where-l-go.wav',
    'where does m go': 'em-where-m-go.wav',
    'where does n go': 'em-where-n-go.wav',
    'where does o go': 'em-where-o-go.wav',
    'where does p go': 'em-where-p-go.wav',
    'where does q go': 'em-where-q-go.wav',
    'where does r go': 'em-where-r-go.wav',
    'where does s go': 'em-where-s-go.wav',
    'where does t go': 'em-where-t-go.wav',
    'where does u go': 'em-where-u-go.wav',
    'where does v go': 'em-where-v-go.wav',
    'where does w go': 'em-where-w-go.wav',
    'where does x go': 'em-where-x-go.wav',
    'where does y go': 'em-where-y-go.wav',
    'where does z go': 'em-where-z-go.wav',
    'starts with the sound buh': 'em-fbs-b.wav',
    'starts with the sound sss': 'em-fbs-s.wav',
    'starts with the sound mmm': 'em-fbs-m.wav',
    'starts with the sound fff': 'em-fbs-f.wav',
    'starts with the sound puh': 'em-fbs-p.wav',
    'starts with the sound duh': 'em-fbs-d.wav',
    '1': 'em-num-1.wav',
    '2': 'em-num-2.wav',
    '3': 'em-num-3.wav',
    '4': 'em-num-4.wav',
    '5': 'em-num-5.wav',
    '6': 'em-num-6.wav',
    '7': 'em-num-7.wav',
    '8': 'em-num-8.wav',
    '9': 'em-num-9.wav',
    '10': 'em-num-10.wav',
    'feed the alien 1 item': 'em-feed-alien-1.wav',
    'feed the alien 2 items': 'em-feed-alien-2.wav',
    'feed the alien 3 items': 'em-feed-alien-3.wav',
    'feed the alien 4 items': 'em-feed-alien-4.wav',
    'feed the alien 5 items': 'em-feed-alien-5.wav',
    'feed the alien 6 items': 'em-feed-alien-6.wav',
    'feed the alien 7 items': 'em-feed-alien-7.wav',
    'feed the alien 8 items': 'em-feed-alien-8.wav',
    'feed the alien 9 items': 'em-feed-alien-9.wav',
    'feed the alien 10 items': 'em-feed-alien-10.wav',
    'feed the alien 1 piece of food from the basket': 'em-feed-basket-1.wav',
    'feed the alien 2 pieces of food from the basket': 'em-feed-basket-2.wav',
    'feed the alien 3 pieces of food from the basket': 'em-feed-basket-3.wav',
    'feed the alien 4 pieces of food from the basket': 'em-feed-basket-4.wav',
    'feed the alien 5 pieces of food from the basket': 'em-feed-basket-5.wav',
    'feed the alien 6 pieces of food from the basket': 'em-feed-basket-6.wav',
    'feed the alien 7 pieces of food from the basket': 'em-feed-basket-7.wav',
    'feed the alien 8 pieces of food from the basket': 'em-feed-basket-8.wav',
    'feed the alien 9 pieces of food from the basket': 'em-feed-basket-9.wav',
    'feed the alien 10 pieces of food from the basket': 'em-feed-basket-10.wav',
    'ready for action': 'em-sd-ready.wav',
    'great effort': 'em-sd-great-effort.wav',
    'cleared all 5 levels': 'em-sd-all-clear.wav',

    // Correct feedback — Amara's voice
    'you got it':   'Amara-Yay.m4a',
    'you found it': 'Amara-Yay we did it!.m4a',
    'great job':    'Amara-You so smart .m4a',
    'good job':     'Amara-You so smart .m4a',
    'perfect':      'Amara-You so smart .m4a',
    'yay':          'Amara-Yay.m4a',
    'impressive':        'Amara-You look so cool.m4a',
    'i cant believe it': 'Amara-Wow.m4a',
    'laugh':             'Amara-Yay.m4a',
    'wow':               'Amara-Wow.m4a',

    // Wrong feedback — Amara's voice
    'try again':    'Amara-It\'s okay, try again!.m4a',
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

  // Clips most likely to play within the first 60 s of any game.
  // These are fetched as blobs immediately (fetch has no gesture restriction)
  // so audio data is already in memory when play() is first called —
  // bypassing iOS/iPadOS's silent preload='auto' limitation.
  // Only clean filenames (no spaces / special chars) are listed here so
  // the fetch URL is always valid without manual encoding.
  const _PRIORITY_CLIPS = [
    'em-ready-lets-go.m4a',
    'em-match-colors.m4a',   'em-match-shapes.m4a',
    'em-you-got-it.m4a',     'em-you-found-it.m4a',
    'em-great-job.m4a',      'em-yay.m4a',
    'em-try-again.m4a',      'em-aww-man.m4a',
    'em-keep-it-up.m4a',     'em-almost-there.m4a',
    'em-find-red.m4a',       'em-find-blue.m4a',
    'em-find-yellow.m4a',    'em-find-orange.m4a',
    'em-find-green.m4a',     'em-find-purple.m4a',
    'em-circle.m4a',
    'Amara-Yay.m4a',         'Amara-Oh man.m4a',
  ];

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

    // ── Priority blob-fetch ──────────────────────────────────
    // fetch() works without a user gesture.  Storing blobs in memory
    // means the cached Audio element can play instantly — no network
    // round-trip at the moment the game needs the clip.
    // We replace the cache entry (HTTP src) with a blob-URL element
    // only while the original element is paused (i.e. not mid-play).
    _PRIORITY_CLIPS.forEach(filename => {
      const path = VOICE_BASE + filename;
      if (!cache[path]) return;   // skip if not in any voice map
      fetch(path)
        .then(r => r.ok ? r.blob() : null)
        .then(blob => {
          if (!blob) return;
          const existing = cache[path];
          if (existing && !existing.paused) return;  // don't interrupt active play
          const a = new Audio(URL.createObjectURL(blob));
          a.preload = 'auto';
          cache[path] = a;
        })
        .catch(() => { /* HTTP fallback stays in cache — silently ignore */ });
    });

    Object.values(SFX_MAP).forEach(({ path }) => {
      const fullPath = SFX_BASE + path;
      if (cache[fullPath]) return;
      const a = new Audio();
      a.preload = 'auto';
      a.src = fullPath;
      a.load();
      cache[fullPath] = a;
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
  const THEME_POS_KEY = 'rk_theme_pos';
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

    // Restore position from previous page so song plays continuously
    const savedPos = parseFloat(sessionStorage.getItem(THEME_POS_KEY) || '0');
    if (savedPos > 0) {
      themeAudio.currentTime = savedPos;
      sessionStorage.removeItem(THEME_POS_KEY);
    }

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

  // Save theme position before navigating away so it resumes on next page
  window.addEventListener('beforeunload', () => {
    if (themeAudio && !themeAudio.paused && themeAudio.currentTime > 0) {
      sessionStorage.setItem(THEME_POS_KEY, String(themeAudio.currentTime));
    }
  });

  /* ── Voice playback ──────────────────────────────────────── */
  let currentVoice = null;
  let currentUtterance = null;

  function normalizeKey(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[’]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getPath(key) {
    const map = getVoiceMap();
    const normalized = normalizeKey(key);
    if (!normalized) return null;

    if (map[normalized]) {
      return VOICE_BASE + map[normalized];
    }

    let bestKey = null;
    let bestLength = 0;
    for (const candidate of Object.keys(map)) {
      if (normalized.includes(candidate) && candidate.length > bestLength) {
        bestKey = candidate;
        bestLength = candidate.length;
      }
    }

    return bestKey ? VOICE_BASE + map[bestKey] : null;
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

  // Like speak(), but the returned Promise resolves when the clip *finishes*
  // (not just when it starts). Use this when you need to chain audio back-to-back.
  function speakAndWait(key) {
    if (isMuted()) return Promise.resolve(false);
    const path = getPath(key);
    if (!path) {
      return speakFallbackText(key);
    }

    if (currentVoice) {
      currentVoice.pause();
      currentVoice.currentTime = 0;
    }
    if (currentUtterance && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    }

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

    return new Promise(resolve => {
      const cleanup = () => resolve(true);
      audio.addEventListener('ended', cleanup, { once: true });
      audio.addEventListener('error', () => resolve(false), { once: true });
      audio.play().catch(() => resolve(false));
    });
  }

  function playSfx(key) {
    if (isMuted()) return false;
    const config = SFX_MAP[key];
    if (!config) return false;

    const path = SFX_BASE + config.path;
    let audio = cache[path];
    if (!audio) {
      audio = new Audio(path);
      audio.preload = 'auto';
      cache[path] = audio;
    }

    const instance = audio.cloneNode();
    instance.volume = config.volume;
    instance.muted = isMuted();
    instance.play().catch(err => {
      console.warn('[SFX] Playback failed:', path, err.message);
    });
    return true;
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
  // Playing a silent buffer activates the browser's audio session on iOS/Safari,
  // allowing subsequent HTMLAudioElement.play() calls outside a gesture window.
  // We intentionally avoid touching every cached element here — firing 100+
  // simultaneous play() calls causes a CPU spike that glitches active game loops.
  function unlock() {
    if (unlock._done) return;
    unlock._done = true;
    const a = new Audio();
    a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    a.volume = 0;
    a.play().catch(() => {});
  }

  // Called immediately after unlock() on the Let's Go tap.
  // Plays-then-pauses every cached Audio element silently within the gesture
  // window so iOS marks each one as "user-approved" for future programmatic play.
  // Without this, only the first element unlocked via unlock() gets that approval —
  // every other clip still requires its own gesture, causing the "first play silent"
  // bug on iPad/iPhone.
  function warmUp() {
    if (warmUp._done) return;
    warmUp._done = true;
    const muted = isMuted();
    Object.values(cache).forEach(audio => {
      if (!(audio instanceof Audio)) return;
      audio.muted = true;
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = muted;
        })
        .catch(() => {
          audio.muted = muted;
        });
    });
  }

  /* ── Export ──────────────────────────────────────────────── */
  window.RKAudio = {
    preloadAll,
    startTheme,
    stopTheme,
    speak,
    speakAndWait,
    playSfx,
    stopVoice,
    isMuted,
    setMuted,
    injectMuteButton,
    unlock,
    warmUp,
    createMuteButton,
  };

  // Also keep backward compat with old ReadyKiddoAudio
  window.ReadyKiddoAudio = {
    speak,
    stop: stopVoice,
    play: (path) => speak(path),
    playSfx,
    unlock,
  };

  // Start preloading immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadAll);
  } else {
    preloadAll();
  }
}());
