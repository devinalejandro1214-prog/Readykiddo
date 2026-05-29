/* ─── Data ─────────────────────────────────────────────────────────── */

const characters = [
  { name:'Mica',   image:'assets/images/characters/mica/plain.png' },
  { name:'Aria',   image:'assets/images/characters/aria/plain.png' },
  { name:'Trish',  image:'assets/images/characters/trish/plain.png' },
  { name:'Steven', image:'assets/images/characters/steven/plain.png' },
  { name:'Emmett', image:'assets/images/characters/emmett/plain.png' },
  { name:'Amelia', image:'assets/images/characters/amelia/plain.png' },
];

const worlds = [
  { label:'Space',      slug:'space',      image:'assets/images/buttons/worlds/space.webp',      bg:'assets/images/world-backgrounds/space/base.webp' },
  { label:'Jungle',     slug:'jungle',     image:'assets/images/buttons/worlds/jungle.webp',     bg:'assets/images/world-backgrounds/jungle/base.webp' },
  { label:'Beach',      slug:'beach',      image:'assets/images/buttons/worlds/beach.webp',      bg:'assets/images/world-backgrounds/beach/base.webp' },
  { label:'Castle',     slug:'castle',     image:'assets/images/buttons/worlds/castle.webp',     bg:'assets/images/world-backgrounds/castle/base.webp' },
  { label:'Studio',     slug:'studio',     image:'assets/images/buttons/worlds/studio.webp',     bg:'assets/images/world-backgrounds/studio/base.webp' },
  { label:'Candy Land', slug:'candy-land', image:'assets/images/buttons/worlds/candy-land.webp', bg:'assets/images/world-backgrounds/candy-land/base.webp' },
];

const vibes = [
  { label:'Cozy',     image:'assets/images/buttons/vibes/cozy.webp',     wash:'linear-gradient(180deg, #ffd9a8, #f29f60)' },
  { label:'Exciting', image:'assets/images/buttons/vibes/exciting.webp', wash:'linear-gradient(180deg, #ffb86b, #ff5e3a)' },
  { label:'Magical',  image:'assets/images/buttons/vibes/magical.webp',  wash:'linear-gradient(180deg, #c9a8ff, #6e54c8)' },
  { label:'Silly',    image:'assets/images/buttons/vibes/silly.webp',    wash:'linear-gradient(180deg, #fff39c, #ffae42)' },
  { label:'Brave',    image:'assets/images/buttons/vibes/brave.webp',    wash:'linear-gradient(180deg, #9adcff, #1d7ebe)' },
];

const styles = [
  { label:'Plain',     image:'assets/images/buttons/styles/plain.png' },
  { label:'Hero',      image:'assets/images/buttons/styles/hero.png' },
  { label:'Explorer',  image:'assets/images/buttons/styles/explorer.png' },
  { label:'Wizard',    image:'assets/images/buttons/styles/wizard.png' },
  { label:'Artist',    image:'assets/images/buttons/styles/artist.png' },
  { label:'Scientist', image:'assets/images/buttons/styles/scientist.png' },
];

// Age group uses value (stored in profile) separate from label (display text)
const ageGroups = [
  { label:'3–4 Years', value:'3-4', icon:'🌱', desc:'Tap to play' },
  { label:'4–5 Years', value:'4-5', icon:'⭐', desc:'Tap & drag' },
];

// 5 steps: setup → ageGroup → theme → vibe → style
const steps = [
  { id:'setup',    title:"Let's build your world",    sub:"Tell us who's playing — then we'll start your adventure.",  optsLabel:'Choose your character' },
  { id:'ageGroup', title:'How old is your explorer?', sub:"We'll set up the perfect adventure.",                       optsLabel:'Choose your age range' },
  { id:'theme',    title:'Pick your world',           sub:'Where should your adventure take place?',                   optsLabel:'Choose a world' },
  { id:'vibe',     title:'Set the vibe',              sub:'What should the world feel like?',                         optsLabel:'Choose a feeling' },
  { id:'style',    title:'Dress your character',      sub:'Pick an outfit for the adventure.',                        optsLabel:'Choose an outfit' },
];

