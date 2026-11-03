"use client";

import { useEffect, useRef, useState } from "react";
import { MARK_CLASS, MARK_VIEWBOX, WORDMARK_CLASS } from "@/components/logo";
import { cx } from "@/utils/cx";

type Box = { x: number; y: number; s: number };

// The logo's geometry, in its 32-unit space: a big square, and a small one overlapping its
// top-right corner with a 2.5-unit gap cut around it (see MARK in lib/brand.ts).
const BIG: Box = { x: 3, y: 10, s: 19 };
const CUT = 2.5;
// The small square's four resting places around the big one; the first is the logo itself.
const CORNERS: Box[] = [
  { x: 13, y: 3, s: 16 },
  { x: 13, y: 20, s: 16 },
  { x: -4, y: 20, s: 16 },
  { x: -4, y: 3, s: 16 },
];
// The SVG uses the header logo's tight viewBox (3..29 on both axes, centre 16), so at rest it's
// identical to the header mark. While looping, the big square is shifted to that centre and the
// travelling square spills outside the viewBox.
const LOOP_SHIFT = { x: 16 - (BIG.x + BIG.s / 2), y: 16 - (BIG.y + BIG.s / 2) };
const REST_SHIFT = { x: 0, y: 0 };

const MOVE_MS = 560;
const HOLD_MS = 320;
const HOME_MS = 420;
/** Shown at least this long, so a fast load doesn't just flash it. */
const MIN_MS = 1200;
const WORD_MS = 1100;
const FADE_MS = 450;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Phase = "loading" | "word" | "fading";

/**
 * Full-screen loader: the logo's small square slides from corner to corner of the big one,
 * carrying its cut-away gap. Once `ready`, it glides home to the logo's pose, "Refr" and "me"
 * open out around it to spell the wordmark, and the screen fades away, then calls `onDone`.
 */
