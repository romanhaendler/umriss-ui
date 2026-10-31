/* The head keeps its widths when a search empties the body (measured in the browser). */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark", "Layout only once (light)");
});

test("the head's widths stay when a search matches nothing", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "search", "find-a-person");
  const table = page.locator('[data-example="find-a-person"]');
  const widths = () => table.locator("thead th").evaluateAll((ths) => ths.map((t) => t.getBoundingClientRect().width));
  /* The widths of the last state that still had a row: the body empties from there. */
  await table.getByRole("searchbox").fill("a");
  const before = await widths();
  await table.getByRole("searchbox").fill("azzzzqq");
  await expect(table.getByText("Nothing matches")).toBeVisible();
  const after = await widths();
  after.forEach((w, i) => expect(Math.abs(w - before[i]!)).toBeLessThan(0.6));
});
