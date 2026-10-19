"use client";

import { useEffect, useState } from "react";
import { readJson, writeJson } from "@/lib/storage";
import { creditLine, parseCreditLine } from "../lib/credit";
import type { ArtworkDetails, NewUpload, UploadedArtwork } from "../types";

const STORAGE_KEY = "reframe:uploads";

/** crypto.randomUUID only exists in secure contexts, and dev may be served over plain http on a LAN IP. */
const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/** Fill in fields that uploads saved by older versions don't have. */
function normalize(saved: unknown): UploadedArtwork[] {
  if (!Array.isArray(saved)) return [];
  return saved.map((u) => {
    const details = typeof u.artistName === "string" ? { artistName: u.artistName, year: u.year ?? "" } : parseCreditLine(u.artist ?? "");
    return { ...u, ...details, id: u.id ?? newId() };
  });
}

/** Uploads live in this browser until there's a server to hold them. Writes return false if saving failed. */
export function useUploads() {
  const [uploads, setUploads] = useState<UploadedArtwork[]>([]);

  useEffect(() => {
    setUploads(normalize(readJson<unknown>(STORAGE_KEY, [])));
  }, []);

  function commit(next: UploadedArtwork[]): boolean {
    setUploads(next);
    return writeJson(STORAGE_KEY, next);
  }

  function add(u: NewUpload): boolean {
    const title = u.title.trim();
    return commit([...uploads, { ...u, title, id: newId(), artist: creditLine(u.artistName, u.year) }]);
  }

  function update(id: string, d: ArtworkDetails): boolean {
    const details = { title: d.title.trim(), artistName: d.artistName.trim(), year: d.year.trim() };
    return commit(uploads.map((u) => (u.id === id ? { ...u, ...details, artist: creditLine(details.artistName, details.year) } : u)));
  }

  function remove(id: string): boolean {
    return commit(uploads.filter((u) => u.id !== id));
  }

  return { uploads, add, update, remove };
}
