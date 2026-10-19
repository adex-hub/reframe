"use client";

import { useEffect, useRef } from "react";
import { cx } from "@/utils/cx";

type Props = Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose"> & {
  open: boolean;
  /** Called for Esc and for programmatic closes; the parent should set `open` to false. */
  onClose: () => void;
};

/** Native modal <dialog>: focus trap, Esc to close and a backdrop for free. */
export function Modal({ open, onClose, className, children, ...rest }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={cx(
        "m-auto max-h-[calc(100dvh_-_32px)] w-[min(460px,calc(100vw_-_32px))] rounded-2xl border border-line bg-panel p-0 text-ink",
        "shadow-[0_24px_60px_rgba(0,0,0,.35)] backdrop:bg-[rgba(8,11,18,.55)] backdrop:backdrop-blur-[3px]",
        className,
      )}
      {...rest}
    >
      {children}
    </dialog>
  );
}
