/* The time spans of the range pickers (picker-shared-modules). Presets are
   checked against a fixed reference day, never against the machine's clock.
   The reference: Monday, 15.06.2026 - the middle of June, the second quarter. */

import { describe, expect, it } from "vitest";
import { rangeDays, windowView, calendarPairProps, presetRange } from "../src/components/DatePicker/range";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const REFERENCE = new Date(2026, 5, 15);
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe("presetRange - against a fixed reference day", () => {
  const cases = [
    ["today", "2026-06-15", "2026-06-15"],
    ["yesterday", "2026-06-14", "2026-06-14"],
    ["last7Days", "2026-06-09", "2026-06-15"],
    ["last30Days", "2026-05-17", "2026-06-15"],
    ["thisMonth", "2026-06-01", "2026-06-30"],
    ["previousMonth", "2026-05-01", "2026-05-31"],
    ["thisQuarter", "2026-04-01", "2026-06-30"],
    ["thisYear", "2026-01-01", "2026-12-31"],
  ] as const;

  for (const [label, from, to] of cases) {
    it(`${label} -> ${from} to ${to}`, () => {
      const range = presetRange(label, REFERENCE);
      expect([iso(range.from), iso(range.to)]).toEqual([from, to]);
    });
  }

  it("delivers both ends on local midnight", () => {
    for (const [label] of cases) {
      const range = presetRange(label, REFERENCE);
      expect([range.from.getHours(), range.to.getHours()]).toEqual([0, 0]);
    }
  });
});

describe("rangeDays - both ends included", () => {
  it("counts a single day as one", () => {
    expect(rangeDays(day(2026, 6, 1), day(2026, 6, 1))).toBe(1);
  });

  it("counts a week as seven", () => {
    expect(rangeDays(day(2026, 6, 1), day(2026, 6, 7))).toBe(7);
  });

  /* The 29th of March has 23 hours and the 25th of October has 25. A plain
     division by 24h would yield 2.96 and 3.04 days here. */
  it("counts correctly across the daylight-saving change", () => {
    expect(rangeDays(day(2026, 3, 28), day(2026, 3, 30))).toBe(3);
    expect(rangeDays(day(2026, 10, 24), day(2026, 10, 26))).toBe(3);
  });
});

describe("windowView - two visible months", () => {
  const june = day(2026, 6, 1);

  it("does not page if the target month is already visible", () => {
    expect(windowView(june, day(2026, 6, 20))).toBeNull();
    expect(windowView(june, day(2026, 7, 3))).toBeNull();
  });

  it("moves to the left if the target lies before it", () => {
    expect(iso(windowView(june, day(2026, 5, 9))!)).toBe("2026-05-01");
  });

  it("moves to the right so that the target stands in the right-hand month", () => {
    expect(iso(windowView(june, day(2026, 8, 9))!)).toBe("2026-07-01");
    expect(iso(windowView(june, day(2026, 12, 1))!)).toBe("2026-11-01");
  });
});

describe("calendarPairProps - one configuration for both months", () => {
  const noop = () => {};
  const base = {
    active: day(2026, 6, 15),
    onActive: noop,
    onPick: noop,
    bandFrom: day(2026, 6, 9),
    bandTo: day(2026, 6, 20),
    previewTo: null,
    onHoverDay: noop,
  };

  it("passes the range bounds and the preview on to the calendar", () => {
    const props = calendarPairProps(base);
    expect(iso(props.rangeFrom!)).toBe("2026-06-09");
    expect(iso(props.rangeTo!)).toBe("2026-06-20");
    expect(props.previewTo).toBeNull();
  });

  /* Both range pickers make these two decisions alike: the calendar carries no
     single value, and days of other months stay empty, so that no day appears
     twice in the month pair. */
  it("makes the shared decisions of the range pickers", () => {
    const props = calendarPairProps(base);
    expect(props.value).toBeNull();
    expect(props.withoutOtherMonth).toBe(true);
  });

  it("translates the band bounds into the calendar's language", () => {
    // The pickers speak of band*, the calendar of range* - that is exactly what
    // this function is for.
    const props = calendarPairProps(base);
    expect(Object.keys(props)).toContain("rangeFrom");
    expect(Object.keys(props)).not.toContain("bandFrom");
  });

  it("passes the preview through as long as only the start is settled", () => {
    const props = calendarPairProps({ ...base, bandTo: null, previewTo: day(2026, 6, 18) });
    expect(props.rangeTo).toBeNull();
    expect(iso(props.previewTo!)).toBe("2026-06-18");
  });
});
