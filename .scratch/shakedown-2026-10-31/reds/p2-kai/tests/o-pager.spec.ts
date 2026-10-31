import { test, expect } from "@playwright/test";
import { row, watch } from "./h";
test("client pager: last page shrinks under the user, then grows back", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client&pager=1");
  await page.waitForTimeout(1000);
  const st = async (tag: string) => console.log(tag, JSON.stringify(await page.evaluate(() => { const t = (window as any).__t; return { page: t.page, count: t.pageCount, size: t.pageSize, rows: t.visible.length, rowCount: t.rowCount, range: document.body.innerText.match(/\d+–\d+ of \d+|Page \d+ of \d+/g) }; })));
  await st("start");
  await page.getByRole("button", { name: /last page/i }).click();
  await page.waitForTimeout(700);
  await st("last");
  await page.evaluate(() => { const w = window as any; for (let i = 0; i < 12; i++) w.__db().pop(); });
  await page.waitForTimeout(1200);
  await st("after server shrank by 12");
  await page.evaluate(() => (window as any).__insert());
  await page.evaluate(() => (window as any).__insert());
  await page.waitForTimeout(1200);
  await st("after +2");
  console.log(errs.filter((e) => !/pageSize/.test(e)).join("\n"));
});

test("pager range: the live region and the visible range agree after the data shrinks", async ({ page }) => {
  await page.goto("/?refresh=500&mode=client&pager=1");
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: /last page/i }).click();
  await page.waitForTimeout(700);
  await page.evaluate(() => { const w = window as any; for (let i = 0; i < 12; i++) w.__db().pop(); });
  await page.waitForTimeout(1500);
  const els = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => e.children.length === 0 && /\d+–\d+ of \d+/.test(e.textContent ?? "")).map((e) => ({ text: e.textContent, tag: e.tagName, role: e.getAttribute("role"), live: e.closest("[aria-live]")?.getAttribute("aria-live"), hidden: getComputedStyle(e).clip + "/" + (e.getBoundingClientRect().width) })));
  console.log(JSON.stringify(els));
  const texts = els.map((e) => e.text);
  expect(new Set(texts).size, "every range text on the page is the same").toBe(1);
});
