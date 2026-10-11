import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

/** true when the system asks for reduced motion - choreographies then fall away. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A duration from a token, in milliseconds - and read WITH its unit.
 *
 * `tokens.css` writes `240ms`; a CSS minifier may rewrite it as `.24s`, so a
 * bare `parseFloat` would read 0.24. Times come in two units, so the unit is
 * always read with the number.
 */
export function durationFrom(style: CSSStyleDeclaration, name: string): number {
  const raw = style.getPropertyValue(name).trim();
  const amount = Number.parseFloat(raw);
  if (!Number.isFinite(amount)) return 0;
  // Check "ms" first - "ms" itself ends in "s".
  if (raw.endsWith("ms")) return amount;
  return raw.endsWith("s") ? amount * 1000 : amount;
}

/**
 * Whether a surface still stands: while `open`, and after closing for as long
 * as its exit lasts - `exit` names the token, read off the element the way the
 * dialog reads its own, so the stylesheet that draws the exit and the code
 * that waits for its end cannot drift apart. Where the token is missing or 0,
 * and always under reduced motion, the surface goes in the same pass: the path
 * is dropped, never the state change.
 */
export function usePresence(open: boolean, ref: RefObject<HTMLElement | null>, exit: `--${string}`): boolean {
  const [present, setPresent] = useState(open);
  // Adjusted while rendering, so an opening surface stands in the same pass.
  if (open && !present) setPresent(true);

  useLayoutEffect(() => {
    if (open || !present) return;
    const element = ref.current;
    const ms = element && !prefersReducedMotion() ? durationFrom(getComputedStyle(element), exit) : 0;
    if (ms <= 0) {
      // No exit to draw: the surface goes before the next paint.
      setPresent(false);
      return;
    }
    const timer = window.setTimeout(() => setPresent(false), ms);
    return () => window.clearTimeout(timer);
  }, [open, present, ref, exit]);

  return present;
}
