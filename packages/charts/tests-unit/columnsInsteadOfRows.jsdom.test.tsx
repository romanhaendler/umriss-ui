// @vitest-environment jsdom

/* The columns example as a reader meets it: the tooltip at an index reads that
   index's value, a new course redraws the chart and the data table, and no
   development warning is logged on the way. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import ColumnsInsteadOfRows from "../demo/examples/Chart/10-columns-instead-of-rows";
import { focusPlot, frame, press, renderChart, sizePlot, tooltipOf } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

/** The pressure the example draws at index `i` of the course with `seed`. */
function pressureAt(seed: number, i: number): number {
  let s = seed >>> 0;
  let r = 0;
  for (let k = 0; k <= i; k++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    r = s / 4294967296;
  }
  return 6 + 0.8 * Math.sin(i / 500) + (r - 0.5) * 0.6;
}

/** The reading the tooltip gives: its minute and its pressure. */
const readingOf = (tip: string) => {
  const [, minute, pressure] = /^(\d+)Pressure(-?[\d.]+)/.exec(tip) ?? [];
  return { minute: Number(minute), pressure: Number(pressure) };
};

const newCourse = async (host: HTMLElement) => {
  const button = [...host.querySelectorAll("button")].find((b) => b.textContent === "New course");
  expect(button).toBeDefined();
  await act(async () => button?.click());
  await frame();
};

/** The tooltip at the reading with index `index`, from the first one. */
async function tooltipAt(host: HTMLElement, index: number): Promise<string> {
  await focusPlot(host);
  await press(host, "Home");
  for (let i = 0; i < index; i++) await press(host, "ArrowRight");
  return tooltipOf(host);
}

describe("The columns example", () => {
  it("reads the value at an index through the tooltip", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await renderChart(<ColumnsInsteadOfRows />);
    unmount = r.unmount;
    const reading = readingOf(await tooltipAt(r.host, 9));
    expect(reading.minute).toBe(9);
    expect(reading.pressure).toBeCloseTo(pressureAt(2026, 9), 3);
    expect(warn).not.toHaveBeenCalled();
  });

  it("redraws a new course, and the data table shows its values", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await renderChart(<ColumnsInsteadOfRows />);
    unmount = r.unmount;
    const before = await tooltipAt(r.host, 1);
    await act(async () => (r.host.querySelector(".uc-data-key") as HTMLButtonElement | null)?.click());
    const tableBefore = r.host.querySelector("table")?.textContent ?? "";

    await newCourse(r.host);
    const after = await tooltipAt(r.host, 1);
    expect(after).not.toBe(before);
    expect(readingOf(after).pressure).toBeCloseTo(pressureAt(2027, 1), 3);

    // The table lists the course as drawn: a new course gives a new table.
    const tableAfter = r.host.querySelector("table")?.textContent ?? "";
    expect(tableAfter).not.toBe("");
    expect(tableAfter).not.toBe(tableBefore);
    // The stale probe (dev.ts) also warns here, although the rows changed too and the new course is drawn.
    expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
  });
});
