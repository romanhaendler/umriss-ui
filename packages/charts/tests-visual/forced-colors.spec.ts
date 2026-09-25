/* charts-alternatives 03 (C4): the charts under forced colours - the Windows
   contrast mode, emulated. The browser forces every element's colours and
   none of a canvas' pixels, so the chart forces itself: its theme resolves to
   the system colours, and every series is told apart by its marks whatever
   its `encoding`. Light and dark through the projects, as everywhere. */

import { test, expect, type Page } from "@playwright/test";
import { drawn, openExample } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  // Before the page loads: the chart reads its theme on its first frame.
  await page.emulateMedia({ forcedColors: "active" });
});

/** A system colour as the page resolves it. */
function system(page: Page, name: string): Promise<string> {
  return page.evaluate((colour) => {
    const probe = document.body.appendChild(document.createElement("span"));
    probe.style.color = colour;
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved;
  }, name);
}

/** The pixels of a chart's series canvas that come near a colour of its
    palette. The palette is read where the chart reads it, unforced; the
    system colours of the emulated contrast themes are not greys (Chromium's
    GrayText is a dark red in light, a green in dark), so what is asked is not
    "grey or not" but "palette or not". */
function palettePixels(page: Page, exampleId: string, chart: number): Promise<number> {
  return page.evaluate(
    ([id, index]) => {
      const root = document.querySelectorAll<HTMLElement>(`[data-example="${id}"] .uc-root`)[index as number];
      const canvas = root?.querySelector<HTMLCanvasElement>("canvas.uc-layer-series");
      const ctx = canvas?.getContext("2d");
      if (root === undefined || canvas == null || ctx == null) return -1;
      const palette = [1, 2, 3, 4, 5, 6].map((n) => {
        const probe = root.appendChild(document.createElement("span"));
        probe.style.setProperty("forced-color-adjust", "none");
        probe.style.color = `var(--uc-series-${n})`;
        const rgb = (getComputedStyle(probe).color.match(/\d+/g) ?? []).slice(0, 3).map(Number);
        probe.remove();
        return rgb;
      });
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if ((data[i + 3] as number) === 0) continue;
        const near = palette.some(
          ([r = 0, g = 0, b = 0]) =>
            Math.hypot((data[i] as number) - r, (data[i + 1] as number) - g, (data[i + 2] as number) - b) < 40,
        );
        if (near) count++;
      }
      return count;
    },
    [exampleId, chart] as const,
  );
}

test("a chart without encoding draws in system colours and by marks", async ({ page }) => {
  await openExample(page, "chart", "told-apart-without-colour");
  // The left chart has no `encoding`: its legend shows marks all the same.
  const chart = page.locator('[data-example="told-apart-without-colour"] .uc-root').first();
  const chip = chart.locator(".uc-legend-item").nth(1).locator("svg line");
  await expect(chip).toHaveAttribute("stroke-dasharray", "7 4");
  await expect(chip).toHaveAttribute("stroke", await system(page, "CanvasText"));
  // And its canvas carries no palette colour: system colours only.
  expect(await palettePixels(page, "told-apart-without-colour", 0)).toBe(0);
  // The check sees a palette where there is one: the same chart unforced.
  await page.emulateMedia({ forcedColors: "none" });
  await drawn(page);
  expect(await palettePixels(page, "told-apart-without-colour", 0)).toBeGreaterThan(100);
});

for (const [pageId, exampleId] of [
  ["chart", "told-apart-without-colour"],
  ["chart", "marks-on-every-kind"],
  ["chart", "bands-limits-and-cells"],
  ["stateband", "shift"],
] as const) {
  test(`Under forced colours: ${exampleId}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    await drawn(page);
    await expect(target).toHaveScreenshot(`forced-${exampleId}-${testInfo.project.name}.png`);
  });
}
