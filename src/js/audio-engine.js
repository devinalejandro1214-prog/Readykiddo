import { sensoryProfiles } from "./data.js";

const profiles = {
  "lo-fi": { type: "sine", base: 261.63, ratio: 1.25, duration: .12 },
  adventure: { type: "triangle", base: 329.63, ratio: 1.5, duration: .14 },
  nature: { type: "sine", base: 392.0, ratio: 1.125, duration: .16 },
  synth: { type: "square", base: 220.0, ratio: 2, duration: .09 },
  classical: { type: "triangle", base: 523.25, ratio: 1.2, duration: .18 }
};

export class AudioEngine {
  constructor(store) {
    this.store = store;
    this.ctx = null;
  }

  ensure() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    if (!this.ctx) {
      this.ctx = new AudioContext();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return true;
  }

  toggle() {
    const state = this.store.get();
    const canUseAudio = this.ensure();

    if (!canUseAudio) {
      this.store.set({ audioEnabled: false });
      return false;
    }

    this.store.set({ audioEnabled: !state.audioEnabled });
    if (!state.audioEnabled) {
      this.tone("confirm");
    }
    return true;
  }

  tone(kind = "choice") {
    const state = this.store.get();

    if (!state.audioEnabled || !this.ctx) return;
    if (state.sensoryIntensity === "low" && kind !== "confirm") return;

    const sensory = sensoryProfiles[state.sensoryIntensity] || sensoryProfiles.gentle;
    const profile = profiles[state.music] || profiles["lo-fi"];
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = profile.type;
    osc.frequency.setValueAtTime(profile.base, now);
    osc.frequency.exponentialRampToValueAtTime(profile.base * profile.ratio, now + profile.duration);

    const volume = kind === "confirm" ? sensory.volume * 1.15 : sensory.volume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + .015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + profile.duration + .025);
  }
}
