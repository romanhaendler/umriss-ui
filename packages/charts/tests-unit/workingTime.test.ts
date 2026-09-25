/* Working time: the mapping of wall clock time into working time and back.

   Every expected value is calculated by hand out of the calendar, never by running
   the mapping. That matters more here than elsewhere: a mapping that is wrong in
   itself round-trips impeccably. */

import { describe, expect, it } from "vitest";
import {
  workingCalendar,
  workingTicks,
  workingTimeTicks,
  breaks,
  mapSeries,
  removedIntervals,
  calendarFrom,
  toWorkingTime,
  toWallClock,
  HOUR,
  DAY,
  timeStep,
  localOffset,
} from "../src/workingTime";

/** Two early shifts on two days, in hours since a zero point:
    day 1 from 6 to 14 o'clock, day 2 from 6 to 14 o'clock (so 30 to 38).
    Working time by hand:
      6 o'clock  → 0 h        14 o'clock → 8 h
      30 o'clock → 8 h        38 o'clock → 16 h  (that is the whole working time)
    Removed is everything before, everything after, and the 16 hours in between. */
const shifts = workingCalendar([
  { from: 6 * HOUR, to: 14 * HOUR },
  { from: 30 * HOUR, to: 38 * HOUR },
]);

describe("workingCalendar - the list of intervals in which time counts", () => {
  it("names the whole working time", () => {
    // By hand: twice eight hours.
    expect(shifts.total).toBe(16 * HOUR);
  });

  it("sorts unsorted intervals", () => {
    const k = workingCalendar([
      { from: 30 * HOUR, to: 38 * HOUR },
      { from: 6 * HOUR, to: 14 * HOUR },
    ]);
    expect(k.intervals).toEqual(shifts.intervals);
  });

  it("merges overlapping and abutting intervals", () => {
    const k = workingCalendar([
      { from: 0, to: 10 },
      { from: 5, to: 15 },
      { from: 15, to: 20 },
    ]);
    expect(k.intervals).toEqual([{ from: 0, to: 20 }]);
    expect(k.total).toBe(20);
  });

  it("throws away empty, reversed and infinite intervals", () => {
    const k = workingCalendar([
      { from: 5, to: 5 },
      { from: 10, to: 4 },
      { from: Number.NaN, to: 3 },
      { from: 0, to: Number.POSITIVE_INFINITY },
      { from: 1, to: 2 },
    ]);
    expect(k.intervals).toEqual([{ from: 1, to: 2 }]);
  });
});

describe("toWorkingTime - wall clock time inwards", () => {
  it("maps the beginning of an interval onto its accumulated time", () => {
    expect(toWorkingTime(6 * HOUR, shifts)).toBe(0);
    expect(toWorkingTime(30 * HOUR, shifts)).toBe(8 * HOUR);
  });

  it("maps the end of an interval from the other side onto the same value", () => {
    // 14 o'clock on the first day and 6 o'clock on the second are neighbours in
    // working time - that is exactly the point of the axis.
    expect(toWorkingTime(14 * HOUR, shifts)).toBe(8 * HOUR);
    expect(toWorkingTime(30 * HOUR, shifts)).toBe(8 * HOUR);
    expect(toWorkingTime(38 * HOUR, shifts)).toBe(16 * HOUR);
  });

  it("maps points in the interior linearly", () => {
    // By hand: 10 o'clock is four hours after the start of the shift.
    expect(toWorkingTime(10 * HOUR, shifts)).toBe(4 * HOUR);
    // 34 o'clock is eight accumulated plus four hours.
    expect(toWorkingTime(34 * HOUR, shifts)).toBe(12 * HOUR);
  });

  it("turns a point in a removed interval into a gap", () => {
    // Not the edge: a measurement from a time which, according to the calendar,
    // did not exist could not be laid there honestly; it would pile up on what
    // really does lie there.
    expect(toWorkingTime(20 * HOUR, shifts)).toBeNaN();
    expect(toWorkingTime(14 * HOUR + 1, shifts)).toBeNaN();
    expect(toWorkingTime(30 * HOUR - 1, shifts)).toBeNaN();
  });

  it("turns points before and after the calendar into a gap too", () => {
    expect(toWorkingTime(0, shifts)).toBeNaN();
    expect(toWorkingTime(48 * HOUR, shifts)).toBeNaN();
  });

  it("stays monotonically non-decreasing across the removed time", () => {
    const before = toWorkingTime(13 * HOUR, shifts);
    const after = toWorkingTime(31 * HOUR, shifts);
    expect(before).toBe(7 * HOUR);
    expect(after).toBe(9 * HOUR);
    expect(after).toBeGreaterThan(before);
  });

  it("returns a gap as a gap", () => {
    expect(toWorkingTime(Number.NaN, shifts)).toBeNaN();
  });
});

