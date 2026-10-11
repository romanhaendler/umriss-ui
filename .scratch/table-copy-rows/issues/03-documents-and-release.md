# 03 - Documents and release

Status: done
Type: task
Size: S

Blocked by: 01, 02
Spec: `.scratch/table-copy-rows/spec.md`

## What to build

- The non-goals pages and `.scratch/non-goals-and-honest-docs` wording that call the row clipboard "later" now say it exists, for rows and the active cell, and that ranges stay out (ADR-0032 is not rewritten; ADR-0034's line on the clipboard is about ranges and stands).
- An example on the Export page or beside the selection: Ctrl+C, and a "Copy" button using `selectionAsText()` with `navigator.clipboard`; the capability record has the row for the key, the announcement and the function, with where each is proved.
- Changelogs: table under **Added**: "Ctrl/Cmd+C copies the selected rows, or in grid mode the active cell; `selectionAsText()`"; core under **Added**: the three words. Releases as the rule says (a new word in core takes table, schedule and calculation along).
- Manual check listed for the maintainer: paste into Excel, Numbers and LibreOffice (columns, decimal mark in each language); VoiceOver and NVDA speak the count.
- Full check before the release: lint, types, unit, build, visual; parallel suites waited for; ports 4173-4177 free; the machine kept awake.

## Acceptance

- [ ] Documents and capability record updated; generated documents pass their guards.
- [ ] Changelogs and versions as above.
- [ ] Full check passes.
- [ ] Spec status `done` with a delivery report under `## Comments`; ticket statuses `done`.

## Comments

Done: example `Export/03-copy-the-selection.tsx`, Export page text, README line, table and core changelog entries under Added. Left: the release (no version raised), the full check with build and visual, the manual paste check (Excel, Numbers, LibreOffice; VoiceOver and NVDA), and the non-goals wording - no page in `packages/table` calls the row clipboard "later"; only ADR-0032 does, which is not rewritten.

**Released (2026-10-11)** after the maintainer's look by hand, with core 0.33.0, charts 0.16.0, table 0.16.0, schedule 0.7.1 and calculation 0.7.3.
