/* A state wider than its cell ends in an ellipsis with the full word in the
   title; the banner's time stays on one line at 375 px. jsdom has no layout,
   so this is the browser's. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

test("@quick A state wider than its cell ends in an ellipsis, and its full text is the title", async ({ page }) => {
  await openExample(page, "alarmlist", "show-the-alerts");
  const state = page.locator('[data-example="show-the-alerts"] tbody tr[data-alarm-id] td span[title]').first();
  await state.waitFor({ state: "visible" });
  const full = "Returned and not yet acknowledged, confirmation by the shift lead is pending";
  await state.evaluate((node, text) => {
    node.textContent = text;
    node.setAttribute("title", text);
  }, full);
  expect(await state.evaluate((node) => getComputedStyle(node).textOverflow)).toBe("ellipsis");
  expect(await state.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  await expect(state).toHaveAttribute("title", full);
});

test("@quick At 375 px the banner's time is one line", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openExample(page, "alarmbanner", "banner-over-the-list");
  const time = page.locator('[data-example="banner-over-the-list"] [class*="_time_"]').first();
  await time.waitFor({ state: "visible" });
  expect(await time.evaluate((node) => node.getClientRects().length)).toBe(1);
  expect(await time.evaluate((node) => getComputedStyle(node).whiteSpace)).toBe("nowrap");
});
