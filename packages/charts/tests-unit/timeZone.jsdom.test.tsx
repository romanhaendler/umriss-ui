// @vitest-environment jsdom

/* A chart in a named time zone: the zone's name in the axis title where the
   reader's zone is another, and the offset in the tooltip and the readout of
   an instant in the doubled hour. The reader's zone here is Europe/Berlin
   (vitest.config.ts). */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { Tooltip, useChart } from "../src";
import { focusPlot, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

async function mount(element: ReactNode): Promise<HTMLElement> {
  const r = await renderChart(element);
  unmount = r.unmount;
  return r.host;
}

// 25 October 2026 in Berlin: 02:00 CEST at 00:00Z, 02:00 CET at 01:00Z.
const ROWS = [Date.UTC(2026, 9, 24, 23), Date.UTC(2026, 9, 25, 0), Date.UTC(2026, 9, 25, 1), Date.UTC(2026, 9, 25, 2)].map((t, i) => ({ t, v: 10 + i }));

function Trend({ timeZone, label = "Time" }: { timeZone?: string; label?: string }) {
  const { Chart, XAxis, YAxis, Line } = useChart(ROWS);
  return (
    <Chart aria-label="Trend" timeZone={timeZone}>
      <XAxis value="t" time label={label} />
      <YAxis />
      <Line value="v" name="Value" />
      <Tooltip mode="x" />
    </Chart>
  );
}

const title = (host: HTMLElement) => host.querySelector(".uc-axis-x .uc-axis-title")?.textContent;
const rest = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const readout = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";

describe("the zone label in the axis title", () => {
  it("follows the own title for a zone that is not the reader's", async () => {
    const host = await mount(<Trend timeZone="America/New_York" />);
    expect(title(host)).toMatch(/^Time · .+/);
  });

  it("stands alone where the axis has no title", async () => {
    const host = await mount(<Trend timeZone="America/New_York" label="" />);
    expect(title(host)).not.toContain("·");
    expect(title(host)).toBeTruthy();
  });

  it("is absent for the reader's own zone, however it is spelled, and for no zone", async () => {
    expect(title(await mount(<Trend timeZone="Europe/Berlin" />))).toBe("Time");
    unmount?.();
    expect(title(await mount(<Trend />))).toBe("Time");
  });

  it("throws Intl's RangeError for an unknown zone", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(mount(<Trend timeZone="Mars/Olympus" />)).rejects.toThrow(RangeError);
  });
});

describe("an instant in the doubled hour", () => {
  it("carries its offset in the tooltip and the readout", async () => {
    const host = await mount(<Trend timeZone="Europe/Berlin" />);
    await focusPlot(host);
    await press(host, "Home");
    await press(host, "ArrowRight");
    expect(tooltipOf(host)).toContain("25 Oct 02:00 GMT+2");
    await rest(200);
    expect(readout(host)).toContain("02:00 GMT+2");
    await press(host, "ArrowRight");
    expect(tooltipOf(host)).toContain("25 Oct 02:00 GMT+1");
    await rest(200);
    expect(readout(host)).toContain("02:00 GMT+1");
  });
});
