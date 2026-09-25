// @vitest-environment jsdom

/* charts-alternatives 01: the data table a reader opens instead of walking
   (C1, C2, C5). What a person observes: the disclosure key beside the legend,
   and the table it opens - its columns, its values in their formats, the
   visible domain, and the caption that says when rows stand for more. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { Chart, DataTable, Legend, Line, StateBand, XAxis, YAxis } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import { frame, renderChart, sizePlot } from "./renderChart";

interface Row {
  t: number;
  a: number | null;
  b: number;
}

const data: Row[] = [
  { t: 0, a: 10, b: 100 },
  { t: 1, a: 11, b: 101 },
  { t: 2, a: null, b: 102 },
  { t: 3, a: 13, b: 103 },
  { t: 4, a: 14, b: 104 },
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

const keyOf = (host: HTMLElement) => host.querySelector(".uc-data-key") as HTMLButtonElement;

async function toggle(host: HTMLElement): Promise<void> {
  await act(async () => keyOf(host).click());
  await frame();
}

/** The table as text: the header row, then every row, cells joined by "|". */
function tableOf(host: HTMLElement): string[] {
  return [...host.querySelectorAll(".uc-data-panel tr")].map((tr) =>
    [...tr.querySelectorAll("th, td")].map((c) => c.textContent).join("|"),
  );
}

const caption = (host: HTMLElement) => host.querySelector(".uc-data-panel caption")?.textContent ?? "";

function twoLines(extra: { domain?: readonly [number, number]; hidden?: boolean; legend?: boolean } = {}): ReactNode {
  return (
    <Chart data={data} ariaLabel="Two courses">
      <XAxis accessor={(d: Row) => d.t} tickFormat={(v) => `t${v}`} label="Time" domain={extra.domain ?? "data"} />
      <YAxis accessor={(d: Row) => d.b} tickFormat={(v) => `${v} °C`} />
      <Line accessor={(d: Row) => d.a} name="A" format={(v) => `${v.toFixed(1)} bar`} />
      <Line accessor={(d: Row) => d.b} name="B" hidden={extra.hidden} />
      {extra.legend !== false && <Legend />}
      <DataTable />
    </Chart>
  );
}

describe("The disclosure key", () => {
  it("stands in the legend, closed", async () => {
    const host = await mount(twoLines());
    const key = keyOf(host);
    expect(key.closest(".uc-legend")).not.toBeNull();
    expect(key.textContent).toBe("Show data");
    expect(key.getAttribute("aria-expanded")).toBe("false");
    expect(host.querySelector(".uc-data-panel")).toBeNull();
  });

  it("stands on its own without a legend", async () => {
    const host = await mount(twoLines({ legend: false }));
    expect(keyOf(host)).not.toBeNull();
    expect(host.querySelectorAll(".uc-data-key")).toHaveLength(1);
  });

  it("opens the table it controls, and closes it again", async () => {
    const host = await mount(twoLines());
    await toggle(host);
    const key = keyOf(host);
    expect(key.getAttribute("aria-expanded")).toBe("true");
    expect(key.textContent).toBe("Hide data");
    const panel = host.querySelector(".uc-data-panel") as HTMLElement;
    expect(panel.id).toBe(key.getAttribute("aria-controls"));
    await toggle(host);
    expect(host.querySelector(".uc-data-panel")).toBeNull();
  });
});

