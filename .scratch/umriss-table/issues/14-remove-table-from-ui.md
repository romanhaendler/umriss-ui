# 14 — Remove the table from `@umriss/ui`

Status: done

Blocked by: 13, and the delivery of `.scratch/table-demo/spec.md` (the demo of `@umriss/table`)

Spec: `.scratch/umriss-table/spec.md` · ADR-0016

## Scope

- Delete `components/Table/`, `components/AlarmList/`, `lib/useTableSelection.ts` and their unit tests; remove the exports.
- Demo: the `Table` and `AlarmList` pages, their examples and "Warum so" texts; examples on other pages that use the table (`Spinner`, `Sparkline`); the outline; the props and README generators.
- Wording, according to ticket 04's decision.
- `TESTS.md`; the `@umriss/ui` changelog under `Entfernt`, pointing at `@umriss/table`; a minor version bump.
- `HANDOFF.md` B.10: note that inline editing now targets `@umriss/table`.
- The copies from ticket 05 lose their `Kopie` header.

## Acceptance

- Workspace green.
- `funktionen-tabelle`, `funktionen-virtuell` and the table and alarm list baselines are removed only because equivalents run against the `@umriss/table` demo.
- Baselines of unaffected pages do not move; any that do are reviewed, not regenerated.

## Notes

`needs-triage` until the demo spec is delivered: before that this ticket would delete working behaviour tests. The equivalents it must wait for are listed assertion by assertion under Testing Decisions in `.scratch/table-demo/spec.md`.

## Comments

**Triaged and implemented** on request, 11 Sep 2026: the demo spec it waited for is delivered (`.scratch/table-demo/spec.md`).

**No behaviour test left without an equivalent.** Beyond the two suites and the baselines the ticket names, the removal met four more places where @umriss/ui still tested the old table. Each got its counterpart in `@umriss/table` first:

- `funktionen-basis.spec.ts` sorted, searched with the sum row, selected all across pages, paged and bulk-deleted against the old demonstration → five tests against Table › Vorführung in `packages/table/tests-visual/funktionen-tabelle.spec.ts`.
- `anbieter.test.tsx` read the provider's density through `Table` and `AlarmList` → the table's cases already stood in `breiten.test.tsx`; the alarm list's (compact by default, regular under `comfortable`, own `density` wins) moved to `alarmList.test.tsx`. @umriss/ui keeps what it promises itself, now through `useDichteFuer` with a probe component.
- `sprache.test.tsx` checked the filter strip's count, a formatter and a sentence override, and the list filter's buttons → `packages/table/tests-unit/filterleisteWortlaut.test.tsx`.
- `propsStandard.test.ts` held the comment/default contract at `TablePaginationProps.pageSizeOptions` → now at `SparklineProps.width`.

- `anbieter.test.tsx` also held that a table without a provider is not compact → `breiten.test.tsx`, "Dichte ohne Anbieter".

**Mapped, and where nothing was carried over.** `filterLeiste.test.tsx` (13 tests) had no copy from ticket 05. Its claims about the strip stand in `@umriss/table`: the list named "Aktive Filter", the remove button named after the condition, removing one condition keeps the others, "Alles zurücksetzen", no strip without a condition (`leiste.test.tsx`, `funktionen-tabelle.spec.ts`), and the count in German notation (`filterleisteWortlaut.test.tsx`). Three tests checked props of `TableFilterStrip` that have no counterpart, because the strip is no longer the application's to place: an optional counter, a caller's label, a reset button shown only with a handler. They went with the component. The old basis suite's delete test also saw a toast — that was the old demonstration's own reaction, not a table guarantee; `Toast` keeps its test in `funktionen-basis.spec.ts`.

**Wording**, by ticket 04's decision: the table's entries stay in @umriss/ui. Removed are the three only the old table read — `zeileAufklappen`, `zeileZuklappen`, `filterEntfernen`; the new table names the same controls after the row. Ticket 04 decided where the entries live, not whether dead ones stay, so this is a decision of its own: kept, an override of them would silently do nothing; removed, it is a compile error. Listed as breaking under „Geändert" and „Entfernt" in `@umriss/ui`'s changelog. Overturning it is restoring three lines.

**Baselines reviewed, not regenerated.** Four @umriss/ui baselines moved, each looked at in both themes before it was updated: the overview (four rubrics, 39 pages, 67 examples, the Betrieb sentence), the Spinner page header (its sentence), the Sparkline example (without a table, two columns), the command palette window (the overview behind the glass and the version 0.9.0 in the header). No other baseline moved; the run after the update passed with none failing.

**Demo of @umriss/ui**: the `Tabelle` rubric and the `AlarmList` page are gone with their examples and essays; `Sparkline`'s example no longer uses a table; `Spinner`'s sentence no longer names it; the Betrieb rubric's sentence no longer promises an alarm list. `demo.css` held only the demonstrations' classes and is deleted.
