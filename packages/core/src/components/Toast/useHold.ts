/* The hold: which toasts wait outside their live region while the toasts are
   held back, so that their text is an insertion, and heard, when it ends. */
import { useEffect, useLayoutEffect, useState } from "react";
import type { ToastItem } from "./Toast";

/** Whether the region's target is drawn: in the document, and no dialog that
    closed (the region's move out of it follows in a microtask). */
export function drawnTarget(target: Element): boolean {
  return target.isConnected && !(target instanceof HTMLDialogElement && !target.open);
}

/** Whether two animation frames have passed since `key` last changed: in the
    first the change is drawn. A first key (after `null`) needs no wait, since
    nothing stood before it. */
function useFramesSince<T>(key: T): boolean {
  const [last, setLast] = useState(key);
  const [passed, setPassed] = useState(true);
  if (key !== last) {
    setLast(key);
    setPassed(last === null);
  }
  useEffect(() => {
    if (passed) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setPassed(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [key, passed]);
  return passed;
}

export function useHold(held: boolean, items: ToastItem[], target: Element | null) {
  /* The first id that waits, from the hold's beginning until the waiting
     toasts can be heard: a live region that enters the document with its
     text is often not read out, so they wait on after the hold until the
     region they go into is drawn and has stood for a frame - a region built
     anew in a move into or out of a dialog, or one in a dialog that closed,
     is not yet. */
  const [waitingFrom, setWaitingFrom] = useState<number | null>(null);
  /* The last id rendered in sight (ids only grow). The hold begins after it,
     by what was shown and not by what this render holds, so that a toast sent
     in the handler that begins the hold waits as one arriving during it. */
  const [shownUpTo, setShownUpTo] = useState(0);
  const lastId = items.at(-1)?.id ?? 0;
  if (held && waitingFrom === null) setWaitingFrom(shownUpTo + 1);
  else if (!held && waitingFrom === null && lastId !== shownUpTo) setShownUpTo(lastId);
  const regionStood = useFramesSince(target);
  useLayoutEffect(() => {
    /* Whether the target is drawn is read from the document. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!held && waitingFrom !== null && regionStood && target && drawnTarget(target)) setWaitingFrom(null);
  }, [held, target, waitingFrom, regionStood]);

  /** Whether a toast is in its live region: every one, but those that wait. */
  const entered = (item: ToastItem) => waitingFrom === null || item.id < waitingFrom;
  return { entered };
}
