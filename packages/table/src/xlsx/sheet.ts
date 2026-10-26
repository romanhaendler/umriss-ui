/* The one sheet: a header line of inline strings and a row per row, each cell
   typed. Nothing here reads the table - it gets the sheet the export built. */

import type { ExportSheet } from "../types";
import { escapeXml } from "./parts";

const MAX_ROWS = 1048576;
const MAX_COLUMNS = 16384;
const MAX_TEXT = 32767;
const DAY = 86400000;
const EPOCH = Date.UTC(1899, 11, 30);
/* Excel's calendar has a 29 February 1900 that never was; from 1900-03-01 on,
   the serial counted from 1899-12-30 is the one it shows. Before, it cannot. */
const FIRST_SERIAL = 61;

/* Characters XML 1.0 allows; a lone surrogate is none. */
const FORBIDDEN = /[^\t\n\r -퟿-�\u{10000}-\u{10FFFF}]/gu;

/** "A" ... "XFD" for a zero-based column. */
function letters(n: number): string {
  let s = "";
  for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** The local wall-clock fields of a date as days since 1899-12-30. */
const serialOf = (d: Date) =>
  (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()) - EPOCH) / DAY;

const isDay = (d: Date) => d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds() === 0;
const hasSerial = (v: unknown): v is Date => v instanceof Date && serialOf(v) >= FIRST_SERIAL;

function text(raw: string): string {
  let s = raw.replace(FORBIDDEN, "");
  if (s.length > MAX_TEXT) {
    s = s.slice(0, MAX_TEXT);
    /* A cut must not leave half of a surrogate pair. */
    if (/[\uD800-\uDBFF]$/.test(s)) s = s.slice(0, -1);
  }
  return escapeXml(s);
}

const inline = (ref: string, s: string) => `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${text(s)}</t></is></c>`;

/** `sheet1.xml` for a sheet. Throws a `RangeError` naming the limit when the
    sheet has more rows or columns than a worksheet holds. */
export function sheetXml(sheet: ExportSheet): string {
  const { columns, rows } = sheet;
  if (columns.length > MAX_COLUMNS) throw new RangeError(`A worksheet holds at most ${MAX_COLUMNS.toLocaleString("en")} columns.`);
  if (rows.length + 1 > MAX_ROWS) throw new RangeError(`A worksheet holds at most ${MAX_ROWS.toLocaleString("en")} rows.`);

  /* A column of dates is a date column when no date in it has a time. */
  const styles = columns.map((_, c) => {
    for (const row of rows) {
      const v = row[c];
      if (hasSerial(v) && !isDay(v)) return 2;
    }
    return 1;
  });

  const cols = columns
    .map((c, i) => (c.width === undefined ? "" : `<col min="${i + 1}" max="${i + 1}" width="${c.width / 7 + 1}" customWidth="1"/>`))
    .join("");

  const head = `<row r="1">${columns.map((c, i) => inline(`${letters(i)}1`, c.label)).join("")}</row>`;
  const body = rows.map((row, r) => {
    const n = r + 2;
    let cells = "";
    for (let c = 0; c < row.length; c++) {
      const v = row[c];
      const ref = `${letters(c)}${n}`;
      if (typeof v === "number") {
        if (Number.isFinite(v)) cells += `<c r="${ref}"><v>${v}</v></c>`;
      } else if (typeof v === "boolean") cells += `<c r="${ref}" t="b"><v>${v ? 1 : 0}</v></c>`;
      else if (typeof v === "string") cells += inline(ref, v);
      else if (v instanceof Date && !Number.isNaN(v.getTime())) {
        if (serialOf(v) >= FIRST_SERIAL) cells += `<c r="${ref}" s="${styles[c]}"><v>${serialOf(v)}</v></c>`;
        else cells += inline(ref, v.toISOString());
      }
    }
    return cells ? `<row r="${n}">${cells}</row>` : `<row r="${n}"/>`;
  });

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    (cols ? `<cols>${cols}</cols>` : "") +
    `<sheetData>${head}${body.join("")}</sheetData></worksheet>`
  );
}
