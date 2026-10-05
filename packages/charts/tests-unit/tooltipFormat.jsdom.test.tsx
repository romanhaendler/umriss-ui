// @vitest-environment jsdom

/* What the built-in tooltip writes (charts-review, bug 6): a value in the
   format of its y axis, and an x value per x axis. It formatted every value
   with a fixed default and headed every hit with the primary hit's x axis - a
   percent axis read "0.42" beside ticks reading "42 %", and a second course on
   an axis of its own was named at the first one's time. */

import { describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { ChartScene } from "../src/scene";
import { TooltipHtml } from "../src/TooltipHtml";
import type { AxisConfig, LineSeriesConfig, TooltipHit } from "../src/types";

interface Row {
  t: number;
  a: number;
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

function axis(part: Partial<AxisConfig> & Pick<AxisConfig, "id" | "orientation">): AxisConfig {
  return {
    position: part.orientation === "x" ? "bottom" : "left",
    accessor: (d) => (d as Row).t,
    domain: "data",
    ...part,
  };
}

function line(part: Partial<LineSeriesConfig>): LineSeriesConfig {
  return {
    kind: "line",
    accessor: (d) => (d as Row).a,
    xAxisId: "x",
    yAxisId: "y",
    strokeWidth: 1.5,
    markers: "auto",
    ...part,
  };
}

/** A bound scene with its tooltip rendered, the pointer at `x` of axis "x". */
async function tooltipAt(scene: ChartScene, x: number): Promise<string> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  scene.bind(host, document.createElement("canvas"), document.createElement("canvas"), host);
  scene.registerTooltip({ mode: "x" });
  scene.requestResize(400, 300);
  const root = createRoot(host);
  await act(async () => {
    root.render(<TooltipHtml scene={scene} />);
    await frame();
  });
  const layout = scene.getLayoutSnapshot().layout;
  const xAxis = layout.axes.find((a) => a.key === "x:x");
  await act(async () => {
    scene.pointerMove(xAxis?.scale.toPx(x) ?? 0, layout.plot.y + layout.plot.height / 2);
  });
  const text = host.querySelector(".uc-tooltip")?.textContent ?? "";
  act(() => root.unmount());
  scene.unbind();
  return text;
}

describe("The built-in tooltip", () => {
  it("formats a value with its y axis' tickFormat", async () => {
    const scene = new ChartScene();
    scene.setData([
      { t: 0, a: 10 },
      { t: 1, a: 42 },
      { t: 2, a: 30 },
    ]);
    scene.registerAxis(axis({ id: "x", orientation: "x" }));
    scene.registerAxis(
      axis({ id: "y", orientation: "y", accessor: (d) => (d as Row).a, tickFormat: (v) => `${v} %` }),
    );
    scene.registerSeries(line({ name: "Load" }));
    expect(await tooltipAt(scene, 1)).toContain("42 %");
  });

  it("names each point's x value with its own x axis", async () => {
    const scene = new ChartScene();
    scene.registerAxis(axis({ id: "x", orientation: "x", tickFormat: (v) => `A${v}` }));
    scene.registerAxis(axis({ id: "shift", orientation: "x", position: "top", tickFormat: (v) => `B${v}` }));
    scene.registerAxis(axis({ id: "y", orientation: "y", accessor: (d) => (d as Row).a }));
    scene.registerSeries(
      line({ name: "First", data: [{ t: 0, a: 1 }, { t: 5, a: 2 }, { t: 10, a: 3 }] }),
    );
    scene.registerSeries(
      line({
        name: "Second",
        xAxisId: "shift",
        data: [{ t: 100, a: 1 }, { t: 105, a: 2 }, { t: 110, a: 3 }],
      }),
    );
    const text = await tooltipAt(scene, 5);
    expect(text).toContain("A5");
    expect(text).toContain("B105");
    const points = scene.getHoverSnapshot().hover?.hit.points ?? [];
    expect(points.map((p) => p.xValue)).toEqual([5, 105]);
  });

  /* charts-essentials 02: a value format per series - "°C" without a render
     prop, and two series on one axis in two notations. */
  it("formats a value with its series' format before the axis' tickFormat", async () => {
    const scene = new ChartScene();
    scene.setData([
      { t: 0, a: 10 },
      { t: 1, a: 42 },
    ]);
    scene.registerAxis(axis({ id: "x", orientation: "x" }));
    scene.registerAxis(axis({ id: "y", orientation: "y", accessor: (d) => (d as Row).a, tickFormat: (v) => `${v} %` }));
    scene.registerSeries(line({ name: "Temperature", format: (v) => `${v.toFixed(1)} °C` }));
    scene.registerSeries(line({ name: "Load" }));
    const text = await tooltipAt(scene, 1);
    expect(text).toContain("42.0 °C");
    expect(text).toContain("42 %");
  });

  it("formats a series without an axis format by its own, and a matrix' value too", async () => {
    const scene = new ChartScene();
    scene.registerAxis(axis({ id: "x", orientation: "x" }));
    scene.registerAxis(axis({ id: "y", orientation: "y", accessor: (d) => (d as Row).a }));
    scene.registerSeries({
      kind: "matrix",
      accessor: () => 0,
      level: (d) => (d as Row).a,
      coloring: { kind: "gradient", stops: ["#000", "#fff"] },
      data: [{ t: 0, a: 0.5 }, { t: 1, a: 0.75 }],
      xAxisId: "x",
      yAxisId: "y",
      name: "Utilisation",
      format: (v) => `${v * 100} per cent`,
    });
    expect(await tooltipAt(scene, 1)).toContain("75 per cent");
  });
});

/* charts-bound-to-rows Q27: a matrix' colour channel is `level` everywhere, so
   the point a custom `render` reads carries it as `level`; `yValue` stays the
   cell's row, as it is the y position on every kind. */
describe("A custom tooltip's render", () => {
  it("receives a matrix cell's level as level and its row as yValue", async () => {
    const scene = new ChartScene();
    scene.registerAxis(axis({ id: "x", orientation: "x" }));
    scene.registerAxis(axis({ id: "y", orientation: "y", accessor: () => 2 }));
    scene.registerSeries({
      kind: "matrix",
      accessor: () => 2,
      level: (d) => (d as Row).a,
      coloring: { kind: "gradient", stops: ["#000", "#fff"] },
      data: [{ t: 0, a: 0.5 }, { t: 1, a: 0.75 }],
      xAxisId: "x",
      yAxisId: "y",
      name: "Utilisation",
    });
    const host = document.createElement("div");
    document.body.appendChild(host);
    scene.bind(host, document.createElement("canvas"), document.createElement("canvas"), host);
    let hit: TooltipHit | undefined;
    scene.registerTooltip({
      mode: "x",
      render: (h) => {
        hit = h;
        return null;
      },
    });
    scene.requestResize(400, 300);
    const root = createRoot(host);
    await act(async () => {
      root.render(<TooltipHtml scene={scene} />);
      await frame();
    });
    const layout = scene.getLayoutSnapshot().layout;
    const xAxis = layout.axes.find((a) => a.key === "x:x");
    await act(async () => {
      scene.pointerMove(xAxis?.scale.toPx(1) ?? 0, layout.plot.y + layout.plot.height / 2);
    });
    act(() => root.unmount());
    scene.unbind();
    expect(hit?.points[0]).toMatchObject({ level: 0.75, yValue: 2 });
    expect(hit?.points[0]).not.toHaveProperty("value");
  });
});
