# 04 - Documents and release

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01, 02, 03, 05
Spec: `.scratch/table-xlsx/spec.md`

## What to build

- Table README, the `Export` documentation and the capability record: what the file holds (one sheet, typed cells, widths, local-time dates), what it does not (styling, formulas, group rows, compression), the limits, the size note, and how to import it. The "XLSX export" line in the "later" lists and the non-goals pages now says it exists.
- Changelogs: table under **Added** (`@umriss-ui/table/xlsx`, `Export`'s `format` and `label`, `exportAs`, `csv`, the `ExportFormat` types); core under **Added** (`exportSheetName`). A new word in core takes table, schedule and calculation along, as the release rule says.
- The testing guide names the new tests where their kind stands, and says why unzip-and-read replaces Excel.
- The release checklist carries the manual check of the spec: one file from the demo opened in Excel (desktop), Numbers, LibreOffice and Google Sheets - no repair prompt, a date, a boolean, a leading-zero text and an umlaut intact. The maintainer does it after looking at the demo by hand and before publishing.
- Full check before the release: lint, types, unit, build, visual; parallel suites waited for; ports 4173-4177 free; the machine kept awake.

## Acceptance

- [ ] Documents and capability record updated; generated documents pass their guards.
- [ ] Changelogs and versions as above.
- [ ] The manual check is listed in the release notes of the ticket and ticked by the maintainer.
- [ ] Full check passes.
- [ ] Spec status `done` with a delivery report under `## Comments`; ticket statuses `done`.
