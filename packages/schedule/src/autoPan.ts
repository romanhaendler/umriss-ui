/* Auto-pan: the plot pans along while a drag is near its edge.

   Pixels per frame along one axis. Within the edge zone the speed rises
   quadratically toward the edge - slow where a planner only brushes the zone,
   fast where they push against the edge - and holds its top speed once the
   pointer has left the plot. A plot with no middle between its two zones does
   not pan: there would be no position that means "stay". */

/** The width of the edge zone, in pixels. */
export const AUTO_PAN_ZONE = 32;
/** The top speed, in pixels per frame. */
export const AUTO_PAN_MAX = 18;

export function autoPanSpeed(position: number, size: number): number {
  if (!(size > 2 * AUTO_PAN_ZONE)) return 0;
  const intoStart = AUTO_PAN_ZONE - position;
  const intoEnd = position - (size - AUTO_PAN_ZONE);
  const depth = Math.max(intoStart, intoEnd);
  if (depth <= 0) return 0;
  const share = Math.min(1, depth / AUTO_PAN_ZONE);
  const speed = AUTO_PAN_MAX * share * share;
  return intoStart > 0 ? -speed : speed;
}
