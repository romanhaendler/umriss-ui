// @vitest-environment jsdom

/* chart-rows-as-they-come 01, ADR-0051: a category is a value. The x axis
   reads a string field and the library keeps the map from category to place -
   what a reader is told, under the tick, in the tooltip, the readout, the
   summary and the data table, is the category. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { DataTable, Tooltip, useChart, type ChartView, type TooltipHit } from "../src";
import { focusPlot, frame, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

interface Spend {
  centre: string | null;
  actual: number;
  budget: number;
}

const SPEND: Spend[] = [
  { centre: "Sales", actual: 139, budget: 142 },
  { centre: "Marketing", actual: 78, budget: 68 },
  { centre: "Design", actual: 51, budget: 54 },
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

const rest = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const readout = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";
const tableRows = (host: HTMLElement) =>
  [...host.querySelectorAll(".uc-data-panel tbody tr")].map((tr) => [...tr.querySelectorAll("th, td")].map((c) => c.textContent).join("|"));
const ticks = (host: HTMLElement) => [...host.querySelectorAll(".uc-axis-x .uc-tick")].map((t) => t.textContent);

function Bars({ rows = SPEND }: { rows?: readonly Spend[] }) {
  const { Chart, XAxis, YAxis, Bar } = useChart(rows);
  return (
    <Chart ariaLabel="Spend per cost centre">
      <XAxis value="centre" />
      <YAxis />
      <Bar value="actual" name="Actual" />
      <Tooltip mode="x" />
      <DataTable />
    </Chart>
  );
}

describe("A category on the x axis", () => {
  it("gets a tick under every category, labelled with the category, in the rows' order", async () => {
    const host = await mount(<Bars />);
    expect(ticks(host)).toEqual(["Sales", "Marketing", "Design"]);
  });

  it("is named in the tooltip, the readout and the summary", async () => {
    const host = await mount(<Bars />);
    await focusPlot(host);
    await press(host, "ArrowLeft");
    expect(tooltipOf(host)).toContain("Marketing");
    expect(tooltipOf(host)).toContain("78");
    await rest(200);
    expect(readout(host)).toBe("Marketing. Actual 78.");
    const summary = document.getElementById(host.querySelector(".uc-plot")?.getAttribute("aria-describedby") ?? "")?.textContent;
    expect(summary).toContain("Sales to Design");
  });

  it("stands in the data table's x column", async () => {
    const host = await mount(<Bars />);
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    expect(tableRows(host)).toEqual(["Sales|139", "Marketing|78", "Design|51"]);
  });

  it("takes a string that looks like a number as a category", async () => {
    const host = await mount(<Bars rows={[{ centre: "2025", actual: 1, budget: 1 }, { centre: "2024", actual: 2, budget: 2 }]} />);
    expect(ticks(host)).toEqual(["2025", "2024"]);
  });

  it("leaves a row without a category out, without a word", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const host = await mount(
      <Bars rows={[SPEND[0]!, { centre: null, actual: 9, budget: 9 }, { centre: "", actual: 9, budget: 9 }, SPEND[1]!]} />,
    );
    expect(ticks(host)).toEqual(["Sales", "Marketing"]);
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    expect(tableRows(host)).toEqual(["Sales|139", "Marketing|78"]);
    expect(warn).not.toHaveBeenCalled();
  });
});

/* Budget per centre, as a second source would send it: its own rows, in its
   own order, one centre the ledger does not have and one it has left out. */
const BUDGET = [
  { centre: "Design", budget: 54 },
  { centre: "Finance", budget: 47 },
  { centre: "Sales", budget: 142 },
];

function TwoSources({ seen, hidden }: { seen?: (hit: TooltipHit) => void; hidden?: readonly string[] }) {
  const { Chart, XAxis, YAxis, Bar, Line } = useChart(SPEND, { initialView: { hidden } });
  return (
    <Chart ariaLabel="Spend and budget per cost centre">
      <XAxis value="centre" />
      <YAxis />
      <Bar value="actual" name="Actual" />
      <Line data={BUDGET} value={(d, i) => d.budget + i / 10} name="Budget" />
      <Tooltip
        mode="x"
        render={
          seen === undefined
            ? undefined
            : (hit) => {
                seen(hit);
                return null;
              }
        }
      />
      <DataTable />
    </Chart>
  );
}

describe("Several series on a category axis", () => {
  it("adds a series' own categories after those before it", async () => {
    const host = await mount(<TwoSources />);
    expect(ticks(host)).toEqual(["Sales", "Marketing", "Design", "Finance"]);
  });

  it("puts rows given in another order in their places, a line on the middle of a bar's", async () => {
    const host = await mount(<TwoSources />);
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    // The budget's value carries its row's index after the point.
    expect(tableRows(host)).toEqual(["Sales|139|142.2", "Marketing|78|", "Design|51|54", "Finance||47.1"]);
  });

  it("hands a hit the row it came from, with the caller's index", async () => {
    let last: TooltipHit | null = null;
    const host = await mount(<TwoSources seen={(hit) => (last = hit)} />);
    await focusPlot(host);
    await press(host, "Home");
    const budget = (last as TooltipHit | null)?.points.find((p) => p.seriesName === "Budget");
    expect(budget?.datum).toBe(BUDGET[2]);
    expect(budget?.index).toBe(2);
  });

  it("keeps every category in its place when a series is hidden", async () => {
    const host = await mount(<TwoSources hidden={["Budget"]} />);
    expect(ticks(host)).toEqual(["Sales", "Marketing", "Design", "Finance"]);
  });
});

