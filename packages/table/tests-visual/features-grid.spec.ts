/* Grid mode in the browser (table-grid-mode 02, 03): what jsdom cannot show
   - the real Tab order, the ring the Active cell draws, a virtual window
   scrolling a row in for the keys, an edit that the example applies and the
   date picker's pick. Behaviour, light only; the pictures are the examples'
   own in `screenshots.spec.ts`. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const example = (page: Page, id: string) => page.locator(`[data-example="${id}"]`);

/** Tab from the example's code toggle into its table: the table's one stop. */
async function tabIn(page: Page, id: string) {
  await openExample(page, "table", id);
  await example(page, id).scrollIntoViewIfNeeded();
  await example(page, id).locator(".exampleToggle").first().focus();
  await page.keyboard.press("Tab");
}

const focused = (page: Page) => page.locator(":focus");
const lineOf = (page: Page) => focused(page).evaluate((el) => el.parentElement!.getAttribute("data-grid-line"));

test("the grid is one tab stop, and its Active cell shows the shared ring inside its edges", async ({ page }) => {
  await tabIn(page, "grid-mode");
  await expect(focused(page)).toHaveAttribute("tabindex", "0");
  expect(await lineOf(page)).toBe("row:P-101");
  const ring = await focused(page).evaluate((el) => getComputedStyle(el).boxShadow);
  expect(ring).toContain("inset");
  /* The next Tab leaves the table: nothing inside it is a stop of its own. */
  await page.keyboard.press("Tab");
  expect(await focused(page).evaluate((el) => !!el.closest("table"))).toBe(false);
});

test("the arrows, Home, End and Ctrl walk the cells; Enter reaches a checkbox and Escape leaves it", async ({ page }) => {
  await tabIn(page, "grid-mode");
  await page.keyboard.press("ArrowRight");
  await expect(focused(page)).toHaveText("P-101");
  await page.keyboard.press("ArrowDown");
  await expect(focused(page)).toHaveText("P-102");
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
  await page.keyboard.type("Belt slips");
  await expect(focused(page)).toHaveValue("Belt slips");
  await page.keyboard.press("Enter");
  await expect(focused(page)).toHaveText("Belt slips");
  expect(await focused(page).evaluate((el) => el.tagName)).toBe("TD");
  /* Escape drops a draft. */
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("F2");
  await page.keyboard.type(" - no");
  await page.keyboard.press("Escape");
  await expect(focused(page)).toHaveText("Tool change at 10:40");
});

test("a setpoint outside its range keeps the editor open with the message; Tab commits and moves on", async ({ page }) => {
  await tabIn(page, "setpoint-list");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.type("120");
  await page.keyboard.press("Enter");
  const field = example(page, "setpoint-list").getByLabel("Edit Setpoint: TIC-101");
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(example(page, "setpoint-list")).toContainText("Between 60 and 95 °C");
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("85");
  await expect(example(page, "setpoint-list")).not.toContainText("Between 60 and 95 °C");
  await page.keyboard.press("Tab");
  await expect(example(page, "setpoint-list").getByLabel("Edit Mode: TIC-101")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(example(page, "setpoint-list")).toContainText("Last edit: TIC-101, setpoint");
  await expect(example(page, "setpoint-list").locator("tr[data-grid-line='row:TIC-101']")).toContainText("85.0");
});

test("a day picked in the date editor commits at once", async ({ page }) => {
  await tabIn(page, "setpoint-list");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  /* The picker's trigger keeps its Enter: it opens the calendar. */
  await page.keyboard.press("Enter");
  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Today" }).click();
  await expect(example(page, "setpoint-list")).toContainText("Last edit: TIC-101, reviewed");
  await expect(example(page, "setpoint-list").locator("tr[data-grid-line='row:TIC-101']")).toContainText("17/03/2026");
});

test("in a virtual window the keys walk to rows never rendered, and the grid scrolls them in", async ({ page }) => {
  /* Grouped, the table puts up a toolbar for the grouping's tag: that is the
     stop before the grid's. */
  await openExample(page, "table", "the-whole-grid");
  await example(page, "the-whole-grid").locator("td[tabindex='0']").focus();
  expect(await lineOf(page)).toBe('header:["value:Distribution"]');
  await page.keyboard.press("Control+End");
  expect(await lineOf(page)).toBe("foot");
  await page.keyboard.press("ArrowUp");
  await expect.poll(() => lineOf(page)).toMatch(/^row:x\d+$/);
  await expect(focused(page)).toBeInViewport();
  await page.keyboard.press("Control+Home");
  expect(await lineOf(page)).toBe("head");
});
