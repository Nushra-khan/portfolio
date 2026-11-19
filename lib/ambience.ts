'use client';

/**
 * Soft, procedurally generated forest ambience — no audio files.
 * Breeze + distant stream + occasional bird chirps by day, crickets by night.
 * Indoors everything is gently muffled, as if heard through the windows.
 * Off by default; started only by the visitor (browsers require a click anyway).
 */

type Zone = { inside: boolean; night: boolean };

const MASTER_VOLUME = 0.22; // keep it very light

class Ambience {
  ctx: AudioContext | null = null;
  master!: GainNode;
  muffle!: BiquadFilterNode;
  windGain!: GainNode;
  streamGain!: GainNode;
  birdBus!: GainNode;
  cricketBus!: GainNode;
  playing = false;
  zone: Zone = { inside: false, night: false };
  private timers: number[] = [];
  private onVisibility = () => {
    if (!this.ctx) return;
    if (document.hidden) this.ctx.suspend();
    else if (this.playing) this.ctx.resume();
  };

  private noiseBuffer(ctx: AudioContext, seconds = 4) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    // brown-ish noise: smoother, more natural than white noise
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5;
    }
    return buf;
  }

  private build() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.muffle = ctx.createBiquadFilter();
    this.muffle.type = 'lowpass';
    this.muffle.frequency.value = 18000;
    this.muffle.connect(this.master).connect(ctx.destination);

    const noise = this.noiseBuffer(ctx);

    // breeze through leaves: slow swells
    const wind = ctx.createBufferSource();
    wind.buffer = noise;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 500;
    windFilter.Q.value = 0.6;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.35;
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.07;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 0.18;
    windLfo.connect(windLfoGain).connect(this.windGain.gain);
    wind.connect(windFilter).connect(this.windGain).connect(this.muffle);
    wind.start();
    windLfo.start();

    // the little stream: brighter, gently babbling
    const stream = ctx.createBufferSource();
    stream.buffer = noise;
    stream.loop = true;
    stream.playbackRate.value = 1.7;
    const streamFilter = ctx.createBiquadFilter();
    streamFilter.type = 'bandpass';
    streamFilter.frequency.value = 1800;
    streamFilter.Q.value = 0.8;
    const babble = ctx.createOscillator();
    babble.frequency.value = 0.9;
    const babbleGain = ctx.createGain();
    babbleGain.gain.value = 500;
    babble.connect(babbleGain).connect(streamFilter.frequency);
    this.streamGain = ctx.createGain();
    this.streamGain.gain.value = 0.12;
    stream.connect(streamFilter).connect(this.streamGain).connect(this.muffle);
    stream.start();
    babble.start();

    this.birdBus = ctx.createGain();
    this.birdBus.gain.value = 1;
    this.birdBus.connect(this.muffle);
    this.cricketBus = ctx.createGain();
    this.cricketBus.gain.value = 0;
    this.cricketBus.connect(this.muffle);

    document.addEventListener('visibilitychange', this.onVisibility);
  }

  /** One small songbird phrase: a few quick rising/falling whistles. */
  private chirp() {
    const ctx = this.ctx;
    if (!ctx || !this.playing || this.zone.night) return;
    const t0 = ctx.currentTime + 0.05;
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    const bird = ctx.createGain();
    bird.gain.value = 0.05 + Math.random() * 0.05; // distant & soft
    bird.connect(pan).connect(this.birdBus);

    const species = Math.random();
    const notes = species < 0.4 ? 2 + Math.floor(Math.random() * 3) : species < 0.75 ? 5 + Math.floor(Math.random() * 5) : 1;
    const base = 2300 + Math.random() * 1700;
    let t = t0;
    for (let i = 0; i < notes; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const env = ctx.createGain();
      const dur = species < 0.4 ? 0.09 + Math.random() * 0.06 : species < 0.75 ? 0.035 : 0.28;
      const f0 = base * (0.9 + Math.random() * 0.2);
      const f1 = species < 0.75 ? f0 * (1.25 + Math.random() * 0.4) : f0 * 0.7;
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(1, t + dur * 0.25);
      env.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(env).connect(bird);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur + (species < 0.75 ? 0.02 + Math.random() * 0.05 : 0.1);
    }
  }

  /** Bursts of soft cricket song for the night garden. */
  private crickets() {
    const ctx = this.ctx;
    if (!ctx || !this.playing || !this.zone.night) return;
    const t0 = ctx.currentTime + 0.05;
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;
    const out = ctx.createGain();
    out.gain.value = 0.025 + Math.random() * 0.02;
    out.connect(pan).connect(this.cricketBus);
    const pulses = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < pulses; i++) {
      const t = t0 + i * 0.11;
      const osc = ctx.createOscillator();
      osc.frequency.value = 4300 + Math.random() * 300;
      const am = ctx.createOscillator();
      am.frequency.value = 45;
      const amGain = ctx.createGain();
      amGain.gain.value = 0.5;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.5, t + 0.01);
      env.gain.linearRampToValueAtTime(0, t + 0.07);
      am.connect(amGain).connect(env.gain);
      osc.connect(env).connect(out);
      osc.start(t);
      am.start(t);
      osc.stop(t + 0.08);
      am.stop(t + 0.08);
    }
  }

  private loop(fn: () => void, min: number, max: number) {
    const tick = () => {
      fn();
      this.timers.push(window.setTimeout(tick, min + Math.random() * (max - min)));
    };
    this.timers.push(window.setTimeout(tick, 600 + Math.random() * 1200));
  }

  async start() {
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    await ctx.resume();
    this.playing = true;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.loop(() => this.chirp(), 1800, 6500);
    this.loop(() => this.chirp(), 4000, 11000); // a second bird, further away
    this.loop(() => this.crickets(), 500, 1600);
    this.applyZone(1.5);
  }

  stop() {
    if (!this.ctx) return;
    this.playing = false;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, 0.4);
    window.setTimeout(() => !this.playing && this.ctx?.suspend(), 1500);
  }

  setZone(z: Zone) {
    if (z.inside === this.zone.inside && z.night === this.zone.night) return;
    this.zone = z;
    if (this.playing) this.applyZone(1.2);
  }

  private applyZone(fade: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const { inside, night } = this.zone;
    const tc = fade / 3;
    this.master.gain.setTargetAtTime(MASTER_VOLUME * (inside ? 0.55 : 1), t, tc);
    this.muffle.frequency.setTargetAtTime(inside ? 1100 : 18000, t, tc);
    this.streamGain.gain.setTargetAtTime(inside ? 0.04 : night ? 0.1 : 0.12, t, tc);
    this.windGain.gain.setTargetAtTime(night ? 0.22 : 0.35, t, tc);
    this.birdBus.gain.setTargetAtTime(night ? 0 : 1, t, tc);
    this.cricketBus.gain.setTargetAtTime(night ? 1 : 0, t, tc);
  }
}

export const ambience = typeof window !== 'undefined' ? new Ambience() : (null as unknown as Ambience);
