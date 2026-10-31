import { openRec, axOf } from "./lib.mjs";
const hash = process.argv[2]; const n = +process.argv[3]; const theme = process.argv[4] || "light";
const s = await openRec(hash, { theme }); const p = s.page; const ax = axOf(p);
const ring = () => p.evaluate(() => { const a = document.activeElement; const c = getComputedStyle(a); const ps = getComputedStyle(a, ":focus-visible"); return `${a.tagName.toLowerCase()} outline=${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} shadow=${c.boxShadow.slice(0,50)}`; });
for (let i = 0; i < n; i++) { await p.keyboard.press("Tab"); const a = await ax(); const r = await ring(); const vis = !/outline=none/.test(r) || !/shadow=none/.test(r); console.log(String(i + 1).padStart(2), a.slice(0,90).padEnd(90), vis ? "" : "NO-RING " + r); }
console.log(s.errors.join("\n")); await s.close();
