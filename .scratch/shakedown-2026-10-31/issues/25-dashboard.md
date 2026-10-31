# 25: Dashboard

Status:     ready-for-agent
Blocked by: None (can start immediately)

Sources: earlier-runs-open 10-28 p4-jonas 5, composed-app 9, 12, audit-family 7, dashboard.md 4, 9, P10-1,
design-family 2, settle 15.

- [ ] Two widgets of one type have different names (menu "Actions for <title>", figure landmarks): the instance's title, or the type's label with its place.
- [ ] Focus stays put through Edit, Done, Cancel and Reset (the pressed button's successor takes it); entering edit mode is announced; Escape leaves edit mode (Cancel).
- [ ] The size choice is a `menuitemradio` with `aria-checked`, no "✓ " in its name.
- [ ] ArrowUp/Down on a widget head move it one row, not one place; the head says that arrows move it.
- [ ] `onDraftChange(false)` fires when a dashboard with an open draft unmounts.
- [ ] The edit bar stands within the board's maximum width, not at the screen's far right.
- [ ] `WidgetType`'s `defaultOptions` is optional for a widget without options.
- [ ] A widget title cut by text spacing (WCAG 1.4.12) shows in full on hover/focus.
- [ ] A `Stat` as a widget's content is not a card in a card.
- [ ] `pnpm check dashboard`; looked at as a user with the keyboard.

## Comments
