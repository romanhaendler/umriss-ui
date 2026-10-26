// @vitest-environment jsdom

/* The picture of plot and axes: what toPng() paints, against a recording 2D
   context. jsdom lays nothing out, so every element gets the chart's rectangle
   and every text node one line box. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useEffect } from "react";
import { Legend, LimitLine, Tooltip, useChart, type ChartParts } from "../src";
import { lineTexts } from "../src/picture";
import { focusPlot, renderChart, sizePlot } from "./renderChart";

const rows = [
  { t: 0, v: 1 },
  { t: 1, v: 3 },
  { t: 2, v: 2 },
];

let parts: ChartParts<(typeof rows)[number]> | null = null;
function Probe() {
  const hook = useChart(rows);
  useEffect(() => {
    parts = hook;
  });
  const { Chart, XAxis, YAxis, Line } = hook;
  return (
    <Chart aria-label="Picture">
      <XAxis value="t" />
      <YAxis label="Speed" />
      <Line value="v" name="Speed" />
      <Line value="v" name="Torque" />
      <LimitLine value={2.5} severity="alarm" label="Too fast" />
      <Legend />
      <Tooltip />
    </Chart>
  );
}

const texts: string[] = [];
let unmount: (() => void) | null = null;
const original = (globalThis as { Path2D?: unknown }).Path2D;

beforeEach(() => {
  texts.length = 0;
  sizePlot();
  const box = { x: 0, y: 0, top: 0, left: 0, right: 400, bottom: 300, width: 400, height: 300, toJSON: () => ({}) };
  // The measuring span stays empty, so that the layout has room.
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    return (this.classList.contains("uc-plot") || this.classList.contains("uc-root") ? box : { ...box, width: 0, height: 0 }) as DOMRect;
  });
  (Range.prototype as { getClientRects: unknown }).getClientRects = () => [box];
  const target: Record<string, unknown> = { fillText: (t: string) => texts.push(t) };
  const ctx = new Proxy(target, { get: (t, k) => (k in t ? t[k as string] : () => undefined), set: () => true });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((done) => done(new Blob(["png"], { type: "image/png" })));
  (globalThis as { Path2D?: unknown }).Path2D = class {
    moveTo() {}
    lineTo() {}
    arc() {}
    rect() {}
    closePath() {}
  };
});
afterEach(() => {
  unmount?.();
  unmount = null;
  parts = null;
  (globalThis as { Path2D?: unknown }).Path2D = original;
  vi.restoreAllMocks();
});

describe("toPng", () => {
  it("paints the tick labels and the axis title, not the tooltip or the summary", async () => {
    const view = await renderChart(<Probe />);
    unmount = view.unmount;
    await focusPlot(view.host);
    // What a screen reader hears, written the way the scene writes it.
    view.host.querySelector(".uc-sr:not([aria-live])")!.textContent = "Summary for a screen reader";
    expect(view.host.querySelector(".uc-tooltip")?.textContent ?? "").not.toBe("");
    let blob: Blob | undefined;
    await act(async () => {
      blob = await parts!.toPng();
    });
    expect(blob?.type).toBe("image/png");
    expect(texts).toContain("Speed");
    expect(texts).toContain("1.5");
    expect(texts).toContain("2.5");
    const tooltip = view.host.querySelector(".uc-tooltip")?.textContent ?? "";
    expect(texts.join("|")).not.toContain(tooltip);
    expect(texts).not.toContain("Summary for a screen reader");
  });

  it("paints the legend's names and a limit's label, not the data key", async () => {
    const view = await renderChart(<Probe />);
    unmount = view.unmount;
    await act(async () => {
      await parts!.toPng();
    });
    expect(texts).toContain("Torque");
    expect(texts).toContain("Too fast");
    expect(texts).not.toContain("Show data");
  });

  it("splits a soft-wrapped label by its line boxes", () => {
    const node = document.createTextNode("Mean time between faults");
    const line = (top: number) => ({ left: 0, right: 100, top, bottom: top + 10, width: 100, height: 10 }) as DOMRect;
    const boxes = [line(0), line(10)];
    // The first 17 characters ("Mean time between") fill the first box; the swallowed space has no rect.
    (Range.prototype as { getClientRects: unknown }).getClientRects = function (this: Range) {
      const i = this.startOffset;
      if (this.endOffset - i !== 1 || i === 17) return [];
      return [{ ...line(i < 17 ? 0 : 10), left: 10, width: 5, right: 15 }];
    };
    expect(lineTexts(node, boxes)).toEqual(["Mean time between", "faults"]);
    expect(lineTexts(node, [boxes[0] as DOMRect])).toEqual(["Mean time between faults"]);
  });

  it("rejects on a chart that is not mounted", async () => {
    const view = await renderChart(<Probe />);
    const held = parts!;
    view.unmount();
    await expect(held.toPng()).rejects.toThrow(Error);
  });
});
