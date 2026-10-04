// @vitest-environment jsdom

/* charts-alternatives 02 (C3): encoding by marks as the legend shows it - the
   chip carries the dash, marker and hatch the canvas draws, by the same palette
   place as the colour. Without `encoding` nothing changes. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { Legend, Tooltip, useChart, type ChartParts } from "../src";
import { focusPlot, press, renderChart, sizePlot } from "./renderChart";

interface Row {
  t: number;
  a: number;
  b: number;
  s: number;
}

const data: Row[] = [
  { t: 0, a: 1, b: 2, s: 0 },
  { t: 1, a: 2, b: 3, s: 1 },
];

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

type Series = (parts: ChartParts<Row>) => ReactNode;

function Marks({ encoding, series, tail }: { encoding?: "color" | "marks"; series: Series; tail: ReactNode }) {
  const parts = useChart(data);
  const { Chart, XAxis, YAxis } = parts;
  return (
    <Chart ariaLabel="Marks" encoding={encoding}>
      <XAxis value="t" />
      <YAxis />
      {series(parts)}
      {tail}
    </Chart>
  );
}

async function legendOf(encoding: "color" | "marks" | undefined, series: Series): Promise<HTMLElement[]> {
  const r = await renderChart(<Marks encoding={encoding} series={series} tail={<Legend />} />);
  unmount = r.unmount;
  return [...r.host.querySelectorAll<HTMLElement>(".uc-legend-item")];
}

const lines: Series = ({ Line }) => (
  <>
    <Line value="a" name="A" />
    <Line value="b" name="B" />
  </>
);

describe("The legend under encoding by marks", () => {
  it("keeps its colour chips without it", async () => {
    for (const encoding of [undefined, "color"] as const) {
      const items = await legendOf(encoding, lines);
      expect(items.map((i) => i.querySelector(".uc-legend-chip") !== null)).toEqual([true, true]);
      expect(items.some((i) => i.querySelector("svg") !== null)).toBe(false);
      unmount?.();
      unmount = null;
    }
  });

  it("draws each line's dash and marker by its palette place", async () => {
    const [a, b] = await legendOf("marks", lines);
    // The first place is plain: solid, a circle.
    expect(a?.querySelector("line")?.getAttribute("stroke-dasharray")).toBeNull();
    expect(a?.querySelector("path")?.getAttribute("d")).toContain("A");
    // The second: dashed, a square.
    expect(b?.querySelector("line")?.getAttribute("stroke-dasharray")).toBe("7 4");
    expect(b?.querySelector("path")?.getAttribute("d")).toMatch(/^M[^A]*Z$/);
  });

  it("lets a dash of the caller's own win", async () => {
    const [, b] = await legendOf(
      "marks",
      ({ Line }) => (
        <>
          <Line value="a" name="A" />
          <Line value="b" name="B" dash={[2, 2]} />
        </>
      ),
    );
    expect(b?.querySelector("line")?.getAttribute("stroke-dasharray")).toBe("2 2");
  });

  it("gives a scatter its marker alone, and a bar a hatched swatch", async () => {
    const [scatter, bar] = await legendOf(
      "marks",
      ({ Scatter, Bar }) => (
        <>
          <Scatter value="a" name="S" />
          <Bar value="b" name="B" />
        </>
      ),
    );
    expect(scatter?.querySelector("line")).toBeNull();
    expect(scatter?.querySelector("path")).not.toBeNull();
    // The bar stands on the second place: a rising hatch.
    const hatch = bar?.querySelector("rect + path")?.getAttribute("d") ?? "";
    expect(hatch).not.toBe("");
  });

  /* charts-alternatives 04: an area shows its dash and its fill's hatch, as
     the plot draws it. */
  it("gives an area its dash and its hatched fill", async () => {
    const [, area] = await legendOf(
      "marks",
      ({ Line, Area }) => (
        <>
          <Line value="a" name="A" />
          <Area value="b" name="B" />
        </>
      ),
    );
    expect(area?.querySelector("line")?.getAttribute("stroke-dasharray")).toBe("7 4");
    expect(area?.querySelector("rect + path")?.getAttribute("d") ?? "").not.toBe("");
  });

  it("hatches a state by its name, alike in every band that lists it", async () => {
    const items = await legendOf(
      "marks",
      ({ StateBand }) => (
        <>
          <StateBand value="s" states={[{ label: "Running", color: "green" }, { label: "Fault", color: "red" }]} name="One" />
          <StateBand value="s" states={[{ label: "Setup", color: "blue" }, { label: "Fault", color: "red" }]} name="Two" />
        </>
      ),
    );
    const hatchOf = (name: string) =>
      items.find((i) => i.textContent === name)?.querySelector("rect + path")?.getAttribute("d") ?? "";
    // Fault is second in both lists and takes the second hatch; Setup, first
    // in its band but third by name, the third - not the plain first.
    expect(items).toHaveLength(3);
    expect(hatchOf("Running")).toBe("");
    expect(hatchOf("Fault")).not.toBe("");
    expect(hatchOf("Setup")).not.toBe("");
    expect(hatchOf("Setup")).not.toBe(hatchOf("Fault"));
  });

  it("hatches each state by its index, the first plain", async () => {
    const states = [
      { label: "Running", color: "green" },
      { label: "Fault", color: "red" },
    ];
    const items = await legendOf("marks", ({ StateBand }) => <StateBand value="s" states={states} name="Furnace" />);
    const hatches = items.map((i) => i.querySelector("rect + path")?.getAttribute("d") ?? "");
    expect(hatches[0]).toBe("");
    expect(hatches[1]).not.toBe("");
  });

  /* charts-alternatives 03 (C4): the contrast mode leaves the canvas alone,
     so the chart forces itself - and encodes by marks whatever it was told. */
  it("switches the marks on by itself under forced colours", async () => {
    const real = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) =>
      query === "(forced-colors: active)"
        ? ({ matches: true, addEventListener: () => undefined } as unknown as MediaQueryList)
        : real(query),
    );
    const [, b] = await legendOf(undefined, lines);
    expect(b?.querySelector(".uc-legend-chip")).toBeNull();
    expect(b?.querySelector("line")?.getAttribute("stroke-dasharray")).toBe("7 4");
  });

  /* charts-alternatives 04: the contrast mode takes a chip's background, so
     the tooltip's chips draw the legend's marks instead. */
  it("gives the tooltip the legend's marks under forced colours", async () => {
    const real = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) =>
      query === "(forced-colors: active)"
        ? ({ matches: true, addEventListener: () => undefined } as unknown as MediaQueryList)
        : real(query),
    );
    const r = await renderChart(<Marks series={lines} tail={<Tooltip />} />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "ArrowLeft");
    const rows = [...r.host.querySelectorAll(".uc-tooltip-row")];
    expect(rows).toHaveLength(2);
    expect(rows.some((row) => row.querySelector(".uc-tooltip-chip") !== null)).toBe(false);
    expect(rows[1]?.querySelector("svg line")?.getAttribute("stroke-dasharray")).toBe("7 4");
  });

  it("keeps the tooltip's colour chips otherwise", async () => {
    const r = await renderChart(<Marks encoding="marks" series={lines} tail={<Tooltip />} />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "ArrowLeft");
    expect(r.host.querySelectorAll(".uc-tooltip-row .uc-tooltip-chip")).toHaveLength(2);
  });

  it("shows a matrix' steps side by side, each with its hatch", async () => {
    const [matrix] = await legendOf(
      "marks",
      ({ Matrix }) => (
        <Matrix value="a" level="b" coloring={{ kind: "gradient", stops: ["#eee", "#999", "#333"] }} name="Load" />
      ),
    );
    expect(matrix?.querySelectorAll("rect")).toHaveLength(3);
  });
});
