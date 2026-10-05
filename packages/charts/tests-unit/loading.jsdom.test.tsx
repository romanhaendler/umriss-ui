// @vitest-environment jsdom

/* chart-loading 02: a chart that is loading says so, as the table does
   (ADR-0042). Over nothing to show it holds its empty message back; over a
   course already drawn it keeps the course, marks the plot stale - dimmed and
   deaf to the pointer, by CSS - and ends a pointer's hover. Busy in both. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Legend, Tooltip, useChart } from "../src";
import { focusPlot, frame, plotOf as plot, press, renderChart, sizePlot, tooltipOf as tooltip } from "./renderChart";

interface Row {
  t: number;
  a: number | null;
  b?: number | null;
}

const rows: Row[] = [0, 1, 2, 3, 4].map((t) => ({ t, a: 10 + t, b: 20 + t }));

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

type Extra = { loading?: boolean; empty?: ReactNode; hidden?: boolean };

function Loading({ data, extra }: { data: Row[]; extra: Extra }) {
  const { Chart, XAxis, YAxis, Line } = useChart(data, { initialView: extra.hidden === true ? { hidden: ["A", "B"] } : undefined });
  return (
    <Chart ariaLabel="Loading" loading={extra.loading} empty={extra.empty}>
      <XAxis value="t" tickFormat={(v) => `t${v}`} />
      <YAxis />
      <Line value="a" name="A" />
      <Line value="b" name="B" />
      <Tooltip />
      <Legend />
    </Chart>
  );
}

async function render(data: Row[], extra: Extra = {}) {
  const r = await renderChart(<Loading data={data} extra={extra} />);
  unmount = r.unmount;
  return { host: r.host, rerender: (d: Row[], e: Extra) => r.rerender(<Loading data={d} extra={e} />) };
}

const emptyOf = (host: HTMLElement) => host.querySelector(".uc-empty");
const busy = (host: HTMLElement) => plot(host).getAttribute("aria-busy");
const stale = (host: HTMLElement) => plot(host).hasAttribute("data-stale");

describe("A chart loading over nothing to show", () => {
  it("holds \"No data\" back, keeps its axes and is busy", async () => {
    const { host } = await render([], { loading: true });
    expect(emptyOf(host)).toBeNull();
    expect(host.querySelectorAll(".uc-axis")).toHaveLength(2);
    expect(busy(host)).toBe("true");
    expect(stale(host)).toBe(false);
  });

  it("holds a custom empty back as well", async () => {
    const { host } = await render([], { loading: true, empty: <strong>Line 3 is not reporting</strong> });
    expect(emptyOf(host)).toBeNull();
  });

  it("counts only gaps, or only hidden series, as nothing", async () => {
    const gaps = await render([{ t: 0, a: null }, { t: 1, a: null }], { loading: true });
    expect(emptyOf(gaps.host)).toBeNull();
    expect(stale(gaps.host)).toBe(false);
    unmount?.();
    const hidden = await render(rows, { loading: true, hidden: true });
    expect(emptyOf(hidden.host)).toBeNull();
    expect(stale(hidden.host)).toBe(false);
  });

  it("never says \"No data\" between the answer and the frame that lays it out", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    unmount = () => {
      act(() => root.unmount());
      host.remove();
    };
    await act(async () => root.render(<Loading data={[]} extra={{ loading: true }} />));
    await frame();
    await act(async () => root.render(<Loading data={rows} extra={{}} />));
    expect(emptyOf(host)).toBeNull();
    await frame();
    expect(emptyOf(host)).toBeNull();
  });

  it("says \"No data\" once it stops loading with still nothing", async () => {
    const { host, rerender } = await render([], { loading: true });
    await rerender([], {});
    expect(emptyOf(host)?.textContent).toBe("No data");
    expect(busy(host)).toBeNull();
  });
});

describe("A chart loading over a course", () => {
  it("keeps the course, marks the plot stale and busy", async () => {
    const { host } = await render(rows, { loading: true });
    expect(emptyOf(host)).toBeNull();
    expect(stale(host)).toBe(true);
    expect(busy(host)).toBe("true");
  });

  it("is neither stale nor busy once the answer is in", async () => {
    const { host, rerender } = await render(rows, { loading: true });
    await rerender(rows, {});
    expect(stale(host)).toBe(false);
    expect(busy(host)).toBeNull();
  });

  it("is neither without loading", async () => {
    const { host } = await render(rows);
    expect(stale(host)).toBe(false);
    expect(busy(host)).toBeNull();
  });

  it("ends a pointer's tooltip when the reload begins", async () => {
    const { host, rerender } = await render(rows);
    await act(async () => {
      plot(host).dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: 200, clientY: 150 }));
    });
    await frame();
    expect(tooltip(host)).not.toBe("");
    await rerender(rows, { loading: true });
    expect(tooltip(host)).toBe("");
  });

  it("keeps its legend usable", async () => {
    const { host } = await render(rows, { loading: true });
    const entry = Array.from(host.querySelectorAll<HTMLButtonElement>("button.uc-legend-item")).find((b) => b.textContent?.includes("A"))!;
    await act(async () => entry.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 })));
    await frame();
    expect(entry.getAttribute("aria-pressed")).toBe("false");
  });

  it("still walks with the keys", async () => {
    const { host } = await render(rows, { loading: true });
    await focusPlot(host);
    expect(tooltip(host)).toContain("t4");
    await press(host, "ArrowLeft");
    expect(tooltip(host)).toContain("t3");
  });
});
