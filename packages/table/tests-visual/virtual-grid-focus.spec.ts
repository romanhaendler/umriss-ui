/* The focus of a virtual grid, in the browser: a window that moves under a focused cell never leaves
   the focus on <body>, and Ctrl+Home goes back to the head. Against the example with 10,000 tags. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const ID = "scroll-to-a-row";
const example = (page: Page) => page.locator(`[data-example="${ID}"]`);
const scrollArea = (page: Page) => example(page).locator("table").locator("..");

test.beforeEach(async ({ page }) => {
  await openExample(page, "virtualisation", ID);
  await example(page).scrollIntoViewIfNeeded();
  await example(page).getByRole("button", { name: "Show TAG-07500" }).click();
  await example(page).getByRole("gridcell", { name: "Sensor 7500" }).click();
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest("tbody"))).toBe(true);
});

test("Ctrl+Home from deep in a virtual grid scrolls to the top and focuses the head", { tag: "@quick" }, async ({ page }) => {
  expect(await scrollArea(page).evaluate((el) => el.scrollTop)).toBeGreaterThan(1000);
  await page.keyboard.press("Control+Home");
  await expect.poll(() => scrollArea(page).evaluate((el) => el.scrollTop)).toBe(0);
  const place = await page.evaluate(() => document.activeElement?.closest("th, td")?.tagName ?? document.activeElement?.tagName);
  expect(place).toBe("TH");
  expect(await page.evaluate(() => !!document.activeElement?.closest("thead"))).toBe(true);
});

test("a focused row scrolled out of the window hands the focus on, not to the body", { tag: "@quick" }, async ({ page }) => {
  expect(await page.evaluate(() => !!document.activeElement?.closest("tbody"))).toBe(true);
  await scrollArea(page).evaluate((el) => {
    el.scrollTop += 5000;
  });
  await page.waitForTimeout(300);
  const where = await page.evaluate(() => {
    const a = document.activeElement;
    return { body: a === document.body, inTable: !!a?.closest("table"), row: a?.closest("tr")?.getAttribute("aria-rowindex") ?? null };
  });
  expect(where.body).toBe(false);
  expect(where.inTable).toBe(true);
});
