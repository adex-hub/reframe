"use client";

import { useEffect, useRef, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";
import { isTyping } from "@/utils/is-typing";
import { HINT_MIN_SIZE } from "../constants";

const STORAGE_KEY = "reframe:hints";

type Options = {
  size: number;
  /** Changes with every new game, so `used` starts over. */
  round: number;
  /** Stops toggling (e.g. once the puzzle is solved) without forgetting the setting. */
  locked: boolean;
};

/**
 * Number hints on the tiles, for 4×4 and up only: off by default, toggled with the button or
 * "H", and remembered. `used` says whether the numbers were on screen at any point this game.
 */
export function useHints({ size, round, locked }: Options) {
  const [on, setOn] = useState(false);
  const [used, setUsed] = useState(false);
  const available = size >= HINT_MIN_SIZE;
  const shown = on && available;

  useEffect(() => {
    setOn(readJson<boolean>(STORAGE_KEY, false) === true);
  }, []);

  // A new game starts clean, unless the numbers are already showing on it.
  const lastRound = useRef(round);
  useEffect(() => {
    if (round !== lastRound.current) {
      lastRound.current = round;
      setUsed(shown);
    } else if (shown && !locked) {
      setUsed(true);
    }
  }, [round, shown, locked]);

  function toggle() {
    if (locked || !available) return;
    setOn(!on);
    writeJson(STORAGE_KEY, !on);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "h" || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || isTyping(e.target)) return;
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return { on, shown, available, used, toggle };
}
