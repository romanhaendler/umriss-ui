import { openRec, axOf } from "./lib.mjs";
const s = await openRec("core", { lang: "de" }); const p = s.page; const ax = axOf(p);
await p.locator('button:has-text("Auswählen")').focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
console.log(await p.locator("[role=dialog]:visible").last().ariaSnapshot());
for (const k of ["Tab","Tab","Tab","Tab","Tab","Tab","Tab","Tab"]) { await p.keyboard.press(k); await p.waitForTimeout(100); console.log(k, await ax(), JSON.stringify(await s.live())); }
await s.close();
