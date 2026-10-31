import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
await p.locator("th", { hasText: "Note" }).locator("button").nth(1).click(); await p.waitForTimeout(300);
const pop = p.getByRole("dialog").last();
console.log("selects in pop", await pop.locator("select").count(), await pop.locator("input").count());
await pop.locator("select").nth(0).selectOption({ label: "is empty" }); await p.waitForTimeout(300);
console.log("inputs after is-empty", await pop.locator("input:not([type=checkbox])").count(), await pop.locator("input:not([type=checkbox])").evaluateAll(a=>a.map(i=>i.disabled)));
await p.screenshot({ path: "shots/isempty.png" });
await pop.locator("select").nth(1).selectOption({ label: "starts with" });
await pop.locator("input").last().fill("n19"); await p.getByRole("button", {name:"or"}).click(); await p.waitForTimeout(400);
console.log("view", await p.evaluate(()=>JSON.stringify(window.__view)), await p.evaluate(()=>window.__t.rowCount));
await p.keyboard.press("Escape"); await p.waitForTimeout(300);
console.log("toolbar", (await p.locator("[class*=toolbar]").first().innerText()).replace(/\n/g, " | "));
await p.screenshot({ path: "shots/chip.png" });
// reload via initialView roundtrip
const v = await p.evaluate(()=>window.__view);
await p.b.close();
