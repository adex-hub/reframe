import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cx } from "@/utils/cx";

/** A Hugeicons icon with the app's defaults: 20px, current text colour, hidden from screen readers. */
export function Icon({ icon, className }: { icon: IconSvgElement; className?: string }) {
  return <HugeiconsIcon icon={icon} strokeWidth={1.8} className={cx("size-5 shrink-0", className)} aria-hidden="true" />;
}
