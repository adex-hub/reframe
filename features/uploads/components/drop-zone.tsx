import { UploadIcon } from "@/components/icons";
import { cx } from "@/utils/cx";
import { IMAGE_AREA } from "../constants";

/** Empty state of the image area. The drop itself is handled by the whole modal. */
export function DropZone({ over, onBrowse }: { over: boolean; onBrowse: () => void }) {
  return (
    <button
      type="button"
      className={cx(
        IMAGE_AREA,
        "grid place-content-center justify-items-center gap-1 border-dashed border-line transition-colors duration-150 hover:border-accent",
        over && "border-accent bg-[color-mix(in_srgb,var(--acc)_10%,var(--bg))]",
      )}
      onClick={onBrowse}
    >
      <UploadIcon className="mb-1.5 size-7 text-mute" />
      <strong>Drop an image here</strong>
      <small className="text-mute">or click to browse your files</small>
    </button>
  );
}
