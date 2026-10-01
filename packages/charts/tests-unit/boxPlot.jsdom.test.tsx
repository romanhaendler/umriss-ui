// @vitest-environment jsdom

/* box-plot 01: a box per x, read as it is drawn. What a person meets: the
   tooltip and the readout top to bottom (B9), the arrows walking box to box
   (B11), the data table's columns, the y axis reaching the whisker ends, and
   both wordings. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { BoxPlot, Chart, DataTable, Tooltip, XAxis, YAxis, type ChartsWording } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import { focusPlot, frame, press, renderChart, sizePlot } from "./renderChart";

interface Machine {
  at: number;
  lo: number;
  q1: number;
  med: number | null;
  q3: number;
  hi: number;
}

const MACHINES = ["Press", "Dryer", "Kiln", "Glaze"];
const data: Machine[] = [
  { at: 0, lo: 2, q1: 4, med: 5, q3: 6, hi: 9 },
  { at: 1, lo: 3, q1: 5, med: 6, q3: 8, hi: 12 },
  { at: 2, lo: 1, q1: 3, med: null, q3: 7, hi: 90 },
  { at: 3, lo: 4, q1: 6, med: 7, q3: 9, hi: 31 },
];

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

function chart(extra: { wording?: ChartsWording; format?: (v: number) => string; table?: boolean } = {}): ReactNode {
  return (
    <Chart data={data} ariaLabel="Cycle time per machine" wording={extra.wording}>
      <XAxis accessor={(d: Machine) => d.at} ticks={[0, 1, 2, 3]} tickFormat={(v) => MACHINES[v] ?? ""} />
      <YAxis accessor={(d: Machine) => d.hi} tickFormat={(v) => `${v} s`} />
      <BoxPlot
        name="Cycle time"
        median={(d: Machine) => d.med}
        lowerQuartile={(d: Machine) => d.q1}
        upperQuartile={(d: Machine) => d.q3}
        lowerWhisker={(d: Machine) => d.lo}
        upperWhisker={(d: Machine) => d.hi}
        format={extra.format}
      />
      <Tooltip />
      {extra.table === true && <DataTable />}
    </Chart>
  );
}

const rows = (host: HTMLElement) => [...host.querySelectorAll(".uc-tooltip-row")].map((r) => r.textContent);
const head = (host: HTMLElement) => host.querySelector(".uc-tooltip-head")?.textContent ?? "";
const readout = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";
const rest = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const ticks = (host: HTMLElement) => [...host.querySelectorAll(".uc-axis-y .uc-tick")].map((t) => t.textContent);

function tableOf(host: HTMLElement): string[] {
  return [...host.querySelectorAll(".uc-data-panel tr")].map((tr) =>
    [...tr.querySelectorAll("th, td")].map((c) => c.textContent).join("|"),
  );
}

describe("A box in the tooltip", () => {
  it("reads its numbers top to bottom as drawn, in the y axis' format", async () => {
    const host = await mount(chart());
    await focusPlot(host);
    await press(host, "Home");
    expect(head(host)).toBe("Press");
    expect(rows(host)).toEqual([
      "Cycle time",
      "Upper whisker9 s",
      "Upper quartile6 s",
      "Median5 s",
      "Lower quartile4 s",
      "Lower whisker2 s",
    ]);
  });

  it("writes every number in the series' own format", async () => {
    const host = await mount(chart({ format: (v) => `${v.toFixed(1)} min` }));
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host)).toContain("Upper whisker9.0 min");
    expect(rows(host)).toContain("Median5.0 min");
  });

  it("speaks German through the charts' German wording", async () => {
    const host = await mount(chart({ wording: GERMAN_CHARTS_WORDING }));
    await focusPlot(host);
    await press(host, "Home");
    expect(rows(host).slice(1)).toEqual([
      "Oberer Whisker9 s",
      "Oberes Quartil6 s",
      "Median5 s",
      "Unteres Quartil4 s",
      "Unterer Whisker2 s",
    ]);
  });
});

describe("The keyboard on a box plot", () => {
  it("walks box to box and steps over a gap", async () => {
    const host = await mount(chart());
    await focusPlot(host);
    expect(head(host)).toBe("Glaze");
    await press(host, "ArrowLeft");
    expect(head(host)).toBe("Dryer");
    await press(host, "ArrowRight");
    expect(head(host)).toBe("Glaze");
  });

  it("reads the box out in the tooltip's order", async () => {
    const host = await mount(chart());
    await focusPlot(host);
    await press(host, "Home");
    await rest(200);
    expect(readout(host)).toBe(
      "Press. Cycle time: Upper whisker 9 s, Upper quartile 6 s, Median 5 s, Lower quartile 4 s, Lower whisker 2 s.",
    );
  });
});

describe("The y axis of a box plot", () => {
  it("reaches the highest whisker end, and a gap's numbers do not pull it", async () => {
    const host = await mount(chart());
    const labels = ticks(host);
    // The highest whisker drawn is 31; the gap's 90 is not drawn.
    expect(labels).toContain("30 s");
    expect(labels).not.toContain("50 s");
  });
});

describe("A box in the data table", () => {
  it("has a column per number, top to bottom, and a gap's row is empty", async () => {
    const host = await mount(chart({ table: true }));
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    expect(tableOf(host)).toEqual([
      "Position|Cycle time – Upper whisker|Cycle time – Upper quartile|Cycle time – Median|Cycle time – Lower quartile|Cycle time – Lower whisker",
      "Press|9 s|6 s|5 s|4 s|2 s",
      "Dryer|12 s|8 s|6 s|5 s|3 s",
      "Kiln|||||",
      "Glaze|31 s|9 s|7 s|6 s|4 s",
    ]);
  });
});
