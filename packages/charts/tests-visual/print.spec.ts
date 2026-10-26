/* A chart prints at the page's width (Chromium only: `page.pdf()` is).

   The listener under test is the chart's own, on matchMedia("print"). The test
   registers one of its own after the chart's, so that it sees the DOM the
   chart's listener left: inside the print layout, before the page is printed. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.beforeEach(({ browserName }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  test.skip(browserName !== "chromium", "page.pdf() is Chromium's");
});

test("a full-width chart is drawn at the printed page's width, its axes where its marks are", async ({ page }) => {
  await openExample(page, "line", "multi-series");
  const example = page.locator('[data-example="multi-series"]');
  await example.scrollIntoViewIfNeeded();

  const plotWidth = () => example.locator(".uc-plot").first().evaluate((el) => el.getBoundingClientRect().width);
  const onScreen = await plotWidth();

  await page.evaluate(() => {
    const seen: { canvas: number; plot: number; plotRight: number; lastTickRight: number }[] = [];
    (window as unknown as { __printSeen: typeof seen }).__printSeen = seen;
    matchMedia("print").addEventListener("change", (e) => {
      if (!e.matches) return;
      const root = document.querySelector('[data-example="multi-series"]') as HTMLElement;
      const plot = root.querySelector(".uc-plot") as HTMLElement;
      const canvas = root.querySelector("canvas.uc-layer-series") as HTMLCanvasElement;
      const ticks = [...root.querySelectorAll(".uc-axis-x .uc-tick-label")];
      const box = plot.getBoundingClientRect();
      seen.push({
        canvas: parseFloat(canvas.style.width),
        plot: box.width,
        plotRight: box.right,
        lastTickRight: ticks[ticks.length - 1]?.getBoundingClientRect().right ?? Number.NaN,
      });
    });
  });

  await page.pdf({ format: "A4" });

  const seen = await page.evaluate(() => (window as unknown as { __printSeen: Record<string, number>[] }).__printSeen);
  expect(seen).toHaveLength(1);
  const [print] = seen as { canvas: number; plot: number; plotRight: number; lastTickRight: number }[];
  expect(print!.canvas).toBeCloseTo(print!.plot, 0);
  expect(print!.plot).toBeLessThan(onScreen);
  expect(print!.lastTickRight).toBeLessThanOrEqual(print!.plotRight + 1);

  // The way back: the chart is at its screen width again.
  await expect.poll(plotWidth).toBeCloseTo(onScreen, 0);
  await expect
    .poll(() => example.locator("canvas.uc-layer-series").first().evaluate((el) => parseFloat((el as HTMLCanvasElement).style.width)))
    .toBeCloseTo(onScreen, 0);
});
