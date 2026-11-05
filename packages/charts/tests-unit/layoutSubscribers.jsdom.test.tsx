// @vitest-environment jsdom

/* What re-renders on a data update: the legend, the HTML axes and the data
   table read the part of the layout they show, so a reading that changes
   neither their output nor their inputs renders none of them again. Counted
   with the Profiler, not timed. */

import { Profiler, memo, type ReactNode } from "react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataTable, Legend, useChart } from "../src";
import { AxesHtml } from "../src/AxesHtml";
import { useChartScene } from "../src/context";
import { frame, renderChart, sizePlot } from "./renderChart";

interface Row {
  t: number;
  a: number;
}

const rows = (n: number): Row[] => Array.from({ length: n }, (_, t) => ({ t, a: 50 + 40 * Math.sin(t / 5) }));

const renders: Record<string, number> = { legend: 0, axes: 0, table: 0 };
const count = (id: string) => () => {
  renders[id] = (renders[id] ?? 0) + 1;
};

/* Built once: React skips an element it is handed again unchanged, so only a
   change of the store renders what stands inside. */
const AxesProbe = memo(function AxesProbe() {
  const scene = useChartScene("AxesProbe");
  return scene === null ? null : (
    <Profiler id="axes" onRender={count("axes")}>
      <AxesHtml scene={scene} empty={null} silhouette={null} />
    </Profiler>
  );
});
const probes: ReactNode = (
  <>
    <AxesProbe />
    <Profiler id="legend" onRender={count("legend")}>
      <Legend />
    </Profiler>
    <Profiler id="table" onRender={count("table")}>
      <DataTable />
    </Profiler>
  </>
);

function Page({ data, yMax }: { data: Row[]; yMax: number }) {
  const { Chart, XAxis, YAxis, Line } = useChart(data);
  return (
    <Chart aria-label="Probes" height={200}>
      <XAxis value="t" domain={[0, 100]} />
      <YAxis domain={[0, yMax]} />
      <Line value="a" name="A" />
      {probes}
    </Chart>
  );
}

let unmount: (() => void) | null = null;
beforeEach(() => {
  sizePlot();
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function mount(): Promise<{ update: (data: Row[], yMax?: number) => Promise<Record<string, number>>; host: HTMLElement }> {
  const r = await renderChart(<Page data={rows(20)} yMax={100} />);
  unmount = r.unmount;
  return {
    host: r.host,
    update: async (data, yMax = 100) => {
      const before = { ...renders };
      await r.rerender(<Page data={data} yMax={yMax} />);
      return Object.fromEntries(Object.keys(renders).map((k) => [k, (renders[k] ?? 0) - (before[k] ?? 0)]));
    },
  };
}

describe("Subscribers to the layout", () => {
  it("leave the legend, the axes and a closed data table alone when a reading changes nothing they show", async () => {
    const { update } = await mount();
    await update(rows(21));
    const delta = await update(rows(22));
    expect(delta).toEqual({ legend: 0, axes: 0, table: 0 });
  });

  it("render the axes again when their ticks change", async () => {
    const { update } = await mount();
    const delta = await update(rows(21), 200);
    expect(delta.axes).toBeGreaterThan(0);
    expect(delta.legend).toBe(0);
  });

  it("render an open data table on a data update", async () => {
    const { host, update } = await mount();
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    const delta = await update(rows(21));
    expect(delta.table).toBeGreaterThan(0);
  });
});
