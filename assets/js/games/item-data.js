/* ─────────────────────────────────────────────────────────
   ReadyKiddo Item Library — SVG Data
   All items extracted from item-library.html, organized by world
   ───────────────────────────────────────────────────────── */

const COLOR_HEX = {
  red:    '#e23b3b',
  blue:   '#2a7fd9',
  yellow: '#f4c83b',
  green:  '#4aaf5a',
  purple: '#9558c4',
  orange: '#ff9d2f',
};

const DARK = {
  red:    '#a32424',
  blue:   '#1c5fa6',
  yellow: '#c8a000',
  green:  '#2f8541',
  purple: '#6e3aa1',
  orange: '#c66a18',
};

const LIGHT = {
  red:    '#ff7a7a',
  blue:   '#7fb6f0',
  yellow: '#ffe590',
  green:  '#88d796',
  purple: '#c193e6',
  orange: '#ffc080',
};

const sparkle = (x, y, s = 4, fill = 'white', op = 0.9) =>
  `<path d="M${x} ${y - s}L${x + s/3} ${y - s/3}L${x + s} ${y}L${x + s/3} ${y + s/3}L${x} ${y + s}L${x - s/3} ${y + s/3}L${x - s} ${y}L${x - s/3} ${y - s/3}z" fill="${fill}" opacity="${op}"/>`;

/* ─────────────────────────────────────────────────────────
   Item Generators (color → SVG)
   ───────────────────────────────────────────────────────── */

