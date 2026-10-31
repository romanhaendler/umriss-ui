import { test, expect } from "@playwright/test";
import { row, watch, count } from "./h";

test("selection after the server drops a selected order", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=0&mode=client");
  await page.waitForTimeout(500);
  await page.getByLabel("Select 1003").check();
  await page.getByLabel("Select 1007").check();
  expect(await count(page)).toContain("2 selected");
  await page.evaluate(() => (window as any).__removeId("1003"));
  await page.evaluate(() => (window as any).__load());
  await page.waitForTimeout(500);
  console.log("after removal:", await count(page), "| toolbar:", await page.locator("text=/selected/").allInnerTexts());
  await expect(row(page, "1003")).toHaveCount(0);
  // honest count: one row is selected and visible
  const ticked = await page.locator('tr[aria-selected="true"]').count();
  console.log("ticked rows:", ticked);
  expect.soft(await count(page), "count text lies about selection").toContain(`${ticked} selected`);
  console.log(errs.join("\n"));
});
