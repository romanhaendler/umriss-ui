import { openRec, axOf } from "./lib.mjs";
const hash = process.argv[2]; const seq = JSON.parse(process.argv[3]); const lang = process.argv[4] || "en";
const s = await openRec(hash, { lang }); const p = s.page; const ax = axOf(p);
const st = () => p.evaluate(() => { const a = document.activeElement; const tr = a.closest("tr"); return `${a === document.body ? "BODY" : a.tagName}@row${tr?.getAttribute("aria-rowindex")} exp=${tr?.getAttribute("aria-expanded")} lvl=${tr?.getAttribute("aria-level")} ${(tr?.textContent||"").slice(0,30)}`; });
await p.evaluate(() => document.querySelector("[role=grid],[role=treegrid]").querySelector("tbody th, tbody td").focus());
console.log("start", await st(), "|", await ax());
for (const k of seq) { await p.keyboard.press(k); await p.waitForTimeout(250); console.log(k.padEnd(12), (await st()).padEnd(60), "|", (await ax()).slice(0, 100), JSON.stringify(await s.live())); }
console.log(s.errors.join("\n")); await s.close();
