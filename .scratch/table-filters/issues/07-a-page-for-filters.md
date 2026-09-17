# 07 — A page for filters

Status: done
Type: task

Blocked by: 06

Spec: `.scratch/table-filters/spec.md` (Demo) · reverses part of
`.scratch/table-demo/spec.md`, decision B

## Scope

- New page `Filter` in the rubric „Tabelle", with the types `SpaltenFilter`
  and `FilterEingabeProps` and the export `spaltenFilter`.
- `Column › listenfilter`, `Column › bereichsfilter` and `Column ›
  eigener-filter` move there; no example stands twice. The pre-filter stays with
  `Table`: it is an option of the hook, not a column filter.
- Two new examples: the smallest possible custom filter (only `passt`, a box
  input, `beschreibe`) and conditions from outside (`t.setFilter`,
  `t.filter`, `t.ansicht.bedingungen`).
- The page's „Warum so": the three kinds through the same door, pre-filter
  versus column filter, why the conditions stand in the table bar — from
  `warum/column.tsx` to here; a reference stays there.
- Glossary: **Page** permits a page for a term that several building blocks
  share. The reversal stands in `.scratch/table-demo/spec.md`.
- `tests-visual/seiten.ts`: the page into the sample of the accessibility check.
  `TESTS.md`. Baselines of the new page and its examples.

## Acceptance

- The demo shows `Filter` in the sidebar; every example renders (smoke test),
  the Playwright suites and the accessibility check are green.
- No filter example stands on `Column` any more; `Column` refers to the page.
