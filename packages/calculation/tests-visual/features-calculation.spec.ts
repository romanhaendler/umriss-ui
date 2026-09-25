/* What a picture cannot say about the calculation: that the line a reader
   clicks stays where it is, and that its derivation opens beneath it. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

test("a derivation opens beneath the line that was clicked, and the line does not move", async ({ page }) => {
  await openExample(page, "calculation", "invoice");
  const target = page.locator('[data-example="invoice"]');
  const button = target.getByRole("button", { name: "Show how Discount is derived" });
  const before = await button.boundingBox();
  await button.click();
  /* Its name says what a click does next, so it is found anew. */
  const opened = target.getByRole("button", { name: "Hide how Discount is derived" });
  const after = await opened.boundingBox();
  expect(after!.y).toBe(before!.y);
  const list = target.locator(`[id="${await opened.getAttribute("aria-controls")}"]`);
  await expect(list).toBeVisible();
  expect((await list.boundingBox())!.y).toBeGreaterThan(after!.y);
  await expect(list).toContainText("= Discount");
});

test("a chain in view stands open: every line and interim, nothing to fold but the trees in its lines", async ({ page }) => {
  await openExample(page, "chain", "payslip");
  const target = page.locator('[data-example="payslip"]');
  for (const line of ["Gross salary", "Income tax", "Church tax", "Net salary", "Travel allowance", "Amount paid out"]) {
    /* The first place it stands is its line in the chain; later ones are
       references inside folded trees. */
    await expect(target.getByText(line, { exact: true }).first()).toBeVisible();
  }
  await expect(target.getByRole("list", { name: "Payslip, March" }).getByRole("button")).toHaveCount(1);
  const pension = target.getByText("Pension insurance", { exact: true });
  await expect(pension).toBeHidden();
  await target.getByRole("button", { name: "Show how Social security contributions is derived" }).click();
  await expect(pension).toBeVisible();
  await expect(target.getByText("= Social security contributions")).toBeVisible();
});
