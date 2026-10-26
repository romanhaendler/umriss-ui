// @vitest-environment jsdom

/* A series that takes a palette place past the palette's last colour repeats the colour of an earlier series.
   In development the chart says so once per series: it names both series and asks for a `color` or a split.
   A series with its own colour or tone, and a state band, take no warning. Each test has its own names: a
   warning is once per name for the whole module. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { ChartScene } from "../src/scene";
import type { AxisConfig, LineSeriesConfig, StateSeriesConfig } from "../src/types";

interface Row {
  t: number;
  a: number;
}
const rows: Row[] = [
  { t: 0, a: 1 },
  { t: 1, a: 2 },
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

const line = (name: string, extra: Partial<LineSeriesConfig> = {}): LineSeriesConfig => ({
  kind: "line",
  accessor: (d) => (d as Row).a,
  name,
  xAxisId: "x",
  yAxisId: "y",
  strokeWidth: 1.5,
  markers: "auto",
  ...extra,
});

const band: StateSeriesConfig = {
  kind: "state",
  name: "Run band",
  accessor: () => 0,
  states: [{ label: "Run", color: "#000" }],
  xAxisId: "x",
  yAxisId: "y",
};

const repeats = (warn: { mock: { calls: unknown[][] } }, name: string) =>
  warn.mock.calls.filter(([text]) => String(text).includes(`"${name}"`));

afterEach(() => vi.restoreAllMocks());

describe("A series that repeats a palette colour", () => {
  it("warns once for the seventh line without a colour, naming it and the first", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.setData(rows);
    axes(scene);
    for (let i = 1; i <= 7; i++) scene.registerSeries(line(`Plain ${i}`));
    const found = repeats(warn, "Plain 7");
    expect(found).toHaveLength(1);
    const text = String(found[0]?.[0]);
    expect(text).toMatch(/"Plain 1"/);
    expect(text).toMatch(/`color`/);
  });

  it("stays silent when the seventh line has a colour or a tone", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.setData(rows);
    axes(scene);
    for (let i = 1; i <= 6; i++) scene.registerSeries(line(`Coloured ${i}`));
    scene.registerSeries(line("Coloured 7", { color: "#123456" }));
    scene.registerSeries(line("Toned 7", { tone: "alarm" }));
    expect(repeats(warn, "Coloured 7")).toHaveLength(0);
    expect(repeats(warn, "Toned 7")).toHaveLength(0);
  });

  it("stays silent for six lines and for a state band", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const scene = new ChartScene();
    scene.setData(rows);
    axes(scene);
    for (let i = 1; i <= 6; i++) scene.registerSeries(line(`Six ${i}`));
    scene.registerSeries(band);
    expect(repeats(warn, "Six 6")).toHaveLength(0);
    expect(repeats(warn, "Run band")).toHaveLength(0);
    expect(warn).not.toHaveBeenCalled();
  });
});
