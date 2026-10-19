"use client";

import { useId } from "react";
import { Button } from "./button";
import { Modal } from "./modal";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Small yes/no dialog for destructive actions. Cancel comes first, so it gets the initial focus. */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: Props) {
  const id = useId();
  return (
    <Modal open={open} onClose={onCancel} aria-labelledby={`${id}-title`} aria-describedby={`${id}-msg`} className="w-[min(380px,calc(100vw_-_32px))]">
      <div className="grid gap-2 p-[18px]">
        <h2 id={`${id}-title`} className="m-0 text-[1.05rem] font-semibold">{title}</h2>
        <p id={`${id}-msg`} className="m-0 text-[.9rem] text-mute">{message}</p>
        <div className="mt-3 flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
