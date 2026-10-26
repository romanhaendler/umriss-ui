/* A bar with a baseline floats from one value to another: the channel it
   fills, the extent it gives the axis, the rectangle it draws, and the stack
   that does not read it. */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { drawSeriesLayer, type SeriesDrawItem } from "../src/draw";
import { materializeSeries } from "../src/materialize";
import { LinearScale } from "../src/scale";
import { baselineOf } from "../src/sceneConfig";
import { FALLBACK_THEME } from "../src/theme";
import type { BarSeriesConfig } from "../src/types";

interface Row {
  t: number;
  to: number | null;
  from: number | null;
}

const rows: Row[] = [
  { t: 0, from: 0, to: 1200 },
  { t: 1, from: 1200, to: 1450 },
  { t: 2, from: 1450, to: 1300 },
];

const bar = (part: Partial<BarSeriesConfig> = {}): BarSeriesConfig => ({
  kind: "bar",
  accessor: (d) => (d as Row).to,
  xAxisId: "x",
  yAxisId: "y",
  barWidth: 0.8,
  ...part,
});

describe("A bar with a baseline, materialised", () => {
  const floating = bar({ baseline: (d) => (d as Row).from });

  it("fills the baseline channel and takes both edges into the extent, not zero", () => {
    const shifted = rows.slice(1);
    const { series, extent } = materializeSeries(
      shifted,
      (d) => d.t,
      (d) => d.to,
      baselineOf(floating) as (d: Row) => number | null,
    );
    expect([...(series.y0 as Float64Array)]).toEqual([1200, 1450]);
    expect(extent.yMin).toBe(1200);
    expect(extent.yMax).toBe(1450);
  });

  it("keeps the zero foot without a baseline, and in a stack", () => {
    expect(baselineOf(bar())).toBe(0);
    expect(baselineOf({ ...floating, stack: "s" })).toBe(0);
  });

  it("leaves a gap in either edge as NaN in its channel", () => {
    const gaps: Row[] = [{ t: 0, from: null, to: 5 }, { t: 1, from: 2, to: null }];
    const { series } = materializeSeries(gaps, (d) => d.t, (d) => d.to, (d) => d.from);
    expect((series.y0 as Float64Array)[0]).toBeNaN();
    expect(series.y[1]).toBeNaN();
  });
});

describe("A floating bar, drawn", () => {
  class RecordingPath {
    readonly ops: [string, ...number[]][] = [];
    rect(x: number, y: number, w: number, h: number): void {
      this.ops.push(["rect", x, y, w, h]);
    }
    moveTo(): void {}
    lineTo(): void {}
  }
  const original = (globalThis as { Path2D?: unknown }).Path2D;
  beforeEach(() => {
    (globalThis as { Path2D?: unknown }).Path2D = RecordingPath;
  });
  afterEach(() => {
    (globalThis as { Path2D?: unknown }).Path2D = original;
  });

  function rects(item: Partial<SeriesDrawItem>): number[][] {
    const filled: RecordingPath[] = [];
    const ctx = new Proxy({} as Record<string, unknown>, {
      get: (t, key) => (key === "fill" ? (p?: RecordingPath) => p !== undefined && filled.push(p) : key in t ? t[key as string] : () => undefined),
      set: (t, key, v) => ((t[key as string] = v), true),
    });
    drawSeriesLayer(ctx as unknown as CanvasRenderingContext2D, {
      width: 100,
      height: 100,
      plot: { x: 0, y: 0, width: 100, height: 100 },
      axes: [],
      theme: FALLBACK_THEME,
      series: [
        {
          kind: "bar",
          xScale: new LinearScale([0, 100], [0, 100]),
          yScale: new LinearScale([0, 100], [100, 0]),
          color: "#000",
          alpha: 1,
          baseline: 0,
          offset: 0,
          width: 10,
          ...item,
        } as SeriesDrawItem,
      ],
      limitBands: [],
      limitLines: [],
    });
    return filled.flatMap((p) => p.ops.map(([, ...args]) => args));
  }

  it("runs between its edges, a rise and a fall alike", () => {
    const out = rects({
      x: Float64Array.from([10, 30]),
      y: Float64Array.from([70, 20]),
      y0: Float64Array.from([40, 60]),
      length: 2,
    });
    // A rise 40 -> 70 (pixels 60 -> 30) and a fall 60 -> 20 (pixels 40 -> 80).
    expect(out).toEqual([
      [10, 30, 10, 30],
      [30, 80, 10, -40],
    ]);
  });

  it("leaves a bar out whose baseline is a gap", () => {
    const out = rects({
      x: Float64Array.from([10, 30]),
      y: Float64Array.from([70, 20]),
      y0: Float64Array.from([Number.NaN, 60]),
      length: 2,
    });
    expect(out).toHaveLength(1);
  });
});
