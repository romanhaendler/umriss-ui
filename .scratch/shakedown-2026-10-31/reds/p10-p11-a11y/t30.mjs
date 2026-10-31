import { openRec, axOf } from "./lib.mjs";
const seq = JSON.parse(process.argv[2]); const lang = process.argv[3] || "en"; const hash = process.argv[4] || "grid";
const s = await openRec(hash, { lang }); const p = s.page; const ax = axOf(p);
const st = () => p.evaluate(() => { const a = document.activeElement; const tr = a.closest("tr"); const g=document.querySelector("[role=grid]"); return `${a === document.body ? "BODY" : a.tagName}@row${tr?.getAttribute("aria-rowindex")} first=${g.querySelector("tbody tr th")?.textContent} sort=${[...g.querySelectorAll("th[aria-sort]")].filter(t=>t.getAttribute("aria-sort")!=="none").map(t=>t.textContent+":"+t.getAttribute("aria-sort"))}`; });
await p.evaluate(() => document.querySelector("[role=grid] tbody td").focus());
for (const k of seq) { if (k.startsWith("T:")) await p.keyboard.type(k.slice(2)); else await p.keyboard.press(k); await p.waitForTimeout(250); console.log(k.padEnd(14), (await st()).padEnd(60), "|", (await ax()).slice(0, 90), JSON.stringify(await s.live())); }
console.log(s.errors.join("\n")); await s.close();
