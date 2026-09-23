/* What a picture cannot say about the calculation: that the line a reader
   clicks stays where it is, and that its derivation opens beneath it. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

test("a derivation opens beneath the line that was clicked, and the line does not move", async ({ page }) => {
  await openExample(page, "calculation", "costing-sheet");
  const target = page.locator('[data-example="costing-sheet"]');
  const button = target.getByRole("button", { name: "Show how Production cost is derived" });
  const before = await button.boundingBox();
  await button.click();
  /* Its name says what a click does next, so it is found anew. */
  const opened = target.getByRole("button", { name: "Hide how Production cost is derived" });
  const after = await opened.boundingBox();
  expect(after!.y).toBe(before!.y);
  const list = target.locator(`[id="${await opened.getAttribute("aria-controls")}"]`);
  await expect(list).toBeVisible();
  expect((await list.boundingBox())!.y).toBeGreaterThan(after!.y);
  await expect(list).toContainText("= Production cost");
});
