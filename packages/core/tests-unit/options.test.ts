/* Option list logic (pure-logic-seams), shared by Combobox and MultiSelect.
   The set operations are the delicate part: they work on the filtered,
   selectable subset and must never touch selections outside it. */

import { describe, expect, it } from "vitest";
import {
  selectAllOf,
  filterOptions,
  selectNoneOf,
  nextIndex,
  startIndex,
  invertSelection,
  selectableValues,
} from "../src/lib/options";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma", disabled: true },
] as const;

const values = (list: ReadonlyArray<{ value: string }>) => list.map((o) => o.value);

describe("filterOptions", () => {
  it("returns the whole list without a query", () => {
    expect(filterOptions(OPTIONS, "")).toEqual(OPTIONS);
    expect(filterOptions(OPTIONS, "   ")).toEqual(OPTIONS);
  });

  it("searches the label without regard to case", () => {
    expect(values(filterOptions(OPTIONS, "al"))).toEqual(["a"]);
    expect(values(filterOptions(OPTIONS, "AL"))).toEqual(["a"]);
  });

  it("ignores whitespace at the edges", () => {
    expect(values(filterOptions(OPTIONS, "  et  "))).toEqual(["b"]);
  });

  it("yields an empty list where nothing fits", () => {
    expect(filterOptions(OPTIONS, "zzz")).toEqual([]);
  });

  it("does not filter out disabled options", () => {
    expect(values(filterOptions(OPTIONS, "gamma"))).toEqual(["c"]);
  });
});

describe("selectableValues", () => {
  it("leaves disabled options out", () => {
    expect(selectableValues(OPTIONS)).toEqual(["a", "b"]);
  });
});

/* "aussen" is a value that does not stand in the subset passed in - because it
   was filtered away, say. It must survive every operation. */
describe("Set operations on the filtered subset", () => {
  it("selects all of the subset and keeps selections outside it", () => {
    expect(selectAllOf(["aussen"], ["a", "b"])).toEqual(["aussen", "a", "b"]);
  });

  it("deselects all of the subset and keeps selections outside it", () => {
    expect(selectNoneOf(["aussen", "a"], ["a", "b"])).toEqual(["aussen"]);
  });

  it("inverts only the subset and keeps selections outside it", () => {
    expect(invertSelection(["aussen", "a"], ["a", "b"])).toEqual(["aussen", "b"]);
  });

  it("does not take an already selected value in twice", () => {
    expect(selectAllOf(["a"], ["a", "b"])).toEqual(["a", "b"]);
  });

  it("leaves the selection unchanged for an empty subset", () => {
    expect(selectAllOf(["a"], [])).toEqual(["a"]);
    expect(selectNoneOf(["a"], [])).toEqual(["a"]);
    expect(invertSelection(["a"], [])).toEqual(["a"]);
  });
});

describe("Keyboard navigation in the list", () => {
  it("runs forwards and wraps at the end", () => {
    expect(nextIndex(0, 3, 1)).toBe(1);
    expect(nextIndex(2, 3, 1)).toBe(0);
  });

  it("runs backwards and wraps at the front", () => {
    expect(nextIndex(1, 3, -1)).toBe(0);
    expect(nextIndex(0, 3, -1)).toBe(2);
  });

  it("stays at zero for an empty list", () => {
    expect(nextIndex(0, 0, 1)).toBe(0);
  });
});

describe("startIndex – where the list stands on opening", () => {
  it("stands on the selected option", () => {
    expect(startIndex(OPTIONS, "b")).toBe(1);
  });

  /* Written down: where the selection is not in the list (because it is being
     filtered, say), navigation begins at the top. Until now that arose
     incidentally out of Math.max(0, -1); here it is the promised answer. */
  it("begins at the top where the selection is not in the list", () => {
    expect(startIndex(OPTIONS, "zzz")).toBe(0);
    expect(startIndex(OPTIONS, null)).toBe(0);
  });
});
