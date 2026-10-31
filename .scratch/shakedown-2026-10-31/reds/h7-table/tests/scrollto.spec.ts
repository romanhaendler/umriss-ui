import { test, expect, go } from "./fx";
test("scrollToRow: folded group, filtered-out row, unknown key, paged", async ({ page, logs }) => {
  await go(page, "live");
  const T = (js: string) => page.evaluate((j) => { const t = (window as any).__t; return eval(j); }, js);
  const vis = (key: string) => page.evaluate((k) => { const trs = [...document.querySelectorAll("tbody tr")]; return trs.some((tr) => tr.innerText.startsWith("Item " + k.slice(1) + "\t") || tr.innerText.replace(/\s+/g, " ").startsWith("Item " + k.slice(1) + " ")); }, key);
  console.log("scrollToRow r1500 (grouped, open):", await T("t.scrollToRow('r1500')"));
  await page.waitForTimeout(200);
  console.log(" visible?", await vis("r1500"));
  await T("t.foldAll()"); await page.waitForTimeout(100);
  console.log("folded all; scrollToRow r1501:", await T("t.scrollToRow('r1501')"), "folded now:", await T("t.folded.length"));
  await page.waitForTimeout(200);
  console.log(" visible?", await vis("r1501"));
  await T("t.setSearch('Item 99')"); await page.waitForTimeout(200);
  console.log("filtered out r5:", await T("t.scrollToRow('r5')"), "search now:", await T("t.search"));
  console.log("unknown:", await T("t.scrollToRow('nope')"));
  console.log(logs);
});
test("scrollToRow in paged table", async ({ page, logs }) => {
  await go(page, "pager");
  const T = (js: string) => page.evaluate((j) => { const t = (window as any).__t; return eval(j); }, js);
  console.log(await T("t.scrollToRow('r55')"), await T("t.page"));
  await T("t.setSearch('Item 7')"); await page.waitForTimeout(100);
  console.log("row hidden by search:", await T("t.scrollToRow('r55')"), await T("t.page"), await T("t.search"));
});
