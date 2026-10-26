/* The days and the clock of a time zone. Without a zone the Date's local
   methods answer; with an IANA name the fields are read through Intl's
   `timeZone`, with no date library. */

/** The wall-clock fields of an instant. `month` counts from 0 and `weekday`
    from Sunday = 0, as the Date's own getters do. */
export interface ZoneFields {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  weekday: number;
}

/** The fields a wall clock shows. Time of day defaults to midnight; a field
    out of range carries over, as `new Date(y, m, d)` does. */
export interface ZoneClock {
  year: number;
  month: number;
  day: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

const QUARTER = 900_000;

const DAY = 86_400_000;

/* One formatter and two offset caches per zone. An offset only changes on a
   quarter hour, so `offsets` is keyed by it. `days` holds the offset of a UTC
   day whose first and last quarter hour agree - no change falls inside it -
   and spares the lookups for the rest of its quarter hours. */
const zones = new Map<
  string,
  { format: Intl.DateTimeFormat; offsets: Map<number, number>; days: Map<number, number | null> }
>();

function zoneOf(timeZone: string) {
  let zone = zones.get(timeZone);
  if (!zone) {
    // An unknown name throws Intl's RangeError here.
    const format = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      era: "short",
    });
    zone = { format, offsets: new Map(), days: new Map() };
    zones.set(timeZone, zone);
  }
  return zone;
}

/** The zone's offset from UTC at an instant, in milliseconds. */
function offsetAt(ms: number, timeZone: string): number {
  const day = Math.floor(ms / DAY);
  // Rows of a table come in runs of a few days: the last whole days are kept at hand.
  const slot = recent[((day % 8) + 8) % 8]!;
  if (slot.day === day && slot.zone === timeZone) return slot.offset;
  const zone = zoneOf(timeZone);
  let whole = zone.days.get(day);
  if (whole === undefined) {
    const first = quarterOffset(day * DAY, zone);
    whole = first === quarterOffset((day + 1) * DAY - QUARTER, zone) ? first : null;
    zone.days.set(day, whole);
  }
  if (whole === null) return quarterOffset(ms, zone);
  slot.day = day;
  slot.zone = timeZone;
  slot.offset = whole;
  return whole;
}

const recent = /* @__PURE__ */ Array.from({ length: 8 }, () => ({ day: NaN, zone: "", offset: 0 }));

function quarterOffset(ms: number, zone: ReturnType<typeof zoneOf>): number {
  const key = Math.floor(ms / QUARTER);
  let offset = zone.offsets.get(key);
  if (offset === undefined) {
    const at = key * QUARTER;
    const p: Record<string, string> = {};
    for (const part of zone.format.formatToParts(at)) p[part.type] = part.value;
    const year = p.era === "B" ? 1 - Number(p.year) : Number(p.year);
    const wall = new Date(0);
    wall.setUTCFullYear(year, Number(p.month) - 1, Number(p.day));
    wall.setUTCHours(Number(p.hour), Number(p.minute), Number(p.second), 0);
    offset = wall.getTime() - at;
    zone.offsets.set(key, offset);
  }
  return offset;
}

/** The wall-clock fields of an instant in a zone; `undefined` is the reader's. */
export function zoneFields(instant: Date | number, timeZone: string | undefined): ZoneFields {
  const ms = typeof instant === "number" ? instant : instant.getTime();
  if (timeZone === undefined) {
    const d = new Date(ms);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hours: d.getHours(),
      minutes: d.getMinutes(),
      seconds: d.getSeconds(),
      weekday: d.getDay(),
    };
  }
  const wall = ms + offsetAt(ms, timeZone);
  const days = Math.floor(wall / DAY);
  const [year, month, day] = civilFromDays(days);
  const rest = wall - days * DAY;
  return {
    year,
    month,
    day,
    hours: Math.floor(rest / 3_600_000),
    minutes: Math.floor(rest / 60_000) % 60,
    seconds: Math.floor(rest / 1000) % 60,
    weekday: (((days + 4) % 7) + 7) % 7,
  };
}

/* The proleptic Gregorian calendar by arithmetic (H. Hinnant's civil
   algorithms): the Date's own getters cost more than the offset lookup. */
function civilFromDays(z0: number): [number, number, number] {
  const z = z0 + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 2 : mp - 10;
  return [yoe + era * 400 + (month < 2 ? 1 : 0), month, day];
}

function daysFromCivil(year: number, month: number, day: number): number {
  const m = ((month % 12) + 12) % 12; // 0 = January
  const yy = year + Math.floor(month / 12) - (m < 2 ? 1 : 0);
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m < 2 ? m + 10 : m - 2) + 2) / 5);
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468 + day - 1;
}

/**
 * The instant at which a zone's clock shows the given fields; `undefined` is
 * the reader's zone. A time the clock skips moves forward, as the Date does,
 * and a doubled one takes the earlier occurrence.
 */
export function zoneInstant(clock: ZoneClock, timeZone: string | undefined): Date {
  const { year, month, day, hours = 0, minutes = 0, seconds = 0, milliseconds = 0 } = clock;
  if (timeZone === undefined) return new Date(year, month, day, hours, minutes, seconds, milliseconds);
  const w = daysFromCivil(year, month, day) * DAY + hours * 3_600_000 + minutes * 60_000 + seconds * 1000 + milliseconds;
  // The offsets a day before and after bracket a change on that day.
  const before = offsetAt(w - 86_400_000, timeZone);
  const after = offsetAt(w + 86_400_000, timeZone);
  if (before === after) return new Date(w - before);
  const early = w - before;
  const late = w - after;
  if (offsetAt(early, timeZone) === before) return new Date(early);
  return new Date(offsetAt(late, timeZone) === after ? late : early);
}

/** The instant at which the zone's day containing `instant` begins; `undefined`
    is the reader's zone. */
export function zoneDayStart(instant: Date | number, timeZone: string | undefined): Date {
  const { year, month, day } = zoneFields(instant, timeZone);
  return zoneInstant({ year, month, day }, timeZone);
}
