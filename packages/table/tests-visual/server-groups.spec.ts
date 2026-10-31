/* A grouped server table: Alt-click on a fold folds the groups of the page in
   one request, a group's box chooses the group and the bulk action receives it,
   all that match counts rows, not lines. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test("folds all groups of the page and selects a group", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "server-mode", "groups-from-the-server");
  const example = page.locator(`[data-example="groups-from-the-server"]`);
  const table = example.locator("table");
  await expect(table.locator("tbody tr[data-line=header]").first()).toBeVisible();
  const folds = table.locator("tbody [data-fold-path][aria-expanded=true]");
  expect(await folds.count()).toBeGreaterThan(0);
  await folds.first().click({ modifiers: ["Alt"] });
  /* The groups the page held are folded; the next group moves up onto the page, open. */
  await expect(table.locator("tbody [data-fold-path]").first()).toHaveAttribute("aria-expanded", "false");

  await table.locator("tbody tr[data-line=header]").first().getByRole("checkbox").check({ force: true });
  await example.getByRole("toolbar").getByRole("button", { name: "Release" }).or(example.getByRole("button", { name: "Release", exact: true }).first()).first().click();
  await expect(example.locator("output")).toContainText("Released group");
});

test("a page of lines offers all that match by rows", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "server-mode", "groups-from-the-server");
  const example = page.locator(`[data-example="groups-from-the-server"]`);
  await example.getByRole("checkbox", { name: "Select all on this page" }).check({ force: true });
  await expect(example.locator("[data-select-matching]")).toContainText("400");
});
