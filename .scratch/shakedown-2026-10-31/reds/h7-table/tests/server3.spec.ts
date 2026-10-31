import { test, expect, go } from "./fx";
const flush = async (p: any) => { await p.waitForTimeout(500); await p.evaluate(() => { const w = window as any; w.__pend.forEach((x: any) => x.resolve(true)); w.__pend.length = 0; }); await p.waitForTimeout(200); };
const S = (p: any) => p.evaluate(() => { const t = (window as any).__t; const r = (window as any).__reqs; return `page=${t.page}/${t.pageCount} rowCount=${t.rowCount} rows=${document.querySelectorAll("tbody tr").length} lastReq=${r.at(-1).page}/${r.at(-1).pageSize} n=${r.length}`; });

test("server: the set shrinks under the page (out of range page answer)", async ({ page, logs }) => {
  await go(page, "server");
  await flush(page); await flush(page);
  for (let i = 0; i < 4; i++) { await page.getByRole("button", { name: /next page/i }).click(); await flush(page); }
  console.log("page 5:", await S(page));
  // user hits refresh/Try again equivalent: the server now says only 10 rows, and returns no rows for page 5
  await page.evaluate(() => { const w = window as any; w.__custom(w.__reqs.at(-1), 10, 0); });
  await page.waitForTimeout(400);
  console.log("answer rowCount=10 rows=0 for page 5:", await S(page), "| body:", (await page.locator("tbody").innerText()).replace(/\s+/g, " ").slice(0, 80));
  console.log("pager text:", (await page.locator("body").innerText()).match(/\d+–\d+ of \d+|0 of \d+|Page \d+ of \d+/g));
  await page.waitForTimeout(500);
  console.log("later:", await S(page));
  await page.screenshot({ path: "shots/server-outofrange.png" });
  console.log(logs);
});
test("server: rapid typing, answers out of order, final text must win", async ({ page, logs }) => {
  await go(page, "server");
  await flush(page); await flush(page);
  const box = page.getByRole("searchbox");
  await box.pressSequentially("Item 12", { delay: 20 });
  await page.waitForTimeout(300);
  const n = await page.evaluate(() => (window as any).__reqs.length);
  console.log("requests for 7 keys:", n - 1);
  // answer newest first, then older ones
  console.log("search reqs:", await page.evaluate(() => JSON.stringify((window as any).__reqs.map((r: any) => r.search))));
  await page.evaluate(() => { const w = window as any; [...w.__pend].reverse().forEach((x: any) => x.resolve(true)); });
  await page.waitForTimeout(300);
  console.log("rows:", (await page.locator("tbody tr").allInnerTexts()).map((s) => s.split("\t")[1] ?? s).join(","), "| search:", await box.inputValue(), "|", await S(page));
  expect(logs).toEqual([]);
});
test("server: filter popover list change on page 3 resets page and re-requests once", async ({ page, logs }) => {
  await go(page, "server");
  await flush(page); await flush(page);
  for (let i = 0; i < 2; i++) { await page.getByRole("button", { name: /next page/i }).click(); await flush(page); }
  await page.getByRole("button", { name: "Filter Dept" }).click();
  await page.waitForTimeout(200);
  console.log(await page.locator("[role=dialog]").innerText());
  await page.getByRole("checkbox", { name: "HR" }).check();
  await page.waitForTimeout(500);
  console.log("after dept=HR:", await S(page), JSON.stringify(await page.evaluate(() => (window as any).__reqs.at(-1))));
  await flush(page);
  console.log("after answer:", await S(page));
  await page.screenshot({ path: "shots/server-listfilter.png" });
  console.log(logs);
});
