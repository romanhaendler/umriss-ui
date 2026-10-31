import { test, expect, go } from "./fx";
// F3: after the rows shrink under the held page, "Previous page" must go to the page before the one shown.
test("F3 previous after shrink", async ({ page }) => {
  await go(page, "pager");
  const st = () => page.evaluate(() => (window as any).__t.page);
  const nxt = page.getByRole("button", { name: /next page/i }), prv = page.getByRole("button", { name: /previous page/i });
  for (let i = 0; i < 9; i++) await nxt.click();
  await page.evaluate(() => (window as any).__setRows((rs: any[]) => rs.slice(0, 75)));
  await page.waitForTimeout(100);
  expect(await st()).toBe(8);
  await prv.click();
  await page.waitForTimeout(100);
  console.log("after prev:", await st());
  expect(await st(), "Previous from page 8 must show 7").toBe(7);
});
