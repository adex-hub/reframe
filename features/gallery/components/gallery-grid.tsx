import { cx } from "@/utils/cx";
import type { Artwork } from "../types";

/** Gallery slots shown on wide screens; unfilled ones render as grey placeholders. */
const SLOTS = 11;

// Phones: a horizontal strip. Wide screens: a 3-column grid that scrolls on its own.
const GRID =
  "flex gap-2.5 overflow-x-auto pt-3.5 pb-1.5 " +
  "lg:grid lg:auto-rows-max lg:grid-cols-3 lg:content-start lg:gap-5 lg:self-stretch lg:overflow-y-auto lg:overscroll-contain " +
  "lg:[scrollbar-color:var(--line)_transparent] lg:[scrollbar-width:thin] " +
  // Room for the selected outline and hover lift, which the scroll box would otherwise clip.
  "lg:-mt-1 lg:-mr-3 lg:-ml-1 lg:pt-1 lg:pr-3 lg:pb-6 lg:pl-1";
const ITEM = "relative w-[88px] flex-none overflow-hidden rounded-md border-2 border-transparent bg-panel p-0 text-left lg:w-auto";
const LIFT = "aria-pressed:border-accent lg:transition-[transform,border-color] lg:duration-150 lg:hover:-translate-y-0.5 motion-reduce:transition-none";
const THUMB = "block h-[72px] bg-cover bg-center lg:aspect-square lg:h-auto";
const LABEL = "block truncate px-1.5 py-1 text-[.72rem] text-mute lg:px-2.5 lg:py-2 lg:text-[.82rem]";

type Props = {
  artworks: Artwork[];
  selected: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  className?: string;
};

export function GalleryGrid({ artworks, selected, onSelect, onAdd, className }: Props) {
  return (
    <div className={cx(GRID, className)} role="group" aria-label="Choose a picture">
      {artworks.map((a, i) => (
        <button key={a.src.slice(0, 40) + i} className={cx(ITEM, LIFT)} aria-pressed={i === selected} onClick={() => onSelect(i)}>
          <span className={THUMB} style={{ backgroundImage: `url("${a.src}")` }} />
          {a.visibility && (
            <em className="absolute top-1.5 left-1.5 rounded-[20px] bg-[rgba(10,14,22,.62)] px-[7px] py-px text-[.66rem] leading-[1.6] font-semibold text-white not-italic backdrop-blur-[4px]">
              {a.visibility === "public" ? "Public" : "Private"}
            </em>
          )}
          <small className={LABEL}>{a.title}</small>
        </button>
      ))}
      {Array.from({ length: Math.max(0, SLOTS - artworks.length) }, (_, i) => (
        <div key={`ph${i}`} className={cx(ITEM, "hidden cursor-default lg:block")} aria-hidden="true">
          <span className={cx(THUMB, "bg-line opacity-55")} />
          <small className={LABEL}>Coming soon</small>
        </div>
      ))}
      <button className={cx(ITEM, LIFT)} aria-label="Add your own artwork" onClick={onAdd}>
        <span className={cx(THUMB, "grid place-items-center bg-canvas text-[2rem] text-mute")}>+</span>
        <small className={LABEL}>Your artwork</small>
      </button>
    </div>
  );
}
