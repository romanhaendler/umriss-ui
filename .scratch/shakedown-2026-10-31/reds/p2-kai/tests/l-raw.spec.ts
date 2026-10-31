import { test, expect } from "@playwright/test";
import { watch } from "./h";
test("raw backend shapes straight into columns", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?raw=1&refresh=0");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "shots/raw.png", fullPage: true });
  const cells = await page.locator("tr[data-grid-line], tbody tr").first().innerText().catch(() => "");
  console.log("first row:", cells.replace(/\s+/g, " | "));
  console.log("footer:", (await page.locator("tfoot").innerText().catch(() => "(none)")).replace(/\s+/g, " | "));
  // sort by qty, read the first 6 values
  await page.getByRole("button", { name: /^Qty/ }).first().click();
  await page.waitForTimeout(300);
  const q = await page.locator("tbody tr td:nth-child(5)").allInnerTexts();
  console.log("qty sorted asc:", q.slice(0, 40).join(","));
  await page.getByRole("button", { name: /^Created/ }).first().click();
  await page.waitForTimeout(300);
  const d = await page.locator("tbody tr td:last-child").allInnerTexts();
  console.log("created sorted asc first 10:", d.slice(0, 10).join(" ; "));
  console.log(errs.join("\n"));
});
