# 02 - The writer

Status: ready-for-agent
Type: task
Size: L (about 250 lines of source, a larger test)

Blocked by: 01
Spec: `.scratch/table-xlsx/spec.md`

## What to build

`packages/table/src/xlsx/` - pure functions, no React, no imports from the
table at run time (`import type` only), so the file can be the second entry.

- `zip.ts`: a stored ZIP of named UTF-8 parts: local headers (flag 0x0800, method 0, fixed DOS date, CRC-32, sizes), central directory, end record; table-driven CRC-32; throws `RangeError` beyond 65,535 parts or 4 GB.
- `parts.ts`: the six parts of the spec, in order. `styles.xml` holds three cell formats (general, `yyyy-mm-dd`, `yyyy-mm-dd hh:mm:ss` as custom `numFmt` 164 and 165). `workbook.xml` names the sheet.
- `sheet.ts`: `sheet1.xml` from an `ExportSheet`: `<cols>` from widths (px / 7 + 1), the header line as inline strings, one `<row r>` per row, cells with `r="A1"` references; number, boolean (`t="b"`), text (`t="inlineStr"`, `xml:space="preserve"`), date as serial from local wall-clock fields (days from 1899-12-30; column style chosen by whether every date of the column is at local midnight); a date before 1900-03-01 as ISO text; absent and infinite values as no cell. XML escaping; characters XML 1.0 forbids dropped; a text cut at 32,767; more than 1,048,576 rows or 16,384 columns throws `RangeError` naming the limit; the sheet name cleaned of `[]:*?/\`, 31 characters, `Sheet1` if empty.
- `index.ts`: `export const xlsx: ExportFormat<Uint8Array>` with `extension: "xlsx"`, `mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"`, the sheet name from `context.wording.exportSheetName`.

## Acceptance

- [ ] CRC-32 of `"123456789"` is `0xCBF43926`; every part's CRC equals `zlib.crc32`.
- [ ] A test-only reader of stored ZIPs lists the six parts in order, with offsets that match the central directory.
- [ ] Each part parses as XML (`DOMParser`) without error.
- [ ] The sheet reads back: header cells, a number, a boolean, a text with `& < > "` and an umlaut, `=1+1` as a string cell, a date at midnight and one at 13:45 under a fixed `TZ` (serials checked by hand), a date before 1900 as ISO text, an absent value as a missing cell, widths.
- [ ] Limits throw; a text over 32,767 characters is cut.
- [ ] No import from the table's runtime modules (`import type` only); a lint or test enforces it.
- [ ] Typecheck and unit tests pass.
