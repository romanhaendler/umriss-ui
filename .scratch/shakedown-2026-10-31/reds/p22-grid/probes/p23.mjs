import { open } from "./lib.mjs";
const p = await open("s=rows", { width: 1100, height: 900 });
const cell = (r, c) => p.locator("tbody tr").nth(r).locator("td,th").nth(c);
const draftRows = () => p.evaluate(() => [...document.querySelectorAll("tbody tr")].filter(r => r.querySelector("input:not([type=checkbox])")).map(r => r.cells[2]?.querySelector("input")?.value));
await cell(2, 2).click(); await p.keyboard.type("XX");
console.log("draft", await draftRows());
await p.getByPlaceholder("Search").fill("Item 3"); await p.waitForTimeout(600);
console.log("search hides draft row:", (await p.names()).slice(0,2), await draftRows());
await p.getByPlaceholder("Search").fill(""); await p.waitForTimeout(600);
console.log("cleared search", await draftRows(), await p.evaluate(()=>window.__saves.length));
// page change with draft
await p.getByRole("button", { name: "Next page" }).click(); await p.waitForTimeout(300);
console.log("page2 draft rows", await draftRows(), (await p.names())[0]);
await p.getByRole("button", { name: "Previous page" }).click(); await p.waitForTimeout(300);
console.log("back draft rows", await draftRows());
// sort with draft
await p.locator("th button", { hasText: "Qty" }).first().click(); await p.waitForTimeout(300);
console.log("sorted with draft", await draftRows(), await p.evaluate(()=>window.__saves.length));
// rows update under a draft: replace row data
console.log(p.errs); await p.b.close();
