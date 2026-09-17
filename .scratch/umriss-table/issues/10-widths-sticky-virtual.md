# 10 — Widths, sticky parts, density, virtualisation

Status: done

Blocked by: 06

Spec: `.scratch/umriss-table/spec.md`

## Scope

- Resizable columns: drag handle, double-click to fit, `Alt` with arrow keys; a default width on the column.
- `stickyHeader`; the sticky first column is the `rowHeader` column.
- Density from the provider, overridable on the table.
- Virtualisation as a hook option; `aria-rowcount` with the full count; paging off while virtual.

## Acceptance

- The behaviour of today's `Th` resizing, carried over: a drag does not sort; a second pointer neither moves nor ends a drag.
- Component tests for window slicing and `aria-rowcount`; the behavioural proof in a browser waits for the demo (spec, Testing Decisions).

## Comments

**Delivered** in `bausteine.tsx` (`Kopfzelle`, `VirtuellerKoerper`) and `Table.module.css`. Tests: `breiten.test.tsx`.

- Resizing is `Th`'s, carried over: drag handle, double-click to fit the widest cell, `Alt`+arrow keys (`Shift` for larger steps), a default `width` on the column. Tested: a drag does not sort; a second pointer neither moves nor ends a drag; keyboard steps; fitting.
- `stickyHeader` as before. **`stickyRowHeader`** makes the row header the sticky first column: it is rendered first among the data columns, whatever the user's order, and sticks behind the selection and expander cells (fixed at 34 px each, so the offset is arithmetic rather than measured).
- Density comes from `useDichteFuer` — the provider's explicit density, overridable with `density`.
- Virtualisation is the hook option `virtuell: { zeilenHoehe, puffer }` (the companion's window arithmetic from `@umriss/ui`); the body renders filler rows, sets `aria-rowcount` to the full count plus the header, and keeps `TableVirtualBody`'s roving tab stop and arrow-key navigation over rows not yet rendered. `Pagination` renders nothing while virtual.
- The behavioural proof in a browser — sticking, scrolling, focus across unrendered rows — waits for the demo of `@umriss/table` (spec, Testing Decisions).

**After review:** putting the sticky row header first happened on screen only, while the column menu and the export kept the user's order — screen, menu and export disagreeing is the defect this package exists to remove. The register now decides it in one place (`mitKlebendemKopf`) for all three; in the menu the pinned column cannot be moved and nothing can be moved before it. Test in `breiten.test.tsx`.
