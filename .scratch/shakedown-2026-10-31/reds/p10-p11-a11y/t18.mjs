import { openRec, axOf } from "./lib.mjs";
const s = await openRec("core", { lang: "de" }); const p = s.page; const ax = axOf(p);
await p.locator('button:has-text("Auswählen")').focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
const seq = ["Tab","Tab","Space","Tab","Space","Tab","Tab","Space","Tab","Space","Space","Tab","Space","Space","Tab","Space"];
for (const k of seq) { await p.keyboard.press(k); await p.waitForTimeout(120); console.log(k.padEnd(6), (await ax()).slice(0,80), JSON.stringify(await s.live())); }
console.log(await p.locator("[role=dialog]:visible").last().ariaSnapshot().then(t=>t.split("\n").filter(l=>/checkbox|\d \//.test(l)).join(" ")));
await s.close();
