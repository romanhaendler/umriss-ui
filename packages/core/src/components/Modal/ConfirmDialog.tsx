import { forwardRef } from "react";
import type { DialogHTMLAttributes, ReactNode } from "react";
import { Button } from "../Button";
import { Modal, ModalFooter, ModalHeader } from "./Modal";
import { useWording } from "../../lib/language";

export interface ConfirmDialogProps
  extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "title" | "children"> {
  /** Whether the query stands. */
  open: boolean;
  /** Cancelling: Escape, cross, backdrop or the second button. */
  onClose: () => void;
  /** Agreeing. The dialog does not close itself from that – whoever wants to
      show a confirmation in progress still needs it. */
  onConfirm: () => void;
  /** The question, as a statement: "Delete invoice 2041?". */
  title: ReactNode;
  /** What about it cannot be taken back. The most important line of the
      dialog. */
  description?: ReactNode;
  /** Label of the agreeing button; the wording's confirm text by default.
      Better is the verb of the action: "Delete" says what is about to
      happen. */
  confirmLabel?: string;
  /** Label of the cancelling button; the wording's cancel text by default. */
  cancelLabel?: string;
  /** "danger" for destructive actions. */
  tone?: "primary" | "danger";
  /** Locks the actions while the confirmation is running. */
  loading?: boolean;
}

/** Compact confirmation dialog on the basis of Modal. */
export const ConfirmDialog = forwardRef<HTMLDialogElement, ConfirmDialogProps>(function ConfirmDialog(
  {
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel,
    cancelLabel,
    tone = "primary",
    loading = false,
    ...rest
  },
  ref,
) {
  const wording = useWording();
  return (
    <Modal ref={ref} {...rest} open={open} onClose={onClose} size="sm" closeOnBackdrop={!loading}>
      <ModalHeader title={title} description={description} hideClose />
      <ModalFooter>
        <Button onClick={onClose} disabled={loading}>
          {cancelLabel ?? wording.cancel}
        </Button>
        <Button variant={tone} loading={loading} onClick={onConfirm}>
          {confirmLabel ?? wording.confirm}
        </Button>
      </ModalFooter>
    </Modal>
  );
});
