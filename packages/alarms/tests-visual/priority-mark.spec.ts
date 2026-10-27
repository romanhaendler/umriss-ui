/* The priority mark in a browser: the flash runs at one cycle a second, stands
   still under reduced motion (which rings the unacknowledged mark instead), and
   the four outlines differ. */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES } from "./pages";
import { openExample } from "./navigation";

const FOUR = EXAMPLE_ADDRESSES.find((one) => one.pageId === "prioritymark")!;

const flashing = (page: import("@playwright/test").Page) => page.locator('[data-example="' + FOUR.exampleId + '"] [data-flashing]').first();

test("An unacknowledged mark flashes once a second", async ({ page }) => {
  await openExample(page, FOUR.pageId, FOUR.exampleId);
  const style = await flashing(page).locator("span").evaluate((node) => {
    const computed = getComputedStyle(node);
    return { name: computed.animationName, duration: computed.animationDuration };
  });
  expect(style).toEqual({ name: expect.stringContaining("flash"), duration: "1s" });
});

test("Under reduced motion no mark animates and the unacknowledged one carries a ring", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openExample(page, FOUR.pageId, FOUR.exampleId);
  const names = await page.locator('[data-example="' + FOUR.exampleId + '"] [role="img"] > span').evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).animationName));
  expect(names.length).toBe(16);
  expect(new Set(names)).toEqual(new Set(["none"]));
  expect(await flashing(page).evaluate((node) => getComputedStyle(node).outlineStyle)).toBe("solid");
});

test("The four marks have four different outlines", async ({ page }) => {
  await openExample(page, FOUR.pageId, FOUR.exampleId);
  const shapes = await page.locator('[data-example="' + FOUR.exampleId + '"] [role="img"] > span').evaluateAll((nodes) => nodes.slice(0, 4).map((node) => getComputedStyle(node).clipPath));
  expect(new Set(shapes).size).toBe(4);
});
