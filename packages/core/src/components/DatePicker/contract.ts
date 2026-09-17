/* The value contract of the pickers: which shape a date has that a picker hands
   out. Two resolutions, and every picker commits to one of them:

     "day"     - local midnight. DatePicker, DateRangePicker.
     "instant" - the exact moment. DateTimePicker, DateTimeRangePicker.

   Every way that hands out a value - the grid, the foot bar, the presets,
   clearing - goes through here. That is exactly where the earlier deviations
   lay: in the DatePicker the grid gave midnight and "Today" gave the time of
   day. */

import { dayOnly } from "./grid";
import type { DateRange } from "./range";

export type Resolution = "day" | "instant";

/** Local midnight of the day. */
export const startOfDay = (d: Date): Date => dayOnly(d);

/**
 * The last representable moment of the day - in the resolution the picker
 * displays. A picker without a seconds field cannot express 23:59:59, so its
 * day ends at 23:59.
 */
export const endOfDay = (d: Date, withSeconds: boolean): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, withSeconds ? 59 : 0);

/** Orders two instants, so that `from` never lies after `to`. */
export const order = (a: Date, b: Date): [Date, Date] => (a.getTime() <= b.getTime() ? [a, b] : [b, a]);

/** Orders by day; the times of day stay as they are. */
export const orderByDay = (a: Date, b: Date): [Date, Date] =>
  dayOnly(a).getTime() <= dayOnly(b).getTime() ? [a, b] : [b, a];

/**
 * Applies the contract to two day boundaries - the way along which a preset
 * lands in a picker. Both resolutions agree about the days; they differ only in
 * how they express the end.
 */
export function rangeFromDays(
  fromDay: Date,
  toDay: Date,
  resolution: Resolution,
  withSeconds: boolean,
): DateRange {
  const [a, b] = orderByDay(fromDay, toDay);
  return {
    from: startOfDay(a),
    to: resolution === "day" ? startOfDay(b) : endOfDay(b, withSeconds),
  };
}
