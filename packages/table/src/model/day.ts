/* What the CSV needs about a day: a date at midnight of the zone. The XLSX writer
   holds the same `allDays` again (see `sheet.ts`): its entry must import nothing. */

import { zoneFields } from "@umriss-ui/core";

/** Whether a date lies at midnight of the zone (the reader's without one). */
export const isDay = (d: Date, timeZone?: string): boolean => {
  const f = zoneFields(d, timeZone);
  return f.hours + f.minutes + f.seconds + (((d.getTime() % 1000) + 1000) % 1000) === 0;
};

/** Whether every date among the values lies at midnight of the zone; other
    values and absent ones do not count. */
export const allDays = (values: Iterable<unknown>, timeZone?: string): boolean => {
  for (const v of values) if (v instanceof Date && !isDay(v, timeZone)) return false;
  return true;
};

/** The zone's day as `YYYY-MM-DD`, from the wall-clock fields. */
export const dayText = (d: Date, timeZone?: string): string => {
  const f = zoneFields(d, timeZone);
  return `${String(f.year).padStart(4, "0")}-${String(f.month + 1).padStart(2, "0")}-${String(f.day).padStart(2, "0")}`;
};
