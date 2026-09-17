/* Time and the change of daylight saving time. A local wall-clock time can be
   missing (when summer time begins) or occur twice (when winter time begins).
   Both are recognised and treated honestly instead of being shifted in silence.

   This lies here and not in the DateTimePicker, because the DateTimeRangePicker
   needs the same parts - a picker is no home for shared logic. */

import { DEFAULT_FORMATS } from "../../lib/language/formats";

export type DstStatus =
  | { kind: "ok"; date: Date }
  | { kind: "missing"; date: Date }
  | { kind: "ambiguous"; earlier: Date; later: Date };

const matchesWallTime = (d: Date, h: number, m: number, s: number) =>
  d.getHours() === h && d.getMinutes() === m && d.getSeconds() === s;

/** Resolves a wall-clock time into an instant and reports the doubtful cases. */
export function resolveLocalTime(year: number, month: number, day: number, h: number, m: number, s: number): DstStatus {
  const d = new Date(year, month, day, h, m, s);

  // The missing hour: the browser shifts forward automatically.
  if (!matchesWallTime(d, h, m, s)) {
    return { kind: "missing", date: d };
  }

  // The doubled hour: the same wall-clock time exists again an hour away.
  const oneHour = 3_600_000;
  const before = new Date(d.getTime() - oneHour);
  if (matchesWallTime(before, h, m, s)) {
    return { kind: "ambiguous", earlier: before, later: d };
  }
  const after = new Date(d.getTime() + oneHour);
  if (matchesWallTime(after, h, m, s)) {
    return { kind: "ambiguous", earlier: d, later: after };
  }

  return { kind: "ok", date: d };
}

/** Which of the two identical wall-clock times of a doubled hour is meant. */
export type DstChoice = "earlier" | "later";

/**
 * The choice an existing instant has already made.
 *
 * A picker that reopens a value decomposes it into wall-clock fields and loses
 * in doing so which of the two occurrences it was. Without this question a
 * later 02:30 opened as the earlier one and slipped back by an hour on the next
 * "Apply" (library-audit 02).
 *
 * "later" only for the later occurrence of a doubled hour; every unambiguous
 * time is "earlier", the pickers' default.
 */
export function dstChoiceFor(instant: Date): DstChoice {
  const status = resolveLocalTime(
    instant.getFullYear(),
    instant.getMonth(),
    instant.getDate(),
    instant.getHours(),
    instant.getMinutes(),
    instant.getSeconds(),
  );
  /* Greater-or-equal instead of equal: the milliseconds of the value stand in
     no field, and a whole hour lies between the two occurrences. */
  return status.kind === "ambiguous" && instant.getTime() >= status.later.getTime() ? "later" : "earlier";
}

/**
 * An exact instant, truncated to the picker's resolution - to the minute, and
 * with `withSeconds` to the second.
 *
 * It is calculated on the time axis and not through the wall-clock time: a
 * `setSeconds(0)` resolves a doubled wall-clock time to the earlier one
 * according to ECMAScript, and turned the later 02:30 back into the earlier
 * one. An instant that is already settled has nothing to resolve.
 */
export function truncateInstant(instant: Date, withSeconds: boolean): Date {
  const step = withSeconds ? 1_000 : 60_000;
  return new Date(Math.floor(instant.getTime() / step) * step);
}

/**
 * The short form of the UTC offset, e.g. "GMT+2".
 *
 * The formatter behind it lies in the language seam. It used to be rebuilt here
 * on every call - the most expensive line in the most carefully built module of
 * the package.
 */
export const offsetLabel = (d: Date): string => DEFAULT_FORMATS.offset(d);

export const pad2 = (n: number) => String(n).padStart(2, "0");
