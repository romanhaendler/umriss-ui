import { open } from "./lib.mjs";
const p = await open("s=bools", { width: 1100, height: 700 });
const cell = (r, c) => p.locator("tbody tr").nth(r).locator("td,th").nth(c);
await cell(1, 2).click(); await p.waitForTimeout(200);
console.log("own editor present", await cell(1, 2).locator("input[type=checkbox]").count(), await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.type));
await p.keyboard.press("Space"); await p.waitForTimeout(200);
console.log("edits after Space", JSON.stringify(await p.evaluate(()=>(window.__edits??[]).map(e=>[e.rowKey,e.columnId,e.value]))));
await p.keyboard.press("Enter"); await p.waitForTimeout(200);
console.log("after Enter", JSON.stringify(await p.evaluate(()=>(window.__edits??[]).map(e=>[e.rowKey,e.columnId,e.value]))), (await cell(1,2).innerText()));
// filter list for bool
await p.locator("th", { hasText: /^Active$/ }).first().locator("button").nth(1).click().catch(()=>{});
console.log(p.errs.slice(0,3)); await p.b.close();
