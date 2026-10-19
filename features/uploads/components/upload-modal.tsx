"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { InfoIcon } from "@/components/icons";
import { Modal } from "@/components/modal";
import type { Visibility } from "@/features/gallery";
import { OUTPUT_SIZE, VISIBILITY_INFO } from "../constants";
import { INITIAL_CROP, renderCrop, type Crop } from "../lib/crop";
import { loadImage } from "../lib/load-image";
import type { ArtworkDetails, NewUpload } from "../types";
import { ArtworkFields } from "./artwork-fields";
import { CropEditor } from "./crop-editor";
import { DropZone } from "./drop-zone";
import { VisibilityToggle } from "./visibility-toggle";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpload: (upload: NewUpload) => void;
};

const freshDetails = (): ArtworkDetails => ({ title: "", artistName: "", year: String(new Date().getFullYear()) });

export function UploadModal({ open, onClose, onUpload }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [visibility, setVisibility] = useState<Visibility>("private");
  const [picked, setPicked] = useState<{ img: HTMLImageElement; url: string } | null>(null);
  const [crop, setCrop] = useState<Crop>(INITIAL_CROP);
  const [details, setDetails] = useState(freshDetails);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");

  // Start fresh each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setVisibility("private");
    setPicked(null);
    setDetails(freshDetails());
    setError("");
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
    if (!picked || !details.title.trim()) return;
    onUpload({ ...details, src: renderCrop(picked.img, crop, OUTPUT_SIZE), visibility });
  }

  const browse = () => fileRef.current?.click();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="upload-title"
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

        <ArtworkFields value={details} onChange={setDetails} />

        <div className="mt-1 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!picked || !details.title.trim()}>Upload</Button>
        </div>
      </form>
    </Modal>
  );
}
