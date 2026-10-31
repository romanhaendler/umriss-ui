import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
const heads = () => p.$$eval("thead tr", rs => rs.map(r => [...r.children].map(c => (c.textContent.trim() || "_") + (c.colSpan > 1 ? "x" + c.colSpan : "")).join(" ")));
await p.evaluate(() => window.__t.setPin("qty", "end")); await p.waitForTimeout(200);
console.log("pin qty end", await heads());
await p.screenshot({ path: "shots/group-split.png" });
await p.evaluate(() => window.__t.setPin("qty", null)); 
await p.evaluate(() => { window.__t.toggleColumn("amount"); window.__t.toggleColumn("qty"); }); await p.waitForTimeout(200);
console.log("hide group", await heads());
await p.evaluate(() => { window.__t.toggleColumn("amount"); window.__t.toggleColumn("qty"); });
await p.evaluate(() => window.__t.setOrder(["note", "when", "dept", "qty", "amount", "name"])); await p.waitForTimeout(300);
console.log("reorder", await heads(), JSON.stringify(await p.evaluate(()=>window.__t.order)));
await p.screenshot({ path: "shots/group-reorder.png" });
// sticky header with scroll: groups sticky?
await p.evaluate(() => window.__t.setPageSize(50)); await p.waitForTimeout(300);
await p.evaluate(()=>{const s=document.querySelector("table").parentElement;s.scrollTop=300;}); await p.waitForTimeout(200);
console.log("sticky tops", await p.evaluate(()=>[...document.querySelectorAll("thead tr")].map(r=>Math.round(r.getBoundingClientRect().top)+"/"+Math.round(r.getBoundingClientRect().height))));
// sorted by clicking a group label?
await p.locator("th[scope=colgroup]").first().click(); console.log("click group sort", await p.evaluate(()=>JSON.stringify(window.__t.sort)));
// view roundtrip
const v = await p.evaluate(()=>JSON.stringify(window.__t.view)); console.log("view", v);
console.log(p.errs); await p.b.close();
