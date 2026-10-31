import { test, expect } from "@playwright/test";
const act = (p: any) => p.evaluate(() => { const a = document.activeElement as any; return (a?.tagName ?? "") + "|" + (a?.getAttribute?.("aria-label") ?? a?.textContent?.slice(0, 20) ?? ""); });
for (const [what, item] of [["Edit modal", "Edit"], ["Details drawer", "Details"]]) test("focus returns after closing " + what + " opened from the row menu", async ({ page }) => {
  await page.goto("/?refresh=500&mode=server");
  await page.waitForTimeout(1000);
  await page.getByLabel("Actions: 1003").click();
  await page.getByRole("menuitem", { name: item }).click();
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  const f = await act(page);
  console.log(what, "focus after Esc:", f);
  expect.soft(f, "focus back on the row's actions button").toContain("Actions: 1003");
});
test("same without refresh", async ({ page }) => {
  await page.goto("/?refresh=0&mode=server");
  await page.waitForTimeout(1000);
  await page.getByLabel("Actions: 1003").click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  console.log("no refresh focus:", await act(page));
});
