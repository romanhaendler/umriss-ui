// @vitest-environment jsdom

/* 'Show all' (component-view 04): once a zoomable x axis shows less than its
   own domain, the chart offers a control of its own that brings every zoomed
   axis back. A tab stop beside the plot, not in its application role; gone
   once nothing is zoomed, handing its focus to the plot. */

import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip, useChart, type ChartParts, type ChartView } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import { focusPlot, frame, plotOf, press, renderChart, sizePlot } from "./renderChart";

interface Row {
  t: number;
  a: number;
}

const data: Row[] = Array.from({ length: 11 }, (_, t) => ({ t: t * 10, a: t }));

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

interface Props {
  zoomable?: boolean;
  german?: boolean;
  initialView?: ChartView;
  onViewChange?: (view: ChartView) => void;
  seen?: (parts: ChartParts<Row>) => void;
}

/** Two zoomable x axes, "x" and "late", each with a line. */
function Zoomable({ zoomable = true, german = false, initialView, onViewChange, seen }: Props) {
  const parts = useChart(data, { initialView, onViewChange });
  seen?.(parts);
  const { Chart, XAxis, YAxis, Line } = parts;
  return (
    <Chart ariaLabel="Zoomable" wording={german ? GERMAN_CHARTS_WORDING : undefined}>
      <XAxis value="t" domain={[0, 100]} zoomable={zoomable} />
      <XAxis id="late" value="t" domain={[0, 100]} position="top" zoomable={zoomable} />
      <YAxis />
      <Line value="a" name="A" />
      <Line value="a" name="B" xAxisId="late" />
      <Tooltip />
    </Chart>
  );
}

async function chart(props: Props = {}): Promise<{ host: HTMLElement; parts: () => ChartParts<Row> }> {
  let parts: ChartParts<Row> | null = null;
  const r = await renderChart(<Zoomable {...props} seen={(p) => (parts = p)} />);
  unmount = r.unmount;
  return { host: r.host, parts: () => parts! };
}

const showAllOf = (host: HTMLElement) => host.querySelector<HTMLButtonElement>(".uc-show-all");

async function setDomain(parts: ChartParts<Row>, id: string, span: [number, number] | null): Promise<void> {
  await act(async () => parts.setDomain(id, span));
  await frame();
}

describe("Show all", () => {
  it("is not there while nothing is zoomed", async () => {
    const { host } = await chart();
    expect(showAllOf(host)).toBeNull();
  });

  it("appears once setDomain zooms an axis, as a button beside the plot", async () => {
    const { host, parts } = await chart();
    await setDomain(parts(), "x", [20, 60]);
    const button = showAllOf(host);
    expect(button?.tagName).toBe("BUTTON");
    expect(button?.textContent).toBe("Show all");
    expect(plotOf(host).contains(button)).toBe(false);
  });

  it("appears on a zoom by key", async () => {
    const { host } = await chart();
    await focusPlot(host);
    await press(host, "+");
    expect(showAllOf(host)).not.toBeNull();
  });

  it("appears for a view handed in that zooms", async () => {
    const { host } = await chart({ initialView: { domains: { late: [10, 30] } } });
    expect(showAllOf(host)).not.toBeNull();
  });

  it("speaks German from the wording", async () => {
    const { host, parts } = await chart({ german: true });
    await setDomain(parts(), "x", [20, 60]);
    expect(showAllOf(host)?.textContent).toBe("Alles zeigen");
  });

  it("brings every zoomed axis back with one click, reported once, and goes", async () => {
    const views: ChartView[] = [];
    const { host, parts } = await chart({ onViewChange: (v) => views.push(v) });
    await setDomain(parts(), "x", [20, 60]);
    await setDomain(parts(), "late", [0, 50]);
    views.length = 0;
    await act(async () => showAllOf(host)!.click());
    await frame();
    expect(parts().domains).toEqual({});
    expect(views).toEqual([{}]);
    expect(showAllOf(host)).toBeNull();
  });

  it("hands its focus to the plot when it goes", async () => {
    const { host, parts } = await chart();
    await setDomain(parts(), "x", [20, 60]);
    await act(async () => showAllOf(host)!.focus());
    await act(async () => showAllOf(host)!.click());
    await frame();
    expect(document.activeElement).toBe(plotOf(host));
  });

  it("hands its focus to the plot also where the zoom goes another way", async () => {
    const { host, parts } = await chart();
    await setDomain(parts(), "x", [20, 60]);
    await act(async () => showAllOf(host)!.focus());
    await setDomain(parts(), "x", null);
    expect(showAllOf(host)).toBeNull();
    expect(document.activeElement).toBe(plotOf(host));
  });

  it("leaves the focus alone where it was elsewhere", async () => {
    const { host, parts } = await chart();
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    await setDomain(parts(), "x", [20, 60]);
    outside.focus();
    await act(async () => showAllOf(host)!.click());
    await frame();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it("is never there on a chart without a zoomable axis", async () => {
    const { host, parts } = await chart({ zoomable: false, initialView: { domains: { x: [20, 60] } } });
    expect(showAllOf(host)).toBeNull();
    await setDomain(parts(), "x", [20, 60]);
    expect(showAllOf(host)).toBeNull();
  });
});
