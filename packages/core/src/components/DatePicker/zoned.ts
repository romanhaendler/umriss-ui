/* The seam between the zone's days and the month grid. The grid, the band and
   the keyboard step work on calendar-day Dates - local midnight, whose local
   year, month and day are the zone's. A value coming in becomes such a day, a
   picked day goes out as the zone's midnight, and a day shown through the
   formats (which write in the zone) is moved to the zone's noon first, so that
   a grid day never shows as its neighbour. `undefined` is the reader's zone,
   where every function is the identity. */

import { zoneFields, zoneInstant } from "../../lib/zone";

/** The calendar day an instant falls on in the zone. */
export function gridDay(instant: Date, timeZone: string | undefined): Date {
  const f = zoneFields(instant, timeZone);
  return new Date(f.year, f.month, f.day);
}

/** The zone's today as a calendar day. */
export const zoneToday = (timeZone: string | undefined): Date => gridDay(new Date(), timeZone);

/** The instant of the zone's midnight that begins a calendar day. */
export const dayStart = (day: Date, timeZone: string | undefined): Date =>
  zoneInstant({ year: day.getFullYear(), month: day.getMonth(), day: day.getDate() }, timeZone);

/** The last minute (or second) of a calendar day in the zone. */
export const dayEnd = (day: Date, withSeconds: boolean, timeZone: string | undefined): Date =>
  zoneInstant(
    { year: day.getFullYear(), month: day.getMonth(), day: day.getDate(), hours: 23, minutes: 59, seconds: withSeconds ? 59 : 0 },
    timeZone,
  );

/** A calendar day as an instant the formats write as that day: the zone's noon. */
export const dayShown = (day: Date, timeZone: string | undefined): Date =>
  timeZone === undefined
    ? day
    : zoneInstant({ year: day.getFullYear(), month: day.getMonth(), day: day.getDate(), hours: 12 }, timeZone);

/** Whether an instant is the zone's midnight. */
export function onMidnight(instant: Date, timeZone: string | undefined): boolean {
  const f = zoneFields(instant, timeZone);
  return f.hours === 0 && f.minutes === 0 && f.seconds === 0 && instant.getTime() % 1000 === 0;
}
