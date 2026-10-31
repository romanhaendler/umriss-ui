import { test, expect } from "@playwright/test";
import { watch } from "./h";
test("double-click on Confirm fires onConfirm once", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=0&mode=client&outside=1");
  await page.waitForTimeout(600);
  await page.evaluate(() => { (window as any).__n = 0; });
  await page.getByLabel("Actions: 1007").click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page.waitForTimeout(400);
  const btn = page.getByRole("dialog", { name: /Delete order/ }).getByRole("button", { name: "Delete" });
  await btn.dblclick();
  await page.waitForTimeout(800);
  const toasts = await page.getByText(/Order 1007 deleted/).count();
  console.log("toasts:", toasts, "errors:", errs.filter((e) => !/groupable|answers|filter of/.test(e)));
  expect.soft(toasts).toBe(1);
});
test("Enter in the Customer field of the Edit modal", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=0&mode=client");
  await page.waitForTimeout(600);
  await page.getByLabel("Actions: 1007").click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByLabel("Customer").press("Enter");
  await page.waitForTimeout(400);
  console.log("dialogs after Enter:", await page.locator("dialog[open]").count());
});
