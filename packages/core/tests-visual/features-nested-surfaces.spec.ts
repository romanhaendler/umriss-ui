/* A surface opened from inside a panel belongs to that panel, in a real
   browser: inside a Modal, and on a phone-width screen. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test("A Select inside a Popover inside a Modal: a pick reaches, Escape closes only the list", async ({ page }) => {
  await openExample(page, "modal", "a-date-in-a-window");
  await page.getByRole("button", { name: "Set the due date" }).click();
  const window = page.getByRole("dialog", { name: "Due date" });
  await expect(window).toBeVisible();

  await window.getByRole("button", { name: "Due", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "Select date" });
  await expect(panel).toBeVisible();

  const month = panel.getByRole("combobox", { name: "Month" });
  await month.click();
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  await list.getByRole("option").nth(0).click();
  await expect(list).toBeHidden();
  await expect(panel).toBeVisible();
  await expect(month).toContainText("January");

  await month.click();
  await expect(list).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(list).toBeHidden();
  await expect(panel).toBeVisible();
  await expect(window).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(window).toBeVisible();
});

test("The typed field, Today and Clear stand in one row at 375 px, with no overflow", { tag: "@quick" }, async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await openExample(page, "datepicker", "pick-a-day");
  const example = page.locator('[data-example="pick-a-day"]');
  // A day must be picked first, or the panel has no Clear.
  await example.getByRole("button", { name: "Delivery date" }).click();
  await page.getByRole("dialog", { name: "Select date" }).getByRole("button", { name: /, 15 / }).first().click();
  await example.getByRole("button", { name: "Delivery date" }).click();

  const panel = page.getByRole("dialog", { name: "Select date" });
  const field = panel.getByRole("textbox", { name: "Type a date" });
  const today = panel.getByRole("button", { name: "Today" });
  const clear = panel.getByRole("button", { name: "Clear", exact: true });
  const [f, t, c] = await Promise.all([field.boundingBox(), today.boundingBox(), clear.boundingBox()]);
  const middle = (box: { y: number; height: number }) => box.y + box.height / 2;
  expect(Math.abs(middle(f!) - middle(t!))).toBeLessThan(4);
  expect(Math.abs(middle(f!) - middle(c!))).toBeLessThan(4);
  expect(f!.width).toBeGreaterThanOrEqual(80);

  const overflow = await page.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Select date"]')!;
    return {
      panel: dialog.scrollWidth - dialog.clientWidth,
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(overflow.panel).toBeLessThanOrEqual(0);
  expect(overflow.page).toBeLessThanOrEqual(0);
});
