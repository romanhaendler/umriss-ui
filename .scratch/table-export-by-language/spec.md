# The CSV follows the language in use

Status: ready-for-human
Date:   2026-10-11
Origin: roadmap `.scratch/open-points-roadmap/spec.md`, row T6 and "Taken as
agreed" 4; facts in `docs/research/open-points-2026-10/export_copy_and_wording.md`
section 1. ADR-0024 left exactly this open: "Whether that should follow the
locale too is a question about a third object".

## Problem Statement

Under an English wording a table's CSV still comes out German: fields
separated by `;`, `3,5` for three and a half, `ja`/`nein` for a boolean. An
English Excel reads that as one column of text. The rules were set when German
was the only language shipped (`.scratch/umriss-table/spec.md`, "the export
follows German conventions"); ADR-0019 and ADR-0024 made English the default
and left this sentence behind. The header line, the button and the file name
already follow the wording; only the data does not.

## Solution

Three conventions are taken from the language in use; the rest stays.

- **Decimal mark:** the formats' (ADR-0024: notation is a format). Measured off
  the formats with core's `separatorsOf(formats).decimal`, as `NumberInput`
  reads its own output - so a caller who replaced `number` gets their own mark.
- **Field separator:** follows from the mark, because a separator equal to the
  decimal mark makes the file unreadable: `;` where the mark is `,`, otherwise
  `,`. Spreadsheets apply the same rule. No format entry is added.
- **Words for true and false:** the wording's (ADR-0024: words are wording),
  `booleanYes` and `booleanNo` in lower case, as the export always wrote them.
  English "yes"/"no"; German "ja"/"nein" - today's text.

Unchanged: the BOM, CRLF, quoting (now of the separator in use), dates as ISO
text, numbers without thousands groups, the filtered set, the visible columns.

## Decisions

| Decision | Choice | By |
|---|---|---|
| English CSV | Comma, decimal point, "yes"/"no" | roadmap T6 |
| German CSV | As today, byte for byte | roadmap T6 |
| BOM, dates | BOM stays; dates stay ISO | roadmap T6 |
| Changelog | A change for English callers, under "Changed" | roadmap T6 |
| Source of the mark | `Formats`, via `separatorsOf` | ADR-0024 |
| Source of the words | `Wording.booleanYes` / `booleanNo`, lower-cased with `toLocaleLowerCase()` | ADR-0024; decided |
| Source of the separator | Derived from the mark, not configured | decided |
| `asCsv()` without a provider | `useTable` already reads `useFormats()` and `useWording()` (`useTable.tsx` l.191-192); without a provider both are the English defaults, so `asCsv()` returns comma text. That is the change, and the changelog says it | decided |
| German wording, English formats | Mixed: German words, point and comma. ADR-0024 tells a German application to take both halves; the changelog repeats it | decided |
| Where the rules live | `model/csv.ts` stays pure: `asCsv(rows, columns, conventions)` with `CsvConventions { separator, decimal, yes, no }`; `export.ts` builds them from formats and wording | decided |
| Booleans reach the writer as booleans | `exportValue` stops writing "ja"/"nein" and keeps the boolean; the writer maps it (the XLSX spec needs the same seam) | decided |
| Number text | `String(n)` with its `.` replaced by the mark; exponent forms such as `1e-7` have no dot and stay | decided |
| Writer default | Without conventions the writer's default is the English set | decided |

## User stories

1. As a developer in an English application, I open the export in English Excel and find columns, and `3.5` is a number.
2. As a German application (wording and formats from `@umriss-ui/core/wording/de`), I get the file I got before.
3. As a developer who replaced `formats.number`, my mark is the file's mark.
4. As a developer calling `asCsv()` with no provider, I get the English file, and the changelog told me.
5. As a maintainer, I read in one place where each convention comes from.

## Out of scope

- A separator, BOM or line-break option on `Export` (the application can process the text it is handed).
- Dates in the language's notation, thousands groups, a currency.
- Reading a CSV back; any other language.

## Testing decisions

- `tests-unit/csv.test.ts`: the writer with English and with German conventions against one fixture (a decimal, a text holding each separator, a quote, a newline, a boolean, an absent value); the German output pinned byte for byte to the old one. Existing assertions that mean "German" are given the German conventions explicitly, not deleted.
- A mounted `Export` test with `onExport`: default provider (English), German wording plus formats (German), German wording alone (mixed).
- `asCsv()` on a table with no provider: English text.
- A replaced `formats.number` with `,` as its mark gives `;` as separator.
- Tree and server-mode export tests pass apart from the conventions.

## Decided while writing

- The separator is derived from the mark; no new format entry.
- The true/false words are the wording's yes/no in lower case; no new wording key.
- The writer takes `CsvConventions`; `exportValue` keeps booleans.
- Mixed German wording and English formats is allowed and documented.

## Comments