// Playful one-liners shown in the hero quip bubble after each selection
const quips = {
  character: name => `${name} is ready to play!`,
  ageGroup:  { '3-4':'Tap adventures await! 🌱', '4-5':'Ready to drag and explore! ⭐' },
  theme:     { 'Space':'Blast off! 🚀', 'Jungle':'Into the wild! 🌿', 'Beach':'Sun and waves! 🏖️', 'Castle':'A royal adventure! 🏰', 'Studio':'Lights, camera! 🎬', 'Candy Land':'So sweet! 🍭' },
  vibe:      { 'Cozy':'Warm and snuggly.', 'Exciting':"Let's go go go!", 'Magical':'Sparkles everywhere ✨', 'Silly':'Giggles incoming 😜', 'Brave':'Chin up, hero!' },
  style:     { 'Plain':'Comfy and classic.', 'Hero':'Cape on! 🦸', 'Explorer':'Map in hand 🧭', 'Wizard':'Spells ready 🪄', 'Artist':'Time to create 🎨', 'Scientist':'Eureka! 🔬' },
};

/* ─── State ─────────────────────────────────────────────────────────── */
let stepIdx = 0;
let isInitialRender = true;
const choices = { childName:'', parentName:'', character:null, ageGroup:null, theme:null, vibe:null, style:null };

/* ─── DOM refs ──────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const liveEl         = $('liveRegion'),
      pipsEl         = $('pips'),
      stepCountEl    = $('stepCount'),
      titleEl        = $('title'),
      subEl          = $('sub'),
      stageBodyEl    = $('stageBody'),
      inputsBlockEl  = $('inputsBlock'),
      heroEl         = $('hero'),
      heroWorldEl    = $('heroWorld'),
      heroVibeEl     = $('heroVibe'),
      heroCharEl     = $('heroChar'),
      nametagEl      = $('nametag'),
      nametagTitleEl = $('nametagTitle'),
      advNoEl        = $('advNo'),
      quipEl         = $('quip'),
      optsLabelEl    = $('optsLabel'),
      optionsRowEl   = $('optionsRow'),
      backBtn        = $('backBtn'),
      toastEl        = $('toast');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Helpers ───────────────────────────────────────────────────────── */
function slugify(str) {
  return String(str || '').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function announce(msg) {
  liveEl.textContent = '';
  setTimeout(() => { liveEl.textContent = msg; }, 30);
}

/* ─── Quip bubble ───────────────────────────────────────────────────── */
let quipTimer = null;
function showQuip(text) {
  if (!text) return;
  quipEl.innerHTML = `<span class="spark">✦</span> ${escapeHtml(text)}`;
  quipEl.classList.add('show');
  clearTimeout(quipTimer);
  quipTimer = setTimeout(() => quipEl.classList.remove('show'), 2200);
}

/* ─── Auto-advance ──────────────────────────────────────────────────── */
let autoTimer = null;
function scheduleAdvance(delay) { clearTimeout(autoTimer); autoTimer = setTimeout(advance, delay); }
function cancelAdvance()        { clearTimeout(autoTimer); autoTimer = null; }

function advance() {
  if (stepIdx < steps.length - 1) {
    stepIdx++;
    renderStep();
  } else {
    // All steps complete — save profile then navigate to world reveal
    localStorage.setItem('userProfile', JSON.stringify(choices));
    $('toastChild').textContent = choices.childName || 'Adventurer';
    toastEl.classList.add('show');
    launchConfetti();
    setTimeout(() => { window.location.href = 'world-reveal.html'; }, 1800);
  }
}

function isStepComplete() {
  const s = steps[stepIdx];
  if (s.id === 'setup')    return !!(choices.childName.trim() && choices.parentName.trim() && choices.character);
  if (s.id === 'ageGroup') return !!choices.ageGroup;
  if (s.id === 'theme')    return !!choices.theme;
  if (s.id === 'vibe')     return !!choices.vibe;
  if (s.id === 'style')    return !!choices.style;
  return false;
}

/* ─── Render ────────────────────────────────────────────────────────── */
function renderPips() {
  pipsEl.innerHTML = '';
  steps.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'pip' + (i < stepIdx ? ' done' : (i === stepIdx ? ' active' : ''));
    d.setAttribute('role', 'img');
    d.setAttribute('aria-label', `Step ${i+1}: ${i < stepIdx ? 'done' : (i === stepIdx ? 'current' : 'upcoming')}`);
    pipsEl.appendChild(d);
  });
}

