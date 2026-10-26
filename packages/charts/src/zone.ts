/* A time zone's arithmetic, charts' own (ADR-0031: charts import nothing, so
   core's seam is built here a second time).

   Without a zone every function reads the Date's local methods, so the reader's
   zone keeps today's path; with an IANA name, Intl's wall clock stands in for
   them. The offset of a zone is cached per quarter hour: no zone changes its
   offset inside one.

   Deliberately free of the DOM and of the scene, like workingTime.ts. */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const QUARTER = 15 * MINUTE;

export type StepUnit = "minute" | "hour" | "day" | "month" | "year";

const clocks = new Map<string, Intl.DateTimeFormat>();
const offsets = new Map<string, Map<number, number>>();

/** Throws Intl's `RangeError` for a name that is no time zone. */
export function checkZone(zone: string): void {
  offsetAt(0, zone);
}

/** The wall clock minus the instant, in ms: east of Greenwich positive. */
export function offsetAt(t: number, zone?: string): number {
  if (zone === undefined) return -new Date(t).getTimezoneOffset() * MINUTE;
  let format = clocks.get(zone);
  let cache = offsets.get(zone);
  if (format === undefined || cache === undefined) {
    format = new Intl.DateTimeFormat("en-US", {
      timeZone: zone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric",
    });
    cache = new Map();
    clocks.set(zone, format);
    offsets.set(zone, cache);
  }
  const quarter = Math.floor(t / QUARTER);
  let offset = cache.get(quarter);
  if (offset === undefined) {
    const start = quarter * QUARTER;
    const p: Record<string, number> = {};
    for (const part of format.formatToParts(start)) if (part.type !== "literal") p[part.type] = Number(part.value);
    offset = Date.UTC(p.year as number, (p.month as number) - 1, p.day as number, p.hour as number, p.minute as number, p.second as number) - start;
    if (cache.size > 20_000) cache.clear();
    cache.set(quarter, offset);
  }
  return offset;
}

/** [year, month, day, hour, minute] of the zone's clock at an instant. */
export function fieldsAt(t: number, zone?: string): number[] {
  if (zone === undefined) {
    const d = new Date(t);
    return [d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()];
  }
  const d = new Date(t + offsetAt(t, zone));
  return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes()];
}

/** The instants at which the zone's clock shows `wall` (a wall clock as ms of
    a UTC epoch): none in the missing hour, two in the doubled one. */
export function instantsAtWall(wall: number, zone?: string): number[] {
  const before = offsetAt(wall - DAY, zone);
  const after = offsetAt(wall + DAY, zone);
  const out: number[] = [];
  for (const o of before === after ? [before] : [before, after]) {
    const t = wall - o;
    if (offsetAt(t, zone) === o) out.push(t);
  }
  return out.sort((a, b) => a - b);
}

/** The instant at which the clock shows `wall`: the earlier of a doubled
    hour, and a missing one moves forward. */
export function atWall(wall: number, zone?: string): number {
  return instantsAtWall(wall, zone)[0] ?? wall - offsetAt(wall - DAY, zone);
}

/** Does the clock show this instant's time twice? */
export function inDoubledHour(t: number, zone?: string): boolean {
  return instantsAtWall(t + offsetAt(t, zone), zone).length > 1;
}

const FIELD = { year: 0, month: 1, day: 2, hour: 3, minute: 4 } as const;

/** The fields of the step boundary at or before `t`. Days count from the
    epoch's Monday, so that a week starts on one and two days stay two apart
    across a month's end. */
export function floorFields(t: number, unit: StepUnit, n: number, zone?: string): number[] {
  const fields = fieldsAt(t, zone);
  const i = FIELD[unit];
  for (let j = i + 1; j < fields.length; j++) fields[j] = j === FIELD.day ? 1 : 0;
  const value = fields[i] as number;
  if (unit === "day") {
    const day = Math.round(Date.UTC(fields[0] as number, fields[1] as number, value) / DAY);
    fields[i] = value - ((((day + 3) % n) + n) % n);
  } else {
    fields[i] = Math.floor(value / n) * n;
  }
  return fields;
}

/** The instant `k` steps after the floored fields - Date.UTC carries the
    overflow into the next field. */
export function instantOf(fields: readonly number[], unit: StepUnit, n: number, k: number, zone?: string): number {
  const f = fields.slice();
  f[FIELD[unit]] = (f[FIELD[unit]] as number) + k * n;
  return atWall(Date.UTC(f[0] as number, f[1] as number, f[2] as number, f[3], f[4]), zone);
}

/** Boundaries of a calendar step - a day or longer - within [from, to]: the
    zone's own midnights, 23 or 25 hours apart where the clock changes. */
export function fieldTicks(from: number, to: number, unit: StepUnit, n: number, zone?: string): number[] {
  const out: number[] = [];
  const fields = floorFields(from, unit, n, zone);
  // ponytail: capped at 1000 candidates; a tickCount that asks for more gets fewer.
  for (let k = 0; k < 1000; k++) {
    const t = instantOf(fields, unit, n, k, zone);
    if (t > to) break;
    if (t >= from && !(t <= (out[out.length - 1] as number))) out.push(t);
  }
  return out;
}

/** Instants within [from, to] at which the zone's clock stands on a whole
    multiple of `ms`, in real time on both sides of a change: the missing
    hour has none, the doubled one has each twice. */
export function wallMultipleTicks(from: number, to: number, ms: number, zone?: string): number[] {
  const a = offsetAt(from, zone);
  const b = offsetAt(to, zone);
  const lo = Math.floor((from + Math.min(a, b) - 3 * HOUR) / ms);
  const hi = Math.min(Math.ceil((to + Math.max(a, b) + 3 * HOUR) / ms), lo + 1200);
  const out: number[] = [];
  for (let k = lo; k <= hi; k++) for (const t of instantsAtWall(k * ms, zone)) if (t >= from && t <= to) out.push(t);
  return out.sort((x, y) => x - y);
}

const names = new Map<string, Intl.DateTimeFormat>();

function nameFormat(locale: string, zone: string | undefined, style: "shortOffset" | "shortGeneric"): Intl.DateTimeFormat {
  const key = `${locale}|${zone ?? ""}|${style}`;
  let f = names.get(key);
  if (f === undefined) {
    f = new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: style });
    names.set(key, f);
  }
  return f;
}

function nameOf(f: Intl.DateTimeFormat, t: number): string {
  return f.formatToParts(t).find((p) => p.type === "timeZoneName")?.value ?? "";
}

/** `GMT-4`: the offset at an instant, for a label inside the doubled hour. */
export function offsetName(t: number, locale: string, zone?: string): string {
  return nameOf(nameFormat(locale, zone, "shortOffset"), t);
}

/** The zone's generic name, `Central European Time`, in the locale; the
    label of the axis title. */
export function zoneName(zone: string, locale: string): string {
  return nameOf(nameFormat(locale, zone, "shortGeneric"), Date.now()) || zone;
}

/** Does the reader's zone differ from the named one by name, both
    canonicalised through Intl? */
export function differsFromReader(zone: string): boolean {
  const canonical = (z?: string) => new Intl.DateTimeFormat(undefined, { timeZone: z }).resolvedOptions().timeZone;
  return canonical() !== canonical(zone);
}
