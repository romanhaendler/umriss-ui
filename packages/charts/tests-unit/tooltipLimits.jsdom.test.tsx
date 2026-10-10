// @vitest-environment jsdom

/* A limit a reader can reach without colour or pointer: the summary names every
   labelled limit with its value in its axis' format, and `<Tooltip limits />`
   adds a row per labelled limit of the hit's y axis - in the tooltip and in what
   a key reads out. Without the prop the tooltip and the readout stay as they
   were. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { LimitBand, LimitLine, Tooltip, useChart } from "../src";
import { focusPlot, plotOf as plot, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

interface Row {
  t: number;
  a: number;
  b: number;
}

const data: Row[] = [0, 1, 2, 3, 4].map((t) => ({ t, a: 10 + t, b: 100 + t }));

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

const rest = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const readout = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";
const summary = (host: HTMLElement) => {
  const id = plot(host).getAttribute("aria-describedby");
  return (id === null ? null : document.getElementById(id))?.textContent ?? "";
};

function Tree({ limits }: { limits?: boolean }) {
  const { Chart, XAxis, YAxis, Line } = useChart(data);
  return (
    <Chart ariaLabel="Two courses, one on its own axis">
      <XAxis value="t" />
      <YAxis tickFormat={(v) => `${v} u`} />
      <YAxis id="right" position="right" tickFormat={(v) => `${v} r`} />
      <LimitLine value={13} label="Target" />
      <LimitBand from={11} to={12} label="Zone" />
      <LimitLine value={12.5} />
      <LimitLine value={103} axisId="right" label="Right limit" />
      <Line value="a" name="A" />
      <Line value="b" name="B" yAxisId="right" />
      <Tooltip limits={limits} />
    </Chart>
  );
}

describe("Labelled limits for a reader without colour or pointer", () => {
  it("names each labelled limit in the summary, in its own axis' format", async () => {
    const r = await renderChart(<Tree />);
    unmount = r.unmount;
    await rest(200);
    expect(summary(r.host)).toContain("Limits: Target 13 u, Zone 11 u – 12 u, Right limit 103 r.");
  });

  it("leaves the tooltip and the readout alone without the prop", async () => {
    const r = await renderChart(<Tree />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "ArrowRight");
    await rest(200);
    expect(tooltipOf(r.host)).not.toContain("Target");
    expect(readout(r.host)).not.toContain("Target");
  });

  it("adds a row per labelled limit of the hit's y axis, in the tooltip and the readout", async () => {
    const r = await renderChart(<Tree limits />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "ArrowRight");
    await rest(200);
    // The primary hit is on the first y axis: its two labelled limits, not the right one's.
    expect(tooltipOf(r.host)).toContain("Target13 u");
    expect(tooltipOf(r.host)).toContain("Zone11 u – 12 u");
    expect(tooltipOf(r.host)).not.toContain("Right limit");
    expect(readout(r.host)).toMatch(/Target 13 u\. Zone 11 u – 12 u\.$/);
  });
});
