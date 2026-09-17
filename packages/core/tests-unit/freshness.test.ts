/* Freshness: the second axis a value has (ADR-0010).

   The first block is the reason this module exists: freshness and verdict are
   two separate axes. A stale value keeps its verdict, and the rule here knows
   no verdict at all.

   No test reads a clock: every reference time stands as a number in the test.

   The three states and the two age fields keep their German names - they are
   the model's wire format, shared with the charts. */

import { describe, expect, it } from "vitest";
import * as freshnessModule from "../src/lib/freshness";
import { freshness, age, cadence } from "../src/lib/freshness";
import type { FreshnessAges } from "../src/lib/freshness";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;

/** A fixed reference time, out of the calendar and not off the clock. */
const REFERENCE = Date.UTC(2026, 2, 17, 10, 30, 0);

const AGES: FreshnessAges = { stale: 5 * MINUTE, lost: 15 * MINUTE };

describe("Freshness is separate from the verdict", () => {
  it("takes nothing but an as-of time, a reference time and the ages", () => {
    /* The signature is the promise: what does not go in here cannot come out
       either. A verdict does not go in. */
    expect(freshness.length).toBe(3);
  });

  it("returns exclusively the three freshness states – never `unknown`", () => {
    const asOfTimes = [
      REFERENCE,
      REFERENCE + MINUTE,
      REFERENCE - 1,
      REFERENCE - 5 * MINUTE,
      REFERENCE - 15 * MINUTE,
      REFERENCE - 40 * MINUTE,
      null,
      undefined,
      new Date(Number.NaN),
    ];
    const results = new Set(asOfTimes.map((asOf) => freshness(asOf, REFERENCE, AGES)));
    for (const value of results) {
      expect(["fresh", "stale", "lost"]).toContain(value);
    }
    expect(results.has("fresh")).toBe(true);
    expect(results.has("stale")).toBe(true);
    expect(results.has("lost")).toBe(true);
  });

  it("exports nothing that looks like an assessment", () => {
    /* The module's whole export, so that no `unknown`, no `limit` and no
       assessment wanders in here. */
    expect(Object.keys(freshnessModule).sort()).toEqual(["age", "cadence", "freshness"]);
  });

  it("leaves the verdict of a stale value untouched", () => {
    /* The local fixture plays back a measurement: it was true forty minutes ago
       and it was critical then. Both asOf. */
    const measurement = { wert: 82, assessment: "critical" as const, asOf: REFERENCE - 40 * MINUTE };

    const reading = freshness(measurement.asOf, REFERENCE, AGES);

    expect(reading).toBe("lost");
    expect(measurement.assessment).toBe("critical");
    expect(measurement.wert).toBe(82);
  });
});

describe("freshness – the `stale` age", () => {
  it("calls a value that was true just now fresh", () => {
    expect(freshness(REFERENCE, REFERENCE, AGES)).toBe("fresh");
  });

  it("is still fresh one millisecond before the age", () => {
    expect(freshness(REFERENCE - (5 * MINUTE - 1), REFERENCE, AGES)).toBe("fresh");
  });

  it("is already stale exactly on the age", () => {
    /* Decided: the bound belongs to the older state. "Stale after five
       minutes" means that five minutes are stale. */
    expect(freshness(REFERENCE - 5 * MINUTE, REFERENCE, AGES)).toBe("stale");
  });

  it("is stale one millisecond after the age", () => {
    expect(freshness(REFERENCE - (5 * MINUTE + 1), REFERENCE, AGES)).toBe("stale");
  });
});

describe("freshness – the `lost` age", () => {
  it("is still stale one millisecond before the age", () => {
    expect(freshness(REFERENCE - (15 * MINUTE - 1), REFERENCE, AGES)).toBe("stale");
  });

  it("is already disconnected exactly on the age", () => {
    expect(freshness(REFERENCE - 15 * MINUTE, REFERENCE, AGES)).toBe("lost");
  });

  it("is disconnected one millisecond after the age", () => {
    expect(freshness(REFERENCE - (15 * MINUTE + 1), REFERENCE, AGES)).toBe("lost");
  });
});

