"use client";

import { useEffect, useState } from "react";
import { INK } from "@/lib/brand";
import { setFavicon } from "../lib/favicon";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Follow the system theme live: a system change overrides any earlier toggle choice.
  // The favicon always follows the system theme, never the in-page toggle.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const sys = mq.matches ? "dark" : "light";
      delete document.documentElement.dataset.theme;
      setTheme(sys);
      setFavicon(INK[sys]);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }

  return { theme, toggle };
}
