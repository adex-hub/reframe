"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/button";
import { formatTime } from "@/utils/format-time";

type Props = { secs: number; moves: number; credit: string; onNext: () => void };

export function WinBanner({ secs, moves, credit, onNext }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => ref.current?.scrollIntoView({ block: "nearest" }), 50);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="mt-3.5 rounded-[10px] border border-line bg-panel p-3.5" ref={ref} role="status">
      <strong className="font-serif text-[1.2rem] leading-[normal] font-medium">Nicely done. You reframed it in {formatTime(secs)} and {moves} moves.</strong>
      <p className="mt-1 mb-2.5 text-mute">{credit}</p>
      <Button variant="primary" onClick={onNext}>Next picture</Button>
    </div>
  );
}