describe("freshness – an as-of time in the future", () => {
  /* Clock drift is real: the machine runs half a minute ahead. A value that by
     its stamp only becomes true in a moment is not older than now - it is
     fresh, and its age is zero. */

  it("is fresh rather than negatively old", () => {
    expect(freshness(REFERENCE + 30 * SECOND, REFERENCE, AGES)).toBe("fresh");
  });

  it("yields no negative age", () => {
    expect(age(REFERENCE + 30 * SECOND, REFERENCE)).toBe(0);
    expect(age(REFERENCE + 10 * MINUTE, REFERENCE)).toBe(0);
  });

  it("stays fresh even under coarse drift", () => {
    expect(freshness(REFERENCE + 10 * MINUTE, REFERENCE, AGES)).toBe("fresh");
  });
});

describe("freshness – a missing as-of time", () => {
  /* Decided: no as-of time means disconnected, not stale. "Stale" presupposes
     that we know the age; here we do not know it, and the value is covered by
     nothing. */

  it("calls a missing as-of time disconnected", () => {
    expect(freshness(null, REFERENCE, AGES)).toBe("lost");
    expect(freshness(undefined, REFERENCE, AGES)).toBe("lost");
  });

  it("calls an invalid date disconnected", () => {
    expect(freshness(new Date(Number.NaN), REFERENCE, AGES)).toBe("lost");
    expect(freshness(Number.NaN, REFERENCE, AGES)).toBe("lost");
  });

  it("decides that, instead of leaving it to the arithmetic", () => {
    /* With ages under which every computable age would be fresh, the missing
       as-of time still stays disconnected. Were it to fall through the
       arithmetic, "fresh" would asOf here. */
    const never: FreshnessAges = { stale: Infinity, lost: Infinity };
    expect(freshness(REFERENCE - 40 * MINUTE, REFERENCE, never)).toBe("fresh");
    expect(freshness(null, REFERENCE, never)).toBe("lost");
  });

  it("has no age", () => {
    expect(age(null, REFERENCE)).toBe(null);
    expect(age(undefined, REFERENCE)).toBe(null);
  });
});

describe("freshness – an as-of time as a date or as a number", () => {
  it("judges both forms alike", () => {
    const asOf = REFERENCE - 6 * MINUTE;
    expect(freshness(new Date(asOf), new Date(REFERENCE), AGES)).toBe("stale");
    expect(freshness(asOf, REFERENCE, AGES)).toBe("stale");
  });
});

describe("age", () => {
  it("measures the distance in milliseconds", () => {
    expect(age(REFERENCE - 3 * MINUTE, REFERENCE)).toBe(3 * MINUTE);
    expect(age(REFERENCE, REFERENCE)).toBe(0);
  });
});

describe("cadence", () => {
  /* Checked as a value, not as an observed timer: the defect sits in the
     arithmetic, not in setInterval. */

  it("derives the cadence from the smaller age", () => {
    expect(cadence(AGES)).toBe(30 * SECOND);
  });

  it("takes the smaller of the two ages, whichever that is", () => {
    expect(cadence({ stale: 15 * MINUTE, lost: 5 * MINUTE })).toBe(30 * SECOND);
  });

  it("does not tick sixty times a minute for a five-minute display", () => {
    expect(cadence(AGES)).toBeGreaterThanOrEqual(10 * SECOND);
  });

  it("ticks at most once a minute for large ages", () => {
    expect(cadence({ stale: 60 * MINUTE, lost: 120 * MINUTE })).toBe(60 * SECOND);
  });

  it("ticks at most once a second for small ages", () => {
    expect(cadence({ stale: 2 * SECOND, lost: 5 * SECOND })).toBe(SECOND);
  });

  it("falls to the slowest cadence where no change is to be expected any more", () => {
    /* Ages that never bite and ages that have bitten already both call for no
       fast cadence: the state does not change by itself any more. */
    expect(cadence({ stale: Infinity, lost: Infinity })).toBe(60 * SECOND);
    expect(cadence({ stale: Number.NaN, lost: Number.NaN })).toBe(60 * SECOND);
    expect(cadence({ stale: 0, lost: 0 })).toBe(60 * SECOND);
  });
});
