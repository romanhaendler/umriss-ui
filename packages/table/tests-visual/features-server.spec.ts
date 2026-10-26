/* Server mode in the browser (table-server-mode 02, 03), against the example's
   fake server with its 400 ms: the previous page kept, dimmed, while an answer
   is out (ADR-0042), the next page, a list filter offering the server's values,
   and "select all" saying it selects the page. Behaviour, light only; the
   settled picture is the example's own in `screenshots.spec.ts`. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

const ID = "a-million-rows-on-a-server";

test("the next page: the previous page kept and busy at its height, then the server's rows", async ({ page }) => {
  await openExample(page, "server-mode", ID);
  const example = page.locator(`[data-example="${ID}"]`);
  const table = example.locator("table");
  const before = await table.boundingBox();
  await example.getByRole("button", { name: "Next" }).click();
  await expect(table).toHaveAttribute("aria-busy", "true");
  await expect(table).toHaveAttribute("data-stale", "true");
  await expect(table.locator("tbody tr[aria-hidden]")).toHaveCount(0);
  await expect(table.locator("tbody th").first()).toHaveText("REQ-0000001");
  expect((await table.boundingBox())!.height).toBe(before!.height);
  await expect(table).not.toHaveAttribute("aria-busy", "true");
  await expect(table.locator("tbody th").first()).toHaveText("REQ-0000011");
  await expect(example.getByText("Page 2 of 100,000")).toBeVisible();
});

test("a list filter offers what the server names, and a condition reaches it", async ({ page }) => {
  await openExample(page, "server-mode", ID);
  const example = page.locator(`[data-example="${ID}"]`);
  await example.getByRole("button", { name: "Filter Service" }).click();
  const panel = page.getByRole("dialog", { name: "Filter Service" });
  await expect(panel.getByRole("checkbox")).toHaveCount(8);
  await panel.getByRole("checkbox", { name: "Webhooks" }).focus();
  await page.keyboard.press("Space");
  await panel.getByRole("button", { name: "Done" }).click();
  await expect(example.locator("table")).not.toHaveAttribute("aria-busy", "true");
  await expect(example.locator("tbody td:nth-of-type(2)").first()).toHaveText("Webhooks");
  await expect(example.getByRole("status")).not.toHaveText("");
});

test("'select all' selects the page and says so; a key from another page stays", async ({ page }) => {
  await openExample(page, "server-mode", ID);
  const example = page.locator(`[data-example="${ID}"]`);
  await example.getByRole("checkbox", { name: "Select REQ-0000001" }).check({ force: true });
  await example.getByRole("button", { name: "Next" }).click();
  await expect(example.locator("tbody th").first()).toHaveText("REQ-0000011");
  await example.getByRole("checkbox", { name: "Select all on this page" }).check({ force: true });
  await expect(example.getByText("11 selected", { exact: true })).toBeVisible();
});

/* The pieces of the server-mode contract, each against its example's fake
   server: the error body, the offer to select all that match, the footer's
   skeleton and value. The baselines are made by the visual suite. */

test("a failed fetch: the message in place of the rows, in the height of a page, then the page after Try again", async ({ page }, info) => {
  await openExample(page, "server-mode", "a-failed-fetch");
  const example = page.locator(`[data-example="a-failed-fetch"]`);
  const table = example.locator("table");
  const before = await table.boundingBox();
  await example.getByRole("button", { name: "Next" }).click();
  await expect(example.getByRole("alert")).toContainText("could not be loaded");
  expect((await table.boundingBox())!.height).toBeGreaterThan(before!.height * 0.8);
  await expect(example).toHaveScreenshot(`server-error-${info.project.name}.png`);
  await example.getByRole("button", { name: "Try again" }).click();
  await expect(example.getByRole("alert")).toHaveCount(0);
  await expect(table.locator("tbody th").first()).toHaveText("ORD-0011");
});

test("select all that match: the offer line under a ticked page, then the state", async ({ page }, info) => {
  await openExample(page, "server-mode", "select-all-that-match");
  const example = page.locator(`[data-example="select-all-that-match"]`);
  await example.getByRole("checkbox", { name: "Select all on this page" }).check({ force: true });
  const offer = example.locator("[data-select-matching]");
  await expect(offer).toContainText("12,400");
  await expect(example).toHaveScreenshot(`server-offer-${info.project.name}.png`);
  await offer.getByRole("button", { name: /12,400 that match/ }).click();
  await expect(offer).toContainText("All 12,400 that match are selected");
  await example.getByRole("button", { name: "Archive", exact: true }).click();
  await expect(example.getByText("except 0 orders")).toBeVisible();
});

test("sums from the server: the value over every match, skeleton while the next answer is out", async ({ page }, info) => {
  await openExample(page, "server-mode", "sums-from-the-server");
  const example = page.locator(`[data-example="sums-from-the-server"]`);
  const footer = example.locator("tfoot");
  await expect(footer).toContainText("1,000");
  await expect(example).toHaveScreenshot(`server-footer-value-${info.project.name}.png`);
  await example.getByRole("button", { name: "Next" }).click();
  await expect(example.locator("table")).toHaveAttribute("aria-busy", "true");
  await expect(example).toHaveScreenshot(`server-footer-skeleton-${info.project.name}.png`);
  await expect(example.locator("table")).not.toHaveAttribute("aria-busy", "true");
  await expect(footer).toContainText("1,000");
});
