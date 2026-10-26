/* The head under an app bar: the table's head stays below the bar while the
   rows scroll. It is behaviour - the head sticks in the table's own scroll
   area - so it is tested here and not by a screenshot. Only in the light
   project. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const example = (page: Page) => page.locator('[data-example="a-head-below-an-app-bar"]');

test("the head stays below the bar while the rows scroll", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "width-and-pinning", "a-head-below-an-app-bar");
  await example(page).scrollIntoViewIfNeeded();

  const scrolled = await example(page).locator(".app-table").evaluate((table) => {
    const area = [...table.querySelectorAll<HTMLElement>("*")].find((el) => ["auto", "scroll"].includes(getComputedStyle(el).overflowY))!;
    area.scrollTop = 200;
    return area.scrollTop;
  });
  expect(scrolled).toBeGreaterThan(0);

  const bar = example(page).locator(".app-bar");
  const head = example(page).locator("thead th").first();
  const barBottom = (await bar.boundingBox())!.y + (await bar.boundingBox())!.height;
  const headTop = (await head.boundingBox())!.y;
  expect(Math.abs(headTop - barBottom)).toBeLessThan(1);
});
