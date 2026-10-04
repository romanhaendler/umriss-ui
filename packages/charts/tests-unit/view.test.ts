/* component-view 01 and 02 (ADR-0047): the chart's view model - compared by
   content, an echo of its own report ignored, unknown axis ids and series
   names out, zoom inside its limits, never every series hidden. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultLimits, Echoes, hidesAll, onlyKnown, onlyVisible, showOnly, toggleHidden, viewKey, zoomSpan } from "../src/view";

describe("viewKey", () => {
  it("compares by content, not by the order of the ids or the names", () => {
    expect(viewKey({ domains: { x: [0, 10], top: [1, 2] }, hidden: ["b", "a"] })).toBe(
      viewKey({ hidden: ["a", "b"], domains: { top: [1, 2], x: [0, 10] } }),
    );
  });

  it("takes an empty part for an absent one", () => {
    expect(viewKey({ domains: {}, hidden: [] })).toBe(viewKey({}));
  });

  it("tells two spans apart", () => {
    expect(viewKey({ domains: { x: [0, 10] } })).not.toBe(viewKey({ domains: { x: [0, 11] } }));
  });
});

describe("onlyKnown", () => {
  it("drops the spans of axes that do not zoom here", () => {
    expect(onlyKnown({ domains: { x: [0, 10], gone: [1, 2] } }, new Set(["x"]))).toEqual({ domains: { x: [0, 10] } });
  });

  it("leaves the view alone while no axis is declared", () => {
    const view = { domains: { x: [0, 10] as [number, number] } };
    expect(onlyKnown(view, null)).toBe(view);
  });

  it("drops the domains altogether when none is known", () => {
    expect(onlyKnown({ domains: { x: [0, 10] } }, new Set())).toEqual({});
  });

  it("drops the hidden names no series carries", () => {
    expect(onlyKnown({ hidden: ["A", "gone"] }, null, new Set(["A", "B"]))).toEqual({ hidden: ["A"] });
    expect(onlyKnown({ hidden: ["gone"] }, null, new Set(["A"]))).toEqual({});
  });

  it("leaves the hidden names alone while no series is declared", () => {
    const view = { hidden: ["A"] };
    expect(onlyKnown(view, null, null)).toBe(view);
  });
});

describe("Hiding series", () => {
  const series = ["A", "B", "C"];

  it("hides a shown series and shows a hidden one", () => {
    expect(toggleHidden([], ["B"])).toEqual(["B"]);
    expect(toggleHidden(["B", "C"], ["B"])).toEqual(["C"]);
  });

  it("shows several names together where every one is hidden, and hides them together otherwise", () => {
    expect(toggleHidden(["A", "B"], ["A", "B"])).toEqual([]);
    expect(toggleHidden(["A"], ["A", "B"])).toEqual(["A", "B"]);
  });

  it("knows when every series would be hidden", () => {
    expect(hidesAll(["A", "B", "C"], series)).toBe(true);
    expect(hidesAll(["A", "B"], series)).toBe(false);
    expect(hidesAll([], [])).toBe(false);
  });

  it("counts a series without a name as visible: it cannot be hidden", () => {
    expect(hidesAll(["A", "B", "C"], [...series, undefined])).toBe(false);
  });

  it("shows only some series", () => {
    expect(showOnly(["A"], series)).toEqual(["B", "C"]);
    expect(showOnly(["A", "B"], series)).toEqual(["C"]);
    expect(showOnly(["gone"], series)).toEqual(series);
  });

  it("knows when some series are the only ones visible, unnamed ones aside", () => {
    expect(onlyVisible(["A"], ["B", "C"], [...series, undefined])).toBe(true);
    expect(onlyVisible(["A"], ["B"], series)).toBe(false);
    expect(onlyVisible(["A"], ["A", "B", "C"], series)).toBe(false);
  });
});

describe("Echoes", () => {
  let now = 0;
  beforeEach(() => {
    now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
  });
  afterEach(() => vi.restoreAllMocks());

  const reported = (...keys: string[]) => {
    const echoes = new Echoes();
    for (const key of keys) echoes.reported(key);
    return echoes;
  };

  it("knows a view the chart reported itself", () => {
    expect(reported("a", "b").has("a")).toBe(true);
    expect(reported("a", "b").has("z")).toBe(false);
  });

  it("drops an echo and every older report once it is handed in", () => {
    const echoes = reported("a", "b", "c");
    echoes.handed("b");
    expect([echoes.has("a"), echoes.has("b"), echoes.has("c")]).toEqual([false, false, true]);
  });

  it("drops every report when a view from outside is handed in", () => {
    const echoes = reported("a", "b");
    echoes.handed("z");
    expect([echoes.has("a"), echoes.has("b")]).toEqual([false, false]);
  });

  it("takes a report a second old for a view to go to", () => {
    const echoes = reported("a");
    now = 1000;
    expect(echoes.has("a")).toBe(false);
  });
});

describe("zoomSpan", () => {
  const wide = { min: 0, max: Infinity };

  it("zooms around a share of the span, which keeps its value", () => {
    expect(zoomSpan([0, 100], 1, 0.8, wide)).toEqual([20, 100]);
    expect(zoomSpan([0, 100], 0.5, 0.5, wide)).toEqual([25, 75]);
  });

  it("stops at the narrowest span", () => {
    expect(zoomSpan([0, 100], 0.5, 0.01, { min: 30, max: 1000 })).toEqual([35, 65]);
  });

  it("stops at the widest span", () => {
    expect(zoomSpan([0, 100], 0, 10, { min: 1, max: 200 })).toEqual([0, 200]);
  });
});

describe("defaultLimits", () => {
  it("is at most the data's extent and at least three data steps", () => {
    expect(defaultLimits([0, 100], 10)).toEqual({ min: 30, max: 100 });
  });

  it("has no narrowest span where no step can be measured", () => {
    expect(defaultLimits([5, 5], 0)).toEqual({ min: 0, max: 0 });
  });
});
