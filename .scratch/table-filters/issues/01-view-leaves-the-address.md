# 01 — The view leaves the address

Status: done
Type: task

Blocked by: —

Spec: `.scratch/table-filters/spec.md` (The view leaves the address)

## Scope

- Remove `alsSuchparameter`, `ausSuchparametern`, `AusSuchparameternOptionen` from `@umriss/table`'s public entry and the encoding from `kern/ansicht.ts`; remove `t.suchparameter` and the string form of `initialeAnsicht`. `TabellenAnsicht`, `initialeAnsicht` as an object and `t.ansicht` stay; unknown column names still drop.
- Demo: remove `Table › ansichtslink`, add `Table › startzustand` (object `initialeAnsicht`, `t.ansicht` shown under `[data-rolle='ansicht']`); `Table › leer-und-laden` to `{ suche: "Zinnwerk" }`; drop the link display from the Vorführung; rewrite the view paragraph of "Warum so" (`demo/warum/table.tsx`).
- Tests: reduce `ansicht.test.ts`, `ansichtLink.test.tsx`, `tabelleAnsicht.test.ts` to the object view; move the Playwright width test to `startzustand`; remove the `ansichtslink` baselines, add `startzustand` ones.
- `CHANGELOG.md` of `@umriss/table`: `Entfernt`; `TESTS.md` row for `kern/ansicht.ts`.

## Acceptance

- `grep -rn "suchparameter\|Suchparameter" packages/table` finds nothing outside the changelog.
- `typecheck`, unit tests and the table's Playwright suites pass; `initialeAnsicht` with an object still sets search, sort, page size, hidden columns, order and widths in the first render.
