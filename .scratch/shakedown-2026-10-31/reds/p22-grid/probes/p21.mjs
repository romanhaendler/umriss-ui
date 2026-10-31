import { open } from "./lib.mjs";
const p = await open("s=rows", { width: 1100, height: 900 });
await p.waitForTimeout(1500);
console.log("opacity row 8/9", await p.evaluate(() => [...document.querySelectorAll("tbody tr")].map(r => getComputedStyle(r).opacity + "/" + getComputedStyle(r.cells[2]).opacity).join(" ")));
const cell = (r, c) => p.locator("tbody tr").nth(r).locator("td,th").nth(c);
// enter row edit
await cell(1, 2).click(); await p.waitForTimeout(200);
console.log("after click", await p.evaluate(() => document.activeElement.tagName + ":" + document.activeElement.value), await p.locator("tbody tr").nth(1).locator("input,select").count());
await p.screenshot({ path: "shots/rowedit.png" });
// clear name, save with Enter
await p.keyboard.press("Control+a"); await p.keyboard.press("Backspace"); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
console.log("saves", JSON.stringify(await p.evaluate(() => window.__saves.length)), "alert", await p.locator("[role=alert], [aria-invalid=true]").count(), (await p.locator("[role=alert]").allTextContents()));
await p.screenshot({ path: "shots/rowedit-invalid.png" });
// fix
await p.keyboard.type("Renamed"); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
console.log("saves", JSON.stringify(await p.evaluate(() => window.__saves.map(s => s.changes ?? s))), await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.textContent.slice(0,20)));
// search while draft open
await cell(2, 2).click(); await p.keyboard.type("x");
await p.getByPlaceholder("Search").fill("Item 3"); await p.waitForTimeout(500);
console.log("search w/ draft", (await p.names()).slice(0,3), await p.locator("tbody tr input").count());
// New row
await p.getByRole("button", { name: "New row" }).click(); await p.waitForTimeout(300);
await p.screenshot({ path: "shots/newrow.png" });
console.log(p.errs); await p.b.close();
