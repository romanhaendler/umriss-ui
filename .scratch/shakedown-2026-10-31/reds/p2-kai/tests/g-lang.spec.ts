import { test } from "@playwright/test";
import { watch } from "./h";
test("what survives a language switch", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=0&mode=client");
  await page.waitForTimeout(600);
  await page.getByLabel("Select 1003").check();
  await page.getByRole("button", { name: /^Fold CANCELLED/ }).click();
  await page.locator("input[type=search], input[placeholder]").first().fill("Customer 1");
  await page.evaluate(() => { (window as any).__mark = document.querySelector("table"); (window as any).__t0 = (window as any).__t; });
  const before = await page.evaluate(() => ({ sel: (window as any).__t.selection.count, grouping: (window as any).__t.grouping, search: (window as any).__t.search, folded: (window as any).__t.folded }));
  await page.locator("input[value=de]").click({ force: true });
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({ sel: (window as any).__t.selection.count, grouping: (window as any).__t.grouping, search: (window as any).__t.search, folded: (window as any).__t.folded, sameTable: (window as any).__mark === document.querySelector("table"), markConnected: (window as any).__mark.isConnected }));
  console.log("before", JSON.stringify(before), "\nafter ", JSON.stringify(after));
  console.log(errs.join("\n"));
});
