# 05: Popover - focus moves into a dialog panel, and the outside click works in a shadow root

Spec: `.scratch/shakedown-defects/spec.md` (Core: dialog-role focus, shadow root)
Findings: `audit-family.md` 1, `accessibility.md` P10 2 and P11 1, `core.md` B3 (the click only)

**What to build:** opening a Popover with `role="dialog"` puts focus inside
it - on the first focusable element, or the panel itself when it has none -
unless its content already placed focus inside. The table's ColumnMenu, its
column filters and the dashboard's widget options are one key from their
first control; Escape returns focus to the trigger as before. Inside a shadow
root, a click inside an open Popover keeps it open, because the outside click
tests the first element of the event's composed path.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first (core's popover test): a dialog-role Popover opened by keyboard has focus inside; a Popover rendered in a shadow root stays open on a click inside and closes on a click outside
- [ ] Listbox, menu and tooltip Popovers unchanged; the date pickers keep focusing their day; MultiSelect keeps its own focus
- [ ] Table: opening the ColumnMenu and a column filter by keyboard puts focus inside (found by role)
- [ ] Dashboard: opening a widget's options puts focus inside
- [ ] `pnpm check core`, `table` and `dashboard` green
- [ ] The findings struck from their shakedown files (the rest of B3 stays open)
