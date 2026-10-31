import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
const w = (ms=250) => p.waitForTimeout(ms);
// 1: shrink data while on last page
await p.evaluate(() => window.__t.setPage(20)); await w();
await p.evaluate(() => window.__setRows((r) => r.slice(0, 55))); await w(400);
console.log("shrink on last page", await p.st(), (await p.names())[0]);
// 2: selected rows removed from data
await p.evaluate(() => { window.__t.selection.set(["r1","r2","r54"], true); }); await w();
console.log("sel before", await p.st(), await p.evaluate(()=>window.__sel.at(-1)));
await p.evaluate(() => window.__setRows((r) => r.filter(x => x.id !== "r54" && x.id !== "r1"))); await w(400);
console.log("sel after removing two selected rows", await p.st(), await p.evaluate(()=>[...window.__t.selection.selected]), "log", await p.evaluate(()=>window.__sel.at(-1)));
console.log("toolbar", (await p.locator("[class*=toolbar]").first().innerText()).replace(/\n/g," | "));
// 3: hidden column with active filter
await p.evaluate(() => window.__t.setFilter("note", { terms: [{ operator: "isEmpty" }] })); await w();
const rc1 = await p.evaluate(() => window.__t.rowCount);
await p.evaluate(() => window.__t.toggleColumn("note")); await w();
console.log("filter on hidden col: rowCount", rc1, "->", await p.evaluate(() => window.__t.rowCount), "chips", (await p.locator("[class*=toolbar]").first().innerText()).replace(/\n/g," | "));
await p.evaluate(() => window.__t.toggleColumn("note"));
// 4: sort by hidden column
await p.evaluate(() => { window.__t.toggleSort("amount"); }); await w(); await p.evaluate(() => window.__t.toggleColumn("amount")); await w();
console.log("sort by hidden col", await p.evaluate(()=>JSON.stringify(window.__t.sort)), (await p.names()).slice(0,3));
await p.evaluate(() => window.__t.toggleColumn("amount"));
// 5: group by hidden
await p.evaluate(() => window.__t.setGrouping(["dept"])); await w();
await p.evaluate(() => window.__t.toggleColumn("dept")); await w();
console.log("group by hidden col", await p.evaluate(()=>JSON.stringify(window.__t.grouping)), (await p.locator("tbody tr").first().innerText()).replace(/\n/g," | "));
await p.screenshot({ path: "shots/group-hidden.png" });
// 6: page 2 of grouped: click select group
console.log(p.errs); await p.b.close();
