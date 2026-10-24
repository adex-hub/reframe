import type { Mood } from "./moods";

const VOLUME = 0.8;
/** How far ahead (seconds) notes are scheduled on the audio clock, so timer jitter never shows. */
const LOOKAHEAD = 1.5;

type Voice = { osc: OscillatorNode; gain: GainNode };

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/**
 * Generative music on the Web Audio API: a slow chord pad, occasional melody notes and
 * game sounds, all in the current painting's mood. Nothing plays until `unlock()` runs
 * inside a user gesture, because browsers block audio before the first interaction.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private filter!: BiquadFilterNode;
  private echo!: DelayNode;
  private mood: Mood;
  private progress = 0;
  private enabled = true;
  private visible = true;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;
  private pad: Voice[] = [];
  private chordIdx = 0;
  private nextChordAt = 0;
  private nextSparkleAt = 0;

  constructor(mood: Mood) {
    this.mood = mood;
  }

  /** Call from a user gesture: creates the audio context on first use, and resumes it after an interruption (e.g. a call on iOS). */
  unlock() {
    if (!this.enabled) return;
    if (!this.ctx) this.build();
    this.update();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    this.update();
  }

  /** Fade out while the tab is hidden, and back in when it returns. */
  setVisible(visible: boolean) {
    this.visible = visible;
    this.update();
  }

  setMood(mood: Mood) {
    if (mood === this.mood) return;
    this.mood = mood;
    this.chordIdx = 0;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Let the old chord melt away and bring the new one in right after.
    this.pad.forEach(({ osc, gain }) => {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setTargetAtTime(0, t, 0.8);
      osc.stop(t + 4);
    });
    this.nextChordAt = t + 0.3;
    this.applyBrightness();
  }

  /** 0 on a scrambled board, 1 when solved: the music opens up as the picture comes together. */
  setProgress(progress: number) {
    this.progress = progress;
    this.applyBrightness();
  }

  /** A tile moved. The note climbs with progress; a tile landing home gets a harmony on top. */
  slide(placedOne: boolean) {
    if (!this.playing) return;
    const step = Math.round(this.progress * this.mood.scale.length * 1.5);
    const t = this.ctx!.currentTime;
    this.pluck(this.note(step), t, 0.13, 1.4);
    if (placedOne) this.pluck(this.note(step + 2), t + 0.06, 0.07, 1.8);
  }

  /** A soft, low thud for a tile that can't move: never a harsh error sound. */
  blocked() {
    if (!this.playing) return;
    const ctx = this.ctx!, t = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.15);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  /** The picture is complete: a rising run that settles on the mood's home chord. */
  solve() {
    if (!this.playing) return;
    const t = this.ctx!.currentTime;
    for (let i = 0; i < 8; i++) this.pluck(this.note(i + 3), t + i * 0.09, 0.11, 2.2);
    this.mood.chords[0].forEach((iv) => this.pluck(this.mood.root + 12 + iv, t + 0.8, 0.08, 4.5));
  }

  dispose() {
    this.stopTicker();
    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    this.ctx?.close();
    this.ctx = null;
  }

  private get playing() {
    return !!this.ctx && this.enabled && this.visible;
  }

  private build() {
    const ctx = new AudioContext();
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.Q.value = 0.7;
    this.echo = ctx.createDelay(2);
    this.echo.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    this.echo.connect(feedback).connect(this.echo);
    this.filter.connect(this.master);
    this.echo.connect(this.master);
    this.master.connect(ctx.destination);
    this.ctx = ctx;
    this.nextChordAt = this.nextSparkleAt = ctx.currentTime + 0.1;
    this.applyBrightness();
  }

  /** Bring the audio in line with what's wanted: playing only when unlocked, enabled and visible. */
  private update() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    this.suspendTimer = null;

    if (this.playing) {
      if (ctx.state !== "running") void ctx.resume();
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(VOLUME, t, 0.5);
      this.startTicker();
    } else {
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(0, t, 0.2);
      this.stopTicker();
      // Once faded, suspend the context so it stops using the CPU (and battery).
      this.suspendTimer = setTimeout(() => void ctx.suspend(), 1000);
    }
  }

  private startTicker() {
    if (this.ticker) return;
    const now = this.ctx!.currentTime;
    // Don't try to catch up on time that passed while paused.
    this.nextChordAt = Math.max(this.nextChordAt, now + 0.1);
    this.nextSparkleAt = Math.max(this.nextSparkleAt, now + 0.5);
    this.tick();
    this.ticker = setInterval(() => this.tick(), 250);
  }

  private stopTicker() {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
  }

  private tick() {
    const horizon = this.ctx!.currentTime + LOOKAHEAD;
    while (this.nextChordAt < horizon) {
      this.chord(this.nextChordAt);
      this.nextChordAt += this.mood.chordSecs;
    }
    while (this.nextSparkleAt < horizon) {
      if (Math.random() < this.mood.sparkle) {
        this.pluck(this.note(5 + Math.floor(Math.random() * 7)), this.nextSparkleAt, 0.045, 2.4);
      }
      this.nextSparkleAt += 1.4 + Math.random() * 2.4;
    }
  }

  /** One pad chord: two slightly detuned oscillators per note, swelling in and overlapping the next chord. */
  private chord(t: number) {
    const ctx = this.ctx!, { chords, root, pad, chordSecs } = this.mood;
    const notes = chords[this.chordIdx++ % chords.length];
    const end = t + chordSecs + 2.5;
    notes.forEach((iv, i) => {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = pad;
        osc.frequency.value = hz(root - 12 + iv);
        osc.detune.value = detune;
        const level = 0.035 / (1 + i * 0.3);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(level, t + 2);
        gain.gain.setValueAtTime(level, t + chordSecs);
        gain.gain.linearRampToValueAtTime(0, end);
        osc.connect(gain).connect(this.filter);
        osc.start(t);
        osc.stop(end);
        const voice = { osc, gain };
        this.pad.push(voice);
        osc.onended = () => (this.pad = this.pad.filter((v) => v !== voice));
      }
    });
  }

  private pluck(midi: number, t: number, volume: number, duration: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = this.mood.pluck;
    osc.frequency.value = hz(midi);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    // Exponential ramps can't reach 0, so fade to just above it.
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(this.filter);
    gain.connect(this.echo);
    osc.start(t);
    osc.stop(t + duration + 0.1);
  }

  /** The nth note of the mood's scale, wrapping up into higher octaves. */
  private note(step: number) {
    const { root, scale } = this.mood;
    return root + scale[step % scale.length] + 12 * Math.floor(step / scale.length);
  }

  private applyBrightness() {
    if (!this.ctx) return;
    const cutoff = this.mood.cutoff * (1 + this.progress * 2.5);
    this.filter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.8);
  }
}