export function LoadingScreen({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [still, setStill] = useState(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const groupRef = useRef<SVGGElement>(null);
  const holeRef = useRef<SVGRectElement>(null);
  const smallRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    let live = true;
    const draw = (small: Box, shift: { x: number; y: number }, accent: boolean) => {
      groupRef.current?.setAttribute("transform", `translate(${shift.x} ${shift.y})`);
      for (const [r, b, pad] of [[smallRef.current, small, 0], [holeRef.current, small, CUT]] as const) {
        r?.setAttribute("x", String(b.x - pad));
        r?.setAttribute("y", String(b.y - pad));
        r?.setAttribute("width", String(b.s + pad * 2));
        r?.setAttribute("height", String(b.s + pad * 2));
      }
      if (smallRef.current) smallRef.current.style.fill = accent ? "var(--acc)" : "var(--ink)";
    };
    // Animation frames can stop arriving (background tabs, battery saver, some embedded views), so a
    // timer also finishes each step on time. Without it the loader could wait forever on a frame.
    const tween = (ms: number, step: (t: number) => void) =>
      new Promise<void>((resolve) => {
        const t0 = performance.now();
        let over = false;
        const finish = () => {
          if (over) return;
          over = true;
          clearTimeout(timer);
          if (live) step(1);
          resolve();
        };
        const timer = setTimeout(finish, ms + 50);
        const frame = (now: number) => {
          if (over) return;
          if (!live) return finish();
          const t = Math.min(1, (now - t0) / ms);
          if (t < 1) {
            step(ease(t));
            requestAnimationFrame(frame);
          } else finish();
        };
        requestAnimationFrame(frame);
      });

    (async () => {
      const started = performance.now();
      const finished = () => readyRef.current && performance.now() - started >= MIN_MS;

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // No travelling: the still logo pulses gently until everything has loaded.
        setStill(true);
        draw(CORNERS[0], REST_SHIFT, false);
        while (live && !finished()) await sleep(100);
      } else {
        let i = 0;
        draw(CORNERS[0], LOOP_SHIFT, true);
        while (live) {
          const from = CORNERS[i], to = CORNERS[(i + 1) % 4];
          await tween(MOVE_MS, (t) =>
            draw({ x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t), s: 16 }, LOOP_SHIFT, true),
          );
          i = (i + 1) % 4;
          if (finished()) break;
          await sleep(HOLD_MS);
        }
        // Go straight home, re-centring on the logo and dropping the accent. From the far corner that's
        // a diagonal across the big square, its gap cutting the big square away as it passes.
        const from = CORNERS[i], home = CORNERS[0];
        await tween(i === 0 ? HOME_MS : MOVE_MS, (t) =>
          draw(
            { x: lerp(from.x, home.x, t), y: lerp(from.y, home.y, t), s: 16 },
            { x: lerp(LOOP_SHIFT.x, REST_SHIFT.x, t), y: lerp(LOOP_SHIFT.y, REST_SHIFT.y, t) },
            t < 0.6,
          ),
        );
      }
      if (!live) return;
      setStill(false);
      setPhase("word");
      await sleep(WORD_MS);
      if (!live) return;
      setPhase("fading");
      await sleep(FADE_MS);
      if (live) doneRef.current();
    })();

    return () => {
      live = false;
    };
  }, []);

  const word = phase !== "loading";
  // The letters ease out from behind the mark: fade, slide a little away from it, and sharpen.
  const letters = (side: "left" | "right") =>
    cx(
      "transition-[opacity,translate,filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
      side === "right" && "delay-75",
      word ? "translate-x-0 opacity-100 blur-none" : cx("opacity-0 blur-[3px]", side === "left" ? "translate-x-[.3em]" : "-translate-x-[.3em]"),
    );

  return (
    <div
      data-loader
      role="status"
      aria-label="Loading Reframe"
      className={cx(
        "fixed inset-0 z-50 grid place-items-center bg-canvas transition-opacity duration-[450ms]",
        phase === "fading" && "pointer-events-none opacity-0",
      )}
    >
      {/* Without JavaScript nothing would ever dismiss it, so it stays out of the way. */}
      <noscript>
        <style>{"[data-loader]{display:none}"}</style>
      </noscript>
      {/* The whole wordmark is laid out from the start, set like the header logo. The 1fr columns keep
          the mark dead centre, so finishing only shrinks it in place while the letters appear around it. */}
      <div
        className={cx(WORDMARK_CLASS, "grid w-full grid-cols-[1fr_auto_1fr] items-baseline text-[3.5rem] text-ink")}
        aria-hidden="true"
      >
        <span className={cx("justify-self-end", letters("left"))}>Refr</span>
        <svg
          viewBox={MARK_VIEWBOX}
          className={cx(
            MARK_CLASS,
            // In the grid the mark sits on the baseline by its bottom edge; .03em lower matches the header's align.
            "relative top-[.03em] overflow-visible transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
            word ? "scale-100" : "scale-200",
            still && "animate-pulse",
          )}
        >
          <defs>
            <mask id="rf-loader-cut" maskUnits="userSpaceOnUse" x="-40" y="-40" width="120" height="120">
              <rect x="-40" y="-40" width="120" height="120" fill="#fff" />
              <rect ref={holeRef} x={10.5} y={0.5} width={21} height={21} rx="3.5" fill="#000" />
            </mask>
          </defs>
          <g ref={groupRef} transform={`translate(${LOOP_SHIFT.x} ${LOOP_SHIFT.y})`} className="fill-ink">
            <rect x={BIG.x} y={BIG.y} width={BIG.s} height={BIG.s} rx="2" mask="url(#rf-loader-cut)" />
            <rect ref={smallRef} x={13} y={3} width={16} height={16} rx="2" style={{ fill: "var(--acc)" }} />
          </g>
        </svg>
        <span className={cx("justify-self-start", letters("right"))}>me</span>
      </div>
    </div>
  );
}
