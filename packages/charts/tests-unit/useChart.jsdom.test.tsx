// @vitest-environment jsdom

/* charts-bound-to-rows 02 (ADR-0048): the chart bound to its rows by the
   hook. What a person observes: the parts keep their identity over renders,
   the chart reads the rows of the latest render, and a `value` switched from
   one field to another redraws the series - every field reader reads the same
   source text, so a comparison by text would miss it. */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip, useChart, type ChartParts, type ChartView } from "../src";
import { focusPlot, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

interface Row {
  t: number;
  a: number;
  b: number;
}

const ROWS: Row[] = [
  { t: 0, a: 41, b: 912 },
  { t: 1, a: 42, b: 913 },
];

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

const seen: ChartParts<Row>[] = [];

function Course({ rows, field }: { rows: Row[]; field: "a" | "b" }) {
  const parts = useChart(rows);
  seen.push(parts);
  const { Chart, XAxis, YAxis, Line } = parts;
  return (
    <Chart aria-label="One course">
      <XAxis value="t" tickFormat={(v) => `t${v}`} />
      <YAxis />
      <Line value={field} name="V" />
      <Tooltip />
    </Chart>
  );
}

describe("useChart", () => {
  it("hands back parts that keep their identity over renders", async () => {
    seen.length = 0;
    const r = await renderChart(<Course rows={ROWS} field="a" />);
    unmount = r.unmount;
    await r.rerender(<Course rows={[...ROWS]} field="b" />);
    const [first, last] = [seen[0], seen[seen.length - 1]];
    expect(seen.length).toBeGreaterThan(1);
    expect(last).toBe(first);
    expect(last?.Chart).toBe(first?.Chart);
  });

  it("draws the rows of the latest render", async () => {
    const r = await renderChart(<Course rows={ROWS} field="a" />);
    unmount = r.unmount;
    await focusPlot(r.host);
    expect(tooltipOf(r.host)).toContain("42");
    await r.rerender(<Course rows={[...ROWS, { t: 2, a: 77, b: 914 }]} field="a" />);
    await press(r.host, "End");
    expect(tooltipOf(r.host)).toContain("77");
  });

  it("redraws a series whose value switches from one field to another", async () => {
    const r = await renderChart(<Course rows={ROWS} field="a" />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "ArrowLeft");
    expect(tooltipOf(r.host)).toContain("41");
    await r.rerender(<Course rows={ROWS} field="b" />);
    await press(r.host, "End");
    await press(r.host, "ArrowLeft");
    expect(tooltipOf(r.host)).toContain("912");
    expect(tooltipOf(r.host)).not.toContain("41");
  });
});

describe("useChart view", () => {
  const hook = (initialView?: ChartView, onViewChange?: (v: ChartView) => void) =>
    renderHook((p: { initialView?: ChartView }) => useChart(ROWS, { initialView: p.initialView, onViewChange }), {
      initialProps: { initialView },
    });

  it("reads initialView once - a later one is ignored", () => {
    const { result, rerender } = hook({ hidden: ["A"] });
    rerender({ initialView: { hidden: ["B"] } });
    expect(result.current.hidden).toEqual(["A"]);
  });

  it("goes to a view with setView", () => {
    const { result } = hook();
    act(() => result.current.setView({ hidden: ["A"] }));
    expect(result.current.hidden).toEqual(["A"]);
    act(() => result.current.setView({}));
    expect(result.current.hidden).toEqual([]);
  });

  it("does not report setView through onViewChange, but reports what the reader does after it", () => {
    const seenViews: ChartView[] = [];
    const { result } = hook(undefined, (v) => seenViews.push(v));
    act(() => result.current.toggleSeries("A"));
    expect(seenViews).toEqual([{ hidden: ["A"] }]);
    act(() => result.current.setView({ hidden: ["B"] }));
    expect(seenViews).toHaveLength(1);
    act(() => result.current.toggleSeries("C"));
    expect(seenViews).toEqual([{ hidden: ["A"] }, { hidden: ["B", "C"] }]);
  });

  it("keeps two charts linked both ways in step; the other reports nothing", () => {
    const toA: ChartView[] = [];
    const toB: ChartView[] = [];
    type Hooked = ReturnType<typeof renderHook<ChartParts<Row>, unknown>>;
    const a: Hooked = renderHook(() => useChart(ROWS, { onViewChange: (v) => (toB.push(v), b.result.current.setView(v)) }));
    const b: Hooked = renderHook(() => useChart(ROWS, { onViewChange: (v) => (toA.push(v), a.result.current.setView(v)) }));
    act(() => a.result.current.toggleSeries("A"));
    expect(b.result.current.hidden).toEqual(["A"]);
    expect(toB).toHaveLength(1);
    expect(toA).toHaveLength(0);
    act(() => b.result.current.toggleSeries("B"));
    expect(a.result.current.hidden).toEqual(["A", "B"]);
    expect(toA).toHaveLength(1);
    expect(toB).toHaveLength(1);
  });
});
