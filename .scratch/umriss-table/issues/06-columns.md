# 06 — Columns: binding, registration, value and presentation

Status: done

Blocked by: 02, 05

Spec: `.scratch/umriss-table/spec.md` · ADR-0017

## Scope

The spec's sections **Binding the row type**, **A column** (without the defaults table, which is 07) and **The table** (registration, hiding, order, `selectable`):

- `useTabelle` returns `Table` and `Column` with stable identity, using the mechanism ticket 02 recommended.
- `value` as field name or as function with required `id`; `label`; `children(wert, zeile)` not called for absent values; `rowHeader`; `selectable`.
- Registration order equals JSX order; hiding keeps a column mounted; the user's order applied to header, body and footer.
- `spalte` presets; wrappers receiving `of`.
- Settle the open item on a column that leaves the JSX and returns.

## Acceptance

- The type-test file from **Testing Decisions** exists, with every expected error, and runs in `typecheck`.
- Component tests: JSX order; hiding and reordering move all three kinds of cells; a wrapped column registers; `children` never receives an absent value; `rowHeader` produces row header cells and names the row's checkbox.
- The regression this package exists for: reordering moves the rendered columns.

## Comments

**Delivered** in `packages/table/src/`: `useTabelle.tsx` (the hook), `register.ts` (registration), `bausteine.tsx` (`Table`, `Column`, `RowDetail`, `RowActions`, `Action`, the body), `typen.ts`, `spalte.ts`, `kontext.ts`. Tests: `tests-unit/spalten.test.tsx` (13 cases) and `tests-unit/typen.test-d.tsx` (compiled by `typecheck`, 26 expected errors — an error that stops occurring fails the typecheck).

- **Registration** is ticket 02's recommendation: columns write their description into the hook's register during render, idempotently and keyed by `useId`; the body renders after the children and reads the columns of its own pass; only structural changes are announced, from layout effects; DOM markers correct the order after commit. The hook keeps the state of the old companion (`kern/begleiter.ts`, copied in 05) and feeds it the registered columns.
- **Open item settled — a column that leaves the JSX and returns keeps its width and its place in the user's order.** Both are state keyed by `id`, so nothing had to be built; a test holds it.
- The regression the package exists for — reordering moves the rendered columns — is the first test of `Umordnen und Verstecken`, over header, body and footer.
- `rowHeader` cannot be hidden (the column menu shows it disabled) and names the row's checkbox (`"A-2 auswählen"`), expander and actions.
- Development warnings (once each): two columns with one `id`; more than one `rowHeader`; a column from another `useTabelle` call placed in this table (the case ticket 01 found the compiler cannot report); a computed value without `id` from an untyped caller.
- Names. Component props are English (ADR-0015); the hook's options and return value are identifiers and stay German, as ADR-0015's scope says for hooks and their option objects. The spec's `rowKey`, `pageSize`, `defaultSort` and `filter` keep the old companion's names; its `initialeAnsicht` and `virtuell` stay too; `auswahl` is new (ticket 13). The table's accessible name is `ariaLabel`, because the named element is the `<table>`, not the component's root (ADR-0015).
- Added to the column API beyond the spec: `sortValue` and `exportValue`, the way a value that has no order or text of its own (an object) becomes sortable or exportable. `VerdictColumn` needs them and is built only from public API (ticket 12).

**After review** (`/code-review`, standards and spec axes): the internal descriptions in `register.ts` (`SpaltenAngabe`, `AktionsAngabe`, `KernStand`) used the props' English names past the destructuring pattern; they are German now (`fuss`, `zeilenkopf`, `breitbar`, `eigenerSortierwert`, `sammel`, `beiWahl`, `zeilenSchluessel`, …), as ADR-0015 asks. The register now distinguishes a new *value* function (the model's columns are rebuilt) from a new *presentation* function (`children`, detail, action callbacks — they are not), so an inline `children` no longer makes the model run twice per render; `register.test.ts` holds that. The public entry exports only the types a caller names.
