// @vitest-environment jsdom

/* A ChartsWordingProvider sets the wording of every chart below it; a chart's own
   `wording` prop is merged over it (ADR-0031). */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChartsWordingProvider, useChart } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import { renderChart, sizePlot } from "./renderChart";

const at = (h: number) => new Date(2026, 2, 16, h, 0).getTime();
const data = [
  { t: at(8), a: 1000 },
  { t: at(20), a: 3500 },
];

function Demo({ wording }: { wording?: Partial<typeof GERMAN_CHARTS_WORDING> }) {
  const { Chart, XAxis, YAxis, Line } = useChart(data);
  return (
    <Chart aria-label="Provider" height={300} wording={wording}>
      <XAxis value="t" time />
      <YAxis />
      <Line value="a" name="A" />
    </Chart>
  );
}

const ticks = (host: HTMLElement, axis: "x" | "y") =>
  [...host.querySelectorAll(`.uc-axis-${axis} .uc-tick`)].map((t) => t.textContent).join(" ");

beforeEach(() => sizePlot(600, 300));
afterEach(() => vi.restoreAllMocks());

describe("ChartsWordingProvider", () => {
  it("speaks German in a chart below it", async () => {
    const { host, unmount } = await renderChart(
      <ChartsWordingProvider wording={GERMAN_CHARTS_WORDING}>
        <Demo />
      </ChartsWordingProvider>,
    );
    expect(ticks(host, "y")).toContain("3.000");
    expect(ticks(host, "x")).toMatch(/März|Mär/);
    unmount();
  });

  it("lets a chart's own wording win over the provider", async () => {
    const { host, unmount } = await renderChart(
      <ChartsWordingProvider wording={GERMAN_CHARTS_WORDING}>
        <Demo wording={{ locale: "en-GB" }} />
      </ChartsWordingProvider>,
    );
    expect(ticks(host, "y")).toContain("3,000");
    unmount();
  });

  it("changes nothing without a provider", async () => {
    const { host, unmount } = await renderChart(<Demo />);
    expect(ticks(host, "y")).toContain("3,000");
    unmount();
  });
});
