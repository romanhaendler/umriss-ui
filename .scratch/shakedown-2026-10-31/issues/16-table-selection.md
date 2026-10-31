# 16: Table selection - what is selected is what the app hears

Status:     ready-for-agent
Blocked by: None (can start immediately)

Sources: README 3, 17; P22 (server clears on search); earlier-runs-open table.md 4, composed-app 7.
Reds: P28 `shakedown.test.ts` "selection", `shakedownSelection.test.tsx`; H7 `f09`; P2 `a-selection`.
All reds named here are in `../reds/` (`../reds/README.md`).

- [ ] Keys of rows that left `rows` are pruned when `rows` changes, and `onSelectionChange` reports it; a returning id is not selected again.
- [ ] `selection.count` and `onSelectionChange` say the same as the toolbar. Decide in the ticket, in the README's words, how keys hidden by search/filter are reported (e.g. the callback gets the visible selection and the full set apart), and make toolbar, count, callback and bulk actions agree; a bulk action never acts on rows the user cannot see without saying so.
- [ ] Server and client mode treat a search the same way with respect to the selection.
- [ ] Ctrl/Cmd+C copies the selected rows after a click on a cell (focus on `<body>` inside the table today; handler on the frame, `frame.tsx:246`).
- [ ] In grid mode Ctrl+A selects all and Shift+Space selects the row.
- [ ] README:292's "the count follows the rows there are" is true.
- [ ] `pnpm check table`, `pnpm check alarms`.

## Comments
