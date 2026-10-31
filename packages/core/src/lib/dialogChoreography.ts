/* The entrance and exit of a native <dialog> - in one place.

   The routine is small and it is delicate: `showModal()` on opening, on
   closing first the reverse choreography and then `close()`, and under reduced
   motion no choreography at all. Whoever writes it a second time above all
   writes the duration down twice, and then the two windows trail for
   different lengths.

   Internal. The library offers Modal and CommandPalette, not the mechanics
   they share - the same decision as for `computePosition`. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject, SyntheticEvent } from "react";
import { firstTabStop } from "./firstTabStop";
import { durationFrom, prefersReducedMotion } from "./motion";

/* The page's scroll is locked while any dialog stands: a count, so a nested
   dialog's closing does not free the page under the outer one. The browser
   locks nothing itself; the scrollbar's width is made up in padding so the
   page does not jump. */
let scrollLocks = 0;
let scrollRestore: (() => void) | null = null;
function lockScroll() {
  if (scrollLocks++ > 0) return;
  const root = document.documentElement;
  const { overflow, paddingRight } = root.style;
  const bar = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  if (bar > 0) root.style.paddingRight = `calc(${getComputedStyle(root).paddingRight} + ${bar}px)`;
  scrollRestore = () => {
    root.style.overflow = overflow;
    root.style.paddingRight = paddingRight;
  };
}
function unlockScroll() {
  if (--scrollLocks > 0) return;
  scrollLocks = 0;
  scrollRestore?.();
  scrollRestore = null;
}

/* The last pointer press, for an opener that took no focus: WebKit does not
   focus a button a mouse pressed, so `activeElement` is the body then - or the
   dialog the button stands in. Watched from the moment this module loads: the
   press that opens the first dialog comes before any dialog exists. A key
   press ends it: the focus is then the opener's own. */
let pressed: Element | null = null;
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", (e) => (pressed = e.target as Element | null), true);
  document.addEventListener("keydown", () => (pressed = null), true);
}
const FOCUSABLE_ANCESTOR = "button, a[href], input, select, textarea, summary, [tabindex]";
function openerNow(): HTMLElement | null {
  const active = document.activeElement;
  const press = pressed?.closest(FOCUSABLE_ANCESTOR) as HTMLElement | null | undefined;
  const none = !active || active === document.body || active === document.documentElement;
  if (press?.isConnected && (none || (active !== press && active.contains(press)))) return press;
  return none ? null : (active as HTMLElement);
}

export interface DialogChoreography {
  /** Belongs on the <dialog> element. */
  dialogRef: RefObject<HTMLDialogElement | null>;
  /**
   * Are the dialog's children to be in the tree? True from the moment
   * `showModal()` has made the dialog visible until the exit has ended, so
   * React's own `autoFocus` focuses a visible field. A closed dialog keeps no
   * state of its children.
   */
  mounted: boolean;
  /** Is the exit running? Belongs on a data attribute the styles read. */
  closing: boolean;
  /**
   * Belongs on the <dialog> element's `onClose` - instead of the caller's
   * `onClose`. It lets the close event through when the browser closed the
   * dialog, and swallows it when the choreography did: the gesture that
   * triggered the closing has then already reported it.
   */
  onDialogClose: (event?: SyntheticEvent<HTMLDialogElement>) => void;
  /**
   * Belongs on the <dialog> element's `onCancel`. Escape runs through the same
   * choreography instead of closing hard. Where the browser does not permit
   * the cancel - a second Escape without user activation - it closes itself;
   * `onDialogClose` reports that, and nothing is reported here.
   */
  onDialogCancel: (event: SyntheticEvent<HTMLDialogElement>) => void;
  /**
   * Belongs on the <dialog> element's `onKeyDown`. A synthetic Escape - one a
   * test tool dispatches, which the browser never turns into a cancel - runs
   * the same choreography as the native cancel.
   */
  onDialogKeyDown: (event: KeyboardEvent<HTMLDialogElement>) => void;
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
  const [mounted, setMounted] = useState(false);
  /* Set immediately before our own `close()`, cleared when its event arrives.
     Not reset on opening: in the browser the close event comes in a later
     task, and a quick reopen in between would otherwise turn it into a
     report. `close()` is only called on an open dialog, so the event is
     certain to come. */
  const closedByUs = useRef(false);

