// @vitest-environment jsdom

/* maxGap in the hit test: a reading reaches no further than maxGap into a gap. */

import { describe, expect, it } from "vitest";
import { ChartScene } from "../src/scene";
import { downsample } from "../src/downsample";
import type { AxisConfig, LineSeriesConfig } from "../src/types";

interface Row {
  t: number;
  a: number;
}

const xAxis: AxisConfig = { id: "x", orientation: "x", position: "bottom", accessor: (d) => (d as Row).t, domain: "data" };
const yAxis: AxisConfig = { id: "y", orientation: "y", position: "left", accessor: (d) => (d as Row).a, domain: [0, 100] };
const line: LineSeriesConfig = {
  kind: "line",
  accessor: (d) => (d as Row).a,
  xAxisId: "x",
  yAxisId: "y",
  strokeWidth: 1.5,
  markers: "auto",
  name: "A",
  maxGap: 10,
};

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

async function hover(t: number) {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const scene = new ChartScene();
  scene.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
  scene.registerAxis(xAxis);
  scene.registerAxis(yAxis);
  scene.registerSeries(line);
  scene.registerTooltip({ mode: "x" });
  scene.setData([
    { t: 0, a: 10 },
    { t: 5, a: 20 },
    { t: 100, a: 30 },
    { t: 105, a: 40 },
  ]);
  scene.requestResize(400, 300);
  await frame();
  const x = scene.getLayoutSnapshot().layout.axes.find((a) => a.orientation === "x")?.scale;
  if (x === undefined) throw new Error("x axis missing");
  scene.pointerMove(x.toPx(t), 150);
  const hit = scene.getHoverSnapshot().hover?.hit;
  scene.unbind();
  return hit;
}

describe("maxGap in the hit test", () => {
  it("finds the nearest reading within maxGap", async () => {
    expect((await hover(14))?.points[0]?.yValue).toBe(20);
  });

  it("finds nothing farther than maxGap from the nearest reading", async () => {
    expect(await hover(50)).toBeUndefined();
  });
});

describe("maxGap under downsampling", () => {
  it("leaves the step across a silence as long as it was", () => {
    const n = 4000;
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = i < 2000 ? i : i + 10_000;
    const y = new Float64Array(n).fill(1);
    const out = downsample({ x, y, y0: null, length: n }, 0, 14_000, 0.05, 0, 100);
    expect(out.length).toBeLessThan(n);
    let longest = 0;
    for (let i = 1; i < out.length; i++) longest = Math.max(longest, (out.x[i] as number) - (out.x[i - 1] as number));
    expect(longest).toBeGreaterThanOrEqual(10_000);
  });
});
