# 07 — Defaults by value type, `format`, `footer`

Status: done

Blocked by: 06

Spec: `.scratch/umriss-table/spec.md`

## Scope

- The defaults table: presentation, alignment, sort, export by value type; `numeric` override; runtime alignment from the first present value.
- A compile error when a value that cannot be shown as text has no `children`.
- `format` with the language seam's names, typed by value type.
- `footer` `"sum"` and `"avg"` for numbers, over the filtered set, skipping absent values, using the overload split recorded in the spec.
- Absent values: muted dash, the wording entry for "no value", last in either sort direction, empty in the export.

## Acceptance

- Type tests for `format` and `footer` on wrong types, and for the missing renderer.
- Component tests per row of the defaults table, rendered under a `UmrissProvider` with non-default formats to prove the seam is used.
- Export test: numbers stay numbers with a decimal comma; a `format="prozent"` column exports the underlying number.

## Comments

**Delivered**: `packages/table/src/werte.ts` — the defaults table as pure functions (absent, kind, text, sort value, export value, footer, alignment) — applied by the body in `bausteine.tsx`. Tests: `werte.test.ts` (the rules), `voreinstellungen.test.tsx` (each row of the defaults table in the cell, under a `UmrissProvider` whose formats and wording differ from German), `fehlendeWerte.test.ts` (the model).

- **The copy of `tabellenModell` is extended**, not left identical: a `wert` of `null`, `undefined` or `NaN` sorts last in *either* direction and matches no search. The model multiplies a comparison by the direction, so a comparator from outside cannot keep absent values last; the rule has to sit in the model. The copied tests are unchanged and green; the new rule has its own test file; the copy's header says it diverges.
- A computed value that cannot be shown as text without `children` is a compile error (type tests in `typen.test-d.tsx`), as are `format` and `footer` on the wrong type.
- Defaults decided where the spec was silent: search covers text columns unless `searchable` says otherwise; a column is sortable when its value is text, number, date or boolean, or has a `sortValue`.
- Footer: a visible `Σ` or `⌀` before the number and the word ("Summe", "Durchschnitt") for assistive technology; formatted with the column's `format`; a column without any present value shows an absent value, not zero.
- Export: numbers stay numbers with a decimal comma, dates are ISO timestamps, booleans `ja`/`nein` (data, not wording, so they are not in `Wortlaut`), absent values empty fields, values without text form and without `exportValue` are left out. A `format="prozent"` column exports the underlying number (test).

**After review:** text sorted with the built-in German collation, not the provider's `vergleicheText` — the old table's behaviour, but not what the defaults table says. Text columns now sort with the provider's comparison; the model decides absent values before a column's own comparison, so they still stay last. `voreinstellungen.test.tsx` sorts under a provider with a reversed comparison, and its one expectation that came from the implementation's own formatter is a literal now (TESTS.md, Konventionen).
