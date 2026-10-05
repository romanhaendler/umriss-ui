// @vitest-environment jsdom

/* Zoom and pan through the chart's view (component-view 01, ADR-0047): only
   where the x axis is `zoomable`, by gesture and by key (charts-a11y 04),
   within the zoom limits, reported whole through `onViewChange`, and two
   charts kept in step by handing each other what they report. */

import { act, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip, useChart, type ChartParts, type ChartView, type ZoomLimits } from "../src";
import { focusPlot, frame, plotOf, press as pressOn, renderChart, sizePlot, tooltipOf } from "./renderChart";

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

interface ZoomableProps {
  zoomable?: boolean;
  zoomLimits?: ZoomLimits;
  initialView?: ChartView;
  onViewChange?: (view: ChartView) => void;
  seen?: (parts: ChartParts<Row> & { view: ChartView }) => void;
}

function Zoomable({ zoomable = true, zoomLimits, initialView, onViewChange, seen }: ZoomableProps) {
  const parts = useChart(data, { initialView, onViewChange });
  seen?.(parts);
  const { Chart, XAxis, YAxis, Line } = parts;
  return (
    <Chart ariaLabel="Zoomable">
      <XAxis value="t" domain={[0, 100]} zoomable={zoomable} zoomLimits={zoomLimits} />
      <YAxis />
      <Line value="a" name="A" />
      <Tooltip />
    </Chart>
  );
}

async function chart(props: ZoomableProps = {}): Promise<HTMLElement> {
  const r = await renderChart(<Zoomable {...props} />);
  unmount = r.unmount;
  await focusPlot(r.host);
  return r.host;
}

const press = (host: HTMLElement, key: string, shiftKey = false) => pressOn(host, key, { shiftKey });

/** The span of the lone x axis in the last view reported. */
const lastSpan = (views: ChartView[]) => views.at(-1)?.domains?.x;

async function wheel(host: HTMLElement, init: WheelEventInit): Promise<boolean> {
  const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, ...init });
  await act(async () => {
    plotOf(host).dispatchEvent(event);
  });
  await frame();
  return event.defaultPrevented;
}

describe("Zoom by key", () => {
  it("zooms in and out around the Active point", async () => {
    const views: ChartView[] = [];
    const host = await chart({ onViewChange: (v) => views.push(v), zoomLimits: { min: 1, max: 1000 } });
    // The walk starts at the newest value, 100: the zoom keeps it in place.
    await press(host, "+");
    const [from, to] = lastSpan(views) ?? [0, 0];
    expect(to).toBeCloseTo(100);
    expect(to - from).toBeCloseTo(80);
    // Back at the axis' own domain, the span leaves the view.
    await press(host, "-");
    expect(views.at(-1)).toEqual({});
    await press(host, "-");
    const [from2, to2] = lastSpan(views) ?? [0, 0];
    expect(to2 - from2).toBeCloseTo(125);
  });

  it("pans by a tenth with Shift and the arrows", async () => {
    const views: ChartView[] = [];
    const host = await chart({ onViewChange: (v) => views.push(v) });
    await press(host, "ArrowLeft", true);
    expect(lastSpan(views)?.[0]).toBeCloseTo(-10);
    expect(lastSpan(views)?.[1]).toBeCloseTo(90);
  });

  it("goes back to the axis' own domain with 0", async () => {
    const views: ChartView[] = [];
    const host = await chart({ onViewChange: (v) => views.push(v) });
    await press(host, "ArrowLeft", true);
    await press(host, "0");
    expect(views.at(-1)).toEqual({});
  });

  it("leaves the keys alone where the axis is not zoomable", async () => {
    const onViewChange = vi.fn();
    const host = await chart({ zoomable: false, onViewChange });
    expect(await press(host, "+")).toBe(false);
    expect(await press(host, "ArrowLeft", true)).toBe(false);
    expect(onViewChange).not.toHaveBeenCalled();
  });
});

describe("Zoom by gesture", () => {
  it("zooms with Ctrl and the wheel where the axis is zoomable", async () => {
    const views: ChartView[] = [];
    const host = await chart({ onViewChange: (v) => views.push(v) });
    expect(await wheel(host, { ctrlKey: true, deltaY: -10 })).toBe(true);
    const [from, to] = lastSpan(views) ?? [0, 100];
    expect(to - from).toBeLessThan(100);
  });

  it("leaves the wheel to the page where it is not", async () => {
    const onViewChange = vi.fn();
    const host = await chart({ zoomable: false, onViewChange });
    expect(await wheel(host, { ctrlKey: true, deltaY: -10 })).toBe(false);
    expect(await wheel(host, { shiftKey: true, deltaY: 10 })).toBe(false);
    expect(onViewChange).not.toHaveBeenCalled();
  });
});

describe("Zoom limits", () => {
  it("stops at the narrowest span named", async () => {
    const views: ChartView[] = [];
    const host = await chart({ onViewChange: (v) => views.push(v), zoomLimits: { min: 50, max: 100 } });
    for (let i = 0; i < 6; i++) await press(host, "+");
    const [from, to] = lastSpan(views) ?? [0, 0];
    expect(to - from).toBeCloseTo(50);
  });

  it("stops at three data steps and the data's extent without limits", async () => {
    const views: ChartView[] = [];
    const host = await chart({ onViewChange: (v) => views.push(v) });
    for (let i = 0; i < 12; i++) await press(host, "+");
    const [from, to] = lastSpan(views) ?? [0, 0];
    expect(to - from).toBeCloseTo(30);
    // The data's extent is the axis' own domain here: the default, no span.
    for (let i = 0; i < 12; i++) await press(host, "-");
    expect(views.at(-1)).toEqual({});
  });
});

