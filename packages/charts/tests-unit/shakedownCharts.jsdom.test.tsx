// @vitest-environment jsdom

/* Open points of the third shakedown: a field no row has is said once, and "No data" stands without a legend
   or placeholder tick labels. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { useChart, Legend } from "../src";
import { renderChart, sizePlot } from "./renderChart";

interface Row {
  t: number;
  a: number;
}
const rows: Row[] = [
  { t: 0, a: 1 },
  { t: 1, a: 2 },
];

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

function Misspelt({ field, data = rows }: { field: string; data?: Row[] }) {
  const { Chart, XAxis, YAxis, Line } = useChart(data);
  return (
    <Chart aria-label="Field" height={200}>
      <XAxis value="t" />
      <YAxis />
      <Line value={field as "a"} name={`L-${field}`} />
    </Chart>
  );
}

describe("a series naming a field no row has", () => {
  it("warns once in DEV", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mounted = await renderChart(<Misspelt field="speeed" />);
    unmount = mounted.unmount;
    await mounted.rerender(<Misspelt field="speeed" />);
    const said = warn.mock.calls.filter((c) => String(c[0]).includes('"speeed"'));
    expect(said).toHaveLength(1);
  });

  it("is silent for a field the rows have", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mounted = await renderChart(<Misspelt field="a" />);
    unmount = mounted.unmount;
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("no row has"))).toHaveLength(0);
  });
});

const SPEND = [
  { centre: "Sales", actual: 139 },
  { centre: "Marketing", actual: 78 },
  { centre: "Design", actual: 51 },
];

function Spend() {
  const { Chart, XAxis, YAxis, Bar } = useChart(SPEND);
  return (
    <Chart aria-label="Spend">
      <XAxis value="centre" />
      <YAxis />
      <Bar value="actual" name="Actual" />
    </Chart>
  );
}

describe("the summary's extremes", () => {
  it("name the category they fall on", async () => {
    const mounted = await renderChart(<Spend />);
    unmount = mounted.unmount;
    await act(() => new Promise<void>((r) => setTimeout(r, 200)));
    const id = mounted.host.querySelector(".uc-plot")?.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(id)?.textContent).toContain("Actual from 51 (Design) to 139 (Sales).");
  });
});

function Plain({ data }: { data: Row[] }) {
  const { Chart, XAxis, YAxis, Line } = useChart(data);
  return (
    <Chart aria-label="Plain" height={200}>
      <Legend />
      <XAxis value="t" />
      <YAxis />
      <Line value="a" name="A" />
    </Chart>
  );
}

describe("an empty chart", () => {
  it("shows No data without legend and tick labels", async () => {
    const mounted = await renderChart(<Plain data={[]} />);
    unmount = mounted.unmount;
    expect(mounted.host.querySelector(".uc-empty")?.textContent).toBe("No data");
    expect(mounted.host.querySelector(".uc-legend")).toBeNull();
    expect(mounted.host.querySelectorAll(".uc-axis .uc-tick-label")).toHaveLength(0);
  });

  it("keeps both for a chart with data", async () => {
    const mounted = await renderChart(<Plain data={rows} />);
    unmount = mounted.unmount;
    expect(mounted.host.querySelector(".uc-legend")).not.toBeNull();
    expect(mounted.host.querySelectorAll(".uc-axis .uc-tick-label").length).toBeGreaterThan(0);
  });
});
