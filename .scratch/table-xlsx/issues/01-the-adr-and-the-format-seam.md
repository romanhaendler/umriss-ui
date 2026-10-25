# 01 - The ADR and the format seam

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/table-export-by-language/issues/01-conventions-from-formats-and-wording.md`
Spec: `.scratch/table-xlsx/spec.md`
ADR:    ADR-0073, given in `.scratch/after-shakedown/order.md`; use it wherever this ticket says "the next free number" or ADR-NNNN

## What to build

The decision first: an ADR, "no package takes a foreign runtime dependency"
(no number; the next free one at the time). It records that no package has
one, why XLSX does not start it (a writer is a few hundred lines; a library
is a supply chain in every application's bundle), and that the cost is carried
here: the format is written by hand, tested without Excel, and limited on
purpose. A pointer from the ADR index; `docs/README.md` lists it if it lists
ADR themes.

Then the seam, with no XLSX in it:

- `packages/table/src/export.ts`: `sheetOf(registry, levelLabel)` returns an `ExportSheet` - columns with label and, if the table holds one, a width, and rows of typed cells (`string | number | boolean | Date | undefined`) over the same `visibleColumns`/`projection` path as `csvOf`, the tree's Level as a number column.
- `values.ts`: `exportValue` returns the raw typed value (a `Date` stays a `Date`).
- `model/csv.ts` / a new `csv` format: `csv: ExportFormat` with `extension: "csv"`, `mime: "text/csv;charset=utf-8"`, `write(sheet, { formats, wording })` - the writer of the language ticket, turning a `Date` into ISO text.
- `types.ts` and `useTable.tsx`: `ExportFormat<R>`, `ExportSheet`, `ExportContext`, `snapshot.exportAs(format): R`; `asCsv()` is `exportAs(csv)`. All exported from the index, with `csv`.
- `unbound.tsx` `Export`: generic over the format's `R`; `format` defaults to `csv`; `onExport` gets `R`; the download builds the `Blob` from `format.mime`; file name `filename ?? base(wording.exportFileName) + "." + format.extension`; optional `label` prop for the button.

## Acceptance

- [ ] ADR written; the index points to it.
- [ ] Every existing export test passes unchanged; the CSV bytes are identical to the output of the language ticket.
- [ ] A test format handed to `Export` receives the sheet (typed cells, widths, Level) and its output reaches `onExport` and the download with the format's MIME and extension.
- [ ] `exportAs` and `asCsv()` agree; a custom `ExportFormat<number>` type-checks (type test).
- [ ] `label` replaces the button text; the default is unchanged.
- [ ] Typecheck and unit tests pass.