describe("toWallClock - working time back", () => {
  it("maps back onto the wall clock time", () => {
    expect(toWallClock(0, shifts)).toBe(6 * HOUR);
    expect(toWallClock(4 * HOUR, shifts)).toBe(10 * HOUR);
    expect(toWallClock(12 * HOUR, shifts)).toBe(34 * HOUR);
  });

  it("chooses the beginning of the next interval at a seam", () => {
    // 8 h of working time are two wall clock times: 14 o'clock on the first day
    // and 6 o'clock on the second. Back comes the beginning of the next shift,
    // because from there time counts again.
    expect(toWallClock(8 * HOUR, shifts)).toBe(30 * HOUR);
  });

  it("maps the end of the last shift onto its wall clock time", () => {
    expect(toWallClock(16 * HOUR, shifts)).toBe(38 * HOUR);
  });

  it("has no wall clock time outside the working time", () => {
    expect(toWallClock(-1, shifts)).toBeNaN();
    expect(toWallClock(16 * HOUR + 1, shifts)).toBeNaN();
    expect(toWallClock(Number.NaN, shifts)).toBeNaN();
  });

  it("comes back unchanged for points inside the working intervals", () => {
    for (const wallClock of [6 * HOUR, 7.5 * HOUR, 13 * HOUR, 30 * HOUR, 37 * HOUR]) {
      expect(toWallClock(toWorkingTime(wallClock, shifts), shifts)).toBe(wallClock);
    }
  });
});

describe("the empty calendar", () => {
  const empty = workingCalendar([]);

  it("behaves in both directions like no calendar at all", () => {
    // Tested against the unmapped values, not against another run.
    expect(toWorkingTime(20 * HOUR, empty)).toBe(20 * HOUR);
    expect(toWorkingTime(-5, empty)).toBe(-5);
    expect(toWallClock(20 * HOUR, empty)).toBe(20 * HOUR);
    expect(toWallClock(-5, empty)).toBe(-5);
  });

  it("removes nothing", () => {
    expect(removedIntervals(empty)).toEqual([]);
  });

  it("leaves every tick where it is", () => {
    const ticks = workingTimeTicks(empty, 0, 4 * HOUR, 2 * HOUR);
    expect(ticks).toEqual([
      { wallClock: 0, workingTime: 0 },
      { wallClock: 2 * HOUR, workingTime: 2 * HOUR },
      { wallClock: 4 * HOUR, workingTime: 4 * HOUR },
    ]);
  });
});

describe("mapSeries - a whole series at once", () => {
  it("maps every value and turns removed time into a gap", () => {
    const source = Float64Array.from([
      6 * HOUR,
      10 * HOUR,
      20 * HOUR,
      30 * HOUR,
      34 * HOUR,
    ]);
    const target = new Float64Array(source.length);
    mapSeries(shifts, source, source.length, target);
    expect([...target]).toEqual([0, 4 * HOUR, Number.NaN, 8 * HOUR, 12 * HOUR]);
  });

  it("touches only the first n values", () => {
    const source = Float64Array.from([6 * HOUR, 10 * HOUR]);
    const target = Float64Array.from([-1, -1]);
    mapSeries(shifts, source, 1, target);
    expect([...target]).toEqual([0, -1]);
  });
});

