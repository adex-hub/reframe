"use client";

import { useEffect, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";
import { isTyping } from "@/utils/is-typing";

const STORAGE_KEY = "reframe:hints";

/** Number hints on the tiles: off by default, toggled with the button or "H", and remembered. */
export function useHints() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(readJson<boolean>(STORAGE_KEY, false) === true);
  }, []);

  function toggle() {
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

  return { on, toggle };
}
