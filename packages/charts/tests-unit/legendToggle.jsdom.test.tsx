// @vitest-environment jsdom

/* component-view 02 (ADR-0047): the legend hides and shows series through
   the chart's view, without a prop or a state in the application. Every entry
   of a named series is a button; a click toggles at once and is reported
   whole. A hidden entry stays, drawn back; a hidden series leaves the extent
   and the walk. Nothing hides every series: that shows all instead. */

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Legend, Tooltip, useChart, type ChartParts, type ChartView, type ChartsWording } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
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
  wording?: ChartsWording;
}

function Toggled({ initialView, onViewChange, seen, unnamed, wording }: Props) {
  const parts = useChart(data, { initialView, onViewChange });
  seen?.(parts);
  const { Chart, XAxis, YAxis, Line } = parts;
  return (
    <Chart ariaLabel="Legend toggle" height={200} wording={wording}>
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

/* component-view 03: a double click, Alt+click and Shift+Enter show only that
   series; on the only visible one, all. A single click stays immediate, so a
   double click arrives as two clicks first: its result does not depend on
   them. Whatever would leave nothing visible shows all, and the live region
   says so. */

/** A click as the browser sends it: `detail` counts the clicks in a row. */
async function clickAs(button: HTMLButtonElement | undefined, init: MouseEventInit = {}): Promise<void> {
  await act(async () => button?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1, ...init })));
  await frame();
}

async function doubleClick(button: HTMLButtonElement | undefined): Promise<void> {
  await clickAs(button, { detail: 1 });
  await clickAs(button, { detail: 2 });
  await act(async () => button?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, detail: 2 })));
  await frame();
}

/** Shift+Enter on an entry; true where the legend took it. */
async function shiftEnter(button: HTMLButtonElement | undefined): Promise<boolean> {
  const event = new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true, cancelable: true });
  await act(async () => button?.dispatchEvent(event));
  await frame();
  return event.defaultPrevented;
}

const live = (host: HTMLElement) => host.querySelector("[aria-live='polite']")?.textContent ?? "";

describe("The legend's gestures", () => {
  it("shows only the series double clicked, whatever its two clicks did", async () => {
    const views: ChartView[] = [];
    const host = await render({ onViewChange: (v) => views.push(v) });
    await doubleClick(buttons(host)[1]);
    expect(pressed(host)).toEqual(["false", "true"]);
    expect(views.at(-1)).toEqual({ hidden: ["A"] });
  });

  it("shows all on a double click of the only series visible", async () => {
    const host = await render({ initialView: { hidden: ["A"] } });
    await doubleClick(buttons(host)[1]);
    expect(pressed(host)).toEqual(["true", "true"]);
  });

  it("shows only the series on Alt+click, and all on the next", async () => {
    const host = await render({ unnamed: true });
    await clickAs(buttons(host)[0], { altKey: true });
    expect(pressed(host)).toEqual(["true", "false"]);
    await clickAs(buttons(host)[0], { altKey: true });
    expect(pressed(host)).toEqual(["true", "true"]);
  });

  it("shows only the series on Shift+Enter, taking the key from the button", async () => {
    const host = await render();
    expect(await shiftEnter(buttons(host)[1])).toBe(true);
    expect(pressed(host)).toEqual(["false", "true"]);
    expect(await shiftEnter(buttons(host)[1])).toBe(true);
    expect(pressed(host)).toEqual(["true", "true"]);
  });

  it("says so in the live region where it shows all instead of nothing", async () => {
    const host = await render({ initialView: { hidden: ["A"] } });
    await click(buttons(host)[1]);
    expect(pressed(host)).toEqual(["true", "true"]);
    expect(live(host)).toBe("Nothing would be left to see, so every series is shown.");
  });

  it("says so for a setter too, in the chart's wording", async () => {
    let parts: ChartParts<Row> | null = null;
    const host = await render({ wording: GERMAN_CHARTS_WORDING, seen: (p) => (parts = p) });
    await act(async () => parts!.showOnly("A"));
    expect(live(host)).toBe("");
    await act(async () => parts!.toggleSeries("A"));
    expect(parts!.hidden).toEqual([]);
    expect(live(host)).toBe("Sonst wäre nichts mehr zu sehen, darum werden alle Serien gezeigt.");
  });

  it("names Shift+Enter in the plot's key help", async () => {
    const host = await render();
    await act(() => new Promise<void>((r) => setTimeout(r, 150)));
    const id = host.querySelector(".uc-plot")?.getAttribute("aria-describedby");
    expect(document.getElementById(id ?? "")?.textContent).toContain("Shift+Enter shows only it");
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

  it("show only the band on a double click, by its name", async () => {
    let parts: ChartParts<Row> | null = null;
    const r = await renderChart(<Bands seen={(p) => (parts = p)} />);
    unmount = r.unmount;
    await doubleClick(buttons(r.host)[0]);
    expect(parts!.hidden).toEqual(["A"]);
  });
});
