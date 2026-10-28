/* The control heights are in `rem`: at a root font size of 32 px a `sm` and a
   `md` Button are twice their height at 16 px. Chromium only; light only. */

import { test, expect, type Page } from "@playwright/test";
import { addressOf, settle } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

/** The heights of the `Print labels` buttons of the sizes example: md, then sm. */
const buttonHeights = async (page: Page, root: number) => {
  await page.goto(addressOf("button", "sizes"));
  await page.evaluate((size) => (document.documentElement.style.fontSize = `${size}px`), root);
  await page.evaluate(() => document.fonts.ready);
  const stage = page.locator('[data-example="sizes"] .exampleStage');
  await stage.waitFor({ state: "visible" });
  await settle(page);
  const buttons = stage.getByRole("button", { name: "Print labels" });
  const heights: number[] = [];
  for (let i = 0; i < (await buttons.count()); i++) heights.push(Math.round((await buttons.nth(i).boundingBox())!.height));
  return heights;
};

test("a md and a sm Button are twice as tall at a 32 px root", { tag: "@quick" }, async ({ page }) => {
  expect(await buttonHeights(page, 16)).toEqual([32, 26]);
  expect(await buttonHeights(page, 32)).toEqual([64, 52]);
});
