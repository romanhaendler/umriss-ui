/* Grid mode in the browser (table-grid-mode 02, 03): what jsdom cannot show
   - the real Tab order, the ring the Active cell draws, a virtual window
   scrolling a row in for the keys, an edit that the example applies and the
   date picker's pick. Behaviour, light only; the pictures are the examples'
   own in `screenshots.spec.ts`. */

import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";
import { EXAMPLE_ADDRESSES } from "./pages";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const example = (page: Page, id: string) => page.locator(`[data-example="${id}"]`);
/** The page an example stands on: grid mode and edits are two pages. */
const pageOf = (id: string) => EXAMPLE_ADDRESSES.find((a) => a.exampleId === id)!.pageId;

/** Tab from the example's code toggle into its table: the table's one stop. */
async function tabIn(page: Page, id: string) {
  await openExample(page, pageOf(id), id);
  await example(page, id).scrollIntoViewIfNeeded();
  await example(page, id).locator(".exampleToggle").first().focus();
  await page.keyboard.press("Tab");
}

const focused = (page: Page) => page.locator(":focus");
const lineOf = (page: Page) => focused(page).evaluate((el) => el.parentElement!.getAttribute("data-grid-line"));

test("the grid is one tab stop, and its Active cell shows the shared ring inside its edges", async ({ page }) => {
  await tabIn(page, "grid-mode");
  await expect(focused(page)).toHaveAttribute("tabindex", "0");
  expect(await lineOf(page)).toBe("row:checkout");
  const ring = await focused(page).evaluate((el) => getComputedStyle(el).boxShadow);
  expect(ring).toContain("inset");
  /* The next Tab leaves the table: nothing inside it is a stop of its own. */
  await page.keyboard.press("Tab");
  expect(await focused(page).evaluate((el) => !!el.closest("table"))).toBe(false);
});

test("the arrows, Home, End and Ctrl walk the cells; Enter reaches a checkbox and Escape leaves it", async ({ page }) => {
  await tabIn(page, "grid-mode");
  await page.keyboard.press("ArrowRight");
  await expect(focused(page)).toHaveText("Checkout");
  await page.keyboard.press("ArrowDown");
  await expect(focused(page)).toHaveText("Billing");
  await page.keyboard.press("End");
  expect(await focused(page).locator("button").count()).toBe(1);
  await page.keyboard.press("Control+End");
  expect(await lineOf(page)).toBe("foot");
  await page.keyboard.press("Control+Home");
  expect(await lineOf(page)).toBe("head");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(focused(page)).toHaveAttribute("type", "checkbox");
  await page.keyboard.press("Space");
  await expect(focused(page)).toBeChecked();
  await page.keyboard.press("Escape");
  expect(await focused(page).evaluate((el) => el.tagName)).toBe("TD");
});

test("typing starts an edit, Enter commits, and the cell shows what the application applied", async ({ page }) => {
  await tabIn(page, "comments-column");
  await page.keyboard.press("End");
  await page.keyboard.type("Van loaded late");
  await expect(focused(page)).toHaveValue("Van loaded late");
  await page.keyboard.press("Enter");
  await expect(focused(page)).toHaveText("Van loaded late");
  expect(await focused(page).evaluate((el) => el.tagName)).toBe("TD");
  /* Escape drops a draft. */
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("F2");
  await page.keyboard.type(" - no");
  await page.keyboard.press("Escape");
  await expect(focused(page)).toHaveText("Van swapped at 10:40");
});

