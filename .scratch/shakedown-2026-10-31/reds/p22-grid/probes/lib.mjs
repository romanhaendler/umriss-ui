import { chromium } from "@playwright/test";
export async function open(q = "s=main", vp = { width: 1100, height: 700 }, browser = "chromium") {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: vp });
  p.errs = []; p.on("console", m => { if (["error","warning"].includes(m.type())) p.errs.push(m.type()+": "+m.text()); }); p.on("pageerror", e => p.errs.push("PAGEERR "+e.message));
  await p.goto("http://localhost:4370/?" + q); await p.waitForSelector("table, [role=grid]");
  p.b = b; p.names = () => p.$$eval("tbody th", e => e.map(x => x.textContent));
  p.st = () => p.evaluate(() => { const t = window.__t; return { page: t.page, pc: t.pageCount, ps: t.pageSize, rc: t.rowCount, framed: t.framed, sel: t.selection.count }; });
  return p;
}
