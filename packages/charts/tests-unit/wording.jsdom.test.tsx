// @vitest-environment jsdom

/* charts-a11y 01: the charts carry their own wording (ADR-0031) - English by
   default, German behind a subpath, entry by entry, and a string prop still
   wins over the register. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Chart, Line, XAxis, YAxis } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import type { ChartsWording } from "../src";
import { renderChart, sizePlot } from "./renderChart";

let unmount: (() => void) | null = null;
beforeEach(() => sizePlot());
afterEach(() => {
  unmount?.();
  unmount = null;
  vi.restoreAllMocks();
});

async function empty(props: { wording?: Partial<ChartsWording>; empty?: string }): Promise<string | null> {
  const r = await renderChart(
    <Chart data={[]} ariaLabel="Nothing" {...props}>
      <XAxis accessor={(d: { t: number }) => d.t} />
      <YAxis accessor={(d: { a: number }) => d.a} />
      <Line accessor={(d: { a: number }) => d.a} name="A" />
    </Chart>,
  );
  unmount = r.unmount;
  return r.host.querySelector(".uc-empty")?.textContent ?? null;
}

describe("Chart wording", () => {
  it("speaks English without a wording", async () => {
    expect(await empty({})).toBe("No data");
  });

  it("speaks the German register from its subpath", async () => {
    expect(await empty({ wording: GERMAN_CHARTS_WORDING })).toBe("Keine Daten");
  });

  it("falls back to English entry by entry", async () => {
    expect(await empty({ wording: { roleDescription: "Diagramm" } })).toBe("No data");
  });

  it("lets the string prop win over the register", async () => {
    expect(await empty({ wording: GERMAN_CHARTS_WORDING, empty: "Nothing yet" })).toBe("Nothing yet");
  });
});
