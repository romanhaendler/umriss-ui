// @vitest-environment jsdom

/* charts-stacking 02, 03: a stack as a reader meets it - the tooltip and the
   readout name each series' own value and the stack's total (K4), the data
   table lists the own values, a hidden member gives up its place, and a
   normalised stack reads in percent (K5). */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { Area, Bar, Chart, DataTable, Line, Tooltip, XAxis, YAxis } from "../src";
import { ChartScene } from "../src/scene";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import type { BarSeriesConfig } from "../src/types";
import { focusPlot, frame, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

interface Row {
  t: number;
  a: number | null;
  b: number;
}

const data: Row[] = [
  { t: 0, a: 1, b: 3 },
  { t: 1, a: 2, b: 4 },
  { t: 2, a: null, b: 5 },
];

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

async function mount(element: ReactNode): Promise<HTMLElement> {
  const r = await renderChart(element);
  unmount = r.unmount;
  return r.host;
}

const rest = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const readout = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";
const ticks = (host: HTMLElement) => [...host.querySelectorAll(".uc-tick")].map((t) => t.textContent);

function stack(kind: "bar" | "area", extra: { normalize?: boolean; format?: (v: number) => string; wording?: typeof GERMAN_CHARTS_WORDING } = {}): ReactNode {
  const Kind = kind === "bar" ? Bar : Area;
  return (
    <Chart data={data} ariaLabel="A stack" wording={extra.wording}>
      <XAxis accessor={(d: Row) => d.t} tickFormat={(v) => `t${v}`} />
      <YAxis accessor={(d: Row) => d.b} />
      <Kind accessor={(d: Row) => d.a} name="A" stack="s" normalize={extra.normalize} format={extra.format} />
      <Kind accessor={(d: Row) => d.b} name="B" stack="s" normalize={extra.normalize} format={extra.format} />
      <Tooltip />
      <DataTable />
    </Chart>
  );
}

describe("A stack in the tooltip and the readout", () => {
  it("names each series' own value and the total as its last row", async () => {
    const host = await mount(stack("bar"));
    await focusPlot(host);
    await press(host, "ArrowLeft");
    const rows = [...host.querySelectorAll(".uc-tooltip-row")].map((r) => r.textContent);
    expect(rows).toEqual(["A2", "B4", "Total6"]);
    await rest(200);
    expect(readout(host)).toBe("t1. A 2. B 4. Total 6.");
    // The summary's ranges are the own values' too.
    const summary = document.getElementById(host.querySelector(".uc-plot")?.getAttribute("aria-describedby") ?? "")?.textContent;
    expect(summary).toContain("A from 1 to 2. B from 3 to 5.");
  });

  it("leaves a gap out of the rows and counts it as zero in the total", async () => {
    const host = await mount(stack("area"));
    await focusPlot(host);
    const rows = [...host.querySelectorAll(".uc-tooltip-row")].map((r) => r.textContent);
    expect(rows).toEqual(["B5", "Total5"]);
  });

  it("writes the total's name from the wording", async () => {
    const host = await mount(stack("bar", { wording: GERMAN_CHARTS_WORDING }));
    await focusPlot(host);
    expect(tooltipOf(host)).toContain("Summe5");
  });
});

describe("A stack in the data table", () => {
  it("lists each series' own value, not its top", async () => {
    const host = await mount(stack("bar"));
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    const rows = [...host.querySelectorAll(".uc-data-panel tbody tr")].map((tr) =>
      [...tr.querySelectorAll("th, td")].map((c) => c.textContent).join("|"),
    );
    expect(rows).toEqual(["t0|1|3", "t1|2|4", "t2||5"]);
  });
});

describe("A normalised stack", () => {
  it("reads its shares in percent, the axis too, and its total as the readings'", async () => {
    const host = await mount(stack("bar", { normalize: true, format: (v) => `${v} pcs` }));
    await focusPlot(host);
    await press(host, "ArrowLeft");
    const rows = [...host.querySelectorAll(".uc-tooltip-row")].map((r) => r.textContent);
    expect(rows).toEqual(["A33.333%", "B66.667%", "Total6 pcs"]);
    expect(ticks(host)).toContain("100%");
  });

  it("leaves a line on its axis reading its own values, not percent", async () => {
    const host = await mount(
      <Chart data={data} ariaLabel="A stack and a line">
        <XAxis accessor={(d: Row) => d.t} tickFormat={(v) => `t${v}`} />
        <YAxis accessor={(d: Row) => d.b} />
        <Bar accessor={(d: Row) => d.a} name="A" stack="s" normalize />
        <Bar accessor={(d: Row) => d.b} name="B" stack="s" />
        <Line accessor={(d: Row) => d.b} name="Target" />
        <Tooltip />
      </Chart>,
    );
    await focusPlot(host);
    await press(host, "ArrowLeft");
    const rows = [...host.querySelectorAll(".uc-tooltip-row")].map((r) => r.textContent);
    // A member's normalize holds for the whole stack.
    expect(rows).toEqual(["A33.333%", "B66.667%", "Total6", "Target4"]);
  });

  it("writes the percent sign as its wording does", async () => {
    const host = await mount(stack("bar", { normalize: true, wording: GERMAN_CHARTS_WORDING }));
    expect(ticks(host)).toContain("100 %");
  });
});

/* The scene alone: the extent a stack gives its axis, and what a hidden
   member and the pointer do to it. */
describe("A stack in the scene", () => {
  const bar = (part: Partial<BarSeriesConfig>): BarSeriesConfig => ({
    kind: "bar",
    accessor: (d) => (d as Row).b,
    xAxisId: "x",
    yAxisId: "y",
    barWidth: 0.8,
    stack: "s",
    ...part,
  });

  function scene(): { scene: ChartScene; lower: number } {
    const s = new ChartScene();
    s.setData(data);
    s.registerAxis({ id: "x", orientation: "x", position: "bottom", accessor: (d) => (d as Row).t, domain: "data" });
    s.registerAxis({ id: "y", orientation: "y", position: "left", accessor: (d) => (d as Row).b, domain: "data" });
    const lower = s.registerSeries(bar({ name: "A", accessor: (d) => (d as Row).a }));
    s.registerSeries(bar({ name: "B" }));
    return { scene: s, lower };
  }

  it("gives its axis the stack's extent, from zero to the highest top", () => {
    expect(scene().scene.axisExtent("y", "y")).toEqual([0, 6]);
  });

  it("closes over a hidden member: the others stand on what is left", () => {
    const { scene: s, lower } = scene();
    s.updateSeries(lower, bar({ name: "A", accessor: (d) => (d as Row).a, hidden: true }));
    expect(s.axisExtent("y", "y")).toEqual([0, 5]);
  });

  it("hits the segment under the pointer under \"nearest\", not the nearest top", async () => {
    const { scene: s } = scene();
    const host = document.createElement("div");
    document.body.appendChild(host);
    s.bind(host, document.createElement("canvas"), document.createElement("canvas"), host);
    s.registerTooltip({ mode: "nearest" });
    s.requestResize(400, 300);
    await frame();
    const layout = s.getLayoutSnapshot().layout;
    const x = layout.axes.find((a) => a.key === "x:x")?.scale;
    const y = layout.axes.find((a) => a.key === "y:y")?.scale;
    // At t1 A spans 0 to 2 and B 2 to 6. At 2.5 A's top is far nearer than
    // B's, and still B is under the pointer.
    s.pointerMove(x?.toPx(1) ?? 0, y?.toPx(1.8) ?? 0);
    expect(s.getHoverSnapshot().hover?.hit.points.map((p) => [p.seriesName, p.yValue])).toEqual([["A", 2]]);
    s.pointerMove(x?.toPx(1) ?? 0, y?.toPx(2.5) ?? 0);
    expect(s.getHoverSnapshot().hover?.hit.points.map((p) => [p.seriesName, p.yValue])).toEqual([["B", 4]]);
    s.unbind();
    host.remove();
  });

  it("normalises by a hidden member's normalize, as its axis does", () => {
    const { scene: s, lower } = scene();
    s.updateSeries(lower, bar({ name: "A", accessor: (d) => (d as Row).a, hidden: true, normalize: true }));
    expect(s.axisExtent("y", "y")).toEqual([0, 100]);
  });

  it("lets the keys land on a segment of zero height under \"nearest\"", async () => {
    const s = new ChartScene();
    s.setData([{ t: 0, a: 2, b: 0 }]);
    s.registerAxis({ id: "x", orientation: "x", position: "bottom", accessor: (d) => (d as Row).t, domain: "data" });
    s.registerAxis({ id: "y", orientation: "y", position: "left", accessor: (d) => (d as Row).b, domain: "data" });
    s.registerSeries(bar({ name: "A", accessor: (d) => (d as Row).a }));
    s.registerSeries(bar({ name: "B" }));
    const host = document.createElement("div");
    document.body.appendChild(host);
    s.bind(host, document.createElement("canvas"), document.createElement("canvas"), host);
    s.registerTooltip({ mode: "nearest" });
    s.requestResize(400, 300);
    await frame();
    s.key(new KeyboardEvent("keydown", { key: "End" }));
    s.key(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(s.getHoverSnapshot().hover?.hit.points.map((p) => p.seriesName)).toEqual(["B"]);
    s.unbind();
    host.remove();
  });
});
