# 25: Dashboard

Status:     done
Blocked by: None (can start immediately)

Sources: earlier-runs-open 10-28 p4-jonas 5, composed-app 9, 12, audit-family 7, dashboard.md 4, 9, P10-1,
design-family 2, settle 15.

- [x] Two widgets of one type have different names (menu "Actions for <title>", figure landmarks): the instance's title, or the type's label with its place.
- [x] Focus stays put through Edit, Done, Cancel and Reset (the pressed button's successor takes it); entering edit mode is announced; Escape leaves edit mode (Cancel).
- [x] The size choice is a `menuitemradio` with `aria-checked`, no "✓ " in its name.
- [x] ArrowUp/Down on a widget head move it one row, not one place; the head says that arrows move it.
- [x] `onDraftChange(false)` fires when a dashboard with an open draft unmounts.
- [x] The edit bar stands within the board's maximum width, not at the screen's far right.
- [x] `WidgetType`'s `defaultOptions` is optional for a widget without options.
- [x] A widget title cut by text spacing (WCAG 1.4.12) shows in full on hover/focus.
- [x] A `Stat` as a widget's content is not a card in a card.
- [x] `pnpm check dashboard`; looked at as a user with the keyboard.

## Comments

**Delivered (2026-10-31, run coordinator).** Widgets of one title named "<title>, place N of M"; Edit and
Reset hand focus to "Add widget", Cancel and Done to "Edit", entering is announced, Escape cancels
(checked by keyboard in Chromium); `onDraftChange(false)` on unmount; the bar within the board's
max width; `defaultOptions` optional; a cut title shows in full on hover/focus; a Stat in a widget drops
its frame; the size choice is `menuitemradio` with `aria-checked` (core `MenuItem` takes `role`, one
`MENU_ITEMS` selector) - looked at; ArrowUp/Down move one row, the head describes it
(`dashboardHeadHint`). Decided: the ticket reverses the old menu role and per-place arrows, so
`editing.test.tsx` and the `item` helper in three files moved (coordinator's call); focus handoff on any
press (Safari does not focus clicked buttons).
