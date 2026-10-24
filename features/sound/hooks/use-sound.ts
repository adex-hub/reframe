"use client";

import { useEffect, useRef, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";
import { SoundEngine } from "../lib/engine";
import { moodFor } from "../lib/moods";

const STORAGE_KEY = "reframe:sound";

type Options = {
  /** The painting being solved; picks the mood. */
  src: string;
  tiles: number[];
  moves: number;
  /** Count of taps on tiles that couldn't move. */
  bumps: number;
  done: boolean;
};

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/** Sound is on by default; it starts on the first tap or key press, and the choice to mute is remembered. */
export function useSound({ src, tiles, moves, bumps, done }: Options) {
  const [enabled, setEnabled] = useState(true);
  const engineRef = useRef<SoundEngine | null>(null);

  const blank = tiles.length - 1;
  const placed = tiles.filter((t, i) => t === i && t !== blank).length;
  const progress = placed / blank;

  function toggle() {
    const engine = engineRef.current;
    if (!engine) return;
    const next = !enabled;
    setEnabled(next);
    writeJson(STORAGE_KEY, next);
    engine.setEnabled(next);
    engine.unlock();
  }

  // Create the engine, restore the saved choice, and listen for the gestures that unlock
  // audio. The listeners stay on so a later tap can resume audio after an interruption.
  useEffect(() => {
    const engine = new SoundEngine(moodFor(src));
    engineRef.current = engine;
    const saved = readJson<boolean>(STORAGE_KEY, true) !== false;
    setEnabled(saved);
    engine.setEnabled(saved);

    const unlock = () => engine.unlock();
    const onVisibility = () => engine.setVisible(!document.hidden);
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      document.removeEventListener("visibilitychange", onVisibility);
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setMood(moodFor(src));
  }, [src]);

  // Turn board changes into sounds. Only increases count, so a fresh shuffle stays quiet.
  const prev = useRef({ moves, placed, bumps, done });
  useEffect(() => {
    const engine = engineRef.current;
    const p = prev.current;
    if (engine) {
      engine.setProgress(progress);
      if (moves > p.moves) engine.slide(placed > p.placed);
      if (bumps > p.bumps) engine.blocked();
      if (done && !p.done) engine.solve();
    }
    prev.current = { moves, placed, bumps, done };
  }, [moves, placed, bumps, done, progress]);

  // "M" mutes or unmutes, unless someone is typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "m" || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || isTyping(e.target)) return;
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return { enabled, toggle };
}
