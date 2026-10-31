import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
await p.evaluate(() => sessionStorage.clear());
const cell = (r, c) => p.locator("tbody tr").nth(r).locator("td,th").nth(c);
const act = () => p.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ":" + (a.value ?? a.textContent ?? "").slice(0, 18) + ":" + (a.closest("tr")?.querySelector("th")?.textContent ?? "") : null; });
const edits = () => p.evaluate(() => window.__edits.map(e => [e.rowKey, e.columnId, e.value]));
// (a) edit then click pager next
await cell(0, 3).click(); await p.keyboard.type("5"); await p.getByRole("button", { name: "Next page" }).click(); await p.waitForTimeout(300);
console.log("a) edit + pager click:", JSON.stringify(await edits()), (await p.names())[0], await act());
// (e) filter dept=Ops, edit Dept of first row -> HR
await p.evaluate(() => window.__t.setPage(1)); await p.evaluate(() => window.__t.setFilter("dept", ["Ops"])); await p.waitForTimeout(300);
console.log("rows", (await p.names()).slice(0, 3));
await cell(0, 4).click(); await p.waitForTimeout(200); console.log("editor", await act());
await p.locator("tbody tr").first().locator("select").selectOption("HR"); await p.waitForTimeout(400);
console.log("e) after change select:", JSON.stringify(await edits()), (await p.names()).slice(0, 3), await act());
await p.keyboard.press("Enter"); await p.waitForTimeout(300);
console.log("  after Enter:", JSON.stringify((await edits()).slice(-1)), (await p.names()).slice(0, 3), await act());
// (c) date editor
await p.evaluate(() => window.__t.setFilter("dept", null)); await p.waitForTimeout(300);
await cell(1, 5).click(); await p.waitForTimeout(300);
console.log("c) date editor open:", await act(), await p.locator("[role=dialog] , [role=grid] >> nth=1").count());
await p.screenshot({ path: "shots/date-editor.png" });
await p.keyboard.type("2026-05-01"); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
console.log("   date edit:", JSON.stringify((await edits()).slice(-1)));
console.log(p.errs); await p.b.close();
