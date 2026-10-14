/* The glide across a modal dialog: the region is built anew when it moves
   into or out of one, and the new region starts where the old one was seen. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { drawnTarget } from "./useHold";

/** The region's four distances as it stands, as the stylesheet's `--_from-*`. */
type Insets = Record<`--_from-${"top" | "bottom" | "start" | "end"}`, string>;
function insetsOf(region: Element): Insets {
  const style = getComputedStyle(region);
  const read = (side: string) => style.getPropertyValue(`--_toast-${side}`);
  return { "--_from-top": read("top"), "--_from-bottom": read("bottom"), "--_from-start": read("start"), "--_from-end": read("end") };
}

/** `seenInDialog`: the deck is seen at its place inside a dialog. */
export function useGlideAcross(regionRef: RefObject<HTMLDivElement | null>, seenInDialog: boolean) {
  /* Where the deck was last seen in a dialog, read in every frame while it is
     seen there: a dialog that closes takes its region out of rendering before
     the move, and no signal of the closing comes while the region is still
     drawn. Its cost: one read of the computed style per frame for as long as
     a toast is seen in an open dialog - a `duration: 0` one until it is
     closed. */
  const lastSeenRef = useRef<Insets | null>(null);
  useEffect(() => {
    lastSeenRef.current = null;
    if (!seenInDialog) return;
    let frame = requestAnimationFrame(function read() {
      if (regionRef.current) lastSeenRef.current = insetsOf(regionRef.current);
      frame = requestAnimationFrame(read);
    });
    return () => cancelAnimationFrame(frame);
  }, [regionRef, seenInDialog]);

  /* Where the new region starts: the old region's distances as last seen, as
     `--_from-*`, which the stylesheet's starting style reads. A new place
     glides from there, the same place stands still. */
  const [from, setFrom] = useState<Insets | null>(null);
  /** Called as the region leaves `oldTarget`, while the old region still
      stands: `seen` whether the deck was seen at its place there. A deck not
      seen hands on no place, and the new one stands at once. */
  const handOn = useCallback(
    (oldTarget: Element, seen: boolean) => {
      const old = regionRef.current;
      setFrom(seen && old ? (drawnTarget(oldTarget) ? insetsOf(old) : lastSeenRef.current) : null);
    },
    [regionRef],
  );
  return { from, handOn };
}
