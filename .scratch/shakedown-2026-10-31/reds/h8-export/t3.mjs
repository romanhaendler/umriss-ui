import { open, csv, sel, clickExport, download, diff, ROWS } from "./lib.mjs";
import { csvOf, select, tsv } from "./oracle.mjs";
const out = [];
const rep = (n, d, extra = "") => out.push(`${d ? "FAIL" : "ok  "} ${n} ${d ?? ""} ${extra}`);
const nm = (r) => r.name;
// text filter operators
const T = (terms, join) => (join ? { terms, join } : { terms });
const tcases = [
  ["contains a", T([{ operator: "contains", value: "a" }]), (r) => nm(r).toLowerCase().includes("a")],
  ["notContains a", T([{ operator: "notContains", value: "a" }]), (r) => !nm(r).toLowerCase().includes("a")],
  ["startsWith al (case)", T([{ operator: "startsWith", value: "AL" }]), (r) => nm(r).toLowerCase().startsWith("al")],
  ["endsWith 1", T([{ operator: "endsWith", value: "1" }]), (r) => nm(r).endsWith("1")],
  ["equals alpha", T([{ operator: "equals", value: "alpha" }]), (r) => nm(r).toLowerCase() === "alpha"],
  ["isEmpty", T([{ operator: "isEmpty" }]), (r) => nm(r) === ""],
  ["contains a OR contains z", T([{ operator: "contains", value: "a" }, { operator: "contains", value: "z" }], "or"), (r) => /a|z/i.test(nm(r))],
  ["contains a AND notContains p", T([{ operator: "contains", value: "a" }, { operator: "notContains", value: "p" }]), (r) => /a/i.test(nm(r)) && !/p/i.test(nm(r))],
  ["equals ÄPFEL (locale case)", T([{ operator: "equals", value: "äpfel" }]), (r) => nm(r).toLowerCase() === "äpfel"],
  ["contains 'x;y'", T([{ operator: "contains", value: "x;y" }]), (r) => nm(r).includes("x;y")],
];
for (const [n, cond, where] of tcases) {
  const h = await open();
  await h.page.evaluate((c) => window.t.setFilter("name", c), cond); await h.page.waitForTimeout(200);
  const st = { where }; const rows = select(ROWS, st);
  rep("textfilter " + n, diff(await csv(h.page), csvOf(rows, st)), `(${rows.length} rows)`);
  rep("  export==asCsv " + n, diff(await clickExport(h.page), await csv(h.page)));
  await h.close();
}
// view state and filter combined with search + sort + hidden
{
  const h = await open();
  await h.page.evaluate(() => { const t = window.t; t.setSearch("e"); t.setFilter("name", { terms: [{ operator: "notContains", value: "z" }] }); t.setFilter("qty", { from: 0 }); t.toggleSort("day"); t.toggleSort("day"); t.toggleColumn("name"); });
  await h.page.waitForTimeout(250);
  const st = { search: "e", where: (r) => !/z/i.test(r.name) && r.qty != null && !Number.isNaN(r.qty) && r.qty >= 0, sort: [["day", "desc"]], hidden: ["name"] };
  rep("combo", diff(await csv(h.page), csvOf(select(ROWS, st), st)));
  await h.close();
}
// selection across pages and filters
for (const lang of ["en", "de"]) {
  const h = await open({ pageSize: 5 }, {}); 
  await h.page.evaluate(() => {});
  const keys = ["R001", "R007", "R013", "R022", "R031", "R040"];
  await h.page.evaluate((k) => window.t.selection.set(k, true), keys);
  await h.page.waitForTimeout(150);
  let st = {}; let rows = ROWS.filter((r) => keys.includes(r.id));
  rep("selection pages", diff(await sel(h.page), tsv(rows, st, "en")), `count=${await h.page.evaluate(() => window.t.selection.count)}`);
  await h.page.evaluate(() => { window.t.setSearch("note 2"); window.t.toggleSort("price"); });
  await h.page.waitForTimeout(150);
  st = { search: "note 2", sort: [["price", "asc"]] };
  rows = select(ROWS, st).filter((r) => keys.includes(r.id));
  rep("selection in filter+sort", diff(await sel(h.page), tsv(rows, st, "en")), `inFilter=${rows.length} count=${await h.page.evaluate(() => window.t.selection.count)}`);
  await h.close();
  break;
}
console.log(out.join("\n"));
