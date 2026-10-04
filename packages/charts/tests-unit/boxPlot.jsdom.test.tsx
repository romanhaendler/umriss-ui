// @vitest-environment jsdom

/* box-plot 01: a box per x, read as it is drawn. What a person meets: the
   tooltip and the readout top to bottom (B9), the arrows walking box to box
   (B11), the data table's columns, the y axis reaching the whisker ends, and
   both wordings. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { DataTable, Legend, Tooltip, useChart, type ChartsWording } from "../src";
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

type Extra = { wording?: ChartsWording; format?: (v: number) => string; table?: boolean };

function CycleTime({ extra }: { extra: Extra }) {
  const { Chart, XAxis, YAxis, BoxPlot } = useChart(data);
  return (
    <Chart ariaLabel="Cycle time per machine" wording={extra.wording}>
      <XAxis value="at" ticks={[0, 1, 2, 3]} tickFormat={(v) => MACHINES[v] ?? ""} />
      <YAxis tickFormat={(v) => `${v} s`} />
      <BoxPlot
        name="Cycle time"
        median="med"
        lowerQuartile="q1"
        upperQuartile="q3"
        lowerWhisker="lo"
        upperWhisker="hi"
        format={extra.format}
      />
      <Tooltip />
      {extra.table === true && <DataTable />}
    </Chart>
  );
}

const chart = (extra: Extra = {}): ReactNode => <CycleTime extra={extra} />;

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
  type Extra = { hidden?: boolean; encoding?: "marks" };
  function Grouped({ extra }: { extra: Extra }) {
    const { Chart, XAxis, YAxis, BoxPlot, Line } = useChart(data);
    return (
      <Chart ariaLabel="Before and after" encoding={extra.encoding}>
        <XAxis value="at" ticks={[0, 1, 2, 3]} tickFormat={(v) => MACHINES[v] ?? ""} />
        <YAxis tickFormat={(v) => `${v} s`} />
        <BoxPlot name="Before" median="med" lowerQuartile="q1" upperQuartile="q3" lowerWhisker="lo" upperWhisker="hi" />
        <BoxPlot
          name="After"
          hidden={extra.hidden}
          median={(d) => (d.med === null ? null : d.med - 1)}
          lowerQuartile={(d) => d.q1 - 1}
          upperQuartile={(d) => d.q3 - 1}
          lowerWhisker={(d) => d.lo - 1}
          upperWhisker={(d) => d.hi + 60}
        />
        <Line value="med" name="Median trend" />
        <Legend />
        <Tooltip />
      </Chart>
    );
  }
  const grouped = (extra: Extra = {}): ReactNode => <Grouped extra={extra} />;

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

  it("under \"nearest\" hits the box the pointer is over, not the first at its x", async () => {
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
    scene.registerTooltip({ mode: "nearest" });
    scene.bind(host, document.createElement("canvas"), document.createElement("canvas"), host);
    scene.requestResize(400, 300);
    await frame();
    const layout = scene.getLayoutSnapshot().layout;
    const xScale = layout.axes.find((a) => a.key === "x:x")?.scale;
    const yScale = layout.axes.find((a) => a.key === "y:y")?.scale;
    scene.pointerMove((xScale?.toPx(1) ?? 0) + (xScale?.m ?? 0) * 0.2, yScale?.toPx(6) ?? 0);
    expect(scene.getHoverSnapshot().hover?.hit.points.map((p) => p.seriesName)).toEqual(["After"]);
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
  type Extra = { outliers?: boolean; wording?: ChartsWording; hidden?: boolean };
  function Outliers({ extra }: { extra: Extra }) {
    const { Chart, XAxis, YAxis, BoxPlot, Line } = useChart(rowsWith);
    return (
      <Chart ariaLabel="Outliers" wording={extra.wording}>
        <XAxis value="at" ticks={[0, 1, 2]} tickFormat={(v) => MACHINES[v] ?? ""} />
        <YAxis tickFormat={(v) => `${v} s`} />
        <BoxPlot
          name="Cycle time"
          hidden={extra.hidden}
          median="med"
          lowerQuartile={() => 4}
          upperQuartile={() => 7}
          lowerWhisker={() => 3}
          upperWhisker={() => 9}
          outliers={extra.outliers === false ? undefined : "out"}
        />
        <Line value={() => 2} name="Floor" />
        <Tooltip />
        <DataTable />
      </Chart>
    );
  }
  const chartWith = (extra: Extra = {}): ReactNode => <Outliers extra={extra} />;

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

/* box-plot 04: mean, notch and count read where given; a half-given notch
   and numbers out of order warn once in DEV and draw what is given. */
