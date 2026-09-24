// @vitest-environment jsdom

/* charts-a11y 04: zoom and pan by key, only where the caller controls the
   domain - each key proposes what the matching gesture would. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../src";
import { frame, renderChart, sizePlot } from "./renderChart";

interface Row {
  t: number;
  a: number;
}

const data: Row[] = Array.from({ length: 11 }, (_, t) => ({ t: t * 10, a: t }));

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

async function chart(onDomainChange?: (d: [number, number]) => void): Promise<HTMLElement> {
  const r = await renderChart(
    <Chart data={data} ariaLabel="Zoomable">
      <XAxis accessor={(d: Row) => d.t} domain={[0, 100]} onDomainChange={onDomainChange} />
      <YAxis accessor={(d: Row) => d.a} />
      <Line accessor={(d: Row) => d.a} name="A" />
      <Tooltip />
    </Chart>,
  );
  unmount = r.unmount;
  const plot = r.host.querySelector(".uc-plot") as HTMLElement;
  await act(async () => plot.focus());
  await frame();
  return plot;
}

async function press(plot: HTMLElement, key: string, shiftKey = false): Promise<boolean> {
  const event = new KeyboardEvent("keydown", { key, shiftKey, bubbles: true, cancelable: true });
  await act(async () => {
    plot.dispatchEvent(event);
  });
  return event.defaultPrevented;
}

describe("Zoom by key", () => {
  it("zooms in and out around the Active point", async () => {
    const proposals: [number, number][] = [];
    const plot = await chart((d) => proposals.push(d));
    // The walk starts at the newest value, 100: the zoom keeps it in place.
    await press(plot, "+");
    const [from, to] = proposals.at(-1) ?? [0, 0];
    expect(to).toBeCloseTo(100);
    expect(to - from).toBeCloseTo(80);
    await press(plot, "-");
    const [from2, to2] = proposals.at(-1) ?? [0, 0];
    expect(to2 - from2).toBeGreaterThan(to - from);
  });

  it("pans by a tenth with Shift and the arrows", async () => {
    const proposals: [number, number][] = [];
    const plot = await chart((d) => proposals.push(d));
    await press(plot, "ArrowLeft", true);
    expect(proposals.at(-1)?.[0]).toBeCloseTo(-10);
    expect(proposals.at(-1)?.[1]).toBeCloseTo(90);
  });

  it("asks for the whole data with 0", async () => {
    const proposals: [number, number][] = [];
    const plot = await chart((d) => proposals.push(d));
    await press(plot, "0");
    expect(proposals.at(-1)).toEqual([0, 100]);
  });

  it("leaves the keys alone where the axis has no handler", async () => {
    const plot = await chart();
    expect(await press(plot, "+")).toBe(false);
    expect(await press(plot, "ArrowLeft", true)).toBe(false);
  });
});
