import type { Artwork } from "../types";

export function ArtworkCaption({ artwork }: { artwork: Artwork }) {
  return (
    <div className="mt-2.5 mb-3 lg:mt-0">
      <h2 className="m-0 font-serif text-[1.15rem] leading-[normal] font-normal italic">{artwork.title}</h2>
      <p className="m-0 text-[.85rem] text-mute">{artwork.artist}</p>
    </div>
  );
}
