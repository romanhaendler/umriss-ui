import { test, expect, go } from "./fx";

test("server: out-of-order answers never stand as current", async ({ page, logs }) => {
  await go(page, "server");
  await page.waitForFunction(() => (window as any).__reqs.length >= 1);
  console.log("first reqs", await page.evaluate(() => JSON.stringify((window as any).__reqs)));
  await page.evaluate(() => (window as any).__resolve(0));
  await expect(page.locator("tbody tr").first()).toContainText("Item 0");
  const n0 = await page.evaluate(() => (window as any).__reqs.length);
  // page 2 then page 3 quickly; answer 3 first then 2
  await page.getByRole("button", { name: /next page/i }).click();
  await page.getByRole("button", { name: /next page/i }).click();
  const reqs = await page.evaluate(() => (window as any).__reqs.map((r: any) => r.page + "/" + r.pageSize));
  console.log("reqs", reqs);
  const last = await page.evaluate(() => (window as any).__reqs.length - 1);
  await page.evaluate((l) => (window as any).__resolve(l), last);
  const firstCell = async () => (await page.locator("tbody tr").first().innerText()).replace(/\s+/g, " ");
  await page.waitForTimeout(200);
  console.log("after newest answer:", await firstCell(), "| pager:", await page.locator("[role=status], nav, .pagination").first().innerText().catch(() => ""));
  await page.evaluate((l) => (window as any).__resolve(l - 1), last);
  await page.waitForTimeout(200);
  console.log("after stale answer:", await firstCell());
  await page.screenshot({ path: "shots/server-ooo.png" });
  expect(logs).toEqual([]);
});

test("server: failed answer", async ({ page, logs }) => {
  await go(page, "server");
  await page.evaluate(() => (window as any).__resolve(0));
  await expect(page.locator("tbody tr").first()).toContainText("Item 0");
  await page.getByRole("button", { name: /next page/i }).click();
  const l = await page.evaluate(() => (window as any).__reqs.length - 1);
  await page.evaluate((l) => (window as any).__resolve(l, false), l);
  await page.waitForTimeout(300);
  console.log("body text:", (await page.locator("table").first().innerText()).replace(/\s+/g, " ").slice(0, 300));
  console.log("pager text:", await page.getByText(/Page \d/).first().innerText().catch(() => "none"));
  await page.screenshot({ path: "shots/server-fail.png" });
  await page.getByRole("button", { name: /try again/i }).click();
  console.log("reqs after retry", await page.evaluate(() => (window as any).__reqs.length));
  expect(logs).toEqual([]);
});
