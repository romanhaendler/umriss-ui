/* The row pitch derives from the `rem` control heights: at a root font size
   of 32 px a row is twice its height at 16 px, give or take the one pixel of
   the border, which stays a pixel. Chromium only; light only. */

import { test, expect, type Page } from "@playwright/test";
import { addressOf } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

const rowHeight = async (page: Page, root: number) => {
  await page.goto(addressOf("pagination", "page-through-shipments"));
  await page.evaluate((size) => (document.documentElement.style.fontSize = `${size}px`), root);
  await page.evaluate(() => document.fonts.ready);
  const row = page.locator('[data-example="page-through-shipments"] tbody tr').first();
  await row.waitFor({ state: "visible" });
  return (await row.boundingBox())!.height;
};

test("a row is twice as tall at a 32 px root", { tag: "@quick" }, async ({ page }) => {
  const plain = await rowHeight(page, 16);
  expect(Math.abs((await rowHeight(page, 32)) - plain * 2)).toBeLessThanOrEqual(1);
});
