/* The time axis of the schedule: what the two bands show, and how pan and zoom
   exchange the domain.

   The scale stays affine (ADR-0001). The domain is in OPERATING time - with no
   calendar that is the wall clock itself - and pan and zoom exchange the domain
   and nothing else. The stepping, the calendar mapping and the tick placement
   are @umriss-ui/charts' (ADR-0022); what is the schedule's own is the choice
   between them: a fine band from the quarter hour to the day, and a coarse band
   of local days.

   Deliberately free of the DOM and of the scene. */

import {
  calendarFrom,
  DAY,
  MINUTE,
  operatingTimeTicks,
  timeStep,
  toOperatingTimeClamped,
  toWallClock,
  type CalendarInput,
  type OperatingTimeTick,
} from "@umriss-ui/charts";
import { localOffset } from "./snap";

/** Nothing removed: the wall clock is the axis. */
const WALL_CLOCK: CalendarInput = [];

/** Smallest distance between two labels of the fine band, in pixels. */
export const TICK_SPACING = 56;

/** The fine step at a zoom: the smallest readable step whose labels stand at
    least `spacing` pixels apart - never finer than the quarter hour, which is
    the finest a plant plans in, and never coarser than the day, which is the
    coarse band's. */
export function fineStep(msPerPx: number, spacing = TICK_SPACING): number {
  if (!(msPerPx > 0)) return 15 * MINUTE;
  return Math.min(DAY, Math.max(15 * MINUTE, timeStep(msPerPx * spacing, 1)));
}

/** The ticks of the fine band within a domain: on local multiples of the step,
    whatever lies in removed time dropped, each with where it stands on the
    clock (the label) and where it lies on the axis. */
export function fineTicks(
  domain: readonly [number, number],
  step: number,
  calendar: CalendarInput = WALL_CLOCK,
): OperatingTimeTick[] {
  const [from, to] = wallExtentWithin(domain, calendar);
  return operatingTimeTicks(calendar, from, to, step, localOffset(from)).filter(
    (tick) => tick.operatingTime >= domain[0] && tick.operatingTime <= domain[1],
  );
}

/** One local day of the coarse band. */
export interface Day {
  /** Local midnight at its start, on the wall clock. */
  readonly start: number;
  /** Local midnight at its end - 23 or 25 hours later on a clock change. */
  readonly end: number;
  /** Where it begins on the axis, in operating time. */
  readonly from: number;
  /** Where it ends on the axis; equal to `from` where the calendar removes it. */
  readonly to: number;
}

/** The local days a domain touches, from the midnight before its start. */
export function days(domain: readonly [number, number], calendar: CalendarInput = WALL_CLOCK): Day[] {
  const [from, to] = wallExtentWithin(domain, calendar);
  const found: Day[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  while (cursor.getTime() < to && found.length < 400) {
    const start = cursor.getTime();
    cursor.setDate(cursor.getDate() + 1);
    const end = cursor.getTime();
    found.push({
      start,
      end,
      from: toOperatingTimeClamped(start, calendar),
      to: toOperatingTimeClamped(end, calendar),
    });
  }
  return found;
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

/** The wall-clock extent of the part of a domain that exists: a calendar has
    no wall clock before 0 or after its total. */
function wallExtentWithin(domain: readonly [number, number], input: CalendarInput): [number, number] {
  const calendar = calendarFrom(input);
  if (calendar.intervals.length === 0) return [domain[0], domain[1]];
  const inside = (v: number) => Math.max(0, Math.min(calendar.total, v));
  return [toWallClock(inside(domain[0]), calendar), toWallClock(inside(domain[1]), calendar)];
}
