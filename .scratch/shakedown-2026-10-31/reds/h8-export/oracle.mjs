import { ROWS, cell, toCsv, dayOf } from "./lib.mjs";
const coll = new Intl.Collator("en-GB");
const absent = (v) => v == null || (typeof v === "number" && Number.isNaN(v));
export const COLS = [
  { id: "id", label: "ID", get: (r) => r.id },
  { id: "name", label: "Name", get: (r) => r.name },
  { id: "qty", label: "Qty", get: (r) => r.qty },
  { id: "price", label: "Price", get: (r) => r.price },
  { id: "when", label: "When", get: (r) => r.when },
  { id: "day", label: "Day", get: (r) => r.day },
  { id: "ok", label: "OK", get: (r) => r.ok },
  { id: "note", label: "Note", get: (r) => r.note },
  { id: "tags", label: "Tags", get: (r) => r.tags.join("|") },
  { id: "own", label: "OwnDate", get: (r) => r.when.getTime() },
  { id: "plain", label: "Computed", get: (r) => r.score },
  { id: "verdict", label: "Verdict", get: (r) => r.score },
  { id: "grp", label: "Group", get: (r) => r.grp },
  { id: "sub", label: "Sub", get: (r) => r.sub },
];
const SEARCHABLE = ["id", "name", "note", "grp", "sub"];
export function visible(state = {}) {
  const hidden = state.hidden ?? [], order = state.order ?? [], pin = state.pin ?? {};
  let cols = [...order.map((i) => COLS.find((c) => c.id === i)).filter(Boolean), ...COLS.filter((c) => !order.includes(c.id))];
  cols = cols.filter((c) => c.id === "id" || !hidden.includes(c.id)); // row header cannot hide
  return [...cols.filter((c) => pin[c.id] === "start"), ...cols.filter((c) => !pin[c.id]), ...cols.filter((c) => pin[c.id] === "end")];
}
export function select(rows, state = {}) {
  let r = rows;
  if (state.search) { const s = state.search.trim().toLowerCase(); r = r.filter((x) => SEARCHABLE.some((id) => { const v = COLS.find((c) => c.id === id).get(x); return !absent(v) && String(v).toLowerCase().includes(s); })); }
  if (state.where) r = r.filter(state.where);
  const idx = new Map(r.map((x, i) => [x, i]));
  if (state.sort?.length) r = [...r].sort((a, b) => {
    for (const [id, dir] of state.sort) {
      const g = COLS.find((c) => c.id === id).get; const va = g(a), vb = g(b);
      const aa = absent(va), ab = absent(vb);
      if (aa || ab) { if (aa && ab) continue; return aa ? 1 : -1; }
      let d = typeof va === "number" && typeof vb === "number" ? va - vb : va instanceof Date ? va - vb : typeof va === "boolean" ? Number(va) - Number(vb) : coll.compare(String(va), String(vb));
      if (d) return dir === "asc" ? d : -d;
    }
    return idx.get(a) - idx.get(b);
  });
  return r;
}
export function csvOf(rows, state = {}, lang = "en") {
  const cols = visible(state);
  const dayCol = (c) => { const vs = rows.map(c.get).filter((v) => v instanceof Date); return c.id !== "own" && vs.length > 0 && vs.every((d) => d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds() === 0); };
  const body = rows.map((r) => cols.map((c) => {
    let v = c.get(r);
    const s = cell(v, { lang, dateAsDay: dayCol(c) });
    return /^[=+\-@\t\r]/.test(s) && typeof v === "string" ? "'" + s : s;
  }));
  return "﻿" + toCsv(cols.map((c) => c.label), body, lang);
}
export const tsv = (rows, state, lang) => {
  const cols = visible(state);
  const dayCol = (c) => { const vs = rows.map(c.get).filter((v) => v instanceof Date); return c.id !== "own" && vs.length > 0 && vs.every((d) => d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds() === 0); };
  const f = (v, c) => { const s = cell(v, { lang, dateAsDay: dayCol(c) }); return /^[=+\-@\t\r]/.test(s) && typeof v === "string" ? "'" + s : s; };
  return [cols.map((c) => c.label), ...rows.map((r) => cols.map((c) => f(c.get(r), c)))].map((x) => x.join("\t")).join("\n");
};
