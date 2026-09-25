/* The schedule by keyboard (schedule-a11y 02-05): Tab into the plot, the keys
   walking its subtasks and following a dependency, the pointer taking the
   active subtask over, the readout, and a proposed move. Observed through the
   DOM - the tooltip, the live region, what the example writes down. Behaviour
   in light only; the one picture of a focused schedule with an active subtask
   in both themes. */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { openExample } from "./navigation";
import { DAY_OF_PLAN, plotOf } from "./plot";

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const behaviour = () => test.skip(test.info().project.name.endsWith("dark"), "a behaviour test runs once (light)");

/** Tab from the example's code switch until the plot has the focus. */
async function tabIn(page: Page, example: Locator): Promise<Locator> {
  const plot = example.locator("[role='application']");
  await example.locator(".exampleToggle").first().focus();
  for (let i = 0; i < 8 && !(await plot.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
  await expect(plot).toBeFocused();
  return plot;
}

async function firstSchedule(page: Page): Promise<Locator> {
  await openExample(page, "schedule", "first-schedule");
  return page.locator('[data-example="first-schedule"]');
}

const tooltip = (example: Locator) => example.locator("[data-schedule-tooltip]");

test("Tab reaches the plot, which rings and stands on the first subtask in view", async ({ page }) => {
  behaviour();
  const example = await firstSchedule(page);
  const plot = await tabIn(page, example);
  await expect(plot).toHaveAttribute("aria-roledescription", "schedule");
  await expect(tooltip(example)).toContainText("t-01-1");
  const ring = await plot.locator("span[aria-hidden]").last().evaluate((el) => getComputedStyle(el).boxShadow);
  expect(ring).not.toBe("none");
});

test("the arrows walk the lanes, the brackets and t follow a dependency, and the readout speaks once the keys rest", async ({ page }) => {
  behaviour();
  const example = await firstSchedule(page);
  await tabIn(page, example);
  /* The truck's first leg (06:00-07:00) down to the van's nearest, 08:00. */
  await page.keyboard.press("ArrowDown");
  await expect(tooltip(example)).toContainText("t-01-2");
  await page.keyboard.press("ArrowRight");
  await expect(tooltip(example)).toContainText("t-03-2");
  /* Out along the violated handover to the e-van, and back. */
  await page.keyboard.press("]");
  await expect(tooltip(example)).toContainText("t-03-2 → t-03-3");
  await page.keyboard.press("]");
  await expect(tooltip(example)).toContainText("t-03-3");
  await page.keyboard.press("[");
  await page.keyboard.press("[");
  await expect(tooltip(example)).toContainText("t-03-2");
  /* The same way by t and Shift+T, the keys without AltGr. */
  await page.keyboard.press("t");
  await expect(tooltip(example)).toContainText("t-03-2 → t-03-3");
  await page.keyboard.press("Shift+T");
  await expect(tooltip(example)).toContainText("t-03-2");
  await expect(example.locator("[aria-live='polite']")).toHaveText(
    /^Van FP 214 K, T-03 Old Town, t-03-2, 17\/03 10:00–11:30, Overlap with t-01-2, Violated dependency, 15 min short$/,
  );
});

test("the pointer takes the active subtask over, and the keys walk on from it", async ({ page }) => {
  behaviour();
  const example = await firstSchedule(page);
  await tabIn(page, example);
  const plot = await plotOf(page, example, DAY_OF_PLAN);
  await page.mouse.move(plot.x(15, 15), plot.y("e-van"));
  await expect(tooltip(example)).toContainText("t-04-3");
  await page.keyboard.press("ArrowLeft");
  await expect(tooltip(example)).toContainText("t-03-3");
  /* The pointer leaving lets the keys' subtask stand. */
  await page.mouse.move(0, 0);
  await expect(tooltip(example)).toContainText("t-03-3");
});

test("Space selects the active subtask's task, as a click does", async ({ page }) => {
  behaviour();
  await openExample(page, "selection", "selection");
  const example = page.locator('[data-example="selection"]');
  await tabIn(page, example);
  /* Onto an order other than the one selected at the start (A-2043). */
  await page.keyboard.press("ArrowRight");
  const order = (await tooltip(example).locator("span").first().textContent()) ?? "";
  await page.keyboard.press("Space");
  await expect(example.locator("[data-selected-order]")).toHaveText(`Selected: ${order}, at a-2042-1`);
});

test("A focused schedule with an active subtask", async ({ page }, testInfo) => {
  const example = await firstSchedule(page);
  await tabIn(page, example);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowRight");
  await expect(tooltip(example)).toContainText("t-03-2");
  await expect(example).toHaveScreenshot(`keyboard-active-${testInfo.project.name}.png`);
});
