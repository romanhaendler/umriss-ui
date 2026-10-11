# An XLSX export of the library's own

Status: ready-for-agent
Date:   2026-10-11
Origin: roadmap `.scratch/open-points-roadmap/spec.md`, row T7 and "What stays
as it was decided" (no foreign runtime dependency); facts in
`docs/research/open-points-2026-10/export_copy_and_wording.md` sections 1 and 4.
Blocked, where the conventions matter, by `.scratch/table-export-by-language`.

## Problem Statement

A CSV is text, and text makes a spreadsheet guess: a leading zero goes, a
date becomes a string or the wrong month, a cell starting with `=` becomes a
formula, a number reads as text under the wrong locale. The people who receive
the file are not the developers. The export has the types already (a number is
a number, a date a `Date`, a boolean a boolean) and throws them away at the
door. Every other grid library that offers this takes a spreadsheet library
along as a dependency; no umriss package has a runtime dependency, and none
is to start with this one.

## Solution

A writer of the library's own, behind an entry point of its own:

```tsx
import { Export } from "@umriss-ui/table";
import { xlsx } from "@umriss-ui/table/xlsx";

<Export format={xlsx} />
```

An application that never imports `@umriss-ui/table/xlsx` never pays for it
(the shape of ADR-0019). The file has one sheet, a header line and real cell
types - number, date, boolean, text - and the table's column widths. No
styling beyond what a date needs, no formulas, no group rows. Dates are the
reader's local time.

`Export` learns that a format is a value it is handed: `{ extension, mime,
write }`. The CSV becomes the default format of that same shape, exported as
`csv`.

## Decisions

| Decision | Choice | By |
|---|---|---|
| Writer | The library's own, no foreign dependency; a new ADR says no package takes one | roadmap T7 |
| Entry point | `@umriss-ui/table/xlsx`, as core's `./wording/de` | roadmap T7 |
| Use | `<Export format={xlsx} />` | roadmap T7 |
| Content | One sheet, a header line, number/date/boolean/text cells, column widths from the table, no styling, no formulas, no group rows | roadmap T7 |
| Time | Dates in the reader's local time | roadmap T7 |
| Rows and columns | Those of the CSV: filtered set, visible columns in shown order; a tree's Level column as a number; server mode the page. Same `projection` and `visibleColumns` path | decided |
| Format shape | `ExportFormat<R = string> { extension; mime; write(sheet, context): R }`; `ExportSheet { name; columns: { label; width? }[]; rows: Cell[][] }`, `Cell = string \| number \| boolean \| Date \| undefined`; `ExportContext { formats; wording }`. `csv` is one; `xlsx` is one with `R = Uint8Array` | decided |
| Typed cells reach the format | `exportValue` returns the raw typed value (date as `Date`); the CSV writer turns it into ISO text and yes/no, as the spec of `table-export-by-language` leaves it | decided |
| The seam on the snapshot | `snapshot.exportAs(format): R`; `asCsv()` stays and is `exportAs(csv)` | decided |
| `onExport` | Typed by the format: `(content: R) => void`. With the default it is `(text: string)`, as now; with `xlsx` it gets the bytes | decided |
| Button | The wording's `exportLabel`; a new optional `label` prop so that two `Export` parts can stand side by side ("Export CSV", "Export Excel") | decided |
| File name | `filename`, else the base of `wording.exportFileName` with the format's extension: `table.xlsx`, `tabelle.xlsx`. No new key | decided |
| Sheet name | New wording key `exportSheetName` ("Table" / "Tabelle"), cleaned of `[]:*?/\` and cut at 31 characters | decided |
| ZIP | Stored (method 0), no compression, UTF-8 flag, fixed DOS timestamp, CRC-32 table-driven, no ZIP64 | decided |
| Parts | `[Content_Types].xml`, `_rels/.rels`, `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `xl/styles.xml`, `xl/worksheets/sheet1.xml` - in that order. No shared strings, no docProps | decided |
| Text | Inline strings (`t="inlineStr"`), `xml:space="preserve"`: no table to build, no dedupe, and a string stays a string (`=1+1` is not a formula) | decided |
| Number | `<v>` with `String(n)`; an infinite value is empty | decided |
| Boolean | `t="b"`, `<v>0|1</v>` | decided |
| Date | A serial number: the Date's local wall-clock fields counted in days from 1899-12-30, with a style. A column whose dates are all at local midnight uses `yyyy-mm-dd`, else `yyyy-mm-dd hh:mm:ss`. A date before 1900-03-01 (Excel's calendar cannot hold it) is written as ISO text | decided |
| Styles | Three cell formats: general, date, date-time. Header unstyled | decided |
| Widths | `snapshot.widths` in pixels become `<col width>` at 7 px per character; columns without one get none | decided |
| Limits | Over 1,048,576 rows, 16,384 columns, or a text over 32,767 characters: the rows and columns throw a `RangeError` naming the limit; a text is cut. No silent damage | decided |
| Control characters | Characters XML 1.0 forbids are dropped; `& < >` escaped | decided |
| Size | Target under 4 kB minified and gzipped for `xlsx.js`; `check-dist` fails above it. A file is about the size of its XML: stored, not compressed, so a 100,000 x 10 sheet is tens of megabytes | decided |
| Build | `vite.config.ts` gets `entry: { index, xlsx }` with the core file-name function; `exports["./xlsx"]` with `types` -> `dist/xlsx.d.ts`; `xlsx.js` imports nothing at run time | decided |

