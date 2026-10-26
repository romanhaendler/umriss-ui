// @vitest-environment jsdom

/* The error-bars example as a reader meets it: the tooltip at a batch names the
   interval by its two bounds and the mean by its value, in that order, and no
   text on the page calls the bounds a quartile. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import ErrorBars from "../demo/examples/Bar/09-error-bars";
import { focusPlot, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

describe("The error-bars example", () => {
  it("names the interval by both bounds and the mean at a batch", async () => {
    const r = await renderChart(<ErrorBars />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "Home");
    const tip = tooltipOf(r.host);

    const [, low, high] = /95 % interval\s*(-?[\d,.]+) – (-?[\d,.]+)/.exec(tip) ?? [];
    const [, middle] = /Mean\s*(-?[\d,.]+)/.exec(tip) ?? [];
    expect(low).toBeDefined();
    expect(middle).toBeDefined();
    const lower = Number(low?.replace(/,/g, ""));
    const upper = Number(high?.replace(/,/g, ""));
    const estimate = Number(middle?.replace(/,/g, ""));
    expect(lower).toBeLessThan(estimate);
    expect(estimate).toBeLessThan(upper);
  });

  it("never calls a bound a quartile", async () => {
    const r = await renderChart(<ErrorBars />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "Home");
    await act(async () => (r.host.querySelector(".uc-data-key") as HTMLButtonElement | null)?.click());
    expect(r.host.textContent ?? "").not.toMatch(/quartile/i);
  });
});
