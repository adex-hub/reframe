"use client";

import { useEffect, useRef, useState } from "react";
import { CropLargeIcon, CropSmallIcon } from "@/components/icons";
import { clamp } from "@/utils/clamp";
import { cx } from "@/utils/cx";
import { IMAGE_AREA } from "../constants";
import { MAX_ZOOM, cropBox, fitCrop, type Crop } from "../lib/crop";

// Thirds lines showing how the puzzle will split the crop.
const GRID_LINES: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.45) 1px, transparent 1px)",
  backgroundSize: "calc(100% / 3) calc(100% / 3)",
  backgroundPosition: "-1px -1px",
};

/** Corner handles; `x`/`y` are the direction the corner points (1 = right/down). */
const HANDLES = [
  { id: "nw", x: -1, y: -1, cursor: "cursor-nwse-resize" },
  { id: "ne", x: 1, y: -1, cursor: "cursor-nesw-resize" },
  { id: "sw", x: -1, y: 1, cursor: "cursor-nesw-resize" },
  { id: "se", x: 1, y: 1, cursor: "cursor-nwse-resize" },
] as const;

type Drag =
  | { mode: "move"; x: number; y: number; crop: Crop }
  /** Resizing keeps the opposite corner (ax, ay, in image px) fixed. */
  | { mode: "resize"; dx: number; dy: number; ax: number; ay: number };

type Props = {
  img: HTMLImageElement;
  url: string;
  crop: Crop;
  onChange: (c: Crop) => void;
  over: boolean;
  onReplace: () => void;
};

/**
 * The whole image, with a square crop window over it (outside dimmed, 3×3 puzzle grid inside).
 * Drag the square to move it, its corners to resize; wheel, slider, arrow keys and +/- work too.
 */
export function CropEditor({ img, url, crop, onChange, over, onReplace }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const latest = useRef(crop);
  latest.current = crop;
  const [stage, setStage] = useState({ w: 0, h: 0 });

  // The image is shown whole ("contain") inside the stage, so track the stage's size.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setStage({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // React's wheel handler is passive, so attach natively to be able to stop page scroll.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const c = latest.current;
      onChange(fitCrop(img, { ...c, z: c.z * Math.exp(-e.deltaY * 0.002) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [img, onChange]);

  const { w, h, s, left, top } = cropBox(img, crop);
  const scale = Math.min(stage.w / w, stage.h / h);

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const handle = HANDLES.find((hd) => hd.id === (e.target as HTMLElement).dataset.handle);
    drag.current = handle
      ? { mode: "resize", dx: handle.x, dy: handle.y, ax: handle.x > 0 ? left : left + s, ay: handle.y > 0 ? top : top + s }
      : { mode: "move", x: e.clientX, y: e.clientY, crop };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || !frameRef.current) return;
    const r = frameRef.current.getBoundingClientRect();
    if (d.mode === "move") {
      onChange(fitCrop(img, { ...d.crop, cx: d.crop.cx + (e.clientX - d.x) / r.width, cy: d.crop.cy + (e.clientY - d.y) / r.height }));
      return;
    }
    // Pointer in image pixels; the square grows towards it from the fixed corner.
    const px = ((e.clientX - r.left) / r.width) * w;
    const py = ((e.clientY - r.top) / r.height) * h;
    const room = Math.min(d.dx > 0 ? w - d.ax : d.ax, d.dy > 0 ? h - d.ay : d.ay);
    const min = Math.min(w, h) / MAX_ZOOM;
    const side = clamp(Math.max(d.dx * (px - d.ax), d.dy * (py - d.ay)), min, Math.max(min, room));
    const l = d.dx > 0 ? d.ax : d.ax - side;
    const t = d.dy > 0 ? d.ay : d.ay - side;
    onChange(fitCrop(img, { cx: (l + side / 2) / w, cy: (t + side / 2) / h, z: Math.min(w, h) / side }));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = s * 0.04;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const m = moves[e.key];
    if (m) onChange(fitCrop(img, { ...crop, cx: crop.cx + (m[0] * step) / w, cy: crop.cy + (m[1] * step) / h }));
    else if (e.key === "+" || e.key === "=") onChange(fitCrop(img, { ...crop, z: crop.z / 1.1 }));
    else if (e.key === "-") onChange(fitCrop(img, { ...crop, z: crop.z * 1.1 }));
    else return;
    e.preventDefault();
  }

  const square = { left: `${(left / w) * 100}%`, top: `${(top / h) * 100}%`, width: `${(s / w) * 100}%`, height: `${(s / h) * 100}%` };

  return (
    <>
      {/* Padding leaves room for the corner handles at the image's edges. */}
      <div ref={stageRef} className={cx(IMAGE_AREA, "grid place-items-center overflow-hidden border-transparent p-3", over && "border-accent")}>
        {scale > 0 && (
          <div
            ref={frameRef}
            className="relative cursor-move touch-none select-none"
            style={{ width: w * scale, height: h * scale }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" draggable={false} className="pointer-events-none block size-full" />

            {/* Dim everything outside the square; clipped to the image. */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute shadow-[0_0_0_9999px_rgba(8,11,18,.6)]" style={square} />
            </div>

            <div
              className="absolute shadow-[0_0_0_2px_white] outline-none focus-visible:shadow-[0_0_0_2px_white,0_0_0_5px_var(--acc)]"
              style={{ ...square, ...GRID_LINES }}
              tabIndex={0}
              role="group"
              aria-label="Puzzle crop. Drag or use arrow keys to move it, drag a corner, scroll or press plus and minus to resize."
              onKeyDown={onKeyDown}
            >
              {HANDLES.map((hd) => (
                <span
                  key={hd.id}
                  data-handle={hd.id}
                  className={cx("absolute grid size-7 place-items-center", hd.cursor)}
                  style={{ [hd.x > 0 ? "right" : "left"]: -14, [hd.y > 0 ? "bottom" : "top"]: -14 }}
                >
                  <span className="pointer-events-none size-3 rounded-[3px] bg-white shadow-[0_1px_3px_rgba(0,0,0,.4)]" />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2.5 text-mute">
        <CropSmallIcon className="size-[18px]" />
        <input
          type="range"
          min={1 / MAX_ZOOM}
          max={1}
          step={0.01}
          value={1 / crop.z}
          aria-label="Crop size"
          className="flex-1 accent-accent"
          onChange={(e) => onChange(fitCrop(img, { ...crop, z: 1 / Number(e.target.value) }))}
        />
        <CropLargeIcon className="size-[18px]" />
        <button type="button" className="border-0 bg-transparent py-1.5 pr-0.5 pl-2 font-semibold text-accent" onClick={onReplace}>Replace</button>
      </div>
    </>
  );
}
