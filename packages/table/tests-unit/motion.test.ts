/* Motion that explains the grouping (table-grouping 06): which lines travel,
   and how far. */

import { describe, expect, it } from "vitest";
import { deltas } from "../src/motion";

describe("deltas", () => {
  it("moves the lines that stay by where they stood minus where they stand", () => {
    const before = new Map([
      ["A-1041", 100],
      ["A-1043", 136],
      ["A-1044", 172],
    ]);
    const after = new Map([
      ["band:Line 1", 100],
      ["A-1041", 136],
      ["A-1044", 172],
      ["band:Line 2", 208],
      ["A-1043", 244],
    ]);
    expect(Object.fromEntries(deltas(before, after))).toEqual({ "A-1041": -36, "A-1043": -108 });
  });

  it("leaves out what did not move by half a pixel", () => {
    expect(deltas(new Map([["a", 10]]), new Map([["a", 10.3]])).size).toBe(0);
  });
});
