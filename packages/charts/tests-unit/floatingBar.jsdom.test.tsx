// @vitest-environment jsdom

/* A floating bar and an area corridor as a reader meets them: the tooltip and
   the readout write "baseline – value", a render's hit carries the baseline
   (and a stacked bar's does not), and the waterfall example's table names each
   step by both edges and no helper. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { Tooltip, useChart } from "../src";
import type { TooltipPoint } from "../src";
import Waterfall from "../demo/examples/Bar/08-waterfall";
import { focusPlot, frame, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

interface Row {
  t: number;
  from: number;
  to: number;
}

const data: Row[] = [{ t: 0, from: 1200, to: 1450 }];

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

let seen: readonly TooltipPoint[] = [];

function Kinds({ kind, stack }: { kind: "bar" | "area"; stack?: string }) {
  const { Chart, XAxis, YAxis, Bar, Area } = useChart(data);
  const Kind = kind === "bar" ? Bar : Area;
  return (
    <Chart aria-label="Two edges">
      <XAxis value="t" />
      <YAxis />
      <Kind value="to" baseline="from" name="Range" stack={stack} />
      <Tooltip
        render={(hit) => {
          seen = hit.points;
          return null;
        }}
      />
    </Chart>
  );
}

function Plain({ kind }: { kind: "bar" | "area" }) {
  const { Chart, XAxis, YAxis, Bar, Area } = useChart(data);
  const Kind = kind === "bar" ? Bar : Area;
  return (
    <Chart aria-label="Two edges">
      <XAxis value="t" />
      <YAxis />
      <Kind value="to" baseline="from" name="Range" />
      <Tooltip />
    </Chart>
  );
}

describe.each(["bar", "area"] as const)("A %s with a baseline of its own", (kind) => {
  it("is written 'baseline – value' by the tooltip and the readout", async () => {
    const host = await mount(<Plain kind={kind} />);
    await focusPlot(host);
    await press(host, "ArrowLeft");
    expect(tooltipOf(host)).toContain("1,200 – 1,450");
    await rest(200);
    expect(readout(host)).toContain("Range 1,200 – 1,450");
  });

  it("carries its baseline in the hit", async () => {
    const host = await mount(<Kinds kind={kind} />);
    await focusPlot(host);
    await press(host, "ArrowLeft");
    expect(seen.map((p) => [p.yValue, p.baseline])).toEqual([[1450, 1200]]);
  });
});

describe("A stacked bar", () => {
  it("ignores its own baseline in the hit and the text", async () => {
    const host = await mount(<Kinds kind="bar" stack="s" />);
    await focusPlot(host);
    await press(host, "ArrowLeft");
    expect(seen.map((p) => [p.yValue, p.baseline])).toEqual([[1450, undefined]]);
  });
});

describe("The waterfall example", () => {
  it("lists one row per step with both edges and names no helper", async () => {
    const host = await mount(<Waterfall />);
    await act(async () => (host.querySelector(".uc-data-key") as HTMLButtonElement).click());
    await frame();
    const rows = [...host.querySelectorAll(".uc-data-panel tr")].map((tr) =>
      [...tr.querySelectorAll("th, td")].map((c) => c.textContent).join("|"),
    );
    expect(rows).toEqual([
      "Step|Revenue",
      "Start|0 – 1,200",
      "New customers|1,200 – 1,510",
      "Upsell|1,510 – 1,650",
      "Churn|1,650 – 1,430",
      "Price cut|1,430 – 1,340",
      "Renewals|1,340 – 1,520",
      "End|0 – 1,520",
    ]);
  });
});
