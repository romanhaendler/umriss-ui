// @vitest-environment jsdom

/* box-plot 01: a box per x, read as it is drawn. What a person meets: the
   tooltip and the readout top to bottom (B9), the arrows walking box to box
   (B11), the data table's columns, the y axis reaching the whisker ends, and
   both wordings. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { BoxPlot, Chart, DataTable, Legend, Line, Tooltip, XAxis, YAxis, type ChartsWording } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import { ChartScene } from "../src/scene";
import type { BoxSeriesConfig } from "../src/types";
import { focusPlot, frame, press, renderChart, sizePlot } from "./renderChart";

interface Machine {
  at: number;
  lo: number;
  q1: number;
  med: number | null;
  q3: number;
  hi: number;
}

const MACHINES = ["Press", "Dryer", "Kiln", "Glaze"];
const data: Machine[] = [
  { at: 0, lo: 2, q1: 4, med: 5, q3: 6, hi: 9 },
  { at: 1, lo: 3, q1: 5, med: 6, q3: 8, hi: 12 },
  { at: 2, lo: 1, q1: 3, med: null, q3: 7, hi: 90 },
  { at: 3, lo: 4, q1: 6, med: 7, q3: 9, hi: 31 },
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

function chart(extra: { wording?: ChartsWording; format?: (v: number) => string; table?: boolean } = {}): ReactNode {
  return (
    <Chart data={data} ariaLabel="Cycle time per machine" wording={extra.wording}>
      <XAxis accessor={(d: Machine) => d.at} ticks={[0, 1, 2, 3]} tickFormat={(v) => MACHINES[v] ?? ""} />
      <YAxis accessor={(d: Machine) => d.hi} tickFormat={(v) => `${v} s`} />
      <BoxPlot
        name="Cycle time"
        median={(d: Machine) => d.med}
        lowerQuartile={(d: Machine) => d.q1}
        upperQuartile={(d: Machine) => d.q3}
        lowerWhisker={(d: Machine) => d.lo}
        upperWhisker={(d: Machine) => d.hi}
        format={extra.format}
      />
      <Tooltip />
      {extra.table === true && <DataTable />}
    </Chart>
  );
}

const rows = (host: HTMLElement) => [...host.querySelectorAll(".uc-tooltip-row")].map((r) => r.textContent);
const head = (host: HTMLElement) => host.querySelector(".uc-tooltip-head")?.textContent ?? "";
const readout = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";
const rest = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const ticks = (host: HTMLElement) => [...host.querySelectorAll(".uc-axis-y .uc-tick")].map((t) => t.textContent);

function tableOf(host: HTMLElement): string[] {
  return [...host.querySelectorAll(".uc-data-panel tr")].map((tr) =>
    [...tr.querySelectorAll("th, td")].map((c) => c.textContent).join("|"),
  );
}

describe("A box in the tooltip", () => {
  it("reads its numbers top to bottom as drawn, in the y axis' format", async () => {
    const host = await mount(chart());
    await focusPlot(host);
    await press(host, "Home");
    expect(head(host)).toBe("Press");
    expect(rows(host)).toEqual([
      "Cycle time",
      "Upper whisker9 s",
      "Upper quartile6 s",
      "Median5 s",
      "Lower quartile4 s",
      "Lower whisker2 s",
    ]);
  });

  it("writes every number in the series' own format", async () => {
    const host = await mount(chart({ format: (v) => `${v.toFixed(1)} min` }));
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host)).toContain("Upper whisker9.0 min");
    expect(rows(host)).toContain("Median5.0 min");
  });

  it("speaks German through the charts' German wording", async () => {
    const host = await mount(chart({ wording: GERMAN_CHARTS_WORDING }));
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host).slice(1)).toEqual([
      "Oberer Whisker9 s",
      "Oberes Quartil6 s",
      "Median5 s",
      "Unteres Quartil4 s",
      "Unterer Whisker2 s",
    ]);
  });
});

describe("The keyboard on a box plot", () => {
  it("walks box to box and steps over a gap", async () => {
    const host = await mount(chart());
    await focusPlot(host);
    expect(head(host)).toBe("Glaze");
    await press(host, "ArrowLeft");
    expect(head(host)).toBe("Dryer");
    await press(host, "ArrowRight");
    expect(head(host)).toBe("Glaze");
  });

  it("reads the box out in the tooltip's order", async () => {
    const host = await mount(chart());
    await focusPlot(host);
    await press(host, "Home");
    await rest(200);
    expect(readout(host)).toBe(
      "Press. Cycle time: Upper whisker 9 s, Upper quartile 6 s, Median 5 s, Lower quartile 4 s, Lower whisker 2 s.",
    );
  });
});

describe("The y axis of a box plot", () => {
  it("reaches the highest whisker end, and a gap's numbers do not pull it", async () => {
    const host = await mount(chart());
    const labels = ticks(host);
    // The highest whisker drawn is 31; the gap's 90 is not drawn.
    expect(labels).toContain("30 s");
    expect(labels).not.toContain("50 s");
  });
});

describe("A box in the data table", () => {
  it("has a column per number, top to bottom, and a gap's row is empty", async () => {
    const host = await mount(chart({ table: true }));
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    expect(tableOf(host)).toEqual([
      "Position|Cycle time – Upper whisker|Cycle time – Upper quartile|Cycle time – Median|Cycle time – Lower quartile|Cycle time – Lower whisker",
      "Press|9 s|6 s|5 s|4 s|2 s",
      "Dryer|12 s|8 s|6 s|5 s|3 s",
      "Kiln|||||",
      "Glaze|31 s|9 s|7 s|6 s|4 s",
    ]);
  });
});

/* box-plot 02: several series - grouped beside each other, mixed with a line,
   toggled from the legend. */
