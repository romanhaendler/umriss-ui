import { test, expect, go } from "./fx";
const R = (p: any) => p.evaluate(() => JSON.stringify((window as any).__reqs.map((r: any) => [r.search, JSON.stringify(r.conditions), r.page, r.pageSize])));
const resolveAll = async (p: any) => { await p.waitForFunction(() => (window as any).__pend.length > 0, null, { timeout: 3000 }).catch(() => {}); await p.evaluate(() => { const w = window as any; w.__pend.forEach((x: any) => x.resolve(true)); w.__pend.length = 0; }); await p.waitForTimeout(80); };

test("server: selection across pages, filter resets page, resize while slow", async ({ page, logs }) => {
  await go(page, "server");
  await resolveAll(page);
  await expect(page.locator("tbody tr").first()).toContainText("Item 0");
  await page.locator("tbody tr").nth(1).getByRole("checkbox").check();
  await page.getByRole("button", { name: /next page/i }).click();
  await resolveAll(page);
  await page.locator("tbody tr").nth(0).getByRole("checkbox").check();
  console.log("selected count", await page.evaluate(() => (window as any).__t.selection.count));
  // select all on page -> offer all matching
  const head = page.locator("thead").getByRole("checkbox");
  await head.check();
  console.log("after head check:", await page.evaluate(() => (window as any).__t.selection.count), (await page.locator("body").innerText()).match(/All \d+ on this page[^\n]*/)?.[0]);
  // search -> page 1 and selection?
  await page.getByRole("searchbox").fill("Item 1");
  await resolveAll(page);
  console.log("after search sel count", await page.evaluate(() => (window as any).__t.selection.count), "page", await page.evaluate(() => (window as any).__t.page));
  console.log("reqs", await R(page));
  // resize frame while slow: shrink container
  await page.evaluate(() => { document.querySelector<HTMLElement>("div[style*='height: 420px']")!.style.height = "250px"; });
  await page.waitForTimeout(600);
  console.log("reqs after resize", await R(page));
  await resolveAll(page);
  await page.waitForTimeout(100);
  console.log("rows shown", await page.locator("tbody tr").count(), "pagesize", await page.evaluate(() => (window as any).__t.pageSize));
  await page.screenshot({ path: "shots/server-resize.png" });
  expect(logs).toEqual([]);
});

test("server: text filter + list filter + sort request shape, German", async ({ page, logs }) => {
  await go(page, "server", "&lang=de");
  await resolveAll(page);
  await page.getByRole("button", { name: /spalten|columns/i }).first().isVisible();
  console.log(await page.locator(".u-toolbar, [role=toolbar]").first().innerText().catch(() => ""));
  await page.getByRole("columnheader", { name: /Name/ }).getByRole("button").first().click();
  await resolveAll(page);
  console.log("reqs", await R(page));
  console.log((await page.locator("body").innerText()).split("\n").filter((l) => /Seite|von|Zeilen|Einträge/.test(l)).join(" | "));
  await page.screenshot({ path: "shots/server-de.png" });
  expect(logs).toEqual([]);
});
