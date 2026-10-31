import { test, expect, go } from "./fx";
// F2: the held page is only clamped for display; when rows grow again the table jumps back to the old page.
test("F2 a clamped page springs back when rows return", async ({ page }) => {
  await go(page, "pager");
  const st = () => page.evaluate(() => (window as any).__t.page);
  const set = (n: number) => page.evaluate((n) => (window as any).__setRows((rs: any[]) => Array.from({ length: n }, (_, i) => ({ ...rs[0], id: "r" + i, name: "Item " + i }))), n);
  const nxt = page.getByRole("button", { name: /next page/i });
  for (let i = 0; i < 9; i++) await nxt.click();           // page 10 of 10 (95 rows)
  await set(75);                                            // user now sees page 8 of 8
  await page.waitForTimeout(100);
  expect(await st()).toBe(8);
  await set(85);                                            // 10 more rows arrive; the user did nothing
  await page.waitForTimeout(100);
  expect(await st(), "user was on page 8 and was moved").toBe(8);
});
