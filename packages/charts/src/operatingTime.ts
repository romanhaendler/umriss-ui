/* Operating time: the mapping of wall clock time into operating time and back.

   A week of production data on a wall clock axis is, for a good forty per cent,
   a flat line over an empty hall. An operating calendar - a list of intervals in
   which time counts - takes that time out.

   The axis stays affine (ADR-0001): it is not the scale that calculates, it is
   materialisation that maps the x channel beforehand. ADR-0001 itself names
   exactly this route for a non-affine axis; the calendar is its first user. It
   costs the drawing loop nothing.

   The mapping is monotonically non-decreasing, constant across a removed
   interval, and both directions are needed: inwards for materialisation and
   ticks, back for the pointer position in the tooltip.

   Deliberately free of the DOM and of the scene, like bars.ts.

   Explicitly not here: deriving the intervals from a shift model. Turning a
   shift plan with its exceptions, holidays and handovers into a list of
   intervals is a plant data problem and belongs above this library. The same
   goes for the time zone: whoever wants the day boundaries of a local time
   passes them as an offset. */

import { tickStep } from "./ticks";

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** An interval in which time counts; thought of as half-open, but mappable from
    both sides at its edges: both `from` and `to` have an operating time. */
export interface OperatingInterval {
  readonly from: number;
  readonly to: number;
}

/** An operating calendar: sorted, merged intervals with the operating time
    accumulated before each one begins. An empty calendar is no calendar: it maps
    unchanged.

    Build once, then pass around: the mapping runs once per point, and were it to
    sort and accumulate every time, the calendar would be the most expensive
    thing about the frame. */
export interface OperatingCalendar {
  readonly intervals: readonly OperatingInterval[];
  /** Operating time accumulated before the respective interval begins. */
  readonly offsets: readonly number[];
  /** The whole operating time - the axis' extent is [0, total]. */
  readonly total: number;
}

/** Every function of this module takes either: the raw list as it stands on the
    axis, or the calendar built from it. */
export type CalendarInput = OperatingCalendar | readonly OperatingInterval[];

/** Builds a calendar: sorts, merges overlapping and abutting intervals and
    throws away empty, reversed and non-finite ones. Merging is not a courtesy
    but a precondition: only over separated intervals is the reverse mapping
    unambiguous. */
export function operatingCalendar(
  intervals: readonly OperatingInterval[],
): OperatingCalendar {
  const usable = intervals
    .filter((i) => Number.isFinite(i.from) && Number.isFinite(i.to) && i.to > i.from)
    .sort((a, b) => a.from - b.from);

  const merged: OperatingInterval[] = [];
  for (const i of usable) {
    const last = merged[merged.length - 1];
    if (last !== undefined && i.from <= last.to) {
      if (i.to > last.to) merged[merged.length - 1] = { from: last.from, to: i.to };
    } else {
      merged.push({ from: i.from, to: i.to });
    }
  }

  const offsets: number[] = [];
  let total = 0;
  for (const i of merged) {
    offsets.push(total);
    total += i.to - i.from;
  }
  return { intervals: merged, offsets, total };
}

/* One calendar, built once per list. Materialisation calls the mapping once per
   point - with a million points; were it to sort and accumulate every time, the
   calendar would be the most expensive thing about the frame. The key is the
   list itself, which is exactly what the axis holds. */
const built = new WeakMap<object, OperatingCalendar>();

/** Calendar from an input - a built calendar is passed straight through, a raw
    list is built once and remembered. */
export function calendarFrom(input: CalendarInput): OperatingCalendar {
  if (!Array.isArray(input)) return input as OperatingCalendar;
  const list = input as readonly OperatingInterval[];
  const known = built.get(list);
  if (known !== undefined) return known;
  const fresh = operatingCalendar(list);
  built.set(list, fresh);
  return fresh;
}

/** Index of the interval that contains the wall clock time (edges included);
    -1 when it lies in removed time. Binary search over the beginnings. */
