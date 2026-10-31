/* A server's page in a pane of fixed height: ticking "select all" changes
   neither the fitted page nor the page, and asks the server nothing. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test("a fitted server page holds still when the page is ticked", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "server-mode", "fill-a-pane-from-a-server");
  const example = page.locator(`[data-example="fill-a-pane-from-a-server"]`);
  const rows = example.locator("tbody tr:not([data-filler]):not([aria-hidden])");
  const range = example.getByRole("navigation", { name: "Pagination" }).locator("span").first();
  const requests = example.locator("[data-requests]");
  await expect(rows.first()).toBeVisible();
  await expect(example.locator("table")).not.toHaveAttribute("aria-busy", "true");
  const before = { rows: await rows.count(), range: await range.textContent(), asked: await requests.getAttribute("data-requests") };
  expect(before.rows).toBeGreaterThan(2);
  await example.getByRole("checkbox", { name: "Select all on this page" }).check({ force: true });
  await expect(example.locator("[data-select-matching]")).toContainText("that match");
  /* Longer than the fit's settle time and the server's delay. */
  await page.waitForTimeout(900);
  expect(await rows.count()).toBe(before.rows);
  expect(await range.textContent()).toBe(before.range);
  expect(await requests.getAttribute("data-requests")).toBe(before.asked);
  await expect(example.locator("tbody tr input[type=checkbox]:checked")).toHaveCount(before.rows);
});
