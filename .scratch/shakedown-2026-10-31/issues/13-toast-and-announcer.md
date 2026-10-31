# 13: Toast and the announcer

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 6. Sources: earlier-runs-open qa 4c (counter name), qa 8 (close names), core D
(toast over Drawer), core B10 (announcer state), P11-4 (Alt+T); H4 (focus after action).

- [ ] The counter "1 / 3" has a name that contains its visible text.
- [ ] Each toast's close button names its toast ("Close: Saved").
- [ ] The Alt+T shortcut is shown visibly (in the deck or on focus of the first toast), in both languages.
- [ ] A bottom toast does not cover an open Drawer's footer buttons.
- [ ] After a toast action closes the toast, focus goes to a sensible place (the region or the previous focus), not `<body>`.
- [ ] The announcer can be reset between consumer tests (an exported reset, named in README "Testing"); no text carries into the next test.
- [ ] `pnpm check core`.

## Comments
