# 13: Toast and the announcer

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 6. Sources: earlier-runs-open qa 4c (counter name), qa 8 (close names), core D
(toast over Drawer), core B10 (announcer state), P11-4 (Alt+T); H4 (focus after action).

- [x] The counter "1 / 3" has a name that contains its visible text.
- [x] Each toast's close button names its toast ("Close: Saved").
- [x] The Alt+T shortcut is shown visibly (in the deck or on focus of the first toast), in both languages.
- [x] A bottom toast does not cover an open Drawer's footer buttons.
- [x] After a toast action closes the toast, focus goes to a sensible place (the region or the previous focus), not `<body>`.
- [x] The announcer can be reset between consumer tests (an exported reset, named in README "Testing"); no text carries into the next test.
- [x] `pnpm check core`.

## Comments

**Delivered (2026-10-31, run coordinator).** Counter named "1 / 3, show all messages"; close buttons
"Close message: <title>" (wording key stays a string, composed in Toast.tsx - a function type would break
wording overrides; the toast tests' lookup strings moved to the new name, no assertion changed); Alt+T hint
shown while the deck is open, on its own sunken pill (checked in both themes); a bottom deck lifts above a
dialog footer touching the window bottom (`data-umriss-footer` on ModalFooter); focus returns to where a Tab
came from after a toast closes; `resetAnnouncer()` exported and named in README "Testing".
