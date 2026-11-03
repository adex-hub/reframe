"use client";

import { useEffect, useRef, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";
import { describe, merge, type Best } from "../lib/best";

const STORAGE_KEY = "reframe:best";

type Options = {
  size: number;
  round: number;
  done: boolean;
  secs: number;
  moves: number;
  hinted: boolean;
};

function load(): Record<string, Best> {
  const raw = readJson<unknown>(STORAGE_KEY, {});
  return raw && typeof raw === "object" ? (raw as Record<string, Best>) : {};
}

/**
 * Overall best per grid size (any picture), kept on this device. When a game is won it's
 * compared with the record for the win card's line, then the record is updated. Hinted
 * solves are compared but never recorded.
 */
export function useBest({ size, round, done, secs, moves, hinted }: Options) {
  const [line, setLine] = useState<string | null>(null);
  // Each game is scored once, even if the effect runs again.
  const scored = useRef(-1);

  useEffect(() => {
    if (!done) {
      setLine(null);
      return;
    }
    if (scored.current === round) return;
    scored.current = round;
    const all = load();
    const best = all[size] ?? null;
    setLine(describe(best, secs, moves, hinted, size));
    if (!hinted) writeJson(STORAGE_KEY, { ...all, [size]: merge(best, secs, moves) });
    // Scored at the moment of winning; later changes to these values don't matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, round]);

  return line;
}