describe("The table", () => {
  it("has the x column, then one column per visible series, each value in its format", async () => {
    const host = await mount(twoLines());
    await toggle(host);
    expect(tableOf(host)).toEqual([
      "Time|A|B",
      "t0|10.0 bar|100 °C",
      "t1|11.0 bar|101 °C",
      "t2||102 °C",
      "t3|13.0 bar|103 °C",
      "t4|14.0 bar|104 °C",
    ]);
    expect(caption(host)).toBe("Values from t0 to t4.");
  });

  it("marks its rows and columns for a screen reader", async () => {
    const host = await mount(twoLines());
    await toggle(host);
    const heads = [...host.querySelectorAll(".uc-data-panel thead th")];
    expect(heads.every((th) => th.getAttribute("scope") === "col")).toBe(true);
    const rowHeads = [...host.querySelectorAll(".uc-data-panel tbody th")];
    expect(rowHeads).toHaveLength(5);
    expect(rowHeads.every((th) => th.getAttribute("scope") === "row")).toBe(true);
  });

  it("lists the visible domain only", async () => {
    const host = await mount(twoLines({ domain: [1, 3] }));
    await toggle(host);
    expect(tableOf(host).slice(1).map((r) => r.split("|")[0])).toEqual(["t1", "t2", "t3"]);
    expect(caption(host)).toBe("Values from t1 to t3.");
  });

  it("leaves a hidden series out", async () => {
    const host = await mount(twoLines({ hidden: true }));
    await toggle(host);
    expect(tableOf(host)[0]).toBe("Time|A");
  });

  it("follows new data while it is open", async () => {
    const r = await renderChart(twoLines());
    unmount = r.unmount;
    await toggle(r.host);
    const more = [...data, { t: 5, a: 15, b: 105 }];
    await r.rerender(
      <Chart data={more} ariaLabel="Two courses">
        <XAxis accessor={(d: Row) => d.t} tickFormat={(v) => `t${v}`} label="Time" />
        <YAxis accessor={(d: Row) => d.b} tickFormat={(v) => `${v} °C`} />
        <Line accessor={(d: Row) => d.a} name="A" format={(v) => `${v.toFixed(1)} bar`} />
        <Line accessor={(d: Row) => d.b} name="B" />
        <Legend />
        <DataTable />
      </Chart>,
    );
    expect(tableOf(r.host).at(-1)).toBe("t5|15.0 bar|105 °C");
  });

  it("names a state, not its code", async () => {
    const states = [
      { label: "Running", color: "green" },
      { label: "Fault", color: "red" },
    ];
    const host = await mount(
      <Chart data={[{ t: 0, s: 0 }, { t: 1, s: 1 }]} ariaLabel="States">
        <XAxis accessor={(d: { t: number }) => d.t} tickFormat={(v) => `t${v}`} />
        <YAxis accessor={() => 0} domain={[0, 1]} />
        <StateBand accessor={(d: { s: number }) => d.s} states={states} name="Furnace" />
        <DataTable />
      </Chart>,
    );
    await toggle(host);
    expect(tableOf(host)).toEqual(["Position|Furnace", "t0|Running", "t1|Fault"]);
  });

  it("shows the downsampled course of a long series and says so in its caption", async () => {
    const long = Array.from({ length: 5_000 }, (_, i) => ({ t: i, v: i % 7 }));
    const host = await mount(
      <Chart data={long} ariaLabel="A long course">
        <XAxis accessor={(d: { t: number }) => d.t} />
        <YAxis accessor={(d: { v: number }) => d.v} />
        <Line accessor={(d: { v: number }) => d.v} name="V" />
        <DataTable />
      </Chart>,
    );
    await toggle(host);
    const rows = host.querySelectorAll(".uc-data-panel tbody tr");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(500);
    expect(caption(host)).toContain("Downsampled from 5,000 readings");
  });

  it("speaks German from the chart's wording", async () => {
    const host = await mount(
      <Chart data={data} ariaLabel="Zwei Verläufe" wording={GERMAN_CHARTS_WORDING}>
        <XAxis accessor={(d: Row) => d.t} tickFormat={(v) => `t${v}`} />
        <YAxis accessor={(d: Row) => d.b} />
        <Line accessor={(d: Row) => d.b} name="B" />
        <DataTable />
      </Chart>,
    );
    expect(keyOf(host).textContent).toBe("Daten zeigen");
    await toggle(host);
    expect(keyOf(host).textContent).toBe("Daten verbergen");
    expect(tableOf(host)[0]).toBe("Position|B");
    expect(caption(host)).toBe("Werte von t0 bis t4.");
  });
});
