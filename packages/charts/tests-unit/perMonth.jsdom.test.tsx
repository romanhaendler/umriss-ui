// @vitest-environment jsdom

/* The per-month example as a reader meets it: its bars are labelled by month,
   one name under each of the six bars of the first half of 2026. */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import PerMonth from "../demo/examples/Bar/10-per-month";
import { renderChart, sizePlot } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot(1000));
afterEach(() => {
  unmount?.();
  unmount = null;
});

describe("The per-month example", () => {
  it("labels each of its six bars with its month", async () => {
    const r = await renderChart(<PerMonth />);
    unmount = r.unmount;
    const names = [...r.host.querySelectorAll(".uc-axis-x .uc-tick")]
      .map((t) => t.textContent ?? "")
      .filter((t) => /^(Jan|Feb|Mar|Apr|May|Jun)/.test(t));
    expect(names.map((t) => t.slice(0, 3))).toEqual(["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
  });
});
