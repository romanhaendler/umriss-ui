# 06 — Demonstration, "Warum so", changelogs

Status: done
Type: task

Blocked by: 04, 05

Spec: `.scratch/table-filters/spec.md` (Demo; Testing Decisions)

## Scope

- Vorführung: `filter="range"` on "Menge", a tile that calls `t.setFilter("status", …)`; baselines renewed after looking at each.
- "Warum so": filters on `demo/warum/column.tsx` (kinds, pre-filter vs. column filter, why conditions sit in the toolbar), the pre-filter on `table.tsx`.
- Changelogs of `@umriss/table` (Hinzugefügt / Geändert / Entfernt / Behoben, with D1–D6) and `@umriss/ui` (wording); `TESTS.md` rows 27, 28, 38.
- Mark the spec `done` with its `Delivered:` commits; each ticket names its commits.

## Acceptance

- Demo smoke test and all table suites pass; no example still mentions a filter strip or a view link.
