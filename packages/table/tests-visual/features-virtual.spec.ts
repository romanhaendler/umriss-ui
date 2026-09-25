/* Interaction tests of the virtualised table – the counterparts of the suite
   that stood in the visual tests of @umriss-ui/core until `umriss-table` 14,
   all of them against Table › virtualisation.

   Screenshots cannot carry these guarantees: whether a row that was never
   rendered becomes reachable by scrolling, whether the header stays put and
   whether the focus can wander into an unrendered area is behaviour. Only in the
   light project. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await openExample(page, "virtualisation", "virtualisation");
  await example(page).scrollIntoViewIfNeeded();
});

const example = (page: Page) => page.locator('[data-example="virtualisation"]');

/* The scroll area brings the table itself with it. */
const scrollArea = (page: Page) => example(page).locator("table").locator("..");

const row = (page: Page, index: number) => example(page).locator(`[data-row="${index}"]`);

/* A human hits the drawn box, and that belongs to the label. */
const box = (page: Page, name: string) => example(page).getByLabel(name).locator("..");

const sortButton = (page: Page, name: string) =>
  example(page).getByRole("columnheader", { name }).getByRole("button", { name, exact: true });

/* ---------------- Only the visible part stands in the document ---------------- */

test("renders a fraction of the rows", async ({ page }) => {
  const rendered = await example(page).locator("[data-row]").count();
  expect(rendered).toBeGreaterThan(0);
  expect(rendered).toBeLessThan(60);
  await expect(example(page)).toContainText("of 20,000 rendered");
});

test("the scrollbar measures the full set", async ({ page }) => {
  /* What is checked is the guarantee and no pixel count: the row height depends
     on density, font size and zoom. */
  const { scrollHeight, rowHeight } = await scrollArea(page).evaluate((el) => ({
    scrollHeight: el.scrollHeight,
    rowHeight: el.querySelector("[data-row]")!.getBoundingClientRect().height,
  }));
  expect(Math.abs(scrollHeight - 20_000 * rowHeight)).toBeLessThan(200);
});

/* ---------------- Scrolling reaches what was not rendered ---------------- */

test("scrolling brings out rows that were never rendered", async ({ page }) => {
  await expect(row(page, 19_999)).toHaveCount(0);
  await scrollArea(page).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(row(page, 19_999)).toBeVisible();
  await expect(example(page)).toContainText("REQ-20000");
  await expect(row(page, 0)).toHaveCount(0);
});

test("the way back leads to the beginning again", async ({ page }) => {
  await scrollArea(page).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(row(page, 19_999)).toBeVisible();
  await scrollArea(page).evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect(row(page, 0)).toBeVisible();
  await expect(example(page)).toContainText("REQ-00001");
});

/* ---------------- Header and row header stick ---------------- */

test("the header stays put while scrolling", async ({ page }) => {
  const headerCell = example(page).getByRole("columnheader", { name: "Request" });
  const area = scrollArea(page);
  const areaBefore = (await area.boundingBox())!;
  const headerBefore = (await headerCell.boundingBox())!;

  await area.evaluate((el) => {
    el.scrollTop = Math.round(el.scrollHeight / 2);
  });
  await expect(row(page, 0)).toHaveCount(0);

  const headerAfter = (await headerCell.boundingBox())!;
  expect(Math.abs(headerAfter.y - headerBefore.y)).toBeLessThan(2);
  expect(headerAfter.y).toBeGreaterThanOrEqual(areaBefore.y - 2);
  await expect(headerCell).toBeVisible();
});

test("the row header sticks while scrolling sideways", async ({ page }) => {
  const area = scrollArea(page);
  /* Without a sideways scroll the test would prove nothing. */
  expect(await area.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(100);

  await area.evaluate((el) => {
    el.scrollTop = Math.round(el.scrollHeight / 3);
  });
  await expect(row(page, 0)).toHaveCount(0);

  const header = example(page).locator("[data-row]").first().locator("th[scope='row']");
  const before = (await header.boundingBox())!;
  await area.evaluate((el) => {
    el.scrollLeft = 100;
  });
  const after = (await header.boundingBox())!;

  expect(Math.abs(after.x - before.x)).toBeLessThan(4);
  await expect(example(page).getByRole("columnheader", { name: "Request" })).toBeVisible();
});

/* ---------------- The keyboard reaches what was not rendered ---------------- */

test("the arrow keys wander from row to row", async ({ page }) => {
  await row(page, 2).click();
  await expect(row(page, 2)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(row(page, 3)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(row(page, 2)).toBeFocused();
});

test("the keyboard alone reaches into the grid", async ({ page }) => {
  await example(page).getByPlaceholder("Request or service").focus();
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await row(page, 0).evaluate((el) => el === document.activeElement).catch(() => false)) break;
  }
  await expect(row(page, 0)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(row(page, 1)).toBeFocused();
});

test("there is exactly one tab stop in the grid", async ({ page }) => {
  expect(await example(page).locator('[data-row][tabindex="0"]').count()).toBe(1);
});

test("End fetches the focus into an area that was never rendered", async ({ page }) => {
  await row(page, 2).click();
  await expect(row(page, 19_999)).toHaveCount(0);
  await page.keyboard.press("End");
  await expect(row(page, 19_999)).toBeFocused();
  await expect(row(page, 19_999)).toBeInViewport();
});

test("Home leads back out of the unrendered", async ({ page }) => {
  await row(page, 2).click();
  await page.keyboard.press("End");
  await expect(row(page, 19_999)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(row(page, 0)).toBeFocused();
  await expect(row(page, 0)).toBeInViewport();
});

test("the focus does not land behind the sticky header", async ({ page }) => {
  await row(page, 2).click();
  await page.keyboard.press("End");
  await expect(row(page, 19_999)).toBeFocused();
  await page.keyboard.press("Home");
  const headerBox = (await example(page).locator("thead").boundingBox())!;
  const rowBox = (await row(page, 0).boundingBox())!;
  expect(rowBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 2);
});

/* ---------------- The selection hangs on the set ---------------- */

test("a selection survives its row leaving the window", async ({ page }) => {
  const area = scrollArea(page);
  await box(page, "Select REQ-00003").click();
  await expect(example(page)).toContainText("1 selected");

  await area.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(row(page, 2)).toHaveCount(0);
  await expect(example(page)).toContainText("1 selected");

  await area.evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect(example(page).getByLabel("Select REQ-00003")).toBeChecked();
});

test("select all reaches over the whole set, not over the window", async ({ page }) => {
  await box(page, "Select all").click();
  await expect(example(page)).toContainText("20000 selected");
});

/* ---------------- Sorting and searching act on the whole set ---------------- */

test("sorting orders every row, not only the rendered ones", async ({ page }) => {
  await sortButton(page, "Request").click();
  // Descending: the highest id now stands on top.
  await expect(row(page, 0)).toContainText("REQ-20000");
});

test("searching shrinks the set and the scrollbar", async ({ page }) => {
  const area = scrollArea(page);
  const before = await area.evaluate((el) => el.scrollHeight);
  await example(page).getByPlaceholder("Request or service").fill("REQ-00001");
  await expect.poll(() => area.evaluate((el) => el.scrollHeight)).toBeLessThan(before);
  await expect(example(page)).toContainText("REQ-00001");
});

test("there is no paging beside virtualisation", async ({ page }) => {
  await expect(example(page).getByRole("navigation", { name: "Pagination" })).toHaveCount(0);
});
