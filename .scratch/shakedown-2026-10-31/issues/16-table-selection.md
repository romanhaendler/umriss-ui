# 16: Table selection - what is selected is what the app hears

Status:     done
Blocked by: None (can start immediately)

Sources: README 3, 17; P22 (server clears on search); earlier-runs-open table.md 4, composed-app 7.
Reds: P28 `shakedown.test.ts` "selection", `shakedownSelection.test.tsx`; H7 `f09`; P2 `a-selection`.
All reds named here are in `../reds/` (`../reds/README.md`).

- [x] Keys of rows that left `rows` are pruned when `rows` changes, and `onSelectionChange` reports it; a returning id is not selected again.
- [x] `selection.count` and `onSelectionChange` say the same as the toolbar. Decide in the ticket, in the README's words, how keys hidden by search/filter are reported (e.g. the callback gets the visible selection and the full set apart), and make toolbar, count, callback and bulk actions agree; a bulk action never acts on rows the user cannot see without saying so.
- [x] Server and client mode treat a search the same way with respect to the selection.
- [x] Ctrl/Cmd+C copies the selected rows after a click on a cell (focus on `<body>` inside the table today; handler on the frame, `frame.tsx:246`).
- [x] In grid mode Ctrl+A selects all and Shift+Space selects the row.
- [x] README:292's "the count follows the rows there are" is true.
- [x] `pnpm check table`, `pnpm check alarms`.

## Comments

**Delivered (2026-10-31, run coordinator).** Client mode prunes keys of rows that left `rows` and reports
it, a returning id stays unticked; `selection.count`, toolbar, bulk actions and `onSelectionChange(keys,
all)` speak of the visible selection (`keys`), `all` carries every held key (hidden ones come back with
the search); Ctrl/Cmd+A in grid mode; the scroll frame is focusable (`tabIndex=-1`, no outline on click -
looked at) so Ctrl+C works after a cell click. Decided: server mode keeps clearing on a new search - a
server selection can be "all N that match", which belongs to its query; the README says so beside the
client rule. The old `rowsThatKeepArriving` case moved to the new rule (the ticket reverses it); the P28
hook-level reds stay unmet by design - the hook cannot tell a filter from a deletion, `useTable` can.
Shift+Space already selected the row.
