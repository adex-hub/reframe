"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/utils/format-time";
import { isSolved, shuffled, slide, solvedTiles } from "../lib/board";

type Options = {
  size: number;
  /** Changing this (e.g. the picture) starts a fresh shuffle. */
  puzzleKey: string;
  /** Arrow-key play is off while something else (like a modal) has the keyboard. */
  keyboard: boolean;
  announce: (message: string) => void;
};

export function usePuzzle({ size: n, puzzleKey, keyboard, announce }: Options) {
  const [tiles, setTiles] = useState(() => solvedTiles(n));
  const [history, setHistory] = useState<number[][]>([]);
  const [moves, setMoves] = useState(0);
  const [secs, setSecs] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setTiles(shuffled(n));
    setHistory([]);
    setMoves(0);
    setSecs(0);
    setStarted(false);
    setDone(false);
    announce(`New puzzle, ${n} by ${n}`);
  }

  // New shuffle whenever the grid size or picture changes (also runs on first load).
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, puzzleKey]);

  // Timer: starts on the first move, stops on completion.
  useEffect(() => {
    if (!started || done) return;
    const t0 = Date.now();
    const id = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 250);
    return () => clearInterval(id);
  }, [started, done]);

  // Detect a win after any board change (tap, keyboard, or undo).
  useEffect(() => {
    if (started && !done && isSolved(tiles)) setDone(true);
  }, [tiles, started, done]);

  useEffect(() => {
    if (done) announce(`Puzzle complete in ${formatTime(secs)} and ${moves} moves`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function tap(p: number) {
    if (done) return;
    const next = slide(tiles, n, p);
    if (!next) {
      announce("That tile is stuck");
      return;
    }
    setHistory((h) => [...h, tiles]);
    setTiles(next);
    setMoves((m) => m + 1);
    setStarted(true);
    if (!isSolved(next)) announce(`Moved. ${moves + 1} moves`);
  }

  function undo() {
    if (done || !history.length) return;
    setTiles(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => m + 1);
    announce("Undone");
  }

  // Arrow keys: the tile on the opposite side of the gap slides into it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d: Record<string, [number, number]> = {
        ArrowLeft: [0, 1], ArrowRight: [0, -1], ArrowUp: [1, 0], ArrowDown: [-1, 0],
      };
      const v = d[e.key];
      if (!v || done || !keyboard) return;
      e.preventDefault();
      const b = tiles.indexOf(n * n - 1);
      const r = Math.floor(b / n) + v[0], c = (b % n) + v[1];
      if (r < 0 || c < 0 || r >= n || c >= n) return;
      tap(r * n + c);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return { tiles, moves, secs, done, tap, undo, reset };
}
