// @vitest-environment jsdom

/* charts-a11y 03: what a screen reader hears. A polite readout after a key -
   never after the pointer -, written once the keys rest; and a summary the
   plot is described by, rebuilt when the visible domain moves. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../src";
import { ChartScene } from "../src/scene";
import { focusPlot, frame, plotOf as plot, press, renderChart, sizePlot } from "./renderChart";

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

function tree(domain?: [number, number], zoom = false) {
  return (
    <Chart data={data} ariaLabel="Two courses">
      <XAxis accessor={(d: Row) => d.t} tickFormat={(v) => `t${v}`} domain={domain} onDomainChange={zoom ? () => undefined : undefined} />
      <YAxis accessor={(d: Row) => d.b} tickFormat={(v) => `${v} u`} />
      <Line accessor={(d: Row) => d.a} name="A" />
      <Line accessor={(d: Row) => d.b} name="B" />
      <Tooltip />
    </Chart>
  );
}

const readout = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";
const summary = (host: HTMLElement) => {
  const id = plot(host).getAttribute("aria-describedby");
  return (id === null ? null : document.getElementById(id))?.textContent ?? "";
};

describe("The readout", () => {
  it("reads x and every series once the keys rest, the emphasised one first", async () => {
    const r = await renderChart(tree());
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "ArrowLeft");
    await press(r.host, "ArrowDown");
    expect(readout(r.host)).toBe("");
    await rest(200);
    expect(readout(r.host)).toBe("t3. B 103 u. A 13 u.");
  });

  it("stays silent for the pointer", async () => {
    const scene = new ChartScene();
    const host = document.createElement("div");
    const live = document.createElement("div");
    document.body.append(host, live);
    scene.bind(host, document.createElement("canvas"), document.createElement("canvas"), host);
    scene.bindA11y(live, null);
    scene.setData(data);
    scene.registerAxis({ id: "x", orientation: "x", position: "bottom", accessor: (d) => (d as Row).t, domain: "data" });
    scene.registerAxis({ id: "y", orientation: "y", position: "left", accessor: (d) => (d as Row).b, domain: "data" });
    scene.registerSeries({ kind: "line", accessor: (d) => (d as Row).a, xAxisId: "x", yAxisId: "y", strokeWidth: 1.5, markers: "auto", name: "A" });
    scene.registerTooltip({ mode: "x" });
    scene.requestResize(400, 300);
    await frame();
    const plotArea = scene.getLayoutSnapshot().layout.plot;
    scene.pointerMove(plotArea.x + plotArea.width / 2, plotArea.y + plotArea.height / 2);
    await rest(200);
    expect(live.textContent).toBe("");
    scene.unbind();
  });
});

describe("The summary", () => {
  it("names the series, the visible stretch, each series' range and the keys", async () => {
    const r = await renderChart(tree());
    unmount = r.unmount;
    await rest(150);
    expect(summary(r.host)).toBe(
      "2 series: A, B. From t0 to t4. A from 10 u to 14 u. B from 100 u to 104 u. " +
        "Left and right arrows move through the values, up and down change the series, Home and End go to the first and the last, Escape clears.",
    );
  });

  it("follows the visible domain, and names the zoom keys where there is zoom", async () => {
    const r = await renderChart(tree(undefined, true));
    unmount = r.unmount;
    await r.rerender(tree([1, 3], true));
    await rest(150);
    expect(summary(r.host)).toContain("From t1 to t3. A from 11 u to 13 u.");
    expect(summary(r.host)).toContain("Plus and minus zoom");
  });
});