describe("A box's mean, notch and count", () => {
  interface Full {
    at: number;
    med: number;
    lo: number;
    hi: number;
  }
  const full: Full[] = [
    { at: 0, med: 5, lo: 3, hi: 9 },
    { at: 1, med: 6, lo: 4, hi: 10 },
  ];
  type Extra = { wording?: ChartsWording; given?: boolean; notchUpper?: boolean; name?: string };
  function MeanAndNotch({ extra }: { extra: Extra }) {
    const { Chart, XAxis, YAxis, BoxPlot } = useChart(full);
    const given = extra.given !== false;
    return (
      <Chart ariaLabel="Mean and notch" wording={extra.wording}>
        <XAxis value="at" ticks={[0, 1]} tickFormat={(v) => MACHINES[v] ?? ""} />
        <YAxis tickFormat={(v) => `${v} s`} />
        <BoxPlot
          name={extra.name ?? "Cycle time"}
          median="med"
          lowerQuartile={(d) => d.med - 1}
          upperQuartile={(d) => d.med + 1}
          lowerWhisker="lo"
          upperWhisker="hi"
          mean={given ? (d) => d.med + 0.5 : undefined}
          notchLower={given ? (d) => d.med - 0.25 : undefined}
          notchUpper={given && extra.notchUpper !== false ? (d) => d.med + 0.25 : undefined}
          count={given ? () => 120 : undefined}
        />
        <Tooltip />
        <DataTable />
      </Chart>
    );
  }
  const chartFull = (extra: Extra = {}): ReactNode => <MeanAndNotch extra={extra} />;

  it("reads mean, notch and n after the five, in the tooltip", async () => {
    const host = await mount(chartFull());
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host).slice(6)).toEqual(["Mean5.5 s", "Notch4.75 s – 5.25 s", "n120"]);
  });

  it("reads them in German", async () => {
    const host = await mount(chartFull({ wording: GERMAN_CHARTS_WORDING }));
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host).slice(6)).toEqual(["Mittelwert5.5 s", "Notch4.75 s – 5.25 s", "n120"]);
  });

  it("has neither rows nor columns where they are not given", async () => {
    const host = await mount(chartFull({ given: false }));
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host)).toHaveLength(6);
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    expect(tableOf(host)[0]).toBe(
      "Position|Cycle time – Upper whisker|Cycle time – Upper quartile|Cycle time – Median|Cycle time – Lower quartile|Cycle time – Lower whisker",
    );
  });

  it("gives the table a column for each where given", async () => {
    const host = await mount(chartFull());
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    const [head, first] = tableOf(host);
    expect(head?.split("|").slice(6)).toEqual(["Cycle time – Mean", "Cycle time – Notch", "Cycle time – n"]);
    expect(first?.split("|").slice(6)).toEqual(["5.5 s", "4.75 s – 5.25 s", "120"]);
  });

  it("warns once in DEV about a notch bound without the other", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await renderChart(chartFull({ notchUpper: false, name: "Half notch" }));
    await r.rerender(chartFull({ notchUpper: false, name: "Half notch" }));
    r.unmount();
    const notch = warn.mock.calls.filter(([m]) => String(m).includes("Half notch") && String(m).includes("notchUpper"));
    expect(notch).toHaveLength(1);
  });

  it("warns once in DEV about numbers out of order, and still draws", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    function OutOfOrder() {
      const { Chart, XAxis, YAxis, BoxPlot } = useChart(full);
      return (
        <Chart ariaLabel="Out of order">
          <XAxis value="at" />
          <YAxis />
          <BoxPlot
            name="Disordered"
            median="med"
            lowerQuartile={(d) => d.med + 1}
            upperQuartile={(d) => d.med - 1}
            lowerWhisker="lo"
            upperWhisker="hi"
          />
        </Chart>
      );
    }
    const r = await renderChart(<OutOfOrder />);
    unmount = r.unmount;
    const order = warn.mock.calls.filter(([m]) => String(m).includes("Disordered") && String(m).includes("order"));
    expect(order).toHaveLength(1);
    expect(r.host.querySelector(".uc-empty")).toBeNull();
  });
});
