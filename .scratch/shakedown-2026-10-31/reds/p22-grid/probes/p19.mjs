import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
await p.context().grantPermissions(["clipboard-read", "clipboard-write"]);
const cell = (r, c) => p.locator("tbody tr").nth(r).locator("td,th").nth(c);
const act = () => p.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ":" + (a.textContent||a.value||"").slice(0,20) : null; });
// focus a cell by keyboard: click row-header checkbox? use focusCell
await p.evaluate(() => window.__t.focusCell("r2", "name")); await p.waitForTimeout(150);
await p.keyboard.press("Control+c"); 
console.log("Ctrl+C active cell", JSON.stringify(await p.evaluate(() => navigator.clipboard.readText())));
await p.keyboard.press("Shift+ArrowDown"); await p.keyboard.press("Shift+ArrowRight");
console.log("shift arrows: aria-selected", await p.locator("[aria-selected=true]").count(), await act());
await p.evaluate(() => navigator.clipboard.writeText("PASTED"));
await p.keyboard.press("Control+v"); await p.waitForTimeout(150);
console.log("paste edits", await p.evaluate(() => window.__edits.length));
await p.keyboard.press("Delete"); await p.waitForTimeout(150);
console.log("delete edits", await p.evaluate(() => window.__edits.length), await act());
await p.keyboard.press("Control+z"); console.log("undo edits", await p.evaluate(() => window.__edits.length));
await cell(3, 4).click({ button: "right" }); await p.waitForTimeout(150);
console.log("context menu", await p.locator("[role=menu]").count());
// header drag Qty before Name
const a = await p.locator("thead th", { hasText: "Dept" }).boundingBox(), b = await p.locator("thead th", { hasText: "Name" }).boundingBox();
await p.mouse.move(a.x + 20, a.y + 15); await p.mouse.down(); await p.mouse.move(b.x + 40, b.y + 15, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(200);
console.log("order after header drag", await p.evaluate(() => window.__t.order.join(",")), "sort", await p.evaluate(()=>JSON.stringify(window.__t.sort)));
// selection by keyboard: Space on row?
await p.evaluate(() => window.__t.focusCell("r2", "name")); await p.keyboard.press("Space"); await p.waitForTimeout(100);
console.log("space selects?", await p.evaluate(() => window.__t.selection.count), await act());
await p.keyboard.press("Control+a"); console.log("ctrl+a", await p.evaluate(() => window.__t.selection.count));
// current row click
console.log(p.errs); await p.b.close();
