import { test, expect, go } from "./fx";
const st = (p: any) => p.evaluate(() => { const t = (window as any).__t; return `page=${t.page}/${t.pageCount} size=${t.pageSize} rows=${t.rowCount} first=${t.visible[0]?.id}`; });
const range = (p: any) => p.locator("body").innerText().then((s: string) => s.match(/\d+[–-]\d+ of [\d.,]+|0 of \d+|[\d.,]+ of [\d.,]+/g)?.join(" | ") + " || " + (s.match(/Page \d+ of \d+|Seite \d+ von \d+/g) ?? []).join());
const set = (p: any, fn: string) => p.evaluate((f: string) => (window as any).__setRows(eval(f)), fn);

test("pager range while rows are added/removed", async ({ page, logs }) => {
  await go(page, "pager");
  const nxt = page.getByRole("button", { name: /next page/i });
  for (let i = 0; i < 9; i++) await nxt.click();
  console.log("last page:", await st(page), await range(page));       // 91-95
  await set(page, "(rs) => rs.slice(0, 85)");  // shrink: last page gone
  await page.waitForTimeout(100);
  console.log("shrunk to 85:", await st(page), await range(page));
  await set(page, "(rs) => rs.slice(0, 80)");
  await page.waitForTimeout(100);
  console.log("shrunk to 80:", await st(page), await range(page));
  await set(page, "() => []");
  await page.waitForTimeout(100);
  console.log("empty:", await st(page), await range(page), "| text:", (await page.locator("table").innerText()).replace(/\s+/g, " "));
  await set(page, "() => Array.from({length: 3}, (_, i) => ({id: 'n'+i, name:'N'+i, dept:'Ops', amount: i, when: null, note: null, qty: 0}))");
  await page.waitForTimeout(100);
  console.log("3 rows:", await st(page), await range(page));
  await page.screenshot({ path: "shots/pager-3rows.png" });
  // rows inserted before the current page: page remains but content shifts
  await set(page, "() => Array.from({length: 95}, (_, i) => ({id: 'r'+i, name:'Item '+i, dept:'Ops', amount: i, when: null, note: null, qty: 0}))");
  console.log('after 95:', await st(page), await range(page));
  await nxt.click({timeout: 3000}); await nxt.click();
  const before = await st(page);
  await set(page, "(rs) => [{id:'new1',name:'NEW',dept:'Ops',amount:1,when:null,note:null,qty:0}, ...rs]");
  await page.waitForTimeout(100);
  console.log("insert at top while on page 3:", before, "->", await st(page), await range(page));
  expect(logs).toEqual([]);
});
