"use client";

import { useEffect, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";
import { INTRO_SEEN_KEY } from "../constants";

/**
 * Whether the intro loader should still be on screen. It plays on a device's first visit, while
 * the paintings aren't cached yet; after that it's skipped (and already hidden by INTRO_SCRIPT
 * before the first paint, so this only removes it from the page).
 */
export function useIntro() {
  const [showing, setShowing] = useState(true);

  useEffect(() => {
    if (readJson<boolean>(INTRO_SEEN_KEY, false)) setShowing(false);
  }, []);

  function finish() {
    writeJson(INTRO_SEEN_KEY, true);
    setShowing(false);
  }

  return { showing, finish };
}
