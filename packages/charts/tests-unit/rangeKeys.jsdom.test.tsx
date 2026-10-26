// @vitest-environment jsdom

/* The keyboard marks a range as the pointer does: Space sets the start at the
   Active point, the walk moves it, Space sets the end and `onRange` hears the
   two x values, the earlier first. */

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip, useChart, type ChartRange } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import { focusPlot, frame, plotOf, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

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

function Course({ onRange, tooltip = true, wording }: { onRange?: (r: ChartRange) => void; tooltip?: boolean; wording?: typeof GERMAN_CHARTS_WORDING }) {
  const { Chart, XAxis, YAxis, Line } = useChart(ROWS, { onRange });
  return (
    <Chart aria-label="One course" wording={wording}>
      <XAxis value="t" />
      <YAxis />
      <Line value="a" name="A" />
      {tooltip && <Tooltip />}
    </Chart>
  );
}

const rest = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const live = (host: HTMLElement) => host.querySelector("[aria-live=polite]")?.textContent ?? "";
const summary = (host: HTMLElement) => document.getElementById(plotOf(host).getAttribute("aria-describedby") ?? "")?.textContent ?? "";

async function mount(onRange?: (r: ChartRange) => void, wording?: typeof GERMAN_CHARTS_WORDING) {
  const r = await renderChart(<Course onRange={onRange} wording={wording} />);
  unmount = r.unmount;
  await focusPlot(r.host); // the walk starts at the newest point, 2
  return r.host;
}

describe("onRange by key", () => {
  it("warns once in development when there is no tooltip", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const r = await renderChart(<Course onRange={() => undefined} tooltip={false} />);
    unmount = r.unmount;
    await frame();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("`onRange` needs a <Tooltip>"));
  });

  it("reports the earlier end first, once, and Space twice on one point makes from === to", async () => {
    const onRange = vi.fn();
    const host = await mount(onRange);
    expect(await press(host, " ")).toBe(true);
    await press(host, "ArrowLeft");
    await press(host, "ArrowLeft");
    expect(onRange).not.toHaveBeenCalled();
    await press(host, " ");
    expect(onRange).toHaveBeenCalledTimes(1);
    expect(onRange.mock.calls[0]?.[0]).toMatchObject({ from: 0, to: 2 });
    expect(typeof onRange.mock.calls[0]?.[0].axisId).toBe("string");
    onRange.mockClear();
    await press(host, " ");
    await press(host, " ");
    expect(onRange.mock.calls[0]?.[0]).toMatchObject({ from: 0, to: 0 });
  });

  it("Escape cancels the start and keeps the Active point; the next clears it", async () => {
    const onRange = vi.fn();
    const host = await mount(onRange);
    await press(host, " ");
    await press(host, "Escape");
    expect(tooltipOf(host)).not.toBe("");
    await press(host, "ArrowLeft");
    await press(host, " "); // a new start, not an end
    expect(onRange).not.toHaveBeenCalled();
    await press(host, "Escape");
    await press(host, "Escape");
    expect(tooltipOf(host)).toBe("");
  });

  it("blur cancels the start", async () => {
    const onRange = vi.fn();
    const host = await mount(onRange);
    await press(host, " ");
    await act(async () => plotOf(host).blur());
    await focusPlot(host);
    await press(host, " ");
    expect(onRange).not.toHaveBeenCalled();
  });

  it("says the start and the range in the axis' format, nothing on a cancel", async () => {
    const host = await mount(() => undefined);
    await press(host, " ");
    expect(live(host)).toBe("Range from 2.0 started.");
    await press(host, "ArrowLeft");
    await press(host, " ");
    expect(live(host)).toBe("Range from 1.0 to 2.0.");
    await press(host, " ");
    expect(live(host)).toBe("Range from 1.0 started.");
    await press(host, "Escape");
    await rest(200);
    expect(live(host)).toBe("Range from 1.0 started."); // the cancel wrote nothing
  });

  it("speaks German under the German wording", async () => {
    const host = await mount(() => undefined, GERMAN_CHARTS_WORDING);
    await press(host, " ");
    expect(live(host)).toMatch(/^Bereich ab /);
  });

  it("names the key in the summary only with onRange and a tooltip", async () => {
    const withIt = await renderChart(<Course onRange={() => undefined} />);
    await rest(150);
    expect(summary(withIt.host)).toContain("Space");
    withIt.unmount();
    const without = await renderChart(<Course />);
    await rest(150);
    expect(summary(without.host)).not.toContain("Space");
    without.unmount();
    const noTip = await renderChart(<Course onRange={() => undefined} tooltip={false} />);
    unmount = noTip.unmount;
    await rest(150);
    expect(summary(noTip.host)).not.toContain("Space");
  });

  it("leaves Space alone without onRange, and Shift+Space and modified Space with it", async () => {
    const plain = await renderChart(<Course />);
    await focusPlot(plain.host);
    expect(await press(plain.host, " ")).toBe(false);
    plain.unmount();
    const onRange = vi.fn();
    const host = await mount(onRange);
    expect(await press(host, " ", { shiftKey: true })).toBe(false);
    expect(await press(host, " ", { ctrlKey: true })).toBe(false);
    expect(await press(host, " ", { altKey: true })).toBe(false);
    expect(await press(host, " ", { metaKey: true })).toBe(false);
  });
});
