/* The `min` and `max` of the pickers as calendar days. The instants a caller
   gives become the zone's days through the zone seam, and everything below
   compares days only: a bound is inclusive and its time of day does not count. */

import { useFormats } from "../../lib/language";
import { addDays, dayOnly, startOfMonth } from "./grid";
import type { RangePreset } from "./range";
import { gridDay } from "./zoned";

export interface DayBounds {
  min: Date | null;
  max: Date | null;
}

export const NO_BOUNDS: DayBounds = { min: null, max: null };

/** The bounds of a picker in the formats' zone. */
export function useDayBounds(min: Date | undefined, max: Date | undefined): DayBounds {
  const { timeZone } = useFormats();
  return { min: min ? gridDay(min, timeZone) : null, max: max ? gridDay(max, timeZone) : null };
}

const time = (d: Date) => dayOnly(d).getTime();

/** Whether a day lies outside the bounds. */
export const outside = (day: Date, { min, max }: DayBounds): boolean =>
  (!!min && time(day) < time(min)) || (!!max && time(day) > time(max));

/** The day itself, or the bound it lies beyond. */
export const clampDay = (day: Date, { min, max }: DayBounds): Date =>
  min && time(day) < time(min) ? min : max && time(day) > time(max) ? max : day;

/** Whether no day of the month lies inside the bounds. */
export const monthOutside = (month: Date, bounds: DayBounds): boolean => {
  const first = startOfMonth(month);
  return outside(addDays(new Date(first.getFullYear(), first.getMonth() + 1, 1), -1), { min: bounds.min, max: null }) ||
    outside(first, { min: null, max: bounds.max });
};

/** A preset's days cut to the bounds; `null` where none of them is inside. */
export function presetDays(preset: RangePreset, bounds: DayBounds, timeZone: string | undefined): [Date, Date] | null {
  const range = preset.range();
  const from = gridDay(range.from, timeZone);
  const to = gridDay(range.to, timeZone);
  if ((bounds.min && time(to) < time(bounds.min)) || (bounds.max && time(from) > time(bounds.max))) return null;
  return [clampDay(from, bounds), clampDay(to, bounds)];
}
