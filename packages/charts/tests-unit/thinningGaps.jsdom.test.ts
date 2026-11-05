// @vitest-environment jsdom

/* Thinning and maxGap through the scene into a recording canvas: the readings
   are thinned and drawn together, so the gap that survives is the one drawn. */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { drawSeriesLayer, type SeriesDrawItem } from "../src/draw";
import { ChartScene } from "../src/scene";
import { FALLBACK_THEME } from "../src/theme";
import type { AreaSeriesConfig, AxisConfig, LineSeriesConfig } from "../src/types";

class RecordingPath {
  moves = 0;
  points: [number, number][] = [];
  moveTo(x: number, y: number): void {
    this.moves++;
    this.points.push([x, y]);
  }
  lineTo(x: number, y: number): void {
    this.points.push([x, y]);
  }
  arc(): void {}
  rect(): void {}
  closePath(): void {}
}

const original = (globalThis as { Path2D?: unknown }).Path2D;
beforeEach(() => {
  (globalThis as { Path2D?: unknown }).Path2D = RecordingPath;
});
afterEach(() => {
  (globalThis as { Path2D?: unknown }).Path2D = original;
});

interface Row {
  t: number;
  a: number;
  b?: number;
}

const xAxis: AxisConfig = { id: "x", orientation: "x", position: "bottom", accessor: (d) => (d as Row).t, domain: "data" };
const yAxis: AxisConfig = { id: "y", orientation: "y", position: "left", accessor: (d) => (d as Row).a, domain: [-60, 100] };
const line: LineSeriesConfig = {
  kind: "line",
  accessor: (d) => (d as Row).a,
  xAxisId: "x",
  yAxisId: "y",
  strokeWidth: 1.5,
  markers: "auto",
  name: "A",
  maxGap: 5,
};

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** The paths stroked or filled when the scene draws `rows` as `config`. */
async function drawn(rows: Row[], config: LineSeriesConfig | AreaSeriesConfig) {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const scene = new ChartScene();
  scene.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
  scene.registerAxis(xAxis);
  scene.registerAxis(yAxis);
  scene.registerSeries(config);
  scene.setData(rows);
  scene.requestResize(1000, 300);
  await frame();
  const items = (scene as unknown as { drawItems(): SeriesDrawItem[] }).drawItems();
  const { layout } = scene.getLayoutSnapshot();
  const stroked: RecordingPath[] = [];
  const filled: RecordingPath[] = [];
  const target: Record<string, unknown> = {
    stroke: (p?: RecordingPath) => p !== undefined && stroked.push(p),
    fill: (p?: RecordingPath) => p !== undefined && filled.push(p),
  };
  const ctx = new Proxy(target, { get: (t, k) => (k in t ? t[k as string] : () => undefined) });
  drawSeriesLayer(ctx as unknown as CanvasRenderingContext2D, {
    width: 1000,
    height: 300,
    plot: layout.plot,
    axes: [],
    theme: FALLBACK_THEME,
    series: items,
    limitBands: [],
    limitLines: [],
  });
  scene.unbind();
  return { stroked, filled };
}

const day = (hole: boolean): Row[] =>
  Array.from({ length: 86_400 }, (_, t) => ({ t: hole && t >= 40_000 ? t + 60 : t, a: 50 + (t % 7) }));

describe("thinning keeps real gaps", () => {
  it("draws 86,400 one-second readings with a 5 s maxGap without a pen-up", async () => {
    const { stroked } = await drawn(day(false), line);
    expect(stroked.map((p) => p.moves)).toEqual([1]);
  });

  it("draws one break at a 60 s hole", async () => {
    const { stroked } = await drawn(day(true), line);
    expect(stroked.map((p) => p.moves)).toEqual([2]);
  });

  it("keeps the dip of a band's lower edge", async () => {
    const area: AreaSeriesConfig = {
      kind: "area",
      accessor: (d: unknown) => (d as Row).a,
      baseline: (d: unknown) => (d as Row).b ?? 0,
      xAxisId: "x",
      yAxisId: "y",
      fillOpacity: 0.3,
      strokeWidth: 1,
      name: "B",
    } as unknown as AreaSeriesConfig;
    const rows = Array.from({ length: 20_000 }, (_, t) => ({ t, a: 50, b: t === 10_001 ? -50 : 0 }));
    const { filled } = await drawn(rows, area);
    const ys = filled.flatMap((p) => p.points.map(([, y]) => y));
    // -50 lies below every zero on the screen: the largest y.
    const zero = Math.min(...ys.filter((y) => y > Math.min(...ys)));
    expect(Math.max(...ys)).toBeGreaterThan(zero + 20);
  });
});
