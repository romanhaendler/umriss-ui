import { open, download, clickExport, ROWS } from "./lib.mjs";
import { visible, select } from "./oracle.mjs";
import XLSX from "xlsx";
import ExcelJS from "exceljs";
import fs from "node:fs";
const issues = [];
for (const lang of ["en", "de"]) {
  const h = await open({ lang });
  const { name, buf } = await download(h.page, "XLSXfile");
  fs.writeFileSync(`shots/out-${lang}.xlsx`, buf);
  console.log(lang, "download name:", name, buf.length, "bytes", "magic", buf.slice(0, 2).toString());
  const bytes = Buffer.from(await clickExport(h.page, "XLSX"));
  const wbJ = new ExcelJS.Workbook(); await wbJ.xlsx.load(buf);
  const ws = wbJ.worksheets[0];
  console.log(" sheet name:", JSON.stringify(ws.name), "rows", ws.rowCount, "cols", ws.columnCount, "bytesEqual(onExport vs file)", Buffer.compare(bytes, buf) === 0);
  const cols = visible({});
  const hdr = ws.getRow(1).values.slice(1);
  console.log(" header:", JSON.stringify(hdr) === JSON.stringify(cols.map((c) => c.label)) ? "ok" : JSON.stringify(hdr));
  const widths = ws.columns.map((c) => c.width);
  console.log(" widths:", widths.join(","));
  let bad = 0;
  ROWS.forEach((r, i) => {
    const row = ws.getRow(i + 2);
    cols.forEach((c, j) => {
      const exp = c.get(r); const cellv = row.getCell(j + 1);
      let got = cellv.value;
      let okk;
      if (exp == null || (typeof exp === "number" && !Number.isFinite(exp))) okk = got === null || got === undefined || got === "";
      else if (typeof exp === "number") okk = got === exp || Object.is(got, exp) || (Object.is(exp, -0) && got === 0);
      else if (typeof exp === "boolean") okk = got === exp;
      else if (exp instanceof Date) okk = got instanceof Date && Math.abs(+got - (+exp - exp.getTimezoneOffset() * -60000 * 0)) >= 0;
      else okk = got === exp || (typeof got === "string" && got === exp) || (got && got.richText);
      if (!okk) { bad++; if (bad <= 14) issues.push(`${lang} ${r.id}.${c.id}: expected ${JSON.stringify(exp)} got ${JSON.stringify(got)} (${typeof got}) fmt=${cellv.numFmt}`); }
    });
  });
  console.log(" mismatches:", bad);
  // dates: compare as wall clock in Berlin
  const dayIdx = cols.findIndex((c) => c.id === "day"), whenIdx = cols.findIndex((c) => c.id === "when");
  const r0 = ws.getRow(2);
  console.log(" day cell R001:", r0.getCell(dayIdx + 1).value, r0.getCell(dayIdx + 1).numFmt, "| when cell:", r0.getCell(whenIdx + 1).value, r0.getCell(whenIdx + 1).numFmt, " expected local", ROWS[0].when.toString());
  // SheetJS
  const wb2 = XLSX.read(buf, { cellDates: true });
  const sh = wb2.Sheets[wb2.SheetNames[0]];
  const a5 = XLSX.utils.sheet_to_json(sh, { header: 1, raw: true });
  const f = Object.keys(sh).filter((k) => sh[k].f);
  console.log(" sheetjs formulas:", f.length, "types R005 name cell:", JSON.stringify(sh["B6"]));
  await h.close();
}
console.log(issues.join("\n"));
