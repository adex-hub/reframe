"use client";

import { useEffect, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";
import type { UploadedArtwork } from "../types";

const STORAGE_KEY = "reframe:uploads";

/** Uploads live in this browser until there's a server to hold them. */
export function useUploads() {
  const [uploads, setUploads] = useState<UploadedArtwork[]>([]);

  useEffect(() => {
    const saved = readJson<unknown>(STORAGE_KEY, []);
    if (Array.isArray(saved)) setUploads(saved as UploadedArtwork[]);
  }, []);

  /** Adds the upload; returns false if it couldn't be saved and will be lost on reload. */
  function add(u: UploadedArtwork): boolean {
    const next = [...uploads, u];
    setUploads(next);
    return writeJson(STORAGE_KEY, next);
  }

  return { uploads, add };
}
