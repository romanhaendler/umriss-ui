// @vitest-environment jsdom

/* A bar chart whose largest bar is a round number does not end its value axis
   on it: the axis goes on to the next step, so the bar does not touch the top.
   A line keeps the axis at its maximum. */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useChart } from "../src";
import { renderChart, sizePlot } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot(600));
afterEach(() => {
  unmount?.();
  unmount = null;
});

const rows = [
  { name: "A", v: 40 },
  { name: "B", v: 100 },
];

function Values({ kind }: { kind: "bar" | "line" }) {
  const { Chart, XAxis, YAxis, Bar, Line } = useChart<(typeof rows)[number]>(rows);
  return (
    <Chart aria-label="Values">
      <XAxis value="name" />
      <YAxis />
      {kind === "bar" ? <Bar value="v" name="V" /> : <Line value="v" name="V" />}
    </Chart>
  );
}

async function top(kind: "bar" | "line"): Promise<number> {
  const r = await renderChart(<Values kind={kind} />);
  unmount = r.unmount;
  const labels = [...r.host.querySelectorAll(".uc-axis-y .uc-tick")].map((t) => Number.parseFloat((t.textContent ?? "").replace(/[^\d.-]/g, "")));
  return Math.max(...labels);
}

describe("The value axis of bars", () => {
  it("ends above a maximum that is a round number", async () => {
    expect(await top("bar")).toBeGreaterThan(100);
  });

  it("is left to end on the maximum for a line", async () => {
    expect(await top("line")).toBe(100);
  });
});
