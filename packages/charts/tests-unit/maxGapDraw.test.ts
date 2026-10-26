/* Node has no canvas: the context and Path2D record what is done to them. */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { drawSeriesLayer, type SeriesDrawItem } from "../src/draw";
import { LinearScale } from "../src/scale";
import { FALLBACK_THEME } from "../src/theme";

type Op = [name: string, ...args: number[]];

class RecordingPath {
  readonly ops: Op[] = [];
  moveTo(x: number, y: number): void {
    this.ops.push(["moveTo", x, y]);
  }
  lineTo(x: number, y: number): void {
    this.ops.push(["lineTo", x, y]);
  }
  arc(x: number, y: number): void {
    this.ops.push(["arc", x, y]);
  }
  rect(x: number, y: number, w: number, h: number): void {
    this.ops.push(["rect", x, y, w, h]);
  }
  closePath(): void {
    this.ops.push(["closePath"]);
  }
}

function recordingContext() {
  const filled: RecordingPath[] = [];
  const stroked: RecordingPath[] = [];
  /** Each stroke with the colour and width it was drawn in. */
  const strokes: { path: RecordingPath; style: unknown; width: unknown }[] = [];
  const target: Record<string, unknown> = {
    fill: (path?: RecordingPath) => {
      if (path !== undefined) filled.push(path);
    },
    stroke: (path?: RecordingPath) => {
      if (path === undefined) return;
      stroked.push(path);
      strokes.push({ path, style: target.strokeStyle, width: target.lineWidth });
    },
  };
  const ctx = new Proxy(
    target,
    {
      // Every other method is a no-op, every property takes what it is given.
      get: (target, key) => (key in target ? target[key as string] : () => undefined),
    },
  );
  return { ctx: ctx as unknown as CanvasRenderingContext2D, filled, stroked, strokes };
}

const original = (globalThis as { Path2D?: unknown }).Path2D;
beforeEach(() => {
  (globalThis as { Path2D?: unknown }).Path2D = RecordingPath;
});
afterEach(() => {
  (globalThis as { Path2D?: unknown }).Path2D = original;
});


const xScale = new LinearScale([0, 999], [0, 999]);
const yScale = new LinearScale([0, 100], [100, 0]);
const px = (v: number) => xScale.toPx(v);
const py = (v: number) => yScale.toPx(v);

function draw(item: SeriesDrawItem) {
  const recording = recordingContext();
  drawSeriesLayer(recording.ctx, {
    width: 1000,
    height: 100,
    plot: { x: 0, y: 0, width: 1000, height: 100 },
    axes: [],
    theme: FALLBACK_THEME,
    series: [item],
    limitBands: [],
    limitLines: [],
  });
  return recording;
}

const base = (x: number[], y: number[]) => ({
  x: Float64Array.from(x),
  y: Float64Array.from(y),
  length: x.length,
  xScale,
  yScale,
  color: "#000",
  alpha: 1,
  strokeWidth: 1.5,
});
const lineOf = (x: number[], y: number[], extra: object = {}): SeriesDrawItem => ({
  ...base(x, y),
  kind: "line",
  markers: "never",
  ...extra,
});
const areaOf = (x: number[], y: number[], extra: object = {}): SeriesDrawItem => ({
  ...base(x, y),
  kind: "area",
  y0: null,
  baseline: 0,
  fillOpacity: 0.18,
  ...extra,
});
const names = (path?: RecordingPath) => (path?.ops ?? []).map(([name]) => name);

describe("maxGap on a line", () => {
  const x = [0, 10, 20, 100, 110];
  const y = [10, 20, 30, 40, 50];

  it("breaks the stroke at a step longer than it", () => {
    const { stroked } = draw(lineOf(x, y, { maxGap: 50 }));
    expect(names(stroked[0])).toEqual(["moveTo", "lineTo", "lineTo", "moveTo", "lineTo"]);
  });

  it("keeps the stroke at a step of exactly maxGap", () => {
    const { stroked } = draw(lineOf(x, y, { maxGap: 80 }));
    expect(names(stroked[0])).toEqual(["moveTo", "lineTo", "lineTo", "lineTo", "lineTo"]);
  });

  it("is off without it", () => {
    const { stroked } = draw(lineOf(x, y));
    expect(names(stroked[0])).toEqual(["moveTo", "lineTo", "lineTo", "lineTo", "lineTo"]);
  });

  it("holds a step line for maxGap after its last reading, then ends", () => {
    const { stroked } = draw(lineOf(x, y, { maxGap: 50, step: true }));
    expect(stroked[0]?.ops).toEqual([
      ["moveTo", px(0), py(10)],
      ["lineTo", px(10), py(10)],
      ["lineTo", px(10), py(20)],
      ["lineTo", px(20), py(20)],
      ["lineTo", px(20), py(30)],
      ["lineTo", px(70), py(30)],
      ["moveTo", px(100), py(40)],
      ["lineTo", px(110), py(40)],
      ["lineTo", px(110), py(50)],
    ]);
  });

  it("ends a hold at a missing value's own x when that is sooner", () => {
    const { stroked } = draw(lineOf([0, 10, 20], [10, Number.NaN, 30], { maxGap: 50, step: true }));
    expect(stroked[0]?.ops).toEqual([
      ["moveTo", px(0), py(10)],
      ["lineTo", px(10), py(10)],
      ["moveTo", px(20), py(30)],
    ]);
  });

  it("keeps the marker of a reading between two gaps under auto", () => {
    const { filled } = draw(lineOf([0, 100, 200], [10, 20, 30], { maxGap: 50, markers: "auto" }));
    expect(filled.reduce((n, p) => n + p.ops.filter(([o]) => o === "arc").length, 0)).toBe(3);
  });
});

describe("maxGap on an area", () => {
  it("closes the section on both sides of a long step", () => {
    const { filled } = draw(areaOf([0, 10, 100, 110], [10, 20, 30, 40], { maxGap: 50 }));
    const closes = filled[0]?.ops.filter(([o]) => o === "closePath").length;
    expect(closes).toBe(2);
    expect(filled[0]?.ops).toContainEqual(["lineTo", px(10), py(0)]);
    expect(filled[0]?.ops).toContainEqual(["moveTo", px(100), py(30)]);
  });

  it("is one section while no step exceeds it", () => {
    const { filled } = draw(areaOf([0, 10, 100, 110], [10, 20, 30, 40], { maxGap: 90 }));
    expect(filled[0]?.ops.filter(([o]) => o === "closePath").length).toBe(1);
  });
});
