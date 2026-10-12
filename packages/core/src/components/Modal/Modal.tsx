import { createContext, useContext, useId, useRef } from "react";
import { useDialogChoreography } from "../../lib/dialogChoreography";
import type { DialogHTMLAttributes, HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { SurfaceSizeReset } from "../../lib/controlSize";
import { mergeRefs } from "../../lib/mergeRefs";
import type { RefProp } from "../../lib/refProp";
import styles from "./Modal.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";
import { IconButton } from "../Button";

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

/** The width of a `Modal`. */
export type ModalSize = "sm" | "md" | "lg";

/** The props of `Modal`: a native dialog's attributes, controlled through
    `open` and `onClose`. */
export interface ModalProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "onClose">, RefProp<HTMLDialogElement> {
  /** Whether the window stands. Controlled: the opening is the caller's
      decision, and only the caller knows whether something may be open. */
  open: boolean;
  /** Reports every wish to close – Escape, cross, backdrop click. */
  onClose: () => void;
  /** The width of the window. The height comes from the content; only the
      body scrolls, header and footer stand fast. */
  size?: ModalSize;
  /** Closes on a click on the backdrop. */
  closeOnBackdrop?: boolean;
}

/* The Modal and the Drawer are one dialog in two placements: the frame below
   holds the choreography, the backdrop and the name, and each of the two says
   only where its sheet stands. */
/** A dialog window in the middle of the screen, on the native `<dialog>`:
    focus trap, Escape and scroll lock come from the browser. Controlled through
    `open` and `onClose`; inside it stand `ModalHeader`, `ModalBody` and
    `ModalFooter`. */
export function Modal({ ref, size = "md", closeOnBackdrop = true, ...rest }: ModalProps) {
  return (
    <DialogFrame
      ref={ref}
      sheetClassName={cx(styles.sheet, styles[size])}
      spacers
      closeOnBackdrop={closeOnBackdrop}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Drawer – the same dialog, entering from an edge.                    */
/* ------------------------------------------------------------------ */

/** The props of `Drawer`: a `Modal`'s, with `side` in place of `size`. */
export interface DrawerProps extends Omit<ModalProps, "size"> {
  /** The edge the drawer stands at and enters from. */
  side?: "right" | "left";
}

/* A drawer is a Modal that stands at an edge instead of in the middle: the
   same <dialog>, so the focus trap, Escape, the scroll lock and the return of
   the focus are the browser's, and the same head, body and foot inside it.
   It is modal on purpose - a panel beside the page that leaves the page
   operable is layout, not an overlay. Its width is the token
   `--u-drawer-width`, which an application or one drawer's `style`
   overrides. */
/** A `Modal` that stands at an edge of the window and enters from it - the
    same dialog with the same head, body and foot. Its width is the token
    `--u-drawer-width`. */
export function Drawer({ ref, side = "right", className, ...rest }: DrawerProps) {
  return (
    <DialogFrame
      ref={ref}
      className={cx(styles.drawer, className)}
      sheetClassName={styles.drawerSheet}
      side={side}
      {...rest}
    />
  );
}

interface DialogFrameProps extends Omit<ModalProps, "size"> {
  sheetClassName?: string;
  /** The golden-ratio spacers of the centred sheet; a drawer has none. */
  spacers?: boolean;
  side?: "right" | "left";
}

function DialogFrame({
  ref,
  open,
  onClose,
  closeOnBackdrop = true,
  sheetClassName,
  spacers = false,
  side,
  className,
  children,
  onCancel,
  onMouseDown,
  ...rest
}: DialogFrameProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  /* Exit after `--u-duration-exit`, read from the token the stylesheet uses.
     The name belongs to the Modal; the palette uses the same routine without
     an exit. */
  const { dialogRef, closing, onDialogClose: handleDialogClose, onDialogCancel: handleDialogCancel } =
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
      /* The heading of the header names the window: a <dialog> takes no name
         from its content. */
      aria-labelledby={titleId}
      {...rest}
      /* After `rest` and composed with the caller's, so that a caller's
         `onCancel` or `onMouseDown` cannot take Escape's exit or the
         backdrop's closing away. */
      data-side={side}
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
      {spacers && <div className={styles.spacerTop} aria-hidden="true" />}
      <div ref={sheetRef} className={sheetClassName}>
        {/* A dialog keeps a dialog's controls, whatever size the place it
            was opened from has (ADR-0041). */}
        <SurfaceSizeReset>
          <ModalContext.Provider value={{ onClose, titleId }}>{children}</ModalContext.Provider>
        </SurfaceSizeReset>
      </div>
      {spacers && <div className={styles.spacerBottom} aria-hidden="true" />}
    </dialog>
  );
}

/* ------------------------------------------------------------------ */
/* ModalHeader                                                         */
/* ------------------------------------------------------------------ */

/** The props of `ModalHeader`: a div's attributes, with `title` taking a node
    instead of the HTML attribute. */
export interface ModalHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title">, RefProp<HTMLDivElement> {
  /** The heading of the window. It names it for the screen reader at the same
      time – a dialog without a name says only "dialog". */
  title: ReactNode;
  /** One sentence below the heading: what is to be decided here. */
  description?: ReactNode;
  /** Hides the close button. */
  hideClose?: boolean;
}

/** The head of a `Modal` or `Drawer`: its title, which names the dialog for a
    screen reader, an optional sentence below it, and the close cross. */
export function ModalHeader({ ref, title, description, hideClose = false, className, ...rest }: ModalHeaderProps) {
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
        <IconButton size="sm" aria-label={wording.close} className={styles.close} onClick={() => modal?.onClose()}>
          <CrossGlyph />
        </IconButton>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ModalBody / ModalFooter                                             */
/* ------------------------------------------------------------------ */

/** The content of a `Modal` or `Drawer` - the part that scrolls while head and
    foot stand fast. */
export function ModalBody({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & RefProp<HTMLDivElement>) {
  return (
    <div ref={ref} className={cx(styles.body, className)} {...rest}>
      {children}
    </div>
  );
}

/** The foot of a `Modal` or `Drawer`, for its buttons; they stand at the end. */
export function ModalFooter({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & RefProp<HTMLDivElement>) {
  return (
    <div ref={ref} className={cx(styles.footer, className)} {...rest}>
      {children}
    </div>
  );
}
