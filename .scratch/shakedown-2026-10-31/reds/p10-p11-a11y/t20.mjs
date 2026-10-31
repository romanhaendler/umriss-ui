import { openRec } from "./lib.mjs";
const hash = process.argv[2]; const s = await openRec(hash); const p = s.page;
const info = (l) => p.evaluate((l) => { const g = document.querySelector("[role=grid],[role=treegrid],table"); const rows = [...g.querySelectorAll("tr")]; const idx = rows.map(r => r.getAttribute("aria-rowindex")); const bodyRows = g.querySelectorAll("tbody tr").length; return `${l}: rowcount=${g.getAttribute("aria-rowcount")} rows=${rows.length} idx=[${idx.slice(0,3)}..${idx.slice(-3)}] body=${bodyRows} text0=${g.querySelector("tbody tr")?.textContent.slice(0,30)}`; }, l);
console.log(await info("load"));
const act = process.argv.slice(3);
for (const a of act) {
  if (a === "next") await p.getByRole("button", { name: /Next page/ }).click();
  else if (a.startsWith("search:")) { await p.getByRole("searchbox").fill(a.slice(7)); await p.waitForTimeout(500); }
  else if (a.startsWith("click:")) await p.getByRole("button", { name: a.slice(6), exact: true }).first().click();
  else if (a.startsWith("scroll:")) { await p.evaluate((y) => { const sc = [...document.querySelectorAll("*")].find(e => e.scrollHeight > e.clientHeight + 50 && getComputedStyle(e).overflowY !== "visible"); sc.scrollTop = y; }, +a.slice(7)); await p.waitForTimeout(400); }
  await p.waitForTimeout(250); console.log(await info(a));
}
await s.close();
