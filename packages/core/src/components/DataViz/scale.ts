/* The value mapping of the DataViz marks. Pure functions without React and
   without SVG: the seam at which projection and clamping are checked. */

export type Point = readonly [number, number];

/**
 * Maps a series onto points inside the padded field. x spreads evenly across
 * the width, y is inverted (the largest value lies at the top). A constant
 * series has no span; it is raised to 1, so that nothing is divided by zero.
 */
export function project(
  data: readonly number[],
  width: number,
  height: number,
  padding: number,
): Point[] {
  const minimum = Math.min(...data);
  const maximum = Math.max(...data);
  const span = maximum - minimum || 1;
  const steps = Math.max(1, data.length - 1);
  return data.map((value, index) => {
    const x = padding + (index / steps) * (width - padding * 2);
    const y = padding + (1 - (value - minimum) / span) * (height - padding * 2);
    return [x, y] as const;
  });
}

/** Holds a fill level in the range zero to one. */
export const clampFraction = (value: number): number => Math.max(0, Math.min(1, value));

/** The integer percentage of a fill level; it clamps before rounding. */
export const percentDisplay = (value: number): number => Math.round(clampFraction(value) * 100);
