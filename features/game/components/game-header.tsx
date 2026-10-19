import { Logo } from "@/components/logo";
import { cx } from "@/utils/cx";

/** Full-width bar: logo on the left, whatever controls are passed in on the right. */
export function GameHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <header className={cx("flex items-center justify-between gap-2 lg:mb-6 lg:border-b lg:border-line lg:pb-5", className)}>
      <Logo />
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
