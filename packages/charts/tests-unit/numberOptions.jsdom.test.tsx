// @vitest-environment jsdom

/* A series' `format` and an axis' `tickFormat` take Intl's options besides a
   function (ADR-0069), written in the wording's locale. */

import { describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { ChartScene } from "../src/scene";
import { TooltipHtml } from "../src/TooltipHtml";
import { tickFn, formatTick } from "../src/format";
import { DEFAULT_CHARTS_WORDING } from "../src/wording";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import type { AxisConfig, LineSeriesConfig } from "../src/types";

interface Row {
  t: number;
  a: number;
}

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const money = { style: "currency", currency: "EUR" } as const;

function axis(part: Partial<AxisConfig> & Pick<AxisConfig, "id" | "orientation">): AxisConfig {
  return {
    position: part.orientation === "x" ? "bottom" : "left",
    accessor: (d) => (d as Row).t,
    domain: "data",
    ...part,
  };
}

function line(part: Partial<LineSeriesConfig>): LineSeriesConfig {
  return { kind: "line", accessor: (d) => (d as Row).a, xAxisId: "x", yAxisId: "y", strokeWidth: 1.5, markers: "auto", ...part };
}

async function tooltip(german: boolean, series: Partial<LineSeriesConfig>, yAxis: Partial<AxisConfig>): Promise<string> {
  const scene = new ChartScene();
  scene.setWording(german ? GERMAN_CHARTS_WORDING : DEFAULT_CHARTS_WORDING);
  scene.setData([{ t: 0, a: 1 }, { t: 1, a: 1234.5 }, { t: 2, a: 30 }]);
  scene.registerAxis(axis({ id: "x", orientation: "x" }));
  scene.registerAxis(axis({ id: "y", orientation: "y", accessor: (d) => (d as Row).a, ...yAxis }));
  scene.registerSeries(line({ name: "Revenue", ...series }));
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
  const x = layout.axes.find((a) => a.key === "x:x");
  await act(async () => {
    scene.pointerMove(x?.scale.toPx(1) ?? 0, layout.plot.y + layout.plot.height / 2);
  });
  const text = host.querySelector(".uc-tooltip")?.textContent ?? "";
  act(() => root.unmount());
  scene.unbind();
  return text;
}

describe("An options format", () => {
  it("is written by the tooltip in the wording's locale", async () => {
    expect(await tooltip(false, { format: money }, {})).toContain("€1,234.50");
    expect(await tooltip(true, { format: money }, {})).toContain("1.234,50 €");
  });

  it("is taken from the y axis' tickFormat where the series has none", async () => {
    expect(await tooltip(false, {}, { tickFormat: money })).toContain("€1,234.50");
    expect(await tooltip(true, {}, { tickFormat: money })).toContain("1.234,50 €");
  });

  it("takes decimals as both fraction limits, and an Intl digit option beside it wins", () => {
    expect(tickFn({ decimals: 2 }, "en", 1)(3)).toBe("3.00");
    expect(tickFn({ decimals: 2, maximumFractionDigits: 3 }, "en", 1)(3.1234)).toBe("3.123");
  });

  it("keeps the step's places on a tick, and gives way to its own digits", () => {
    const at500 = tickFn(money, "en", 500);
    expect([0, 500, 1000].map(at500)).toEqual(["€0", "€500", "€1,000"]);
    expect(tickFn(money, "en", 500)(500)).not.toContain(".00");
    expect(tickFn({ ...money, maximumFractionDigits: 1 }, "en", 500)(1000)).toBe("€1,000.0");
    expect(tickFn({ maximumFractionDigits: 1 }, "en", 500)(0.25)).toBe("0.3");
    expect(tickFn({ useGrouping: true }, "en", 0.1)(0.5)).toBe("0.5");
  });

  it("writes no negative zero", () => {
    expect(formatTick(-0.0004, 0.1, "en")).toBe("0.0");
    expect(tickFn({ decimals: 1 }, "en", 1)(-0.0004)).toBe("0.0");
    expect(tickFn({ decimals: 1, signDisplay: "auto" }, "en", 1)(-0.0004)).toBe("-0.0");
  });

  it("registers by value: an equal inline object stays, a changed one relabels", () => {
    const scene = new ChartScene();
    scene.registerAxis(axis({ id: "x", orientation: "x" }));
    const id = scene.registerAxis(axis({ id: "y", orientation: "y", accessor: (d) => (d as Row).a, tickFormat: { style: "currency", currency: "EUR" } }));
    scene.layoutDirty = false;
    scene.updateAxis(id, axis({ id: "y", orientation: "y", accessor: (d) => (d as Row).a, tickFormat: { style: "currency", currency: "EUR" } }));
    expect(scene.layoutDirty).toBe(false);
    scene.updateAxis(id, axis({ id: "y", orientation: "y", accessor: (d) => (d as Row).a, tickFormat: { style: "currency", currency: "USD" } }));
    expect(scene.layoutDirty).toBe(true);
  });

  it("registers a series' options by value too", () => {
    const scene = new ChartScene();
    const id = scene.registerSeries(line({ format: { decimals: 1 } }));
    scene.layoutDirty = false;
    scene.updateSeries(id, line({ format: { decimals: 1 } }));
    expect(scene.layoutDirty).toBe(false);
    scene.updateSeries(id, line({ format: { decimals: 2 } }));
    expect(scene.layoutDirty).toBe(true);
  });
});