function renderStep() {
  const s = steps[stepIdx];
  titleEl.textContent     = s.title;
  subEl.textContent       = s.sub;
  optsLabelEl.textContent = s.optsLabel;
  stepCountEl.textContent = `Step ${stepIdx+1} of ${steps.length}`;
  backBtn.hidden = stepIdx === 0;
  document.body.dataset.step = s.id;
  cancelAdvance();

  // Replay fade-up animation on each step change
  stageBodyEl.style.animation = 'none';
  void stageBodyEl.offsetWidth;
  stageBodyEl.style.animation = '';

  // Show/hide name inputs (setup step only)
  inputsBlockEl.style.display = s.id === 'setup' ? '' : 'none';
  if (s.id === 'setup') {
    $('childName').value  = choices.childName;
    $('parentName').value = choices.parentName;
  }

  // Build option card strip
  optionsRowEl.innerHTML = '';
  let opts, key, cls = '';
  if (s.id === 'setup')    { opts = characters.map(c => ({ label: c.name, image: c.image })); key = 'character'; cls = 'char'; }
  if (s.id === 'ageGroup') { opts = ageGroups; key = 'ageGroup'; cls = 'age-opt'; }
  if (s.id === 'theme')    { opts = worlds;    key = 'theme'; }
  if (s.id === 'vibe')     { opts = vibes;     key = 'vibe'; }
  if (s.id === 'style')    { opts = styles;    key = 'style'; cls = 'style-opt'; }

  opts.forEach((o, i) => {
    // ageGroup options use o.value; all others use o.label as the stored value
    const storedVal = o.value !== undefined ? o.value : o.label;
    const isSel = choices[key] === storedVal;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'opt ' + cls + (isSel ? ' selected' : '');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(isSel));
    btn.setAttribute('aria-label', o.label);
    // Roving tabindex: only selected (or first) card is in tab order
    btn.tabIndex = (isSel || (!choices[key] && i === 0)) ? 0 : -1;

    if (o.icon) {
      // Age group card: big emoji thumb + label + sub-description
      btn.innerHTML = `
        <div class="thumb age-thumb"><div class="age-icon">${o.icon}</div></div>
        <div class="lbl">${escapeHtml(o.label)}<span class="lbl-sub">${escapeHtml(o.desc || '')}</span></div>`;
    } else {
      btn.innerHTML = `<div class="thumb"><img src="${o.image}" alt="" onerror="this.style.opacity=0.35"/></div><div class="lbl">${escapeHtml(o.label)}</div>`;
    }

    btn.addEventListener('click', () => selectOption(btn, key, o, s));
    btn.addEventListener('keydown', e => handleRowKeys(e, i));
    optionsRowEl.appendChild(btn);
  });

  updateScene();
  renderPips();

  // Announce new step and move focus to heading (skip on first paint)
  if (!isInitialRender) {
    announce(`${s.title}. ${s.sub} Step ${stepIdx+1} of ${steps.length}.`);
    titleEl.focus({ preventScroll: true });
  }
  isInitialRender = false;
}

function selectOption(btn, key, o, s) {
  // Clear all selections in this step's row
  optionsRowEl.querySelectorAll('.opt').forEach(x => {
    x.classList.remove('selected', 'just-picked');
    x.setAttribute('aria-checked', 'false');
    x.tabIndex = -1;
  });

  // Apply selection
  btn.classList.add('selected');
  if (!prefersReducedMotion) { void btn.offsetWidth; btn.classList.add('just-picked'); }
  btn.setAttribute('aria-checked', 'true');
  btn.tabIndex = 0;
  btn.focus({ preventScroll: true });

  // Store value
  choices[key] = o.value !== undefined ? o.value : o.label;
  updateScene();

  // Show quip bubble
  let quip = '';
  if (key === 'character')                 quip = quips.character(o.label);
  else if (key === 'ageGroup')             quip = quips.ageGroup[o.value] || '';
  else if (quips[key] && quips[key][o.label]) quip = quips[key][o.label];
  showQuip(quip);
  announce(`${o.label} selected.`);

  // Auto-advance: 650ms for setup (all 3 fields needed), 480ms for other steps
  if (isStepComplete()) scheduleAdvance(s.id === 'setup' ? 650 : 480);
  else cancelAdvance();
}

