import { open } from "./lib.mjs";
const p = await open();
const boxes = p.locator("tbody input[type=checkbox], tbody [role=checkbox]");
console.log("boxes", await boxes.count());
await boxes.nth(0).click(); await boxes.nth(1).click(); await boxes.nth(2).click({ modifiers: ["Shift"] });
await p.waitForTimeout(100);
console.log("sel log", JSON.stringify(await p.evaluate(() => window.__sel)));
// next page
await p.getByRole("button", { name: "Next page" }).click();
console.log("page2", await p.st(), (await p.names()).slice(0,2));
await boxes.nth(0).click();
console.log("sel log len", await p.evaluate(() => window.__sel.length), await p.evaluate(()=>window.__sel.at(-1)));
// header select-all
await p.locator("thead input[type=checkbox], thead [role=checkbox]").first().click();
console.log("after select all", await p.st(), await p.evaluate(()=>window.__sel.at(-1).length));
// search narrows -> selection stays?
await p.getByPlaceholder("Search").fill("Item 19");
await p.waitForTimeout(500);
console.log("after search", await p.st(), await p.evaluate(()=>window.__sel.length), await p.locator("text=/selected|ausgewählt/").allTextContents());
await p.screenshot({ path: "shots/sel-search.png" });
// toolbar bulk text
console.log(errs(p));
function errs(p){return p.errs}
await p.b.close();
