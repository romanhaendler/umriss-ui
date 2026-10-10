// @vitest-environment jsdom

/* chart-rows-as-they-come 03, ADR-0051: categories on y. A y axis reads no
   value; it becomes a category axis through what stands on it - a matrix
   whose rows are named by the data, a state band that names its lane. The
   first category stands at the top. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { DataTable, Tooltip, useChart } from "../src";
import { frame, plotOf, renderChart, sizePlot, tooltipOf } from "./renderChart";

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

const px = (value: string) => Number.parseFloat(value);
const tableRows = (host: HTMLElement) =>
  [...host.querySelectorAll(".uc-data-panel tbody tr")].map((tr) => [...tr.querySelectorAll("th, td")].map((c) => c.textContent).join("|"));

/** The ticks of the first axis of an orientation, with where they stand in
    the chart: top to bottom on y, left to right on x. */
function ticksOf(host: HTMLElement, orientation: "x" | "y", axisId: string = orientation): { label: string; at: number }[] {
  const band = host.querySelector<HTMLElement>(`.uc-axis-${orientation}[data-axis="${axisId}"]`);
  if (band === null) return [];
  const origin = px(orientation === "y" ? band.style.top : band.style.left);
  return [...band.querySelectorAll<HTMLElement>(".uc-tick")]
    .map((tick) => ({ label: tick.textContent ?? "", at: origin + px(orientation === "y" ? tick.style.top : tick.style.left) }))
    .sort((a, b) => a.at - b.at);
}

const labels = (host: HTMLElement, orientation: "x" | "y", axisId: string = orientation) => ticksOf(host, orientation, axisId).map((t) => t.label);

/** The pointer at a place in the chart (jsdom knows no layout: the event says
    where it is). */
async function pointAt(host: HTMLElement, x: number, y: number): Promise<void> {
  const event = new MouseEvent("pointermove", { bubbles: true });
  Object.defineProperty(event, "offsetX", { value: x });
  Object.defineProperty(event, "offsetY", { value: y });
  await act(async () => {
    plotOf(host).dispatchEvent(event);
  });
  await frame();
}

const at = (host: HTMLElement, orientation: "x" | "y", label: string, axisId: string = orientation) =>
  ticksOf(host, orientation, axisId).find((t) => t.label === label)?.at ?? Number.NaN;

interface Cell {
  hour: number;
  service: string;
  success: number;
}

const CELLS: Cell[] = [
  { hour: 0, service: "Checkout", success: 99.9 },
  { hour: 1, service: "Checkout", success: 99.1 },
  { hour: 0, service: "Billing", success: 98.2 },
  { hour: 1, service: "Billing", success: 97.5 },
  { hour: 0, service: "Search", success: 99.5 },
  { hour: 1, service: "Search", success: 99.6 },
];

function Cells({ categories, label }: { categories?: readonly string[]; label?: (category: string) => string }) {
  const { Chart, XAxis, YAxis, Matrix } = useChart(CELLS);
  return (
    <Chart ariaLabel="Successful requests per service and hour">
      <XAxis value="hour" ticks={[0, 1]} tickFormat={(v) => `${v}:00`} />
      <YAxis categories={categories} categoryLabel={label} />
      <Matrix value="service" level="success" name="Success" />
      <Tooltip mode="nearest" />
      <DataTable />
    </Chart>
  );
}

