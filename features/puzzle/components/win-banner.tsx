"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { formatDuration } from "@/utils/format-time";
import { pickPraise } from "../data/praise";

type Props = {
  secs: number;
  moves: number;
  /** Whether hints were used; left out where hints don't exist (3×3). */
  hints?: "used" | "unused";
  /** A quiet line about the overall best for this grid size, if there's one to show. */
  best: string | null;
  /** The next grid size up, offered as a gentle step; left out at the largest size. */
  nextSize?: number;
  onNext: () => void;
  onTrySize: (size: number) => void;
};

export function WinBanner({ secs, moves, hints, best, nextSize, onNext, onTrySize }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Picked once per win, so it doesn't change while the card is open.
  const [praise] = useState(pickPraise);

  useEffect(() => {
    const id = setTimeout(() => ref.current?.scrollIntoView({ block: "nearest" }), 50);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="mt-3.5 rounded-[10px] border border-line bg-panel p-3.5" ref={ref} role="status">
      <strong className="font-serif text-[1.2rem] leading-[normal] font-medium">
        {praise} You reframed it in {formatDuration(secs)} and {moves} {moves === 1 ? "move" : "moves"}
        {hints === "used" ? " using hints" : hints === "unused" ? " without hints" : ""}.
      </strong>
      {best && <p className="mt-1 text-[.9rem] text-mute">{best}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="primary" onClick={onNext}>Next picture</Button>
        {nextSize && <Button onClick={() => onTrySize(nextSize)}>Try {nextSize}×{nextSize}</Button>}
      </div>
    </div>
  );
}