describe("Bars on a category axis", () => {
  function Grouped({ stack }: { stack?: string }) {
    const { Chart, XAxis, YAxis, Bar } = useChart(SPEND);
    return (
      <Chart ariaLabel="Budget and actual per cost centre">
        <XAxis value="centre" />
        <YAxis />
        <Bar value="budget" name="Budget" stack={stack} />
        <Bar value="actual" name="Actual" stack={stack} />
        <Tooltip mode="x" />
      </Chart>
    );
  }

  it("stand side by side, both named at their category", async () => {
    const host = await mount(<Grouped />);
    await focusPlot(host);
    await press(host, "Home");
    expect([...host.querySelectorAll(".uc-tooltip-row")].map((r) => r.textContent)).toEqual(["Budget142", "Actual139"]);
  });

  it("stack, with their total", async () => {
    const host = await mount(<Grouped stack="spend" />);
    await focusPlot(host);
    await press(host, "Home");
    expect([...host.querySelectorAll(".uc-tooltip-row")].map((r) => r.textContent)).toEqual(["Budget142", "Actual139", "Total281"]);
  });
});

describe("What DEV says about a category axis", () => {
  const warnings = (warn: { mock: { calls: unknown[][] } }) => warn.mock.calls.map((c) => String(c[0]));

  it("names a series that brings the same category twice", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    function Twice() {
      const { Chart, XAxis, YAxis, Bar } = useChart([SPEND[0]!, SPEND[1]!, SPEND[0]!]);
      return (
        <Chart ariaLabel="Twice">
          <XAxis value="centre" />
          <YAxis />
          <Bar value="actual" name="Twice over" />
        </Chart>
      );
    }
    await mount(<Twice />);
    expect(warnings(warn).some((m) => m.includes('"Twice over"') && m.includes('"Sales"'))).toBe(true);
  });

  it("names the series whose numbers stand among categories, and does not place them", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    function Mixed() {
      const { Chart, XAxis, YAxis, Bar, Line } = useChart(SPEND);
      return (
        <Chart ariaLabel="Mixed">
          <XAxis<{ centre: string | number | null }> value="centre" />
          <YAxis />
          <Bar value="actual" name="By name" />
          <Line data={[{ centre: 1, actual: 5 }]} value="actual" name="By number" />
          <DataTable />
        </Chart>
      );
    }
    const host = await mount(<Mixed />);
    expect(warnings(warn).some((m) => m.includes('"By number"') && m.includes("number"))).toBe(true);
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    // A series without a point has no column: the number found no place.
    expect(tableRows(host)).toEqual(["Sales|139", "Marketing|78", "Design|51"]);
  });

  it("names the series whose categories stand among numbers", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    function MixedTheOtherWay() {
      const { Chart, XAxis, YAxis, Line } = useChart([{ at: 1, v: 5 }]);
      return (
        <Chart ariaLabel="Mixed">
          <XAxis<{ at: string | number }> value="at" />
          <YAxis />
          <Line value="v" name="At a number" />
          <Line data={[{ at: "one", v: 5 }]} value="v" name="At a name" />
        </Chart>
      );
    }
    await mount(<MixedTheOtherWay />);
    expect(warnings(warn).some((m) => m.includes('"At a name"') && m.includes("categor"))).toBe(true);
  });

  it("says that tickFormat, ticks and tickCount do not apply", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    function Formatted() {
      const { Chart, XAxis, YAxis, Bar } = useChart(SPEND);
      return (
        <Chart ariaLabel="Formatted">
          <XAxis id="named" value="centre" tickFormat={(v) => `#${v}`} />
          <YAxis />
          <Bar value="actual" name="Actual" xAxisId="named" />
        </Chart>
      );
    }
    const host = await mount(<Formatted />);
    expect(ticks(host)).toEqual(["Sales", "Marketing", "Design"]);
    expect(warnings(warn).some((m) => m.includes('"named"') && m.includes("tickFormat"))).toBe(true);
  });
});

/* Zoom keeps at least three steps in view, so it needs more than three places. */
const SHIFTS = Array.from({ length: 8 }, (_, i) => ({ shift: `Shift ${i + 1}`, pieces: 100 + i }));

describe("Zoom on a category axis", () => {
  it("zooms and pans by key, and reports its span in places", async () => {
    const views: ChartView[] = [];
    function Zoomable() {
      const { Chart, XAxis, YAxis, Bar } = useChart(SHIFTS, { onViewChange: (view) => views.push(view) });
      return (
        <Chart ariaLabel="Zoomable">
          <XAxis value="shift" zoomable />
          <YAxis />
          <Bar value="pieces" name="Pieces" />
          <Tooltip />
        </Chart>
      );
    }
    const host = await mount(<Zoomable />);
    await focusPlot(host);
    await press(host, "+");
    const span = views.at(-1)?.domains?.x;
    expect(span).toBeDefined();
    const [from, to] = span as readonly [number, number];
    // Inside the eight places and their half steps, and narrower than them.
    expect(from).toBeGreaterThan(-0.5);
    expect(to).toBeLessThan(7.5);
    await press(host, "ArrowRight", { shiftKey: true });
    expect((views.at(-1)?.domains?.x as readonly [number, number])[0]).toBeGreaterThan(from);
  });
});
