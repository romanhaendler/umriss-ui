/* Flex widths and "Fit all columns", measured in the browser: the share
   arithmetic and the head's markup stand in tests-unit/flexWidths.test.tsx.
   Run against the example "Columns that share the width". */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark", "Layout only once (light)");
});

const example = (page: Page, id: string) => page.locator(`[data-example="${id}"]`);
const widthOf = async (page: Page, name: string) =>
  (await example(page, "columns-that-share-the-width").getByRole("columnheader", { name }).boundingBox())!.width;

test.beforeEach(async ({ page }) => {
  await openExample(page, "width-and-pinning", "columns-that-share-the-width");
});

test("two flex columns beside a fixed one split the rest equally and keep minWidth", { tag: "@quick" }, async ({ page }) => {
  const table = example(page, "columns-that-share-the-width");
  const frame = (await table.locator("table").boundingBox())!.width;
  const fixed = await widthOf(page, "Shipment");
  const customer = await widthOf(page, "Customer");
  const note = await widthOf(page, "Note");
  expect(Math.abs(customer - note)).toBeLessThan(2);
  expect(fixed + customer + note).toBeGreaterThan(frame - 2);

  await page.setViewportSize({ width: 420, height: 800 });
  expect(await widthOf(page, "Customer")).toBeGreaterThanOrEqual(139);
  expect(await widthOf(page, "Note")).toBeGreaterThanOrEqual(159);
});

test("dragging a flex column's grip fixes its width, and it stays when the frame changes", async ({ page }) => {
  const table = example(page, "columns-that-share-the-width");
  const head = table.getByRole("columnheader", { name: "Customer" });
  const box = (await head.boundingBox())!;
  await head.locator("span[role='presentation']").hover();
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 40, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  const dragged = await widthOf(page, "Customer");
  expect(Math.abs(dragged - (box.width - 40))).toBeLessThan(2);
  await page.setViewportSize({ width: 900, height: 800 });
  expect(Math.abs((await widthOf(page, "Customer")) - dragged)).toBeLessThan(2);
});

test("Fit all columns sets every column to its content", async ({ page }) => {
  const table = example(page, "columns-that-share-the-width");
  const before = await widthOf(page, "Shipment");
  await table.getByRole("button", { name: "Columns" }).click();
  await page.getByRole("button", { name: "Fit all columns" }).click();
  await page.keyboard.press("Escape");
  const fitted = await widthOf(page, "Shipment");
  expect(fitted).toBeLessThan(before);
  expect((await widthOf(page, "Note")) + 2).toBeGreaterThan(await widthOf(page, "Customer"));
});
