# 05 — Copy the pure core

Status: done

Blocked by: 03, 04

Spec: `.scratch/umriss-table/spec.md`

## Scope

Copy into `@umriss/table`, with their unit tests: `tabellenModell`, `csv`, `ansicht`, `useTableSelection`, and the logic of the virtual body. Not exported publicly yet.

**Copy, not move.** `@umriss/ui` keeps its table until ticket 14, because its behaviour tests run against its demo. Until then the modules exist twice, knowingly; a `// Kopie bis umriss-table 14` header in each copy says so.

## Acceptance

- The copied tests pass unchanged in the new package.
- No module in `@umriss/table` imports anything from `@umriss/ui` except through its public entry.

## Comments

Copied into `packages/table/src/kern/`, each with the header `// Kopie bis umriss-table 14`:

- `tabellenModell.ts` — `STANDARD_FORMATE` now from `@umriss/ui`; `SortDirection`, which lived in `Table.tsx`, is declared in the copy.
- `csv.ts`, `ansicht.ts`, `useTableSelection.ts` — unchanged apart from the header.
- `begleiter.ts` — the old stateful companion `useTabelle`, with `useVirtuell` from `@umriss/ui`. Not on the ticket's list, copied because the new hook keeps its state rules (page resets, the three-state additive sort, the view that omits defaults) rather than rewriting them. Its export keeps the name `useTabelle`; the new hook imports it as the companion.

Tests copied with only their import paths changed: `tabellenModell`, `csv`, `ansicht`, `useTableSelection`, `mehrfachSortierung`, `spaltenSicht`, `tabelleAnsicht`, `zeilenUndBreiten` — 8 files, 126 tests, green in `packages/table`.

Not copied, deliberately:

- `virtuell.test.ts` tests `lib/virtuell`, which does not move — it became a public export of `@umriss/ui` in ticket 04 and keeps its test there.
- The virtual body (`TableVirtualBody.tsx`) is a component, not a pure module, and had no unit test. Its keyboard and tab-stop logic is carried into the new table body in ticket 10.

No module in `packages/table` imports `@umriss/ui` other than through `@umriss/ui` itself (lint, ticket 03).
