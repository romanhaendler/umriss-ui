/* The value contract of the pickers (picker-value-contract). Two resolutions:
   "day" hands out local midnight, "instant" the exact moment. The crucial point
   is that both agree about the same days and differ only in how they express
   the ends. */

import { describe, expect, it } from "vitest";
import { rangeFromDays, order, orderByDay, startOfDay, endOfDay } from "../src/components/DatePicker/contract";

const stamp = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ` +
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

describe("startOfDay and endOfDay", () => {
  it("sets the start to local midnight", () => {
    expect(stamp(startOfDay(new Date(2026, 5, 15, 14, 30, 45)))).toBe("2026-06-15 00:00:00");
  });

  it("sets the end to the last representable moment of the day", () => {
    expect(stamp(endOfDay(new Date(2026, 5, 15, 8, 0, 0), false))).toBe("2026-06-15 23:59:00");
    expect(stamp(endOfDay(new Date(2026, 5, 15, 8, 0, 0), true))).toBe("2026-06-15 23:59:59");
  });

  it("is applicable more than once without shifting the value", () => {
    const once = startOfDay(new Date(2026, 5, 15, 14, 30));
    expect(stamp(startOfDay(once))).toBe(stamp(once));
    const end = endOfDay(new Date(2026, 5, 15), true);
    expect(stamp(endOfDay(end, true))).toBe(stamp(end));
  });

  /* On 29.03.2026 the hour from 02:00 to 03:00 is dropped. Midnight exists
     nonetheless. */
  it("hits midnight on the day of the change as well", () => {
    expect(stamp(startOfDay(new Date(2026, 2, 29, 14, 0)))).toBe("2026-03-29 00:00:00");
    expect(startOfDay(new Date(2026, 2, 29, 14, 0)).getHours()).toBe(0);
  });
});

describe("order - from never lies after to", () => {
  it("turns swapped instants around", () => {
    const [from, to] = order(new Date(2026, 5, 20), new Date(2026, 5, 10));
    expect([stamp(from), stamp(to)]).toEqual(["2026-06-10 00:00:00", "2026-06-20 00:00:00"]);
  });

  it("leaves those lying the right way round alone", () => {
    const [from, to] = order(new Date(2026, 5, 10, 9, 0), new Date(2026, 5, 10, 17, 0));
    expect([stamp(from), stamp(to)]).toEqual(["2026-06-10 09:00:00", "2026-06-10 17:00:00"]);
  });

  it("compares only the days in orderByDay", () => {
    // The same day, the later time first: by days there is nothing to turn around.
    const [from, to] = orderByDay(new Date(2026, 5, 10, 17, 0), new Date(2026, 5, 10, 9, 0));
    expect([stamp(from), stamp(to)]).toEqual(["2026-06-10 17:00:00", "2026-06-10 09:00:00"]);
  });
});

describe("rangeFromDays - one preset, two resolutions", () => {
  const fromDay = new Date(2026, 5, 9);
  const toDay = new Date(2026, 5, 15);

  it("gives both ends on midnight under 'day'", () => {
    const r = rangeFromDays(fromDay, toDay, "day", false);
    expect([stamp(r.from), stamp(r.to)]).toEqual(["2026-06-09 00:00:00", "2026-06-15 00:00:00"]);
  });

  it("gives the whole last day along under 'instant'", () => {
    const r = rangeFromDays(fromDay, toDay, "instant", false);
    expect([stamp(r.from), stamp(r.to)]).toEqual(["2026-06-09 00:00:00", "2026-06-15 23:59:00"]);
  });

  it("respects the seconds resolution under 'instant'", () => {
    const r = rangeFromDays(fromDay, toDay, "instant", true);
    expect(stamp(r.to)).toBe("2026-06-15 23:59:59");
  });

  /* The actual assurance: the same preset means the same days in both pickers.
     Only the expression of the ends differs. */
  it("agrees about the days, whichever resolution it is", () => {
    const asDay = rangeFromDays(fromDay, toDay, "day", false);
    const asInstant = rangeFromDays(fromDay, toDay, "instant", true);
    expect(asDay.from.getDate()).toBe(asInstant.from.getDate());
    expect(asDay.to.getDate()).toBe(asInstant.to.getDate());
  });

  it("turns swapped day boundaries around", () => {
    const r = rangeFromDays(toDay, fromDay, "day", false);
    expect([stamp(r.from), stamp(r.to)]).toEqual(["2026-06-09 00:00:00", "2026-06-15 00:00:00"]);
  });
});