## User stories

1. As a user, I open the file in Excel and find numbers right-aligned, dates as dates, true/false as booleans, and no repair prompt.
2. As a user of Numbers or LibreOffice, the same.
3. As a user, I see no `=` cell turn into a formula.
4. As a developer, I add one import and one prop; my bundle without it is unchanged.
5. As a developer, I put two buttons side by side, one per format.
6. As a developer, `onExport` gives me the bytes to send to a server.
7. As a maintainer, I can read the writer in one sitting and test it without Excel.

## Out of scope

- Compression; a streaming or worker writer; ZIP64.
- Styling, frozen header, filters on the sheet, number formats beyond dates, formulas, group rows, footer aggregates, several sheets.
- Time zones other than the reader's (roadmap X4).
- Reading XLSX; ODS; `asXlsx()` on the snapshot (`exportAs(xlsx)` does it).
- A server-mode export of every match (T3) - it will use this seam.

## Testing decisions

- No Excel in CI. Unit tests unzip the result with a test-only reader of stored ZIPs (central directory), check every CRC-32 against Node's `zlib.crc32`, parse each part as XML with `DOMParser` (well-formed), and read the sheet back: cell types, serials, the header, widths, escapes, the sheet name, an inline `=1+1`.
- CRC-32 against the known vector (`"123456789"` is `0xCBF43926`); the ZIP's directory against its offsets; a date at local midnight and one at 13:45 with a timezone set by `TZ` for the test; a date before 1900.
- Mounted: `<Export format={xlsx} onExport>` gives bytes of the right sheet; the default Export is unchanged; the download path sets the right extension and MIME.
- A build test (`check-dist`): `dist/xlsx.js` exists, imports nothing, is under the size bound; `dist/table.js` does not contain the writer.
- A manual check, listed for the release: open one file produced from the demo in Excel (desktop), Numbers, LibreOffice and Google Sheets - no repair prompt; types as above; a date, a leading-zero text, a boolean, an umlaut.

## Decided while writing

- `exportAs`, `ExportFormat`, `ExportSheet`; raw typed values reach the format.
- `label` prop on `Export`; `exportSheetName` wording key; file name from the existing one.
- Inline strings; styles: general, date, date-time; pre-1900 dates as text.
- Limits throw, texts are cut; a size bound enforced by `check-dist`.

## Comments
