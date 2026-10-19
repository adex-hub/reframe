"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoreIcon } from "./icons";
import { cx } from "@/utils/cx";

export type ActionMenuItem = { label: string; icon?: React.ReactNode; danger?: boolean; onSelect: () => void };

type Props = { label: string; items: ActionMenuItem[]; className?: string };

/** Rough menu height, used to open upwards when there isn't room below. */
const ROOM_NEEDED = 120;

/**
 * "⋯" button with a dropdown menu. Uses the native popover so it sits in the top layer
 * (never clipped by scroll boxes) and gets click-outside and Esc dismissal for free.
 */
export function ActionMenu({ label, items, className }: Props) {
  const id = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const menu = menuRef.current!;
    // Position against the button just before it opens, so there's no flash in the wrong place.
    const onBeforeToggle = (e: Event) => {
      if ((e as ToggleEvent).newState !== "open") return;
      const r = btnRef.current!.getBoundingClientRect();
      const up = r.bottom + ROOM_NEEDED > window.innerHeight;
      Object.assign(menu.style, {
        right: `${window.innerWidth - r.right}px`,
        top: up ? "auto" : `${r.bottom + 4}px`,
        bottom: up ? `${window.innerHeight - r.top + 4}px` : "auto",
      });
    };
    const onToggle = (e: Event) => {
      const isOpen = (e as ToggleEvent).newState === "open";
      setOpen(isOpen);
      if (isOpen) menu.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    };
    // The menu is pinned to where the button was, so close it if anything scrolls or resizes.
    const close = () => menu.matches(":popover-open") && menu.hidePopover();
    menu.addEventListener("beforetoggle", onBeforeToggle);
    menu.addEventListener("toggle", onToggle);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      menu.removeEventListener("beforetoggle", onBeforeToggle);
      menu.removeEventListener("toggle", onToggle);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    const els = [...menuRef.current!.querySelectorAll<HTMLElement>('[role="menuitem"]')];
    const i = els.indexOf(document.activeElement as HTMLElement);
    const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: els.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault(); // also stops the puzzle's arrow-key handler
    els[(next + els.length) % els.length]?.focus();
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        popoverTarget={id}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        data-open={open || undefined}
        className={className}
      >
        <MoreIcon />
      </button>
      <div
        ref={menuRef}
        id={id}
        popover="auto"
        role="menu"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="fixed inset-auto m-0 min-w-36 rounded-xl border border-line bg-panel p-1 text-ink shadow-[0_12px_32px_rgba(0,0,0,.25)]"
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              menuRef.current!.hidePopover();
              item.onSelect();
            }}
            className={cx(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[.9rem] hover:bg-canvas focus:bg-canvas focus:outline-none",
              item.danger && "text-danger",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
