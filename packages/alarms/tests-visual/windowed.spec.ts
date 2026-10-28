/* A bounded list renders the rows in view: the flood example holds a thousand
   standing alarms and the DOM keeps a screenful. Rows that scroll into view are
   whole, and the keys act on the alarm the focus is in. jsdom has no layout, so
   this is the browser's. */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES } from "./pages";
import { openExample } from "./navigation";

const FLOOD = EXAMPLE_ADDRESSES.find((one) => one.pageId === "trips-and-floods" && one.exampleId.includes("ticks"))!;

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

test("@quick A thousand alarms keep a screenful of rows in the DOM, and the rows scrolled into view are whole", async ({ page }) => {
  await openExample(page, FLOOD.pageId, FLOOD.exampleId);
  const stage = page.locator(`[data-example="${FLOOD.exampleId}"]`);
  const rows = stage.locator("tbody tr[data-alarm-id]");
  expect(await rows.count()).toBeLessThan(100);
  expect(await stage.locator("*").count()).toBeLessThan(2500);

  const area = stage.locator('div[style*="max-height"]').first();
  await area.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  const last = stage.locator('tbody tr[data-alarm-id="s-999"]');
  await expect(last).toBeVisible();
  await expect(last.locator("th")).not.toBeEmpty();
});

test("A acknowledges the alarm the focus is in, also on a row scrolled into view", async ({ page }) => {
  await openExample(page, FLOOD.pageId, FLOOD.exampleId);
  const stage = page.locator(`[data-example="${FLOOD.exampleId}"]`);
  const area = stage.locator('div[style*="max-height"]').first();
  await area.evaluate((node) => {
    node.scrollTop = node.scrollHeight / 2;
  });
  const cell = stage.locator("tbody tr[data-alarm-id] th").nth(5);
  const id = await cell.evaluate((node) => (node.closest("tr") as HTMLElement).dataset.alarmId!);
  await cell.focus();
  await page.keyboard.press("a");
  await expect(stage.locator(`tbody tr[data-alarm-id="${id}"]`)).toHaveAttribute("data-lifecycle", /acknowledged/);
});
