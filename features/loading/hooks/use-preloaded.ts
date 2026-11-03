"use client";

import { useEffect, useState } from "react";
import { preload } from "../lib/preload";

/** True once every image in `srcs` has loaded, or `timeoutMs` has passed. */
export function usePreloaded(srcs: string[], timeoutMs = 8000) {
  const [ready, setReady] = useState(false);
  const key = srcs.join("\n");

  useEffect(() => {
    let live = true;
    preload(key.split("\n"), timeoutMs).then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, [key, timeoutMs]);

  return ready;
}
