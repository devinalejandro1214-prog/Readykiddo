/**
 * Environment.js — 6 Procedural Background Renderers.
 * GPU-accelerated via will-change. No external image assets.
 */

import { getState } from './State.js';
import { getParallaxOffset } from './Physics.js';

export const INTEREST_THEMES = {
  space:      { bg: ['#050510','#1a0b2e'], accent: '#4ecdc4' },
  horology:   { bg: ['#1a120b','#3b2818'], accent: '#d4af37' },
  dinosaurs:  { bg: ['#0d1f0d','#2d4a1e'], accent: '#7bc67e' },
  deepsea:    { bg: ['#051520','#0a3d5c'], accent: '#00bcd4' },
  jungle:     { bg: ['#0a2010','#1b5e20'], accent: '#66bb6a' },
  classiclit: { bg: ['#2c1a0e','#4a2f1a'], accent: '#c9a96e' },
};

export const AVATAR_PALETTES = {
  sherlock:  { primary: '#1a2a4a', accent: '#4fc3f7', label: 'Sherlock Holmes' },
  pooh:      { primary: '#5d3a00', accent: '#f9a825', label: 'Winnie the Pooh' },
  alice:     { primary: '#1a4a6e', accent: '#e0e0e0', label: 'Alice' },
  robinhood: { primary: '#1b3a1b', accent: '#a5845a', label: 'Robin Hood' },
  peterpan:  { primary: '#1b4a1b', accent: '#c0c0c0', label: 'Peter Pan' },
  mowgli:    { primary: '#4a2b0e', accent: '#e07b39', label: 'Mowgli' },
  dorothy:   { primary: '#1a2a5e', accent: '#c62828', label: 'Dorothy' },
  mermaid:   { primary: '#00494a', accent: '#ff7f7f', label: 'The Little Mermaid' },
};

let _activeRenderer = null;
let _mouseMoveHandler = null;
let _container = null;

