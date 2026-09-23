// @vitest-environment jsdom

/* What the scene does across frames once it is bound: the size it lands on
   after a resize there and back, and a hover that follows new data under a
   resting pointer. jsdom measures every text as zero and has no 2D context -
   neither matters to the layout or the hit test. */

import { describe, expect, it } from "vitest";
import { ChartScene } from "../src/scene";
import type { AxisConfig, LineSeriesConfig } from "../src/types";

interface Row {
  t: number;
  a: number;
}

const xAxis: AxisConfig = {
  id: "x",
  orientation: "x",
  position: "bottom",
  accessor: (d) => (d as Row).t,
  domain: "data",
};

const yAxis: AxisConfig = {
  id: "y",
  orientation: "y",
  position: "left",
  accessor: (d) => (d as Row).a,
  domain: [0, 100],
};

const line: LineSeriesConfig = {
  kind: "line",
  accessor: (d) => (d as Row).a,
  xAxisId: "x",
  yAxisId: "y",
  strokeWidth: 1.5,
  markers: "auto",
  name: "A",
};

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

function bound(): ChartScene {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const scene = new ChartScene();
  scene.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
  scene.registerAxis(xAxis);
  scene.registerAxis(yAxis);
  scene.registerSeries(line);
  scene.requestResize(400, 300);
  return scene;
}

describe("ChartScene across frames", () => {
  it("lands on the last size of a resize there and back within one frame", async () => {
    const scene = bound();
    await frame();
    scene.requestResize(500, 300);
    scene.requestResize(400, 300);
    await frame();
    expect(scene.getLayoutSnapshot().layout.width).toBe(400);
    scene.unbind();
  });

  it("asks the hit again when the data change under a resting pointer", async () => {
    const scene = bound();
    scene.registerTooltip({ mode: "x" });
    scene.setData([
      { t: 0, a: 10 },
      { t: 1, a: 20 },
      { t: 2, a: 30 },
    ]);
    await frame();
    const plot = scene.getLayoutSnapshot().layout.plot;
    scene.pointerMove(plot.x + plot.width / 2, plot.y + plot.height / 2);
    expect(scene.getHoverSnapshot().hover?.hit.points[0]?.yValue).toBe(20);

    scene.setData([
      { t: 0, a: 10 },
      { t: 1, a: 70 },
      { t: 2, a: 30 },
    ]);
    await frame();
    const hover = scene.getHoverSnapshot().hover;
    expect(hover?.hit.points[0]?.yValue).toBe(70);
    expect(hover?.marker[0]?.y).toBeCloseTo(plot.y + plot.height * 0.3);
    scene.unbind();
  });

  /* charts-review, bug 3: the chip beside a cell's value showed a palette
     colour the matrix never draws, instead of the cell's own. */
  it("gives a matrix cell's tooltip chip the cell's colour", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const scene = new ChartScene();
    scene.bind(root, document.createElement("canvas"), document.createElement("canvas"), root);
    scene.registerAxis(xAxis);
    scene.registerAxis({ ...yAxis, domain: "data" });
    scene.registerSeries({
      kind: "matrix",
      name: "OEE",
      accessor: (d) => (d as Row).a,
      value: (d) => (d as Row).t + 2 * (d as Row).a,
      coloring: { kind: "gradient", stops: ["#000001", "#000002", "#000003", "#000004"] },
      xAxisId: "x",
      yAxisId: "y",
    });
    scene.registerTooltip({ mode: "x" });
    scene.setData([
      { t: 0, a: 0 },
      { t: 1, a: 0 },
      { t: 0, a: 1 },
      { t: 1, a: 1 },
    ]);
    scene.requestResize(400, 300);
    await frame();
    const axes = scene.getLayoutSnapshot().layout.axes;
    const x = axes.find((a) => a.orientation === "x");
    const y = axes.find((a) => a.orientation === "y");
    // The cell at (1, 1) carries the value 3, the top of the range: the last stop.
    scene.pointerMove(x?.scale.toPx(1) ?? 0, y?.scale.toPx(1) ?? 0);
    const point = scene.getHoverSnapshot().hover?.hit.points[0];
    expect(point?.value).toBe(3);
    expect(point?.color).toBe("#000004");
    scene.unbind();
  });
});
