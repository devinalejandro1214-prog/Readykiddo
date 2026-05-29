/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Audio Manager  v2.0 (lean & stable)

   Rules:
   • One voice at a time — speak() always stops the current clip first
   • speakAndWait() resolves when the clip fully finishes
   • speakCourtesy() skips silently if anything is playing (no queue)
   • unlock() on first tap — all clips work after that on iOS
   • Only ~20 critical clips preloaded on desktop; mobile loads on demand
   • Theme is always lazy (preload:none) — never blocks page render
   • warmUp() kept as no-op for backward compat — no longer needed
   ───────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const VOICE_BASE = 'assets/audio/voice/';
  const SFX_BASE   = 'assets/audio/sfx/';
  const THEME_PATH = 'assets/audio/readykiddo-theme.mp3';
  const MUTE_KEY   = 'rk_muted';

  /* ── SFX map ─────────────────────────────────────────────── */
  const SFX_MAP = {
    'space-shot':      { path: 'space-defender/laser-shot.mp3',     volume: 0.28 },
    'space-hit':       { path: 'space-defender/ship-hit.mp3',       volume: 0.36 },
    'space-destroyed': { path: 'space-defender/ship-destroyed.mp3', volume: 0.48 },
  };

  /* ── Character voice selection ───────────────────────────── */
  const FEMALE_CHARS = ['aria', 'trish', 'amelia'];
  function getCharacter() {
    try { return (JSON.parse(localStorage.getItem('userProfile') || '{}').character || '').toLowerCase().trim(); }
    catch (e) { return ''; }
  }
  function isFemaleChar() { return FEMALE_CHARS.includes(getCharacter()); }

  /* ── Em voice map ────────────────────────────────────────── */
  const EM_MAP = {
    // Op 9 housekeeping: game intros + color callouts + circle/square/triangle
    // now use the TEACHER voice (see TEACHER_MAP). Their old .m4a recordings
    // were removed from the repo, so they're no longer mapped here.

    // Shape callouts (existing teacher .wav)
    'find star':      'em-star.wav',
    'find rectangle': 'em-rectangle.wav',
    'find diamond':   'em-diamond.wav',

    // Letter callouts
    'find a': 'em-find-a.wav', 'find b': 'em-find-b.wav', 'find c': 'em-find-c.wav',
    'find d': 'em-find-d.wav', 'find e': 'em-find-e.wav', 'find f': 'em-find-f.wav',
    'find g': 'em-find-g.wav', 'find h': 'em-find-h.wav', 'find i': 'em-find-i.wav',
    'find j': 'em-find-j.wav', 'find k': 'em-find-k.wav', 'find l': 'em-find-l.wav',
    'find m': 'em-find-m.wav', 'find n': 'em-find-n.wav', 'find o': 'em-find-o.wav',
    'find p': 'em-find-p.wav', 'find q': 'em-find-q.wav', 'find r': 'em-find-r.wav',
    'find s': 'em-find-s.wav', 'find t': 'em-find-t.wav', 'find u': 'em-find-u.wav',
    'find v': 'em-find-v.wav', 'find w': 'em-find-w.wav', 'find x': 'em-find-x.wav',
    'find y': 'em-find-y.wav', 'find z': 'em-find-z.wav',

    // Letter placement prompts
    'where does a go': 'em-where-a-go.wav', 'where does b go': 'em-where-b-go.wav',
    'where does c go': 'em-where-c-go.wav', 'where does d go': 'em-where-d-go.wav',
    'where does e go': 'em-where-e-go.wav', 'where does f go': 'em-where-f-go.wav',
    'where does g go': 'em-where-g-go.wav', 'where does h go': 'em-where-h-go.wav',
    'where does i go': 'em-where-i-go.wav', 'where does j go': 'em-where-j-go.wav',
    'where does k go': 'em-where-k-go.wav', 'where does l go': 'em-where-l-go.wav',
    'where does m go': 'em-where-m-go.wav', 'where does n go': 'em-where-n-go.wav',
    'where does o go': 'em-where-o-go.wav', 'where does p go': 'em-where-p-go.wav',
    'where does q go': 'em-where-q-go.wav', 'where does r go': 'em-where-r-go.wav',
    'where does s go': 'em-where-s-go.wav', 'where does t go': 'em-where-t-go.wav',
    'where does u go': 'em-where-u-go.wav', 'where does v go': 'em-where-v-go.wav',
    'where does w go': 'em-where-w-go.wav', 'where does x go': 'em-where-x-go.wav',
    'where does y go': 'em-where-y-go.wav', 'where does z go': 'em-where-z-go.wav',

    // Sound Safari
    'starts with the sound buh': 'em-fbs-b.wav',
    'starts with the sound sss': 'em-fbs-s.wav',
    'starts with the sound mmm': 'em-fbs-m.wav',
    'starts with the sound fff': 'em-fbs-f.wav',
    'starts with the sound puh': 'em-fbs-p.wav',
    'starts with the sound duh': 'em-fbs-d.wav',

    // Numbers
    '1':  'em-num-1.wav',  '2':  'em-num-2.wav',  '3':  'em-num-3.wav',
    '4':  'em-num-4.wav',  '5':  'em-num-5.wav',  '6':  'em-num-6.wav',
    '7':  'em-num-7.wav',  '8':  'em-num-8.wav',  '9':  'em-num-9.wav',
    '10': 'em-num-10.wav',

    // Feed Alien — item counts
    'feed the alien 1 item':   'em-feed-alien-1.wav',
    'feed the alien 2 items':  'em-feed-alien-2.wav',
    'feed the alien 3 items':  'em-feed-alien-3.wav',
    'feed the alien 4 items':  'em-feed-alien-4.wav',
    'feed the alien 5 items':  'em-feed-alien-5.wav',
    'feed the alien 6 items':  'em-feed-alien-6.wav',
    'feed the alien 7 items':  'em-feed-alien-7.wav',
    'feed the alien 8 items':  'em-feed-alien-8.wav',
    'feed the alien 9 items':  'em-feed-alien-9.wav',
    'feed the alien 10 items': 'em-feed-alien-10.wav',

    // Feed Alien — basket counts
    'feed the alien 1 piece of food from the basket':   'em-feed-basket-1.wav',
    'feed the alien 2 pieces of food from the basket':  'em-feed-basket-2.wav',
    'feed the alien 3 pieces of food from the basket':  'em-feed-basket-3.wav',
    'feed the alien 4 pieces of food from the basket':  'em-feed-basket-4.wav',
    'feed the alien 5 pieces of food from the basket':  'em-feed-basket-5.wav',
    'feed the alien 6 pieces of food from the basket':  'em-feed-basket-6.wav',
    'feed the alien 7 pieces of food from the basket':  'em-feed-basket-7.wav',
    'feed the alien 8 pieces of food from the basket':  'em-feed-basket-8.wav',
    'feed the alien 9 pieces of food from the basket':  'em-feed-basket-9.wav',
    'feed the alien 10 pieces of food from the basket': 'em-feed-basket-10.wav',

    // Space Defender
    'ready for action':    'em-sd-ready.wav',
    'great effort':        'em-sd-great-effort.wav',
    'cleared all 5 levels':'em-sd-all-clear.wav',

    // Correct feedback
    'you got it':        'em-you-got-it.m4a',
    'you found it':      'em-you-found-it.m4a',
    'great job':         'em-great-job.m4a',
    'good job':          'em-good-job.m4a',
    'perfect':           'em-great-job.m4a',
    'yay':               'em-yay.m4a',
    'impressive':        'em-impressive.m4a',
    'i cant believe it': 'em-i-cant-believe-it.m4a',
    'laugh':             'em-laugh.m4a',
    'wow':               'gray-wow.m4a',

    // Wrong feedback
    'try again': 'em-try-again.m4a',
    'aww man':   'em-aww-man.m4a',

    // General
    'keep it up':   'em-keep-it-up.m4a',
    'almost there': 'em-almost-there.m4a',
    'welcome':      'em-welcome-world.m4a',
    'ready':        'em-ready-lets-go.m4a',
  };

  /* ── Amara voice map ─────────────────────────────────────── */
  // Game callouts all use Em's recordings (only Em has those)
  // Feedback clips use Amara's voice
  const AMARA_MAP = {
    ...EM_MAP,  // inherit all callouts and numbers from Em

    // Override feedback with Amara's voice
    'you got it':        'amara-yay.m4a',
    'you found it':      'amara-yay-we-did-it.m4a',
    'great job':         'amara-you-so-smart.m4a',
    'good job':          'amara-you-so-smart.m4a',
    'perfect':           'amara-you-so-smart.m4a',
    'yay':               'amara-yay.m4a',
    'impressive':        'amara-you-look-so-cool.m4a',
    'i cant believe it': 'amara-wow.m4a',
    'laugh':             'amara-yay.m4a',
    'wow':               'amara-wow.m4a',
    'try again':         "amara-its-okay-try-again.m4a",
    'aww man':           'amara-oh-man.m4a',
    'keep it up':        'amara-keep-going.m4a',
    'almost there':      'amara-almost-there.m4a',
    'welcome':           'amara-welcome-to-your-world.m4a',
  };

  /* ── Teacher voice map (Op 9) ────────────────────────────────
     The TEACHER voice (Kokoro 'af_sky', .wav) speaks all DIRECTIONS.
     It is character-INDEPENDENT — every child hears the same teacher
     for "what to do". Encouragement stays in EM_MAP / AMARA_MAP. */
  const TEACHER_MAP = {
    // Game intros
    'match the colors': 'teacher-match-colors.wav',
    'match the shapes': 'teacher-match-shapes.wav',

    // Color callouts (regenerated as teacher)
    'find red':    'teacher-find-red.wav',
    'find blue':   'teacher-find-blue.wav',
    'find yellow': 'teacher-find-yellow.wav',
    'find green':  'teacher-find-green.wav',
    'find orange': 'teacher-find-orange.wav',
    'find purple': 'teacher-find-purple.wav',

    // Shape callouts
    'find circle':    'teacher-circle.wav',
    'find square':    'teacher-square.wav',
    'find triangle':  'teacher-triangle.wav',
    'find star':      'em-star.wav',
    'find rectangle': 'em-rectangle.wav',
    'find diamond':   'em-diamond.wav',

    // Letter callouts (existing teacher .wav)
    'find a': 'em-find-a.wav', 'find b': 'em-find-b.wav', 'find c': 'em-find-c.wav',
    'find d': 'em-find-d.wav', 'find e': 'em-find-e.wav', 'find f': 'em-find-f.wav',
    'find g': 'em-find-g.wav', 'find h': 'em-find-h.wav', 'find i': 'em-find-i.wav',
    'find j': 'em-find-j.wav', 'find k': 'em-find-k.wav', 'find l': 'em-find-l.wav',
    'find m': 'em-find-m.wav', 'find n': 'em-find-n.wav', 'find o': 'em-find-o.wav',
    'find p': 'em-find-p.wav', 'find q': 'em-find-q.wav', 'find r': 'em-find-r.wav',
    'find s': 'em-find-s.wav', 'find t': 'em-find-t.wav', 'find u': 'em-find-u.wav',
    'find v': 'em-find-v.wav', 'find w': 'em-find-w.wav', 'find x': 'em-find-x.wav',
    'find y': 'em-find-y.wav', 'find z': 'em-find-z.wav',

    // Letter placement prompts (existing teacher .wav)
    'where does a go': 'em-where-a-go.wav', 'where does b go': 'em-where-b-go.wav',
    'where does c go': 'em-where-c-go.wav', 'where does d go': 'em-where-d-go.wav',
    'where does e go': 'em-where-e-go.wav', 'where does f go': 'em-where-f-go.wav',
    'where does g go': 'em-where-g-go.wav', 'where does h go': 'em-where-h-go.wav',
    'where does i go': 'em-where-i-go.wav', 'where does j go': 'em-where-j-go.wav',
    'where does k go': 'em-where-k-go.wav', 'where does l go': 'em-where-l-go.wav',
    'where does m go': 'em-where-m-go.wav', 'where does n go': 'em-where-n-go.wav',
    'where does o go': 'em-where-o-go.wav', 'where does p go': 'em-where-p-go.wav',
    'where does q go': 'em-where-q-go.wav', 'where does r go': 'em-where-r-go.wav',
    'where does s go': 'em-where-s-go.wav', 'where does t go': 'em-where-t-go.wav',
    'where does u go': 'em-where-u-go.wav', 'where does v go': 'em-where-v-go.wav',
    'where does w go': 'em-where-w-go.wav', 'where does x go': 'em-where-x-go.wav',
    'where does y go': 'em-where-y-go.wav', 'where does z go': 'em-where-z-go.wav',

    // Number placement prompts (regenerated as teacher)
    'where does 1 go':  'teacher-where-does-1-go.wav',
    'where does 2 go':  'teacher-where-does-2-go.wav',
    'where does 3 go':  'teacher-where-does-3-go.wav',
    'where does 4 go':  'teacher-where-does-4-go.wav',
    'where does 5 go':  'teacher-where-does-5-go.wav',
    'where does 6 go':  'teacher-where-does-6-go.wav',
    'where does 7 go':  'teacher-where-does-7-go.wav',
    'where does 8 go':  'teacher-where-does-8-go.wav',
    'where does 9 go':  'teacher-where-does-9-go.wav',
    'where does 10 go': 'teacher-where-does-10-go.wav',

    // Sound Safari (existing teacher .wav)
    'starts with the sound buh': 'em-fbs-b.wav',
    'starts with the sound sss': 'em-fbs-s.wav',
    'starts with the sound mmm': 'em-fbs-m.wav',
    'starts with the sound fff': 'em-fbs-f.wav',
    'starts with the sound puh': 'em-fbs-p.wav',
    'starts with the sound duh': 'em-fbs-d.wav',

    // Numbers (existing teacher .wav)
    '1':  'em-num-1.wav',  '2':  'em-num-2.wav',  '3':  'em-num-3.wav',
    '4':  'em-num-4.wav',  '5':  'em-num-5.wav',  '6':  'em-num-6.wav',
    '7':  'em-num-7.wav',  '8':  'em-num-8.wav',  '9':  'em-num-9.wav',
    '10': 'em-num-10.wav',

    // Feed Alien — item counts (existing teacher .wav)
    'feed the alien 1 item':   'em-feed-alien-1.wav',
    'feed the alien 2 items':  'em-feed-alien-2.wav',
    'feed the alien 3 items':  'em-feed-alien-3.wav',
    'feed the alien 4 items':  'em-feed-alien-4.wav',
    'feed the alien 5 items':  'em-feed-alien-5.wav',
    'feed the alien 6 items':  'em-feed-alien-6.wav',
    'feed the alien 7 items':  'em-feed-alien-7.wav',
    'feed the alien 8 items':  'em-feed-alien-8.wav',
    'feed the alien 9 items':  'em-feed-alien-9.wav',
    'feed the alien 10 items': 'em-feed-alien-10.wav',

    // Feed Alien — basket counts (existing teacher .wav)
    'feed the alien 1 piece of food from the basket':   'em-feed-basket-1.wav',
    'feed the alien 2 pieces of food from the basket':  'em-feed-basket-2.wav',
    'feed the alien 3 pieces of food from the basket':  'em-feed-basket-3.wav',
    'feed the alien 4 pieces of food from the basket':  'em-feed-basket-4.wav',
    'feed the alien 5 pieces of food from the basket':  'em-feed-basket-5.wav',
    'feed the alien 6 pieces of food from the basket':  'em-feed-basket-6.wav',
    'feed the alien 7 pieces of food from the basket':  'em-feed-basket-7.wav',
    'feed the alien 8 pieces of food from the basket':  'em-feed-basket-8.wav',
    'feed the alien 9 pieces of food from the basket':  'em-feed-basket-9.wav',
    'feed the alien 10 pieces of food from the basket': 'em-feed-basket-10.wav',

    // Pattern games
    'what comes next': 'teacher-what-comes-next.wav',
    'pattern hint':    'teacher-hint.wav',

    // Space Defender intro
    'ready for action': 'em-sd-ready.wav',
  };

  function getVoiceMap() { return isFemaleChar() ? AMARA_MAP : EM_MAP; }

  /* ── Preload — desktop only, critical clips only ─────────── */
  // Mobile skips preload entirely — clips load on-demand.
  // Too many simultaneous fetches on mobile saturates the connection
  // and freezes the page before the child even sees it.
  const CRITICAL_CLIPS = [
    // start cue (character)
    'em-ready-lets-go.m4a',
    // teacher directions — most common first prompts
    'teacher-match-colors.wav', 'teacher-match-shapes.wav',
    'teacher-find-red.wav',     'teacher-find-blue.wav',  'teacher-find-yellow.wav',
    'teacher-find-orange.wav',  'teacher-find-green.wav', 'teacher-find-purple.wav',
    'teacher-circle.wav',       'teacher-square.wav',     'teacher-triangle.wav',
    'teacher-what-comes-next.wav',
    // character praise
    'em-you-got-it.m4a',        'em-you-found-it.m4a',
    'em-great-job.m4a',         'em-yay.m4a',
    'em-try-again.m4a',         'em-aww-man.m4a',
    'em-keep-it-up.m4a',        'em-almost-there.m4a',
    'amara-yay.m4a',            'amara-oh-man.m4a',
  ];

  const cache = {};

  function preloadAll() {
    const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);
    if (isMobile) return;  // on-demand only for mobile

    CRITICAL_CLIPS.forEach(filename => {
      const path = VOICE_BASE + filename;
      if (cache[path]) return;
      const a = new Audio();
      a.preload = 'auto';
      a.src = path;
      a.load();
      cache[path] = a;
    });

    Object.values(SFX_MAP).forEach(({ path }) => {
      const full = SFX_BASE + path;
      if (cache[full]) return;
      const a = new Audio();
      a.preload = 'auto';
      a.src = full;
      a.load();
      cache[full] = a;
    });
  }

  /* ── Mute state ──────────────────────────────────────────── */
  function isMuted() { return localStorage.getItem(MUTE_KEY) === '1'; }

  function setMuted(val) {
    localStorage.setItem(MUTE_KEY, val ? '1' : '0');
    if (themeAudio)   themeAudio.muted   = val;
    if (currentVoice) currentVoice.muted = val;
    document.querySelectorAll('.rk-mute-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', String(val));
      btn.title = val ? 'Unmute' : 'Mute';
      btn.querySelector('.rk-mute-icon').textContent = val ? '🔇' : '🔊';
    });
  }

  /* ── Theme song — always lazy, never blocks page load ────── */
  const THEME_POS_KEY = 'rk_theme_pos';
  let themeAudio   = null;
  let themeStarted = false;

  function startTheme() {
    if (themeStarted) return;
    themeStarted = true;

    themeAudio = new Audio(THEME_PATH);
    themeAudio.loop    = false;
    themeAudio.volume  = 0.35;
    themeAudio.preload = 'none';   // fetch starts only when play() is called
    themeAudio.muted   = isMuted();

    const savedPos = parseFloat(sessionStorage.getItem(THEME_POS_KEY) || '0');
    if (savedPos > 0) {
      themeAudio.currentTime = savedPos;
      sessionStorage.removeItem(THEME_POS_KEY);
    }

    themeAudio.play().catch(() => {
      // Autoplay blocked — play on first tap instead
      document.addEventListener('pointerdown', () => {
        themeAudio.play().catch(() => {});
      }, { once: true });
    });
  }

  function stopTheme() {
    if (!themeAudio) return;
    themeAudio.pause();
    themeAudio.currentTime = 0;
  }

  window.addEventListener('beforeunload', () => {
    if (themeAudio && !themeAudio.paused && themeAudio.currentTime > 0) {
      sessionStorage.setItem(THEME_POS_KEY, String(themeAudio.currentTime));
    }
    if (typeof keepAliveInterval !== 'undefined' && keepAliveInterval) {
      clearInterval(keepAliveInterval);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') unlock();
  });

  /* ── Voice playback ──────────────────────────────────────── */
  let currentVoice = null;

  function normalizeKey(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/['’]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function resolveFromMap(map, key) {
    const norm = normalizeKey(key);
    if (!norm) return null;
    if (map[norm]) return VOICE_BASE + map[norm];

    // Longest-substring fallback
    let bestKey = null, bestLen = 0;
    for (const k of Object.keys(map)) {
      if (norm.includes(k) && k.length > bestLen) { bestKey = k; bestLen = k.length; }
    }
    return bestKey ? VOICE_BASE + map[bestKey] : null;
  }

  // Character (encouragement) voice — Em or Amara depending on selection
  function getPath(key) { return resolveFromMap(getVoiceMap(), key); }
  // Teacher (directions) voice — character-independent
  function getTeacherPath(key) { return resolveFromMap(TEACHER_MAP, key); }

  function stopCurrent() {
    if (!currentVoice) return;
    currentVoice.pause();
    currentVoice.currentTime = 0;
    currentVoice = null;
  }

  function getAudio(path) {
    // Reuse cached element; create if missing
    if (!cache[path]) {
      cache[path] = new Audio(path);
    }
    const a = cache[path];
    a.currentTime = 0;
    a.muted = isMuted();
    return a;
  }

  function primeClip(path) {
    if (cache[path]) return;          // already cached, skip
    const a = new Audio(path);
    a.preload = 'auto';
    a.load();
    cache[path] = a;
  }

  /* speak(key)
     Plays a clip immediately, stopping whatever was playing.
     Returns a Promise that resolves when playback STARTS (not ends). */
  function speak(key) {
    if (isMuted()) return Promise.resolve(false);
    const path = getPath(key);
    if (!path) return speakFallback(key);

    if (!cache[path]) primeClip(path);

    stopCurrent();
    const audio = getAudio(path);
    currentVoice = audio;

    return audio.play()
      .then(() => true)
      .catch(err => {
        console.warn('[Audio] speak failed:', key, err.message);
        currentVoice = null;
        return false;
      });
  }

  /* speakAndWait(key)
     Plays a clip and returns a Promise that resolves when it FINISHES.
     Use this when the game must wait before moving to the next step. */
  function speakAndWait(key) {
    if (isMuted()) return Promise.resolve(false);
    const path = getPath(key);
    if (!path) return speakFallback(key);

    stopCurrent();
    const audio = getAudio(path);
    currentVoice = audio;

    return new Promise(resolve => {
      const done = (ok) => { currentVoice = null; resolve(ok); };
      audio.addEventListener('ended', () => done(true),  { once: true });
      audio.addEventListener('error', () => done(false), { once: true });
      audio.play().catch(() => done(false));
    });
  }

  /* speakCourtesy(key)
     Plays encouragement clips ONLY when nothing else is playing.
     If a callout or instruction is active — silently skips.
     No queue, no race conditions. */
  function speakCourtesy(key) {
    if (isMuted()) return;
    const busy = currentVoice && !currentVoice.paused && !currentVoice.ended;
    if (busy) return;  // instruction still running — skip this clip
    speak(key);
  }

  function stopVoice() { stopCurrent(); }

  /* ── Op 9: intent-aware playback ─────────────────────────────
     speakInstruction → TEACHER voice (directions, character-independent)
     speakPraise       → CHARACTER voice (encouragement, Em/Amara)
     Both reuse the same element/cache/stop logic as speak(). */
  function playImmediate(path, key) {
    if (!path) return speakFallback(key);
    if (!cache[path]) primeClip(path);
    stopCurrent();
    const audio = getAudio(path);
    currentVoice = audio;
    return audio.play()
      .then(() => true)
      .catch(err => {
        console.warn('[Audio] play failed:', key, err && err.message);
        currentVoice = null;
        return false;
      });
  }

  function playAndWait(path, key) {
    if (!path) return speakFallback(key);
    stopCurrent();
    const audio = getAudio(path);
    currentVoice = audio;
    return new Promise(resolve => {
      const done = (ok) => { currentVoice = null; resolve(ok); };
      audio.addEventListener('ended', () => done(true),  { once: true });
      audio.addEventListener('error', () => done(false), { once: true });
      audio.play().catch(() => done(false));
    });
  }

  function speakInstruction(key) {
    if (isMuted()) return Promise.resolve(false);
    return playImmediate(getTeacherPath(key), key);
  }
  function speakInstructionAndWait(key) {
    if (isMuted()) return Promise.resolve(false);
    return playAndWait(getTeacherPath(key), key);
  }
  function speakPraise(key) {
    if (isMuted()) return Promise.resolve(false);
    return playImmediate(getPath(key), key);
  }

  /* Speech synthesis fallback for keys with no recorded clip */
  function speakFallback(text) {
    if (!('speechSynthesis' in window)) return Promise.resolve(false);
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.rate  = 0.95;
      u.pitch = isFemaleChar() ? 1.08 : 0.98;
      return new Promise(resolve => {
        u.onend  = () => resolve(true);
        u.onerror = () => resolve(false);
        window.speechSynthesis.speak(u);
      });
    } catch (e) { return Promise.resolve(false); }
  }

  /* ── SFX ─────────────────────────────────────────────────── */
  function playSfx(key) {
    if (isMuted()) return false;
    const config = SFX_MAP[key];
    if (!config) return false;
    // Clone so rapid shots don't share an element
    const a = new Audio(SFX_BASE + config.path);
    a.volume = config.volume;
    a.play().catch(() => {});
    return true;
  }

  /* ── iOS audio unlock ────────────────────────────────────── */
  // Playing a zero-length silent clip inside the user gesture activates
  // the browser's audio session — all subsequent play() calls work freely.
  let keepAliveInterval = null;

  function keepAlive() {
    if (isMuted()) return;
    const busy = currentVoice && !currentVoice.paused && !currentVoice.ended;
    if (busy) return;
    const a = new Audio();
    a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='; // same as unlock
    a.volume = 0;
    a.play().catch(() => {});
  }

  function unlock() {
    if (unlock._done) return;
    unlock._done = true;
    const a = new Audio();
    a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    a.volume = 0;
    a.play().catch(() => {});
    keepAliveInterval = setInterval(keepAlive, 25000);
  }

  /* warmUp kept as no-op — games still call it but it does nothing.
     The old play-then-pause warm-up is no longer needed now that
     unlock() + on-demand loading handles iOS correctly. */
  function warmUp() {}

  /* ── Mute button ─────────────────────────────────────────── */
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
    const el = document.querySelector(selector);
    if (!el || el.querySelector('.rk-mute-btn')) return;
    el.appendChild(createMuteButton());
  }

  /* ── Public API ──────────────────────────────────────────── */
  window.RKAudio = {
    preloadAll,
    startTheme, stopTheme,
    speak, speakAndWait, speakCourtesy,
    speakInstruction, speakInstructionAndWait, speakPraise,
    playSfx, stopVoice,
    isMuted, setMuted,
    injectMuteButton, createMuteButton,
    unlock,
    warmUp,  // no-op, kept for compat
  };

  // Backward compat
  window.ReadyKiddoAudio = {
    speak, stop: stopVoice, play: speak, playSfx, unlock,
  };

  // Preload critical clips after DOM ready (desktop only, non-blocking)
  document.addEventListener('pointerdown', () => unlock(), { once: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadAll);
  } else {
    preloadAll();
  }

}());
