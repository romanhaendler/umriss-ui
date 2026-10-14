/* Taking a widget by its head: the other widgets make room, a placeholder
   marks the landing place, letting go is one step and Escape is none. */

import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

const example = (page: Page) => page.locator('[data-example="dispatcher"]');
const order = (page: Page) =>
  example(page).locator("[data-widget]").evaluateAll((els) => els.map((el) => el.getAttribute("data-widget")));
const headOf = (page: Page, id: string): Locator => example(page).locator(`[data-widget="${id}"] > :first-child`);
const announcement = (page: Page) => page.locator("[data-umriss-announcer]");

async function centre(locator: Locator) {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + 14 };
}

/** Presses on a head and moves the mouse to a point, in steps. */
async function dragTo(page: Page, id: string, to: { x: number; y: number }, release = true) {
  const from = await centre(headOf(page, id));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  if (release) await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await openExample(page, "dashboard", "dispatcher");
  await example(page).getByRole("button", { name: "Edit" }).click();
});

test("@quick dragging a head over another widget and letting go moves it there, as one announced step", async ({ page }) => {
  const target = await centre(headOf(page, "f4"));
  await dragTo(page, "f1", { x: target.x + 30, y: target.y }, false);
  await expect(example(page).locator("[data-placeholder]")).toHaveCount(1);
  await page.mouse.up();
  await expect(example(page).locator("[data-placeholder]")).toHaveCount(0);
  expect((await order(page)).slice(0, 4)).toEqual(["f2", "f3", "f4", "f1"]);
  await expect(announcement(page)).toHaveText("Orders: moved from place 1 to place 4 of 8");
  await example(page).getByRole("button", { name: "Done" }).click();
});

test("the placeholder has the size of the widget and stands where the others left room", async ({ page }) => {
  const size = (await example(page).locator('[data-widget="f1"]').boundingBox())!;
  const target = await centre(headOf(page, "f4"));
  await dragTo(page, "f1", { x: target.x + 30, y: target.y }, false);
  const holder = (await example(page).locator("[data-placeholder]").boundingBox())!;
  expect(holder.width).toBeCloseTo(size.width, 0);
  expect(holder.height).toBeCloseTo(size.height, 0);
  const f4 = (await example(page).locator('[data-widget="f4"]').boundingBox())!;
  expect(f4.x).toBeLessThan(holder.x);
  await page.mouse.up();
});

test("Escape puts the widget back and announces the cancel", async ({ page }) => {
  const before = await order(page);
  const target = await centre(headOf(page, "f4"));
  await dragTo(page, "f1", { x: target.x + 30, y: target.y }, false);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  expect(await order(page)).toEqual(before);
  await expect(example(page).locator("[data-placeholder]")).toHaveCount(0);
  await expect(announcement(page)).toHaveText("Orders: move cancelled");
  await example(page).getByRole("button", { name: "Done" }).click();
  await expect(example(page).getByRole("button", { name: "Edit" })).toBeVisible();
});

test("a press and release on the head without movement is a click, not a drag", async ({ page }) => {
  const before = await order(page);
  await headOf(page, "f2").click();
  expect(await order(page)).toEqual(before);
  await expect(example(page).locator("[data-placeholder]")).toHaveCount(0);
});

test("a head carries touch-action none and a body does not", async ({ page }) => {
  const touch = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).touchAction);
  expect(await touch(headOf(page, "f1"))).toBe("none");
  expect(await touch(example(page).locator('[data-widget="f1"] > :last-child'))).not.toBe("none");
});

test("near the bottom edge of the window the page scrolls during a drag", async ({ page }) => {
  const from = await centre(headOf(page, "f1"));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 10, from.y + 40, { steps: 4 });
  const size = page.viewportSize()!;
  await page.mouse.move(from.x + 10, size.height - 6, { steps: 6 });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await page.mouse.up();
});

test.describe("touch", () => {
  test.use({ hasTouch: true, viewport: { width: 700, height: 500 } });

  test("a finger on a body scrolls the page in the mode", async ({ page, context }) => {
    const body = example(page).locator('[data-widget="t1"] > :last-child');
    await body.scrollIntoViewIfNeeded();
    const start = await page.evaluate(() => window.scrollY);
    const box = (await body.boundingBox())!;
    const cdp = await context.newCDPSession(page);
    const x = box.x + box.width / 2;
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", y?: number) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: y === undefined ? [] : [{ x, y }] });
    await touch("touchStart", box.y + box.height / 2);
    for (let step = 1; step <= 8; step++) {
      await touch("touchMove", box.y + box.height / 2 - step * 12);
      await page.waitForTimeout(20);
    }
    await touch("touchEnd");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(start);
  });
});
