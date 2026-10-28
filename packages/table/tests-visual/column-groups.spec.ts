/* Column groups in the browser: the sticky head holds both rows, and a group
   that pinning splits shows its label over each part. Run against the example
   "A header over columns". */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark", "Layout only once (light)");
});

const EXAMPLE = '[data-example="a-header-over-columns"]';

test.beforeEach(async ({ page }) => {
  await openExample(page, "column", "a-header-over-columns");
});

test("the group cell stands over its columns and a cell's headers include it", { tag: "@quick" }, async ({ page }) => {
  const table = page.locator(EXAMPLE);
  const group = (await table.getByRole("columnheader", { name: "Q1" }).boundingBox())!;
  const jan = (await table.getByRole("columnheader", { name: "Jan" }).boundingBox())!;
  const mar = (await table.getByRole("columnheader", { name: "Mar" }).boundingBox())!;
  expect(group.y + group.height).toBeLessThanOrEqual(jan.y + 1);
  expect(Math.abs(group.x - jan.x)).toBeLessThan(2);
  expect(Math.abs(group.x + group.width - (mar.x + mar.width))).toBeLessThan(2);
  await expect(table.locator("thead")).toMatchAriaSnapshot(`
    - row:
      - columnheader "Q1"
  `);
});

test("pinning one column of a group shows the label over the pinned part and the rest", async ({ page }) => {
  const table = page.locator(EXAMPLE);
  await table.getByRole("button", { name: "Columns" }).click();
  await page.getByRole("button", { name: "Pin Feb to start" }).click();
  await page.keyboard.press("Escape");
  await expect(table.getByRole("columnheader", { name: "Q1" })).toHaveCount(2);
});

test("the sticky head holds both rows: the column row sticks below the group row", async ({ page }) => {
  const table = page.locator(EXAMPLE);
  const group = (await table.getByRole("columnheader", { name: "Q1" }).boundingBox())!;
  const top = await table.getByRole("columnheader", { name: "Jan" }).evaluate((el) => parseFloat(getComputedStyle(el).top));
  expect(Math.abs(top - group.height)).toBeLessThan(1.5);
});
