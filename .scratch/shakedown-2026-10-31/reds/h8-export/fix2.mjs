import fs from "node:fs";
let s = fs.readFileSync("oracle.mjs", "utf8");
s = s.replace(/export const tsv = [\s\S]*$/, `export const tsv = (rows, state, lang) => {
  const cols = visible(state);
  const dayCol = (c) => { const vs = rows.map(c.get).filter((v) => v instanceof Date); return c.id !== "own" && vs.length > 0 && vs.every((d) => d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds() === 0); };
  const f = (v, c) => { const s = cell(v, { lang, dateAsDay: dayCol(c) }); return /^[=+\\-@\\t\\r]/.test(s) && typeof v === "string" ? "'" + s : s; };
  return [cols.map((c) => c.label), ...rows.map((r) => cols.map((c) => f(c.get(r), c)))].map((x) => x.join("\\t")).join("\\n");
};
`);
fs.writeFileSync("oracle.mjs", s);
