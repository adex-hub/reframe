"use client";

import { useState } from "react";
import { ARTWORKS, ArtworkCaption, GalleryGrid, type Artwork } from "@/features/gallery";
import { PuzzleBoard, PuzzleControls, PuzzleTimer, WinBanner, usePuzzle } from "@/features/puzzle";
import { ThemeToggle } from "@/features/theme";
import { UploadModal, useUploads, type UploadedArtwork } from "@/features/uploads";
import { GameHeader } from "./game-header";

export function Game() {
  const [size, setSize] = useState(3);
  const [selected, setSelected] = useState(0);
  const [adding, setAdding] = useState(false);
  const [live, setLive] = useState("");
  const { uploads, add } = useUploads();

  const artworks: Artwork[] = [...ARTWORKS, ...uploads];
  const art = artworks[Math.min(selected, artworks.length - 1)];
  const puzzle = usePuzzle({ size, puzzleKey: art.src, keyboard: !adding, announce: setLive });

  function addUpload(u: UploadedArtwork) {
    const saved = add(u);
    setSelected(artworks.length);
    setAdding(false);
    setLive(saved ? `${u.title} added` : `${u.title} added, but there's no room to save it on this device. It will be gone after a reload.`);
  }

  return (
    <main
      className={
        // Wide screens: header across the top, gallery left, puzzle right. The page itself never
        // scrolls; only the gallery does, so the header and timer stay in view.
        "mx-auto max-w-[560px] px-4 pt-4 pb-8 " +
        "lg:grid lg:h-dvh lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_var(--stage)] lg:grid-rows-[auto_minmax(0,1fr)] " +
        "lg:items-start lg:gap-x-12 lg:px-8 lg:pt-6 lg:pb-0 lg:[--stage:clamp(380px,calc(100vh_-_300px),560px)]"
      }
    >
      <GameHeader className="lg:col-span-2">
        <PuzzleTimer secs={puzzle.secs} />
        <ThemeToggle />
      </GameHeader>

      <GalleryGrid className="lg:col-start-1 lg:row-start-2" artworks={artworks} selected={selected} onSelect={setSelected} onAdd={() => setAdding(true)} />
      <UploadModal open={adding} onClose={() => setAdding(false)} onUpload={addUpload} />

      <section className="lg:col-start-2 lg:row-start-2 lg:max-h-full lg:overflow-y-auto lg:pb-6">
        <ArtworkCaption artwork={art} />
        <PuzzleBoard size={size} tiles={puzzle.tiles} image={art.src} done={puzzle.done} onTap={puzzle.tap} />
        <PuzzleControls moves={puzzle.moves} size={size} onSizeChange={setSize} onUndo={puzzle.undo} onReshuffle={puzzle.reset} />
        {puzzle.done && (
          <WinBanner
            secs={puzzle.secs}
            moves={puzzle.moves}
            credit={`${art.title}, ${art.artist}`}
            onNext={() => setSelected((selected + 1) % artworks.length)}
          />
        )}
        <p className="mt-4 text-[.8rem] text-mute">Tap a tile to slide it, or use the arrow keys.</p>
      </section>
      <div className="sr-only" aria-live="polite">{live}</div>
    </main>
  );
}
