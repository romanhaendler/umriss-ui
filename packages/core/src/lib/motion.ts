/** true when the system asks for reduced motion - choreographies then fall away. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A duration from a token, in milliseconds - and read WITH its unit.
 *
 * This is not precautionary polish but a defect that was already there.
 * `tokens.css` writes `240ms`; in the built bundle it says `.24s`, because a
 * CSS minifier may rewrite times in the shorter notation. A bare `parseFloat`
 * reads 0.24 out of that - a quarter of a thousandth of a second. The
 * transition did in fact run in the demo, but so briefly that only the tools
 * stood at their old place for a moment and the dock then jumped - exactly the
 * jump ADR-0014 sets out to abolish.
 *
 * Whoever reads a token back reads the unit with it. With lengths that does not
 * show, because `px` is the only one occurring; with times there are two.
 */
export function durationFrom(stil: CSSStyleDeclaration, name: string): number {
  const roh = stil.getPropertyValue(name).trim();
  const zahl = Number.parseFloat(roh);
  if (!Number.isFinite(zahl)) return 0;
  // Auf "ms" zuerst pruefen - "ms" endet selbst auf "s".
  if (roh.endsWith("ms")) return zahl;
  return roh.endsWith("s") ? zahl * 1000 : zahl;
}