function findInterval(calendar: OperatingCalendar, wallClock: number): number {
  const intervals = calendar.intervals;
  let lo = 0;
  let hi = intervals.length - 1;
  let hit = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if ((intervals[mid] as OperatingInterval).from <= wallClock) {
      hit = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (hit < 0) return -1;
  return wallClock <= (intervals[hit] as OperatingInterval).to ? hit : -1;
}

/** Wall clock time → operating time.

    A point in a removed interval is a gap and becomes `NaN` - the encoding every
    gap of this library already uses, and the drawing loop breaks the mark at it
    of its own accord. Not the edge of the interval: a measurement from a time
    which, according to the calendar, did not exist could not be laid there
    honestly; it would pile up on what really does lie there. The same holds
    before the first and after the last interval.

    The end of one interval and the beginning of the next fall on the same value:
    in operating time they are neighbours, and the line between two points on
    either side is drawn. That is not a lie but the whole purpose of the axis; the
    mark in the axis band tells the reader that time was taken out there. */
export function toOperatingTime(wallClock: number, input: CalendarInput): number {
  const calendar = calendarFrom(input);
  if (calendar.intervals.length === 0) return wallClock;
  const index = findInterval(calendar, wallClock);
  if (index < 0) return Number.NaN;
  return (
    (calendar.offsets[index] as number) +
    (wallClock - (calendar.intervals[index] as OperatingInterval).from)
  );
}

/** Operating time → wall clock time; outside [0, total] there is none.

    At a seam - the end of an interval which is at the same time the beginning of
    the next - the beginning of the next comes out: from there time counts again,
    and a pointer aiming there aims at the coming shift. Only the end of the last
    interval has no next and comes back as itself. */
export function toWallClock(operatingTime: number, input: CalendarInput): number {
  const calendar = calendarFrom(input);
  const intervals = calendar.intervals;
  if (intervals.length === 0) return operatingTime;
  if (!(operatingTime >= 0) || operatingTime > calendar.total) return Number.NaN;
  if (operatingTime === calendar.total) {
    return (intervals[intervals.length - 1] as OperatingInterval).to;
  }
  let lo = 0;
  let hi = intervals.length - 1;
  let hit = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if ((calendar.offsets[mid] as number) <= operatingTime) {
      hit = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return (
    (intervals[hit] as OperatingInterval).from +
    (operatingTime - (calendar.offsets[hit] as number))
  );
}

/** Map a whole series inwards - the route materialisation takes when it wants to
    go it in one piece. Only the first n values are touched. */
export function mapSeries(
  input: CalendarInput,
  source: Float64Array,
  n: number,
  target: Float64Array,
): void {
  const calendar = calendarFrom(input);
  for (let i = 0; i < n; i++) {
    target[i] = toOperatingTime(source[i] as number, calendar);
  }
}

/** Wall clock time → operating time, but without NaN: whatever lies in removed
    time falls onto the seam that this span collapses onto anyway; whatever lies
    before the first or after the last interval onto 0 or onto the whole
    operating time respectively.

    Why this exists: the materialised x values must stay ascending. Binary search
    - for a hit as for a segment boundary - assumes that, and every comparison
    with NaN is false, so that a search over a block of NaN silently lands on the
    wrong point. The clamped value is a POSITION, not a statement: the point
    itself is carried as a gap and is never drawn and never hit. */
export function toOperatingTimeClamped(wallClock: number, input: CalendarInput): number {
  const calendar = calendarFrom(input);
  if (calendar.intervals.length === 0) return wallClock;
  const inside = toOperatingTime(wallClock, calendar);
  if (!Number.isNaN(inside)) return inside;
  if (!Number.isFinite(wallClock)) return Number.NaN;
  // The seam of the first span that begins after the value.
  for (let i = 0; i < calendar.intervals.length; i++) {
    const interval = calendar.intervals[i] as OperatingInterval;
    if (wallClock < interval.from) return calendar.offsets[i] as number;
  }
  return calendar.total;
}

/** Does this point in time lie in removed time? The question
    `toOperatingTimeClamped` deliberately no longer answers. */
export function inRemovedTime(wallClock: number, input: CalendarInput): boolean {
  const calendar = calendarFrom(input);
  if (calendar.intervals.length === 0) return false;
  return Number.isNaN(toOperatingTime(wallClock, calendar));
}

/** A removed span and the place it collapses onto. */
export interface RemovedSpan {
  readonly from: number;
  readonly to: number;
  /** Operating time on which the whole span lies - a point, not a stretch. */
  readonly operatingTime: number;
}

/** The removed spans between the operating intervals, for the mark in the axis
    band. A chart that takes a weekend out and does not say so claims a
    continuity it does not have. Before the first and after the last interval
    there is nothing to mark: that lies outside the axis' extent. */
export function removedIntervals(input: CalendarInput): RemovedSpan[] {
  const calendar = calendarFrom(input);
  const spans: RemovedSpan[] = [];
  for (let i = 1; i < calendar.intervals.length; i++) {
    spans.push({
      from: (calendar.intervals[i - 1] as OperatingInterval).to,
      to: (calendar.intervals[i] as OperatingInterval).from,
      operatingTime: calendar.offsets[i] as number,
    });
  }
  return spans;
}

/** The breaks in operating time that lie within the extent [from, to] - what the
    axis must mark, in domain units. */
export function breaks(input: CalendarInput, from: number, to: number): number[] {
  return removedIntervals(input)
    .map((s) => s.operatingTime)
    .filter((b) => b >= from && b <= to);
}

/* Readable steps: seconds, minutes, hours, days - the boundaries a clock stands
   on. The 1-2-5 grid from ticks.ts suits numbers, not time: it would yield steps
   of five hours and a reader doing arithmetic. */
const TIME_STEPS: readonly number[] = [
  SECOND, 2 * SECOND, 5 * SECOND, 10 * SECOND, 15 * SECOND, 30 * SECOND,
  MINUTE, 2 * MINUTE, 5 * MINUTE, 10 * MINUTE, 15 * MINUTE, 30 * MINUTE,
  HOUR, 2 * HOUR, 3 * HOUR, 6 * HOUR, 12 * HOUR,
  DAY, 2 * DAY, 7 * DAY, 14 * DAY, 28 * DAY,
];

/** Step for tick candidates in wall clock time, at an intended count. Rounded up
    to the next readable step, so that no more ticks arise than wanted. Above the
    day steps it continues in whole days. */
export function timeStep(span: number, count: number): number {
  const smallest = TIME_STEPS[0] as number;
  if (!Number.isFinite(span) || span <= 0) return smallest;
  const raw = span / Math.max(1, Math.floor(count));
  for (const step of TIME_STEPS) if (step >= raw) return step;
  return DAY * tickStep(raw / DAY, 1);
}

/** A tick: where it stands on the clock and where it lies on the axis. */
export interface OperatingTimeTick {
  readonly wallClock: number;
  readonly operatingTime: number;
}

/** Ticks for an operating time axis, from an extent in WALL CLOCK TIME.

    The candidates arise in wall clock time on multiples of the step - hours,
    shift changes, days - whatever lies in removed time falls away, the rest is
    mapped. Never the other way round: ticks generated in operating time land in
    the middle of a shift and yield an axis labelled 14.5 and 29.0 which nobody
    can read.

    The offset shifts the grid; with it a local time hits its own midnight without
    this module having to know about time zones.

    If two candidates fall on the same operating time - the end of one shift and
    the beginning of the next - the earlier one stays: two labels on the same
    pixel would be one too many.

    Both times come back, because the axis needs both: the operating time to
    place the tick, the wall clock time to label it. */
export function operatingTimeTicks(
  input: CalendarInput,
  from: number,
  to: number,
  step: number,
  offset = 0,
): OperatingTimeTick[] {
  const calendar = calendarFrom(input);
  const ticks: OperatingTimeTick[] = [];
  if (!Number.isFinite(from) || !Number.isFinite(to) || !(step > 0)) return ticks;
  const first = Math.ceil((from - offset) / step);
  const last = Math.floor((to - offset) / step);
  if (!Number.isFinite(first) || !Number.isFinite(last)) return ticks;
  let previous = Number.NaN;
  for (let k = first; k <= last; k++) {
    const wallClock = offset + k * step;
    const operatingTime = toOperatingTime(wallClock, calendar);
    if (Number.isNaN(operatingTime) || operatingTime === previous) continue;
    ticks.push({ wallClock, operatingTime });
    previous = operatingTime;
  }
  return ticks;
}

/** Tick values for an axis extent that already stands in OPERATING TIME - the
    route the axis layout takes.

    The extent is trimmed to the operating time that exists (an extent widened to
    nice boundaries reaches beyond it), calculated back into wall clock time, and
    the candidates arise there. The step comes from the span in operating time and
    not from the one in wall clock time: roughly one candidate per step of
    operating time survives, and calculated from the wall clock span, four out of
    ten wanted ticks would be left. */
export function operatingTicks(
  input: CalendarInput,
  from: number,
  to: number,
  count: number,
  offset = 0,
): number[] {
  const calendar = calendarFrom(input);
  if (calendar.intervals.length === 0 || !(to > from)) return [];
  const insideFrom = Math.max(0, Math.min(calendar.total, from));
  const insideTo = Math.max(0, Math.min(calendar.total, to));
  const step = timeStep(to - from, count);
  const ticks = operatingTimeTicks(
    calendar,
    toWallClock(insideFrom, calendar),
    toWallClock(insideTo, calendar),
    step,
    offset,
  );
  return ticks.map((t) => t.operatingTime).filter((b) => b >= from && b <= to);
}