const ITEM_GENERATORS = {
  // SPACE
  star: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rsg${c}" cx="38%" cy="28%" r="65%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
        <radialGradient id="rsgg${c}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${COLOR_HEX[c]}" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="${COLOR_HEX[c]}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#rsgg${c})"/>
      <path d="M50 8l11 27 29 3-22 19 7 29-25-15-25 15 7-29-22-19 29-3z"
            fill="url(#rsg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="40" cy="30" rx="8" ry="4.5" fill="white" opacity="0.45" transform="rotate(-25 40 30)"/>
      <circle cx="43" cy="55" r="3.5" fill="${DARK[c]}"/>
      <circle cx="57" cy="55" r="3.5" fill="${DARK[c]}"/>
      <circle cx="44.2" cy="54" r="1.2" fill="white"/>
      <circle cx="58.2" cy="54" r="1.2" fill="white"/>
      <path d="M44 62 q6 6 12 0" stroke="${DARK[c]}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="37" cy="61" rx="4" ry="2.5" fill="#ff9eb5" opacity="0.6"/>
      <ellipse cx="63" cy="61" rx="4" ry="2.5" fill="#ff9eb5" opacity="0.6"/>
      ${sparkle(18, 20, 5)}${sparkle(82, 24, 4)}${sparkle(76, 78, 4)}
    </svg>`,

  planet: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rpg${c}" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="60%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
        <linearGradient id="rring${c}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${DARK[c]}" stop-opacity="0.7"/>
          <stop offset="50%" stop-color="${LIGHT[c]}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="${DARK[c]}" stop-opacity="0.7"/>
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="56" rx="46" ry="11" fill="none" stroke="url(#rring${c})" stroke-width="5" opacity="0.5"/>
      <circle cx="50" cy="50" r="30" fill="url(#rpg${c})" stroke="${DARK[c]}" stroke-width="2.5"/>
      <path d="M25 42 q10-4 20-2 q8 2 16-1" stroke="${LIGHT[c]}" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5"/>
      <path d="M22 50 q12 3 24 0 q10-3 16 1" stroke="${DARK[c]}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.35"/>
      <ellipse cx="36" cy="38" rx="8" ry="4.5" fill="white" opacity="0.45" transform="rotate(-15 36 38)"/>
      <circle cx="40" cy="36" r="2.5" fill="white" opacity="0.7"/>
      <circle cx="64" cy="60" r="4" fill="${DARK[c]}" opacity="0.2"/>
      <circle cx="57" cy="65" r="2.5" fill="${DARK[c]}" opacity="0.15"/>
      <ellipse cx="50" cy="56" rx="46" ry="11" fill="none" stroke="url(#rring${c})" stroke-width="5" opacity="0.85" clip-path="inset(0 0 50% 0)"/>
      ${sparkle(86, 16, 4.5)}${sparkle(14, 78, 3.5)}
    </svg>`,

  rocket: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rrk${c}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${DARK[c]}"/>
          <stop offset="40%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </linearGradient>
        <radialGradient id="rwin${c}" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#e8f4ff"/>
          <stop offset="100%" stop-color="#a8cce8"/>
        </radialGradient>
      </defs>
      <path d="M50 8c10 6 16 22 16 38v34H34V46c0-16 6-32 16-38z"
            fill="url(#rrk${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M50 10c-2 4-5 12-7 22l14 0c-2-10-5-18-7-22z" fill="white" opacity="0.2"/>
      <circle cx="50" cy="40" r="10" fill="url(#rwin${c})" stroke="${DARK[c]}" stroke-width="2.5"/>
      <path d="M43 35 a10 10 0 0 1 9-4" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.9"/>
      <circle cx="46" cy="37" r="1.5" fill="${DARK[c]}" opacity="0.7"/>
      <circle cx="54" cy="37" r="1.5" fill="${DARK[c]}" opacity="0.7"/>
      <path d="M46 43 q4 3 8 0" stroke="${DARK[c]}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M34 60L22 76v6h12z" fill="${DARK[c]}" stroke="${DARK[c]}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M66 60l12 16v6H66z" fill="${DARK[c]}" stroke="${DARK[c]}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M42 80h16l-2 7H44z" fill="#d44"/>
      <path d="M44 85h12l-2 6H46z" fill="#f08a2c"/>
      <path d="M46 89h8l-1 5H47z" fill="#f4c83b"/>
      <path d="M48 93h4l-1 3H49z" fill="white" opacity="0.9"/>
      ${sparkle(18, 22, 4)}${sparkle(84, 34, 3)}
    </svg>`,

  // CANDY LAND
  lollipop: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="llg${c}" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
        <radialGradient id="llgl${c}" cx="30%" cy="28%" r="45%">
          <stop offset="0%" stop-color="white" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <line x1="50" y1="46" x2="50" y2="94" stroke="#e8dcc8" stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="46" x2="50" y2="94" stroke="#c8b88a" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="50" cy="34" r="28" fill="white" stroke="${DARK[c]}" stroke-width="2.5"/>
      <circle cx="50" cy="34" r="28" fill="url(#llg${c})" opacity="0.9"/>
      <path d="M50 6 a28 28 0 0 1 24 14" stroke="white" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.55"/>
      <path d="M74 20 a28 28 0 0 1 4 18" stroke="white" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.4"/>
      <path d="M78 38 a28 28 0 0 1-10 20" stroke="${DARK[c]}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.3"/>
      <path d="M68 58 a28 28 0 0 1-18 8" stroke="${DARK[c]}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.3"/>
      <circle cx="50" cy="34" r="28" fill="url(#llgl${c})"/>
      <circle cx="50" cy="34" r="28" fill="none" stroke="${DARK[c]}" stroke-width="2.5"/>
      <ellipse cx="38" cy="22" rx="7" ry="4" fill="white" opacity="0.5" transform="rotate(-20 38 22)"/>
      ${sparkle(34, 20, 3.5)}
    </svg>`,

  gummy: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gmg${c}" cx="36%" cy="28%" r="68%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="60%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="82" rx="18" ry="3" fill="${DARK[c]}" opacity="0.18"/>
      <path d="M50 14c-7 0-12 5-12 11 0 3 1 5 0 7-2 1-6 0-10 3-5 4-6 11-3 17 1 2 1 4 0 6-2 4-1 9 3 11 4 3 9 1 12 4s6 7 10 7 7-4 10-7 8-1 12-4 5-7 3-11c-1-2-1-4 0-6 3-6 2-13-3-17-4-3-8-2-10-3-1-2 0-4 0-7 0-6-5-11-12-11z"
            fill="url(#gmg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="42" cy="46" rx="14" ry="18" fill="white" opacity="0.2" transform="rotate(-8 42 46)"/>
      <ellipse cx="36" cy="24" rx="5" ry="3" fill="white" opacity="0.55" transform="rotate(-10 36 24)"/>
      <ellipse cx="41" cy="22" rx="3" ry="4" fill="${DARK[c]}"/>
      <ellipse cx="59" cy="22" rx="3" ry="4" fill="${DARK[c]}"/>
      <circle cx="41" cy="20.5" r="1.2" fill="white"/>
      <circle cx="59" cy="20.5" r="1.2" fill="white"/>
      <path d="M44 31 q6 4 12 0" stroke="${DARK[c]}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="34" cy="34" rx="3.5" ry="2" fill="#ff9eb5" opacity="0.6"/>
      <ellipse cx="66" cy="34" rx="3.5" ry="2" fill="#ff9eb5" opacity="0.6"/>
      <circle cx="38" cy="36" r="3" fill="${LIGHT[c]}" opacity="0.5"/>
      <circle cx="62" cy="36" r="3" fill="${LIGHT[c]}" opacity="0.5"/>
    </svg>`,

  cupcake: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cpfg${c}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${DARK[c]}"/>
          <stop offset="50%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </linearGradient>
        <linearGradient id="cpwg${c}" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="white"/>
          <stop offset="100%" stop-color="#f0e8d8"/>
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="93" rx="26" ry="3" fill="#000" opacity="0.1"/>
      <path d="M28 58h44l-3 28c0 3-2 4-5 4H36c-3 0-5-1-5-4z" fill="#f0d890" stroke="#c8a040" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M33 62v24M40 62v26M48 62v26M56 62v26M63 62v24" stroke="#c8a040" stroke-width="1.8" opacity="0.5"/>
      <path d="M28 58h44" stroke="#c8a040" stroke-width="2.5"/>
      <path d="M28 58c-2-14 8-26 22-26s24 12 22 26z" fill="url(#cpfg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M32 56 q6-8 12-10 q6-2 8-8 q4-4 8-4 q6 0 12 8 q4 6 6 14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>
      <path d="M38 44 a4 4 0 1 1 0.1 0z M50 38 a4 4 0 1 1 0.1 0z M62 44 a4 4 0 1 1 0.1 0z" fill="white" opacity="0.4"/>
      <path d="M36 36 q7-4 14 0 q7 4 14 0" fill="url(#cpwg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <path d="M36 36 q7-8 14-4 q7 4 14-4" fill="url(#cpwg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <ellipse cx="50" cy="30" rx="8" ry="7" fill="url(#cpwg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <ellipse cx="50" cy="24" rx="5" ry="4" fill="url(#cpwg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <circle cx="50" cy="20" r="6" fill="#e03030" stroke="#a01010" stroke-width="2"/>
      <path d="M50 14c0-5 4-9 8-7" stroke="#3d6b2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="48" cy="19" rx="2" ry="1.2" fill="white" opacity="0.7"/>
      <circle cx="40" cy="52" r="2" fill="white" opacity="0.7"/>
      <circle cx="60" cy="50" r="1.5" fill="${DARK[c]}" opacity="0.5"/>
    </svg>`,

  candycane: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="62" cy="94" rx="16" ry="3" fill="#000" opacity="0.12"/>
      <!-- Dark outline pass -->
      <path d="M62 90 L62 42 Q62 12 36 12 Q10 12 10 38 Q10 58 30 58"
            stroke="${DARK[c]}" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Main color body -->
      <path d="M62 90 L62 42 Q62 12 36 12 Q10 12 10 38 Q10 58 30 58"
            stroke="${COLOR_HEX[c]}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- White diagonal stripes -->
      <path d="M62 90 L62 42 Q62 12 36 12 Q10 12 10 38 Q10 58 30 58"
            stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"
            stroke-dasharray="10,17" stroke-dashoffset="4" opacity="0.82"/>
      <!-- Gloss highlight -->
      <path d="M58 87 L58 44 Q58 17 36 17 Q14 17 14 38 Q14 54 30 54"
            stroke="white" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.38"/>
      ${sparkle(80, 18, 4)}${sparkle(20, 74, 3)}
    </svg>`,

  icecream: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="icsg${c}" cx="36%" cy="28%" r="68%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="60%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
        <linearGradient id="iccg${c}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f8e874"/>
          <stop offset="100%" stop-color="#c88e28"/>
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="95" rx="18" ry="3" fill="#000" opacity="0.12"/>
      <!-- Scoop dome -->
      <circle cx="50" cy="42" r="32" fill="url(#icsg${c})" stroke="${DARK[c]}" stroke-width="2.5"/>
      <!-- Drips -->
      <path d="M20 58 Q16 68 20 77" stroke="${COLOR_HEX[c]}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/>
      <path d="M80 62 Q84 71 80 79" stroke="${COLOR_HEX[c]}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.6"/>
      <!-- Cone -->
      <path d="M18 72 L50 96 L82 72 Z" fill="url(#iccg${c})" stroke="#a06020" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Cone waffle grid -->
      <line x1="34" y1="72" x2="42" y2="96" stroke="#a06020" stroke-width="1.5" opacity="0.5"/>
      <line x1="50" y1="72" x2="50" y2="96" stroke="#a06020" stroke-width="1.5" opacity="0.5"/>
      <line x1="66" y1="72" x2="58" y2="96" stroke="#a06020" stroke-width="1.5" opacity="0.5"/>
      <line x1="18" y1="78" x2="82" y2="78" stroke="#a06020" stroke-width="1.5" opacity="0.5"/>
      <line x1="24" y1="84" x2="76" y2="84" stroke="#a06020" stroke-width="1.5" opacity="0.5"/>
      <line x1="32" y1="90" x2="68" y2="90" stroke="#a06020" stroke-width="1.5" opacity="0.5"/>
      <!-- Scoop highlight -->
      <ellipse cx="37" cy="31" rx="11" ry="6.5" fill="white" opacity="0.48" transform="rotate(-15 37 31)"/>
      <circle cx="34" cy="29" r="4" fill="white" opacity="0.72"/>
      ${sparkle(80, 20, 4)}${sparkle(17, 55, 3)}
    </svg>`,

  gumdrop: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gdg${c}" cx="36%" cy="26%" r="70%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="58%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="34" ry="4" fill="#000" opacity="0.12"/>
      <!-- Dome body -->
      <path d="M18 70 C18 16 82 16 82 70 L88 70 Q92 70 92 80 Q92 88 84 88 L16 88 Q8 88 8 80 Q8 70 12 70 Z"
            fill="url(#gdg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Sugar ridge lines on base -->
      <line x1="10" y1="76" x2="90" y2="76" stroke="${DARK[c]}" stroke-width="1.5" opacity="0.18"/>
      <line x1="9" y1="83" x2="91" y2="83" stroke="${DARK[c]}" stroke-width="1.5" opacity="0.18"/>
      <!-- Dome highlight -->
      <ellipse cx="34" cy="32" rx="13" ry="8" fill="white" opacity="0.46" transform="rotate(-14 34 32)"/>
      <ellipse cx="30" cy="29" rx="6.5" ry="4" fill="white" opacity="0.72" transform="rotate(-14 30 29)"/>
      <!-- Small dots (sugar texture) -->
      <circle cx="62" cy="58" r="2.5" fill="${LIGHT[c]}" opacity="0.5"/>
      <circle cx="72" cy="44" r="2" fill="${LIGHT[c]}" opacity="0.4"/>
      <circle cx="30" cy="55" r="2" fill="${LIGHT[c]}" opacity="0.4"/>
      ${sparkle(78, 22, 4)}${sparkle(18, 64, 3)}
    </svg>`,

  cherry: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chg${c}" cx="35%" cy="27%" r="66%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="58%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="95" rx="18" ry="3" fill="#000" opacity="0.12"/>
      <ellipse cx="70" cy="95" rx="18" ry="3" fill="#000" opacity="0.12"/>
      <!-- Left stem: curves up from left cherry to top center -->
      <path d="M34 64 Q34 34 50 26" stroke="#3d6b2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Right stem: curves up from right cherry to top center -->
      <path d="M66 64 Q70 40 50 26" stroke="#3d6b2a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Leaf at the junction -->
      <path d="M48 28 Q44 14 58 16 Q56 28 48 28 Z" fill="#5aa341" stroke="#3d6b2a" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Left cherry -->
      <circle cx="30" cy="78" r="20" fill="url(#chg${c})" stroke="${DARK[c]}" stroke-width="2.5"/>
      <!-- Right cherry -->
      <circle cx="70" cy="78" r="20" fill="url(#chg${c})" stroke="${DARK[c]}" stroke-width="2.5"/>
      <!-- Left highlight -->
      <ellipse cx="22" cy="69" rx="7" ry="4.5" fill="white" opacity="0.5" transform="rotate(-14 22 69)"/>
      <circle cx="20" cy="68" r="3.5" fill="white" opacity="0.72"/>
      <!-- Right highlight -->
      <ellipse cx="62" cy="69" rx="7" ry="4.5" fill="white" opacity="0.5" transform="rotate(-14 62 69)"/>
      <circle cx="60" cy="68" r="3.5" fill="white" opacity="0.72"/>
      ${sparkle(86, 62, 3.5)}${sparkle(14, 62, 3)}
    </svg>`,

  // JUNGLE
  fruit: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="frg${c}" cx="36%" cy="28%" r="68%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="65%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="93" rx="22" ry="3" fill="#000" opacity="0.12"/>
      <path d="M50 20c0-4-2-8-2-10 4 0 8 2 10 6" fill="#8a6030" stroke="#5a3818" stroke-width="2"/>
      <path d="M52 18c4-2 12-2 18 2-4 8-12 10-18 6z" fill="#5aa341" stroke="#3d6b2a" stroke-width="2" stroke-linejoin="round"/>
      <path d="M58 16 q4 2 8 5" stroke="#3d6b2a" stroke-width="1.5" fill="none"/>
      <path d="M50 26c-20 0-32 12-32 30 0 20 14 32 32 32s32-12 32-32c0-18-12-30-32-30z"
            fill="url(#frg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M26 42 q8-8 16-6" stroke="${LIGHT[c]}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.45"/>
      <ellipse cx="36" cy="40" rx="9" ry="5.5" fill="white" opacity="0.5" transform="rotate(-15 36 40)"/>
      <circle cx="33" cy="37" r="3" fill="white" opacity="0.7"/>
      <ellipse cx="70" cy="70" rx="6" ry="3.5" fill="${DARK[c]}" opacity="0.22"/>
    </svg>`,

  leaf: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lfg${c}" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </linearGradient>
      </defs>
      <path d="M86 14c-44 4-66 32-66 66 4 0 8 0 12-2 30-12 50-32 56-62-1-1-2-2-2-2z"
            fill="url(#lfg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M82 22c-32 8-50 28-58 56" stroke="${DARK[c]}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M78 30 q-8 4-14 8 M70 36 q-8 6-12 12 M74 44 q-10 5-16 14 M62 48 q-7 8-12 18 M68 58 q-9 6-14 18 M54 56 q-6 10-10 20 M58 66 q-7 8-12 18" stroke="${DARK[c]}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.45"/>
      <ellipse cx="62" cy="32" rx="10" ry="4" fill="${LIGHT[c]}" opacity="0.4" transform="rotate(-32 62 32)"/>
      <ellipse cx="72" cy="22" rx="3.5" ry="2" fill="white" opacity="0.55"/>
      <circle cx="34" cy="72" r="4" fill="white" opacity="0.35"/>
      <ellipse cx="36" cy="72" rx="2" ry="3" fill="white" opacity="0.55" transform="rotate(-20 36 72)"/>
    </svg>`,

  flower: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flpg${c}" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
        <radialGradient id="flcg" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#ffe87a"/>
          <stop offset="100%" stop-color="#c8a000"/>
        </radialGradient>
      </defs>
      <path d="M50 56v34" stroke="#3d6b2a" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 80c-4-2-10 0-12-6 6-2 12 0 12 6z" fill="#5aa341" stroke="#3d6b2a" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M50 72c4-2 10-2 14-8-6-4-12-2-14 8z" fill="#5aa341" stroke="#3d6b2a" stroke-width="1.8" stroke-linejoin="round"/>
      <ellipse cx="50" cy="22" rx="12" ry="15" fill="url(#flpg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <ellipse cx="71" cy="32" rx="12" ry="15" fill="url(#flpg${c})" stroke="${DARK[c]}" stroke-width="2" transform="rotate(60 71 32)"/>
      <ellipse cx="71" cy="56" rx="12" ry="15" fill="url(#flpg${c})" stroke="${DARK[c]}" stroke-width="2" transform="rotate(120 71 56)"/>
      <ellipse cx="50" cy="66" rx="12" ry="15" fill="url(#flpg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <ellipse cx="29" cy="56" rx="12" ry="15" fill="url(#flpg${c})" stroke="${DARK[c]}" stroke-width="2" transform="rotate(60 29 56)"/>
      <ellipse cx="29" cy="32" rx="12" ry="15" fill="url(#flpg${c})" stroke="${DARK[c]}" stroke-width="2" transform="rotate(120 29 32)"/>
      <circle cx="50" cy="44" r="13" fill="url(#flcg)" stroke="#c8a000" stroke-width="2.5"/>
      <circle cx="45" cy="40" r="2.2" fill="${DARK[c]}"/>
      <circle cx="55" cy="40" r="2.2" fill="${DARK[c]}"/>
      <circle cx="45.8" cy="39" r="0.9" fill="white"/>
      <circle cx="55.8" cy="39" r="0.9" fill="white"/>
      <path d="M45 47 q5 5 10 0" stroke="${DARK[c]}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="41" cy="46" rx="3.5" ry="2" fill="#ff9eb5" opacity="0.55"/>
      <ellipse cx="59" cy="46" rx="3.5" ry="2" fill="#ff9eb5" opacity="0.55"/>
    </svg>`,

  // BEACH
  starfish: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sfg${c}" cx="38%" cy="28%" r="68%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
      </defs>
      <path d="M50 8c3 0 5 3 7 13l3 16 16 4c10 2 14 4 14 8s-4 6-12 12l-13 9 4 17c2 9 0 13-4 13s-7-2-13-9L50 84l-2 7c-6 7-9 9-13 9s-6-4-4-13l4-17-13-9c-8-6-12-8-12-12s4-6 14-8l16-4 3-16c2-10 4-13 7-13z"
            fill="url(#sfg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M50 18c2 0 3 2 4 8l3 12 11 3c6 1 8 2 8 4 0 3-3 5-8 8l-9 6 3 11c1 5 0 7-2 7-2 0-3-2-7-7L50 76l-3 4c-4 5-5 7-7 7-2 0-3-2-2-7l3-11-9-6c-5-3-8-5-8-8 0-2 2-3 8-4l11-3 3-12c1-6 2-8 4-8z"
            fill="${LIGHT[c]}" opacity="0.45"/>
      <circle cx="50" cy="48" r="6" fill="${DARK[c]}" opacity="0.35"/>
      <circle cx="44" cy="43" r="2.2" fill="${DARK[c]}"/>
      <circle cx="56" cy="43" r="2.2" fill="${DARK[c]}"/>
      <circle cx="44.8" cy="42" r="0.9" fill="white"/>
      <circle cx="56.8" cy="42" r="0.9" fill="white"/>
      <path d="M44 51 q6 5 12 0" stroke="${DARK[c]}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="40" cy="50" rx="3.5" ry="2" fill="#ff9eb5" opacity="0.6"/>
      <ellipse cx="60" cy="50" rx="3.5" ry="2" fill="#ff9eb5" opacity="0.6"/>
      <circle cx="50" cy="30" r="2" fill="white" opacity="0.7"/>
      <circle cx="66" cy="50" r="2" fill="white" opacity="0.6"/>
      <circle cx="34" cy="50" r="2" fill="white" opacity="0.6"/>
    </svg>`,

  shell: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shg${c}" cx="40%" cy="20%" r="70%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="55%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
        <radialGradient id="shpl${c}" cx="40%" cy="30%" r="55%">
          <stop offset="0%" stop-color="white" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="93" rx="32" ry="3" fill="#000" opacity="0.1"/>
      <path d="M50 12c-4 0-8 2-12 6-16 16-26 38-30 60 4 4 30 6 42 6s38-2 42-6c-4-22-14-44-30-60-4-4-8-6-12-6z"
            fill="url(#shg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M50 12v74M40 18l-12 66M30 26l-18 58M60 18l12 66M70 26l18 58M48 16l-8 70M52 16l8 70" stroke="${DARK[c]}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.4"/>
      <path d="M50 12c-4 0-8 2-12 6-12 12-22 28-26 44 8 4 22 6 38 6 0-18 0-38 0-56z"
            fill="url(#shpl${c})"/>
      <ellipse cx="50" cy="14" rx="6" ry="5" fill="${LIGHT[c]}" stroke="${DARK[c]}" stroke-width="2"/>
      <ellipse cx="48" cy="13" rx="2.2" ry="1.2" fill="white"/>
      ${sparkle(78, 58, 3.5)}
    </svg>`,

  beachball: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bbhl${c}" cx="35%" cy="30%" r="55%">
          <stop offset="0%" stop-color="white" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="93" rx="28" ry="3" fill="#000" opacity="0.14"/>
      <circle cx="50" cy="50" r="38" fill="white" stroke="${DARK[c]}" stroke-width="2.5"/>
      <path d="M50 12 L50 88" fill="none" stroke="${DARK[c]}" stroke-width="2" opacity="0.35"/>
      <path d="M50 12 a38 38 0 0 1 33 19 L50 50z" fill="${COLOR_HEX[c]}" stroke="${DARK[c]}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M83 31 a38 38 0 0 1 5 19 L50 50z" fill="${LIGHT[c]}" stroke="${DARK[c]}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M88 50 a38 38 0 0 1-5 19 L50 50z" fill="${COLOR_HEX[c]}" stroke="${DARK[c]}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M83 69 a38 38 0 0 1-33 19 L50 50z" fill="${DARK[c]}" stroke="${DARK[c]}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 88 a38 38 0 0 1-33-19 L50 50z" fill="${COLOR_HEX[c]}" stroke="${DARK[c]}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M17 69 a38 38 0 0 1-5-19 L50 50z" fill="${LIGHT[c]}" stroke="${DARK[c]}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M12 50 a38 38 0 0 1 5-19 L50 50z" fill="${COLOR_HEX[c]}" stroke="${DARK[c]}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M17 31 a38 38 0 0 1 33-19 L50 50z" fill="white" stroke="${DARK[c]}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="7" fill="white" stroke="${DARK[c]}" stroke-width="2"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="${DARK[c]}" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="38" fill="url(#bbhl${c})"/>
      <ellipse cx="34" cy="28" rx="9" ry="4.5" fill="white" opacity="0.55"/>
      <circle cx="30" cy="26" r="3" fill="white" opacity="0.7"/>
    </svg>`,

  // BEACH (additional)
  surfboard: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sfbdg${c}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${DARK[c]}"/>
          <stop offset="40%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </linearGradient>
      </defs>
      <!-- Board body — pointed nose (top), rounded rails, pinched tail (bottom) -->
      <path d="M50 7C59 9,68 22,68 46C68 66,62 80,56 87C53 91,50 92,50 92C50 92,47 91,44 87C38 80,32 66,32 46C32 22,41 9,50 7z"
            fill="url(#sfbdg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Single thruster fin at tail -->
      <path d="M54 85Q62 93,62 99L50 92Q52 89,54 85z"
            fill="${DARK[c]}" stroke="${DARK[c]}" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Decorative stripe across mid-board -->
      <path d="M34 46C38 42,62 42,66 46C62 50,38 50,34 46z"
            fill="${LIGHT[c]}" opacity="0.45"/>
      <!-- Gloss highlight running down the left rail -->
      <ellipse cx="43" cy="26" rx="5" ry="13" fill="white" opacity="0.45" transform="rotate(-6 43 26)"/>
      <circle cx="50" cy="13" r="3" fill="white" opacity="0.5"/>
    </svg>`,

  sandcastle: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sdcg${c}" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </linearGradient>
      </defs>
      <!-- Base mound (trapezoid) -->
      <path d="M10 90L90 90L86 76L14 76z" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Left tower body -->
      <rect x="13" y="52" width="22" height="24" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2.5"/>
      <!-- Left battlements (3 merlons + 2 gaps) -->
      <rect x="13" y="40" width="5" height="14" rx="1" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <rect x="21" y="40" width="5" height="14" rx="1" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <rect x="29" y="40" width="6" height="14" rx="1" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <!-- Centre tower body (tallest) -->
      <rect x="37" y="34" width="26" height="42" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2.5"/>
      <!-- Centre battlements -->
      <rect x="37" y="20" width="6" height="16" rx="1" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <rect x="47" y="20" width="6" height="16" rx="1" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <rect x="57" y="20" width="6" height="16" rx="1" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <!-- Flag pole + pennant -->
      <line x1="53" y1="8" x2="53" y2="22" stroke="${DARK[c]}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M53 8L65 13L53 18z" fill="${LIGHT[c]}" stroke="${DARK[c]}" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Right tower body -->
      <rect x="65" y="56" width="22" height="20" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2.5"/>
      <!-- Right battlements -->
      <rect x="65" y="44" width="5" height="14" rx="1" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <rect x="73" y="44" width="5" height="14" rx="1" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <rect x="81" y="44" width="6" height="14" rx="1" fill="url(#sdcg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <!-- Gloss highlights on left faces -->
      <ellipse cx="25" cy="63" rx="4" ry="9" fill="white" opacity="0.2"/>
      <ellipse cx="50" cy="52" rx="6" ry="14" fill="white" opacity="0.18"/>
    </svg>`,

  scallop: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradient radiates outward from the hinge point at the base -->
        <radialGradient id="sclg${c}" cx="50" cy="82" r="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="60%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
      </defs>
      <!-- Fan-shell body.  The top edge is 5 scalloped semicircle bumps,
           each 14 px wide (radius 7), sweeping counterclockwise (upward).
           Bezier curves connect the edges to create the fan silhouette. -->
      <path d="M50 82C40 82,18 74,8 58C2 44,6 26,16 16
               a7,7 0 0,0 14,0 a7,7 0 0,0 14,0 a7,7 0 0,0 14,0
               a7,7 0 0,0 14,0 a7,7 0 0,0 14,0
               C84 26,94 44,88 58C78 74,60 82,50 82z"
            fill="url(#sclg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Radiating ribs from hinge to the six inter-scallop notch points -->
      <line x1="50" y1="82" x2="16" y2="16" stroke="${DARK[c]}" stroke-width="1.8" opacity="0.35" stroke-linecap="round"/>
      <line x1="50" y1="82" x2="30" y2="16" stroke="${DARK[c]}" stroke-width="1.8" opacity="0.35" stroke-linecap="round"/>
      <line x1="50" y1="82" x2="44" y2="16" stroke="${DARK[c]}" stroke-width="1.8" opacity="0.35" stroke-linecap="round"/>
      <line x1="50" y1="82" x2="58" y2="16" stroke="${DARK[c]}" stroke-width="1.8" opacity="0.35" stroke-linecap="round"/>
      <line x1="50" y1="82" x2="72" y2="16" stroke="${DARK[c]}" stroke-width="1.8" opacity="0.35" stroke-linecap="round"/>
      <line x1="50" y1="82" x2="86" y2="16" stroke="${DARK[c]}" stroke-width="1.8" opacity="0.35" stroke-linecap="round"/>
      <!-- Hinge bumps at the base -->
      <ellipse cx="38" cy="84" rx="5" ry="3.5" fill="url(#sclg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <ellipse cx="50" cy="86" rx="5" ry="3.5" fill="url(#sclg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <ellipse cx="62" cy="84" rx="5" ry="3.5" fill="url(#sclg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <!-- Gloss highlight on left fan face -->
      <ellipse cx="27" cy="44" rx="7" ry="15" fill="white" opacity="0.28" transform="rotate(-28 27 44)"/>
    </svg>`,

  hibiscus: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hibg${c}" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
      </defs>
      <!-- 5 petals: each is the same ellipse (cx=50,cy=28) rotated 72° increments
           around the flower centre (50,50).  The petal tip reaches y≈12. -->
      <ellipse cx="50" cy="28" rx="12" ry="16" fill="url(#hibg${c})" stroke="${DARK[c]}" stroke-width="2" transform="rotate(0   50 50)"/>
      <ellipse cx="50" cy="28" rx="12" ry="16" fill="url(#hibg${c})" stroke="${DARK[c]}" stroke-width="2" transform="rotate(72  50 50)"/>
      <ellipse cx="50" cy="28" rx="12" ry="16" fill="url(#hibg${c})" stroke="${DARK[c]}" stroke-width="2" transform="rotate(144 50 50)"/>
      <ellipse cx="50" cy="28" rx="12" ry="16" fill="url(#hibg${c})" stroke="${DARK[c]}" stroke-width="2" transform="rotate(216 50 50)"/>
      <ellipse cx="50" cy="28" rx="12" ry="16" fill="url(#hibg${c})" stroke="${DARK[c]}" stroke-width="2" transform="rotate(288 50 50)"/>
      <!-- Stamen tube curving toward upper-right -->
      <path d="M54 47C60 40,66 32,70 22" stroke="${DARK[c]}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Anther dots at stamen tip -->
      <circle cx="68" cy="18" r="3"   fill="${DARK[c]}"/>
      <circle cx="74" cy="21" r="2.5" fill="${DARK[c]}"/>
      <circle cx="72" cy="14" r="2.5" fill="${DARK[c]}"/>
      <circle cx="78" cy="17" r="2"   fill="${DARK[c]}"/>
      <!-- Centre disc -->
      <circle cx="50" cy="50" r="11" fill="${LIGHT[c]}"     stroke="${DARK[c]}" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="6"  fill="${COLOR_HEX[c]}" opacity="0.7"/>
      <!-- Petal gloss highlights (same rotation as petals) -->
      <ellipse cx="50" cy="21" rx="4" ry="7" fill="white" opacity="0.35" transform="rotate(0   50 50)"/>
      <ellipse cx="50" cy="21" rx="4" ry="7" fill="white" opacity="0.35" transform="rotate(72  50 50)"/>
      <ellipse cx="50" cy="21" rx="4" ry="7" fill="white" opacity="0.35" transform="rotate(144 50 50)"/>
      <ellipse cx="50" cy="21" rx="4" ry="7" fill="white" opacity="0.35" transform="rotate(216 50 50)"/>
      <ellipse cx="50" cy="21" rx="4" ry="7" fill="white" opacity="0.35" transform="rotate(288 50 50)"/>
    </svg>`,

  // CASTLE
  gem: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gmtg${c}" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="50%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="${COLOR_HEX[c]}" opacity="0.1"/>
      <path d="M22 36L40 14h20l18 22L50 92z"
            fill="url(#gmtg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 36h56" stroke="${DARK[c]}" stroke-width="2.5"/>
      <path d="M40 14L34 36L50 92M60 14l6 22L50 92M22 36L50 92M78 36L50 92M40 14h20"
            stroke="${DARK[c]}" stroke-width="2" fill="none"/>
      <path d="M40 14L34 36h-12z" fill="${LIGHT[c]}" opacity="0.75"/>
      <path d="M40 14h20l-10 22z" fill="white" opacity="0.6"/>
      <path d="M60 14l6 22h12z" fill="${LIGHT[c]}" opacity="0.55"/>
      <path d="M22 36l28 56-16-56z" fill="${DARK[c]}" opacity="0.22"/>
      <path d="M44 18l3-2 3 5-4 14-3-2z" fill="white" opacity="0.65"/>
      ${sparkle(74, 20, 4.5)}${sparkle(26, 62, 3.5)}${sparkle(78, 68, 3)}
    </svg>`,

  shield: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shdg${c}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </linearGradient>
        <linearGradient id="shdrim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffe87a"/>
          <stop offset="100%" stop-color="#c8a000"/>
        </linearGradient>
      </defs>
      <path d="M50 10c14 4 24 6 34 6 0 28-4 54-34 70-30-16-34-42-34-70 10 0 20-2 34-6z"
            fill="url(#shdrim)" stroke="#c8a000" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 16c12 3 20 5 28 5 0 24-3 46-28 60-25-14-28-36-28-60 8 0 16-2 28-5z"
            fill="url(#shdg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <path d="M50 16c-12 3-20 5-28 5 0 24 3 46 28 60z"
            fill="${DARK[c]}" opacity="0.15"/>
      <path d="M50 28v36M34 46h32" stroke="white" stroke-width="6" stroke-linecap="round"/>
      <path d="M50 28v36M34 46h32" stroke="${DARK[c]}" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
      <circle cx="50" cy="46" r="5" fill="#ffe87a" stroke="${DARK[c]}" stroke-width="2"/>
      <ellipse cx="32" cy="24" rx="5" ry="2" fill="white" opacity="0.4" transform="rotate(-20 32 24)"/>
      <circle cx="80" cy="20" r="4" fill="#ffe87a" opacity="0.8"/>
      <circle cx="80" cy="20" r="2" fill="white" opacity="0.7"/>
      ${sparkle(78, 28, 3.5)}
    </svg>`,

  crown: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crwg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffe87a"/>
          <stop offset="50%" stop-color="#f0c840"/>
          <stop offset="100%" stop-color="#c8a000"/>
        </linearGradient>
        <linearGradient id="crwvg${c}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </linearGradient>
      </defs>
      <path d="M12 36l16 30h44l16-30-18 14-14-26-6 22-6-22-14 26z"
            fill="url(#crwg)" stroke="#c8a000" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M12 36l16 30v-22z M88 36l-16 30v-22z" fill="#c8a000" opacity="0.25"/>
      <rect x="20" y="66" width="60" height="15" rx="4" fill="url(#crwg)" stroke="#c8a000" stroke-width="2.5"/>
      <rect x="20" y="66" width="28" height="15" rx="4" fill="#c8a000" opacity="0.18"/>
      <path d="M20 72h60" stroke="#c8a000" stroke-width="1.8" opacity="0.5"/>
      <path d="M36 66 q7 8 14 0" fill="url(#crwvg${c})" stroke="${DARK[c]}" stroke-width="1.5"/>
      <circle cx="12" cy="36" r="6" fill="#e03030" stroke="#c8a000" stroke-width="2"/>
      <circle cx="11" cy="34" r="2.2" fill="#ff9eb5"/>
      <circle cx="50" cy="37" r="6" fill="#2a7fd9" stroke="#c8a000" stroke-width="2"/>
      <circle cx="49" cy="35" r="2.2" fill="#aaddff"/>
      <circle cx="88" cy="36" r="6" fill="#4aaf5a" stroke="#c8a000" stroke-width="2"/>
      <circle cx="87" cy="34" r="2.2" fill="#aaffc0"/>
      <circle cx="32" cy="73" r="3.5" fill="#f4c83b" stroke="#c8a000" stroke-width="1.5"/>
      <circle cx="50" cy="73" r="3.5" fill="#9558c4" stroke="#c8a000" stroke-width="1.5"/>
      <circle cx="68" cy="73" r="3.5" fill="#4aaf5a" stroke="#c8a000" stroke-width="1.5"/>
      <path d="M24 42 q8-2 16 2" stroke="white" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
      ${sparkle(50, 24, 4)}${sparkle(88, 28, 3.5)}
    </svg>`,

  // STUDIO
  paintblob: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pbg${c}" cx="36%" cy="28%" r="68%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="60%" stop-color="${COLOR_HEX[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
        <radialGradient id="pbhl${c}" cx="32%" cy="26%" r="45%">
          <stop offset="0%" stop-color="white" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="52" cy="93" rx="22" ry="2.5" fill="#000" opacity="0.1"/>
      <path d="M50 12c-7 0-12 6-16 14-3 6-9 8-14 16-7 12-2 28 12 32 9 3 20 2 28-2 10-4 18-12 20-22 2-12-4-22-12-30-5-6-10-8-18-8z"
            fill="url(#pbg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="80" cy="64" r="8" fill="url(#pbg${c})" stroke="${DARK[c]}" stroke-width="2"/>
      <circle cx="89" cy="78" r="4.5" fill="${COLOR_HEX[c]}" stroke="${DARK[c]}" stroke-width="1.5"/>
      <circle cx="94" cy="86" r="2.5" fill="${COLOR_HEX[c]}"/>
      <circle cx="22" cy="76" r="5" fill="url(#pbg${c})" stroke="${DARK[c]}" stroke-width="1.8"/>
      <circle cx="14" cy="84" r="2.5" fill="${COLOR_HEX[c]}"/>
      <path d="M50 12c-7 0-12 6-16 14-3 6-9 8-14 16-7 12-2 28 12 32 9 3 20 2 28-2 10-4 18-12 20-22 2-12-4-22-12-30-5-6-10-8-18-8z"
            fill="url(#pbhl${c})"/>
      <circle cx="32" cy="30" r="4" fill="white" opacity="0.8"/>
      ${sparkle(28, 24, 3.5)}
    </svg>`,

  brush: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brwg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d4a060"/>
          <stop offset="50%" stop-color="#e8c888"/>
          <stop offset="100%" stop-color="#b88040"/>
        </linearGradient>
        <linearGradient id="brfg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#c0c0c0"/>
          <stop offset="50%" stop-color="#f0f0f0"/>
          <stop offset="100%" stop-color="#a0a0a0"/>
        </linearGradient>
        <radialGradient id="brtg${c}" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="95" rx="14" ry="2" fill="#000" opacity="0.1"/>
      <rect x="38" y="50" width="24" height="40" rx="4" fill="url(#brwg)" stroke="#8a5020" stroke-width="2.5"/>
      <path d="M38 50h24v6h-24z" fill="#b88040" opacity="0.4"/>
      <path d="M42 56v32 M48 54v34 M54 54v34" stroke="#8a5020" stroke-width="1.2" opacity="0.3"/>
      <rect x="38" y="47" width="24" height="6" rx="1.5" fill="url(#brfg)" stroke="#888" stroke-width="2"/>
      <path d="M40 49h20" stroke="white" stroke-width="1.5" opacity="0.5"/>
      <path d="M38 48 h24 l-2-12 c-1-5-5-9-10-9s-9 4-10 9z"
            fill="${LIGHT[c]}" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M44 44 q6 2 12 0" fill="none" stroke="${DARK[c]}" stroke-width="1.5" opacity="0.4"/>
      <path d="M42 28c-3-7-2-15 4-19 8-5 18 0 18 9 0 5-2 9-5 13"
            fill="url(#brtg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M48 18c-2-2-4-4-2-7 M52 14c-1-3 1-5 4-5 M58 14c2-2 6-2 8 0" stroke="${LIGHT[c]}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="48" cy="14" rx="3" ry="6" fill="${LIGHT[c]}" opacity="0.5" transform="rotate(-15 48 14)"/>
      <path d="M59 36c3 5 6 10 5 16" stroke="${COLOR_HEX[c]}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="64" cy="53" r="3" fill="${COLOR_HEX[c]}" opacity="0.7"/>
    </svg>`,

  note: c => `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ntg${c}" cx="36%" cy="28%" r="65%">
          <stop offset="0%" stop-color="${LIGHT[c]}"/>
          <stop offset="100%" stop-color="${DARK[c]}"/>
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="76" rx="15" ry="11" fill="url(#ntg${c})" stroke="${DARK[c]}" stroke-width="2.5" transform="rotate(-12 32 76)"/>
      <ellipse cx="33" cy="74" rx="8" ry="5" fill="${LIGHT[c]}" opacity="0.45" transform="rotate(-12 33 74)"/>
      <ellipse cx="74" cy="68" rx="15" ry="11" fill="url(#ntg${c})" stroke="${DARK[c]}" stroke-width="2.5" transform="rotate(-12 74 68)"/>
      <ellipse cx="75" cy="66" rx="8" ry="5" fill="${LIGHT[c]}" opacity="0.45" transform="rotate(-12 75 66)"/>
      <path d="M44 70V14l40 8v44h-3V26l-34-7v51z"
            fill="url(#ntg${c})" stroke="${DARK[c]}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M44 14l40 8v10c0-6-12-10-40-12z" fill="${LIGHT[c]}" opacity="0.5"/>
      <path d="M44 22l40 8 M44 32l40 8" stroke="${LIGHT[c]}" stroke-width="1.8" opacity="0.45"/>
      <path d="M46 18l38 8" stroke="white" stroke-width="1.2" opacity="0.3"/>
      ${sparkle(88, 16, 4.5)}${sparkle(16, 30, 3.5)}${sparkle(84, 70, 3)}
    </svg>`,
};

/* ─────────────────────────────────────────────────────────
   World Organization
   ───────────────────────────────────────────────────────── */

const WORLDS = {
  'space': {
    name: 'Space',
    subtitle: 'Galactic sort across the stars',
    items: ['star', 'planet', 'rocket']
  },
  'candy-land': {
    name: 'Candy Land',
    subtitle: 'Sweet treats into the candy basket',
    items: ['lollipop', 'cupcake', 'candycane', 'icecream', 'gumdrop', 'cherry']
  },
  'jungle': {
    name: 'Jungle',
    subtitle: 'Wild fruits, leaves, and blooms',
    items: ['fruit', 'leaf', 'flower']
  },
  'beach': {
    name: 'Beach',
    subtitle: 'Treasures from the shore',
    items: ['starfish', 'shell', 'beachball', 'surfboard', 'sandcastle', 'scallop', 'hibiscus']
  },
  'castle': {
    name: 'Castle',
    subtitle: 'Royal jewels and royal regalia',
    items: ['gem', 'shield', 'crown']
  },
  'studio': {
    name: 'Studio',
    subtitle: 'Tools of art and music',
    items: ['paintblob', 'brush', 'note']
  }
};

/* ─────────────────────────────────────────────────────────
   Helper: Get SVG for an item + color
   ───────────────────────────────────────────────────────── */

function getItemSVG(itemKey, color) {
  const generator = ITEM_GENERATORS[itemKey];
  if (!generator) {
    console.warn(`Item not found: ${itemKey}`);
    return '';
  }
  return generator(color);
}

/* ─────────────────────────────────────────────────────────
   PNG Item Tiles — polished 512×512 transparent images
   Stored at assets/images/games/items/{item}.png
   Returns null for SVG-only items (candy-land new items,
   beach SVG items) so callers can fall back gracefully.
   ───────────────────────────────────────────────────────── */

const ITEM_PNG_AVAILABLE = new Set([
  'star', 'planet', 'rocket',
  'gummy', 'lollipop', 'cupcake',
  'fruit', 'leaf', 'flower',
  'starfish', 'shell', 'beachball',
  'gem', 'shield', 'crown',
  'paintblob', 'brush', 'note'
]);

function getItemPNGPath(itemKey) {
  if (!ITEM_PNG_AVAILABLE.has(itemKey)) return null;
  return `assets/images/games/items/${itemKey}.png`;
}

/* ─────────────────────────────────────────────────────────
   Helper: Get all items for a world
   ───────────────────────────────────────────────────────── */

function getWorldItems(worldSlug) {
  const world = WORLDS[worldSlug];
  if (!world) {
    console.warn(`World not found: ${worldSlug}`);
    return [];
  }
  return world.items;
}
