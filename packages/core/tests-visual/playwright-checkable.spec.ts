/* A test runner's `.check()` and `.uncheck()` work without `force`: the real
   input covers its drawn control, so nothing intercepts the pointer. Chromium
   only; light only. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

test("Checkbox, Switch and a radio are checked and unchecked without force", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "checkbox", "checkbox");
  const box = page.locator('[data-example="checkbox"]').getByRole("checkbox").first();
  await box.check();
  await expect(box).toBeChecked();
  await box.uncheck();
  await expect(box).not.toBeChecked();

  await openExample(page, "switch", "on-and-off");
  const sw = page.locator('[data-example="on-and-off"]').getByRole("switch", { name: "Page me at night", exact: true });
  await sw.uncheck();
  await expect(sw).not.toBeChecked();
  await sw.check();
  await expect(sw).toBeChecked();

  await openExample(page, "radiogroup", "radio-group");
  const radios = page.locator('[data-example="radio-group"]').getByRole("radio");
  await radios.nth(1).check();
  await expect(radios.nth(1)).toBeChecked();
});

test("Clicking the label toggles a Checkbox once", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "checkbox", "checkbox");
  const example = page.locator('[data-example="checkbox"]');
  const box = example.getByRole("checkbox").first();
  const before = await box.isChecked();
  await example.locator("label").first().click();
  expect(await box.isChecked()).toBe(!before);
});

test("A MultiSelect option is checked without force", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "multiselect", "chips-in-the-field");
  await page.locator('[data-example="chips-in-the-field"] [aria-haspopup="dialog"]').first().click();
  const option = page.getByRole("dialog").getByRole("checkbox").first();
  await expect(option).toBeVisible();
  const before = await option.isChecked();
  await (before ? option.uncheck() : option.check());
  expect(await option.isChecked()).toBe(!before);
});
