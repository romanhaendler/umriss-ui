# 03 — One interface for column filters, typed conditions

Status: done
Type: task

Blocked by: 02

Spec: `.scratch/table-filters/spec.md` (Column filters; Conditions and state; defect D6)

## Scope

- `spaltenFilter<W, B>({ passt, Eingabe, beschreibe })` as a free export; `filter` on a column accepts it where `W` matches the column's value type.
- Re-express the list filter through it. Its condition becomes the chosen values of the value type (absent as `null`), not `"wert:…"` keys.
- Replace `filterWerte`/`setFilterWerte` on `TabellenStand` with `t.filter` and `t.setFilter(id, bedingung | null)`, typed by the row's field; computed ids as `string`/`unknown`; a mismatched kind warns once in development and is ignored.
- `TabellenAnsicht.bedingungen`: set by `initialeAnsicht` in the first render, read back from `t.ansicht`.
- A condition changes → page one. A column unmounts → its condition is removed (D6); a hidden column keeps it.
- Demo: `Column › eigener-filter`. Until 04 lands, conditions still show in the existing strip, which must work with `beschreibe`.

## Acceptance

- D6 regression test; component tests for `setFilter`, `initialeAnsicht.bedingungen`, `t.ansicht.bedingungen`, custom filter matching and absent values.
- Type tests: custom filter on the wrong value type, `setFilter` with the wrong value type, range condition on a text field — each an error.
