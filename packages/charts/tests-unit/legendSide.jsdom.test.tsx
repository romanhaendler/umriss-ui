// @vitest-environment jsdom

/* A legend beside the plot: it carries its side's class, toggles and opens
   "Show data" as a legend above does, and where the chart is narrower than
   480 px it stands above the plot, as `top`. */

import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable, Legend, useChart } from "../src";
import { frame, renderChart } from "./renderChart";

const data = [
  { t: 0, a: 1, b: 50 },
  { t: 1, a: 2, b: 60 },
];

function Side({ placement }: { placement: "left" | "right" }) {
  const { Chart, XAxis, YAxis, Line } = useChart(data);
  return (
    <Chart aria-label="Side legend" height={200}>
      <XAxis value="t" />
      <YAxis />
      <Line value="a" name="A" />
      <Line value="b" name="B" />
      <Legend placement={placement} />
      <DataTable />
    </Chart>
  );
}

/** A chart `width` px wide: the root has it, the plot keeps its own size. */
function chartOf(width: number): void {
  const rect = (w: number, h: number) => ({ x: 0, y: 0, top: 0, left: 0, right: w, bottom: h, width: w, height: h, toJSON: () => ({}) }) as DOMRect;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains("uc-root")) return rect(width, 200);
    return this.classList.contains("uc-plot") ? rect(400, 200) : rect(0, 0);
  });
}

let unmount: (() => void) | null = null;
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

async function render(placement: "left" | "right", width: number): Promise<HTMLElement> {
  chartOf(width);
  const r = await renderChart(<Side placement={placement} />);
  unmount = r.unmount;
  return r.host;
}

const legend = (host: HTMLElement) => host.querySelector(".uc-legend") as HTMLElement;

describe("A side legend", () => {
  it.each(["left", "right"] as const)("carries the %s layout", async (side) => {
    const host = await render(side, 600);
    expect(legend(host).className).toBe(`uc-legend uc-legend-${side}`);
  });

  it("toggles a series and opens Show data from the column", async () => {
    const host = await render("right", 600);
    const [a] = host.querySelectorAll<HTMLButtonElement>("button.uc-legend-item");
    await act(async () => a?.click());
    await frame();
    expect(a?.getAttribute("aria-pressed")).toBe("false");
    const key = legend(host).querySelector<HTMLButtonElement>(".uc-data-key");
    expect(key?.getAttribute("aria-expanded")).toBe("false");
    await act(async () => key?.click());
    await frame();
    expect(key?.getAttribute("aria-expanded")).toBe("true");
  });

  it.each(["left", "right"] as const)("stands above the plot, as top, in a chart under 480 px (%s)", async (side) => {
    const host = await render(side, 479);
    expect(legend(host).className).toBe("uc-legend uc-legend-top");
  });
});
