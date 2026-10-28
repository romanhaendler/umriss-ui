/* A test runner's `.check()` and `.uncheck()` work without `force` on the
   table's selection boxes. Chromium only; light only. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

test("a row box and select all are checked and unchecked without force", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "virtualisation", "virtualisation");
  const example = page.locator('[data-example="virtualisation"]');
  const row = example.getByLabel("Select REQ-00003");
  await row.check();
  await expect(row).toBeChecked();
  await row.uncheck();
  await expect(row).not.toBeChecked();

  const all = example.getByLabel("Select all");
  await all.check();
  await expect(all).toBeChecked();
  await all.uncheck();
  await expect(all).not.toBeChecked();
});
