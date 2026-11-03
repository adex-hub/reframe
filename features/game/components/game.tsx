"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ARTWORKS, ArtworkCaption, GalleryGrid, useStartPicture, type Artwork } from "@/features/gallery";
import { GRID_SIZES, HintToggle, PlayTip, PuzzleBoard, PuzzleControls, PuzzleTimer, WinBanner, useBest, useHints, usePuzzle } from "@/features/puzzle";
import { SoundToggle, useSound } from "@/features/sound";
import { ThemeToggle } from "@/features/theme";
import { EditArtworkModal, UploadModal, useUploads, type ArtworkDetails, type NewUpload, type UploadedArtwork } from "@/features/uploads";
import { cx } from "@/utils/cx";
import { GameHeader } from "./game-header";

export function Game() {
  const [size, setSize] = useState(3);
  const [picked, setSelected] = useStartPicture(ARTWORKS.length);
  // Until the random first picture is picked, the puzzle area stays invisible so the default can't flash.
  const ready = picked !== null;
  const selected = picked ?? 0;
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<UploadedArtwork | null>(null);
  const [deleting, setDeleting] = useState<UploadedArtwork | null>(null);
  const [live, setLive] = useState("");
  const { uploads, add, update, remove } = useUploads();

  const artworks: Artwork[] = [...ARTWORKS, ...uploads];
  const art = artworks[Math.min(selected, artworks.length - 1)];
  const modalOpen = adding || !!editing || !!deleting;
  const puzzle = usePuzzle({ size, puzzleKey: art.src, keyboard: !modalOpen, announce: setLive });
  const hints = useHints({ size, round: puzzle.round, locked: puzzle.done });
  const bestLine = useBest({ size, round: puzzle.round, done: puzzle.done, secs: puzzle.secs, moves: puzzle.moves, hinted: hints.used });
  const nextSize = GRID_SIZES[GRID_SIZES.indexOf(size) + 1];
  const sound = useSound({ src: art.src, tiles: puzzle.tiles, slides: puzzle.slides, bumps: puzzle.bumps, done: puzzle.done });

  const findUpload = (id: string) => uploads.find((u) => u.id === id) ?? null;
  const unsaved = " It couldn't be saved on this device, so it will be lost after a reload.";

  function addUpload(u: NewUpload) {
    const saved = add(u);
    setSelected(artworks.length);
    setAdding(false);
    setLive(`${u.title.trim()} added.${saved ? "" : unsaved}`);
  }

  function saveEdit(id: string, details: ArtworkDetails) {
    const saved = update(id, details);
    setEditing(null);
    setLive(`Changes saved.${saved ? "" : unsaved}`);
  }

  function confirmDelete() {
    if (!deleting) return;
    const index = artworks.findIndex((a) => a.id === deleting.id);
    remove(deleting.id);
    // Keep the same picture selected; if it was the deleted one, fall back to the one before it.
    if (selected >= index) setSelected(Math.max(0, selected - 1));
    setDeleting(null);
    setLive(`${deleting.title} deleted.`);
  }

  return (
    <main
      className={
        // Wide screens: header across the top, gallery left, puzzle right. The page itself never
        // scrolls; only the gallery does, so the header and timer stay in view.
        // Short landscape (phones on their side): the board is pinned on the left at full height
        // (see below), and everything else runs down the right, past the notch on either side.
        "mx-auto max-w-[560px] px-4 pt-4 pb-8 " +
        "short:max-w-none short:pt-3 short:pr-[max(1rem,env(safe-area-inset-right))] short:pl-[calc(100dvh+max(1rem,env(safe-area-inset-left)))] " +
        "lg:grid lg:h-dvh lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_var(--stage)] lg:grid-rows-[auto_minmax(0,1fr)] " +
        "lg:items-start lg:gap-x-12 lg:px-8 lg:pt-6 lg:pb-0 lg:[--stage:clamp(380px,calc(100vh_-_300px),560px)]"
      }
    >
      <GameHeader className="lg:col-span-2">
        <PuzzleTimer secs={puzzle.secs} />
        <ThemeToggle />
      </GameHeader>

      <GalleryGrid
        className="lg:col-start-1 lg:row-start-2"
        artworks={artworks}
        selected={ready ? selected : -1}
        onSelect={setSelected}
        onAdd={() => setAdding(true)}
        onEdit={(id) => setEditing(findUpload(id))}
        onDelete={(id) => setDeleting(findUpload(id))}
      />
      <UploadModal open={adding} onClose={() => setAdding(false)} onUpload={addUpload} />
      <EditArtworkModal artwork={editing} onClose={() => setEditing(null)} onSave={saveEdit} />
      <ConfirmDialog
        open={!!deleting}
        title={`Delete “${deleting?.title ?? ""}”?`}
        message="It will be removed from your gallery on this device. This can't be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      {/* The column scrolls on wide screens, which clips anything past its edges. The padding (cancelled
          out by the negative margin) leaves room for focus outlines on buttons at the edge. */}
      <section
        className={cx(
          "lg:col-start-2 lg:row-start-2 lg:-mx-1.5 lg:-mt-1.5 lg:max-h-full lg:overflow-y-auto lg:px-1.5 lg:pt-1.5 lg:pb-6",
          !ready && "invisible",
        )}
      >
        <ArtworkCaption
          artwork={art}
          action={
            <>
              {hints.available && <HintToggle on={hints.on} disabled={puzzle.done} onToggle={hints.toggle} />}
              <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />
            </>
          }
        />
        {/* Short landscape: pinned to the left edge, as tall as the screen allows, so the whole picture stays in view. */}
        <div className="short:fixed short:top-3 short:left-[max(1rem,env(safe-area-inset-left))] short:w-[calc(100dvh-1.5rem)]">
          <PuzzleBoard size={size} tiles={puzzle.tiles} image={art.src} done={puzzle.done} hints={hints.shown} onTap={puzzle.tap} />
        </div>
        <PuzzleControls moves={puzzle.moves} size={size} onSizeChange={setSize} onUndo={puzzle.undo} onReshuffle={puzzle.reset} />
        {puzzle.done && (
          <WinBanner
            secs={puzzle.secs}
            moves={puzzle.moves}
            hints={hints.available ? (hints.used ? "used" : "unused") : undefined}
            best={bestLine}
            nextSize={nextSize}
            onNext={() => setSelected((selected + 1) % artworks.length)}
            onTrySize={setSize}
          />
        )}
        {!puzzle.done && <PlayTip moved={puzzle.started} />}
      </section>
      <div className="sr-only" aria-live="polite">{live}</div>
    </main>
  );
}
