# 01 — Type sketches of the reference tables

Status: done
Type: prototype

Spec: `.scratch/umriss-table/spec.md`

## Scope

A declaration-only type skeleton of the API — `useTabelle`, the building blocks it returns, the free imports, `spalte` presets — with no runtime, and the calling code of four reference tables written against it:

1. **Order list.** Search, list filter, two-level sort, selection, a row action and a bulk action, paging, view link.
2. **Measurement log.** Numeric values, `format`, `footer`, `VerdictColumn`, an absent-value column, virtualisation.
3. **Shift report.** Written only far enough to show that nothing in the column API would block grouping later (grouping itself is out of scope).
4. **`AlarmList`**, re-expressed against its current props and `meldeModell`.

Every rule under **Binding the row type** and **A column** gets at least one call that must compile and one marked `@ts-expect-error` that must not.

## Acceptance

- `tsc --noEmit` passes, with every expected error present.
- Findings appended under `## Comments`: calls that read awkwardly, any rule that did not type, error messages that would confuse a caller, and a line count per reference table.
- If a rule of the spec fails to type, the spec is amended before ticket 06.

## Notes

Throwaway. Lives in `.scratch/umriss-table/prototype/`, not under `packages/`. The overload split for computed values with a `footer` is already known (spec, Further Notes) and should be used, not rediscovered.

## Comments

**Delivered** in `.scratch/umriss-table/prototype/typen/` (`api.ts`, four reference tables, `regeln.tsx`). `tsc -p .scratch/umriss-table/prototype/tsconfig.typen.json` passes with every `@ts-expect-error` in `regeln.tsx` present (27 of them, one per rule direction, R1–R14). `meldungen/` holds the same rule file with the directives stripped, to read the messages a caller gets.

### Rules that did not type as the spec wrote them

1. **The overload split in Further Notes is not enough.** An overload for a computed number with an *optional* `footer` survives TypeScript's first pass for every computed column, contextually types `children`'s parameter (as `number`) while it is tried, and that parameter type sticks: the following overloads then fail on a string or array column with children. What works: overloads that differ by **required** properties — computed number with `footer` (required), computed number with `format` (required), computed date with `format` (required), computed anything with `children` (required), computed displayable without `children` — so an unfitting overload is rejected before any context-sensitive expression is typed. Verified in `versuch/pflicht.tsx`; a single signature over "field name or function" (`versuch/ueberladung.tsx`) reproduces the spec's `unknown` problem for `footer` *and* `format`, with or without `NoInfer`.
2. **The general computed overload has to be split too.** `KinderFuer<W>` (children required unless displayable) on a computed value fixes `W` to `unknown` when no `children` is given, so `value={(a) => a.name}` without children demanded children. Split into "children required, any W" and "no children, `W extends Darstellbar`".
3. **A generic wrapper does not type.** `function Menge<Z extends { menge: number }>({ of }: { of: Tabelle<Z> })` cannot write `<of.Column value="menge" footer="sum" />`: inside the generic body `Feld<Z>` and the conditional types stay deferred. A wrapper with a concrete row type (`of: Tabelle<Auftrag>`) types, and passing it the wrong table is an error. A column meant for many row types is a preset.
4. **A preset over more than one property needs its field named**: `spalte<{ menge: number; nummer: string }, "menge">(…)`. TypeScript has no partial type-argument inference, so with only `P` given `K` defaults to the union of `P`'s fields. The one-property preset from the spec (`spalte<{ menge: number }>({ value: "menge", … })`) works as written.
5. **A column from another hook placed in this table is not a type error.** JSX does not check children against their parent; `<t1.Table><t2.Column value="messwert" /></t1.Table>` compiles. The hook binding still means a column is typed against the rows it will read — they are just not the rows of the table it sits in. The runtime catches it instead (a development warning when a column's table is not the table it is rendered in). The type test for "a column for the wrong row type" is therefore realised as a renderer annotated with another row type and a wrapper handed another table — both errors.

### Error messages

- Overload order matters for the message, because TypeScript prints the *last* overload's complaint. With the field overload last, the commonest mistake reads well: `Type '"numer"' is not assignable to type 'keyof Auftrag'. Did you mean '"nummer"'?`
- The price is paid by computed columns: `footer="sum"` on a computed text reads `Type '(a: Auftrag) => string' is not assignable to type 'keyof Auftrag'`, pointing at `value` rather than `footer`.
- `format`/`footer` on a field of the wrong type: `Type '"sum"' is not assignable to type 'undefined'` (the property is `never`). Understandable next to the attribute it underlines, not self-explanatory.
- A computed column without `id`: `Property 'id' is missing` plus `Parameter 'a' implicitly has an 'any' type`, as the spec predicted.
- Bulk and row actions, verdict columns on non-numbers, wrappers handed the wrong table: clear.

### Awkward calls

- `AlarmList` needs `sortable={false}` on every column (its rows arrive ordered by `meldeModell`), a way to style rows by state (`rowProps`, not in the spec), and `empty`. Recorded for ticket 13.
- Computed values that may be absent read naturally: `value={(m) => (m.messwert === null ? null : m.messwert - m.sollwert)}` with `footer="avg"` types, and `children` receives `number`.
- Grouping (shift report) needs nothing from `Column`: a group key is a value, and aggregates already sit on the column as `footer`. A later `<Group by="schicht" />` is another hook-bound building block beside `RowDetail`.

### Lines per reference table (whole file, including row type and imports)

| Table | Lines |
|---|---|
| Order list | 58 |
| Measurement log | 53 |
| Shift report (partial) | 46 |
| `AlarmList` table part | 55 (today's `AlarmList.tsx`: 298, of which the table part is about 140) |
