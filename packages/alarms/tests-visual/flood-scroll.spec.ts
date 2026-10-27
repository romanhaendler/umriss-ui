/* The flood example ticks ten times and the list keeps the rows the operator
   was looking at: scrolled half way, the same rows stand in view afterwards.
   jsdom has no layout, so this is the browser's. */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES } from "./pages";
import { openExample } from "./navigation";

const FLOOD = EXAMPLE_ADDRESSES.find((one) => one.pageId === "trips-and-floods" && one.exampleId.includes("ticks"))!;

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

test("Ten ticks leave the same rows in view of a list scrolled half way", async ({ page }) => {
  await openExample(page, FLOOD.pageId, FLOOD.exampleId);
  const stage = page.locator(`[data-example="${FLOOD.exampleId}"]`);
  const area = stage.locator('div[style*="max-height"]').first();
  await area.evaluate((node) => {
    node.scrollTop = (node.scrollHeight - node.clientHeight) / 2;
  });

  /* The index of the first row that stands fully in view, and how many do. */
  const inView = () =>
    area.evaluate((node) => {
      const top = node.getBoundingClientRect().top;
      const bottom = node.getBoundingClientRect().bottom;
      const rows = [...node.querySelectorAll("tbody tr")];
      const visible = rows.flatMap((row, index) => {
        const box = row.getBoundingClientRect();
        return box.top >= top && box.bottom <= bottom ? [index] : [];
      });
      return { first: visible[0], count: visible.length, scrollTop: node.scrollTop };
    });

  const before = await inView();
  expect(before.first).toBeGreaterThan(100);
  for (let tick = 0; tick < 10; tick += 1) await stage.getByRole("button", { name: "Tick" }).click();
  const after = await inView();
  expect(after).toEqual(before);
});
