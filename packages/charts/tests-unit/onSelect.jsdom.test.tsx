// @vitest-environment jsdom

/* charts-on-select: the chart reports the hit and keeps nothing. What a person
   observes: a click on a hit reports it once, the end of a drag does not, a
   double click reports once, Enter reports the Active point, and the summary
   names the key only where `onSelect` is given. */

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip, type TooltipHit, useChart } from "../src";
import { focusPlot, frame, plotOf, press, renderChart, sizePlot } from "./renderChart";

const ROWS = [
  { t: 0, a: 10 },
  { t: 1, a: 20 },
  { t: 2, a: 15 },
];

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

function Course({ onSelect, tooltip = true, zoomable = false }: { onSelect?: (hit: TooltipHit) => void; tooltip?: boolean; zoomable?: boolean }) {
  const { Chart, XAxis, YAxis, Line } = useChart(ROWS, { onSelect });
  return (
    <Chart aria-label="One course">
      <XAxis value="t" zoomable={zoomable} />
      <YAxis />
      <Line value="a" name="A" />
      {tooltip && <Tooltip />}
    </Chart>
  );
}

const rest = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const summary = (host: HTMLElement) => document.getElementById(plotOf(host).getAttribute("aria-describedby") ?? "")?.textContent ?? "";

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

describe("onSelect", () => {
  it("reports the hit of a click once, and of the keyboard's Enter", async () => {
    const onSelect = vi.fn();
    const r = await renderChart(<Course onSelect={onSelect} />);
    unmount = r.unmount;
    await fire(r.host, pointer("pointermove", 200, { buttons: 0 }), pointer("click", 200, { detail: 1 }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    const hit = onSelect.mock.calls[0]?.[0] as TooltipHit;
    expect(hit.points[0]?.seriesName).toBe("A");
    expect(hit.points[0]?.datum).toBe(ROWS[hit.points[0]?.index ?? 0]);
    await fire(r.host, pointer("click", 200, { detail: 2 }));
    expect(onSelect).toHaveBeenCalledTimes(1);

    onSelect.mockClear();
    await focusPlot(r.host);
    await press(r.host, "ArrowRight");
    expect(await press(r.host, "Enter")).toBe(true);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("does not report the end of a drag", async () => {
    const onSelect = vi.fn();
    const r = await renderChart(<Course onSelect={onSelect} zoomable />);
    unmount = r.unmount;
    await fire(r.host, pointer("pointermove", 200, { buttons: 0 }), pointer("pointerdown", 200), pointer("pointermove", 260), pointer("pointerup", 260), pointer("click", 260, { detail: 1 }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("names Enter in the summary only where onSelect is given", async () => {
    const withIt = await renderChart(<Course onSelect={() => undefined} />);
    await rest(150);
    expect(summary(withIt.host)).toContain("Enter chooses");
    withIt.unmount();
    const without = await renderChart(<Course />);
    unmount = without.unmount;
    await rest(150);
    expect(summary(without.host)).toContain("Left and right arrows");
    expect(summary(without.host)).not.toContain("Enter chooses");
  });

  it("warns in development without a Tooltip", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const r = await renderChart(<Course onSelect={() => undefined} tooltip={false} />);
    unmount = r.unmount;
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("`onSelect` needs a <Tooltip>"));
  });
});
