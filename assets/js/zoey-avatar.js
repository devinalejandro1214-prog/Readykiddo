/* ============================================================
   <zoey-avatar> — ReadyKiddo's animated learning advocate
   ------------------------------------------------------------
   A self-contained, dependency-free Web Component.

   Drop-in:
     <script src="assets/js/zoey-avatar.js"></script>
     <zoey-avatar size="48"></zoey-avatar>

   Drive her moods from JS:
     const z = document.querySelector('zoey-avatar');
     z.wave();            // one-shot greeting, returns to idle
     z.think();           // hold while the AI is generating
     z.talk();            // mouth visemes while she replies
     z.talk(4000);        // talk for 4s, then auto-return to idle
     z.celebrate();       // one-shot sparkle burst
     z.encourage();       // one-shot gentle nod
     z.idle();            // calm breathing + blinking (default)

   Or declaratively via the attribute:
     <zoey-avatar state="think"></zoey-avatar>

   States: idle | wave | think | talk | celebrate | encourage
   Sizes : any px via size="" attribute (default 96). Scales crisply.

   Notes: renders into the light DOM with a single shared, scoped
   stylesheet (injected once). SVG defs get per-instance ids so
   multiple Zoeys never collide.
   ============================================================ */

(function () {
  'use strict';

  function svgFor(uid) {
    const clip = 'zoeyClip-' + uid, bg = 'zoeyBg-' + uid, shirt = 'zoeyShirt-' + uid,
          skin = 'zoeySkin-' + uid, hairD = 'zoeyHairD-' + uid, hairM = 'zoeyHairM-' + uid,
          scarf = 'zoeyScarf-' + uid, cheekL = 'zoeyCheekL-' + uid, cheekR = 'zoeyCheekR-' + uid;
    return /* svg */ `
    <svg class="zoey" viewBox="0 0 240 240" role="img" aria-label="Zoey, your learning advocate"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="${clip}"><circle cx="120" cy="120" r="118"/></clipPath>
        <radialGradient id="${bg}" cx="50%" cy="34%" r="82%">
          <stop offset="0%"  stop-color="var(--zoey-bg-1,#fffdf6)"/>
          <stop offset="100%" stop-color="var(--zoey-bg-2,#fce6c0)"/>
        </radialGradient>
        <linearGradient id="${shirt}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="var(--zoey-top-1,#0b5f95)"/>
          <stop offset="100%" stop-color="var(--zoey-top-2,#09395f)"/>
        </linearGradient>
        <linearGradient id="${skin}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="var(--zoey-skin-1,#f0bd92)"/>
          <stop offset="100%" stop-color="var(--zoey-skin-2,#dd9c68)"/>
        </linearGradient>
        <linearGradient id="${hairD}" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%"  stop-color="var(--zoey-hair-1,#3a2a23)"/>
          <stop offset="100%" stop-color="var(--zoey-hair-2,#241813)"/>
        </linearGradient>
        <linearGradient id="${hairM}" x1="0.15" y1="0" x2="0.6" y2="1">
          <stop offset="0%"  stop-color="var(--zoey-hair-1,#3a2a23)"/>
          <stop offset="55%" stop-color="var(--zoey-hair-1,#3a2a23)"/>
          <stop offset="100%" stop-color="var(--zoey-hair-2,#2a1c16)"/>
        </linearGradient>
        <linearGradient id="${scarf}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="var(--zoey-accent-1,#ffae4d)"/>
          <stop offset="100%" stop-color="var(--zoey-accent-2,#f28c18)"/>
        </linearGradient>
        <radialGradient id="${cheekL}" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#f29b86"/><stop offset="100%" stop-color="#f29b86" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="${cheekR}" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#f29b86"/><stop offset="100%" stop-color="#f29b86" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <circle cx="120" cy="120" r="118" fill="url(#${bg})"/>
      <circle cx="120" cy="120" r="116" fill="none" stroke="var(--zoey-accent-2,#f28c18)" stroke-width="3" opacity="0.5"/>

      <g clip-path="url(#${clip})">
        <g class="figure">

          <!-- long wavy hair (behind everything) -->
          <g class="hair-back">
            <path d="M120 26 C62 26 38 70 38 128 C38 178 33 220 46 240 L92 240
                     C74 206 78 150 98 116 C107 94 112 82 120 82 C128 82 133 94 142 116
                     C162 150 166 206 148 240 L194 240 C207 220 202 178 202 128
                     C202 70 178 26 120 26 Z" fill="url(#${hairD})"/>
            <path d="M70 120 C58 160 60 206 76 240 L92 240 C76 206 76 156 92 120 Z" fill="#4d362b" opacity="0.55"/>
            <path d="M170 120 C182 160 180 206 164 240 L148 240 C164 206 164 156 148 120 Z" fill="#4d362b" opacity="0.55"/>
          </g>

          <!-- body / shoulders -->
          <g class="body">
            <path d="M104 150 L104 172 Q120 182 136 172 L136 150 Z" fill="url(#${skin})"/>
            <path d="M34 240 C34 196 72 174 120 174 C168 174 206 196 206 240 Z" fill="url(#${shirt})"/>
            <!-- orange scarf at the neckline -->
            <path d="M86 176 C100 190 140 190 154 176 C150 200 134 210 120 210 C106 210 90 200 86 176 Z" fill="url(#${scarf})"/>
            <ellipse cx="120" cy="184" rx="9" ry="6.5" fill="#ffbf66"/>
          </g>

          <!-- waving hand (hidden until wave) -->
          <g class="arm" aria-hidden="true">
            <rect x="176" y="150" width="26" height="22" rx="10" fill="url(#${shirt})"/>
            <g class="hand">
              <rect x="172" y="120" width="34" height="34" rx="15" fill="url(#${skin})"/>
              <rect x="176" y="112" width="5.5" height="16" rx="2.75" fill="url(#${skin})"/>
              <rect x="184" y="109" width="5.5" height="19" rx="2.75" fill="url(#${skin})"/>
              <rect x="192" y="110" width="5.5" height="18" rx="2.75" fill="url(#${skin})"/>
              <rect x="200" y="114" width="5.5" height="15" rx="2.75" fill="url(#${skin})"/>
            </g>
          </g>

          <!-- head group (tilts / nods) -->
          <g class="head">
            <ellipse cx="64"  cy="110" rx="9" ry="13" fill="url(#${skin})"/>
            <ellipse cx="176" cy="110" rx="9" ry="13" fill="url(#${skin})"/>
            <g class="earrings">
              <circle cx="64"  cy="124" r="3.4" fill="var(--zoey-accent-2,#f28c18)"/>
              <circle cx="176" cy="124" r="3.4" fill="var(--zoey-accent-2,#f28c18)"/>
            </g>
            <ellipse cx="120" cy="104" rx="56" ry="60" fill="url(#${skin})"/>

            <!-- front face-framing locks (slim, hug the outer face) -->
            <path d="M66 82 C50 120 52 176 72 212 C70 184 66 150 78 120 C74 106 70 92 66 82 Z" fill="url(#${hairM})"/>
            <path d="M174 82 C190 120 188 176 168 212 C170 184 174 150 162 120 C166 106 170 92 174 82 Z" fill="url(#${hairM})"/>

            <!-- soft side-swept bangs -->
            <path d="M56 102 C50 56 92 40 126 42 C158 44 186 60 182 104
                     C173 80 150 70 126 74 C108 78 96 90 88 108 C80 94 66 94 56 102 Z" fill="url(#${hairM})"/>
            <path d="M126 43 C102 46 90 64 90 88 C95 66 110 56 130 60 Z" fill="#6e4a35" opacity="0.55"/>
            <path d="M150 60 C166 72 174 90 176 104 C172 86 158 74 142 70 Z" fill="#6e4a35" opacity="0.45"/>

            <!-- sparkle hair clip (signature) -->
            <g class="hair-clip">
              <path class="clip-star" d="M0 -8 L1.8 -1.8 L8 0 L1.8 1.8 L0 8 L-1.8 1.8 L-8 0 L-1.8 -1.8 Z"
                    transform="translate(78 70)" fill="var(--zoey-accent-2,#f28c18)"/>
              <circle cx="78" cy="70" r="2" fill="#fff7e8"/>
            </g>

            <!-- rosy cheeks -->
            <ellipse class="cheek" cx="80"  cy="120" rx="12" ry="8" fill="url(#${cheekL})"/>
            <ellipse class="cheek" cx="160" cy="120" rx="12" ry="8" fill="url(#${cheekR})"/>

            <!-- brows -->
            <path class="brow" d="M82 88 Q98 82 114 87"  fill="none" stroke="#3a2a23" stroke-width="4" stroke-linecap="round"/>
            <path class="brow" d="M126 87 Q142 82 158 88" fill="none" stroke="#3a2a23" stroke-width="4" stroke-linecap="round"/>

            <!-- eyes -->
            <g class="eyes">
              <g class="eye eye-l">
                <ellipse cx="98" cy="107" rx="11" ry="12.5" fill="#fffaf2"/>
                <g class="iris">
                  <circle cx="98" cy="108" r="7.4" fill="#2f2018"/>
                  <circle cx="98" cy="109" r="3.4" fill="#0e0a07"/>
                  <circle cx="100.6" cy="104.6" r="2.8" fill="#ffffff"/>
                  <circle cx="95.5" cy="111" r="1.5" fill="#7a543a"/>
                </g>
              </g>
              <g class="eye eye-r">
                <ellipse cx="142" cy="107" rx="11" ry="12.5" fill="#fffaf2"/>
                <g class="iris">
                  <circle cx="142" cy="108" r="7.4" fill="#2f2018"/>
                  <circle cx="142" cy="109" r="3.4" fill="#0e0a07"/>
                  <circle cx="144.6" cy="104.6" r="2.8" fill="#ffffff"/>
                  <circle cx="139.5" cy="111" r="1.5" fill="#7a543a"/>
                </g>
              </g>
            </g>
            <!-- lash lines + flicks -->
            <g class="lashes" fill="none" stroke="#241813" stroke-linecap="round">
              <path d="M86 100 Q98 93 111 100" stroke-width="3.2"/>
              <path d="M129 100 Q142 93 154 100" stroke-width="3.2"/>
              <path d="M86 101 Q80 98 76 99" stroke-width="2.4"/>
              <path d="M154 101 Q160 98 164 99" stroke-width="2.4"/>
            </g>
            <g class="eyes-happy">
              <path d="M86 110 Q98 99 110 110"  fill="none" stroke="#2f2018" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M130 110 Q142 99 154 110" fill="none" stroke="#2f2018" stroke-width="4.5" stroke-linecap="round"/>
            </g>

            <!-- nose -->
            <path d="M117 116 Q120 123 124 121" fill="none" stroke="#cf8f63" stroke-width="3" stroke-linecap="round"/>

            <!-- mouth: warm closed smile -->
            <g class="mouth-smile">
              <path d="M104 134 Q120 150 136 134 Q120 145 104 134 Z" fill="#b9543f"/>
              <path d="M108 137 Q120 144 132 137 Q120 140 108 137 Z" fill="#9c4030" opacity="0.55"/>
            </g>
            <g class="mouth-open">
              <ellipse cx="120" cy="141" rx="9.5" ry="7.5" fill="#8a3f30"/>
              <rect x="112" y="134.5" width="16" height="4.5" rx="2.2" fill="#ffffff" opacity="0.92"/>
              <ellipse cx="120" cy="147" rx="5" ry="3" fill="#d96a55" opacity="0.8"/>
            </g>
            <g class="mouth-grin">
              <path d="M100 131 Q120 160 140 131 Q120 142 100 131 Z" fill="#8a3f30"/>
              <rect x="105" y="131" width="30" height="5.5" rx="2.6" fill="#ffffff" opacity="0.95"/>
              <ellipse cx="120" cy="151" rx="7" ry="4" fill="#d96a55" opacity="0.85"/>
            </g>
          </g>
        </g><!-- /figure -->

        <g class="fx">
          <path class="spark spark-sig" d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z"
                transform="translate(190 58)" fill="#f4b73f"/>
          <g class="think-dots">
            <circle cx="96"  cy="34" r="5" fill="#0b5f95"/>
            <circle cx="120" cy="30" r="5" fill="#0b5f95"/>
            <circle cx="144" cy="34" r="5" fill="#0b5f95"/>
          </g>
          <g class="celebrate-fx">
            <path class="spark s1" d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z" transform="translate(48 56)"  fill="#f28c18"/>
            <path class="spark s2" d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z" transform="translate(196 92)" fill="#2bb6a8"/>
            <path class="spark s3" d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z" transform="translate(64 150)" fill="#9558c4"/>
            <path class="spark s4" d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z" transform="translate(180 150)" fill="#f4b73f"/>
            <path class="spark s5" d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z" transform="translate(120 26)"  fill="#f28c18"/>
          </g>
        </g>
      </g>
    </svg>`;
  }

  const CSS = /* css */ `
  zoey-avatar {
    display: inline-block;
    width: var(--zoey-size, 96px);
    height: var(--zoey-size, 96px);
    line-height: 0;
    -webkit-user-select: none; user-select: none;
  }
  zoey-avatar .zoey { width: 100%; height: 100%; display: block; overflow: visible; }

  zoey-avatar .figure   { transform-box: view-box; transform-origin: 120px 200px; animation: zoey-breathe 4.6s ease-in-out infinite; }
  zoey-avatar .head     { transform-box: view-box; transform-origin: 120px 158px; transition: transform .5s cubic-bezier(.4,0,.2,1); }
  zoey-avatar .eye      { transform-box: view-box; }
  zoey-avatar .eye-l    { transform-origin: 98px 107px; }
  zoey-avatar .eye-r    { transform-origin: 142px 107px; }
  zoey-avatar .iris     { transform-box: view-box; transform-origin: 120px 108px; transition: transform .5s ease; }
  zoey-avatar .mouth-open { transform-box: view-box; transform-origin: 120px 141px; }
  zoey-avatar .arm      { transform-box: view-box; transform-origin: 188px 168px; opacity: 0; transform: translateY(70px); }
  zoey-avatar .spark-sig{ transform-box: view-box; transform-origin: 190px 58px; }

  zoey-avatar .mouth-open, zoey-avatar .mouth-grin, zoey-avatar .eyes-happy { opacity: 0; pointer-events: none; }
  zoey-avatar .think-dots, zoey-avatar .celebrate-fx { opacity: 0; }
  zoey-avatar .hair-clip { display: var(--zoey-clip-display, inline); }
  zoey-avatar .earrings  { display: var(--zoey-earrings-display, inline); }

  zoey-avatar .eye   { animation: zoey-blink 5.4s ease-in-out infinite; }
  zoey-avatar .eye-r { animation-delay: .04s; }
  zoey-avatar .spark-sig { animation: zoey-twinkle 4s ease-in-out infinite; }

  /* WAVE */
  zoey-avatar[state="wave"] .arm  { animation: zoey-wave-in 2.4s ease-in-out forwards; }
  zoey-avatar[state="wave"] .head { transform: rotate(-3deg); }

  /* THINK */
  zoey-avatar[state="think"] .head        { transform: rotate(-5deg); }
  zoey-avatar[state="think"] .iris        { transform: translate(2px, -3px); }
  zoey-avatar[state="think"] .think-dots  { opacity: 1; }
  zoey-avatar[state="think"] .think-dots circle { animation: zoey-dot 1.5s ease-in-out infinite; }
  zoey-avatar[state="think"] .think-dots circle:nth-child(2) { animation-delay: .2s; }
  zoey-avatar[state="think"] .think-dots circle:nth-child(3) { animation-delay: .4s; }

  /* TALK */
  zoey-avatar[state="talk"] .mouth-smile { opacity: 0; }
  zoey-avatar[state="talk"] .mouth-open  { opacity: 1; animation: zoey-speak .42s steps(1,end) infinite; }

  /* CELEBRATE */
  zoey-avatar[state="celebrate"] .figure      { animation: zoey-breathe 4.6s ease-in-out infinite, zoey-bounce 1.6s ease-in-out; }
  zoey-avatar[state="celebrate"] .eyes         { opacity: 0; }
  zoey-avatar[state="celebrate"] .eyes-happy   { opacity: 1; }
  zoey-avatar[state="celebrate"] .mouth-smile  { opacity: 0; }
  zoey-avatar[state="celebrate"] .mouth-grin   { opacity: 1; }
  zoey-avatar[state="celebrate"] .celebrate-fx { opacity: 1; }
  zoey-avatar[state="celebrate"] .celebrate-fx .spark { animation: zoey-burst 1.6s ease-out; }
  zoey-avatar[state="celebrate"] .celebrate-fx .s2 { animation-delay: .08s; }
  zoey-avatar[state="celebrate"] .celebrate-fx .s3 { animation-delay: .16s; }
  zoey-avatar[state="celebrate"] .celebrate-fx .s4 { animation-delay: .12s; }
  zoey-avatar[state="celebrate"] .celebrate-fx .s5 { animation-delay: .2s; }

  /* ENCOURAGE */
  zoey-avatar[state="encourage"] .head { animation: zoey-nod 1.5s ease-in-out; }

  @keyframes zoey-breathe {
    0%,100% { transform: translateY(0)     scale(1); }
    50%     { transform: translateY(-3px)  scale(1.012); }
  }
  @keyframes zoey-blink {
    0%, 90%, 100% { transform: scaleY(1); }
    94%           { transform: scaleY(0.08); }
  }
  @keyframes zoey-twinkle {
    0%,100% { transform: scale(1)   rotate(0deg);   opacity: .9; }
    50%     { transform: scale(1.4) rotate(20deg);  opacity: 1; }
  }
  @keyframes zoey-wave-in {
    0%   { opacity: 0; transform: translateY(70px) rotate(0deg); }
    18%  { opacity: 1; transform: translateY(0)    rotate(-14deg); }
    32%  { transform: rotate(16deg); }
    46%  { transform: rotate(-12deg); }
    60%  { transform: rotate(14deg); }
    74%  { opacity: 1; transform: translateY(0) rotate(-6deg); }
    100% { opacity: 0; transform: translateY(70px) rotate(0deg); }
  }
  @keyframes zoey-speak {
    0%   { transform: scaleY(0.28); }
    25%  { transform: scaleY(1); }
    50%  { transform: scaleY(0.5); }
    75%  { transform: scaleY(0.9); }
    100% { transform: scaleY(0.34); }
  }
  @keyframes zoey-dot {
    0%,100% { transform: translateY(0); opacity: .45; }
    50%     { transform: translateY(-6px); opacity: 1; }
  }
  @keyframes zoey-bounce {
    0%,100% { transform: translateY(0); }
    20%     { transform: translateY(-12px); }
    45%     { transform: translateY(0); }
    62%     { transform: translateY(-6px); }
    100%    { transform: translateY(0); }
  }
  @keyframes zoey-burst {
    0%   { opacity: 0; transform: translate(0,8px) scale(0.2); }
    35%  { opacity: 1; transform: translate(0,-6px) scale(1.25); }
    100% { opacity: 0; transform: translate(0,-22px) scale(0.7); }
  }
  @keyframes zoey-nod {
    0%,100% { transform: rotate(0deg)  translateY(0); }
    30%     { transform: rotate(2deg)  translateY(4px); }
    55%     { transform: rotate(-1deg) translateY(0); }
    80%     { transform: rotate(1.5deg) translateY(3px); }
  }

  @media (prefers-reduced-motion: reduce) {
    zoey-avatar .figure, zoey-avatar .eye, zoey-avatar .spark-sig,
    zoey-avatar[state="wave"] .arm,
    zoey-avatar[state="celebrate"] .figure,
    zoey-avatar[state="celebrate"] .celebrate-fx .spark,
    zoey-avatar[state="encourage"] .head,
    zoey-avatar[state="think"] .think-dots circle,
    zoey-avatar[state="talk"] .mouth-open { animation: none !important; }
    zoey-avatar[state="wave"] .arm { opacity: 1; transform: translateY(0) rotate(-6deg); }
    zoey-avatar[state="talk"] .mouth-open { transform: scaleY(0.7); }
  }`;

  function injectStyleOnce() {
    if (document.getElementById('zoey-avatar-style')) return;
    const s = document.createElement('style');
    s.id = 'zoey-avatar-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  const ONE_SHOT = { wave: 2400, celebrate: 1700, encourage: 1550 };
  const VALID = ['idle', 'wave', 'think', 'talk', 'celebrate', 'encourage'];
  let SEQ = 0;

  class ZoeyAvatar extends HTMLElement {
    static get observedAttributes() { return ['size', 'state']; }

    constructor() {
      super();
      this._uid = (++SEQ);
      this._timer = null;
      this._built = false;
    }

    connectedCallback() {
      injectStyleOnce();
      if (!this._built) {
        this.innerHTML = svgFor(this._uid);
        this._built = true;
      }
      if (!this.hasAttribute('state')) this.setAttribute('state', 'idle');
      this._applySize();
    }

    attributeChangedCallback(name) {
      if (name === 'size') this._applySize();
    }

    _applySize() {
      const s = this.getAttribute('size');
      if (s) this.style.setProperty('--zoey-size', /^\d+$/.test(s) ? s + 'px' : s);
    }

    setState(name, hold) {
      if (!VALID.includes(name)) return;
      clearTimeout(this._timer);
      this.removeAttribute('state');
      void this.offsetWidth;            // force reflow → restart animations
      this.setAttribute('state', name);
      const dwell = hold != null ? hold : ONE_SHOT[name];
      if (dwell != null) {
        this._timer = setTimeout(() => this.setAttribute('state', 'idle'), dwell);
      }
    }

    idle()      { this.setState('idle'); }
    wave()      { this.setState('wave'); }
    think()     { this.setState('think'); }
    talk(ms)    { this.setState('talk', ms); }
    celebrate() { this.setState('celebrate'); }
    encourage() { this.setState('encourage'); }
  }

  if (!customElements.get('zoey-avatar')) {
    customElements.define('zoey-avatar', ZoeyAvatar);
  }
})();
