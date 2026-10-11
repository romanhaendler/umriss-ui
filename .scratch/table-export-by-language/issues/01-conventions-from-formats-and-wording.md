# 01 - Conventions from the formats and the wording

Status: done
Type: task
Size: M (three source files, the tests, the Export examples' expected text)

Blocked by: none
Spec: `.scratch/table-export-by-language/spec.md`

## What to build

The CSV's separator, decimal mark and the words for true and false come from
the language in use.

- `packages/table/src/model/csv.ts`: `CsvConventions { separator; decimal; yes; no }`; `asCsv(rows, columns, conventions = ENGLISH)`. The constant `SEPARATOR`, `asNumber` and the quoting rule take their values from it (`field` quotes on the separator in use, `"`, CR, LF). A boolean cell is written as `yes`/`no`. The header comment is rewritten: the rules are the language's, the BOM and CRLF still the spreadsheet's.
- `packages/table/src/values.ts`: `exportValue` returns a boolean as a boolean; `EXPORT_YES`/`EXPORT_NO` and their comment go.
- `packages/table/src/export.ts`: `csvOf(registry, levelLabel, formats, wording)` builds the conventions: `decimal = separatorsOf(formats).decimal`, `separator = decimal === "," ? ";" : ","`, `yes`/`no` the wording's `booleanYes`/`booleanNo` lower-cased. `useTable.tsx` (l.570) passes the `formats` and `wording` it already holds. `separatorsOf` is exported in `packages/core/src/lib/language/index.tsx` (l.98); make sure core's entry carries it.
- The `demo/examples/Export/` examples follow if they show the text.

## Acceptance

- [ ] English provider or none: comma, decimal point, `yes`/`no`; a text containing a comma is quoted.
- [ ] German wording and formats: byte-identical to the previous release's file (a pinned fixture).
- [ ] German wording with English formats: German words, `.` and `,`.
- [ ] A replaced `formats.number` writing `,` gives `;` as the separator.
- [ ] BOM, CRLF, ISO dates, no thousands groups, filtered set, visible columns unchanged; tree export (level column) and server mode (page) unchanged apart from the conventions.
- [ ] `csv.ts` imports neither React nor core.
- [ ] Typecheck and unit tests pass; tests that meant German say so.

## Comments

Delivered 2026-10-11. `csv.ts` takes `CsvConventions` (English default) and a `CsvColumn` type whose value may be a boolean; `exportValue` keeps booleans; `export.ts` builds the conventions (`conventionsOf`) and `useTable` passes formats and wording. `separatorsOf` was already exported from core's entry. Tests: `csv.test.ts` (one fixture in two languages, German pinned byte for byte), new `exportLanguage.test.tsx` (default, German, mixed, replaced number format, `asCsv()` without provider); mounted tests that only incidentally expected German now expect English.
