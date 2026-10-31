import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
const cell = (r, c) => p.locator("tbody tr").nth(r).locator("td,th").nth(c);
const act = () => p.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ":" + (a.getAttribute("aria-label")||"") + ":" + (a.textContent||a.value||"").slice(0,25) : null; });
// sort by qty desc
await p.locator("th button", { hasText: "Qty" }).first().click(); await p.locator("th button", { hasText: "Qty" }).first().click();
console.log("sort", await p.names().then(n=>n.slice(0,3)), await p.evaluate(()=>JSON.stringify(window.__t.sort)));
// edit the qty cell of first row to 0 via type-over
await cell(0, 3).click(); console.log("active after click", await act());
await p.keyboard.type("0"); console.log("editing", await act());
await p.keyboard.press("Enter"); await p.waitForTimeout(200);
console.log("after Enter", await act(), "edits", JSON.stringify(await p.evaluate(()=>window.__edits)));
console.log("rows now", (await p.names()).slice(0,3));
// Escape cancel
await cell(1, 3).click(); await p.keyboard.press("Enter"); await p.keyboard.type("123"); await p.keyboard.press("Escape");
console.log("esc edits", await p.evaluate(()=>window.__edits.length), await act());
// Tab in editor
await cell(2, 3).click(); await p.keyboard.type("7"); await p.keyboard.press("Tab"); await p.waitForTimeout(200);
console.log("tab edits", await p.evaluate(()=>window.__edits.length), await act());
// invalid text in number
await cell(3, 3).click(); await p.keyboard.type("abc"); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
console.log("abc edits", await p.evaluate(()=>JSON.stringify(window.__edits.at(-1))), await act());
// data update during edit
await cell(4, 4).click(); await p.keyboard.press("Enter"); await p.keyboard.type("5");
await p.evaluate(() => window.__setRows((r) => r.map((x) => ({ ...x })))); await p.waitForTimeout(200);
console.log("editing during update still?", await act());
await p.evaluate(() => window.__setRows((r) => r.slice(1))); await p.waitForTimeout(200);
console.log("after rows shift", await act());
console.log(p.errs);
await p.screenshot({ path: "shots/edit.png" });
await p.b.close();
