// @vitest-environment jsdom

/* component-view 02 (ADR-0047): the legend hides and shows series through
   the chart's view, without a prop or a state in the application. Every entry
   of a named series is a button; a click toggles at once and is reported
   whole. A hidden entry stays, drawn back; a hidden series leaves the extent
   and the walk. Nothing hides every series: that shows all instead. */

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Legend, Tooltip, useChart, type ChartParts, type ChartView } from "../src";
import { focusPlot, frame, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

interface Row {
  t: number;
  a: number;
  b: number;
}

const data: Row[] = [
  { t: 0, a: 1, b: 50 },
  { t: 1, a: 2, b: 60 },
];

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

interface Props {
  initialView?: ChartView;
  onViewChange?: (view: ChartView) => void;
  seen?: (parts: ChartParts<Row>) => void;
  unnamed?: boolean;
}

function Toggled({ initialView, onViewChange, seen, unnamed }: Props) {
  const parts = useChart(data, { initialView, onViewChange });
  seen?.(parts);
  const { Chart, XAxis, YAxis, Line } = parts;
  return (
    <Chart ariaLabel="Legend toggle" height={200}>
      <XAxis value="t" />
      <YAxis />
      <Line value="a" name="A" />
      <Line value="b" name="B" />
      {unnamed === true && <Line value={(row) => row.a + 1} />}
      <Legend />
      <Tooltip mode="x" />
    </Chart>
  );
}

async function render(props: Props = {}): Promise<HTMLElement> {
  const r = await renderChart(<Toggled {...props} />);
  unmount = r.unmount;
  return r.host;
}

const buttons = (host: HTMLElement) => [...host.querySelectorAll<HTMLButtonElement>("button.uc-legend-item")];
const pressed = (host: HTMLElement) => buttons(host).map((b) => b.getAttribute("aria-pressed"));
const ticks = (host: HTMLElement) => [...host.querySelectorAll(".uc-axis-y .uc-tick")].map((t) => t.textContent);

async function click(button: HTMLButtonElement | undefined): Promise<void> {
  await act(async () => button?.click());
  await frame();
}

describe("The legend toggles by default", () => {
  it("makes every entry of a named series a button", async () => {
    const host = await render({ unnamed: true });
    expect(host.querySelectorAll(".uc-legend-item")).toHaveLength(3);
    expect(pressed(host)).toEqual(["true", "true"]);
  });

  it("hides a series at once on a click, through the view, and shows it again", async () => {
    const views: ChartView[] = [];
    const host = await render({ onViewChange: (v) => views.push(v) });
    await click(buttons(host)[1]);
    expect(pressed(host)).toEqual(["true", "false"]);
    expect(host.querySelectorAll(".uc-legend-item")[1]?.hasAttribute("data-hidden")).toBe(true);
    expect(views).toEqual([{ hidden: ["B"] }]);
    await click(buttons(host)[1]);
    expect(pressed(host)).toEqual(["true", "true"]);
    expect(views.at(-1)).toEqual({});
  });

  it("shows all instead of hiding the last series visible", async () => {
    const host = await render({ initialView: { hidden: ["A"] } });
    await click(buttons(host)[1]);
    expect(pressed(host)).toEqual(["true", "true"]);
  });
});

describe("Hidden series on the hook", () => {
  it("starts hidden from initialView, an unknown name falling out", async () => {
    let parts: ChartParts<Row> | null = null;
    const host = await render({ initialView: { hidden: ["B", "gone"] }, seen: (p) => (parts = p) });
    expect(parts!.hidden).toEqual(["B"]);
    expect(parts!.view).toEqual({ hidden: ["B"] });
    expect(pressed(host)).toEqual(["true", "false"]);
  });

  it("toggles, shows only one and shows all again", async () => {
    let parts: ChartParts<Row> | null = null;
    const views: ChartView[] = [];
    await render({ onViewChange: (v) => views.push(v), seen: (p) => (parts = p) });
    await act(async () => parts!.toggleSeries("A"));
    expect(parts!.hidden).toEqual(["A"]);
    await act(async () => parts!.showOnly("A"));
    expect(parts!.hidden).toEqual(["B"]);
    await act(async () => parts!.toggleSeries("A"));
    expect(parts!.hidden).toEqual([]);
    await act(async () => parts!.showOnly("A"));
    await act(async () => parts!.showAllSeries());
    expect(parts!.hidden).toEqual([]);
    expect(views).toEqual([{ hidden: ["A"] }, { hidden: ["B"] }, {}, { hidden: ["B"] }, {}]);
  });

  it("takes a hidden series out of the extent and the walk", async () => {
    const host = await render({ initialView: { hidden: ["B"] } });
    expect(ticks(host).some((t) => Number(t) >= 50)).toBe(false);
    await focusPlot(host);
    await press(host, "End");
    expect(tooltipOf(host)).toContain("A");
    expect(tooltipOf(host)).not.toContain("B");
  });
});

describe("A state band's entries", () => {
  function Bands({ seen }: { seen?: (parts: ChartParts<Row>) => void }) {
    const parts = useChart(data);
    seen?.(parts);
    const { Chart, XAxis, YAxis, StateBand, Line } = parts;
    const states = [
      { label: "Idle", color: "#888" },
      { label: "Busy", color: "#c00" },
    ];
    return (
      <Chart ariaLabel="Bands" height={200}>
        <XAxis value="t" />
        <YAxis />
        <StateBand value={(row) => row.t} states={states} name="Van" />
        <Line value="a" name="A" />
        <Legend />
      </Chart>
    );
  }

  it("hide the whole band, by its name", async () => {
    let parts: ChartParts<Row> | null = null;
    const r = await renderChart(<Bands seen={(p) => (parts = p)} />);
    unmount = r.unmount;
    await click(buttons(r.host)[1]);
    expect(parts!.hidden).toEqual(["Van"]);
    expect(pressed(r.host)).toEqual(["false", "false", "true"]);
  });
});
