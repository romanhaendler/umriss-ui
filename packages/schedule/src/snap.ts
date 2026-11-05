/* Snapping: a wall-clock time onto a raster (ADR-0023).

   The raster lies on LOCAL time, counted from local midnight plus an offset: a
   raster of two hours means 06:00, 08:00, 10:00 on the wall clock, and a
   raster of eight hours offset by six means handovers at 06:00, 14:00
   and 22:00 - never UTC's hours. The line is found in local time and then
   converted with the offset at the line's own instant, so a raster keeps its hours across a clock change. Snapping
   shapes the ghost and therefore the intent - never the stored data. */

import { localOffset } from "@umriss-ui/charts";

/** A raster: a step, and where it starts after local midnight. */
export interface SnapRaster {
  /** The distance between two lines of the raster, in milliseconds. */
  readonly step: number;
  /** Where the raster starts after local midnight, in milliseconds: six
      hours for handovers at 06:00, 14:00 and 22:00. */
  readonly offset: number;
}

/** `time` onto the nearest line of the raster in the zone's time, the reader's
    unless one is named - a step alone starts at the zone's midnight. A step of
    zero or less is no raster: the time stays as it is. */
export function snapTime(time: number, raster: number | SnapRaster, timeZone?: string): number {
  const { step, offset } = typeof raster === "number" ? { step: raster, offset: 0 } : raster;
  if (!(step > 0) || !Number.isFinite(time)) return time;
  const local = time - localOffset(time, timeZone);
  const line = offset + Math.round((local - offset) / step) * step;
  // The line is on the local clock; the offset (localOffset is minus the UTC offset) at the line's own instant may differ across a
  // clock change. A line inside a skipped hour has no instant of its own and stays uncorrected.
  const guess = line + localOffset(time, timeZone);
  const real = line + localOffset(guess, timeZone);
  return real - localOffset(real, timeZone) === line ? real : guess;
}
