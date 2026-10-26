// @vitest-environment jsdom

/* A series whose function reads a value from outside its row keeps its old course when that value changes:
   the scene holds functions by their source text. In development the chart says so once per series, and a
   `key` that changes with the value is the way out. Each test has its own series name: a warning is once
   per name for the whole module. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { ChartScene } from "../src/scene";
import { ControlChart, useChart } from "../src";
import type { AreaSeriesConfig, AxisConfig, BoxSeriesConfig, LineSeriesConfig } from "../src/types";
import { renderChart, sizePlot } from "./renderChart";

interface Row {
  t: number;
  a: number;
}
const rows: Row[] = [
  { t: 0, a: 1 },
  { t: 1, a: 2 },
  { t: 2, a: 3 },
];

const axes = (scene: ChartScene) => {
  const axis = (id: string, orientation: "x" | "y"): AxisConfig => ({
    id,
    orientation,
    position: orientation === "x" ? "bottom" : "left",
    accessor: (d) => (d as Row)[orientation === "x" ? "t" : "a"],
    domain: "nice",
  });
  scene.registerAxis(axis("x", "x"));
  scene.registerAxis(axis("y", "y"));
};

const line = (name: string, accessor: LineSeriesConfig["accessor"]): LineSeriesConfig => ({
  kind: "line",
  accessor,
  name,
  xAxisId: "x",
  yAxisId: "y",
  strokeWidth: 1.5,
  markers: "auto",
});

const scaled = (factor: number) => (d: unknown) => (d as Row).a * factor;
const stale = (warn: { mock: { calls: unknown[][] } }, name: string) =>
  warn.mock.calls.filter(([text]) => String(text).includes(`Series "${name}"`));

afterEach(() => vi.restoreAllMocks());

describe("A stale series", () => {
  it("warns once, names the series and both ways out", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.setData(rows);
    axes(scene);
    const id = scene.registerSeries(line("Duration", scaled(1)));
    scene.updateSeries(id, line("Duration", scaled(2)));
    scene.updateSeries(id, line("Duration", scaled(3)));
    const found = stale(warn, "Duration");
    expect(found).toHaveLength(1);
    expect(String(found[0]?.[0])).toMatch(/rows/);
    expect(String(found[0]?.[0])).toMatch(/`key`/);
  });

  it("warns for a baseline", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.setData(rows);
    axes(scene);
    const area = (factor: number): AreaSeriesConfig => ({
      kind: "area",
      accessor: (d) => (d as Row).a,
      baseline: scaled(factor),
      name: "Floor",
      xAxisId: "x",
      yAxisId: "y",
      fillOpacity: 0.2,
      strokeWidth: 1,
    });
    const id = scene.registerSeries(area(1));
    scene.updateSeries(id, area(2));
    expect(stale(warn, "Floor")).toHaveLength(1);
  });

  it("warns for a box channel", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.setData(rows);
    axes(scene);
    const box = (factor: number): BoxSeriesConfig =>
      ({
        kind: "box",
        accessor: (d: unknown) => (d as Row).a,
        lowerQuartile: scaled(factor),
        upperQuartile: (d: unknown) => (d as Row).a,
        lowerWhisker: (d: unknown) => (d as Row).a,
        upperWhisker: (d: unknown) => (d as Row).a,
        name: "Spread",
        xAxisId: "x",
        yAxisId: "y",
        boxWidth: 0.5,
      }) as unknown as BoxSeriesConfig;
    const id = scene.registerSeries(box(1));
    scene.updateSeries(id, box(2));
    expect(stale(warn, "Spread")).toHaveLength(1);
  });

  it("tells unnamed series apart by their place", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.setData(rows);
    axes(scene);
    const unnamed = (accessor: LineSeriesConfig["accessor"]): LineSeriesConfig => ({ ...line("", accessor), name: undefined });
    const a = scene.registerSeries(unnamed(scaled(1)));
    const b = scene.registerSeries(unnamed(scaled(1)));
    scene.updateSeries(a, unnamed(scaled(2)));
    scene.updateSeries(b, unnamed(scaled(2)));
    expect(warn.mock.calls.filter(([text]) => String(text).includes("A series without a name"))).toHaveLength(2);
  });

  it("stays silent for an unchanged closure, a native function and a field", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.setData(rows);
    axes(scene);
    const id = scene.registerSeries(line("Same", scaled(2)));
    scene.updateSeries(id, line("Same", scaled(2)));
    const native = scene.registerSeries(line("Native", Math.abs as LineSeriesConfig["accessor"]));
    scene.updateSeries(native, line("Native", Math.abs.bind(null) as LineSeriesConfig["accessor"]));
    expect(warn).not.toHaveBeenCalled();
  });

  it("calls an accessor at most 1,000 times per side", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const long = Array.from({ length: 5000 }, (_, t) => ({ t, a: t }));
    const scene = new ChartScene();
    scene.setData(long);
    axes(scene);
    const calls = { held: 0, next: 0 };
    const counting = (factor: number, side: "held" | "next") => (d: unknown) => {
      calls[side]++;
      return (d as Row).a * factor;
    };
    const id = scene.registerSeries(line("Long", counting(1, "held")));
    calls.held = 0;
    // Same text, the factor is the same: no difference, so every probed row is read.
    scene.updateSeries(id, line("Long", counting(1, "next")));
    expect(calls.held).toBeLessThanOrEqual(1000 + 1);
    expect(calls.next).toBeLessThanOrEqual(1000);
  });
});

describe("A stale control chart accessor", () => {
  it("warns once", async () => {
    sizePlot();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const Frame = ({ factor }: { factor: number }) => {
      const { Chart, XAxis, YAxis } = useChart(rows);
      return (
        <Chart aria-label="c" height={200}>
          <XAxis value="t" />
          <YAxis />
          <ControlChart
            name="Control"
            value={(d) => d.a * factor}
            data={rows}
            origin={{ kind: "given", center: 2, sigma: 1 }}
          />
        </Chart>
      );
    };
    const view = await renderChart(<Frame factor={1} />);
    await view.rerender(<Frame factor={2} />);
    expect(stale(warn, "Control")).toHaveLength(1);
    view.unmount();
  });
});

describe("A key as the way out", () => {
  it("draws the new course", async () => {
    sizePlot();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const Frame = ({ factor }: { factor: number }) => {
      const { Chart, XAxis, YAxis, Line } = useChart(rows);
      return (
        <Chart aria-label="k" height={200}>
          <XAxis value="t" />
          <YAxis />
          <Line key={factor} name="Keyed" value={(d) => d.a * factor} />
        </Chart>
      );
    };
    const view = await renderChart(<Frame factor={1} />);
    const before = view.host.querySelector(".uc-axis-y, [class*='axis']")?.textContent;
    await view.rerender(<Frame factor={100} />);
    const after = view.host.querySelector(".uc-axis-y, [class*='axis']")?.textContent;
    expect(after).not.toBe(before);
    view.unmount();
  });
});

