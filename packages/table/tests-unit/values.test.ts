/* The defaults by value type (umriss-table 07) as pure calculation. The
   component tests check the same rules once more in the cell - here stands what
   the rule IS, there that the table applies it. */

import { describe, expect, it } from "vitest";
import { DEFAULT_FORMATS, DEFAULT_WORDING } from "@umriss-ui/core";
import type { Formats } from "@umriss-ui/core";
import {
  asText,
  columnKind,
  kindOf,
  exportValue,
  filterKey,
  ABSENT_KEY,
  footerValue,
  isAbsent,
  isRightAligned,
  sortValue,
} from "../src/values";

/* Formats that differ from the German ones: that way it is visible that the
   calculation uses them and not its own. */
const OWN: Formats = {
  ...DEFAULT_FORMATS,
  number: (n, k) => `Z(${n},${k ?? "-"})`,
  count: (n) => `A(${n})`,
  percent: (n) => `P(${n})`,
  date: (d) => `D(${d.getUTCFullYear()})`,
  time: (_d, s) => `T(${s})`,
  dateTime: (_d, s) => `DT(${s})`,
};

describe("absent values", () => {
  it("are null, undefined and not-a-number - and nothing else", () => {
    expect(isAbsent(null)).toBe(true);
    expect(isAbsent(undefined)).toBe(true);
    expect(isAbsent(Number.NaN)).toBe(true);
    expect(isAbsent(0)).toBe(false);
    expect(isAbsent("")).toBe(false);
    expect(isAbsent(false)).toBe(false);
  });
});

describe("The kind of a value", () => {
  it("tells text, number, point in time, boolean and everything else apart", () => {
    expect(kindOf("a")).toBe("text");
    expect(kindOf(3)).toBe("number");
    expect(kindOf(new Date(0))).toBe("date");
    expect(kindOf(true)).toBe("boolean");
    expect(kindOf([1])).toBe("other");
    expect(kindOf({ a: 1 })).toBe("other");
    expect(kindOf(null)).toBe("empty");
    expect(kindOf(new Date(Number.NaN))).toBe("empty");
  });

  it("of a column is that of the first value present", () => {
    const rows = [{ w: null }, { w: undefined }, { w: 4 }, { w: "x" }];
    expect(columnKind(rows, (z) => z.w)).toBe("number");
    expect(columnKind([{ w: null }], (z) => z.w)).toBe("empty");
  });

  it("decides the alignment, unless the caller says so", () => {
    expect(isRightAligned("number", undefined)).toBe(true);
    expect(isRightAligned("text", undefined)).toBe(false);
    expect(isRightAligned("text", true)).toBe(true);
    expect(isRightAligned("number", false)).toBe(false);
  });
});

describe("Presentation without children", () => {
  const text = (value: unknown, format?: Parameters<typeof asText>[1]) =>
    asText(value, format, OWN, DEFAULT_WORDING);

  it("shows text as it is", () => {
    expect(text("A-2041")).toBe("A-2041");
  });

  it("writes numbers with the formats of the seam, by name as well", () => {
    expect(text(12.5)).toBe("Z(12.5,-)");
    expect(text(0.42, "percent")).toBe("P(0.42)");
    expect(text(1204, "count")).toBe("A(1204)");
    expect(text(3.14159, { decimals: 2 })).toBe("Z(3.14159,2)");
  });

  it("writes points in time as date and time, or as named", () => {
    const d = new Date(Date.UTC(2026, 2, 17, 9, 5));
    expect(text(d)).toBe("DT(false)");
    expect(text(d, "date")).toBe("D(2026)");
    expect(text(d, "time")).toBe("T(false)");
  });

  it("writes booleans as a word", () => {
    expect(text(true)).toBe(DEFAULT_WORDING.booleanYes);
    expect(text(false)).toBe(DEFAULT_WORDING.booleanNo);
  });

  it("has no text for anything else", () => {
    expect(text([1, 2])).toBeNull();
  });
});

describe("The sort value", () => {
  it("is the value itself, the time of a point in time, false before true", () => {
    expect(sortValue("b")).toBe("b");
    expect(sortValue(2)).toBe(2);
    expect(sortValue(new Date(5))).toBe(5);
    expect(sortValue(false)).toBe(0);
    expect(sortValue(true)).toBe(1);
  });

  it("stays absent where the value is absent, and for a kind without an order", () => {
    expect(sortValue(null)).toBeUndefined();
    expect(sortValue(Number.NaN)).toBeUndefined();
    expect(sortValue({ a: 1 })).toBeUndefined();
  });

  it("takes a path of its own where the caller gives one", () => {
    expect(sortValue({ rank: 3 }, (w: { rank: number }) => w.rank)).toBe(3);
  });
});

describe("The export value", () => {
  it("leaves numbers as numbers and turns points in time into ISO timestamps", () => {
    expect(exportValue(0.42)).toBe(0.42);
    expect(exportValue(new Date(Date.UTC(2026, 2, 17)))).toBe("2026-03-17T00:00:00.000Z");
    expect(exportValue(true)).toBe("ja");
    expect(exportValue(false)).toBe("nein");
    expect(exportValue(undefined)).toBeUndefined();
    expect(exportValue([1])).toBeUndefined();
  });
});

describe("The footer row", () => {
  const rows = [{ w: 2 }, { w: null }, { w: 4 }, { w: Number.NaN }];

  it("sums and averages without the absent values", () => {
    expect(footerValue(rows, (z) => z.w, "sum")).toBe(6);
    expect(footerValue(rows, (z) => z.w, "avg")).toBe(3);
  });

  it("has no number without a single value", () => {
    expect(footerValue([{ w: null }], (z) => z.w, "avg")).toBeUndefined();
    expect(footerValue([], (z: { w: number }) => z.w, "sum")).toBeUndefined();
  });
});

describe("The filter key", () => {
  it("tells the absent value apart from every text", () => {
    expect(filterKey(null)).toBe(ABSENT_KEY);
    expect(filterKey(ABSENT_KEY)).not.toBe(ABSENT_KEY);
    expect(filterKey(3)).toBe(filterKey(3));
    expect(filterKey(new Date(7))).toBe(filterKey(new Date(7)));
  });
});
