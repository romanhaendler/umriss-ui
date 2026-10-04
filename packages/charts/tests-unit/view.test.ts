/* component-view 01 (ADR-0047): the chart's view model - compared by
   content, an echo of its own report ignored, unknown axis ids out, zoom
   inside its limits. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultLimits, Echoes, onlyKnown, viewKey, zoomSpan } from "../src/view";

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
