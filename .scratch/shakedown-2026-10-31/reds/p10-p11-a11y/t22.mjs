import { openRec, axOf } from "./lib.mjs";
const hash = process.argv[2]; const seq = JSON.parse(process.argv[3]);
const s = await openRec(hash, { q: process.argv[4] || "" }); const p = s.page; const ax = axOf(p);
const st = () => p.evaluate(() => { const a = document.activeElement; const sc = [...document.querySelectorAll("*")].find(e => e.scrollHeight > e.clientHeight + 50 && getComputedStyle(e).overflowY !== "visible"); const tr = a.closest("tr"); const r = tr?.getBoundingClientRect(), c = sc?.getBoundingClientRect(); const vis = r && c ? (r.top >= c.top - 1 && r.bottom <= c.bottom + 1) : null; return `${a === document.body ? "BODY" : a.tagName}@row${tr?.getAttribute("aria-rowindex")} ${(tr?.querySelector("th")||{}).textContent||""} scrollTop=${Math.round(sc?.scrollTop)} inview=${vis}`; });
await p.evaluate(() => document.querySelector("[role=grid],[role=treegrid]").querySelector("tbody tr:not([aria-hidden]) td").focus());
console.log("start", await st());
for (const k of seq) { if (k.startsWith("W:")) { await p.mouse.move(400, 300); await p.mouse.wheel(0, +k.slice(2)); } else await p.keyboard.press(k); await p.waitForTimeout(250); console.log(k.padEnd(14), await st()); }
console.log(s.errors.join("\n")); await s.close();
