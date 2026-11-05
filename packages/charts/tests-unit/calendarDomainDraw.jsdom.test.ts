// @vitest-environment jsdom

/* A fixed domain on a calendar axis, through the scene into a recording
   canvas: the readings in that window are drawn inside the plot, with ticks. */

import { afterEach, beforeEach, expect, it } from "vitest";
import { drawSeriesLayer, type SeriesDrawItem } from "../src/draw";
import { ChartScene } from "../src/scene";
import { FALLBACK_THEME } from "../src/theme";
import type { AxisConfig, LineSeriesConfig } from "../src/types";

class RecordingPath {
  points: [number, number][] = [];
  moveTo(x: number, y: number): void {
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

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const MON = Date.UTC(2024, 0, 1);
interface Row {
  t: number;
  a: number;
}

it("draws the readings of Tue 06:00 to Wed 14:00 inside the plot, with ticks", async () => {
  const rows: Row[] = Array.from({ length: 5 * 24 }, (_, h) => ({ t: MON + h * HOUR, a: 10 + (h % 5) }));
  const x = {
    id: "x",
    orientation: "x",
    position: "bottom",
    accessor: (d: unknown) => (d as Row).t,
    time: true,
    calendar: [{ from: MON, to: MON + 5 * DAY }],
    domain: [MON + DAY + 6 * HOUR, MON + 2 * DAY + 14 * HOUR],
  } as unknown as AxisConfig;
  const y: AxisConfig = { id: "y", orientation: "y", position: "left", accessor: (d) => (d as Row).a, domain: "nice" };
  const line: LineSeriesConfig = { kind: "line", accessor: (d) => (d as Row).a, xAxisId: "x", yAxisId: "y", strokeWidth: 1.5, markers: "auto", name: "A" };

  const root = document.createElement("div");
  document.body.appendChild(root);
  const scene = new ChartScene();
  scene.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
  scene.registerAxis(x);
  scene.registerAxis(y);
  scene.registerSeries(line);
  scene.setData(rows);
  scene.requestResize(1000, 300);
  await new Promise<void>((r) => requestAnimationFrame(() => r()));
  const items = (scene as unknown as { drawItems(): SeriesDrawItem[] }).drawItems();
  const { layout } = scene.getLayoutSnapshot();
  const stroked: RecordingPath[] = [];
  const target: Record<string, unknown> = { stroke: (p?: RecordingPath) => p !== undefined && stroked.push(p) };
  const ctx = new Proxy(target, { get: (t, k) => (k in t ? t[k as string] : () => undefined) });
  drawSeriesLayer(ctx as unknown as CanvasRenderingContext2D, {
    width: 1000, height: 300, plot: layout.plot, axes: [], theme: FALLBACK_THEME, series: items, limitBands: [], limitLines: [],
  });
  const xs = stroked.flatMap((p) => p.points.map(([px]) => px));
  const xAxis = layout.axes.find((a) => a.key === "x:x");
  scene.unbind();

  const { x: left, width } = layout.plot;
  expect(xs.length).toBeGreaterThan(0);
  // Readings outside the window may run off the plot, but not by thousands of pixels.
  expect(Math.min(...xs)).toBeGreaterThan(left - 2 * width);
  expect(Math.max(...xs)).toBeLessThan(left + 3 * width);
  expect(xs.filter((px) => px >= left && px <= left + width).length).toBeGreaterThan(20);
  expect(xAxis?.ticks.length).toBeGreaterThan(0);
});
