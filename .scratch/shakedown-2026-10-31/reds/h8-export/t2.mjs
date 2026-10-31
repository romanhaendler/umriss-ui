import { open, csv, sel, clickExport, diff, ROWS } from "./lib.mjs";
import { csvOf, select, tsv, COLS } from "./oracle.mjs";
const results = [];
async function run(name, cfg, setup, state, lang = "en", extra) {
  const h = await open({ ...cfg, lang });
  await setup(h.page); await h.page.waitForTimeout(250);
  const rows = select(ROWS, state);
  const exp = csvOf(rows, state, lang);
  const a = await csv(h.page);
  const b = await clickExport(h.page);
  const d1 = diff(a, exp), d2 = diff(b, a);
  results.push(`${d1 || d2 ? "FAIL" : "ok  "} ${name} [${lang}] ${d1 ? "asCsv: " + d1 : ""} ${d2 ? "export!=asCsv: " + d2 : ""}${h.logs.length ? " LOGS " + h.logs.join(";") : ""}`);
  if (extra) await extra(h, rows);
  await h.close();
}
const S = (f) => (p) => p.evaluate(f);
for (const lang of ["en", "de"]) {
  await run("default", {}, async () => {}, {}, lang);
  await run("sort name asc", {}, S(() => window.t.toggleSort("name")), { sort: [["name", "asc"]] }, lang);
  await run("sort qty desc", {}, S(() => { window.t.toggleSort("qty"); window.t.toggleSort("qty"); }), { sort: [["qty", "desc"]] }, lang);
  await run("multi sort grp,price", {}, S(() => { window.t.toggleSort("grp"); window.t.toggleSort("price", true); }), { sort: [["grp", "asc"], ["price", "asc"]] }, lang);
  await run("search note 2", {}, S(() => window.t.setSearch("note 2")), { search: "note 2" }, lang);
  await run("search a", {}, S(() => window.t.setSearch(" A ")), { search: " A " }, lang);
  await run("hide/order/pin", {}, S(() => { const t = window.t; t.toggleColumn("price"); t.toggleColumn("tags"); t.setOrder(["sub", "name", "qty", "day"]); t.setPin("verdict", "start"); t.setPin("when", "end"); }), { hidden: ["price", "tags"], order: ["sub", "name", "qty", "day"], pin: { verdict: "start", when: "end" } }, lang);
  await run("hide row header (ignored)", {}, S(() => window.t.toggleColumn("id")), { hidden: ["id"] }, lang);
  await run("page 2 + size 5", { pageSize: 5 }, S(() => window.t.setPage(2)), {}, lang);
  await run("virtual", { virtual: true }, async () => {}, {}, lang);
  await run("virtual sorted", { virtual: true }, S(() => window.t.toggleSort("price")), { sort: [["price", "asc"]] }, lang);
  await run("range filter qty 1..100", {}, S(() => window.t.setFilter("qty", { from: 1, to: 100 })), { where: (r) => r.qty != null && !Number.isNaN(r.qty) && r.qty >= 1 && r.qty <= 100 }, lang);
  await run("list filter note", {}, S(() => window.t.setFilter("note", ["note 2", "note 3"])), { where: (r) => ["note 2", "note 3"].includes(r.note) }, lang);
  await run("colgroups", { groups: true }, async () => {}, {}, lang, async (h) => {
    const a = await csv(h.page); console.log("COLGROUP header:", JSON.stringify(a.split("\r\n")[0]));
  });
}
console.log(results.join("\n"));