describe("Several box series", () => {
  const before = (d: Machine) => d.med;
  function grouped(extra: { hidden?: boolean; encoding?: "marks" } = {}): ReactNode {
    return (
      <Chart data={data} ariaLabel="Before and after" encoding={extra.encoding}>
        <XAxis accessor={(d: Machine) => d.at} ticks={[0, 1, 2, 3]} tickFormat={(v) => MACHINES[v] ?? ""} />
        <YAxis accessor={(d: Machine) => d.q3} tickFormat={(v) => `${v} s`} />
        <BoxPlot
          name="Before"
          median={before}
          lowerQuartile={(d: Machine) => d.q1}
          upperQuartile={(d: Machine) => d.q3}
          lowerWhisker={(d: Machine) => d.lo}
          upperWhisker={(d: Machine) => d.hi}
        />
        <BoxPlot
          name="After"
          hidden={extra.hidden}
          median={(d: Machine) => (d.med === null ? null : d.med - 1)}
          lowerQuartile={(d: Machine) => d.q1 - 1}
          upperQuartile={(d: Machine) => d.q3 - 1}
          lowerWhisker={(d: Machine) => d.lo - 1}
          upperWhisker={(d: Machine) => d.hi + 60}
        />
        <Line accessor={before} name="Median trend" />
        <Legend />
        <Tooltip />
      </Chart>
    );
  }

  it("reads both boxes and the line at one x in one tooltip", async () => {
    const host = await mount(grouped());
    await focusPlot(host);
    await press(host, "Home");
    const all = rows(host);
    expect(all.filter((r) => r === "Before" || r === "After")).toEqual(["Before", "After"]);
    expect(all).toContain("Median trend5 s");
    expect(all.filter((r) => r?.startsWith("Median"))).toEqual(["Median5 s", "Median4 s", "Median trend5 s"]);
  });

  it("takes a hidden box series out of the tooltip and the extent, its legend entry stays", async () => {
    const shown = await mount(grouped());
    expect(ticks(shown)).toContain("80 s");
    unmount?.();
    const host = await mount(grouped({ hidden: true }));
    expect(ticks(host)).not.toContain("80 s");
    expect([...host.querySelectorAll(".uc-legend-item")].map((i) => i.textContent)).toEqual(["Before", "After", "Median trend"]);
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host)).not.toContain("After");
  });

  it("carries a bar's hatched swatch in the legend under encoding by marks", async () => {
    const host = await mount(grouped({ encoding: "marks" }));
    const after = [...host.querySelectorAll(".uc-legend-item")].find((i) => i.textContent === "After");
    expect(after?.querySelector("rect + path")?.getAttribute("d") ?? "").not.toBe("");
  });
});

/* B11: the active point's marker sits on the median of its own box - in a
   group that is beside the x value, not on it. */
