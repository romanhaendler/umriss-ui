import { chromium } from "@playwright/test";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
const errs = []; p.on("console", m => { if (["error","warning"].includes(m.type())) errs.push(m.type()+": "+m.text()); }); p.on("pageerror", e => errs.push("PAGEERR "+e.message));
await p.goto("http://localhost:4370/?s=main"); await p.waitForSelector("table, [role=grid]");
const names = () => p.$$eval("tbody th", e => e.map(x => x.textContent));
const range = () => p.locator("text=/\\d+–\\d+ of|of \\d+/").first().textContent();
// 1 text filter: starts with Item 1, type
await p.locator("th", { hasText: "Name" }).locator("button").nth(1).click();
const pop = p.locator("[role=dialog], [popover]").last();
console.log("popover", await pop.count());
const sels = p.locator("select, [role=combobox]");
console.log("combos", await sels.count());
await p.keyboard.type("");
const inputs = p.locator("input[type=text], input:not([type])");
console.log("inputs", await inputs.count());
await inputs.nth(await inputs.count()-2).fill("item 1");
await p.waitForTimeout(300);
console.log("after contains 'item 1' (ci)", (await names()).length, await range(), await p.evaluate(()=>[window.__t.rowCount, window.__t.pageCount]));
// onSelectionChange
await p.keyboard.press("Escape");
console.log("chips/toolbar", await p.locator("[role=toolbar], .toolbar").first().textContent().catch(()=>null));
await p.screenshot({ path: "shots/textfilter-applied.png" });
console.log(await p.evaluate(() => JSON.stringify(window.__view)));
console.log(errs);
await b.close();
