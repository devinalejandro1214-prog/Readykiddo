/**
 * Audio.js — Web Audio API placeholder engine.
 * Each genre stub is ready to be fleshed out with real synthesis nodes.
 * Cross-fading between genres uses GainNode ramps (2s).
 */

let _ctx = null;
let _masterGain = null;
let _currentGenre = null;
let _currentNodes = [];

const GENRES = {
  lofi:        { label: 'Lo-Fi Nature',         color: '#4ecdc4' },
  orchestral:  { label: 'Orchestral Adventure', color: '#d4af37' },
  synthwave:   { label: 'Synth-Wave Space',      color: '#9b59b6' },
  '8bit':      { label: '8-Bit Retro',           color: '#ff6b6b' },
};

function _ensureContext() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _ctx.createGain();
    _masterGain.gain.setValueAtTime(0.4, _ctx.currentTime);
    _masterGain.connect(_ctx.destination);
  }
  if (_ctx.state === 'suspended') _ctx.resume();
}

/** Stop all currently playing nodes with a 2s crossfade out. */
function _stopCurrent() {
  if (!_ctx || _currentNodes.length === 0) return;
  const fadeGain = _ctx.createGain();
  fadeGain.gain.setValueAtTime(1, _ctx.currentTime);
  fadeGain.gain.linearRampToValueAtTime(0, _ctx.currentTime + 2);
  _currentNodes.forEach(node => {
    try { node.stop(_ctx.currentTime + 2.1); } catch(e) { /* already stopped */ }
  });
  _currentNodes = [];
}

/**
 * Play a synthesized ambient loop for the given genre.
 * @param {string} genre - 'lofi'|'orchestral'|'synthwave'|'8bit'
 */
export function play(genre) {
  if (!GENRES[genre] || genre === _currentGenre) return;
  _ensureContext();
  _stopCurrent();
  _currentGenre = genre;

  // Fade in master gain
  _masterGain.gain.cancelScheduledValues(_ctx.currentTime);
  _masterGain.gain.setValueAtTime(0, _ctx.currentTime);
  _masterGain.gain.linearRampToValueAtTime(0.4, _ctx.currentTime + 2);

  // --- PLACEHOLDER SYNTHESIS STUBS ---
  // Each branch will be replaced with full synthesis when ready.
  switch (genre) {
    case 'lofi':       _playLofi();       break;
    case 'orchestral': _playOrchestral(); break;
    case 'synthwave':  _playSynthwave();  break;
    case '8bit':       _play8bit();       break;
  }
}

/** Mute/unmute with smooth ramp. */
export function setMuted(muted) {
  if (!_masterGain) return;
  _ensureContext();
  const target = muted ? 0 : 0.4;
  _masterGain.gain.linearRampToValueAtTime(target, (_ctx?.currentTime || 0) + 0.5);
}

/** Set master volume (0.0–1.0). */
export function setVolume(vol) {
  if (!_masterGain) return;
  _ensureContext();
  _masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, vol)), _ctx.currentTime + 0.3);
}

/** Play a one-shot reward chime. Used by the GameAPI bridge. */
export function playChime() {
  _ensureContext();
  const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
  freqs.forEach((freq, i) => {
    const osc  = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, _ctx.currentTime);
    gain.gain.setValueAtTime(0, _ctx.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.3, _ctx.currentTime + i * 0.12 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + i * 0.12 + 0.8);
    osc.connect(gain);
    gain.connect(_ctx.destination);
    osc.start(_ctx.currentTime + i * 0.12);
    osc.stop(_ctx.currentTime + i * 0.12 + 0.85);
  });
}

export function stop() {
  _stopCurrent();
  _currentGenre = null;
}

export { GENRES };

// ---------------------------------------------------------------------------
// PLACEHOLDER SYNTH IMPLEMENTATIONS
// Each is a simple drone to confirm the audio engine is wired correctly.
// Replace internals with full synthesis without changing the API.
// ---------------------------------------------------------------------------

function _playLofi() {
  // PLACEHOLDER: Pink-noise filtered drone
  const bufferSize = _ctx.sampleRate * 2;
  const buffer = _ctx.createBuffer(1, bufferSize, _ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }
  const source = _ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = _ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  source.connect(filter);
  filter.connect(_masterGain);
  source.start();
  _currentNodes.push(source);
}

function _playOrchestral() {
  // PLACEHOLDER: Slow sawtooth chord (C major)
  [261.63, 329.63, 392.00].forEach(freq => {
    const osc  = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(_masterGain);
    osc.start();
    _currentNodes.push(osc);
  });
}

function _playSynthwave() {
  // PLACEHOLDER: Arpeggio on square wave
  const notes = [130.81, 164.81, 196.00, 261.63];
  let step = 0;
  const osc  = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = notes[0];
  gain.gain.value = 0.08;
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start();
  _currentNodes.push(osc);

  const interval = setInterval(() => {
    if (!_currentNodes.includes(osc)) { clearInterval(interval); return; }
    step = (step + 1) % notes.length;
    osc.frequency.setValueAtTime(notes[step], _ctx.currentTime);
  }, 250);
}

function _play8bit() {
  // PLACEHOLDER: Square wave chiptune melody (C major scale loop)
  const melody = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
  let step = 0;
  const osc  = _ctx.createOscillator();
  const gain = _ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = melody[0];
  gain.gain.value = 0.1;
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start();
  _currentNodes.push(osc);

  const interval = setInterval(() => {
    if (!_currentNodes.includes(osc)) { clearInterval(interval); return; }
    step = (step + 1) % melody.length;
    osc.frequency.setValueAtTime(melody[step], _ctx.currentTime);
  }, 200);
}
