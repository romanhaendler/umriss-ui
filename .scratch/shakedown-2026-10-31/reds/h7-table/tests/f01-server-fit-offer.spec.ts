import { test, expect, go } from "./fx";
// F1: select-all on a fitted server page adds the "select all N that match" line, which shrinks the fitted page
// 8 -> 7: a new request, the 8th (ticked) row vanishes, "8 selected" but "All 7 on this page".
test("F1 ticking select-all re-requests a smaller page", async ({ page }) => {
  await go(page, "server");
  const flush = async () => { await page.waitForTimeout(700); await page.evaluate(() => { const w = window as any; w.__pend.forEach((x: any) => x.resolve(true)); w.__pend.length = 0; }); await page.waitForTimeout(300); };
  await flush(); await flush();
  const before = await page.evaluate(() => (window as any).__reqs.length);
  await page.locator("thead").getByRole("checkbox").check();
  await flush(); await flush();
  const sizes = await page.evaluate(() => (window as any).__reqs.map((r: any) => r.pageSize));
  expect(sizes.length, "no new request from a tick: " + sizes).toBe(before);
});
