"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import type { ArtworkDetails, UploadedArtwork } from "../types";
import { ArtworkFields } from "./artwork-fields";

type Props = {
  /** The upload being edited; null keeps the modal closed. */
  artwork: UploadedArtwork | null;
  onClose: () => void;
  onSave: (id: string, details: ArtworkDetails) => void;
};

/** Change an upload's title, artist and year. The picture itself stays as cropped. */
export function EditArtworkModal({ artwork, onClose, onSave }: Props) {
  const [details, setDetails] = useState<ArtworkDetails>({ title: "", artistName: "", year: "" });

  useEffect(() => {
    if (artwork) setDetails({ title: artwork.title, artistName: artwork.artistName, year: artwork.year });
  }, [artwork]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (artwork && details.title.trim()) onSave(artwork.id, details);
  }

  return (
    <Modal open={!!artwork} onClose={onClose} aria-labelledby="edit-title">
      <form className="grid gap-3.5 p-[18px]" onSubmit={submit}>
        <div className="flex items-center gap-3">
          {artwork && <span className="size-14 flex-none rounded-lg bg-cover bg-center" style={{ backgroundImage: `url("${artwork.src}")` }} aria-hidden="true" />}
          <div className="min-w-0">
            <h2 id="edit-title" className="m-0 text-[1.05rem] font-semibold">Edit details</h2>
            <p className="m-0 truncate text-[.85rem] text-mute">{artwork?.visibility === "public" ? "Public" : "Private"} artwork</p>
          </div>
        </div>

        <ArtworkFields value={details} onChange={setDetails} />

        <div className="mt-1 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!details.title.trim()}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}
