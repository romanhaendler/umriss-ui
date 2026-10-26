/* The reading of a typed date. A pure function of the text and the formats in
   use: no React, no clock of its own (`today` is injectable). */

import type { Formats } from "../../lib/language/formats";
import { dayShown } from "./zoned";

type Part = "d" | "m" | "y";

/* A date whose three parts all differ, so that the formats' output tells which
   part stands where. */
const SAMPLE = new Date(2031, 11, 25);

/* The sample as the formats write it: the zone's noon of that day, so that a
   named zone shows the 25th as well. */
const sampleIn = (formats: Formats) => dayShown(SAMPLE, formats.timeZone);

/** The sample date written in the formats in use: the field's placeholder. */
export const sampleDate = (formats: Formats) => formats.date(sampleIn(formats));

/* The order the formats write day, month and year in. */
function orderOf(formats: Formats): Part[] {
  const numbers = formats.date(sampleIn(formats)).match(/\d+/g) ?? [];
  const names: Record<string, Part> = { "25": "d", "12": "m", "2031": "y" };
  const order = numbers.map((n) => names[n]).filter((p): p is Part => !!p);
  return order.length === 3 ? order : ["d", "m", "y"];
}

/* The year of two digits that lies nearest to today's; a tie goes to the past. */
function nearestYear(yy: number, todayYear: number): number {
  const base = Math.floor(todayYear / 100) * 100 + yy;
  return [base - 100, base, base + 100].reduce((best, y) =>
    Math.abs(y - todayYear) < Math.abs(best - todayYear) ? y : best,
  );
}

/** The calendar day a text names (local midnight, as the grid has them), or
    `null` where it is no date. `today` is a calendar day as well. */
export function readTypedDate(text: string, formats: Formats, today: Date = new Date()): Date | null {
  const trimmed = text.trim();
  let order = orderOf(formats);
  let parts = trimmed.split(/\D+/).filter(Boolean);
  if (/^\d+$/.test(trimmed)) {
    const widths = trimmed.length === 6 ? [2, 2, 2] : order[0] === "y" ? [4, 2, 2] : [2, 2, 4];
    if (trimmed.length !== 6 && trimmed.length !== 8) return null;
    let at = 0;
    parts = widths.map((w) => trimmed.slice(at, (at += w)));
  } else if (parts.length === 3 && parts[0]!.length === 4) {
    order = ["y", "m", "d"];
  }
  if (parts.length !== 3) return null;
  const value: Record<Part, string> = { d: "", m: "", y: "" };
  order.forEach((p, i) => (value[p] = parts[i]!));
  if (value.d.length > 2 || value.m.length > 2 || (value.y.length !== 2 && value.y.length !== 4)) return null;
  const day = Number(value.d);
  const month = Number(value.m);
  const year = value.y.length === 2 ? nearestYear(Number(value.y), today.getFullYear()) : Number(value.y);
  const date = new Date(year, month - 1, day);
  date.setFullYear(year); // years below 100 are not 19xx
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}
