import { open } from "./lib.mjs";
const p = await open("s=virt", { width: 1100, height: 800 });
const sc = () => p.evaluate(() => { const s = [...document.querySelectorAll("div")].find(d => d.scrollHeight > d.clientHeight + 50 && getComputedStyle(d).overflowY !== "visible"); return s ? [s.scrollTop, s.scrollHeight, s.clientHeight, document.querySelectorAll("tbody tr").length] : null; });
console.log("start", await sc());
const t0 = Date.now(); await p.evaluate(() => window.__t.setSearch("Item 99")); await p.waitForTimeout(500);
console.log("search", await p.st(), await sc());
await p.evaluate(() => window.__t.setSearch(""));await p.waitForTimeout(500);
// deep scroll, then text filter via setFilter
await p.evaluate(() => { const s = [...document.querySelectorAll("div")].find(d => d.scrollHeight > d.clientHeight + 50); s.scrollTop = 1e9; }); await p.waitForTimeout(400);
console.log("deep", await sc(), (await p.names()).slice(-1));
await p.evaluate(() => window.__t.setFilter("name", { terms: [{ operator: "endsWith", value: "99" }] })); await p.waitForTimeout(800);
console.log("textfilter", await p.st(), await sc(), (await p.names()).slice(0,2));
await p.evaluate(() => window.__t.setFilter("name", { terms: [{ operator: "isEmpty" }] })); await p.waitForTimeout(500);
console.log("isEmpty", await p.st(), await sc());
await p.evaluate(() => window.__t.setFilter("name", null)); await p.waitForTimeout(500);
// group by dept
await p.evaluate(() => window.__t.setGrouping(["dept"])); await p.waitForTimeout(800);
console.log("grouped", await sc(), (await p.locator("tbody tr").first().innerText()).replace(/\n/g," | "));
await p.screenshot({ path: "shots/virt-group.png" });
await p.evaluate(()=>window.__t.setGrouping([]));
// scrollToRow
await p.evaluate(()=>window.__t.scrollToRow("r77777")); await p.waitForTimeout(500);
console.log("scrollToRow", (await p.names()).slice(0,1), await sc());
// select all
await p.locator("thead input[type=checkbox]").first().click(); await p.waitForTimeout(500);
console.log("selall", await p.st());
console.log(p.errs); await p.b.close();
