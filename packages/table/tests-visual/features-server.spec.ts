/* Manual mode in the browser (table-server-mode 02, 03), against the example's
   fake server with its 400 ms: placeholders over the previous page while an
   answer is out, the next page, a list filter offering the server's values,
   and "select all" saying it selects the page. Behaviour, light only; the
   settled picture is the example's own in `screenshots.spec.ts`. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const ID = "a-million-rows-on-a-server";

test("the next page: busy over the previous page's height, then the server's rows", async ({ page }) => {
  await openExample(page, "table", ID);
  const example = page.locator(`[data-example="${ID}"]`);
  const table = example.locator("table");
  const before = await table.boundingBox();
  await example.getByRole("button", { name: "Next" }).click();
  await expect(table).toHaveAttribute("aria-busy", "true");
  await expect(table.locator("tbody tr[aria-hidden]")).toHaveCount(10);
  expect(Math.abs((await table.boundingBox())!.height - before!.height)).toBeLessThanOrEqual(10);
  await expect(table).not.toHaveAttribute("aria-busy", "true");
  await expect(table.locator("tbody th").first()).toHaveText("MW-0000011");
  await expect(example.getByText("Page 2 of 100,000")).toBeVisible();
});

test("a list filter offers what the server names, and a condition reaches it", async ({ page }) => {
  await openExample(page, "table", ID);
  const example = page.locator(`[data-example="${ID}"]`);
  await example.getByRole("button", { name: "Filter Station" }).click();
  const panel = page.getByRole("dialog", { name: "Filter Station" });
  await expect(panel.getByRole("checkbox")).toHaveCount(8);
  await panel.getByRole("checkbox", { name: "Harbour" }).focus();
  await page.keyboard.press("Space");
  await panel.getByRole("button", { name: "Done" }).click();
  await expect(example.locator("table")).not.toHaveAttribute("aria-busy", "true");
  await expect(example.locator("tbody td:nth-of-type(2)").first()).toHaveText("Harbour");
  await expect(example.getByRole("status")).not.toHaveText("");
});

test("'select all' selects the page and says so; a key from another page stays", async ({ page }) => {
  await openExample(page, "table", ID);
  const example = page.locator(`[data-example="${ID}"]`);
  await example.getByRole("checkbox", { name: "Select MW-0000001" }).check({ force: true });
  await example.getByRole("button", { name: "Next" }).click();
  await expect(example.locator("tbody th").first()).toHaveText("MW-0000011");
  await example.getByRole("checkbox", { name: "Select all on this page" }).check({ force: true });
  await expect(example.getByText("11 selected", { exact: true })).toBeVisible();
});
