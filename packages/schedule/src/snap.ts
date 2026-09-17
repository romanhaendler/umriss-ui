/* Snapping: a wall-clock time onto a raster (ADR-0023).

   The raster lies on LOCAL time, counted from local midnight: a raster of two
   hours means 06:00, 08:00, 10:00 on the plant's clock, never on UTC's. A raster
   with an offset of its own - shifts at 06:00, 14:00, 22:00 - is not offered
   yet. The offset is the local
   one at the instant itself, so a raster keeps its hours across a clock change.
   Snapping shapes the ghost and therefore the intent - never the stored data. */

import { MINUTE } from "@umriss-ui/charts";

/** The local offset at an instant, as the shift of a raster that is to lie on
    local time: `wallClock = offset + k · step`. */
export function localOffset(instant: number): number {
  return new Date(instant).getTimezoneOffset() * MINUTE;
}

/** `time` onto the nearest multiple of `step` in local time. A step of zero
    or less is no raster: the time stays as it is. */
export function snapTime(time: number, step: number): number {
  if (!(step > 0) || !Number.isFinite(time)) return time;
  const offset = localOffset(time);
  return offset + Math.round((time - offset) / step) * step;
}
