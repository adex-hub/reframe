"use client";

import { useEffect, useRef } from "react";
import { ZoomInIcon, ZoomOutIcon } from "@/components/icons";
import { cx } from "@/utils/cx";
import { MAX_ZOOM, cropBox, fitCrop, type Crop } from "../lib/crop";
import { IMAGE_AREA } from "../constants";

// Thirds lines showing how the puzzle will split the crop.
const GRID_LINES: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.45) 1px, transparent 1px)",
  backgroundSize: "calc(100% / 3) calc(100% / 3)",
  backgroundPosition: "-1px -1px",
};

type Props = {
  img: HTMLImageElement;
  url: string;
  crop: Crop;
  onChange: (c: Crop) => void;
  over: boolean;
  onReplace: () => void;
};

/** Square crop with a 3×3 puzzle grid: drag or arrow keys to move, wheel, slider or +/- to zoom. */
export function CropEditor({ img, url, crop, onChange, over, onReplace }: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; crop: Crop } | null>(null);
  const latest = useRef(crop);
  latest.current = crop;

  // React's wheel handler is passive, so attach natively to be able to stop page scroll.
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const c = latest.current;
      onChange(fitCrop(img, { ...c, z: c.z * Math.exp(-e.deltaY * 0.002) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [img, onChange]);

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, crop };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || !viewRef.current) return;
    const { w, h, s } = cropBox(img, d.crop);
    const k = s / viewRef.current.getBoundingClientRect().width; // image px per screen px
    onChange(fitCrop(img, { ...d.crop, cx: d.crop.cx - ((e.clientX - d.x) * k) / w, cy: d.crop.cy - ((e.clientY - d.y) * k) / h }));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const { w, h, s } = cropBox(img, crop);
    const step = s * 0.04;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const m = moves[e.key];
    if (m) onChange(fitCrop(img, { ...crop, cx: crop.cx + (m[0] * step) / w, cy: crop.cy + (m[1] * step) / h }));
    else if (e.key === "+" || e.key === "=") onChange(fitCrop(img, { ...crop, z: crop.z * 1.1 }));
    else if (e.key === "-") onChange(fitCrop(img, { ...crop, z: crop.z / 1.1 }));
    else return;
    e.preventDefault();
  }

  const b = cropBox(img, crop);

  return (
    <>
      <div
        ref={viewRef}
        className={cx(IMAGE_AREA, "relative cursor-grab touch-none overflow-hidden border-transparent select-none active:cursor-grabbing", over && "border-accent")}
        tabIndex={0}
        role="group"
        aria-label="Puzzle crop. Drag or use arrow keys to move, scroll or plus and minus to zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={onKeyDown}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          draggable={false}
          className="pointer-events-none absolute h-auto max-w-none"
          style={{ width: `${(b.w / b.s) * 100}%`, left: `${(-b.left / b.s) * 100}%`, top: `${(-b.top / b.s) * 100}%` }}
        />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,.5)]" style={GRID_LINES} aria-hidden="true" />
      </div>
      <div className="flex items-center gap-2.5 text-mute">
        <ZoomOutIcon className="size-[18px]" />
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={crop.z}
          aria-label="Zoom"
          className="flex-1 accent-accent"
          onChange={(e) => onChange(fitCrop(img, { ...crop, z: Number(e.target.value) }))}
        />
        <ZoomInIcon className="size-[18px]" />
        <button type="button" className="border-0 bg-transparent py-1.5 pr-0.5 pl-2 font-semibold text-accent" onClick={onReplace}>Replace</button>
      </div>
    </>
  );
}
