import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { cx } from "@/utils/cx";

/**
 * How to play, for mouse and keyboard only: on touch screens tapping a tile is obvious.
 * It's onboarding, so it fades away with the first move.
 */
export function PlayTip({ moved }: { moved: boolean }) {
  return (
    <p
      className={cx(
        "mt-4 hidden items-center gap-1.5 text-[.8rem] text-mute pointer-fine:flex",
        "transition-[opacity,visibility] duration-500 motion-reduce:transition-none",
        moved && "invisible opacity-0",
      )}
    >
      <Icon icon={InformationCircleIcon} className="size-4" />
      Click a tile to slide it, or use the arrow keys.
    </p>
  );
}