describe("A matrix whose rows are named by the data", () => {
  it("has a tick per category on y, the first at the top", async () => {
    const host = await mount(<Cells />);
    expect(labels(host, "y")).toEqual(["Checkout", "Billing", "Search"]);
  });

  it("names the row in the tooltip, beside the level", async () => {
    const host = await mount(<Cells />);
    await pointAt(host, at(host, "x", "1:00"), at(host, "y", "Billing"));
    expect(tooltipOf(host)).toContain("Billing");
    expect(tooltipOf(host)).toContain("97.5");
  });

  it("writes the row's category in the data table", async () => {
    const host = await mount(<Cells />);
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    expect(tableRows(host)).toContain("1:00|Billing|97.5");
    expect(tableRows(host)).toHaveLength(6);
  });

  it("takes the y axis' own list as the order, an empty place kept", async () => {
    const host = await mount(<Cells categories={["Search", "Checkout", "Payments", "Billing"]} />);
    expect(labels(host, "y")).toEqual(["Search", "Checkout", "Payments", "Billing"]);
  });

  it("writes the y axis' label for a category", async () => {
    const host = await mount(<Cells label={(service) => service.toUpperCase()} />);
    expect(labels(host, "y")).toEqual(["CHECKOUT", "BILLING", "SEARCH"]);
    await pointAt(host, at(host, "x", "0:00"), at(host, "y", "SEARCH"));
    expect(tooltipOf(host)).toContain("SEARCH");
  });
});

const STATES = [
  { label: "Idle", color: "#999999" },
  { label: "Driving", color: "#009900" },
];
const VAN_A = [
  { t: 0, state: 0 },
  { t: 10, state: 1 },
];
const VAN_B = [
  { t: 0, state: 1 },
  { t: 10, state: 0 },
];
const CHARGE = [
  { t: 0, percent: 80 },
  { t: 10, percent: 60 },
  { t: 20, percent: 40 },
];

function Fleet({ categories, withCharge }: { categories?: readonly string[]; withCharge?: boolean }) {
  const { Chart, XAxis, YAxis, StateBand, Line } = useChart(CHARGE);
  return (
    <Chart ariaLabel="The states of two vans">
      <XAxis value="t" ticks={[0, 5, 10, 15, 20]} domain={[0, 20]} tickFormat={(v) => `t${v}`} />
      <YAxis categories={categories} />
      {withCharge === true && <YAxis id="charge" position="right" domain={[0, 100]} />}
      <StateBand data={VAN_A} value="state" states={STATES} lane="Van A" name="Van A" />
      <StateBand data={VAN_B} value="state" states={STATES} lane="Van B" name="Van B" />
      {withCharge === true && <Line value="percent" yAxisId="charge" name="Charge" />}
      <Tooltip mode="nearest" />
    </Chart>
  );
}

describe("A state band that names its lane", () => {
  it("gives the y axis a category per lane, in the bands' order from the top", async () => {
    const host = await mount(<Fleet />);
    expect(labels(host, "y")).toEqual(["Van A", "Van B"]);
  });

  it("stands in its category's place: the pointer there meets that band and its state", async () => {
    const host = await mount(<Fleet />);
    await pointAt(host, at(host, "x", "t5"), at(host, "y", "Van B"));
    expect(tooltipOf(host)).toContain("Van B");
    expect(tooltipOf(host)).toContain("Driving");
    await pointAt(host, at(host, "x", "t5"), at(host, "y", "Van A"));
    expect(tooltipOf(host)).toContain("Van A");
    expect(tooltipOf(host)).toContain("Idle");
  });

  it("is as wide as a bar: between two lanes the pointer meets neither", async () => {
    const host = await mount(<Fleet />);
    const between = (at(host, "y", "Van A") + at(host, "y", "Van B")) / 2;
    await pointAt(host, at(host, "x", "t5"), between);
    expect(tooltipOf(host)).toBe("");
  });

  it("follows the y axis' own list", async () => {
    const host = await mount(<Fleet categories={["Van B", "Van C", "Van A"]} />);
    expect(labels(host, "y")).toEqual(["Van B", "Van C", "Van A"]);
    await pointAt(host, at(host, "x", "t5"), at(host, "y", "Van A"));
    expect(tooltipOf(host)).toContain("Van A");
  });

  it("shares a chart with a line on a numeric y axis", async () => {
    const host = await mount(<Fleet withCharge />);
    expect(labels(host, "y")).toEqual(["Van A", "Van B"]);
    expect(labels(host, "y", "charge")).toContain("100");
  });
});
