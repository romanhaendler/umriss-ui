/* Where a dock can rest - as pure calculation.

   Here stands the part of this component in which something is really
   calculated: the division of the host into four zones, the question whether
   the strip fits in an orientation, and the assignment of the four arrow keys.
   No React, no DOM, no backwards import from `Dock.tsx` - and therefore
   checkable without rendering an element and simulating a pointer for it. An
   edge-case error in this arithmetic survives exactly the kind of test that
   looks for it through a rendered element.

   A resting place is a NAME and not a coordinate (ADR-0013). Nothing in this
   file returns a position; it answers questions about names exclusively. */

/** One of the four edges of the host. There is no fifth and no corner. */
export type Place = "top" | "right" | "bottom" | "left";

/** The resting place a dock starts with - and the answer everywhere two places
    would be equally good. */
export const DEFAULT_PLACE: Place = "bottom";

/** The four places clockwise. Only for the ring distance. */
const RING: readonly Place[] = ["top", "right", "bottom", "left"];

/* The order in which places equally far away are decided. Equally far means:
   there is no nearer one, so the same thing decides as would decide without any
   current place - the default first, and the lying ones before the standing
   ones, because a lying dock has room more often. */
const PREFERENCE: readonly Place[] = ["bottom", "top", "right", "left"];

/** The rectangle of the host, as `getBoundingClientRect` delivers it. */
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * What the CSS has really produced. These values are parameters and not
 * constants in the calculation: which edge length a tool field has and how
 * large the gaps are stands in the stylesheet, and a second version of it here
 * would be one that stops being true at some point.
 */
export interface StripMetrics {
  /** The edge length of a tool field. */
  tool: number;
  /** The extent of the grip along the running direction. */
  grip: number;
  /** The gap between two fields. */
  gap: number;
  /** The inner spacing at each end of the strip. */
  padding: number;
  /** The extent across the running direction. */
  thickness: number;
  /** The air between the strip and the edge of the host. */
  margin: number;
}

/** Whether the place stands the dock upright. Both - the component and the
    transition - need the answer, and neither of them shall derive it itself. */
export function isUpright(place: Place): boolean {
  return place === "left" || place === "right";
}

/**
 * Which place a pointer chooses.
 *
 * The host is divided into four zones whose boundaries are the diagonals. Every
 * point in the rectangle therefore belongs to exactly one zone. It is
 * calculated in normalised coordinates (half the width and half the height as
 * the unit) - only that makes the boundaries really the diagonals and not the
 * bisectors of a square.
 *
 * The zones are cones out of the centre and do not stop at the edge: a point
 * OUTSIDE the rectangle therefore still yields a place, namely that of the zone
 * through which it has passed out. A pointer that leaves the host while
 * dragging must not produce "no place".
 *
 * On a diagonal both axes are equally far. The decision then falls in favour of
 * the lying edge - not arbitrarily, but because a lying dock has room more
 * often than a standing one, so the doubtful point falls on the place that is
 * more likely to exist.
 */
export function placeAtPointer(point: Point, host: Rect): Place {
  // Without an area there are no zones. The function stays total nonetheless.
  if (host.width <= 0 || host.height <= 0) return DEFAULT_PLACE;

  const dx = (point.x - (host.left + host.width / 2)) / (host.width / 2);
  const dy = (point.y - (host.top + host.height / 2)) / (host.height / 2);

  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy < 0 ? "top" : "bottom";
}

/**
 * How long the strip becomes along its running direction.
 *
 * The build-up: padding, the grip, then one gap and one field per tool, then
 * padding again. The length does not depend on the orientation - the same
 * fields in a row are as long standing as lying. That is exactly what makes the
 * question "does it fit over there" answerable before one is there.
 */
export function stripLength(toolCount: number, metrics: StripMetrics): number {
  return 2 * metrics.padding + metrics.grip + toolCount * (metrics.gap + metrics.tool);
}

/**
 * Whether the dock fits into its host at this place - along AND across, each
 * with the margin it keeps to the edge.
 *
 * With today's tokens (`--u-dock-*`) nine tools lie as 316 x 40 and stand as
 * 40 x 316; a wide, flat host has room for the first and none for the second.
 * The numbers stand here as an order of magnitude and not as a promise - they
 * follow from `metrics`, and whoever changes the tokens changes them too. A
 * place that does not fit is not offered (ticket 05) - it is not travelled to
 * and then corrected.
 */
export function fits(
  place: Place,
  toolCount: number,
  host: Rect,
  metrics: StripMetrics,
): boolean {
  const length = stripLength(toolCount, metrics);
  const upright = isUpright(place);
  const along = (upright ? host.height : host.width) - 2 * metrics.margin;
  const across = (upright ? host.width : host.height) - 2 * metrics.margin;
  return length <= along && metrics.thickness <= across;
}

/**
 * Which place an arrow key chooses - absolutely and not relative to where the
 * dock currently stands. Four keys, four places: that way the keyboard can land
 * nowhere the pointer could not reach, and vice versa.
 *
 * Every other key yields "no place". That is the honest answer and not a gap:
 * the component passes such keys on instead of swallowing them.
 */
export function placeForKey(key: string): Place | undefined {
  switch (key) {
    case "ArrowUp":
      return "top";
    case "ArrowRight":
      return "right";
    case "ArrowDown":
      return "bottom";
    case "ArrowLeft":
      return "left";
    default:
      return undefined;
  }
}

/** The ring distance of two places: 0 the same, 1 adjacent, 2 opposite. */
function distance(a: Place, b: Place): number {
  const gap = Math.abs(RING.indexOf(a) - RING.indexOf(b));
  return Math.min(gap, RING.length - gap);
}

/**
 * The nearest place that fits - its own first.
 *
 * Needed when the host becomes smaller and the dock stands where there is no
 * room any more: it does not stay where it does not fit, and it does not stick
 * out. Places equally far away are decided by `PREFERENCE`.
 *
 * If not a single place fits, the answer is "none". The host is then too small
 * for this dock in every orientation, and the component has nothing it could
 * fall back to.
 */
export function nearestFittingPlace(
  place: Place,
  toolCount: number,
  host: Rect,
  metrics: StripMetrics,
): Place | undefined {
  return [...RING]
    .sort(
      (a, b) =>
        distance(place, a) - distance(place, b) ||
        PREFERENCE.indexOf(a) - PREFERENCE.indexOf(b),
    )
    .find((candidate) => fits(candidate, toolCount, host, metrics));
}
