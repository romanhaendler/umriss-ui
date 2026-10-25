/* The editing mode's label follows `--u-transform-caps`, set on `:root` as an
   application sets it. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

test("The mode label follows the capitals token", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "dashboard", "dispatcher");
  await page.locator('[data-example="dispatcher"]').getByRole("button", { name: "Edit" }).click();
  const label = page.getByText("Editing the dashboard", { exact: true });
  const caseOf = () => label.evaluate((element) => getComputedStyle(element).textTransform);
  expect(await caseOf()).toBe("uppercase");
  await page.addStyleTag({ content: ":root { --u-transform-caps: none }" });
  expect(await caseOf()).toBe("none");
});
