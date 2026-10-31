import { test, expect } from "@playwright/test";
import { watch } from "./h";

test("fit page + select all: count, banner and ticked rows agree", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=0&mode=server");
  await page.waitForTimeout(1000);
  const rowsBefore = await page.locator("tr[data-grid-line^='row:']").count();
  await page.getByRole("checkbox", { name: /select all|alle/i }).first().check();
  await page.waitForTimeout(800);
  const rowsAfter = await page.locator("tr[data-grid-line^='row:']").count();
  const ticked = await page.locator("tr[aria-selected=true]").count();
  const selected = await page.evaluate(() => (window as any).__t.selection.count);
  const banner = await page.getByText(/on this page are selected/).innerText();
  console.log({ rowsBefore, rowsAfter, ticked, selected, banner, toolbar: await page.getByText(/^\d+ selected$/).first().innerText() });
  expect.soft(selected, "selection count equals the ticked rows on screen").toBe(ticked);
  expect.soft(rowsAfter, "the page does not shrink by the banner the tick brings").toBe(rowsBefore);
  console.log(errs.filter((e) => !/groupable|filter of|answers/.test(e)).join("\n"));
});

test("fit page: banner then untick returns", async ({ page }) => {
  await page.goto("/?refresh=0&mode=server");
  await page.waitForTimeout(1000);
  const sizes: number[] = [];
  const n = () => page.locator("tr[data-grid-line^='row:']").count();
  sizes.push(await n());
  await page.getByLabel(/Select 1000/).check();
  await page.waitForTimeout(500); sizes.push(await n());
  await page.getByLabel(/Select 1001/).check();
  await page.waitForTimeout(500); sizes.push(await n());
  await page.getByLabel(/Select 1001/).uncheck();
  await page.getByLabel(/Select 1000/).uncheck();
  await page.waitForTimeout(500); sizes.push(await n());
  console.log("rows on page as ticks come and go:", sizes, await page.evaluate(() => (window as any).__log.filter((l: string) => l.startsWith("req"))));
});

test("fit page + select all + next page: is any row skipped?", async ({ page }) => {
  await page.goto("/?refresh=0&mode=server");
  await page.waitForTimeout(1000);
  const ids = () => page.locator("tr[data-grid-line^='row:']").evaluateAll((r) => r.map((x) => x.getAttribute("data-grid-line")!.slice(4)));
  const p1a = await ids();
  await page.getByRole("checkbox", { name: /select all|alle/i }).first().check();
  await page.waitForTimeout(600);
  const p1b = await ids();
  await page.getByRole("button", { name: /next page/i }).first().click();
  await page.waitForTimeout(800);
  const p2 = await ids();
  console.log("p1 before", p1a.join(","), "\np1 after ", p1b.join(","), "\np2        ", p2.join(","));
  console.log("reqs", await page.evaluate(() => (window as any).__log.filter((l: string) => l.startsWith("req"))), "range", await page.getByText(/of 40/).first().innerText());
  const seen = new Set([...p1b, ...p2]);
  const missing = p1a.filter((i) => !seen.has(i));
  console.log("rows seen on page 1 before, never shown after:", missing);
  expect.soft(missing).toEqual([]);
});

test("timeline: select all then Next", async ({ page }) => {
  await page.goto("/?refresh=0&mode=server");
  await page.waitForTimeout(1000);
  const snap = async (tag: string) => console.log(tag, JSON.stringify(await page.evaluate(() => { const t = (window as any).__t; return { page: t.page, size: t.pageSize, rows: document.querySelectorAll("tr[data-grid-line^='row:']").length, first: document.querySelector("tr[data-grid-line^='row:']")?.getAttribute("data-grid-line"), sel: t.selection.count, req: (window as any).__log.filter((l: string) => l.startsWith("req")).join(";") }; })));
  await snap("start");
  await page.getByRole("checkbox", { name: /select all|alle/i }).first().check();
  await page.waitForTimeout(1500);
  await snap("selected");
  await page.getByRole("button", { name: /next page/i }).first().click();
  for (const ms of [100, 400, 1000]) { await page.waitForTimeout(ms); await snap("next+" + ms); }
  await page.screenshot({ path: "shots/fit-next.png" });
});
