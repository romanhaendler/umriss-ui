import { open } from "./lib.mjs";
const dump = (page) => page.evaluate(() => {
  const g = document.querySelector("[role=grid],table");
  const out = [`root role=${g.getAttribute("role")} rowcount=${g.getAttribute("aria-rowcount")} colcount=${g.getAttribute("aria-colcount")}`];
  const rows = [...g.querySelectorAll("[role=row],tr")].slice(0, 5);
  for (const r of rows) {
    out.push(`ROW idx=${r.getAttribute("aria-rowindex")} :: ` + [...r.children].map((c) => `${c.getAttribute("role")||c.tagName}[ci=${c.getAttribute("aria-colindex")},cs=${c.getAttribute("aria-colspan")||c.getAttribute("colspan")},${(c.textContent||"").trim().slice(0,12)}]`).join(" "));
  }
  const last = [...g.querySelectorAll("[role=row],tr")].pop();
  out.push("LAST idx=" + last.getAttribute("aria-rowindex"));
  return out.join("\n");
});
for (const sc of ["read", "grid", "virtual", "grouped"]) { const s = await open(sc); console.log("== " + sc + "\n" + await dump(s.page)); await s.close(); }
