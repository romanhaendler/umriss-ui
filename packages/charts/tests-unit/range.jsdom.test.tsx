// @vitest-environment jsdom

/* A chart reports a range and keeps none (ADR-0074). What a person observes:
   Alt with a drag on a zoomable chart, a plain drag where nothing zooms, once on
   release, `from` before `to`, a press under 4 px stays a click. */

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip, useChart, type ChartRange } from "../src";
import { frame, plotOf, renderChart, sizePlot, tooltipOf } from "./renderChart";

const ROWS = [
  { t: 0, a: 10, b: 1 },
  { t: 100, a: 20, b: 2 },
  { t: 200, a: 15, b: 3 },
];

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

interface Props {
  onRange?: (range: ChartRange) => void;
  onSelect?: () => void;
  zoomable?: boolean;
  two?: boolean;
}

function Course({ onRange, onSelect, zoomable = false, two = false }: Props) {
  const { Chart, XAxis, YAxis, Line } = useChart(ROWS, { onRange, onSelect });
  return (
    <Chart aria-label="One course">
      <XAxis value="t" zoomable={zoomable} />
      {two && <XAxis id="other" value="t" />}
      <YAxis />
      <Line value="a" name="A" />
      {two && <Line value="b" name="B" xAxisId="other" />}
      <Tooltip />
    </Chart>
  );
}

const pointer = (type: string, x: number, init: MouseEventInit = {}) => {
  const e = new MouseEvent(type, { bubbles: true, clientX: x, clientY: 150, buttons: type === "pointerup" ? 0 : 1, ...init });
  Object.defineProperty(e, "offsetX", { value: x });
  Object.defineProperty(e, "offsetY", { value: 150 });
  Object.defineProperty(e, "pointerId", { value: 1 });
  Object.defineProperty(e, "pointerType", { value: "mouse" });
  return e;
};

async function fire(host: HTMLElement, ...events: Event[]) {
  for (const e of events) await act(async () => void plotOf(host).dispatchEvent(e));
  await frame();
}

const alt = { altKey: true };
const drag = (from: number, to: number, init: MouseEventInit = {}) => [
  pointer("pointerdown", from, init),
  pointer("pointermove", (from + to) / 2, init),
  pointer("pointermove", to, init),
  pointer("pointerup", to, init),
];

async function mount(props: Props) {
  const r = await renderChart(<Course {...props} />);
  unmount = r.unmount;
  return r.host;
}

describe("onRange", () => {
  it("reports an Alt drag on a zoomable chart once, on release", async () => {
    const onRange = vi.fn();
    const host = await mount({ onRange, zoomable: true });
    const events = drag(150, 250, alt);
    await fire(host, ...events.slice(0, 3));
    expect(onRange).not.toHaveBeenCalled();
    await fire(host, ...events.slice(3));
    expect(onRange).toHaveBeenCalledTimes(1);
    const range = onRange.mock.calls[0]?.[0] as ChartRange;
    expect(range.to).toBeGreaterThan(range.from);
  });

  it("lets a plain drag on a zoomable chart pan and report nothing", async () => {
    const onRange = vi.fn();
    const host = await mount({ onRange, zoomable: true });
    await fire(host, ...drag(150, 250));
    expect(onRange).not.toHaveBeenCalled();
  });

  it("reports a plain drag where no x axis zooms, from before to for a drag to the left", async () => {
    const onRange = vi.fn();
    const host = await mount({ onRange });
    await fire(host, ...drag(250, 150));
    expect(onRange).toHaveBeenCalledTimes(1);
    const { from, to } = onRange.mock.calls[0]?.[0] as ChartRange;
    expect(from).toBeLessThan(to);
  });

  it("clamps a release outside the plot to the edge", async () => {
    const onRange = vi.fn();
    const host = await mount({ onRange });
    await fire(host, ...drag(150, 5000));
    await fire(host, ...drag(150, 9000));
    const a = onRange.mock.calls[0]?.[0] as ChartRange;
    const b = onRange.mock.calls[1]?.[0] as ChartRange;
    expect(a.to).toBe(b.to);
    expect(a.to).toBeLessThanOrEqual(200);
  });

  it("keeps 3 px a click and makes 5 px a range that does not reach onSelect", async () => {
    const onRange = vi.fn();
    const onSelect = vi.fn();
    const host = await mount({ onRange, onSelect });
    const click = (x: number) => pointer("click", x, { detail: 1 });
    await fire(host, pointer("pointermove", 200, { buttons: 0 }), pointer("pointerdown", 200), pointer("pointermove", 203), pointer("pointerup", 203), click(203));
    expect(onRange).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledTimes(1);
    await fire(host, pointer("pointerdown", 200), pointer("pointermove", 205), pointer("pointerup", 205), click(205));
    expect(onRange).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("reports nothing on Escape or a pointer cancel", async () => {
    const onRange = vi.fn();
    const host = await mount({ onRange });
    await fire(host, pointer("pointerdown", 150), pointer("pointermove", 250));
    await act(async () => void document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    await fire(host, pointer("pointerup", 250));
    expect(onRange).not.toHaveBeenCalled();
    await fire(host, pointer("pointerdown", 150), pointer("pointermove", 250), pointer("pointercancel", 250));
    expect(onRange).not.toHaveBeenCalled();
  });

  it("shows no tooltip while the pointer is down", async () => {
    const host = await mount({ onRange: () => undefined });
    await fire(host, pointer("pointermove", 200, { buttons: 0 }));
    expect(tooltipOf(host)).not.toBe("");
    await fire(host, pointer("pointerdown", 200), pointer("pointermove", 260), pointer("pointermove", 270));
    expect(tooltipOf(host)).toBe("");
  });

  it("changes nothing without onRange, and the latest handler is the one called", async () => {
    const host = await mount({});
    await fire(host, ...drag(250, 150));
    const first = vi.fn();
    const second = vi.fn();
    const r = await renderChart(<Course onRange={first} />);
    await r.rerender(<Course onRange={second} />);
    await fire(r.host, ...drag(150, 250));
    r.unmount();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("reports once per x axis, each with its axisId", async () => {
    const onRange = vi.fn();
    const host = await mount({ onRange, two: true });
    await fire(host, ...drag(150, 250));
    expect(onRange).toHaveBeenCalledTimes(2);
    const ids = onRange.mock.calls.map((c) => (c[0] as ChartRange).axisId);
    expect(new Set(ids).size).toBe(2);
    expect(ids).toContain("other");
  });

  it("takes touch-action pan-y where nothing zooms but onRange is given", async () => {
    const host = await mount({ onRange: () => undefined });
    expect(plotOf(host).style.touchAction).toBe("pan-y");
    const without = await renderChart(<Course />);
    expect(plotOf(without.host).style.touchAction).toBe("");
    without.unmount();
  });
});
