# 13 — `AlarmList` in the new API

Status: done

Blocked by: 09, 11, 12

Spec: `.scratch/umriss-table/spec.md`

## Scope

Re-express `AlarmList` inside `@umriss/table` using only the package's public API, with `meldeModell` and its tests. It is the one existing component with real requirements — lifecycle state, flood marking, freshness, selection — and therefore the honest test of whether the API carries a real table. Props stay as they are unless ADR-0015 requires a rename.

## Acceptance

- `meldeModell` and `alarmList` tests pass against the re-expression.
- Recorded under `## Comments`: line count before and after, and every place where the public API was not enough. Each such place is either fixed in the API or justified.

## Comments

**Delivered**: `packages/table/src/meldeliste/` — `AlarmList.tsx` re-expressed with `useTabelle`, `meldeModell.ts` copied (header `Kopie bis umriss-table 14`, imports from `@umriss/ui` and the table's model), the stylesheet. Exported from `@umriss/table`. `meldeModell.test.ts` (import paths only) and `alarmList.test.tsx` (import paths and the renamed props, nothing else) pass; `oeffentlich.test.ts` reads `AlarmList.tsx` and holds that it imports only `react`, `@umriss/ui`, the package's public entry (`../index`) and its own model and stylesheet.

**Lines.** `AlarmList.tsx` before: 298. After: 227. The table part fell from about 140 lines (`Th`, `Td`, the checkbox column, the empty row, the row component) to 45 — six `Column`s and one `Table`; the leiste, live region and freshness wrapper are unchanged.

**Props renamed**, because ADR-0015 requires it: `sicht`→`view`, `auswahl`→`selection`, `onQuittieren`→`onAcknowledge`, `stand`→`asOf`, `schwellen`→`freshness` — the names `.scratch/library-audit/issues/09-the-renames.md` fixed. No deprecated aliases: the package is new and has no callers. `@umriss/ui`'s `AlarmList` keeps its German props until ticket 14 removes it.

**Where the public API was not enough — and what happened:**

1. **A selection the application holds.** `AlarmList` receives `selection` from its caller and the quittieren button acts on it. → **Fixed in the API:** the hook option `auswahl` hands in an outside `TableSelection`.
2. **Styling a row by its state** (the edge of an unacknowledged alarm). → In the API since ticket 01's sketch found it: `rowProps` on `Table`, limited to `className` and `data-*`.
3. **Rows that arrive ordered.** `meldeModell` orders worst-first; the table must not re-sort. → **Justified, not changed:** `sortable={false}` on each of the six columns. A table-wide switch would be shorter here and nowhere else.
4. **A table without paging.** The list shows every row of the view it is given, and nothing in the table said "don't page" — it would have stopped at the tenth row. → **Fixed in the API, and in the rule:** a table pages only when a `Pagination` is placed (tickets 08, spec amended). This was a trap for every table, not only this one.
5. **Empty is not empty** (quiet line vs. dead connection). → `empty` on `Table` carries either text.
6. **The provider's density with a compact default.** → `useDichteFuer`, public since ticket 04.

**Accessible names changed** as a consequence of the table's rules: the header checkbox is "Alle auswählen" (was "Alle"), a row's checkbox is "<Meldung> auswählen" (was the Meldung's label alone). The row header is the Meldung column.
