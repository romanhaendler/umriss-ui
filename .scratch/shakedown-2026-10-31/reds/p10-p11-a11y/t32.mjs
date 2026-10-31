import { openRec, axOf } from "./lib.mjs";
const s = await openRec("grid", { lang: "en" }); const p = s.page; const ax = axOf(p);
// focus a Team cell, then hide Team via the column menu, see what happens to focus
await p.evaluate(() => document.querySelector("[role=grid] tbody tr:nth-child(2) td:nth-child(3)").focus());
console.log("before", await ax());
await p.getByRole("button", { name: "Columns" }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
await p.getByRole("checkbox", { name: "Team" }).focus(); await p.keyboard.press("Space"); await p.waitForTimeout(300);
console.log("after hide", await ax());
await p.keyboard.press("Escape"); await p.waitForTimeout(300);
console.log("after Escape", await ax());
await p.keyboard.press("Tab"); console.log("Tab", await ax());
console.log(await p.evaluate(() => { const g=document.querySelector("[role=grid]"); return [...g.querySelectorAll("thead tr")].map(r=>[...r.children].map(c=>(c.textContent||"-").trim().slice(0,8)+"/"+(c.getAttribute("colspan")||1)).join(" ")).join("\n"); }));
for (const k of ["ArrowRight","ArrowRight","ArrowRight","ArrowRight"]) { await p.keyboard.press(k); console.log(k, await ax()); }
// hide Role as well -> group Work now has zero columns
await p.getByRole("button", { name: "Columns" }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
await p.getByRole("checkbox", { name: "Role" }).focus(); await p.keyboard.press("Space"); await p.waitForTimeout(300);
await p.keyboard.press("Escape");
console.log(await p.evaluate(() => { const g=document.querySelector("[role=grid]"); return [...g.querySelectorAll("thead tr")].map(r=>[...r.children].map(c=>(c.textContent||"-").trim().slice(0,8)+"/"+(c.getAttribute("colspan")||1)).join(" ")).join("\n"); }));
console.log(s.errors.join("\n")); await s.close();
