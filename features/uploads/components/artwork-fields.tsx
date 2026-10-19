import type { ArtworkDetails } from "../types";

const FIELD = "grid min-w-0 gap-1 text-[.8rem] font-semibold text-mute";
const INPUT =
  "min-h-11 w-full min-w-0 rounded-[10px] border border-line bg-canvas px-3 font-sans text-base leading-[normal] font-normal text-ink focus:border-accent focus:outline-none";

/** Title, artist and year inputs, shared by the upload and edit modals. */
export function ArtworkFields({ value, onChange }: { value: ArtworkDetails; onChange: (v: ArtworkDetails) => void }) {
  const set = (key: keyof ArtworkDetails) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [key]: e.target.value });

  return (
    <>
      <label className={FIELD}>
        <span>Title</span>
        <input value={value.title} onChange={set("title")} placeholder="Untitled study" required className={INPUT} />
      </label>
      <div className="grid grid-cols-[1fr_96px] gap-2.5">
        <label className={FIELD}>
          <span>Artist</span>
          <input value={value.artistName} onChange={set("artistName")} placeholder="Name" className={INPUT} />
        </label>
        <label className={FIELD}>
          <span>Year</span>
          <input value={value.year} onChange={set("year")} inputMode="numeric" maxLength={9} className={INPUT} />
        </label>
      </div>
    </>
  );
}
