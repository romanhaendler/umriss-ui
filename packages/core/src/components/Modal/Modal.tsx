import { createContext, forwardRef, useContext, useId, useRef } from "react";
import { useDialogChoreography } from "../../lib/dialogChoreography";
import type { DialogHTMLAttributes, HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import styles from "./Modal.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";

interface ModalContextValue {
  onClose: () => void;
  /** The id the header's heading carries - the dialog is named by it. */
  titleId: string;
}

const ModalContext = createContext<ModalContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Modal – on the basis of the native <dialog>: focus trap, Escape and */
/* scroll lock come from the browser, we supply only the looks.        */
/* ------------------------------------------------------------------ */

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "onClose"> {
  /** Whether the window stands. Controlled: the opening is the caller's
      decision, and only the caller knows whether something may be open. */
  open: boolean;
  /** Reports every wish to close – Escape, cross, backdrop click. */
  onClose: () => void;
  /** The width of the window. The height comes from the content; only the
      body scrolls, header and footer stand fast. */
  size?: ModalSize;
  /** Closes on a click on the backdrop. Default: true. */
  closeOnBackdrop?: boolean;
}

export const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  { open, onClose, size = "md", closeOnBackdrop = true, className, children, onCancel, onMouseDown, ...rest },
  ref,
) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  /* Exit after `--u-duration-exit`: a sheet of paper taking its leave. The
     name stands here and not in the hook, because it belongs to the Modal -
     the palette chooses the same routine without an exit. Here `160` stood
     beside `160ms` in the stylesheet (library-audit 07). */
  const { dialogRef, closing, beimSchliessen: handleDialogClose, beimAbbrechen: handleDialogCancel } =
    useDialogChoreography(open, "--u-duration-exit", onClose);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    onMouseDown?.(event);
    if (event.defaultPrevented) return;
    // The dialog is an invisible full-screen container (including the
    // spacers); everything outside the modal surface counts as backdrop.
    if (closeOnBackdrop && sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  return (
    <dialog
      ref={mergeRefs(dialogRef, ref)}
      className={cx(styles.dialog, className)}
      /* The heading of the header names the window. A <dialog> takes no name
         from its content, so without this it said only "dialog" - what the
         header's `title` promises is only true with the reference. */
      aria-labelledby={titleId}
      {...rest}
      /* After `rest` and composed with the caller's: a caller's `onCancel` or
         `onMouseDown` would otherwise take Escape's exit or the backdrop's
         closing away from the window (P3 of core-passthrough). */
      data-closing={closing || undefined}
      onClose={handleDialogClose}
      onCancel={(event) => {
        onCancel?.(event);
        if (!event.defaultPrevented) handleDialogCancel(event);
      }}
      onMouseDown={handleBackdropClick}
    >
      {/* Free space distributes itself in the golden ratio (38 : 62) above and
          below the surface: small modals sit in the upper third, long ones use
          the full height – above as well as below. */}
      <div className={styles.spacerTop} aria-hidden="true" />
      <div ref={sheetRef} className={cx(styles.sheet, styles[size])}>
        <ModalContext.Provider value={{ onClose, titleId }}>{children}</ModalContext.Provider>
      </div>
      <div className={styles.spacerBottom} aria-hidden="true" />
    </dialog>
  );
});

/* ------------------------------------------------------------------ */
/* ModalHeader                                                         */
/* ------------------------------------------------------------------ */

export interface ModalHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The heading of the window. It names it for the screen reader at the same
      time – a dialog without a name says only "dialog". */
  title: ReactNode;
  /** One sentence below the heading: what is to be decided here. */
  description?: ReactNode;
  /** Hides the close button. */
  hideClose?: boolean;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(function ModalHeader(
  { title, description, hideClose = false, className, ...rest },
  ref,
) {
  const modal = useContext(ModalContext);
  const wording = useWording();

  return (
    <div ref={ref} className={cx(styles.header, className)} {...rest}>
      <div className={styles.headerText}>
        <h2 id={modal?.titleId} className={styles.title}>
          {title}
        </h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {!hideClose && (
        <button
          type="button"
          className={styles.close}
          aria-label={wording.close}
          onClick={() => modal?.onClose()}
        >
          <CrossGlyph size={12} />
        </button>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* ModalBody / ModalFooter                                             */
/* ------------------------------------------------------------------ */

export const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ModalBody(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx(styles.body, className)} {...rest}>
      {children}
    </div>
  );
});

export const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ModalFooter(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx(styles.footer, className)} {...rest}>
      {children}
    </div>
  );
});
