/* The schedule's view as data (ADR-0047, component-view 07): what a view
   handed in is compared by, which groups fall out, and the span a schedule
   shows while its view names none. */

import { describe, expect, it } from "vitest";
import { HOUR } from "@umriss-ui/charts";
import { defaultSpan, onlyKnown, viewKey } from "../src/view";
import type { Subtask } from "../src";

describe("viewKey", () => {
  it("is the same for two views of the same content, written apart", () => {
    expect(viewKey({ domain: [0, 10], folded: ["a", "b"] })).toBe(viewKey({ folded: ["a", "b"], domain: [0, 10] }));
  });

  it("does not count the order of the folded groups - the same groups are folded", () => {
    expect(viewKey({ folded: ["b", "a"] })).toBe(viewKey({ folded: ["a", "b"] }));
  });

  it("takes an empty fold for no fold: whatever is at its default is absent", () => {
    expect(viewKey({ folded: [] })).toBe(viewKey({}));
  });

  it("tells another span or another fold apart", () => {
    expect(viewKey({ domain: [0, 10] })).not.toBe(viewKey({ domain: [0, 11] }));
    expect(viewKey({ domain: [0, 10] })).not.toBe(viewKey({}));
    expect(viewKey({ folded: ["a"] })).not.toBe(viewKey({ folded: ["b"] }));
  });
});

describe("onlyKnown", () => {
  it("drops the folded groups that are not declared", () => {
    expect(onlyKnown({ domain: [0, 1], folded: ["hall", "gone"] }, new Set(["hall", "line"]))).toEqual({ domain: [0, 1], folded: ["hall"] });
  });

  it("leaves the fold out once no group of it is declared", () => {
    expect(onlyKnown({ folded: ["gone"] }, new Set(["hall"]))).toEqual({});
  });

  it("keeps the view as it is while no group has been declared yet - the first render would erase every fold", () => {
    const view = { folded: ["hall"] };
    expect(onlyKnown(view, new Set())).toBe(view);
  });
});

describe("defaultSpan", () => {
  const LIMITS = { min: HOUR, max: 10 * HOUR };
  const work = (from: number, to: number, more: Partial<Subtask> = {}): Subtask => ({ id: `${from}`, task: "t", lane: "l", from, to, ...more });

  it("is the extent of the subtasks, their lead-in and lead-out included", () => {
    expect(defaultSpan([work(2 * HOUR, 3 * HOUR, { leadIn: HOUR }), work(4 * HOUR, 5 * HOUR, { leadOut: HOUR / 2 })], LIMITS)).toEqual([HOUR, 5.5 * HOUR]);
  });

  it("widens around its middle to the narrowest span zoom may reach", () => {
    expect(defaultSpan([work(10 * HOUR, 10.5 * HOUR)], LIMITS)).toEqual([9.75 * HOUR, 10.75 * HOUR]);
  });

  it("narrows around its middle to the widest span zoom may reach", () => {
    expect(defaultSpan([work(0, 4 * HOUR), work(16 * HOUR, 20 * HOUR)], LIMITS)).toEqual([5 * HOUR, 15 * HOUR]);
  });

  it("is none without subtasks", () => {
    expect(defaultSpan([], LIMITS)).toBeNull();
  });
});