describe("workingTimeTicks - candidates in wall clock time, then mapped", () => {
  it("throws candidates in removed intervals away and maps the rest", () => {
    // Candidates every four hours from 0 to 48: 0, 4, 8, …, 48.
    // Only 8, 12 (day 1) and 32, 36 (day 2) lie inside the shifts.
    // By hand: 8 → 2 h, 12 → 6 h, 32 → 10 h, 36 → 14 h.
    const ticks = workingTimeTicks(shifts, 0, 48 * HOUR, 4 * HOUR);
    expect(ticks.map((t) => t.wallClock / HOUR)).toEqual([8, 12, 32, 36]);
    expect(ticks.map((t) => t.workingTime / HOUR)).toEqual([2, 6, 10, 14]);
  });

  it("keeps the edges of the shifts and leaves the seam standing only once", () => {
    // Candidates every two hours: 6, 8, 10, 12, 14 and 30, 32, 34, 36, 38 lie
    // inside the shifts. 14 o'clock and 30 o'clock both fall on 8 h of working
    // time; two labels on the same pixel would be one too many, so the earlier one
    // stays.
    const ticks = workingTimeTicks(shifts, 0, 48 * HOUR, 2 * HOUR);
    expect(ticks.map((t) => t.wallClock / HOUR)).toEqual([6, 8, 10, 12, 14, 32, 34, 36, 38]);
    expect(ticks.map((t) => t.workingTime / HOUR)).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16]);
  });

  it("places the candidates on multiples of the step, shifted by the offset", () => {
    // Without an offset the day boundaries would lie on 0 and 24; with an offset
    // of one hour on 1 and 25 - that way a local time hits its own midnight.
    const ticks = workingTimeTicks(shifts, 0, 48 * HOUR, 12 * HOUR, 2 * HOUR);
    expect(ticks.map((t) => t.wallClock / HOUR)).toEqual([14, 38]);
  });

  it("yields nothing for a reversed or empty extent", () => {
    expect(workingTimeTicks(shifts, 10 * HOUR, 8 * HOUR, HOUR)).toEqual([]);
    expect(workingTimeTicks(shifts, 0, 48 * HOUR, 0)).toEqual([]);
  });
});

describe("timeStep - readable steps instead of 1-2-5", () => {
  it("chooses hour and day boundaries a human recognises", () => {
    // A 1-2-5 grid would yield 5 hours here and a reader doing arithmetic.
    expect(timeStep(24 * HOUR, 6)).toBe(6 * HOUR);
    expect(timeStep(24 * HOUR, 12)).toBe(2 * HOUR);
    expect(timeStep(48 * HOUR, 4)).toBe(12 * HOUR);
    expect(timeStep(7 * DAY, 7)).toBe(DAY);
    expect(timeStep(90 * 60_000, 6)).toBe(15 * 60_000);
    expect(timeStep(60_000, 60)).toBe(1000);
  });

  it("rounds up to the next larger step, so that no more ticks arise than wanted", () => {
    // 24/5 = 4.8 hours; the next readable step above that is six.
    expect(timeStep(24 * HOUR, 5)).toBe(6 * HOUR);
  });

  it("continues in whole days above the day steps", () => {
    expect(timeStep(400 * DAY, 4)).toBe(100 * DAY);
  });

  it("yields the smallest step for a nonsensical span", () => {
    expect(timeStep(0, 5)).toBe(1000);
    expect(timeStep(Number.NaN, 5)).toBe(1000);
  });
});

describe("removedIntervals - what is to be marked on the axis", () => {
  it("names every removed span with its place in working time", () => {
    // By hand: removed is 14 o'clock to 30 o'clock, and in working time that
    // collapses onto the point 8 h.
    expect(removedIntervals(shifts)).toEqual([
      { from: 14 * HOUR, to: 30 * HOUR, workingTime: 8 * HOUR },
    ]);
  });

  it("names only the gaps between intervals, not those before and after", () => {
    // Whatever lies before the first and after the last shift is not a gap in the
    // axis but outside its extent.
    const k = workingCalendar([
      { from: 0, to: 10 },
      { from: 20, to: 30 },
      { from: 40, to: 50 },
    ]);
    expect(removedIntervals(k)).toEqual([
      { from: 10, to: 20, workingTime: 10 },
      { from: 30, to: 40, workingTime: 20 },
    ]);
  });
});

