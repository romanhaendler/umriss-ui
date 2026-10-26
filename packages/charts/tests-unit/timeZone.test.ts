/* A named zone's ticks and labels. The tests run under Europe/Berlin
   (vitest.config.ts); the clock changes of 2026 are Berlin's 29 March and 25
   October and New York's 8 March and 1 November. */

import { describe, expect, it } from "vitest";
import { timeDomain, timeLabels, timeStepFor, timeText, timeTicks, type TimeStep } from "../src/time";
import { DAY, HOUR, localOffset, workingCalendar, workingTimeTicks } from "../src/workingTime";
import { checkZone } from "../src/zone";

const NY = "America/New_York";
const utc = (month: number, day: number, hour = 0, minute = 0) => Date.UTC(2026, month - 1, day, hour, minute);
const step = (unit: "hour" | "day", n: number): TimeStep => ({ unit, n, ms: n * (unit === "hour" ? HOUR : DAY) });
const wall = (t: number, zone: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(t);

describe("a named zone's ticks across a clock change", () => {
  it("ticks the doubled hour twice, an hour apart in real time, each label with its offset", () => {
    const ticks = timeTicks(utc(11, 1, 4), utc(11, 1, 7), step("hour", 1), NY);
    expect(ticks).toEqual([utc(11, 1, 4), utc(11, 1, 5), utc(11, 1, 6), utc(11, 1, 7)]);
    expect(timeLabels(ticks, step("hour", 1), "en-GB", NY).map((l) => l.replace("1 Nov ", ""))).toEqual([
      "00:00", "01:00 GMT-4", "01:00 GMT-5", "02:00",
    ]);
  });

  it("ticks no 02:00 in the missing hour", () => {
    const ticks = timeTicks(utc(3, 8, 5), utc(3, 8, 8), step("hour", 1), NY);
    expect(ticks.map((t) => wall(t, NY))).toEqual(["00:00", "01:00", "03:00", "04:00"]);
  });

  it("keeps a two-hour grid on even hours after the change", () => {
    const ticks = timeTicks(utc(11, 1, 4), utc(11, 1, 13), step("hour", 2), NY);
    expect(ticks.map((t) => wall(t, NY))).toEqual(["00:00", "02:00", "04:00", "06:00", "08:00"]);
  });

  it("stands a week's day ticks on New York's midnights", () => {
    const ticks = timeTicks(utc(10, 31, 12), utc(11, 4, 12), step("day", 1), NY);
    expect(ticks).toEqual([utc(11, 1, 4), utc(11, 2, 5), utc(11, 3, 5), utc(11, 4, 5)]);
  });

  it("ticks the reader's zone by the same rule", () => {
    // Berlin, 25 October: 02:00 CEST at 00:00Z and 02:00 CET at 01:00Z.
    const ticks = timeTicks(utc(10, 24, 23), utc(10, 25, 2), step("hour", 1));
    expect(ticks).toEqual([utc(10, 24, 23), utc(10, 25, 0), utc(10, 25, 1), utc(10, 25, 2)]);
    expect(timeLabels(ticks, step("hour", 1)).map((l) => l.replace("25 Oct ", ""))).toEqual([
      "01:00", "02:00 GMT+2", "02:00 GMT+1", "03:00",
    ]);
  });
});

describe("naming Europe/Berlin", () => {
  const BERLIN = "Europe/Berlin";

  it("gives today's ticks and labels outside the doubled hour", () => {
    for (const [from, to, count] of [
      [utc(3, 27, 12), utc(3, 31, 12), 4],
      [utc(3, 28, 18), utc(3, 29, 12), 6],
      [utc(3, 16, 7), utc(3, 16, 17), 5],
      [utc(1, 1), utc(12, 31), 6],
    ] as const) {
      const s = timeStepFor(to - from, count);
      const own = timeTicks(from, to, s);
      expect(timeTicks(from, to, s, BERLIN)).toEqual(own);
      expect(timeLabels(own, s, "en-GB", BERLIN)).toEqual(timeLabels(own, s));
      expect(timeDomain(from, to, s, BERLIN)).toEqual(timeDomain(from, to, s));
      expect(timeText(own[0] as number, false, "en-GB", BERLIN)).toBe(timeText(own[0] as number));
    }
  });

  it("gives the new offsets in the doubled hour", () => {
    expect(timeText(utc(10, 25, 0, 30), false, "en-GB", BERLIN)).toBe("25 Oct 02:30 GMT+2");
    expect(timeText(utc(10, 25, 1, 30), false, "en-GB", BERLIN)).toBe("25 Oct 02:30 GMT+1");
    expect(timeText(utc(10, 25, 2, 30), false, "en-GB", BERLIN)).toBe("25 Oct 03:30");
  });
});

describe("the arithmetic", () => {
  it("writes UTC in UTC", () => {
    expect(timeText(utc(10, 25, 0, 30), false, "en-GB", "UTC")).toBe("25 Oct 00:30");
  });

  it("gives localOffset the zone's offset, as getTimezoneOffset signs it", () => {
    expect(localOffset(utc(7, 1), NY)).toBe(4 * HOUR);
    expect(localOffset(utc(1, 1), "Asia/Kolkata")).toBe(-5.5 * HOUR);
    expect(localOffset(utc(7, 1))).toBe(-2 * HOUR);
  });

  it("throws Intl's RangeError for an unknown zone", () => {
    expect(() => checkZone("Mars/Olympus")).toThrow(RangeError);
  });
});

describe("working-time ticks in a zone", () => {
  const all = workingCalendar([{ from: utc(1, 1), to: utc(12, 31) }]);

  it("doubles the hour and skips the missing one", () => {
    expect(workingTimeTicks(all, utc(11, 1, 4), utc(11, 1, 7), HOUR, 0, NY).map((t) => t.wallClock)).toEqual([
      utc(11, 1, 4), utc(11, 1, 5), utc(11, 1, 6), utc(11, 1, 7),
    ]);
    expect(workingTimeTicks(all, utc(3, 8, 5), utc(3, 8, 8), HOUR, 0, NY).map((t) => wall(t.wallClock, NY))).toEqual([
      "00:00", "01:00", "03:00", "04:00",
    ]);
  });

  it("keeps a two-hour grid on even hours and a day grid on midnights", () => {
    expect(workingTimeTicks(all, utc(11, 1, 4), utc(11, 1, 13), 2 * HOUR, 0, NY).map((t) => wall(t.wallClock, NY))).toEqual([
      "00:00", "02:00", "04:00", "06:00", "08:00",
    ]);
    expect(workingTimeTicks(all, utc(10, 31, 12), utc(11, 4, 12), DAY, 0, NY).map((t) => t.wallClock)).toEqual([
      utc(11, 1, 4), utc(11, 2, 5), utc(11, 3, 5), utc(11, 4, 5),
    ]);
  });
});
