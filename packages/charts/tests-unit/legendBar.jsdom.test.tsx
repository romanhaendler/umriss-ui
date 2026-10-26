// @vitest-environment jsdom

/* A gradient-coloured matrix' legend entry is a colour bar: its steps, the range's ends written under them in the
   matrix' format, the range in the entry's name. An assessment keeps its chip. The picture paints the values. */

import { act, useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Legend, useChart, type ChartParts, type ChartsWording, type MatrixColoring } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import { renderChart, sizePlot } from "./renderChart";

const rows = [
  { hour: 0, who: "a", r: -1 },
  { hour: 1, who: "a", r: 0.5 },
  { hour: 0, who: "b", r: 0.25 },
  { hour: 1, who: "b", r: 1 },
];

const NINE = ["#001", "#002", "#003", "#004", "#005", "#006", "#007", "#008", "#009"];

let parts: ChartParts<(typeof rows)[number]> | null = null;
function Probe({ coloring, wording }: { coloring?: MatrixColoring; wording?: ChartsWording }) {
  const hook = useChart(rows);
  useEffect(() => {
    parts = hook;
  });
  const { Chart, XAxis, YAxis, Matrix } = hook;
  return (
    <Chart aria-label="Correlations" height={200} wording={wording}>
      <XAxis value="hour" />
      <YAxis />
      <Matrix value="who" level="r" name="Correlation" coloring={coloring} format={{ decimals: 1 }} />
      <Legend />
    </Chart>
  );
}

const gradient: MatrixColoring = { kind: "gradient", stops: NINE, range: [-1, 1] };

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

async function render(props: Parameters<typeof Probe>[0]): Promise<HTMLElement> {
  const r = await renderChart(<Probe {...props} />);
  unmount = r.unmount;
  return r.host;
}

describe("A matrix' colour bar", () => {
  it("shows one box per step and the range's ends in the matrix' format", async () => {
    const host = await render({ coloring: gradient });
    expect(host.querySelectorAll(".uc-legend-step")).toHaveLength(9);
    const values = Array.from(host.querySelectorAll(".uc-legend-edge")).map((e) => e.textContent);
    expect(values[0]).toBe("-1.0");
    expect(values[values.length - 1]).toBe("1.0");
    expect(host.querySelector(".uc-legend-bar")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("takes the data's range where the gradient names none", async () => {
    const host = await render({ coloring: { kind: "gradient", stops: NINE.slice(0, 3) } });
    const values = Array.from(host.querySelectorAll(".uc-legend-edge")).map((e) => e.textContent);
    expect(values[0]).toBe("-1.0");
    expect(values[values.length - 1]).toBe("1.0");
  });

  it("ends the entry's accessible name with the range, in English and in German", async () => {
    const host = await render({ coloring: gradient });
    expect(host.querySelector(".uc-legend-item")?.textContent).toMatch(/Correlation from -1\.0 to 1\.0/);
    unmount?.();
    const german = await render({ coloring: gradient, wording: GERMAN_CHARTS_WORDING });
    expect(german.querySelector(".uc-legend-item")?.textContent).toMatch(/von -1,0 bis 1,0/);
  });

  it("is not drawn for an assessment, which keeps its chip", async () => {
    const host = await render({ coloring: { kind: "assessment", limits: {} } });
    expect(host.querySelector(".uc-legend-bar")).toBeNull();
    expect(host.querySelector(".uc-legend-chip")).not.toBeNull();
  });

  it("is painted into the picture, its values among the texts", async () => {
    const texts: string[] = [];
    const box = { x: 0, y: 0, top: 0, left: 0, right: 400, bottom: 300, width: 400, height: 300, toJSON: () => ({}) };
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
    await render({ coloring: gradient });
    await act(async () => {
      await parts!.toPng();
    });
    expect(texts).toContain("-1.0");
    expect(texts).toContain("1.0");
  });
});
