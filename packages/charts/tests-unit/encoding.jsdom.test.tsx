// @vitest-environment jsdom

/* charts-alternatives 02 (C3): encoding by marks as the legend shows it - the
   chip carries the dash, marker and hatch the canvas draws, by the same palette
   place as the colour. Without `encoding` nothing changes. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { Bar, Chart, Legend, Line, Matrix, Scatter, StateBand, XAxis, YAxis } from "../src";
import { renderChart, sizePlot } from "./renderChart";

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

async function legendOf(encoding: "color" | "marks" | undefined, series: ReactNode): Promise<HTMLElement[]> {
  const r = await renderChart(
    <Chart data={data} ariaLabel="Marks" encoding={encoding}>
      <XAxis accessor={(d: Row) => d.t} />
      <YAxis accessor={(d: Row) => d.b} />
      {series}
      <Legend />
    </Chart>,
  );
  unmount = r.unmount;
  return [...r.host.querySelectorAll<HTMLElement>(".uc-legend-item")];
}

const lines = (
  <>
    <Line accessor={(d: Row) => d.a} name="A" />
    <Line accessor={(d: Row) => d.b} name="B" />
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
      <>
        <Line accessor={(d: Row) => d.a} name="A" />
        <Line accessor={(d: Row) => d.b} name="B" dash={[2, 2]} />
      </>,
    );
    expect(b?.querySelector("line")?.getAttribute("stroke-dasharray")).toBe("2 2");
  });

  it("gives a scatter its marker alone, and a bar a hatched swatch", async () => {
    const [scatter, bar] = await legendOf(
      "marks",
      <>
        <Scatter accessor={(d: Row) => d.a} name="S" />
        <Bar accessor={(d: Row) => d.b} name="B" />
      </>,
    );
    expect(scatter?.querySelector("line")).toBeNull();
    expect(scatter?.querySelector("path")).not.toBeNull();
    // The bar stands on the second place: a rising hatch.
    const hatch = bar?.querySelector("rect + path")?.getAttribute("d") ?? "";
    expect(hatch).not.toBe("");
  });

  it("hatches each state by its index, the first plain", async () => {
    const states = [
      { label: "Running", color: "green" },
      { label: "Fault", color: "red" },
    ];
    const items = await legendOf("marks", <StateBand accessor={(d: Row) => d.s} states={states} name="Furnace" />);
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

  it("shows a matrix' steps side by side, each with its hatch", async () => {
    const [matrix] = await legendOf(
      "marks",
      <Matrix
        accessor={(d: Row) => d.a}
        value={(d: Row) => d.b}
        coloring={{ kind: "gradient", stops: ["#eee", "#999", "#333"] }}
        name="Load"
      />,
    );
    expect(matrix?.querySelectorAll("rect")).toHaveLength(3);
  });
});
