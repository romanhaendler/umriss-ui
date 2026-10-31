import { open, csv, clickExport, download } from "./lib.mjs";
import { HOSTILE } from "./data.mjs";
import ExcelJS from "exceljs";
const h = await open({ extra: true, pageSize: 100 });
const P = h.page;
await P.evaluate(() => window.t.setSearch("")); 
const c = await csv(P);
// parse CSV roughly
function parse(s) { s = s.replace(/^﻿/, ""); const rows = []; let row = [], f = "", q = false; for (let i = 0; i < s.length; i++) { const ch = s[i]; if (q) { if (ch === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; } else if (ch === '"') q = true; else if (ch === ",") { row.push(f); f = ""; } else if (ch === "\r" && s[i+1] === "\n") { row.push(f); rows.push(row); row = []; f = ""; i++; } else f += ch; } row.push(f); rows.push(row); return rows; }
const rows = parse(c);
console.log("csv rows:", rows.length, "expected", 1 + 40 + HOSTILE.length);
for (const r of rows.filter((r) => r[0].startsWith("X"))) { const orig = HOSTILE.find((x) => x.id === r[0]).name; console.log(r[0], r[1].length > 60 ? `[len ${r[1].length}]` : JSON.stringify(r[1]), r[1] === orig ? "same" : "CHANGED", r.length); }
const { buf } = await download(P, "XLSXfile");
const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buf); const ws = wb.worksheets[0];
console.log("xlsx rows", ws.rowCount);
for (let i = 0; i < HOSTILE.length; i++) { const v = ws.getRow(42 + i).getCell(2).value; const o = HOSTILE[i].name; console.log("X" + (i + 1), typeof v === "string" ? (v.length > 60 ? `[len ${v.length}]` : JSON.stringify(v)) : JSON.stringify(v), v === o ? "same" : "CHANGED"); }
console.log(h.logs);
await h.close();
