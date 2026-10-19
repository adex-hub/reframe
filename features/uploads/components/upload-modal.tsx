"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { InfoIcon } from "@/components/icons";
import type { Visibility } from "@/features/gallery";
import { OUTPUT_SIZE, VISIBILITY_INFO } from "../constants";
import { INITIAL_CROP, renderCrop, type Crop } from "../lib/crop";
import { loadImage } from "../lib/load-image";
import type { UploadedArtwork } from "../types";
import { CropEditor } from "./crop-editor";
import { DropZone } from "./drop-zone";
import { VisibilityToggle } from "./visibility-toggle";

const FIELD = "grid min-w-0 gap-1 text-[.8rem] font-semibold text-mute";
const INPUT =
  "min-h-11 w-full min-w-0 rounded-[10px] border border-line bg-canvas px-3 font-sans text-base leading-[normal] font-normal text-ink focus:border-accent focus:outline-none";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpload: (artwork: UploadedArtwork) => void;
};

export function UploadModal({ open, onClose, onUpload }: Props) {
  const dlgRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [visibility, setVisibility] = useState<Visibility>("private");
  const [picked, setPicked] = useState<{ img: HTMLImageElement; url: string } | null>(null);
  const [crop, setCrop] = useState<Crop>(INITIAL_CROP);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");

  // Open/close the native dialog, starting fresh each time it opens.
  useEffect(() => {
    const d = dlgRef.current;
    if (!d) return;
    if (open && !d.open) {
      setVisibility("private");
      setPicked(null);
      setTitle("");
      setArtist("");
      setYear(String(new Date().getFullYear()));
      setError("");
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  // Free the previous object URL whenever the picture changes.
  useEffect(() => () => { if (picked) URL.revokeObjectURL(picked.url); }, [picked]);

  async function pick(file: File | undefined) {
    if (!file) return;
    try {
      const next = await loadImage(file);
      setError("");
      setPicked(next);
      setCrop(INITIAL_CROP);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked || !title.trim()) return;
    const by = [artist.trim() || "Unknown artist", year.trim()].filter(Boolean).join(", ");
    onUpload({ title: title.trim(), artist: by, src: renderCrop(picked.img, crop, OUTPUT_SIZE), visibility });
  }

  const browse = () => fileRef.current?.click();

  return (
    <dialog
      ref={dlgRef}
      className="m-auto max-h-[calc(100dvh_-_32px)] w-[min(460px,calc(100vw_-_32px))] rounded-2xl border border-line bg-panel p-0 text-ink shadow-[0_24px_60px_rgba(0,0,0,.35)] backdrop:bg-[rgba(8,11,18,.55)] backdrop:backdrop-blur-[3px]"
      aria-labelledby="upload-title"
      onClose={onClose}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false); }}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
    >
      <form className="grid gap-3.5 p-[18px]" onSubmit={submit}>
        <h2 id="upload-title" className="sr-only">Add your artwork</h2>

        <VisibilityToggle value={visibility} onChange={setVisibility} />

        {picked ? (
          <CropEditor img={picked.img} url={picked.url} crop={crop} onChange={setCrop} over={over} onReplace={browse} />
        ) : (
          <DropZone over={over} onBrowse={browse} />
        )}
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        {error && <p className="m-0 text-[.85rem] text-danger" role="alert">{error}</p>}

        <p className="m-0 flex gap-2 text-[.85rem] text-mute" aria-live="polite">
          <InfoIcon className="mt-px size-[18px]" />
          <span>{VISIBILITY_INFO[visibility]}</span>
        </p>

        <label className={FIELD}>
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled study" required className={INPUT} />
        </label>
        <div className="grid grid-cols-[1fr_96px] gap-2.5">
          <label className={FIELD}>
            <span>Artist</span>
            <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Your name" autoComplete="name" className={INPUT} />
          </label>
          <label className={FIELD}>
            <span>Year</span>
            <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" maxLength={9} className={INPUT} />
          </label>
        </div>

        <div className="mt-1 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!picked || !title.trim()}>Upload</Button>
        </div>
      </form>
    </dialog>
  );
}
