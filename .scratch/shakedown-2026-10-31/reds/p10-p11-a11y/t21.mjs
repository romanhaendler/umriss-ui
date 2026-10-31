import { openRec } from "./lib.mjs";
const s = await openRec(process.argv[2] || "virtual"); const p = s.page;
await p.evaluate(() => { const sc = [...document.querySelectorAll("*")].find(e => e.scrollHeight > e.clientHeight + 50 && getComputedStyle(e).overflowY !== "visible"); sc.scrollTop = 30000; });
await p.waitForTimeout(500);
console.log(await p.evaluate(() => { const g = document.querySelector("[role=grid],[role=treegrid]"); return [...g.querySelectorAll("tbody tr")].map(r => `${r.getAttribute("aria-rowindex")}|${r.getAttribute("role")||""}|hidden=${r.getAttribute("aria-hidden")}|${(r.querySelector("th")||{}).textContent||r.textContent.slice(0,10)}`).filter((x,i,a)=>i<4||i>a.length-4).join("\n"); }));
console.log(await p.locator("[role=grid]").ariaSnapshot().then(t=>t.split("\n").slice(0,40).join("\n")));
await s.close();
