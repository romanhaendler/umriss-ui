/* The undo example (ADR-0023, ADR-0032): the application keeps the history, and
   Ctrl+Z pops it. A drag moves a bar; the key puts it back. Observed through the
   tooltip, which names the times of the bar under the pointer, and through the
   example's own counter. Light only. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";
import { at, plotOf } from "./plot";

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

test("a drag moves a bar and Ctrl+Z puts it back", async ({ page }) => {
  await openExample(page, "undo", "undo-the-applied-intents");
  const example = page.locator('[data-example="undo-the-applied-intents"]');
  const plot = await plotOf(page, example, [at(8), at(15)]);
  const tooltip = example.locator("[data-schedule-tooltip]");
  const undo = example.getByRole("button", { name: "Undo" });

  /* Build sits on chloe from 10:00 to 13:00. */
  await page.mouse.move(plot.x(11, 30), plot.y("chloe"));
  await expect(tooltip).toContainText("10:00–13:00");

  await expect(undo).toBeDisabled();
  await page.mouse.down();
  await page.mouse.move(plot.x(12, 30), plot.y("chloe"), { steps: 5 });
  await page.mouse.up();

  await expect(example).toContainText("1 to undo");
  await page.mouse.move(plot.x(12, 30), plot.y("chloe"));
  await expect(tooltip).toContainText("11:00–14:00");

  await page.keyboard.press("Control+z");

  await expect(example).toContainText("0 to undo");
  await expect(undo).toBeDisabled();
  await page.mouse.move(plot.x(11, 30), plot.y("chloe"));
  await expect(tooltip).toContainText("10:00–13:00");
});
