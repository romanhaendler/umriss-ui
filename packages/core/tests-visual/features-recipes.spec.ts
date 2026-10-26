/* The recipes of core's demo, as a user works them: the invoice's error
   summary, the clickable stepper and the app shell at phone width. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test("A failed submit focuses the first invalid field, the summary links to the others and the count is announced", { tag: "@quick" }, async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openExample(page, "formfield", "check-an-invoice-on-submit");
  const stage = page.locator('[data-example="check-an-invoice-on-submit"]');
  await stage.getByRole("button", { name: "Book the invoice" }).click();

  /* The number "INV-31" and the cost centre and the due date fail; the number is first. */
  await expect(stage.getByRole("textbox", { name: /Invoice number/ })).toBeFocused();
  const summary = stage.getByRole("region", { name: "There are 3 problems" });
  await expect(summary.getByRole("link")).toHaveCount(3);
  await expect(page.locator("[data-umriss-announcer]")).toContainText("3 problems with the invoice.");

  await summary.getByRole("link", { name: "Give the due date from the invoice." }).click();
  await expect(stage.getByRole("button", { name: /Due/ })).toBeFocused();
});

test("Choosing a done step makes it current and moves the focus to its heading", { tag: "@quick" }, async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openExample(page, "stepper", "move-on-yourself");
  const stage = page.locator('[data-example="move-on-yourself"]');
  await expect(stage.getByRole("heading", { name: "Plan leave" })).not.toBeFocused();
  await stage.getByRole("button", { name: "Choose people" }).click();
  await expect(stage.getByRole("heading", { name: "Choose people" })).toBeFocused();
  await expect(stage.locator('[aria-current="step"]')).toContainText("Choose people");
});

test("At 375 px the shell shows the menu button and no navigation; the drawer opens and closes on a link", { tag: "@quick" }, async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await openExample(page, "drawer", "an-app-shell");
  const stage = page.locator('[data-example="an-app-shell"]');
  await expect(stage.getByRole("button", { name: "Menu" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  await stage.getByRole("button", { name: "Menu" }).click();
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Tours" }).click();
  await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  await expect(stage.getByRole("heading", { name: "Tours" })).toBeVisible();
});

test("At desktop width the navigation stands beside the page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openExample(page, "drawer", "an-app-shell");
  const stage = page.locator('[data-example="an-app-shell"]');
  await expect(stage.getByRole("button", { name: "Menu" })).toHaveCount(0);
  await expect(stage.getByRole("navigation", { name: "Main" })).toBeVisible();
});
