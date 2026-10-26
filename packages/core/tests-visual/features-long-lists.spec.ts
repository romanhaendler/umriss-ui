/* A long option list draws only what is in view, in a real browser. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test("A Combobox of 5,000 options draws a window and scrolls to its last option", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "combobox", "thousands-of-cost-centres");
  const input = page.locator('[data-example="thousands-of-cost-centres"]').getByRole("combobox");
  await input.click();
  const options = page.getByRole("option");
  await expect(options.first()).toBeVisible();
  expect(await options.count()).toBeLessThan(100);

  await input.press("End");
  const last = page.getByRole("option", { name: "CC-5000 Support" });
  await expect(last).toBeVisible();
  await expect(last).toHaveAttribute("aria-posinset", "5000");
  expect(await options.count()).toBeLessThan(100);
});

test("A MultiSelect of 3,000 options draws a window of checkboxes", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "multiselect", "thousands-of-assets");
  await page.locator('[data-example="thousands-of-assets"]').getByRole("button", { name: "Choose assets" }).click();
  const boxes = page.getByRole("checkbox");
  await expect(boxes.first()).toBeVisible();
  expect(await boxes.count()).toBeLessThan(100);
});