describe("The hover marker of grouped boxes", () => {
  it("sits on each box's centre, the crosshair on the x value", async () => {
    const scene = new ChartScene();
    const host = document.createElement("div");
    document.body.appendChild(host);
    scene.setData(data.filter((d) => d.med !== null));
    scene.registerAxis({ id: "x", orientation: "x", position: "bottom", accessor: (d) => (d as Machine).at, domain: "data" });
    scene.registerAxis({ id: "y", orientation: "y", position: "left", accessor: (d) => (d as Machine).hi, domain: "data" });
    const box = (name: string): BoxSeriesConfig => ({
      kind: "box",
      name,
      accessor: (d) => (d as Machine).med,
      lowerQuartile: (d) => (d as Machine).q1,
      upperQuartile: (d) => (d as Machine).q3,
      lowerWhisker: (d) => (d as Machine).lo,
      upperWhisker: (d) => (d as Machine).hi,
      boxWidth: 0.8,
      xAxisId: "x",
      yAxisId: "y",
    });
    scene.registerSeries(box("Before"));
    scene.registerSeries(box("After"));
    scene.registerTooltip({ mode: "x" });
    scene.bind(host, document.createElement("canvas"), document.createElement("canvas"), host);
    scene.requestResize(400, 300);
    await frame();
    const layout = scene.getLayoutSnapshot().layout;
    const xScale = layout.axes.find((a) => a.key === "x:x")?.scale;
    const at = xScale?.toPx(1) ?? 0;
    scene.pointerMove(at, layout.plot.y + layout.plot.height / 2);
    const hover = scene.getHoverSnapshot().hover;
    // Step 1, the group 0.8 wide: each box 0.4 wide, centred 0.2 either side.
    const quarter = (xScale?.m ?? 0) * 0.2;
    expect(hover?.hit.xPx).toBeCloseTo(at);
    expect(hover?.marker.map((m) => m.x)).toEqual([expect.closeTo(at - quarter), expect.closeTo(at + quarter)]);
    scene.unbind();
    host.remove();
  });
});

/* box-plot 03: outliers belong to their box (ADR-0040) - read in its tooltip
   and table row as a count and their values, cut after five. */
describe("A box's outliers", () => {
  interface WithOutliers {
    at: number;
    med: number | null;
    out: number[];
  }
  const rowsWith: WithOutliers[] = [
    { at: 0, med: 5, out: [11, 12, 13, 14, 15, 16, 17, 1] },
    { at: 1, med: 6, out: [] },
    { at: 2, med: null, out: [500] },
  ];
  function chartWith(extra: { outliers?: boolean; wording?: ChartsWording; hidden?: boolean } = {}): ReactNode {
    return (
      <Chart data={rowsWith} ariaLabel="Outliers" wording={extra.wording}>
        <XAxis accessor={(d: WithOutliers) => d.at} ticks={[0, 1, 2]} tickFormat={(v) => MACHINES[v] ?? ""} />
        <YAxis accessor={(d: WithOutliers) => d.med ?? 0} tickFormat={(v) => `${v} s`} />
        <BoxPlot
          name="Cycle time"
          hidden={extra.hidden}
          median={(d: WithOutliers) => d.med}
          lowerQuartile={() => 4}
          upperQuartile={() => 7}
          lowerWhisker={() => 3}
          upperWhisker={() => 9}
          outliers={extra.outliers === false ? undefined : (d: WithOutliers) => d.out}
        />
        <Line accessor={() => 2} name="Floor" />
        <Tooltip />
        <DataTable />
      </Chart>
    );
  }

  it("lists them in the tooltip as a count and their values, top to bottom, cut after five", async () => {
    const host = await mount(chartWith());
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host)).toContain("Outliers8: 17 s, 16 s, 15 s, 14 s, 13 s and 3 more");
  });

  it("cuts them in German as well", async () => {
    const host = await mount(chartWith({ wording: GERMAN_CHARTS_WORDING }));
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host)).toContain("Ausreißer8: 17 s, 16 s, 15 s, 14 s, 13 s und 3 weitere");
  });

  it("leaves the row out where a box has none", async () => {
    const host = await mount(chartWith());
    await focusPlot(host);
    await press(host, "Home");
    await press(host, "ArrowRight");
    expect(head(host)).toBe("Dryer");
    expect(rows(host).some((r) => r?.startsWith("Outliers"))).toBe(false);
  });

  it("gives the table a column only where they are given", async () => {
    const withThem = await mount(chartWith());
    await act(async () => (withThem.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    const table = tableOf(withThem);
    expect(table[0]).toContain("Cycle time – Outliers");
    expect(table[1]).toContain("8: 17 s, 16 s, 15 s, 14 s, 13 s and 3 more");
    unmount?.();
    const without = await mount(chartWith({ outliers: false }));
    await act(async () => (without.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    expect(tableOf(without)[0]).not.toContain("Outliers");
  });

  it("pull the y axis, and leave it with their hidden box", async () => {
    const shown = await mount(chartWith());
    expect(ticks(shown)).toContain("15 s");
    expect(ticks(shown)).not.toContain("500 s");
    unmount?.();
    const hidden = await mount(chartWith({ hidden: true }));
    expect(ticks(hidden)).not.toContain("15 s");
  });
});
