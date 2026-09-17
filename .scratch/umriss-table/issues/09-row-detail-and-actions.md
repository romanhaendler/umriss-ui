# 09 — Row detail and actions

Status: done

Blocked by: 06

Spec: `.scratch/umriss-table/spec.md`

## Scope

- `RowDetail`: the table places the expander, the detail row spans the visible columns, several rows may be open, expanded rows survive a filter change (as today).
- `RowActions` and `Action`: `onSelect(zeile)`; with `bulk`, `onSelect(zeilen)` always with a list, and the action appears in the toolbar while a selection exists.
- Accessible names of expander and actions from the `rowHeader` column.
- The quiet gesture: dim at rest, full on row hover or focus within.
- Settle the open item on how many actions show before the overflow menu.

## Acceptance

- Type test: a bulk action's callback receives an array; a row action's does not.
- Component tests: a bulk action triggered on a row receives a list of one; triggered from the toolbar, the selection across pages; names include the row header's value.

## Comments

**Delivered** in `bausteine.tsx` (`RowDetail`, `RowActions`, `Action`, the expander and actions cells) and `frei.tsx` (bulk actions in `Toolbar`). Tests: `zeilen.test.tsx`; the array-versus-row callback types in `typen.test-d.tsx`.

- **Open item settled — at most two actions stand in the row; from three on, all of them go into one menu** ("Aktionen: A-1"). A mix of buttons and a menu would give the column a width that depends on the count, and an action would move between row and menu when a third is added.
- `Action`'s `children` is a string, because the accessible name is composed with the row header's value: "Öffnen: A-1".
- A bulk action receives a list everywhere: a list of one on the row, the selection from the toolbar. From the toolbar that is **the selection within the filtered set, across pages** — the rule `AlarmList` already follows: a button must not act on more than the user can see it counting. Selections outside the filter stay selected.
- The table places the expander, named after the row ("A-1 aufklappen"); the detail row spans every rendered column; several may be open, and they stay open across a filter change (the old companion's rule).
- The quiet gesture (secondary text at rest, accent on row hover or focus within) is carried over in `Table.module.css`; jsdom cannot observe it.
