# 04 - The offer, the count, and the bulk action's second shape

Status: ready-for-agent
Type: task
Size: M

Blocked by: 03
Spec: `.scratch/table-server-mode-2/spec.md`, "Selecting all that match (T2)"

## What to build

The line between toolbar and header, role `status`: with the page ticked and
`rowCount` beyond it, "All 50 on this page are selected. Select all 12,400 that
match"; with the state on, "All 12,400 that match are selected." and "Clear
selection". The header checkbox is checked without exceptions, indeterminate
with some, and clears the state when pressed. The toolbar counts `rowCount -
except.size` through `selectedCount` and shows the bulk actions for any count
above 0. A bulk `Action` in server mode has
`onSelect: (selected: readonly Z[] | AllMatching) => void` with `AllMatching =
{ request: TableRequest; except: readonly string[] }`; `useTable`'s return
type carries the mode so an automatic table's `onSelect` stays `readonly Z[]`.
New required wording keys for the offer's two sentences and its active form.

## Acceptance

- [ ] The line appears only in server mode with a selection column, a ticked
      page and `rowCount` beyond it; not when the page is the whole set.
- [ ] Unticking a row after the offer was taken: count falls by one; the action
      receives `{ request, except: [key] }` with the current request.
- [ ] With the state off, an action receives rows as before.
- [ ] Type tests: `Array.isArray` narrows the argument; an automatic table's
      action does not see `AllMatching`.
- [ ] The line is read by a screen reader (status), the button is in the tab order.
- [ ] Wording in English and German; visual photographs of the line in both states.
