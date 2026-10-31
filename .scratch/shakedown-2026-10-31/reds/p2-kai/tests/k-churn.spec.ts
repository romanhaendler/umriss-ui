import { test, expect } from "@playwright/test";
import { watch } from "./h";
const act = (p: any) => p.evaluate(() => { const a = document.activeElement as any; return (a?.tagName ?? "") + "|" + (a?.getAttribute?.("aria-label") ?? a?.textContent?.slice(0, 20) ?? ""); });

test("row keys that change every 1.5 s: grid focus, editor, menu, selection", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client&churn=1");
  await page.waitForTimeout(800);
  const first = page.locator("tr[data-grid-line^='row:']").first();
  // keyboard user walks the grid
  await page.locator("td[data-edit]").first().click();
  await page.keyboard.press("ArrowDown");
  const f0 = await act(page);
  await page.waitForTimeout(2200);
  const f1 = await act(page);
  console.log("grid cell focus before/after key churn:", JSON.stringify(f0), "->", JSON.stringify(f1));
  await page.keyboard.press("ArrowDown");
  console.log("arrow after churn focus:", await act(page));
  await page.locator("tr[data-grid-line^='row:'] input[type=checkbox]").nth(2).check().catch(() => {});
  await page.waitForTimeout(2200);
  console.log("selected after churn:", await page.locator("tr[aria-selected=true]").count(), "hook count:", await page.evaluate(() => (window as any).__t.selection.count));
  console.log(errs.join("\n"));
});
