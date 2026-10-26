import { describe, expect, it } from "vitest";
import { zoneFields, zoneInstant } from "../src/lib/zone";

const HOUR = 3_600_000;

describe("zone arithmetic", () => {
  it("named Europe/Berlin it equals the Date's own, every hour of 2026", () => {
    for (let t = Date.UTC(2025, 11, 31, 12); t < Date.UTC(2027, 0, 1, 12); t += HOUR) {
      const named = zoneFields(t, "Europe/Berlin");
      expect(named).toEqual(zoneFields(t, undefined));
      expect(zoneInstant(named, "Europe/Berlin").getTime()).toBe(zoneInstant(named, undefined).getTime());
    }
  });

  it("Berlin's missing and doubled hour match the Date's own, every hour of the two days", () => {
    for (const [month, day] of [[2, 29], [9, 25]] as const) {
      for (let hours = 0; hours < 24; hours++) {
        const clock = { year: 2026, month, day, hours, minutes: 30 };
        expect(zoneInstant(clock, "Europe/Berlin").getTime()).toBe(zoneInstant(clock, undefined).getTime());
      }
    }
    expect(zoneInstant({ year: 2026, month: 2, day: 29, hours: 2, minutes: 30 }, "Europe/Berlin").toISOString()).toBe(
      "2026-03-29T01:30:00.000Z",
    );
    expect(zoneInstant({ year: 2026, month: 9, day: 25, hours: 2, minutes: 30 }, "Europe/Berlin").toISOString()).toBe(
      "2026-10-25T00:30:00.000Z",
    );
  });

  it("New York on 8 March and 1 November 2026", () => {
    const ny = "America/New_York";
    expect(zoneFields(Date.UTC(2026, 2, 8, 6, 59), ny)).toMatchObject({ day: 8, hours: 1, minutes: 59, weekday: 0 });
    expect(zoneFields(Date.UTC(2026, 2, 8, 7, 0), ny)).toMatchObject({ day: 8, hours: 3, minutes: 0 });
    expect(zoneInstant({ year: 2026, month: 2, day: 8, hours: 2, minutes: 30 }, ny).toISOString()).toBe("2026-03-08T07:30:00.000Z");
    expect(zoneFields(Date.UTC(2026, 10, 1, 5, 30), ny)).toMatchObject({ day: 1, hours: 1, minutes: 30 });
    expect(zoneFields(Date.UTC(2026, 10, 1, 6, 30), ny)).toMatchObject({ day: 1, hours: 1, minutes: 30 });
    expect(zoneInstant({ year: 2026, month: 10, day: 1, hours: 1, minutes: 30 }, ny).toISOString()).toBe("2026-11-01T05:30:00.000Z");
    expect(zoneInstant({ year: 2026, month: 10, day: 2 }, ny).toISOString()).toBe("2026-11-02T05:00:00.000Z");
  });

  it("Kolkata stands at +05:30", () => {
    const f = zoneFields(Date.UTC(2026, 5, 1, 20, 0), "Asia/Kolkata");
    expect(f).toMatchObject({ month: 5, day: 2, hours: 1, minutes: 30, weekday: 2 });
    expect(zoneInstant({ year: 2026, month: 5, day: 2 }, "Asia/Kolkata").toISOString()).toBe("2026-06-01T18:30:00.000Z");
  });

  it("an unknown zone throws", () => {
    expect(() => zoneFields(0, "Mars/Base")).toThrow(RangeError);
  });

  it("groups 100,000 instants by day in under 100 ms", () => {
    const start = Date.UTC(2026, 0, 1);
    zoneFields(start, "Europe/Berlin"); // the formatter's first build is not the grouping
    // The best of three: a loaded machine slows a run, not the work.
    const days = new Set<number>();
    const times = [0, 1, 2].map(() => {
      const t0 = performance.now();
      for (let i = 0; i < 100_000; i++) {
        const f = zoneFields(start + i * 300_000, "Europe/Berlin");
        days.add(zoneInstant({ year: f.year, month: f.month, day: f.day }, "Europe/Berlin").getTime());
      }
      return performance.now() - t0;
    });
    expect(Math.min(...times)).toBeLessThan(100);
    expect(days.size).toBeGreaterThan(300);
  });
});