describe("The view on the hook", () => {
  it("puts a span in view with setDomain, and the whole back with null", async () => {
    let parts: (ChartParts<Row> & { view: ChartView }) | null = null;
    const views: ChartView[] = [];
    await chart({ onViewChange: (v) => views.push(v), seen: (p) => (parts = p) });
    await act(async () => parts?.setDomain("x", [20, 60]));
    await frame();
    expect(parts!.domains).toEqual({ x: [20, 60] });
    expect(views).toEqual([{ domains: { x: [20, 60] } }]);
    await act(async () => parts?.setDomain("x", null));
    await frame();
    expect(parts!.domains).toEqual({});
    expect(views.at(-1)).toEqual({});
  });

  it("starts from initialView without reporting it", async () => {
    const onViewChange = vi.fn();
    const host = await chart({ initialView: { domains: { x: [40, 60] } }, onViewChange });
    await press(host, "End");
    expect(tooltipOf(host)).toContain("60");
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("lets the span of an axis that does not zoom here fall out", async () => {
    let parts: (ChartParts<Row> & { view: ChartView }) | null = null;
    await chart({ initialView: { domains: { x: [40, 60], gone: [1, 2] } }, seen: (p) => (parts = p) });
    expect(parts!.view).toEqual({ domains: { x: [40, 60] } });
  });

  it("takes the start without what falls out of it as where it starts, and reports nothing until the reader acts", async () => {
    const views: ChartView[] = [];
    const host = await chart({
      initialView: { domains: { x: [40, 60], gone: [1, 2] }, hidden: ["nobody"] },
      onViewChange: (v) => views.push(v),
    });
    expect(views).toEqual([]);
    await press(host, "ArrowLeft", true);
    expect(views).toHaveLength(1);
    expect(views[0]?.domains?.x?.[0]).toBeCloseTo(38);
    expect(Object.keys(views[0]?.domains ?? {})).toEqual(["x"]);
    expect(views[0]?.hidden).toBeUndefined();
  });

  it("resets the span of an axis not zoomable at the moment where a view handed in leaves it out", async () => {
    let parts: (ChartParts<Row> & { view: ChartView }) | null = null;
    const seen = (p: ChartParts<Row> & { view: ChartView }) => (parts = p);
    const r = await renderChart(<Zoomable zoomable={false} initialView={{ domains: { x: [40, 60] } }} seen={seen} />);
    unmount = r.unmount;
    expect(parts!.view).toEqual({});
    await r.rerender(<Zoomable zoomable={false} initialView={{}} seen={seen} />);
    await r.rerender(<Zoomable initialView={{}} seen={seen} />);
    expect(parts!.view).toEqual({});
  });
});

describe("Two charts in step", () => {
  function Pair({ log }: { log: { a: ChartView[]; b: ChartView[] } }) {
    const [shared, setShared] = useState<ChartView>({});
    return (
      <>
        <Zoomable initialView={shared} onViewChange={(v) => (log.a.push(v), setShared(v))} />
        <Zoomable initialView={shared} onViewChange={(v) => (log.b.push(v), setShared(v))} />
      </>
    );
  }

  it("zoom together through a shared view, and the echo changes nothing", async () => {
    const log = { a: [] as ChartView[], b: [] as ChartView[] };
    const r = await renderChart(<Pair log={log} />);
    unmount = r.unmount;
    const [a, b] = [...r.host.querySelectorAll<HTMLElement>(".uc-root")];
    await act(async () => plotOf(a!).focus());
    await frame();
    await pressOn(a!, "ArrowLeft", { shiftKey: true });
    await pressOn(a!, "ArrowLeft", { shiftKey: true });
    await frame();
    expect(log.a.map((v) => v.domains?.x?.[0])).toEqual([-10, -20]);
    // B follows to where A stands, and A is not handed its own report back.
    expect(log.b.at(-1)).toEqual(log.a.at(-1));
    await act(async () => plotOf(b!).focus());
    await pressOn(b!, "End");
    expect(tooltipOf(b!)).toContain("80");
  });

  it("ignores the late echo of its own report, and takes it again once it has passed", async () => {
    const views: ChartView[] = [];
    const onViewChange = (v: ChartView) => views.push(v);
    const r = await renderChart(<Zoomable initialView={{}} onViewChange={onViewChange} />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "ArrowLeft", true);
    await press(r.host, "ArrowLeft", true);
    const [first, second] = views;
    // The first report comes back while the chart already stands at the second.
    await r.rerender(<Zoomable initialView={first} onViewChange={onViewChange} />);
    await press(r.host, "End");
    expect(tooltipOf(r.host)).toContain("80");
    await r.rerender(<Zoomable initialView={second} onViewChange={onViewChange} />);
    // Handed in once more, the first is the application's own wish.
    await r.rerender(<Zoomable initialView={first} onViewChange={onViewChange} />);
    await press(r.host, "End");
    expect(tooltipOf(r.host)).toContain("90");
  });

  it("keeps the Active point across a view handed in", async () => {
    const r = await renderChart(<Zoomable initialView={{}} />);
    unmount = r.unmount;
    await focusPlot(r.host);
    await press(r.host, "ArrowLeft");
    await press(r.host, "ArrowLeft");
    expect(tooltipOf(r.host)).toContain("8");
    await r.rerender(<Zoomable initialView={{ domains: { x: [50, 90] } }} />);
    expect(tooltipOf(r.host)).toContain("8");
    await press(r.host, "ArrowLeft");
    expect(tooltipOf(r.host)).toContain("7");
  });
});