  /* Where the focus goes back to. Remembered on opening: the platform's own
     return fails for a dialog that unmounts, and for an opener that took no
     focus. */
  const opener = useRef<HTMLElement | null>(null);
  const locked = useRef(false);

  const release = () => {
    if (locked.current) {
      locked.current = false;
      unlockScroll();
    }
  };
  /* The focus goes back when the close left it on the body, in the dialog, or
     on the dialog this one stands in: WebKit hands it to that one, as the
     button that opened this one took none. */
  const returnFocus = (dialog: HTMLDialogElement) => {
    const target = opener.current;
    const active = document.activeElement;
    const outer = active instanceof HTMLDialogElement && active !== dialog && active.contains(target);
    if (target?.isConnected && (!active || active === document.body || dialog.contains(active) || outer)) target.focus();
  };
  /* Closes an open dialog and gives the page back: scroll and focus. */
  const closeNow = (dialog: HTMLDialogElement) => {
    if (dialog.open) {
      closedByUs.current = true;
      dialog.close();
    }
    release();
    returnFocus(dialog);
  };

  /* A close or cancel from a dialog nested inside this one - a React child
     whose events bubble through the React tree - is not this dialog's. */
  const own = (event?: SyntheticEvent<HTMLDialogElement>) => !event || event.target === event.currentTarget;

  const onDialogClose = (event?: SyntheticEvent<HTMLDialogElement>) => {
    if (!own(event)) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      release();
      returnFocus(dialog);
    }
    if (closedByUs.current) {
      closedByUs.current = false;
      return;
    }
    onClose();
  };

  const onDialogCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (!own(event) || !event.cancelable) return;
    event.preventDefault();
    onClose();
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Escape" || event.nativeEvent.isTrusted || event.defaultPrevented) return;
    if ((event.target as Element).closest("dialog") !== event.currentTarget) return;
    event.preventDefault();
    onClose();
  };

  const openNow = (dialog: HTMLDialogElement) => {
    if (!dialog.open) {
      opener.current = openerNow();
      dialog.showModal();
    }
    if (!locked.current) {
      locked.current = true;
      lockScroll();
    }
  };

  /* The state the platform cannot keep: a dialog whose React tree is hidden
     (`<Activity mode="hidden">`, a Suspense that suspends again) or removed
     stays open and blocks the page, and nothing in the tree closes it. This
     layout effect closes it when the tree goes and opens it again when the
     tree returns; `open` is read through a ref, as the effect runs once per
     showing and not per change. */
  const openRef = useRef(open);
  useLayoutEffect(() => {
    openRef.current = open;
  });
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openRef.current) openNow(dialog);
    return () => closeNow(dialog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      /* Deliberate: the effect mirrors the open/closed state of the <dialog>;
         the exit choreography has to be reset before showModal() runs. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClosing(false);
      openNow(dialog);
      /* The children mount only now: a field with `autoFocus` focuses itself
         on mounting, which needs the dialog visible. */
      setMounted(true);
      return;
    }

    if (!dialog.open) {
      setMounted(false);
      return;
    }
    const exitMs = typeof exit === "number" ? exit : durationFrom(getComputedStyle(dialog), exit);
    if (exitMs <= 0 || prefersReducedMotion()) {
      closeNow(dialog);
      setMounted(false);
      return;
    }

    // Exit: first the reverse choreography, then actually close.
    setClosing(true);
    const timer = window.setTimeout(() => {
      setClosing(false);
      closeNow(dialog);
      setMounted(false);
    }, exitMs);
    return () => window.clearTimeout(timer);
    /* `openNow` and `closeNow` read refs only. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exit]);

  /* Unless a field took the focus by `autoFocus`, the first field gets it - not
     the header's close cross, which the platform's focusing steps would pick -
     and a dialog without one is focused itself. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!mounted || !dialog) return;
    const active = document.activeElement;
    if (active !== dialog && dialog.contains(active)) return;
    (firstTabStop(dialog, "[data-dialog-close]") ?? dialog).focus();
  }, [mounted]);

  return { dialogRef, mounted, closing, onDialogClose, onDialogCancel, onDialogKeyDown };
}