test("a capacity outside its range keeps the editor open with the message; Tab commits and moves on", async ({ page }) => {
  await tabIn(page, "validated-edits");
  const table = example(page, "validated-edits").locator("table");
  const before = await table.boundingBox();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  const cell = await focused(page).boundingBox();
  await page.keyboard.type("120");
  await page.keyboard.press("Enter");
  const field = example(page, "validated-edits").getByLabel("Edit Capacity: Maya Lindgren");
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute("aria-invalid", "true");
  /* The message hangs beneath the cell in a popover, and nothing in the table
     shifts - the editor lies over the cell at its size (table-grid-mode 05). */
  const message = page.getByText("Between 4 and 40 hours a week", { exact: true }).and(page.locator("[aria-hidden='true']"));
  await expect(message).toBeVisible();
  expect((await message.boundingBox())!.y).toBeGreaterThanOrEqual(cell!.y + cell!.height);
  expect(await table.boundingBox()).toEqual(before);
  const editor = await field.boundingBox();
  expect(editor!.y).toBeGreaterThanOrEqual(cell!.y);
  expect(editor!.y + editor!.height).toBeLessThanOrEqual(cell!.y + cell!.height);
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("36");
  await expect(message).toHaveCount(0);
  await page.keyboard.press("Tab");
  await expect(example(page, "validated-edits").getByLabel("Edit Role: Maya Lindgren")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(example(page, "validated-edits")).toContainText("Last edit: Maya Lindgren, capacity");
  await expect(example(page, "validated-edits").locator("tr[data-grid-line='row:maya']")).toContainText("36");
});

test("a day picked in the date editor commits at once", async ({ page }) => {
  await tabIn(page, "validated-edits");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  /* The picker's trigger keeps its Enter: it opens the calendar. */
  await page.keyboard.press("Enter");
  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Today" }).click();
  await expect(example(page, "validated-edits")).toContainText("Last edit: Maya Lindgren, availableFrom");
  await expect(example(page, "validated-edits").locator("tr[data-grid-line='row:maya']")).toContainText("17/03/2026");
});

test("in a virtual window the keys walk to rows never rendered, and the grid scrolls them in", async ({ page }) => {
  /* Grouped, the table puts up a toolbar for the grouping's tag: that is the
     stop before the grid's. */
  await openExample(page, "grid-mode", "the-whole-grid");
  await example(page, "the-whole-grid").locator("td[tabindex='0']").focus();
  expect(await lineOf(page)).toBe('header:["value:East Gate depot"]');
  await page.keyboard.press("Control+End");
  expect(await lineOf(page)).toBe("foot");
  await page.keyboard.press("ArrowUp");
  await expect.poll(() => lineOf(page)).toMatch(/^row:x\d+$/);
  await expect(focused(page)).toBeInViewport();
  await page.keyboard.press("Control+Home");
  expect(await lineOf(page)).toBe("head");
});

test("the keys keep the Active cell clear of the sticky head and the pinned block", async ({ page }) => {
  /* The scroll area's scroll-padding is the head's height and the blocks'
     widths: the browser's own scroll into view stops short of them
     (table-grid-mode 05). Narrow, so that it scrolls both ways. */
  await page.setViewportSize({ width: 420, height: 900 });
  await openExample(page, "grid-mode", "the-whole-grid");
  const scroller = example(page, "the-whole-grid").locator("table").locator("xpath=..");
  await example(page, "the-whole-grid").locator("td[tabindex='0']").focus();
  const clear = async () => {
    const [cell, head, block] = await Promise.all([
      focused(page).boundingBox(),
      example(page, "the-whole-grid").locator("thead").boundingBox(),
      example(page, "the-whole-grid").locator("thead th").nth(1).boundingBox(),
    ]);
    expect(cell!.y).toBeGreaterThanOrEqual(head!.y + head!.height - 1);
    expect(cell!.x).toBeGreaterThanOrEqual(block!.x + block!.width - 1);
  };
  for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  expect(await scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  expect(await scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  /* Back to the first column after the block: Home, then right past the
     selection and the pinned parcel. */
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await clear();
  for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowUp");
  await clear();
});

/* ADR-0036: the first click edits, a row is saved on purpose, rows are added
   and deleted by the table's own buttons. */

test("a click opens a cell's editor, and the pointer says the cell edits", async ({ page }) => {
  await openExample(page, pageOf("comments-column"), "comments-column");
  const cell = example(page, "comments-column").locator("tr[data-grid-line='row:T-02'] td[data-edit]");
  expect(await cell.evaluate((el) => getComputedStyle(el).cursor)).toBe("text");
  await cell.click();
  await expect(focused(page)).toHaveValue("Van swapped at 10:40");
});

test("a click on a day opens its calendar at once", async ({ page }) => {
  await openExample(page, pageOf("validated-edits"), "validated-edits");
  await example(page, "validated-edits").locator("tr[data-grid-line='row:maya'] td").last().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("a click in the calendar is inside the edit; a click outside the grid ends it", async ({ page }) => {
  await openExample(page, pageOf("validated-edits"), "validated-edits");
  const table = example(page, "validated-edits");
  await table.locator("tr[data-grid-line='row:maya'] td").last().click();
  const panel = page.getByRole("dialog");
  await panel.getByRole("button", { name: "Next month" }).click();
  await expect(panel).toBeVisible();
  await expect(table.getByLabel("Edit Available from: Maya Lindgren")).toBeVisible();
  await page.keyboard.press("Escape");
  /* A text: typed, then a click beside the table - reported and closed. */
  await table.locator("tr[data-grid-line='row:maya'] td[data-edit]").first().click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("36");
  await table.locator(".exampleLead, p").first().click();
  await expect(table.getByLabel("Edit Capacity: Maya Lindgren")).toHaveCount(0);
  await expect(table).toContainText("Last edit: Maya Lindgren, capacity");
});

test("a row draft opens whole, keeps its buttons in view, refuses to be left and is saved on purpose", async ({ page }) => {
  await openExample(page, pageOf("save-a-row-on-purpose"), "save-a-row-on-purpose");
  const table = example(page, "save-a-row-on-purpose");
  await table.locator("tr[data-grid-line='row:P-1'] td[data-edit]").nth(1).click();
  await expect(table.getByLabel("Edit Owner: Checkout redesign")).toBeFocused();
  await expect(table.getByLabel("Edit Budget (days): Checkout redesign")).toBeVisible();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("Rui Costa");
  await table.locator("tr[data-grid-line='row:P-3'] td[data-edit]").first().click();
  await expect(page.getByText("Save or discard this row first")).toBeVisible();
  await expect(table.getByLabel("Edit Owner: Checkout redesign")).toBeFocused();
  await table.getByRole("button", { name: "Save: Checkout redesign" }).click();
  await expect(table).toContainText("Saved Checkout redesign: owner");
  await expect(table.locator("tr[data-grid-line='row:P-1']")).toContainText("Rui Costa");
});

test("a new row stands above the rows until it is saved; a delete asks first", async ({ page }) => {
  await openExample(page, pageOf("keep-a-list"), "keep-a-list");
  const table = example(page, "keep-a-list");
  await table.getByRole("button", { name: "New row" }).click();
  await expect(table.locator("tbody tr").first()).toHaveAttribute("data-grid-line", "new");
  await expect(table.getByLabel("Edit Item: New row")).toBeFocused();
  await page.keyboard.type("Kiln door seal");
  await page.keyboard.press("Enter");
  await expect(table.locator("tr[data-grid-line='row:i5']")).toContainText("Kiln door seal");
  await table.getByRole("button", { name: "Delete: Kiln door seal" }).click();
  await expect(table.locator("tr[data-grid-line='row:i5']").getByText("Delete?")).toBeVisible();
  await table.getByRole("button", { name: "Delete: Kiln door seal" }).click();
  await expect(table).not.toContainText("Kiln door seal");
});

test("opening a row draft or a new row shifts nothing: the rows keep their height", async ({ page }) => {
  const height = (row: Locator) => row.evaluate((el) => el.getBoundingClientRect().height);
  await openExample(page, pageOf("save-a-row-on-purpose"), "save-a-row-on-purpose");
  let table = example(page, "save-a-row-on-purpose");
  const row = table.locator("tr[data-grid-line='row:P-1']");
  const before = await height(row);
  await row.locator("td[data-edit]").first().click();
  await expect(table.getByRole("button", { name: "Save: Checkout redesign" })).toBeVisible();
  expect(await height(row)).toBe(before);

  await openExample(page, pageOf("keep-a-list"), "keep-a-list");
  table = example(page, "keep-a-list");
  const other = await height(table.locator("tr[data-grid-line='row:i1']"));
  await table.getByRole("button", { name: "New row" }).click();
  expect(await height(table.locator("tr[data-grid-line='new']"))).toBe(other);
  expect(await height(table.locator("tr[data-grid-line='row:i1']"))).toBe(other);
});