describe("the raw interval list as an input", () => {
  // The axis holds the list, not the built calendar. Every function takes either -
  // and the list is built only once, not once per point.
  const list = [
    { from: 30 * HOUR, to: 38 * HOUR },
    { from: 6 * HOUR, to: 14 * HOUR },
  ];

  it("computes the same from the unsorted list as from the calendar", () => {
    expect(toWorkingTime(34 * HOUR, list)).toBe(12 * HOUR);
    expect(toWorkingTime(20 * HOUR, list)).toBeNaN();
    expect(toWallClock(12 * HOUR, list)).toBe(34 * HOUR);
    expect(breaks(list, 0, 16 * HOUR)).toEqual([8 * HOUR]);
  });

  it("builds the same calendar only once", () => {
    // Materialisation calls the mapping once per point; were it to sort and
    // accumulate every time, the calendar would be the most expensive thing about
    // the frame.
    expect(calendarFrom(list)).toBe(calendarFrom(list));
  });

  it("lets an empty list act like no calendar at all", () => {
    expect(toWorkingTime(20 * HOUR, [])).toBe(20 * HOUR);
    expect(toWallClock(20 * HOUR, [])).toBe(20 * HOUR);
  });
});

describe("breaks - the break points within the extent of the axis", () => {
  it("yields the place in working time at which time was removed", () => {
    // By hand: the only gap falls on 8 h of working time.
    expect(breaks(shifts, 0, 16 * HOUR)).toEqual([8 * HOUR]);
  });

  it("leaves out what lies outside the extent", () => {
    expect(breaks(shifts, 0, 4 * HOUR)).toEqual([]);
    expect(breaks(shifts, 10 * HOUR, 16 * HOUR)).toEqual([]);
  });
});

describe("workingTicks - ticks for an extent in working time", () => {
  it("calculates the extent back, generates in wall clock time and maps", () => {
    // Extent 0…16 h of working time, eight ticks: step 2 h. In wall clock time
    // that is 6 o'clock to 38 o'clock; by hand 6, 8, 10, 12, 14 and 32, 34, 36, 38
    // survive - 30 o'clock coincides with 14 o'clock.
    expect(workingTicks(shifts, 0, 16 * HOUR, 8).map((v) => v / HOUR)).toEqual([
      0, 2, 4, 6, 8, 10, 12, 14, 16,
    ]);
  });

  it("copes with an extent widened to nice boundaries", () => {
    // A "nice" domain reaches beyond the working time that exists; that must
    // generate no ticks out of nowhere.
    const values = workingTicks(shifts, -2 * HOUR, 20 * HOUR, 8);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThanOrEqual(16 * HOUR);
  });

  it("yields nothing without a calendar and for a reversed extent", () => {
    expect(workingTicks([], 0, 16 * HOUR, 8)).toEqual([]);
    expect(workingTicks(shifts, 16 * HOUR, 0, 8)).toEqual([]);
  });
});

/* The tests run under Europe/Berlin (vitest.config.ts). */
describe("localOffset - the grid's shift onto local time", () => {
  it("is the time zone's offset at the instant, across the clock change", () => {
    expect(localOffset(Date.UTC(2026, 0, 15, 12))).toBe(-1 * HOUR);
    expect(localOffset(Date.UTC(2026, 6, 15, 12))).toBe(-2 * HOUR);
  });

  it("puts a day's grid on local midnight", () => {
    const noon = Date.UTC(2026, 0, 15, 12);
    const ticks = workingTimeTicks([], noon, noon + DAY, DAY, localOffset(noon));
    expect(ticks.map((t) => new Date(t.wallClock).getHours())).toEqual([0]);
  });
});