/* Arrow-key navigation within the options row (roving tabindex) */
function handleRowKeys(e, i) {
  const cards = [...optionsRowEl.querySelectorAll('.opt')];
  let next = null;
  if      (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = cards[Math.min(i+1, cards.length-1)];
  else if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   next = cards[Math.max(i-1, 0)];
  else if (e.key === 'Home') next = cards[0];
  else if (e.key === 'End')  next = cards[cards.length-1];
  else return;
  e.preventDefault();
  cards.forEach(c => c.tabIndex = -1);
  next.tabIndex = 0;
  next.focus();
  next.scrollIntoView({ block:'nearest', inline:'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

/* Live hero preview — updates on every choice */
function updateScene() {
  // World background
  if (choices.theme) {
    const w = worlds.find(w => w.label === choices.theme);
    if (w) { heroWorldEl.style.backgroundImage = `url("${w.bg}")`; heroWorldEl.classList.add('show'); }
  } else {
    heroWorldEl.classList.remove('show');
    heroWorldEl.style.backgroundImage = '';
  }

  // Vibe color wash
  if (choices.vibe) {
    const v = vibes.find(v => v.label === choices.vibe);
    if (v) { heroVibeEl.style.background = v.wash; heroVibeEl.classList.add('show'); }
  } else {
    heroVibeEl.classList.remove('show');
    heroVibeEl.style.background = '';
  }

  // Character with chosen outfit (falls back to plain until style is picked)
  if (choices.character) {
    const charSlug  = slugify(choices.character);
    const styleSlug = choices.style ? slugify(choices.style) : 'plain';
    heroCharEl.src = `assets/images/characters/${charSlug}/${styleSlug}.png`;
    heroCharEl.classList.add('show');
  } else {
    heroCharEl.classList.remove('show');
    heroCharEl.removeAttribute('src');
  }

  // Nametag — appears as soon as child name is typed
  if (choices.childName.trim()) {
    nametagEl.classList.add('show');
    nametagTitleEl.innerHTML = `${escapeHtml(choices.childName)}'s adventure`
      + (choices.parentName.trim() ? `<span class="by">with ${escapeHtml(choices.parentName)}</span>` : '');
  } else {
    nametagEl.classList.remove('show');
  }

  // Keep hero aria-label in sync with the building scene
  const parts = [];
  if (choices.character) parts.push(choices.character);
  if (choices.theme)     parts.push(`in ${choices.theme}`);
  if (choices.vibe)      parts.push(`feeling ${choices.vibe}`);
  if (choices.style && choices.style !== 'Plain') parts.push(`dressed as ${choices.style}`);
  heroEl.setAttribute('aria-label', parts.length
    ? `Adventure scene: ${parts.join(', ')}.`
    : 'Your adventure scene — fills in as you make choices.');

  const filled = !!(choices.character || choices.theme || choices.vibe || choices.childName.trim());
  heroEl.classList.toggle('has-content', filled);

  // Fun "Adventure №" number derived from the names entered
  const seed = (choices.childName + choices.parentName).length;
  advNoEl.textContent = String((seed * 37) % 999 || 1).padStart(3, '0');
}

/* ─── Confetti ──────────────────────────────────────────────────────── */
function launchConfetti() {
  if (prefersReducedMotion) return;
  const canvas = $('confetti');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colors = ['#f28c18','#ffb23e','#0b5f95','#09395f','#ffd9a8'];
  const pieces = Array.from({ length: 140 }, () => ({
    x: innerWidth/2 + (Math.random()-0.5)*120,
    y: innerHeight/2,
    vx: (Math.random()-0.5)*10,
    vy: Math.random()*-12 - 4,
    size: Math.random()*8 + 4,
    color: colors[(Math.random()*colors.length)|0],
    rot: Math.random()*Math.PI, vr: (Math.random()-0.5)*0.3,
    life: 0,
  }));
  let raf;
  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = false;
    pieces.forEach(p => {
      p.life++; p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y < innerHeight + 40) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.life/120);
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    });
    if (alive) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  cancelAnimationFrame(raf);
  frame();
}

/* ─── Input binding (delegated) ─────────────────────────────────────── */
document.addEventListener('input', e => {
  if (e.target.id !== 'childName' && e.target.id !== 'parentName') return;
  if (e.target.id === 'childName')  choices.childName  = e.target.value;
  if (e.target.id === 'parentName') choices.parentName = e.target.value;
  updateScene();
  if (isStepComplete()) scheduleAdvance(900);
  else cancelAdvance();
});

/* ─── Back button ───────────────────────────────────────────────────── */
backBtn.addEventListener('click', () => {
  cancelAdvance();
  if (stepIdx > 0) { stepIdx--; renderStep(); }
});

/* ─── Dev hash init (pre-fill choices via URL for testing) ──────────── */
function initFromHash() {
  if (!location.hash) return;
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.has('child'))    choices.childName  = p.get('child');
  if (p.has('parent'))   choices.parentName = p.get('parent');
  if (p.has('char'))     choices.character  = p.get('char');
  if (p.has('ageGroup')) choices.ageGroup   = p.get('ageGroup');
  if (p.has('theme'))    choices.theme      = p.get('theme');
  if (p.has('vibe'))     choices.vibe       = p.get('vibe');
  if (p.has('style'))    choices.style      = p.get('style');
  if (p.has('step'))     stepIdx = Math.max(0, Math.min(steps.length-1, parseInt(p.get('step'),10)||0));
}

/* ─── Boot ──────────────────────────────────────────────────────────── */
initFromHash();
renderStep();
