/**
 * zoey-companion.js
 * ReadyKiddo 2.0 — Zoey child-facing companion (scripted, no API calls)
 *
 * Shows an animated overlay after a game completes with an
 * encouraging message. Zero external data — fully COPPA safe.
 *
 * Usage: include after supabase-client.js in game-loader.html
 *   <script src="assets/js/zoey-companion.js"></script>
 *
 * The companion hooks into window.RK.logGameSession automatically.
 * SVG placeholder: replace .zc-character inner content with your SVG.
 */

(function () {
  'use strict';

  /* ── Scripted message banks ─────────────────────────────────── */
  const MESSAGES = {
    firstGame: [
      "You did it! First game — you're a ReadyKiddo! ⭐",
      "WOW! Your first game complete! You're amazing! 🎉",
    ],
    milestone3: [
      "3 games done! You're on a ROLL! 🔥",
      "Three gold stars! Keep going — you're incredible! 🌟",
    ],
    milestone5: [
      "FIVE games! You're a ReadyKiddo superstar! 🏆",
      "Halfway there! You're SO smart! ⭐⭐⭐",
    ],
    milestone10: [
      "TEN GAMES! You've done them all! You're INCREDIBLE! 🏆🎉",
      "All done! You're the greatest explorer ever! 🚀",
    ],
    general: [
      "Awesome job! You did it! 🎉",
      "You're so smart! I knew you could do it! 💪",
      "Woohoo! Look at you go! ⭐",
      "Amazing! You should be so proud! 🌟",
      "You're doing great — keep it up! 🔥",
      "Yes yes YES! You did it! 🙌",
      "Super work! High five! ✋",
    ],
    nextPrompt: [
      "Want to try another one? 🚀",
      "Ready for the next adventure?",
      "There's more fun waiting — let's go!",
      "One more? I'll be cheering you on! 💫",
    ],
  };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getMessage(completedCount) {
    if (completedCount === 1)  return pick(MESSAGES.firstGame);
    if (completedCount === 3)  return pick(MESSAGES.milestone3);
    if (completedCount === 5)  return pick(MESSAGES.milestone5);
    if (completedCount >= 10)  return pick(MESSAGES.milestone10);
    return pick(MESSAGES.general);
  }

  /* ── Costume unlocks ────────────────────────────────────────────
     Milestones earn outfits the child doesn't have yet (all 36
     character/costume images already exist). Unlocked styles are
     kept in localStorage; child-home shows them as outfit choices. */
  const UNLOCK_MILESTONES = [3, 5, 8, 11];
  const STYLE_ORDER = ['hero', 'explorer', 'wizard', 'artist', 'scientist'];
  const STYLE_LABELS = {
    hero: 'Hero', explorer: 'Explorer', wizard: 'Wizard',
    artist: 'Artist', scientist: 'Scientist',
  };

  function slugStyle(v) {
    return String(v || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  function getProfile() {
    try { return JSON.parse(localStorage.getItem('userProfile') || '{}'); }
    catch { return {}; }
  }

  function getUnlockedStyles() {
    let arr = null;
    try { arr = JSON.parse(localStorage.getItem('rk_unlocked_styles')); } catch {}
    if (!Array.isArray(arr) || arr.length === 0) {
      arr = ['plain'];
      const chosen = slugStyle(getProfile().style);
      if (chosen && !arr.includes(chosen)) arr.push(chosen);
    }
    return arr;
  }

  /* Returns the newly unlocked style slug, or null. */
  function tryUnlockCostume(completedCount) {
    if (!UNLOCK_MILESTONES.includes(completedCount)) return null;
    const unlocked = getUnlockedStyles();
    const next = STYLE_ORDER.find(s => !unlocked.includes(s));
    if (!next) return null;
    unlocked.push(next);
    localStorage.setItem('rk_unlocked_styles', JSON.stringify(unlocked));
    return next;
  }

  /* ── Inject companion CSS ───────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Zoey companion overlay ── */
    .zc-overlay {
      position: fixed;
      inset: 0;
      z-index: 9000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      pointer-events: none;
      padding-bottom: 24px;
    }
    .zc-overlay.zc-visible { pointer-events: all; }

    .zc-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      transform: translateY(120%);
      opacity: 0;
      transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease;
      will-change: transform, opacity;
    }
    .zc-overlay.zc-visible .zc-panel {
      transform: translateY(0);
      opacity: 1;
    }

    .zc-character {
      width: 130px;
      height: 130px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .zc-bubble {
      background: white;
      border-radius: 20px;
      padding: 14px 22px;
      font-family: 'Fredoka', sans-serif;
      font-size: clamp(16px, 3.5vw, 20px);
      font-weight: 600;
      color: #102338;
      text-align: center;
      box-shadow: 0 6px 24px rgba(0,0,0,0.12);
      max-width: min(340px, 88vw);
      position: relative;
      margin-bottom: 4px;
    }
    .zc-bubble::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      border: 10px solid transparent;
      border-top-color: white;
      border-bottom: none;
    }

    .zc-sub {
      font-family: 'Fredoka', sans-serif;
      font-size: 14px;
      color: rgba(16,35,56,0.55);
      margin-top: 14px;
      margin-bottom: 12px;
    }

    .zc-btn {
      background: linear-gradient(135deg, #f28c18, #ffb23e);
      color: white;
      font-family: 'Fredoka', sans-serif;
      font-size: 20px;
      font-weight: 700;
      padding: 14px 36px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(242,140,24,0.45);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .zc-btn:hover { transform:translateY(-3px) scale(1.03); box-shadow:0 10px 28px rgba(242,140,24,0.55); }
    .zc-btn:active { transform:scale(0.97); }

    @keyframes zcFloat {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      33%       { transform: translateY(-10px) rotate(-3deg); }
      66%       { transform: translateY(-5px) rotate(3deg); }
    }

    /* Confetti burst on milestone */
    .zc-confetti { position:fixed; inset:0; pointer-events:none; z-index:8999; overflow:hidden; }
    .zc-confetti span {
      position:absolute;
      top:-20px;
      font-size:20px;
      animation: zcFall linear forwards;
    }
    @keyframes zcFall {
      to { transform: translateY(110vh) rotate(720deg); opacity:0; }
    }
  `;
  document.head.appendChild(style);

  /* ── Build overlay DOM ──────────────────────────────────────────
     Deferred until <body> exists: this script is included in <head>,
     where document.body is still null — appending eagerly would throw
     and kill the whole companion (the bug that silenced celebrations). */
  let overlay = null, zcMsg = null, zcSub = null, zcBtn = null;

  function buildOverlay() {
    if (overlay || !document.body) return;
    overlay = document.createElement('div');
    overlay.className = 'zc-overlay';
    overlay.innerHTML = `
      <div class="zc-panel">
        <div class="zc-bubble" id="zcMsg">Great job!</div>
        <div class="zc-character">
          <zoey-avatar id="companionZoey" size="120"></zoey-avatar>
        </div>
        <img id="zcUnlockImg" hidden alt=""
             style="height:130px;width:auto;object-fit:contain;margin-top:6px;
                    filter:drop-shadow(0 6px 14px rgba(0,0,0,0.3));">
        <div class="zc-sub" id="zcSub">Keep going!</div>
        <button class="zc-btn" id="zcBtn">Keep Playing 🚀</button>
      </div>
    `;
    document.body.appendChild(overlay);

    zcMsg = document.getElementById('zcMsg');
    zcSub = document.getElementById('zcSub');
    zcBtn = document.getElementById('zcBtn');
    zcBtn.addEventListener('click', hideCompanion);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildOverlay);
  } else {
    buildOverlay();
  }

  /* ── Show / hide ────────────────────────────────────────────── */
  function showCompanion(completedCount, isMilestone) {
    buildOverlay();
    if (!overlay) return;
    const unlockImg = document.getElementById('zcUnlockImg');
    unlockImg.hidden = true;

    // Milestone may earn a new outfit — that becomes the headline
    const newStyle = tryUnlockCostume(completedCount);
    if (newStyle) {
      const charSlug = slugStyle(getProfile().character || 'mica');
      zcMsg.textContent = `You unlocked the ${STYLE_LABELS[newStyle]} outfit! 🎁`;
      zcSub.textContent = 'Try it on from your home screen!';
      unlockImg.src = `assets/images/characters/${charSlug}/${newStyle}.png`;
      unlockImg.alt = `Your character in the new ${STYLE_LABELS[newStyle]} outfit`;
      unlockImg.hidden = false;
    } else {
      zcMsg.textContent = getMessage(completedCount);
      zcSub.textContent = pick(MESSAGES.nextPrompt);
    }
    overlay.classList.add('zc-visible');

    // Animate Zoey
    const zoeyEl = document.getElementById('companionZoey');
    if (isMilestone || newStyle) {
      spawnConfetti();
      zoeyEl?.celebrate(); // 🎉 milestone!
    } else {
      zoeyEl?.encourage(); // 💪 good job
    }
  }

  function hideCompanion() {
    overlay?.classList.remove('zc-visible');
    document.getElementById('companionZoey')?.idle(); // return to idle as panel slides away
  }

  /* ── Confetti burst ─────────────────────────────────────────── */
  const CONFETTI = ['⭐','🌟','🎉','🎊','✨','🏆','💫'];
  function spawnConfetti() {
    const wrap = document.createElement('div');
    wrap.className = 'zc-confetti';
    for (let i = 0; i < 30; i++) {
      const s = document.createElement('span');
      s.textContent = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
      s.style.left   = Math.random() * 100 + 'vw';
      s.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      s.style.animationDelay    = (Math.random() * 0.5) + 's';
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 3500);
  }

  /* ── Hook into window.RK.logGameSession ─────────────────────── */
  // Wait for RK to be available (supabase-client.js must load first)
  function attachHook() {
    if (!window.RK?.logGameSession) {
      setTimeout(attachHook, 100);
      return;
    }

    const _original = window.RK.logGameSession.bind(window.RK);
    window.RK.logGameSession = async function (gameId, opts) {
      const result = await _original(gameId, opts);

      // Count completed games after this session logs
      try {
        const ids = window._rkCompletedIds ?? await window.RK.getCompletedGameIds();
        ids.add(gameId); // optimistically add current game
        window._rkCompletedIds = ids;
        const count = ids.size;
        const isMilestone = [1, 3, 5, 8, 10, 11].includes(count);
        // Small delay so celebration animation finishes first
        setTimeout(() => showCompanion(count, isMilestone), 800);
      } catch { /* silent — companion is optional */ }

      return result;
    };
  }

  // Attach after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHook);
  } else {
    attachHook();
  }

  // Expose for manual trigger in tests
  window.ZoeyCompanion = { show: showCompanion, hide: hideCompanion };

})();
