# 09 - Keyboard and announcements

Status: ready-for-agent
Type: task
Size: M

Blocked by: `07-first-out-the-flood-rate-and-a-flood-in-the-list.md`, `08-table-a-selection-a-screen-reader-hears.md`
Spec: `.scratch/alarms/spec.md`

## What to build

The last slice, end to end. The list works without a mouse, "acknowledge all" takes what the operator sees,
and the list stays quiet in a flood.

- **The list is a grid.** It renders its table in grid mode (ADR-0034): one tab stop, and the arrow keys.
  Space selects (the table's own key, heard since ticket 08). While focus is inside the list:
  - `A` acknowledges the focused cell's alarm through `onAcknowledge([id])`;
  - Shift+A opens the acknowledge-all confirmation;
  - `S` opens the shelve panel for the selection, or for the focused alarm without one;
  - Escape closes what is open, and focus returns to where it was.
- **Key rules.** The single keys act only while focus is inside the list's grid (WCAG 2.1.4), never in a
  field, and there is no remapping. The list finds the focused alarm through the row it rendered (a data
  attribute through `rowProps`), with no new table API. If the grid swallows these keys before the list sees
  them, record that under `## Comments` and stop; the table's change is then a ticket of its own.
- **Acknowledge what is seen** (A6.2).
  - The bar's acknowledge button and Shift+A act on the selection.
  - Without a selection, they act on the rows rendered inside the list's visible area: the rows whose box
    meets both the list's scroll area and the window, read when the confirmation opens.
  - Never the filtered set as such.
  - The confirmation is core's `ConfirmDialog`, naming the count: "Acknowledge 12 alarms in view" or
    "Acknowledge 3 selected alarms". Only acknowledgeable alarms are counted (`countAcknowledgeable`).
  - The ids are fixed when it opens: an alarm that arrives before the confirm is not acknowledged.
  - The JSDoc and the page say that this is umriss's own rule.
- **Quiet announcements** (A6.1).
  - The list's live region stays polite and says one number.
  - Its text changes at most once per two seconds of the view's as-of time, and the host's next tick delivers
    the last change.
  - There is no timer (map ticket 10, decision 7). The comment says that a host which stops ticking
    also stops the speech, and why that is right for a list whose data has stopped.
  - The banner's alert stays the only assertive speech.
- **The keys page.** The `AlarmList` page's keys table lists every key above. Its limits name the focus rule
  and the missing remapping.
- **Wording**, English and German, with the prefix `alarm`: the two confirmation sentences, its buttons, and
  the in-view and selected counts on the bar's button.

## Acceptance criteria

- [ ] With focus in the list, `A` reports the focused alarm's id. With focus in an input beside the list, `A`
      types "a" and reports nothing.
- [ ] Shift+A with three selected opens "Acknowledge 3 selected alarms". Confirming reports those three ids,
      also when a fourth alarm arrived while the dialog was open.
- [ ] Without a selection, the confirmation counts and reports only the rows inside the visible area: a
      visual-suite test on a scrolled list, since jsdom has no layout.
- [ ] `S` opens the shelve panel for the focused alarm; Escape closes it and focus returns to the cell.
- [ ] The live region's text, over as-of times 0, 1, 2 and 3 s with the count changing each second and a
      tick at 4 s with no change, changes at 0, 2 and 4 s only, and at 4 s says the count of 3 s.
- [ ] `pnpm check alarms`, `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick alarms` pass, and
      the shell's accessibility check passes on the AlarmList page.

## Comments

- The grid does not swallow A, Shift+A or S: `gridKeys.ts` handles arrows, Home/End, Page keys, Space, Enter, F2, and typing only on an editable cell, and calls `preventDefault` for none of the three. The list reads them on its root through the row's `data-alarm-id` (via `rowProps`); no table change is needed.
- Behaviour changes in two existing tests, both named by this ticket: the live region now changes at most once per two seconds of as-of time (the "follows the number" test advances the view's as-of by two seconds), and the bar's Acknowledge is no longer disabled without a selection while an acknowledgeable alarm exists (it asks about the rows in view).
- The bar's button with a selection still reports at once (no dialog); Shift+A and the button without a selection ask first. The button's label is the plain word without a selection: the in-view count is read from layout when the question opens, so it cannot stand on the button.
- S opens the panel in both cases; without `snoozeReason`/`snoozeReasons` it asks for the duration only (the reason field is left out).
- Not run (shared ports): `acknowledge-in-view.spec.ts`, `pnpm test:visual:quick alarms`, the shell's accessibility and silent-pages checks.
