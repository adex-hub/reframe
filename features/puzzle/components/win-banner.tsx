"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { formatDuration } from "@/utils/format-time";
import { pickPraise } from "../data/praise";

type Props = {
  secs: number;
  moves: number;
  credit: string;
  /** Whether hints were used; left out where hints don't exist (3×3). */
  hints?: "used" | "unused";
  onNext: () => void;
};

export function WinBanner({ secs, moves, credit, hints, onNext }: Props) {
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
      <p className="mt-1 mb-2.5 text-mute">{credit}</p>
      <Button variant="primary" onClick={onNext}>Next picture</Button>
    </div>
  );
}
