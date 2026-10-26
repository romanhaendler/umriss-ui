// @vitest-environment jsdom

/* Pareto, example 02 (shares, not counts): the shares of a pareto() as bars
   on a percent axis. What a reader sees: a y tick in percent, and a tooltip
   that writes an entry's share in percent. */

import { describe, expect, it, vi } from "vitest";
import SharesNotCounts from "../demo/examples/Pareto/02-shares-not-counts";
import { focusPlot, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

describe("Shares, not counts", () => {
  it("reads a y tick in percent", async () => {
    sizePlot();
    const r = await renderChart(<SharesNotCounts />);
    const labels = [...r.host.querySelectorAll("*")].filter((el) => el.children.length === 0).map((el) => el.textContent);
    expect(labels).toContain("20%");
    r.unmount();
    vi.restoreAllMocks();
  });

  it("writes an entry's share in percent in the tooltip", async () => {
    sizePlot();
    const r = await renderChart(<SharesNotCounts />);
    await focusPlot(r.host);
    await press(r.host, "Home");
    // Nobody home is 312 of 698 failed deliveries, 45 %.
    expect(tooltipOf(r.host)).toContain("45%");
    r.unmount();
    vi.restoreAllMocks();
  });
});
