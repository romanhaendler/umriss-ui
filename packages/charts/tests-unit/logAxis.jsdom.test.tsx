// @vitest-environment jsdom

/* The decades example as a reader meets it: a labelled decade, unlabelled
   minor ticks, and a tooltip that writes the reading and not its logarithm. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Decades from "../demo/examples/Axis/10-values-over-decades";
import { focusPlot, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

const labels = (host: HTMLElement) => [...host.querySelectorAll(".uc-axis-y .uc-tick")].map((t) => t.textContent);

describe("The decades example", () => {
  it("labels a decade 10^3 and leaves a minor tick without a label", async () => {
    const r = await renderChart(<Decades />);
    unmount = r.unmount;
    const shown = labels(r.host);
    expect(shown).toContain("10^3");
    expect(shown).toContain("");
    expect(shown.filter((l) => l !== "")).toEqual(["10^0", "10^1", "10^2", "10^3", "10^4", "10^5", "10^6"]);
  });

  it("writes the reading in the tooltip, not its logarithm", async () => {
    const r = await renderChart(<Decades />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "ArrowLeft");
    const text = tooltipOf(r.host);
    expect(text).toMatch(/Lines per minute\s*\d{1,3}(,\d{3})*$/);
  });
});
