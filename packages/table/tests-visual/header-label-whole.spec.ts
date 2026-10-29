/* A header label that fits its column is shown whole; one in a column narrower
   than its label ends in an ellipsis and keeps its full text as the name.
   Run against the example "Save a row on purpose". */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark", "Layout only once (light)");
});

const head = (page: Page, name: string) =>
  page.locator('[data-example="save-a-row-on-purpose"]').getByRole("columnheader", { name });
const measure = (page: Page, name: string) =>
  head(page, name)
    .locator("span")
    .first()
    .evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth, overflow: getComputedStyle(el).textOverflow }));

test.beforeEach(async ({ page }) => {
  await openExample(page, "edits", "save-a-row-on-purpose");
});

test("a header label that fits its column is not cut", { tag: "@quick" }, async ({ page }) => {
  const { scroll, client } = await measure(page, "Budget (days)");
  expect(scroll).toBeLessThanOrEqual(client);
});

test("every sortable header label in the example is shown whole", { tag: "@quick" }, async ({ page }) => {
  for (const name of ["Project", "Phase", "Owner", "Budget (days)"]) {
    const { scroll, client } = await measure(page, name);
    expect(scroll, name).toBeLessThanOrEqual(client);
  }
});

test("a column narrower than its label ends in an ellipsis and keeps its name", { tag: "@quick" }, async ({ page }) => {
  /* The table holds a column's width from its head and from its values' size
     variable: the whole column is set. */
  await head(page, "Budget (days)").evaluate((th) => {
    const index = (th as HTMLTableCellElement).cellIndex;
    for (const row of Array.from(th.closest("table")!.rows)) {
      const cell = row.cells[index]!;
      cell.style.width = "70px";
      cell.querySelector<HTMLElement>("div")?.style.setProperty("--_table-width", "70px");
    }
  });
  const { scroll, client, overflow } = await measure(page, "Budget (days)");
  expect(scroll).toBeGreaterThan(client);
  expect(overflow).toBe("ellipsis");
  await expect(head(page, "Budget (days)")).toBeVisible();
});
