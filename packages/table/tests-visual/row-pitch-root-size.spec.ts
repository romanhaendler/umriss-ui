/* The row pitch derives from the `rem` control heights: at a root font size
   of 32 px a `sm` control is 52 px, and a row still holds it with its
   space-1 above and below. The row's padding stays on the density
   tokens, which an application sets in pixels. Chromium only; light only. */

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

test("a row grows with the controls at a 32 px root", { tag: "@quick" }, async ({ page }) => {
  expect(await rowHeight(page, 32)).toBeGreaterThanOrEqual(52 + 2 * 4);
});
