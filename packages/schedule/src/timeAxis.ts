/* The time axis of the schedule: what the two bands show, and how pan and zoom
   exchange the domain.

   The scale stays affine (ADR-0001). The domain is in WORKING time - with no
   calendar that is the wall clock itself - and pan and zoom exchange the domain
   and nothing else. The stepping, the calendar mapping and the tick placement
   are @umriss-ui/charts' (ADR-0022); what is the schedule's own is the choice
   between them: a fine band from the quarter hour to the day, and a coarse band
   of the zone's days.

   Deliberately free of the DOM and of the scene. */

import { zoneFields, zoneInstant, type Formats } from "@umriss-ui/core";
import {
  calendarFrom,
  DAY,
  inDoubledHour,
  localOffset,
  MINUTE,
  workingTimeTicks,
  timeStep,
  toWorkingTimeClamped,
  toWallClock,
  type CalendarInput,
  type WorkingTimeTick,
} from "@umriss-ui/charts";

/** Nothing removed: the wall clock is the axis. */
const WALL_CLOCK: CalendarInput = [];

/** Smallest distance between two labels of the fine band, in pixels. */
export const TICK_SPACING = 56;

/** How much larger than the default 16 px the root font size is, never below 1:
    lanes and label spacing grow by it, and shrink never. */
export function fontScaleOf(rootPx: number): number {
  return rootPx > 16 ? rootPx / 16 : 1;
}

/** The fine step at a zoom: the smallest readable step whose labels stand at
    least `spacing` pixels apart - never finer than the quarter hour, which is
    the finest a planner plans in, and never coarser than the day, which is the
    coarse band's. */
export function fineStep(msPerPx: number, spacing = TICK_SPACING): number {
  if (!(msPerPx > 0)) return 15 * MINUTE;
  return Math.min(DAY, Math.max(15 * MINUTE, timeStep(msPerPx * spacing, 1)));
}

/* The reader's zone by name, so that the reader's clock changes are ticked by
   the same rule as a named zone's. */
const readerZone = (): string => new Intl.DateTimeFormat().resolvedOptions().timeZone;

/** The ticks of the fine band within a domain: on multiples of the step in the
    zone's real time, whatever lies in removed time dropped, each with where it
    stands on the clock (the label) and where it lies on the axis. */
export function fineTicks(
  domain: readonly [number, number],
  step: number,
  calendar: CalendarInput = WALL_CLOCK,
  timeZone?: string,
): WorkingTimeTick[] {
  const [from, to] = wallExtentWithin(domain, calendar);
  return workingTimeTicks(calendar, from, to, step, 0, timeZone ?? readerZone()).filter(
    (tick) => tick.workingTime >= domain[0] && tick.workingTime <= domain[1],
  );
}

/** One day of the coarse band, in the zone. */
export interface Day {
  /** The zone's midnight at its start, on the wall clock. */
  readonly start: number;
  /** Where it begins on the axis, in working time. */
  readonly from: number;
  /** Where it ends on the axis; equal to `from` where the calendar removes it. */
  readonly to: number;
}

/** The days of the zone a domain touches, from the midnight before its start. */
export function days(domain: readonly [number, number], calendar: CalendarInput = WALL_CLOCK, timeZone?: string): Day[] {
  const [from, to] = wallExtentWithin(domain, calendar);
  const found: Day[] = [];
  const { year, month, day } = zoneFields(from, timeZone);
  let date = day;
  let end = zoneInstant({ year, month, day: date }, timeZone).getTime();
  while (end < to && found.length < 400) {
    const start = end;
    end = zoneInstant({ year, month, day: ++date }, timeZone).getTime();
    found.push({
      start,
      from: toWorkingTimeClamped(start, calendar),
      to: toWorkingTimeClamped(end, calendar),
    });
  }
  return found;
}

/* How many days one date may speak for once a day is too narrow for its own:
   every day, every other day, then whole weeks. */
const DAY_RUNS: readonly number[] = [1, 2, 7, 14, 28];

/** Every how many days a date is written, where a day is `dayWidth` pixels wide
    and a date needs `room`: the shortest run of days that holds one. A phone
    showing ten days gives each about eighteen pixels, and a date written on
    every one of them ran into the next. */
export function dayRun(dayWidth: number, room: number): number {
  return DAY_RUNS.find((run) => run * dayWidth >= room) ?? (DAY_RUNS[DAY_RUNS.length - 1] as number);
}

/** Whether the day that begins at `start` opens a run of `run` days.
    Counted from the formats' week start (1 = Monday ... 7 = Sunday), so that a
    week's date stands on its first day - and
    counted on the calendar, not in the view, so that the dates hold still while
    the plot pans instead of hopping from day to day. */
export function opensRun(start: number, run: number, timeZone?: string, weekStart = 1): boolean {
  /* The day's number in the zone since 1 January 1970; the 5th, day 4, was a Monday.
     Rounded, because a grid laid on one offset is an hour off after a clock
     change (`localOffset`). */
  const day = Math.round((start - localOffset(start, timeZone)) / DAY);
  return (((day - 3 - weekStart) % run) + run) % run === 0;
}

/** The clock time of an instant; inside the hour a clock change doubles it
    carries its offset (`02:30 GMT+2`), so the two readings differ. */
export function timeText(formats: Formats, instant: number): string {
  const text = formats.time(new Date(instant), false);
  return inDoubledHour(instant, formats.timeZone)
    ? `${text} ${formats.offset(new Date(instant))}`
    : text;
}

/** The narrowest and the widest span zoom may reach. */
export interface ZoomLimits {
  readonly min: number;
  readonly max: number;
}

/** Zoom by `factor` (below 1 is closer) around `anchor`, which keeps its place;
    the span stays within the limits. */
export function zoomDomain(
  domain: readonly [number, number],
  anchor: number,
  factor: number,
  limits: ZoomLimits,
): [number, number] {
  const span = domain[1] - domain[0];
  if (!(span > 0)) return [domain[0], domain[1]];
  const next = Math.min(limits.max, Math.max(limits.min, span * factor));
  const share = (anchor - domain[0]) / span;
  const from = anchor - share * next;
  return [from, from + next];
}

/** Pan: both ends move by the same amount. */
export function panDomain(domain: readonly [number, number], delta: number): [number, number] {
  return [domain[0] + delta, domain[1] + delta];
}

/** The wall-clock time of a working time, within the calendar's extent: a
    calendar has no wall clock before 0 or after its total. */
export function wallClockWithin(working: number, input: CalendarInput): number {
  const calendar = calendarFrom(input);
  if (calendar.intervals.length === 0) return working;
  return toWallClock(Math.max(0, Math.min(calendar.total, working)), calendar);
}

/** The wall-clock extent of the part of a domain that exists. */
function wallExtentWithin(domain: readonly [number, number], input: CalendarInput): [number, number] {
  return [wallClockWithin(domain[0], input), wallClockWithin(domain[1], input)];
}
