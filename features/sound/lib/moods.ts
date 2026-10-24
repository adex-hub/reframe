/**
 * A mood is the musical setting for one painting: a key, a scale for melody notes,
 * a slow chord loop for the background pad, and a few colour controls.
 */
export type Mood = {
  /** MIDI note the scale and chords are built on (60 = middle C). */
  root: number;
  /** Semitone steps of the scale, from the root. */
  scale: number[];
  /** Chord loop, each chord as semitones from the root. */
  chords: number[][];
  pad: OscillatorType;
  pluck: OscillatorType;
  /** How long each chord holds, in seconds. */
  chordSecs: number;
  /** Lowpass cutoff (Hz) on a fresh, scrambled board; it opens up as tiles fall into place. */
  cutoff: number;
  /** Chance (0–1) of a soft melody note every couple of seconds. */
  sparkle: number;
};

const LILIES: Mood = {
  root: 62, scale: [0, 2, 4, 6, 7, 9, 11],
  chords: [[0, 4, 7, 11], [2, 6, 9, 13], [-3, 4, 7, 11], [5, 9, 12, 16]],
  pad: "sine", pluck: "sine", chordSecs: 9, cutoff: 900, sparkle: 0.5,
};

const MOODS: Record<string, Mood> = {
  // Japanese in scale, with plucked, koto-like notes.
  "/art/great-wave.jpg": {
    root: 57, scale: [0, 1, 5, 7, 8],
    chords: [[0, 7, 12], [1, 8, 13], [-4, 5, 12], [0, 5, 7]],
    pad: "triangle", pluck: "triangle", chordSecs: 7, cutoff: 1100, sparkle: 0.55,
  },
  // Gentle Dorian, a nod to Renaissance modes.
  "/art/mona-lisa.jpg": {
    root: 57, scale: [0, 2, 3, 5, 7, 9, 10],
    chords: [[0, 3, 7, 10], [5, 9, 12, 15], [-2, 2, 5, 9], [3, 7, 10, 14]],
    pad: "triangle", pluck: "sine", chordSecs: 10, cutoff: 800, sparkle: 0.4,
  },
  // Dark, rolling minor for the open sea.
  "/art/gulf-stream.jpg": {
    root: 50, scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [[0, 7, 15], [-4, 3, 12], [-2, 5, 14], [-5, 2, 10]],
    pad: "sine", pluck: "triangle", chordSecs: 8, cutoff: 700, sparkle: 0.35,
  },
  // Plain, warm major with a Baroque calm.
  "/art/pearl-earring.jpg": {
    root: 55, scale: [0, 2, 4, 5, 7, 9, 11],
    chords: [[0, 4, 7, 12], [-3, 4, 9, 12], [5, 9, 12, 17], [7, 11, 14, 19]],
    pad: "sine", pluck: "sine", chordSecs: 9, cutoff: 850, sparkle: 0.45,
  },
  // Wide, open Lydian for the ceiling.
  "/art/creation-of-adam.jpg": {
    root: 53, scale: [0, 2, 4, 6, 7, 9, 11],
    chords: [[0, 7, 12, 16], [2, 9, 14, 18], [-5, 2, 7, 11], [0, 7, 11, 14]],
    pad: "triangle", pluck: "sine", chordSecs: 11, cutoff: 750, sparkle: 0.35,
  },
  // Warm seventh chords for a night out.
  "/art/cafe-terrace.jpg": {
    root: 51, scale: [0, 2, 4, 7, 9, 11],
    chords: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12], [7, 11, 14, 17]],
    pad: "triangle", pluck: "triangle", chordSecs: 7, cutoff: 1000, sparkle: 0.5,
  },
  // Hopeful, church-like Mixolydian.
  "/art/healing-the-blind.jpg": {
    root: 55, scale: [0, 2, 4, 5, 7, 9, 10],
    chords: [[0, 7, 12, 16], [-2, 5, 10, 14], [5, 9, 12, 17], [0, 4, 7, 14]],
    pad: "triangle", pluck: "sine", chordSecs: 10, cutoff: 800, sparkle: 0.4,
  },
  "/art/water-lilies-1897.jpg": LILIES,
  // Romantic minor, looking out over the fog.
  "/art/wanderer.jpg": {
    root: 52, scale: [0, 2, 3, 5, 7, 8, 11],
    chords: [[0, 3, 7, 12], [-4, 3, 8, 12], [5, 8, 12, 15], [-1, 5, 8, 14]],
    pad: "sine", pluck: "sine", chordSecs: 10, cutoff: 750, sparkle: 0.4,
  },
  // Pointillism as music: many tiny bright dots.
  "/art/grande-jatte.jpg": {
    root: 60, scale: [0, 2, 4, 7, 9],
    chords: [[0, 4, 7, 14], [-3, 4, 9, 12], [5, 9, 12, 16], [-5, 2, 7, 11]],
    pad: "sine", pluck: "sine", chordSecs: 8, cutoff: 1100, sparkle: 0.8,
  },
  // Spanish Phrygian.
  "/art/juan-de-pareja.jpg": {
    root: 52, scale: [0, 1, 4, 5, 7, 8, 10],
    chords: [[0, 4, 7, 12], [1, 5, 8, 13], [-2, 3, 7, 10], [0, 4, 7, 11]],
    pad: "triangle", pluck: "triangle", chordSecs: 8, cutoff: 850, sparkle: 0.45,
  },
};

/** Used for uploaded photos and anything without its own mood: soft major pentatonic. */
const DEFAULT_MOOD: Mood = {
  root: 60, scale: [0, 2, 4, 7, 9],
  chords: [[0, 4, 7, 11], [-3, 4, 9, 12], [5, 9, 12, 16], [-5, 2, 7, 11]],
  pad: "sine", pluck: "sine", chordSecs: 9, cutoff: 900, sparkle: 0.45,
};

export const moodFor = (src: string): Mood => MOODS[src] ?? DEFAULT_MOOD;
