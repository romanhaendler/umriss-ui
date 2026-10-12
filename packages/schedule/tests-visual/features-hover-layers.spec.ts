/* The two canvases are drawn for their own reasons: a hover that moves along a
   subtask and on to another changes the overlay and leaves the data layer's
   pixels as they were. Light only. */

import { test, expect, type Locator } from "@playwright/test";
import { openExample } from "./navigation";
import { DAY_OF_PLAN, plotOf } from "./plot";

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const fingerprint = (example: Locator, layer: 0 | 1) =>
  example.locator("[data-schedule-plot] canvas").nth(layer).evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());

test("a hover moving along a subtask and on to another leaves the data canvas as it was and changes the overlay", async ({ page }) => {
  await openExample(page, "move-and-lane", "move-to-another-lane");
  const example = page.locator('[data-example="move-to-another-lane"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  const y = plot.y("van-402");

  await page.mouse.move(plot.x(0), y);
  const dataAtRest = await fingerprint(example, 0);
  const overlayAtRest = await fingerprint(example, 1);

  /* C-2046 runs 13:00 to 14:30; C-2043 holds the same van around 10:45. */
  await page.mouse.move(plot.x(13, 15), y);
  await expect.poll(() => fingerprint(example, 1)).not.toBe(overlayAtRest);
  const overlayOnFirst = await fingerprint(example, 1);
  await page.mouse.move(plot.x(14, 15), y, { steps: 5 });
  expect(await fingerprint(example, 0)).toBe(dataAtRest);

  await page.mouse.move(plot.x(10, 45), y, { steps: 5 });
  await expect.poll(() => fingerprint(example, 1)).not.toBe(overlayOnFirst);
  expect(await fingerprint(example, 0)).toBe(dataAtRest);
});
