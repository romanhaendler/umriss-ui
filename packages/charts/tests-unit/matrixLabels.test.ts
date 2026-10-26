/* The labels a matrix writes in its cells, against a recording context: the
   text drawn, where it is left out, and the halo stroked before the fill. */

import { describe, expect, it } from "vitest";
import { drawSeriesLayer, type MatrixDrawItem } from "../src/draw";
import { LinearScale } from "../src/scale";
import { FALLBACK_THEME } from "../src/theme";

type Call = { op: "strokeText" | "fillText"; text: string; style: unknown; width: unknown };

class PathStub {
  rect(): void {}
}

function recorder() {
  const calls: Call[] = [];
  const measured: string[] = [];
  const target: Record<string, unknown> = {
    measureText: (text: string) => {
      measured.push(text);
      return { width: text.length * 6 };
    },
    strokeText: (text: string) => calls.push({ op: "strokeText", text, style: target.strokeStyle, width: target.lineWidth }),
    fillText: (text: string) => calls.push({ op: "fillText", text, style: target.fillStyle, width: target.lineWidth }),
  };
  const ctx = new Proxy(target, { get: (t, k) => (k in t ? t[k as string] : () => undefined) });
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls, measured };
}

/** A 3 x 3 grid, cells `size` px square, the middle one a hole. */
function grid(size: number): MatrixDrawItem {
  const x = new Float64Array(9);
  const y = new Float64Array(9);
  const buckets = new Int32Array(9);
  for (let i = 0; i < 9; i++) {
    x[i] = i % 3;
    y[i] = Math.floor(i / 3);
    buckets[i] = i === 4 ? -1 : 0;
  }
  return {
    kind: "matrix",
    x,
    y,
    length: 9,
    xScale: new LinearScale([-0.5, 2.5], [0, size * 3]),
    yScale: new LinearScale([-0.5, 2.5], [size * 3, 0]),
    color: "#000",
    alpha: 1,
    buckets,
    colors: ["#6366f1"],
    width: 1,
    height: 1,
    labels: { texts: ["a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3"], font: "11.5px sans-serif", lineHeight: 14 },
  };
}

function draw(item: MatrixDrawItem, size: number) {
  const r = recorder();
  const plot = { x: 0, y: 0, width: size * 3, height: size * 3 };
  const theme = { ...FALLBACK_THEME, colorText: "#111", colorBg: "#eee" };
  const original = (globalThis as { Path2D?: unknown }).Path2D;
  (globalThis as { Path2D?: unknown }).Path2D = PathStub;
  try {
    drawSeriesLayer(r.ctx, { width: size * 3, height: size * 3, plot, axes: [], theme, series: [item], limitBands: [], limitLines: [] });
  } finally {
    (globalThis as { Path2D?: unknown }).Path2D = original;
  }
  return r;
}

describe("matrix cell labels", () => {
  it("writes eight texts for a grid with a hole, none for the hole", () => {
    const { calls } = draw(grid(40), 40);
    const fills = calls.filter((c) => c.op === "fillText").map((c) => c.text);
    expect(fills).toEqual(["a1", "a2", "a3", "b1", "b3", "c1", "c2", "c3"]);
  });

  it("strokes each text in the ground colour before filling it in the text colour", () => {
    const { calls } = draw(grid(40), 40);
    expect(calls.slice(0, 2)).toMatchObject([
      { op: "strokeText", text: "a1", style: "#eee", width: 3 },
      { op: "fillText", text: "a1", style: "#111" },
    ]);
  });

  it("leaves a cell without text where the text and its margin do not fit", () => {
    // 12 px of text needs 16; the cells are 15.
    expect(draw(grid(15), 15).calls).toEqual([]);
  });

  it("measures nothing where the cells are lower than one line", () => {
    const { calls, measured } = draw(grid(10), 10);
    expect(calls).toEqual([]);
    expect(measured).toEqual([]);
  });

  it("draws no text without labels", () => {
    const item = grid(40);
    delete item.labels;
    expect(draw(item, 40).calls).toEqual([]);
  });
});
