/* Under `touch-scale.css` the alarm banner's Acknowledge grows with `md`
   (ADR-0079): 44 px with the stylesheet, 26 px without. The address
   `?touch-scale` has the shell's switch, and so the stylesheet, on. Chromium
   only; light only. */

import { test, expect, type Page } from "@playwright/test";
import { addressOf } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

const acknowledge = async (page: Page, scaled: boolean) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await page.goto(addressOf("alarmbanner", "banner-over-the-list").replace("#", scaled ? "?touch-scale#" : "#"));
  await page.evaluate(() => document.fonts.ready);
  const stage = page.locator('[data-example="banner-over-the-list"] .exampleStage');
  await stage.waitFor({ state: "visible" });
  return Math.round((await stage.getByRole("button", { name: "Acknowledge", exact: true }).first().boundingBox())!.height);
};

test("the banner's Acknowledge is 44 px with the opt-in, 26 px without", { tag: "@quick" }, async ({ page }) => {
  expect(await acknowledge(page, false)).toBe(26);
  expect(await acknowledge(page, true)).toBe(44);
});
