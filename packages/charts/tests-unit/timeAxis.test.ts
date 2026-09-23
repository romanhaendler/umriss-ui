/* charts-essentials 01: the time axis. Ticks on local boundaries from the
   minute to the month, labels by level in en-GB with a 24-hour clock, the date
   on the first tick after a day change. The tests run under Europe/Berlin
   (vitest.config.ts); 29 March 2026 is the spring clock change there. */

import { describe, expect, it } from "vitest";
import { timeLabels, timeStepFor, timeTicks } from "../src/time";
import { CLASS_TICK, computeLayout, type AxisInput, type AxisLayout } from "../src/layout";
import { DAY, HOUR, MINUTE } from "../src/operatingTime";

const at = (month: number, day: number, hour = 0, minute = 0) =>
  new Date(2026, month - 1, day, hour, minute).getTime();

const clock = (t: number) => {
  const d = new Date(t);
  return `${d.getDate()}. ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

describe("timeStepFor - the readable step", () => {
  it("climbs from minutes over hours and days to months", () => {
    expect(timeStepFor(60 * MINUTE, 6)).toMatchObject({ unit: "minute", n: 10 });
    expect(timeStepFor(24 * HOUR, 8)).toMatchObject({ unit: "hour", n: 3 });
    expect(timeStepFor(10 * DAY, 10)).toMatchObject({ unit: "day", n: 1 });
    expect(timeStepFor(60 * DAY, 8)).toMatchObject({ unit: "day", n: 14 });
    expect(timeStepFor(365 * DAY, 6)).toMatchObject({ unit: "month", n: 3 });
    expect(timeStepFor(10 * 365 * DAY, 5)).toMatchObject({ unit: "year", n: 2 });
  });

  it("never goes below the minute", () => {
    expect(timeStepFor(2 * MINUTE, 10)).toMatchObject({ unit: "minute", n: 1 });
  });
});

describe("timeTicks - candidates on local boundaries", () => {
  it("stands hour ticks on local multiples", () => {
    const ticks = timeTicks(at(3, 16, 7, 20), at(3, 16, 17, 0), timeStepFor(10 * HOUR, 5));
    expect(ticks.map(clock)).toEqual(["16. 8:00", "16. 10:00", "16. 12:00", "16. 14:00", "16. 16:00"]);
  });

  it("keeps 3-hour ticks on the local clock across the clock change", () => {
    const ticks = timeTicks(at(3, 28, 18), at(3, 29, 12), timeStepFor(18 * HOUR, 6));
    expect(ticks.map(clock)).toEqual([
      "28. 18:00", "28. 21:00", "29. 0:00", "29. 3:00", "29. 6:00", "29. 9:00", "29. 12:00",
    ]);
  });

  it("stands day ticks on local midnight across the clock change", () => {
    const ticks = timeTicks(at(3, 27, 12), at(3, 31, 12), timeStepFor(4 * DAY, 4));
    expect(ticks.map(clock)).toEqual(["28. 0:00", "29. 0:00", "30. 0:00", "31. 0:00"]);
  });

  it("stands week ticks on Mondays and month ticks on the first", () => {
    const weeks = timeTicks(at(3, 1), at(3, 31), { unit: "day", n: 7, ms: 7 * DAY });
    expect(weeks.map((t) => new Date(t).getDay())).toEqual([1, 1, 1, 1, 1]);
    const quarters = timeTicks(at(2, 10), at(12, 31), { unit: "month", n: 3, ms: 90 * DAY });
    expect(quarters.map((t) => new Date(t).getMonth() + 1)).toEqual([4, 7, 10]);
    for (const t of quarters) expect(new Date(t).getDate()).toBe(1);
  });
});

describe("timeLabels - by level, en-GB, 24 hours", () => {
  it("writes the clock, and the date on the first tick of a new day", () => {
    const step = timeStepFor(12 * HOUR, 4);
    const ticks = timeTicks(at(3, 16, 15), at(3, 17, 3), step);
    expect(timeLabels(ticks, step)).toEqual(["15:00", "18:00", "21:00", "17 Mar 00:00", "03:00"]);
  });

  it("carries the date on the first tick after a removed night, wherever it falls", () => {
    const step = timeStepFor(4 * HOUR, 4);
    expect(timeLabels([at(3, 16, 20), at(3, 16, 22), at(3, 17, 6)], step)).toEqual([
      "20:00",
      "22:00",
      "17 Mar 06:00",
    ]);
  });

  it("writes the day, and the month with its year", () => {
    const days = timeStepFor(4 * DAY, 4);
    expect(timeLabels([at(3, 16), at(3, 17)], days)).toEqual(["16 Mar", "17 Mar"]);
    const months = timeStepFor(365 * DAY, 6);
    expect(timeLabels([at(1, 1), at(4, 1)], months)).toEqual(["Jan 2026", "Apr 2026"]);
  });

  it("gives the day the year where the year changes", () => {
    const days = timeStepFor(4 * DAY, 4);
    const turn = [new Date(2026, 11, 31).getTime(), new Date(2027, 0, 1).getTime()];
    expect(timeLabels(turn, days)).toEqual(["31 Dec", "1 Jan 2027"]);
  });
});

/* The axis: `time` on a wall-clock axis, and the calendar axis that implies
   it. Tick label: 7 px per character. */
describe("computeLayout - a time axis", () => {
  function measure(text: string, className: string) {
    return className === CLASS_TICK ? { width: text.length * 7, height: 14 } : { width: text.length * 8, height: 16 };
  }

  function xOf(part: Partial<AxisInput>): AxisLayout {
    const layout = computeLayout({
      width: 900,
      height: 300,
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      axes: [
        { key: "x:x", id: "x", orientation: "x", position: "bottom", grid: false, extent: [0, 1], domainMode: "nice", ...part },
        { key: "y:y", id: "y", orientation: "y", position: "left", grid: false, extent: [0, 100], domainMode: "nice" },
      ],
      measure,
      hysteresis: new Map(),
    });
    const x = layout.axes.find((a) => a.key === "x:x");
    if (x === undefined) throw new Error("no x axis");
    return x;
  }

  it("widens a nice domain to the step's local boundaries and labels by level", () => {
    const x = xOf({ time: true, extent: [at(3, 16, 7, 20), at(3, 16, 16, 40)], tickCount: 5 });
    expect(x.domain).toEqual([at(3, 16, 6), at(3, 16, 18)]);
    expect(x.ticks.map((t) => t.label)).toEqual(["06:00", "09:00", "12:00", "15:00", "18:00"]);
  });

  it("keeps a data domain as it is", () => {
    const x = xOf({ time: true, extent: [at(3, 16, 7, 20), at(3, 16, 16, 40)], domainMode: "data", tickCount: 5 });
    expect(x.domain).toEqual([at(3, 16, 7, 20), at(3, 16, 16, 40)]);
  });

  it("writes the tooltip's x value with its date", () => {
    const x = xOf({ time: true, extent: [at(3, 16, 7), at(3, 16, 17)] });
    expect(x.format(at(3, 16, 15, 23))).toBe("16 Mar 15:23");
  });

  it("hands its own tickFormat the instant, for ticks and tooltip alike", () => {
    const x = xOf({ time: true, extent: [at(3, 16, 6), at(3, 16, 18)], tickCount: 4, tickFormat: (v) => clock(v) });
    expect(x.ticks.map((t) => t.label)).toEqual(["16. 6:00", "16. 9:00", "16. 12:00", "16. 15:00", "16. 18:00"]);
    expect(x.format(at(3, 16, 7))).toBe("16. 7:00");
  });

  it("labels a calendar axis the same way, dd.MM. is gone", () => {
    const calendar = [
      { from: at(3, 16, 6), to: at(3, 16, 22) },
      { from: at(3, 17, 6), to: at(3, 17, 22) },
    ];
    const x = xOf({ calendar, extent: [0, 32 * HOUR], domainMode: "data", tickCount: 8 });
    expect(x.ticks.map((t) => t.label)).toEqual(["06:00", "12:00", "18:00", "17 Mar 06:00", "12:00", "18:00"]);
    expect(x.format(4 * HOUR)).toBe("16 Mar 10:00");
  });
});
