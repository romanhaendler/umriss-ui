// @vitest-environment jsdom

/* Monthly bars on Date rows: the x axis labels the months, one under each bar;
   a line on the same rows keeps its own ticks; explicit `ticks` win. */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type ReactNode } from "react";
import { useChart } from "../src";
import { renderChart, sizePlot } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot(1000));
afterEach(() => {
  unmount?.();
  unmount = null;
});

const rows = Array.from({ length: 12 }, (_, m) => ({ month: new Date(2026, m, 1), sales: 10 + m }));
const ticks = (host: HTMLElement) => [...host.querySelectorAll(".uc-axis-x .uc-tick")].map((t) => t.textContent);

async function labels(element: ReactNode) {
  const r = await renderChart(element);
  unmount = r.unmount;
  return ticks(r.host);
}

function Sales({ kind, tickValues }: { kind: "bar" | "line"; tickValues?: number[] }) {
  const { Chart, XAxis, YAxis, Bar, Line } = useChart<(typeof rows)[number]>(rows);
  return (
    <Chart aria-label="Sales per month">
      <XAxis value="month" ticks={tickValues} tickCount={24} />
      <YAxis />
      {kind === "bar" ? <Bar value="sales" name="Sales" /> : <Line value="sales" name="Sales" />}
    </Chart>
  );
}

describe("Monthly bars on a time axis", () => {
  it("are labelled by month, one under each bar", async () => {
    const shown = await labels(<Sales kind="bar" />);
    // The margin of half a bar to either side may carry a tick of its own.
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    expect(shown.slice(1, 13).map((t) => t?.slice(0, 3))).toEqual(months);
  });

  it("do not change what a line alone shows", async () => {
    const shown = await labels(<Sales kind="line" />);
    expect(shown).not.toEqual(await labels(<Sales kind="bar" />));
  });

  it("give way to explicit ticks", async () => {
    const shown = await labels(<Sales kind="bar" tickValues={[rows[0]!.month.getTime(), rows[6]!.month.getTime()]} />);
    expect(shown).toHaveLength(2);
  });
});
