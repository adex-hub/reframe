import { useEffect } from "react";
import { ActionMenu } from "@/components/action-menu";
import { PencilIcon, TrashIcon } from "@/components/icons";
import { cx } from "@/utils/cx";
import { useScrollEdges } from "../hooks/use-scroll-edges";
import type { Artwork } from "../types";

/** Gallery slots shown on wide screens; unfilled ones render as grey placeholders. */
const SLOTS = 11;

// Phones: a swipeable strip of artworks, with "Your artwork" pinned to its right so it's always in
// view. Wide screens: a 3-column grid that scrolls on its own; the strip and its wrapper become
// `contents` there, so their children are grid cells alongside the add button.
const GRID =
  "flex items-start gap-2.5 pt-3.5 pb-1.5 " +
  "lg:grid lg:auto-rows-max lg:grid-cols-3 lg:content-start lg:gap-5 lg:self-stretch lg:overflow-y-auto lg:overscroll-contain " +
  "lg:[scrollbar-color:var(--line)_transparent] lg:[scrollbar-width:thin] " +
  // Room for the selected outline and hover lift, which the scroll box would otherwise clip.
  "lg:-mt-1 lg:-mr-3 lg:-ml-1 lg:pt-1 lg:pr-3 lg:pb-6 lg:pl-1";
const STRIP =
  "flex snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:contents";
// Fades over the strip's edges, hinting that there are more artworks to swipe to.
const FADE = "pointer-events-none absolute inset-y-0 w-12 from-canvas to-transparent transition-opacity duration-200 lg:hidden";
const CELL = "relative w-[88px] flex-none snap-start lg:w-auto";
const LIFT = "lg:transition-transform lg:duration-150 lg:hover:-translate-y-0.5 motion-reduce:transition-none";
const CARD = "block overflow-hidden rounded-md border-2 border-transparent bg-panel p-0 text-left aria-pressed:border-accent";
const THUMB = "block h-[72px] bg-cover bg-center lg:aspect-square lg:h-auto";
const LABEL = "block truncate px-1.5 py-1 text-[.72rem] text-mute lg:px-2.5 lg:py-2 lg:text-[.82rem]";
const OVERLAY = "bg-[rgba(10,14,22,.62)] text-white backdrop-blur-[4px]";
// A quiet "⋯" at the end of the caption row, sized to match the visibility badge.
const MORE_BUTTON =
  "absolute right-1 bottom-1 grid size-5 place-items-center rounded-md text-mute *:size-3.5 " +
  "hover:bg-canvas hover:text-ink data-open:bg-canvas data-open:text-ink lg:right-2 lg:bottom-2 lg:size-6 lg:*:size-4";

type Props = {
  artworks: Artwork[];
  selected: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  /** Called with the id of an uploaded artwork. */
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
};

export function GalleryGrid({ artworks, selected, onSelect, onAdd, onEdit, onDelete, className }: Props) {
  const strip = useScrollEdges<HTMLDivElement>();

  // Keep the selected picture in view, e.g. after an upload is appended off the end of the strip.
  useEffect(() => {
    strip.ref.current?.children[selected]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [selected, strip.ref]);

  return (
    <div className={cx(GRID, className)} role="group" aria-label="Choose a picture">
      <div className="relative min-w-0 flex-1 lg:contents">
        <div ref={strip.ref} className={STRIP}>
          {artworks.map((a, i) => (
            <div key={a.id ?? a.src} className={cx(CELL, LIFT)}>
              <button className={cx(CARD, "w-full")} aria-pressed={i === selected} onClick={() => onSelect(i)}>
                <span className={THUMB} style={{ backgroundImage: `url("${a.src}")` }} />
                {a.visibility && (
                  <em className={`absolute top-1.5 left-1.5 rounded-[20px] px-[7px] py-px text-[.66rem] leading-[1.6] font-semibold not-italic ${OVERLAY}`}>
                    {a.visibility === "public" ? "Public" : "Private"}
                  </em>
                )}
                {/* Leave room on the right for the "⋯" button. */}
                <small className={cx(LABEL, a.id && "pr-6 lg:pr-9")}>{a.title}</small>
              </button>
              {a.id && (
                <ActionMenu
                  label={`More actions for ${a.title}`}
                  className={MORE_BUTTON}
                  items={[
                    { label: "Edit details", icon: <PencilIcon className="size-4" />, onSelect: () => onEdit(a.id!) },
                    { label: "Delete", icon: <TrashIcon className="size-4" />, danger: true, onSelect: () => onDelete(a.id!) },
                  ]}
                />
              )}
            </div>
          ))}
          {Array.from({ length: Math.max(0, SLOTS - artworks.length) }, (_, i) => (
            <div key={`ph${i}`} className={cx(CELL, CARD, "hidden cursor-default lg:block")} aria-hidden="true">
              <span className={cx(THUMB, "bg-line opacity-55")} />
              <small className={LABEL}>Coming soon</small>
            </div>
          ))}
        </div>
        <span className={cx(FADE, "left-0 bg-linear-to-r", !strip.before && "opacity-0")} aria-hidden="true" />
        <span className={cx(FADE, "right-0 bg-linear-to-l", !strip.after && "opacity-0")} aria-hidden="true" />
      </div>
      <button className={cx(CELL, LIFT, CARD)} aria-label="Add your own artwork" onClick={onAdd}>
        <span className={cx(THUMB, "grid place-items-center bg-canvas text-[2rem] text-mute")}>+</span>
        <small className={LABEL}>Your artwork</small>
      </button>
    </div>
  );
}
