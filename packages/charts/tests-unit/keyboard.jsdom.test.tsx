// @vitest-environment jsdom

/* charts-a11y 02: a chart with a tooltip is one tab stop whose keys walk an
   Active point (ADR-0030). What a person observes: the role the plot reports,
   and what the tooltip shows after each key. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../src";
import { frame, renderChart, sizePlot } from "./renderChart";

interface Row {
  t: number;
  a: number | null;
  b: number;
}

const data: Row[] = [
  { t: 0, a: 10, b: 100 },
  { t: 1, a: 11, b: 101 },
  { t: 2, a: null, b: 102 },
  { t: 3, a: 13, b: 103 },
  { t: 4, a: 14, b: 104 },
];

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

async function chart(options: { tooltip?: "x" | "nearest" | null } = {}): Promise<HTMLElement> {
  const mode = options.tooltip === undefined ? "x" : options.tooltip;
  const r = await renderChart(
    <Chart data={data} ariaLabel="Two courses">
      <XAxis accessor={(d: Row) => d.t} tickFormat={(v) => `t${v}`} />
      <YAxis accessor={(d: Row) => d.b} />
      <Line accessor={(d: Row) => d.a} name="A" />
      <Line accessor={(d: Row) => d.b} name="B" />
      {mode !== null && <Tooltip mode={mode} />}
    </Chart>,
  );
  unmount = r.unmount;
  return r.host;
}

const plot = (host: HTMLElement) => host.querySelector(".uc-plot") as HTMLElement;
const tooltip = (host: HTMLElement) => host.querySelector(".uc-tooltip")?.textContent ?? "";

async function press(host: HTMLElement, key: string, extra: KeyboardEventInit = {}): Promise<void> {
  await act(async () => {
    plot(host).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra }));
  });
  await frame();
}

async function focus(host: HTMLElement): Promise<void> {
  await act(async () => plot(host).focus());
  await frame();
}

describe("The chart as a tab stop", () => {
  it("is an application with a role description when it has a tooltip", async () => {
    const host = await chart();
    const p = plot(host);
    expect(p.getAttribute("role")).toBe("application");
    expect(p.getAttribute("aria-roledescription")).toBe("chart");
    expect(p.getAttribute("aria-label")).toBe("Two courses");
    expect(p.tabIndex).toBe(0);
  });

  it("stays an image without a tab stop when it has none", async () => {
    const host = await chart({ tooltip: null });
    const p = plot(host);
    expect(p.getAttribute("role")).toBe("img");
    expect(p.hasAttribute("tabindex")).toBe(false);
  });
});

describe("The walk", () => {
  it("starts at the newest position on focus", async () => {
    const host = await chart();
    await focus(host);
    expect(tooltip(host)).toContain("t4");
    expect(tooltip(host)).toContain("104");
  });

  it("moves with the arrows, Home and End", async () => {
    const host = await chart();
    await focus(host);
    await press(host, "ArrowLeft");
    expect(tooltip(host)).toContain("t3");
    await press(host, "Home");
    expect(tooltip(host)).toContain("t0");
    await press(host, "ArrowRight");
    expect(tooltip(host)).toContain("t1");
    await press(host, "End");
    expect(tooltip(host)).toContain("t4");
  });

  it("changes the series with up and down under \"nearest\"", async () => {
    const host = await chart({ tooltip: "nearest" });
    await focus(host);
    expect(tooltip(host)).toContain("A");
    expect(tooltip(host)).toContain("14");
    await press(host, "ArrowDown");
    expect(tooltip(host)).toContain("B");
    expect(tooltip(host)).toContain("104");
  });

  it("skips the emphasised series' gap under \"nearest\"", async () => {
    const host = await chart({ tooltip: "nearest" });
    await focus(host);
    await press(host, "ArrowLeft"); // t3
    await press(host, "ArrowLeft"); // t2 is a gap in A: t1
    expect(tooltip(host)).toContain("t1");
  });

  it("clears the Active point with Escape and keeps the focus", async () => {
    const host = await chart();
    await focus(host);
    await press(host, "Escape");
    expect(tooltip(host)).toBe("");
    expect(document.activeElement).toBe(plot(host));
  });

  it("clears it when the focus leaves", async () => {
    const host = await chart();
    await focus(host);
    await act(async () => plot(host).blur());
    await frame();
    expect(tooltip(host)).toBe("");
  });

  it("keeps a keyboard point when the pointer leaves", async () => {
    const host = await chart();
    await focus(host);
    // What ends a pointer's hover - the window losing it, a press outside -
    // leaves the keyboard's point alone (jsdom has no PointerEvent).
    await act(async () => {
      window.dispatchEvent(new Event("blur"));
      document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    });
    await frame();
    expect(tooltip(host)).toContain("t4");
  });
});

describe("The walk over a matrix", () => {
  interface Cellish {
    hour: number;
    machine: number;
    oee: number;
  }
  // Two machines over three hours; machine 1 has no value at hour 1.
  const cells: Cellish[] = [
    { hour: 0, machine: 0, oee: 50 },
    { hour: 0, machine: 1, oee: 60 },
    { hour: 1, machine: 0, oee: 51 },
    { hour: 1, machine: 1, oee: Number.NaN },
    { hour: 2, machine: 0, oee: 52 },
    { hour: 2, machine: 1, oee: 62 },
  ];

  it("goes cell by cell in two dimensions", async () => {
    const { Matrix } = await import("../src");
    const r = await renderChart(
      <Chart data={cells} ariaLabel="OEE">
        <XAxis accessor={(d: Cellish) => d.hour} tickFormat={(v) => `h${v}`} />
        <YAxis accessor={(d: Cellish) => d.machine} />
        <Matrix accessor={(d: Cellish) => d.machine} value={(d: Cellish) => d.oee} name="OEE" format={(v) => `${v} %`} />
        <Tooltip mode="nearest" />
      </Chart>,
    );
    unmount = r.unmount;
    const host = r.host;
    await focus(host);
    expect(tooltip(host)).toContain("h2");
    await press(host, "ArrowLeft");
    expect(tooltip(host)).toContain("h1");
    expect(tooltip(host)).toContain("51 %");
    await press(host, "ArrowUp");
    // Machine 1 has no value at hour 1: the column ends here.
    expect(tooltip(host)).toContain("51 %");
    await press(host, "End");
    await press(host, "ArrowUp");
    expect(tooltip(host)).toContain("62 %");
  });
});
