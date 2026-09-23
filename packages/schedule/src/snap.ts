/* Snapping: a wall-clock time onto a raster (ADR-0023).

   The raster lies on LOCAL time, counted from local midnight plus an offset: a
   raster of two hours means 06:00, 08:00, 10:00 on the plant's clock, and a
   raster of eight hours offset by six means the shift changes at 06:00, 14:00
   and 22:00 - never UTC's hours. The offset of the time zone is the one at the
   instant itself, so a raster keeps its hours across a clock change. Snapping
   shapes the ghost and therefore the intent - never the stored data. */

import { localOffset } from "@umriss-ui/charts";

/** A raster: a step, and where it starts after local midnight. */
export interface SnapRaster {
  /** The distance between two lines of the raster, in milliseconds. */
  readonly step: number;
  /** Where the raster starts after local midnight, in milliseconds: six
      hours for shifts that change at 06:00. */
  readonly offset: number;
}

/** `time` onto the nearest line of the raster in local time - a step alone
    starts at local midnight. A step of zero or less is no raster: the time
    stays as it is. */
export function snapTime(time: number, raster: number | SnapRaster): number {
  const { step, offset } = typeof raster === "number" ? { step: raster, offset: 0 } : raster;
  if (!(step > 0) || !Number.isFinite(time)) return time;
  const origin = localOffset(time) + offset;
  return origin + Math.round((time - origin) / step) * step;
}
