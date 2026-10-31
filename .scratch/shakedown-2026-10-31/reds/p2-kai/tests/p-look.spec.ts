import { test } from "@playwright/test";
test("dark screens", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 760 });
  await page.goto("/?refresh=0&mode=client&dark=1&lang=de");
  await page.waitForTimeout(800);
  await page.getByLabel("Select 1003").check().catch(() => page.locator("input[aria-label*='1003']").check());
  await page.locator("button[aria-label*='1007']").click();
  await page.screenshot({ path: "shots/dark-menu.png" });
  await page.getByRole("menuitem").first().click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /löschen|delete/i }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shots/dark-nested.png" });
});
test("375 wide", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto("/?refresh=0&mode=server");
  await page.waitForTimeout(900);
  await page.screenshot({ path: "shots/mobile.png" });
});
