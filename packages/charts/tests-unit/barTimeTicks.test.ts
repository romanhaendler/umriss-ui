/* The tick step on a time axis that carries bars is never shorter than the bars'
   Step. Pure choice, under Europe/Berlin (vitest.config.ts): February 2026 is 28
   days, and the clock changes on 29 March. */

import { describe, expect, it } from "vitest";
import { timeStepFor, timeTicks } from "../src/time";
import { DAY } from "../src/workingTime";

const at = (month: number, day: number) => new Date(2026, month - 1, day).getTime();
const monthStarts = Array.from({ length: 13 }, (_, i) => new Date(2026, i, 1).getTime());
const shortest = (xs: number[]) => xs.slice(1).reduce((m, x, i) => Math.min(m, x - xs[i]!), Infinity);

describe("timeStepFor with the bars' step", () => {
  it("gives month ticks under twelve monthly bars, across a February and a clock change", () => {
    const span = monthStarts[11]! - monthStarts[0]!;
    // Without bars, 40 ticks over the span would be two-week ticks.
    expect(timeStepFor(span, 40)).toMatchObject({ unit: "day" });
    const step = timeStepFor(span, 40, shortest(monthStarts));
    expect(step).toMatchObject({ unit: "month", n: 1 });
    const ticks = timeTicks(monthStarts[0]!, monthStarts[11]!, step);
    expect(ticks).toEqual(monthStarts.slice(0, 12));
  });

  it("never gives hour ticks to daily bars over a week", () => {
    for (const count of [7, 24, 60]) {
      const step = timeStepFor(7 * DAY, count, DAY);
      expect(step.ms).toBeGreaterThanOrEqual(DAY);
    }
    // A day of 23 hours counts: the shortest real distance is the step.
    expect(timeStepFor(7 * DAY, 60, 23 * 3_600_000)).toMatchObject({ unit: "day", n: 1 });
  });

  it("gives weekly bars ticks of at least seven days", () => {
    const step = timeStepFor(8 * 7 * DAY, 56, 7 * DAY);
    expect(step.ms).toBeGreaterThanOrEqual(7 * DAY);
    const ticks = timeTicks(at(1, 5), at(3, 2), step);
    expect(shortest(ticks)).toBeGreaterThanOrEqual(7 * DAY - 3_600_000);
  });

  it("keeps the ticks of a line alone, and a step of 0 is no step", () => {
    expect(timeStepFor(7 * DAY, 60)).toMatchObject({ unit: "hour" });
    expect(timeStepFor(7 * DAY, 60, 0)).toEqual(timeStepFor(7 * DAY, 60));
  });
});
