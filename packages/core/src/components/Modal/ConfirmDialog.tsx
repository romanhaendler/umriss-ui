import { useEffect, useRef } from "react";
import type { DialogHTMLAttributes, ReactNode } from "react";
import { mergeRefs } from "../../lib/mergeRefs";
import type { RefProp } from "../../lib/refProp";
import { Button } from "../Button";
import { Modal, ModalFooter, ModalHeader } from "./Modal";
import { useWording } from "../../lib/language";

/** The props of `ConfirmDialog`. */
export interface ConfirmDialogProps
  extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "open" | "onClose" | "title" | "children">,
    RefProp<HTMLDialogElement> {
  /** Whether the query stands. */
  open: boolean;
  /** Cancelling: Escape, cross, backdrop or the second button. */
  onClose: () => void;
  /** Agreeing. Called once per opening - a second press, however quick, does
      nothing, until `loading` ends with the dialog still open. The dialog does
      not close itself from that – whoever wants to show a confirmation in
      progress still needs it. A promise returned from it that settles (also
      by failing) with the dialog still open lets the confirmation be given
      again, without `loading`. */
  onConfirm: () => void | Promise<unknown>;
  /** The question, as a statement: "Delete invoice 2041?". */
  title: ReactNode;
  /** What about it cannot be taken back. The most important line of the
      dialog. */
  description?: ReactNode;
  /** Label of the agreeing button. Better is the verb of the action:
      "Delete" says what is about to happen.
      @default the wording's "Confirm" */
  confirmLabel?: string;
  /** Label of the cancelling button.
      @default the wording's "Cancel" */
  cancelLabel?: string;
  /** "danger" for destructive actions. */
  tone?: "primary" | "danger";
  /** Locks the actions, Escape and the backdrop while the confirmation is
      running. */
  loading?: boolean;
}

/** Compact confirmation dialog on the basis of Modal. */
export function ConfirmDialog({
  ref,
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
}: ConfirmDialogProps) {
  const wording = useWording();
  const own = useRef<HTMLDialogElement>(null);
  /* One agreement per opening; it can be given again after a `loading` that
     ended with the dialog still open. */
  const agreed = useRef(false);
  useEffect(() => {
    if (open && !loading) agreed.current = false;
  }, [open, loading]);
  /* The busy Confirm is disabled and lets the focus fall to the page; it
     stays in the dialog. */
  useEffect(() => {
    const dialog = own.current;
    if (!loading || !dialog) return;
    const active = document.activeElement;
    if (!dialog.contains(active) || (active as HTMLElement).matches(":disabled")) dialog.focus();
  }, [loading]);
  const stillOpen = useRef(open);
  useEffect(() => {
    stillOpen.current = open;
  }, [open]);
  const confirm = () => {
    if (!open || agreed.current) return;
    agreed.current = true;
    const result = onConfirm();
    /* A confirmation that settles with the dialog still open (it failed) can be given again. */
    if (result && typeof result.then === "function") {
      void result.then(
        () => {
          if (stillOpen.current) agreed.current = false;
        },
        (error: unknown) => {
          if (stillOpen.current) agreed.current = false;
          throw error;
        },
      );
    }
  };
  return (
    <Modal
      ref={mergeRefs(own, ref)}
      {...rest}
      open={open}
      onClose={loading ? () => {} : onClose}
      size="sm"
      closeOnBackdrop={!loading}
    >
      <ModalHeader title={title} description={description} hideClose />
      <ModalFooter>
        <Button onClick={() => open && onClose()} disabled={loading}>
          {cancelLabel ?? wording.cancel}
        </Button>
        <Button variant={tone} loading={loading} onClick={confirm}>
          {confirmLabel ?? wording.confirm}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
