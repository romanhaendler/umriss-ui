import { test, expect, go } from "./fx";
// F8: the row being edited is removed by a live update: the typed value is dropped without a word and focus falls to BODY
// (arrow keys then do nothing; the keyboard user starts again from Tab).
test("F8 focus after the edited row disappears", async ({ page }) => {
  await go(page, "edit");
  await page.locator("tbody tr").nth(2).locator("td").nth(0).click();
  await page.keyboard.type("5000");
  await page.evaluate(() => (window as any).__setRows((rs: any[]) => rs.filter((r) => r.id !== "r3")));
  await page.waitForTimeout(200);
  const a = await page.evaluate(() => document.activeElement?.tagName);
  const edits = await page.evaluate(() => (window as any).__log.length);
  console.log({ active: a, edits });
  expect(a, "focus stays in the grid").not.toBe("BODY");
});
