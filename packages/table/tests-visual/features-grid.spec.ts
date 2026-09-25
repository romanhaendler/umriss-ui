/* Grid mode in the browser (table-grid-mode 02, 03): what jsdom cannot show
   - the real Tab order, the ring the Active cell draws, a virtual window
   scrolling a row in for the keys, an edit that the example applies and the
   date picker's pick. Behaviour, light only; the pictures are the examples'
   own in `screenshots.spec.ts`. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
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
