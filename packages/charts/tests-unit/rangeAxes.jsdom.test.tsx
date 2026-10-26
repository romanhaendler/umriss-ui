// @vitest-environment jsdom

/* A range is reported in the values of the axis it was made on (ADR-0074):
   categories as the strings the rows hold, a time axis in milliseconds, a
   calendar axis in wall-clock instants - by pointer and by key alike. */

import { act, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip, useChart, type ChartRange } from "../src";
import { focusPlot, frame, plotOf, press, renderChart, sizePlot } from "./renderChart";

const DAY = 86_400_000;
const MON = Date.UTC(2024, 0, 1); // a Monday
const CALENDAR = [
  { from: MON, to: MON + 5 * DAY }, // Mon-Fri
  { from: MON + 7 * DAY, to: MON + 12 * DAY }, // the next Mon-Fri
];

const NAMES = ["Sales", "Marketing", "Design", "Ops"];
const SPEND = [139, 78, 51, 40].map((actual, i) => ({ centre: NAMES[i] as string, actual }));
const TIMED = [0, 1, 2].map((i) => ({ t: MON + i * DAY, a: i + 1 }));
const WORKED = [0, 4, 7, 11].map((d) => ({ t: MON + d * DAY + DAY / 2, a: d }));

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

const pointer = (type: string, x: number) => {
  const e = new MouseEvent(type, { bubbles: true, clientX: x, clientY: 150, buttons: type === "pointerup" ? 0 : 1 });
  Object.defineProperty(e, "offsetX", { value: x });
  Object.defineProperty(e, "offsetY", { value: 150 });
  Object.defineProperty(e, "pointerId", { value: 1 });
  Object.defineProperty(e, "pointerType", { value: "mouse" });
  return e;
};
async function drag(host: HTMLElement, a: number, b: number) {
  for (const e of [pointer("pointerdown", a), pointer("pointermove", (a + b) / 2), pointer("pointermove", b), pointer("pointerup", b)])
    await act(async () => void plotOf(host).dispatchEvent(e));
  await frame();
}

function Bars({ onRange, categories }: { onRange: (r: ChartRange<string>) => void; categories?: string[] }) {
  const { Chart, XAxis, YAxis, Bar } = useChart(SPEND, { onRange });
  return (
    <Chart aria-label="Spend">
      <XAxis value="centre" categories={categories} />
      <YAxis />
      <Bar value="actual" name="Actual" />
      <Tooltip mode="x" />
    </Chart>
  );
}

function Timed({ rows, calendar, onRange }: { rows: typeof TIMED; calendar?: typeof CALENDAR; onRange: (r: ChartRange) => void }) {
  const { Chart, XAxis, YAxis, Line } = useChart(rows, { onRange });
  return (
    <Chart aria-label="Timed">
      <XAxis value="t" time calendar={calendar} />
      <YAxis />
      <Line value="a" name="A" />
      <Tooltip />
    </Chart>
  );
}

async function mount(element: ReactNode) {
  const r = await renderChart(element);
  unmount = r.unmount;
  return r.host;
}

describe("a category axis", () => {
  it("reports the first and the last category a drag touches, in the order of the axis", async () => {
    const onRange = vi.fn();
    const host = await mount(<Bars onRange={onRange} />);
    await drag(host, 20, 390);
    expect(onRange.mock.calls[0]?.[0]).toMatchObject({ from: "Sales", to: "Ops" });
  });

  it("follows the order of `categories`", async () => {
    const onRange = vi.fn();
    const host = await mount(<Bars onRange={onRange} categories={["Ops", "Design", "Marketing", "Sales"]} />);
    await drag(host, 20, 390);
    expect(onRange.mock.calls[0]?.[0]).toMatchObject({ from: "Ops", to: "Sales" });
  });

  it("reports one category twice for a drag inside one place", async () => {
    const onRange = vi.fn();
    const host = await mount(<Bars onRange={onRange} />);
    await drag(host, 60, 70);
    const r = onRange.mock.calls[0]?.[0];
    expect(NAMES).toContain(r.from);
    expect(r.to).toBe(r.from);
  });

  it("reports the Active point's category by key", async () => {
    const onRange = vi.fn();
    const host = await mount(<Bars onRange={onRange} />);
    await focusPlot(host);
    await press(host, " ");
    await press(host, " ");
    const r = onRange.mock.calls[0]?.[0];
    expect(NAMES).toContain(r.from);
    expect(r.to).toBe(r.from);
  });
});

describe("a time axis", () => {
  it("reports milliseconds", async () => {
    const onRange = vi.fn();
    const host = await mount(<Timed rows={TIMED} onRange={onRange} />);
    await drag(host, 100, 300);
    const r = onRange.mock.calls[0]?.[0];
    expect(r.from).toBeGreaterThan(MON - DAY);
    expect(r.to).toBeLessThan(MON + 3 * DAY);
  });
});

describe("a calendar axis", () => {
  it("reports wall-clock instants across a weekend", async () => {
    const onRange = vi.fn();
    const host = await mount(<Timed rows={WORKED} calendar={CALENDAR} onRange={onRange} />);
    await drag(host, 1, 399);
    const r = onRange.mock.calls[0]?.[0];
    expect(r.from).toBeGreaterThanOrEqual(MON);
    // 10 working days span 12 wall-clock days; the working time is 10 days
    expect(r.to - r.from).toBeGreaterThan(10.5 * DAY);
  });

  it("reports wall-clock by key", async () => {
    const onRange = vi.fn();
    const host = await mount(<Timed rows={WORKED} calendar={CALENDAR} onRange={onRange} />);
    await focusPlot(host);
    await press(host, " ");
    await press(host, " ");
    // the newest point is day 11 at noon: working time 9.5 days, wall clock 11.5
    expect(onRange.mock.calls[0]?.[0].from).toBeGreaterThan(MON + 10 * DAY);
  });
});
