import type { Mood } from "./moods";

const VOLUME = 0.8;
/** How quickly (seconds) the old mood fades out when the painting changes. */
const FADE = 0.35;
/** How far ahead (seconds) notes are scheduled on the audio clock, so timer jitter never shows. */
const LOOKAHEAD = 1.5;

type Voice = { osc: OscillatorNode; gain: GainNode };
/**
 * Everything one mood plays goes through its own bus, echo included, so switching paintings can
 * fade the whole old mood out (even notes already scheduled ahead) while the new one comes in.
 */
type Bus = { input: GainNode; echo: DelayNode; out: GainNode };

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
  private bus!: Bus;
  private mood: Mood;
  private progress = 0;
  private enabled = true;
  private visible = true;
  private ticker: ReturnType<typeof setInterval> | null = null;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;
  private pad: Voice[] = [];
  /** Set after an error; see guard(). */
  private broken = false;
  private chordIdx = 0;
  /** Recently scheduled pad chords, so game sounds can harmonise with the one playing now. */
  private timeline: { at: number; notes: number[] }[] = [];
  /** Alternates slide notes between two neighbouring chord tones, so repeated moves don't drone. */
  private lift = false;
  private nextChordAt = 0;
  private nextSparkleAt = 0;

  constructor(mood: Mood) {
    this.mood = mood;
  }

  /**
   * Call from a user gesture: creates the audio context on first use, and resumes it after an
   * interruption (e.g. a call on iOS). Returns true when this call is what started the sound.
   */
  unlock() {
    let started = false;
    this.guard(() => {
      if (!this.enabled) return;
      if (!this.ctx) {
        this.build();
        started = true;
      }
      this.update();
    });
    return started;
  }

  setEnabled(on: boolean) {
    this.guard(() => {
      this.enabled = on;
      this.update();
    });
  }

  /** Fade out while the tab is hidden, and back in when it returns. */
  setVisible(visible: boolean) {
    this.guard(() => {
      this.visible = visible;
      this.update();
    });
  }

  setMood(mood: Mood) {
    this.guard(() => {
      if (mood === this.mood) return;
      this.mood = mood;
      this.chordIdx = 0;
      this.timeline = [];
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Fade the old mood's whole bus out fast: its pad, any notes scheduled ahead and their
      // echoes, so two keys never ring together. The new mood starts on a fresh bus, its first
      // chord swelling in over the fade.
      const old = this.bus;
      old.out.gain.cancelScheduledValues(t);
      old.out.gain.setValueAtTime(old.out.gain.value, t);
      old.out.gain.linearRampToValueAtTime(0, t + FADE);
      this.pad.forEach(({ osc }) => osc.stop(t + FADE + 0.05));
      this.pad = [];
      setTimeout(() => old.out.disconnect(), (FADE + 1) * 1000);
      this.bus = this.newBus();
      this.nextChordAt = t + FADE;
      this.nextSparkleAt = t + FADE + 1.2;
      this.applyBrightness();
    });
  }

  /** 0 on a scrambled board, 1 when solved: the music opens up as the picture comes together. */
  setProgress(progress: number) {
    this.guard(() => {
      this.progress = progress;
      this.applyBrightness();
    });
  }

  /**
   * A tile moved. The note is always a tone of the chord playing now, so it can't clash with
   * the pad, and it climbs with progress. A tile landing home adds the next chord tone above.
   */
  slide(placedOne: boolean) {
    this.guard(() => {
      if (!this.playing) return;
      const t = this.ctx!.currentTime;
      const tones = this.tones(this.safeClasses(t, 0.9, true), 0, 2);
      const base = Math.round(this.progress * Math.max(0, tones.length - 2));
      this.lift = !this.lift;
      const i = base + (this.lift ? 1 : 0);
      const soft = { type: "sine" as const, attack: 0.012, echo: 0.35 };
      this.pluck(tones[i], t, 0.1, 0.9, soft);
      if (placedOne) this.pluck(tones[Math.min(i + 1, tones.length - 1)], t + 0.07, 0.06, 1.3, soft);
    });
  }

  /** A soft, low thud for a tile that can't move: never a harsh error sound. */
  blocked() {
    this.guard(() => {
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
    });
  }

  /** The picture is complete: a rising run that settles on the mood's home chord. */
  solve() {
    this.guard(() => {
      if (!this.playing) return;
      const t = this.ctx!.currentTime;
      const classes = this.safeClasses(t, 4.5, true);
      // A rising arpeggio through the chord, then the chord itself, both in tune with the pad.
      this.tones(classes, 0, 3).slice(-8).forEach((n, i) => this.pluck(n, t + i * 0.09, 0.11, 2.2));
      this.tones(classes, 1, 1).forEach((n) => this.pluck(n, t + 0.8, 0.08, 4.5));
    });
  }

  dispose() {
    this.stopTicker();
    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }

  /**
   * Sound is decoration: it must never break the game. Any error in the engine (a browser
   * audio quirk, a bad mood, stale code after a hot reload) stops the music quietly instead
   * of reaching React, and it stays off until the page reloads.
   */
  private guard(run: () => void) {
    if (this.broken) return;
    try {
      run();
    } catch (error) {
      this.broken = true;
      console.warn("Sound stopped after an error; the game carries on without it.", error);
      this.dispose();
    }
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
    this.filter.connect(this.master);
    this.master.connect(ctx.destination);
    this.ctx = ctx;
    this.bus = this.newBus();
    this.nextChordAt = this.nextSparkleAt = ctx.currentTime + 0.1;
    this.applyBrightness();
  }

  /** A mood's bus: dry input and an echo, both through one output gain into the shared filter. */
  private newBus(): Bus {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.connect(this.filter);
    const input = ctx.createGain();
    input.connect(out);
    const echo = ctx.createDelay(2);
    echo.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    echo.connect(feedback).connect(echo);
    echo.connect(out);
    return { input, echo, out };
  }

  /** Bring the audio in line with what's wanted: playing only when unlocked, enabled and visible. */
  private update() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    this.suspendTimer = null;

    if (this.playing) {
      if (ctx.state !== "running") ctx.resume().catch(() => {});
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(VOLUME, t, 0.5);
      this.startTicker();
    } else {
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(0, t, 0.2);
      this.stopTicker();
      // Once faded, suspend the context so it stops using the CPU (and battery).
      this.suspendTimer = setTimeout(() => ctx.suspend().catch(() => {}), 1000);
    }
  }

  private startTicker() {
    if (this.ticker) return;
    const now = this.ctx!.currentTime;
    // Don't try to catch up on time that passed while paused.
    this.nextChordAt = Math.max(this.nextChordAt, now + 0.1);
    this.nextSparkleAt = Math.max(this.nextSparkleAt, now + 0.5);
    this.tick();
    this.ticker = setInterval(() => this.guard(() => this.tick()), 250);
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
      // Only notes that fit every chord they'll audibly ring over (the 2.4s tail is ~27dB down
      // by 1.2s); if there's none, this one rests. That happens only around chord changes.
      const tones = this.tones(this.safeClasses(this.nextSparkleAt, 1.2), 1, 2);
      if (tones.length && Math.random() < this.mood.sparkle) {
        this.pluck(tones[Math.floor(Math.random() * tones.length)], this.nextSparkleAt, 0.045, 2.4);
      }
      this.nextSparkleAt += 1.4 + Math.random() * 2.4;
    }
  }

  /** One pad chord: two slightly detuned oscillators per note, swelling in and overlapping the next chord. */
  private chord(t: number) {
    const ctx = this.ctx!, { chords, root, pad, chordSecs } = this.mood;
    const notes = chords[this.chordIdx++ % chords.length];
    this.timeline = [...this.timeline.filter((c) => c.at > t - chordSecs * 2), { at: t, notes }];
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
        osc.connect(gain).connect(this.bus.input);
        osc.start(t);
        osc.stop(end);
        const voice = { osc, gain };
        this.pad.push(voice);
        osc.onended = () => (this.pad = this.pad.filter((v) => v !== voice));
      }
    });
  }

  /** The pad chord sounding at time t: the latest one started by then, or the next one due. */
  private chordAt(t: number) {
    if (t >= this.nextChordAt) return this.mood.chords[this.chordIdx % this.mood.chords.length];
    return this.timeline.filter((c) => c.at <= t).at(-1)?.notes ?? this.mood.chords[0];
  }

  /**
   * A chord's open notes, as pitch classes (0–11 above the root). Any note a step or less from
   * another chord note (a 7th next to the root, a 9th) is left out: the pad can hold that
   * tension, but in a short melody note it reads as a clash.
   */
  private openClasses(chord: number[]) {
    const all = [...new Set(chord.map((iv) => ((iv % 12) + 12) % 12))];
    const dist = (a: number, b: number) => Math.min(Math.abs(a - b), 12 - Math.abs(a - b));
    return all.filter((c) => all.every((k) => k === c || dist(c, k) > 2));
  }

  /**
   * Pitch classes that are open in every chord a note starting at t and audibly ringing for
   * `ring` seconds will overlap, including the previous chord's fade-out. With `fallback`, a sound
   * that must play (a slide, the win) settles for the chord at t when nothing fits all of them.
   */
  private safeClasses(t: number, ring: number, fallback = false) {
    const [first, ...rest] = [t - 1, t, t + ring].map((x) => this.openClasses(this.chordAt(x)));
    const common = first.filter((c) => rest.every((set) => set.includes(c)));
    if (common.length || !fallback) return common;
    const now = this.openClasses(this.chordAt(t));
    // Tightly stacked chords (sus, add9) may have no open note at all; the chord's root is safest.
    return now.length ? now : [((this.chordAt(t)[0] % 12) + 12) % 12];
  }

  /** Pitch classes as notes over `octaves` octaves, starting `from` octaves above the root, low to high. */
  private tones(classes: number[], from: number, octaves: number) {
    const sorted = [...classes].sort((a, b) => a - b);
    const out: number[] = [];
    for (let o = from; o < from + octaves; o++) for (const c of sorted) out.push(this.mood.root + 12 * o + c);
    return out;
  }

  private pluck(
    midi: number,
    t: number,
    volume: number,
    duration: number,
    { type = this.mood.pluck, attack = 0.01, echo = 1 }: { type?: OscillatorType; attack?: number; echo?: number } = {},
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = hz(midi);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + attack);
    // Exponential ramps can't reach 0, so fade to just above it.
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(this.bus.input);
    if (echo === 1) gain.connect(this.bus.echo);
    else {
      const send = ctx.createGain();
      send.gain.value = echo;
      gain.connect(send).connect(this.bus.echo);
    }
    osc.start(t);
    osc.stop(t + duration + 0.1);
  }

  private applyBrightness() {
    if (!this.ctx) return;
    const cutoff = this.mood.cutoff * (1 + this.progress * 2.5);
    this.filter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.8);
  }
}
