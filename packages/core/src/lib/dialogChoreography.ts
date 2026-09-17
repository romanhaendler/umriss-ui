/* The entrance and exit of a native <dialog> - in one place.

   The routine is small and it is delicate: `showModal()` on opening, on
   closing first the reverse choreography and then `close()`, and under reduced
   motion no choreography at all. Whoever writes it a second time above all
   writes the duration down twice, and then the two windows eventually trail
   for different lengths.

   That is exactly why this module exists and not first at the eighth caller:
   `popover-seam` tidied up eleven modules that all began with a second copy
   nobody thought worth a ticket. This is the second copy.

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
  beimSchliessen: () => void;
  /**
   * Belongs on the <dialog> element's `onCancel`. Escape runs through the same
   * choreography instead of closing hard. Where the browser does not permit
   * the cancel - a second Escape without user activation - it closes itself;
   * `beimSchliessen` reports that, and nothing is reported here.
   */
  beimAbbrechen: (event: SyntheticEvent<HTMLDialogElement>) => void;
}

/**
 * Keeps a <dialog> in step with an `open` prop.
 *
 * `abtritt` is the time the window stays standing after being dismissed, so
 * that the reverse choreography can run - as a number of milliseconds or as
 * the name of a token read off the dialog while closing. The token is the
 * usual case: the duration then stands only once, and the stylesheet that
 * draws the motion and this hook that waits for its end cannot drift apart
 * (library-audit 07). `0` means no exit, the window is gone in the same frame.
 * That is not a special case but a decision a calling component may make - a
 * sheet of paper may take its leave, a search window may not.
 *
 * Reduced motion always takes the same path as `0`.
 *
 * `onClose` is the caller's listener. It is called through `beimSchliessen`
 * exactly when the browser closed - every gesture reports itself beforehand,
 * and a second time through the close event would be a duplicate report
 * (library-audit 01).
 */
export function useDialogChoreography(
  open: boolean,
  abtritt: number | `--${string}`,
  onClose: () => void,
): DialogChoreography {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  /* Set immediately before our own `close()`, cleared when its event arrives.
     Not reset on opening: in the browser the close event comes in a later
     task, and a quick reopen in between would otherwise turn it into a
     report. `close()` is only called on an open dialog, so the event is
     certain to come. */
  const selbstGeschlossen = useRef(false);

  const beimSchliessen = () => {
    if (selbstGeschlossen.current) {
      selbstGeschlossen.current = false;
      return;
    }
    onClose();
  };

  const beimAbbrechen = (event: SyntheticEvent<HTMLDialogElement>) => {
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
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (!dialog.open) return;
    const abtrittMs = typeof abtritt === "number" ? abtritt : durationFrom(getComputedStyle(dialog), abtritt);
    if (abtrittMs <= 0 || prefersReducedMotion()) {
      selbstGeschlossen.current = true;
      dialog.close();
      return;
    }

    // Exit: first the reverse choreography, then actually close.
    setClosing(true);
    const timer = window.setTimeout(() => {
      setClosing(false);
      selbstGeschlossen.current = true;
      dialog.close();
    }, abtrittMs);
    return () => window.clearTimeout(timer);
  }, [open, abtritt]);

  return { dialogRef, closing, beimSchliessen, beimAbbrechen };
}
