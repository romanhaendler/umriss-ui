/* A locked widget in the editing mode: photographed, light and dark, and
   moved by a drag of its head like any other. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

const example = (page: Page) => page.locator('[data-example="a-widget-every-reader-keeps"]');
const order = (page: Page) => example(page).locator("[data-widget]").evaluateAll((els) => els.map((el) => el.getAttribute("data-widget")));

test.beforeEach(async ({ page }) => {
  await openExample(page, "dashboard", "a-widget-every-reader-keeps");
  await example(page).getByRole("button", { name: "Edit" }).click();
});

test("the locked widget in the editing mode", async ({ page }, testInfo) => {
  await expect(example(page).getByText("Locked", { exact: true })).toBeVisible();
  await example(page).scrollIntoViewIfNeeded();
  await expect(example(page)).toHaveScreenshot(`example-locked-in-the-mode-${testInfo.project.name}.png`);
});

test("@quick a drag of the locked widget's head moves it", async ({ page }) => {
  test.skip(test.info().project.name.includes("dark"), "behaviour tests once only (light)");
  const head = example(page).locator('[data-widget="safety"] > :first-child');
  const from = (await head.boundingBox())!;
  const to = (await example(page).locator('[data-widget="late"]').boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + 14);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2 + 30, to.y + 14, { steps: 12 });
  await page.mouse.up();
  expect(await order(page)).toEqual(["orders", "late", "safety"]);
});
