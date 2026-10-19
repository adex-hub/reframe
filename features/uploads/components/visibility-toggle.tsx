import type { Visibility } from "@/features/gallery";

const OPTIONS: { value: Visibility; label: string }[] = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
];

export function VisibilityToggle({ value, onChange }: { value: Visibility; onChange: (v: Visibility) => void }) {
  return (
    <div className="grid grid-cols-2 rounded-xl border border-line bg-canvas p-1" role="radiogroup" aria-label="Who can see it">
      {OPTIONS.map((o) => (
        <label key={o.value} className="relative">
          <input
            type="radio"
            name="visibility"
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="peer absolute inset-0 m-0 cursor-pointer opacity-0"
          />
          <span
            className={
              "grid min-h-[38px] place-items-center rounded-[9px] font-semibold text-mute transition-colors duration-150 " +
              "peer-checked:bg-panel peer-checked:text-ink peer-checked:shadow-[0_1px_3px_rgba(0,0,0,.18)] " +
              "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent peer-focus-visible:outline-solid"
            }
          >
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}
