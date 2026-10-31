import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
const setH = (h) => p.evaluate((h) => { document.getElementById("frame").style.height = h + "px"; }, h);
const probe = async () => p.evaluate(() => { const s = document.querySelector("table").parentElement; const f = document.getElementById("frame"); const tb = document.querySelector("nav"); const last = [...document.querySelectorAll("tbody tr")].at(-1); return { ps: window.__t.pageSize, over: s.scrollHeight - s.clientHeight, gap: Math.round(tb.getBoundingClientRect().top - (document.querySelector("tfoot")?.getBoundingClientRect().bottom ?? last.getBoundingClientRect().bottom)) }; });
for (const mode of ["flat", "grouped", "compact+grouped"]) {
  if (mode === "grouped") await p.evaluate(() => window.__t.setGrouping(["dept"]));
  if (mode === "compact+grouped") await p.evaluate(() => { document.querySelector("table").setAttribute("data-x", 1); });
  const bad = [];
  for (let h = 260; h <= 700; h += 23) { await setH(h); await p.waitForTimeout(700); const r = await probe(); if (r.over > 0 || r.gap > 40) bad.push(h + ":" + JSON.stringify(r)); }
  console.log(mode, "bad heights:", bad.length ? bad : "none");
  if (mode === "compact+grouped") break;
}
console.log(p.errs.slice(0, 3)); await p.b.close();