export function activate(interest, container) {
  _container = container || document.getElementById('env-layer');
  if (!_container) return;
  teardown();
  _applyThemeCSSVars(interest);
  switch (interest) {
    case 'space':      _activeRenderer = new SpaceRenderer(_container);      break;
    case 'horology':   _activeRenderer = new HorologyRenderer(_container);   break;
    case 'dinosaurs':  _activeRenderer = new DinosaursRenderer(_container);  break;
    case 'deepsea':    _activeRenderer = new DeepSeaRenderer(_container);    break;
    case 'jungle':     _activeRenderer = new JungleRenderer(_container);     break;
    case 'classiclit': _activeRenderer = new ClassicLitRenderer(_container); break;
  }
  _mouseMoveHandler = (e) => {
    const vibe = getState('vibe') || 'balanced';
    document.querySelectorAll('[data-parallax-layer]').forEach(el => {
      const layer = parseInt(el.dataset.parallaxLayer, 10);
      const { x, y } = getParallaxOffset(e, layer, vibe);
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  };
  window.addEventListener('mousemove', _mouseMoveHandler);
}

export function applyAvatar(avatarKey) {
  const pal = AVATAR_PALETTES[avatarKey];
  if (!pal) return;
  document.documentElement.style.setProperty('--avatar-primary', pal.primary);
  document.documentElement.style.setProperty('--avatar-accent',  pal.accent);
}

export function teardown() {
  if (_activeRenderer?.destroy) _activeRenderer.destroy();
  _activeRenderer = null;
  if (_mouseMoveHandler) { window.removeEventListener('mousemove', _mouseMoveHandler); }
  if (_container) _container.innerHTML = '';
}

export function triggerReward(interest) {
  if (interest === 'space')      return _rewardSupernova();
  if (interest === 'horology')   return _rewardGearSpin();
  if (interest === 'dinosaurs')  return _rewardDustShake();
  _rewardGenericFlash();
}

function _applyThemeCSSVars(interest) {
  const theme = INTEREST_THEMES[interest] || INTEREST_THEMES.space;
  const r = document.documentElement;
  r.style.setProperty('--bg-start', theme.bg[0]);
  r.style.setProperty('--bg-end',   theme.bg[1]);
  r.style.setProperty('--theme-accent', theme.accent);
  document.body.dataset.theme = interest;
}

// ─── Space Renderer ───────────────────────────────────────────────────────────
class SpaceRenderer {
  constructor(c) {
    this._c = c;
    c.style.background = 'radial-gradient(ellipse at 60% 40%, #2d1b6e 0%, #0a0520 40%, #050510 100%)';
    const shadows = Array.from({length: 120}, () => {
      const x = (Math.random()*200).toFixed(1);
      const y = (Math.random()*200).toFixed(1);
      const s = Math.random()<0.8?0:Math.random()<0.7?1:2;
      return `${x}vw ${y}vh 0 ${s}px rgba(255,255,255,${(0.4+Math.random()*0.6).toFixed(2)})`;
    }).join(',');
    ['3','2'].forEach((layer, i) => {
      const d = document.createElement('div');
      d.dataset.parallaxLayer = layer;
      d.style.cssText = `position:absolute;inset:-5%;will-change:transform;
        box-shadow:${shadows};border-radius:50%;opacity:${i===0?1:0.5};
        animation:starDrift calc(var(--env-speed)*${i===0?1:1.5}) ease-in-out infinite alternate;`;
      c.append(d);
    });
    const neb = document.createElement('div');
    neb.dataset.parallaxLayer = '1';
    neb.style.cssText = `position:absolute;inset:0;will-change:transform;
      background:radial-gradient(ellipse 60% 40% at 80% 20%,rgba(78,205,196,.18) 0%,transparent 70%),
                 radial-gradient(ellipse 40% 60% at 20% 70%,rgba(155,89,182,.15) 0%,transparent 70%);
      animation:nebulaPulse var(--env-speed) ease-in-out infinite alternate;`;
    c.append(neb);
  }
  destroy() { this._c.innerHTML = ''; }
}

// ─── Horology Renderer ────────────────────────────────────────────────────────
class HorologyRenderer {
  constructor(c) {
    this._c = c;
    c.style.background = 'radial-gradient(ellipse at 50% 50%, #3b2818 0%, #1a120b 100%)';
    const gears = [
      {s:340,t:-60, l:-60,  teeth:16,layer:'1',rev:false,op:'.22'},
      {s:200,t:180, l:230,  teeth:10,layer:'2',rev:true, op:'.18'},
      {s:440,t:null,l:null,b:-100,r:-100,teeth:20,layer:'3',rev:false,op:'.15'},
    ];
    gears.forEach(g => {
      const svg = this._gearSVG(g.s, g.teeth);
      svg.dataset.parallaxLayer = g.layer;
      svg.classList.add('env-horology-gear');
      let pos = `${g.t!=null?`top:${g.t}px;`:''}${g.l!=null?`left:${g.l}px;`:''}`;
      if(g.b!=null) pos += `bottom:${g.b}px;`;
      if(g.r!=null) pos += `right:${g.r}px;`;
      svg.style.cssText = `position:absolute;width:${g.s}px;height:${g.s}px;${pos}
        animation:${g.rev?'spinReverse':'spinCW'} var(--env-speed) linear infinite;
        will-change:transform;opacity:${g.op};`;
      c.append(svg);
    });
    const glow = document.createElement('div');
    glow.dataset.parallaxLayer = '1';
    glow.style.cssText = `position:absolute;inset:0;will-change:transform;
      background:radial-gradient(ellipse 50% 50% at 30% 60%,rgba(212,175,55,.12) 0%,transparent 70%),
                 radial-gradient(ellipse 40% 40% at 70% 30%,rgba(180,120,40,.10) 0%,transparent 70%);`;
    c.append(glow);
  }
  _gearSVG(size, teeth) {
    const r=size/2, ir=r*.72, th=r*.16, cx=r, cy=r;
    let d='';
    for(let i=0;i<teeth;i++){
      const a1=(i/teeth)*Math.PI*2-Math.PI/teeth*.6;
      const a2=(i/teeth)*Math.PI*2+Math.PI/teeth*.6;
      const ao1=a1-Math.PI/(teeth*4), ao2=a2+Math.PI/(teeth*4);
      d+=`M${cx+Math.cos(a1)*ir} ${cy+Math.sin(a1)*ir}
          L${cx+Math.cos(ao1)*(r+th)} ${cy+Math.sin(ao1)*(r+th)}
          L${cx+Math.cos(ao2)*(r+th)} ${cy+Math.sin(ao2)*(r+th)}
          L${cx+Math.cos(a2)*ir} ${cy+Math.sin(a2)*ir}`;
    }
    d+=`M${cx} ${cy} m-${ir} 0 a${ir} ${ir} 0 1 0 ${ir*2} 0 a${ir} ${ir} 0 1 0 -${ir*2} 0`;
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox',`0 0 ${size} ${size}`);
    const p=document.createElementNS(ns,'path');
    p.setAttribute('d',d);p.setAttribute('fill','none');
    p.setAttribute('stroke','#d4af37');p.setAttribute('stroke-width','2');
    svg.append(p); return svg;
  }
  destroy() { this._c.innerHTML = ''; }
}

// ─── Dinosaurs Renderer ───────────────────────────────────────────────────────
class DinosaursRenderer {
  constructor(c) {
    this._c = c;
    c.style.background = 'linear-gradient(180deg,#0d1f0d 0%,#1a3a0a 50%,#2d4a1e 100%)';
    [
      {color:'rgba(13,31,13,.95)', bottom:'60%',layer:'3',dur:'8s'},
      {color:'rgba(27,80,10,.85)', bottom:'50%',layer:'2',dur:'12s'},
      {color:'rgba(45,74,30,.75)', bottom:'40%',layer:'1',dur:'16s'},
    ].forEach((cfg,i) => {
      const el=document.createElement('div');
      el.dataset.parallaxLayer=cfg.layer;
      const pts=Array.from({length:21},(_,j)=>{
        const x=(j/20)*100,w=Math.sin(j*.8+i)*8+Math.cos(j*1.3+i*2)*5;
        return `${x}% ${50+w}%`;
      }).join(',');
      el.style.cssText=`position:absolute;bottom:${cfg.bottom};left:-10%;width:120%;height:50%;
        background:${cfg.color};will-change:transform;
        clip-path:polygon(0% 100%,${pts},100% 100%);
        animation:sway ${cfg.dur} ease-in-out infinite alternate;transform-origin:bottom center;`;
      c.append(el);
    });
  }
  destroy() { this._c.innerHTML = ''; }
}

// ─── Deep Sea Renderer ────────────────────────────────────────────────────────
class DeepSeaRenderer {
  constructor(c) {
    this._c = c;
    c.style.background = 'radial-gradient(ellipse at 50% 80%,#0a3d5c 0%,#051520 100%)';
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('width','100%');svg.setAttribute('height','100%');
    svg.style.cssText='position:absolute;inset:0;will-change:transform;opacity:.2;';
    svg.dataset.parallaxLayer='2';
    const defs=document.createElementNS(ns,'defs');
    const filt=document.createElementNS(ns,'filter'); filt.id='caustic';
    const turb=document.createElementNS(ns,'feTurbulence');
    turb.setAttribute('type','turbulence');turb.setAttribute('baseFrequency','0.015 0.015');
    turb.setAttribute('numOctaves','3');turb.setAttribute('seed','5');
    const anim=document.createElementNS(ns,'animate');
    anim.setAttribute('attributeName','baseFrequency');
    anim.setAttribute('values','0.01 0.015;0.02 0.01;0.01 0.015');
    anim.setAttribute('dur','15s');anim.setAttribute('repeatCount','indefinite');
    turb.append(anim);
    const disp=document.createElementNS(ns,'feDisplacementMap');
    disp.setAttribute('in','SourceGraphic');disp.setAttribute('in2','noise');
    disp.setAttribute('scale','60');
    filt.append(turb,disp);
    const grad=document.createElementNS(ns,'linearGradient');
    grad.id='csea-grad';grad.setAttribute('gradientTransform','rotate(90)');
    [['0%','#00bcd4'],['100%','#006064']].forEach(([o,col])=>{
      const s=document.createElementNS(ns,'stop');s.setAttribute('offset',o);s.setAttribute('stop-color',col);grad.append(s);
    });
    defs.append(filt,grad);
    const rect=document.createElementNS(ns,'rect');
    rect.setAttribute('width','100%');rect.setAttribute('height','100%');
    rect.setAttribute('fill','url(#csea-grad)');rect.setAttribute('filter','url(#caustic)');
    svg.append(defs,rect);
    c.append(svg);
    const bubbleLayer=document.createElement('div');
    bubbleLayer.dataset.parallaxLayer='1';
    bubbleLayer.style.cssText='position:absolute;inset:0;will-change:transform;overflow:hidden;';
    for(let i=0;i<25;i++){
      const p=document.createElement('div');
      p.style.cssText=`position:absolute;bottom:-5px;left:${Math.random()*100}%;
        width:${1+Math.random()*3}px;height:${1+Math.random()*3}px;border-radius:50%;
        background:rgba(0,188,212,.6);
        animation:bubbleRise ${4+Math.random()*8}s ${(Math.random()*-10).toFixed(1)}s linear infinite;`;
      bubbleLayer.append(p);
    }
    c.append(bubbleLayer);
  }
  destroy() { this._c.innerHTML = ''; }
}

// ─── Jungle Renderer ──────────────────────────────────────────────────────────
class JungleRenderer {
  constructor(c) {
    this._c = c;
    c.style.background = 'linear-gradient(135deg,#0a2010 0%,#1b5e20 60%,#2e7d32 100%)';
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 1000 700');
    svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;will-change:transform;opacity:.5;';
    svg.dataset.parallaxLayer='2';
    [
      {d:'M 100,0 Q 80,150 110,300 Q 140,450 90,700',delay:'0s'},
      {d:'M 350,0 Q 400,100 350,250 Q 300,400 370,700',delay:'-3s'},
      {d:'M 650,0 Q 700,200 640,350 Q 580,500 660,700',delay:'-1.5s'},
      {d:'M 920,0 Q 950,100 900,300 Q 860,500 930,700',delay:'-4s'},
    ].forEach(v=>{
      const path=document.createElementNS(ns,'path');
      path.setAttribute('d',v.d);path.setAttribute('stroke','#33691e');
      path.setAttribute('stroke-width','4');path.setAttribute('fill','none');
      path.setAttribute('stroke-dasharray','800');path.setAttribute('stroke-dashoffset','800');
      const a1=document.createElementNS(ns,'animate');
      a1.setAttribute('attributeName','stroke-dashoffset');a1.setAttribute('from','800');
      a1.setAttribute('to','0');a1.setAttribute('dur','3s');a1.setAttribute('begin',v.delay);a1.setAttribute('fill','freeze');
      const a2=document.createElementNS(ns,'animateTransform');
      a2.setAttribute('attributeName','transform');a2.setAttribute('type','rotate');
      a2.setAttribute('values','-2 500 0;2 500 0;-2 500 0');
      a2.setAttribute('dur',`${8+Math.random()*4}s`);a2.setAttribute('repeatCount','indefinite');
      path.append(a1,a2);svg.append(path);
    });
    c.append(svg);
    const glow=document.createElement('div');
    glow.dataset.parallaxLayer='1';
    glow.style.cssText='position:absolute;inset:0;will-change:transform;overflow:hidden;';
    for(let i=0;i<18;i++){
      const p=document.createElement('div');
      p.style.cssText=`position:absolute;left:${Math.random()*100}%;top:${Math.random()*100}%;
        width:4px;height:4px;border-radius:50%;background:rgba(102,187,106,.8);
        box-shadow:0 0 8px rgba(102,187,106,.6);
        animation:firefly ${3+Math.random()*4}s ${(Math.random()*-5).toFixed(1)}s ease-in-out infinite alternate;`;
      glow.append(p);
    }
    c.append(glow);
  }
  destroy() { this._c.innerHTML = ''; }
}

// ─── Classic Lit Renderer ─────────────────────────────────────────────────────
class ClassicLitRenderer {
  constructor(c) {
    this._c = c;
    c.style.background = 'radial-gradient(ellipse at 50% 30%,#5c3d1e 0%,#2c1a0e 100%)';
    const tex=document.createElement('div');
    tex.dataset.parallaxLayer='3';
    tex.style.cssText=`position:absolute;inset:0;will-change:transform;opacity:.6;
      background-image:repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(100,60,20,.06) 29px),
      repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(100,60,20,.03) 29px);`;
    c.append(tex);
    const glow=document.createElement('div');
    glow.dataset.parallaxLayer='2';
    glow.style.cssText=`position:absolute;inset:0;will-change:transform;
      background:radial-gradient(ellipse 60% 60% at 50% 30%,rgba(201,169,110,.1) 0%,transparent 70%);
      animation:nebulaPulse var(--env-speed) ease-in-out infinite alternate;`;
    c.append(glow);
  }
  destroy() { this._c.innerHTML = ''; }
}

// ─── Reward Animations ─────────────────────────────────────────────────────────
function _rewardSupernova() {
  const el=document.createElement('div');
  el.style.cssText=`position:fixed;inset:0;z-index:9999;pointer-events:none;
    background:radial-gradient(circle,rgba(255,255,255,.95) 0%,rgba(78,205,196,.3) 40%,transparent 70%);
    animation:supernovaFlash 1.2s ease-out forwards;`;
  document.body.append(el);
  setTimeout(()=>el.remove(),1300);
}
function _rewardGearSpin() {
  document.querySelectorAll('.env-horology-gear').forEach(g=>{
    g.style.animationDuration='.5s';
    setTimeout(()=>{ g.style.animationDuration=''; },2500);
  });
}
function _rewardDustShake() {
  document.body.classList.add('dust-shake');
  setTimeout(()=>document.body.classList.remove('dust-shake'),800);
}
function _rewardGenericFlash() {
  const el=document.createElement('div');
  el.style.cssText=`position:fixed;inset:0;z-index:9999;pointer-events:none;
    background:rgba(255,255,255,.4);animation:supernovaFlash .6s ease-out forwards;`;
  document.body.append(el);
  setTimeout(()=>el.remove(),700);
}
