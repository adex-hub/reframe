import type { Artwork } from "../types";

/** `action` sits at the right end of the caption, e.g. the sound toggle. */
export function ArtworkCaption({ artwork, action }: { artwork: Artwork; action?: React.ReactNode }) {
  return (
    <div className="mt-2.5 mb-3 flex items-center gap-3 lg:mt-0">
      <div className="min-w-0 flex-1">
        <h2 className="m-0 font-serif text-[1.15rem] leading-[normal] font-normal italic">{artwork.title}</h2>
        <p className="m-0 text-[.85rem] text-mute">{artwork.artist}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
