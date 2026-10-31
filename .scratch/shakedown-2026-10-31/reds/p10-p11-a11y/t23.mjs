import { openRec } from "./lib.mjs";
const s = await openRec("virtual", { q: process.argv[2] || "", w: 1100, h: 520 }); const p = s.page;
await p.evaluate(() => document.querySelector("[role=grid] tbody tr:not([aria-hidden]) td").focus());
await p.keyboard.press("Control+End"); await p.waitForTimeout(400); await p.keyboard.press("Control+Home"); await p.waitForTimeout(600);
await p.screenshot({ path: "shots/virtual-ctrl-home" + (process.argv[2] ? "-sticky" : "") + ".png" });
console.log(await p.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return `${a.tagName} top=${r.top} bottom=${r.bottom} vh=${innerHeight}`; }));
await s.close();
