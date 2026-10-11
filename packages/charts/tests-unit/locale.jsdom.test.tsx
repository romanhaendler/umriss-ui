// @vitest-environment jsdom

/* The locale of every number and time label is the wording's (ADR-0031),
   whatever the browser says. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useChart } from "../src";
import { GERMAN_CHARTS_WORDING } from "../src/wording/de";
import { renderChart, sizePlot } from "./renderChart";

const at = (h: number) => new Date(2026, 2, 16, h, 0).getTime();
const data = [
  { t: at(8), a: 1000 },
  { t: at(20), a: 3500 },
];

function Demo({ german }: { german: boolean }) {
  const { Chart, XAxis, YAxis, Line } = useChart(data);
  return (
    <Chart ariaLabel="Locale" height={300} wording={german ? GERMAN_CHARTS_WORDING : undefined}>
      <XAxis value="t" time />
      <YAxis />
      <Line value="a" name="A" />
    </Chart>
  );
}

const texts = (host: HTMLElement, axis: "x" | "y") =>
  [...host.querySelectorAll(`.uc-axis-${axis} .uc-tick`)].map((t) => t.textContent);

beforeEach(() => {
  sizePlot(600, 300);
  vi.spyOn(navigator, "language", "get").mockReturnValue("fr-FR");
});
afterEach(() => vi.restoreAllMocks());

describe("the locale of the wording", () => {
  it("formats numbers and the time axis in English by default, whatever the browser says", async () => {
    const { host, unmount } = await renderChart(<Demo german={false} />);
    expect(texts(host, "y").join(" ")).toContain("3,000");
    expect(texts(host, "x").join(" ")).toContain("Mar");
    unmount();
  });

  it("formats them in German with the German wording", async () => {
    const { host, unmount } = await renderChart(<Demo german />);
    expect(texts(host, "y").join(" ")).toContain("3.000");
    expect(texts(host, "x").join(" ")).toMatch(/März|Mär/);
    expect(texts(host, "x").join(" ")).toMatch(/\d\d:00/);
    unmount();
  });
});
