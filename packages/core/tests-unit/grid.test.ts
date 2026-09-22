/* The month grid (pure-logic-seams). The weekday anchors come from the system
   calendar (cal/date), not from the calculation of the implementation:
   01.06.2026 Monday, 01.08.2026 Saturday, 01.11.2026 Sunday, 01.02.2024
   Thursday. The week starts on Monday. */

import { describe, expect, it } from "vitest";
import { bandBounds, viewFollows, monthGrid, addDays, dayStep, shiftMonth } from "../src/components/DatePicker/grid";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

describe("monthGrid", () => {
  it("always delivers 42 cells, so that the panel height never jumps", () => {
    for (const month of [new Date(2026, 5, 1), new Date(2026, 7, 1), new Date(2024, 1, 1)]) {
      expect(monthGrid(month)).toHaveLength(42);
    }
  });

  it("begins on the first for a month starting on a Monday", () => {
    expect(iso(monthGrid(new Date(2026, 5, 1))[0]!)).toBe("2026-06-01");
  });

  it("runs back five days for a month starting on a Saturday", () => {
    expect(iso(monthGrid(new Date(2026, 7, 1))[0]!)).toBe("2026-07-27");
  });

  it("runs back six days for a month starting on a Sunday", () => {
    expect(iso(monthGrid(new Date(2026, 10, 1))[0]!)).toBe("2026-10-26");
  });

  it("contains the 29th of February in a leap year", () => {
    const cells = monthGrid(new Date(2024, 1, 1)).map(iso);
    expect(cells[0]).toBe("2024-01-29");
    expect(cells).toContain("2024-02-29");
  });

  it("delivers 42 consecutive days at midnight", () => {
    const cells = monthGrid(new Date(2026, 2, 1));
    for (const cell of cells) {
      expect([cell.getHours(), cell.getMinutes(), cell.getSeconds()]).toEqual([0, 0, 0]);
    }
    for (let i = 1; i < cells.length; i += 1) {
      expect(iso(cells[i]!)).toBe(iso(addDays(cells[i - 1]!, 1)));
    }
  });

  /* The daylight-saving change: the 29.03.2026 (forward) and the 25.10.2026
     (back) are Sundays. The days must neither disappear nor appear twice. */
  it("stays complete across the daylight-saving change", () => {
    for (const [month, day] of [
      [new Date(2026, 2, 1), "2026-03-29"],
      [new Date(2026, 9, 1), "2026-10-25"],
    ] as const) {
      const cells = monthGrid(month).map(iso);
      expect(cells.filter((c) => c === day)).toHaveLength(1);
      expect(new Set(cells).size).toBe(42);
    }
  });
});

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe("bandBounds - a settled range and the preview", () => {
  it("takes a range chosen forwards unchanged", () => {
    const band = bandBounds(day(2026, 6, 5), day(2026, 6, 10), null);
    expect([iso(band.from!), iso(band.to!)]).toEqual(["2026-06-05", "2026-06-10"]);
    expect(band.isPreview).toBe(false);
  });

  it("silently turns a range dragged backwards around", () => {
    const band = bandBounds(day(2026, 6, 10), null, day(2026, 6, 5));
    expect([iso(band.from!), iso(band.to!)]).toEqual(["2026-06-05", "2026-06-10"]);
    expect(band.isPreview).toBe(true);
  });

  it("shows no band as long as only the start is settled", () => {
    const band = bandBounds(day(2026, 6, 5), null, null);
    expect([band.from, band.to, band.isPreview]).toEqual([null, null, false]);
  });

  it("lets the settled end count before the preview", () => {
    const band = bandBounds(day(2026, 6, 5), day(2026, 6, 10), day(2026, 6, 20));
    expect(iso(band.to!)).toBe("2026-06-10");
    expect(band.isPreview).toBe(false);
  });

  it("shows nothing at all without a start", () => {
    expect(bandBounds(null, day(2026, 6, 10), null).from).toBeNull();
  });
});

describe("dayStep and viewFollows - the arrow keys", () => {
  it("maps the four arrow keys onto day steps", () => {
    expect(dayStep("ArrowLeft")).toBe(-1);
    expect(dayStep("ArrowRight")).toBe(1);
    expect(dayStep("ArrowUp")).toBe(-7);
    expect(dayStep("ArrowDown")).toBe(7);
  });

  it("knows no other keys", () => {
    expect(dayStep("Enter")).toBeUndefined();
    expect(dayStep(" ")).toBeUndefined();
  });

  it("lets the view follow as soon as the step leaves the month", () => {
    expect(viewFollows(day(2026, 7, 1), day(2026, 6, 1))).toBe(true);
    expect(viewFollows(day(2026, 6, 15), day(2026, 6, 1))).toBe(false);
  });

  it("recognises the turn of the year even with the same month", () => {
    expect(viewFollows(day(2027, 6, 1), day(2026, 6, 1))).toBe(true);
  });
});

describe("shiftMonth", () => {
  it("keeps the day of the month", () => {
    expect(iso(shiftMonth(new Date(2026, 8, 22), 1))).toBe("2026-10-22");
    expect(iso(shiftMonth(new Date(2026, 0, 15), -1))).toBe("2025-12-15");
  });

  it("takes the last day of a shorter month", () => {
    expect(iso(shiftMonth(new Date(2026, 0, 31), 1))).toBe("2026-02-28");
    expect(iso(shiftMonth(new Date(2024, 2, 31), -1))).toBe("2024-02-29");
  });
});
