/* The capitals of the column head follow `--u-transform-caps`, set on `:root`
   as an application sets it. */

import { test, expect } from "@playwright/test";
import { openScenario } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test("A column head follows the capitals token", { tag: "@quick" }, async ({ page }) => {
  await openScenario(page, "find-a-late-shipment");
  const head = page.locator('[data-scenario="find-a-late-shipment"]').getByRole("columnheader", { name: "Customer" });
  const caseOf = () => head.evaluate((element) => getComputedStyle(element).textTransform);
  expect(await caseOf()).toBe("uppercase");
  await page.addStyleTag({ content: ":root { --u-transform-caps: none }" });
  expect(await caseOf()).toBe("none");
});
