"use client";

import { useEffect, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";

const STORAGE_KEY = "reframe:last-start";

/** Picked once per page load, so an effect running twice (React's dev check) can't pick again. */
let pagePick: number | null = null;

function pickOnce(count: number) {
  if (pagePick !== null) return pagePick;
  const last = readJson<number>(STORAGE_KEY, -1);
  let pick = Math.floor(Math.random() * count);
  // Any of the others, evenly, when the roll lands on last visit's picture.
  if (pick === last && count > 1) pick = (pick + 1 + Math.floor(Math.random() * (count - 1))) % count;
  writeJson(STORAGE_KEY, pick);
  pagePick = pick;
  return pick;
}

/**
 * The selected picture, starting on a random built-in one so not everyone opens on the same
 * painting, and never the one this device opened on last time. It's null until picked after
 * mount (the page is static, so the server can't pick per visit); render nothing
 * picture-specific until then so the default doesn't flash.
 */
export function useStartPicture(count: number) {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setSelected(pickOnce(count));
  }, [count]);

  return [selected, setSelected as (index: number) => void] as const;
}
