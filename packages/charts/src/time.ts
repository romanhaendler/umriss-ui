/* The time axis: ticks on LOCAL boundaries from the minute to the month, and
   their labels by level (charts-essentials 01).

   A candidate is built from the local calendar fields - `new Date(y, m, d + k)`
   and not `start + k · DAY` - so that a day is 23 or 25 hours long where the
   clock changes, and a tick after the change still says 00:00. One offset for
   the whole grid could not do that.

   The labels are en-GB with a 24-hour clock, by level: `15:00`, `17 Mar`,
   `Mar 2026`, `2026`. Fixed, not the machine's locale: the same axis must look the same
   on two computers (library-audit 03). Another language is a `tickFormat`.

   Deliberately free of the DOM and of the scene, like operatingTime.ts. */

import { DAY, HOUR, MINUTE } from "./operatingTime";
import { tickStep } from "./ticks";

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
    `span`; above half a year whole years on the 1-2-5 grid. */
export function timeStepFor(span: number, count: number): TimeStep {
  const raw = span / Math.max(1, Math.floor(count));
  for (const step of STEPS) if (step.ms >= raw) return step;
  const n = Math.max(1, tickStep(raw / YEAR, 1));
  return { unit: "year", n, ms: n * YEAR };
}

/** Index of the unit among the local fields [year, month, day, hour, minute]. */
const FIELD = { year: 0, month: 1, day: 2, hour: 3, minute: 4 } as const;

/** The local fields of the step boundary at or before `t`. Days count from the
    epoch's Monday, so that a week starts on one and two days stay two apart
    across a month's end. */
function floorFields(t: number, step: TimeStep): number[] {
  const d = new Date(t);
  const fields = [d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()];
  const i = FIELD[step.unit];
  for (let j = i + 1; j < fields.length; j++) fields[j] = j === FIELD.day ? 1 : 0;
  const value = fields[i] as number;
  if (step.unit === "day") {
    const day = Math.round(Date.UTC(fields[0] as number, fields[1] as number, value) / DAY);
    fields[i] = value - ((((day + 3) % step.n) + step.n) % step.n);
  } else {
    fields[i] = Math.floor(value / step.n) * step.n;
  }
  return fields;
}

/** The instant `k` steps after the floored fields - the Date constructor
    carries the overflow into the next field. */
function instant(fields: readonly number[], step: TimeStep, k: number): number {
  const f = fields.slice();
  f[FIELD[step.unit]] = (f[FIELD[step.unit]] as number) + k * step.n;
  return new Date(f[0] as number, f[1] as number, f[2], f[3], f[4]).getTime();
}

/** The step boundaries within [from, to], ascending; a boundary the clock
    change doubles counts once. */
export function timeTicks(from: number, to: number, step: TimeStep): number[] {
  const out: number[] = [];
  if (!Number.isFinite(from) || !Number.isFinite(to)) return out;
  const fields = floorFields(from, step);
  // ponytail: capped at 1000 candidates; a tickCount that asks for more gets fewer.
  for (let k = 0; k < 1000; k++) {
    const t = instant(fields, step, k);
    if (t > to) break;
    if (t >= from && !(t <= (out[out.length - 1] as number))) out.push(t);
  }
  return out;
}

/** A domain widened to the step boundaries around it - "nice" on a time axis. */
export function timeDomain(min: number, max: number, step: TimeStep): [number, number] {
  const upper = floorFields(max, step);
  const end = instant(upper, step, 0);
  return [instant(floorFields(min, step), step, 0), end < max ? instant(upper, step, 1) : end];
}

const CLOCK = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const DAY_MONTH = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const DAY_MONTH_YEAR = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const MONTH_YEAR = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const YEAR_ONLY = new Intl.DateTimeFormat("en-GB", { year: "numeric" });

/** An instant with its date and clock: `17 Mar 15:23` - the tooltip's x value,
    and a tick's label where the day has changed. Composed, because en-GB would
    put a comma between the two. */
export function timeText(t: number): string {
  if (!Number.isFinite(t)) return "";
  return `${DAY_MONTH.format(t)} ${CLOCK.format(t)}`;
}

/** The labels of ascending ticks by the step's level. The first tick after a
    change of the level above carries it: the clock its date, the day its
    year. */
export function timeLabels(ticks: readonly number[], step: TimeStep): string[] {
  return ticks.map((t, i) => {
    const previous = i === 0 ? undefined : new Date(ticks[i - 1] as number);
    const d = new Date(t);
    switch (step.unit) {
      case "minute":
      case "hour":
        return previous !== undefined && previous.toDateString() !== d.toDateString()
          ? timeText(t)
          : CLOCK.format(t);
      case "day":
        return previous !== undefined && previous.getFullYear() !== d.getFullYear()
          ? DAY_MONTH_YEAR.format(t)
          : DAY_MONTH.format(t);
      case "month":
        return MONTH_YEAR.format(t);
      default:
        return YEAR_ONLY.format(t);
    }
  });
}
