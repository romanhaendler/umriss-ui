/* A dependency is stroked only where it can touch the plot - and one whose
   route crosses the view with both ends outside it still is. Light only. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";
import { DAY_OF_PLAN, plotOf } from "./plot";

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

test("a dependency crossing the view with both ends outside it is drawn", async ({ page }) => {
  await openExample(page, "schedule", "first-schedule");
  const example = page.locator('[data-example="first-schedule"]');
  const plot = await plotOf(page, example, DAY_OF_PLAN);

  /* h-04-2 runs from t-04-2 (van 2, until 10:45) to t-04-3 (e-van, from 14:45).
     Zoomed to the narrowest span around 12:45 neither bar is in view, and the
     line between them is the only purple (T-04's colour) on the data canvas. */
  await page.mouse.move(plot.x(12, 45), plot.y("van-2"));
  await page.keyboard.down("Control");
  for (let i = 0; i < 40; i++) await page.mouse.wheel(0, -120);
  await page.keyboard.up("Control");

  const purple = () =>
    example.locator("[data-schedule-plot] canvas").nth(0).evaluate((canvas) => {
      const c = canvas as HTMLCanvasElement;
      const { data } = c.getContext("2d")!.getImageData(0, 0, c.width, c.height);
      let n = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (Math.abs(data[i]! - 124) < 40 && Math.abs(data[i + 1]! - 58) < 40 && Math.abs(data[i + 2]! - 237) < 40 && data[i + 3]! > 200) n++;
      }
      return n;
    });
  await expect.poll(purple).toBeGreaterThan(20);
});
