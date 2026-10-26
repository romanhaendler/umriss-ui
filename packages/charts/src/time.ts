/* The time axis: ticks on the boundaries of the reader's zone, or of a named
   one (zone.ts), from the minute to the year, and their labels by level.

   A step of a day or more is built from the zone's calendar fields, and not
   as `start + k · DAY`, so that a day is 23 or 25 hours long where the clock
   changes and a tick after the change still says 00:00. A smaller step stands
   on the zone's whole multiples in real time. One offset for the whole grid
   could not do either.

   The labels are en-GB with a 24-hour clock, by level: `15:00`, `17 Mar`,
   `Mar 2026`, `2026`. Fixed, not the browser's locale: the same axis must look the same
   on two computers. Another language is a `tickFormat`.

   Deliberately free of the DOM and of the scene, like workingTime.ts. */

import { DAY, HOUR, MINUTE } from "./workingTime";
import { tickStep } from "./ticks";
import { fieldsAt, fieldTicks, floorFields, inDoubledHour, instantOf, offsetAt, offsetName, wallMultipleTicks } from "./zone";

/** A readable step: `n` of a calendar unit. `ms` is its nominal length - a
    month as 30 days - which is all the choice of a step needs. */
export interface TimeStep {
  readonly unit: "minute" | "hour" | "day" | "month" | "year";
  readonly n: number;
  readonly ms: number;
}

const YEAR = 365 * DAY;

const STEPS: readonly TimeStep[] = [
  ...[1, 2, 5, 10, 15, 30].map((n) => ({ unit: "minute" as const, n, ms: n * MINUTE })),
  ...[1, 2, 3, 6, 12].map((n) => ({ unit: "hour" as const, n, ms: n * HOUR })),
  ...[1, 2, 7, 14].map((n) => ({ unit: "day" as const, n, ms: n * DAY })),
  ...[1, 2, 3, 6].map((n) => ({ unit: "month" as const, n, ms: n * 30 * DAY })),
];

/** The smallest readable step that yields no more ticks than `count` over
    `span`; above half a year whole years on the 1-2-5 grid. Not shorter than
    `atLeast` where that is given: the shortest real distance of a unit is
    never longer than its nominal length, so a nominal comparison needs no
    tolerance. */
export function timeStepFor(span: number, count: number, atLeast = 0): TimeStep {
  const raw = Math.max(span / Math.max(1, Math.floor(count)), atLeast);
  for (const step of STEPS) if (step.ms >= raw) return step;
  const n = Math.max(1, tickStep(raw / YEAR, 1));
  return { unit: "year", n, ms: n * YEAR };
}

/** The step boundaries within [from, to], ascending. Below a day they stand on
    the zone's whole multiples in real time - the hour a clock change doubles
    is ticked twice, the one it removes not at all; from a day on they stand
    on the zone's calendar fields. */
export function timeTicks(from: number, to: number, step: TimeStep, zone?: string): number[] {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return [];
  return step.unit === "minute" || step.unit === "hour"
    ? wallMultipleTicks(from, to, step.ms, zone)
    : fieldTicks(from, to, step.unit, step.n, zone);
}

/** A domain widened to the step boundaries around it - "nice" on a time axis. */
export function timeDomain(min: number, max: number, step: TimeStep, zone?: string): [number, number] {
  const upper = floorFields(max, step.unit, step.n, zone);
  const end = instantOf(upper, step.unit, step.n, 0, zone);
  const lower = instantOf(floorFields(min, step.unit, step.n, zone), step.unit, step.n, 0, zone);
  return [lower, end < max ? instantOf(upper, step.unit, step.n, 1, zone) : end];
}

type Formats = Record<"clock" | "clockSeconds" | "dayMonth" | "dayMonthYear" | "monthYear" | "yearOnly", Intl.DateTimeFormat>;

const formats = new Map<string, Formats>();

/** The formatters of one locale and zone, made once. The clock is 24-hour in every one. */
function formatsFor(locale: string, timeZone?: string): Formats {
  const key = `${locale}|${timeZone ?? ""}`;
  let f = formats.get(key);
  if (f === undefined) {
    const clock = { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone } as const;
    f = {
      clock: new Intl.DateTimeFormat(locale, clock),
      clockSeconds: new Intl.DateTimeFormat(locale, { ...clock, second: "2-digit" }),
      dayMonth: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone }),
      dayMonthYear: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone }),
      monthYear: new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone }),
      yearOnly: new Intl.DateTimeFormat(locale, { year: "numeric", timeZone }),
    };
    formats.set(key, f);
  }
  return f;
}

/** A clock text; inside the hour a clock change doubles, it carries its offset
    (`01:00 GMT-4`), which is all that tells the two apart. */
function clockText(t: number, f: Intl.DateTimeFormat, locale: string, zone?: string): string {
  const text = f.format(t);
  return inDoubledHour(t, zone) ? `${text} ${offsetName(t, locale, zone)}` : text;
}

/** An instant with its date and clock: `17 Mar 15:23` - the tooltip's x value,
    and a tick's label where the day has changed. Composed, because en-GB would
    put a comma between the two. With `seconds` the clock carries them:
    readings less than a minute apart would otherwise share one text. */
export function timeText(t: number, seconds = false, locale = "en-GB", zone?: string): string {
  if (!Number.isFinite(t)) return "";
  const f = formatsFor(locale, zone);
  return `${f.dayMonth.format(t)} ${clockText(t, seconds ? f.clockSeconds : f.clock, locale, zone)}`;
}

/** The labels of ascending ticks by the step's level. The first tick, and the
    first after a change of the level above, carries it: the clock its date,
    the day its year - a zoomed axis names its day even where no midnight
    falls into it. */
export function timeLabels(ticks: readonly number[], step: TimeStep, locale = "en-GB", zone?: string): string[] {
  const f = formatsFor(locale, zone);
  const dayOf = (t: number) => Math.floor((t + offsetAt(t, zone)) / DAY);
  const yearOf = (t: number) => fieldsAt(t, zone)[0];
  return ticks.map((t, i) => {
    const previous = i === 0 ? undefined : (ticks[i - 1] as number);
    switch (step.unit) {
      case "minute":
      case "hour":
        return previous === undefined || dayOf(previous) !== dayOf(t)
          ? timeText(t, false, locale, zone)
          : clockText(t, f.clock, locale, zone);
      case "day":
        return previous === undefined || yearOf(previous) !== yearOf(t)
          ? f.dayMonthYear.format(t)
          : f.dayMonth.format(t);
      case "month":
        return f.monthYear.format(t);
      default:
        return f.yearOnly.format(t);
    }
  });
}
