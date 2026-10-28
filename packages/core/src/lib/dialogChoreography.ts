/* The entrance and exit of a native <dialog> - in one place.

   The routine is small and it is delicate: `showModal()` on opening, on
   closing first the reverse choreography and then `close()`, and under reduced
   motion no choreography at all. Whoever writes it a second time above all
   writes the duration down twice, and then the two windows trail for
   different lengths.

   Internal. The library offers Modal and CommandPalette, not the mechanics
   they share - the same decision as for `computePosition`. */

import { useEffect, useRef, useState } from "react";
import type { RefObject, SyntheticEvent } from "react";
import { durationFrom, prefersReducedMotion } from "./motion";

export interface DialogChoreography {
  /** Belongs on the <dialog> element. */
  dialogRef: RefObject<HTMLDialogElement | null>;
  /** Is the exit running? Belongs on a data attribute the styles read. */
  closing: boolean;
  /**
   * Belongs on the <dialog> element's `onClose` - instead of the caller's
   * `onClose`. It lets the close event through when the browser closed the
   * dialog, and swallows it when the choreography did: the gesture that
   * triggered the closing has then already reported it.
   */
  onDialogClose: () => void;
  /**
   * Belongs on the <dialog> element's `onCancel`. Escape runs through the same
   * choreography instead of closing hard. Where the browser does not permit
   * the cancel - a second Escape without user activation - it closes itself;
   * `onDialogClose` reports that, and nothing is reported here.
   */
  onDialogCancel: (event: SyntheticEvent<HTMLDialogElement>) => void;
}

/**
 * Keeps a <dialog> in step with an `open` prop.
 *
 * `exit` is the time the window stays standing after being dismissed, so
 * that the reverse choreography can run - as a number of milliseconds or as
 * the name of a token read off the dialog while closing. The token is the
 * usual case: the duration then stands only once, and the stylesheet that
 * draws the motion and this hook that waits for its end cannot drift apart.
 * `0` means no exit, the window is gone in the same frame.
 *
 * Reduced motion always takes the same path as `0`.
 *
 * `onClose` is the caller's listener. It is called through `onDialogClose`
 * exactly when the browser closed - every gesture reports itself beforehand,
 * and a second time through the close event would be a duplicate report
 */
export function useDialogChoreography(
  open: boolean,
  exit: number | `--${string}`,
  onClose: () => void,
): DialogChoreography {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  /* Set immediately before our own `close()`, cleared when its event arrives.
     Not reset on opening: in the browser the close event comes in a later
     task, and a quick reopen in between would otherwise turn it into a
     report. `close()` is only called on an open dialog, so the event is
     certain to come. */
  const closedByUs = useRef(false);

  const onDialogClose = () => {
    if (closedByUs.current) {
      closedByUs.current = false;
      return;
    }
    onClose();
  };

  const onDialogCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (!event.cancelable) return;
    event.preventDefault();
    onClose();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      /* Deliberate: the effect mirrors the open/closed state of the <dialog>;
         the exit choreography has to be reset before showModal() runs. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClosing(false);
      if (!dialog.open) {
        /* The dialog's focusing steps move the focus to its first tab stop.
           A field inside that React focused for `autoFocus` keeps it. */
        const held = document.activeElement;
        dialog.showModal();
        if (held instanceof HTMLElement && held !== dialog && dialog.contains(held)) held.focus();
      }
      return;
    }

    if (!dialog.open) return;
    const exitMs = typeof exit === "number" ? exit : durationFrom(getComputedStyle(dialog), exit);
    if (exitMs <= 0 || prefersReducedMotion()) {
      closedByUs.current = true;
      dialog.close();
      return;
    }

    // Exit: first the reverse choreography, then actually close.
    setClosing(true);
    const timer = window.setTimeout(() => {
      setClosing(false);
      closedByUs.current = true;
      dialog.close();
    }, exitMs);
    return () => window.clearTimeout(timer);
  }, [open, exit]);

  return { dialogRef, closing, onDialogClose, onDialogCancel };
}
