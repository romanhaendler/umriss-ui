# 02 - Combobox, MultiSelect, CommandPalette

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/listbox-announcements/spec.md`

## Scope

B2, B3.

## Acceptance

- jsdom tests of each announcement; manual check with VoiceOver noted in the ticket.

## Comments

Delivered, with four new `Wording` keys (EN and DE): `optionCount`,
`optionActive(label, { selected, disabled, group })`, `optionAdded`,
`optionRemoved`.

- **Combobox**: the count on opening (click or arrow) and on every change of
  the query, the empty text where nothing is left; on ArrowUp/Down the option
  with "selected" and "unavailable". Not for the pointer - it sees.
- **MultiSelect**: the count on opening, on every letter in the search and on
  a change of scope ("Nothing selected" in an empty selected scope); "added" /
  "removed" for Enter in the search, a chip's cross or Delete, and Backspace on
  the trigger.
- **CommandPalette**: its own `role="status"` element is gone; the count goes
  through the shared region inside its dialog - on every query (also one that
  finds nothing, as "Nothing found"), and on opening when resting items
  stand. The arrow keys say the find with its group.

Deviations from B2, each on purpose:

- The multi-select's list is not an `aria-activedescendant` listbox but real
  checkboxes with the focus, which VoiceOver reads with their label and
  checked state. Moving there says nothing of ours, and ticking a focused
  checkbox says no "added"/"removed" - two voices would double every step.
  "Added"/"removed" are said exactly where no focused control says it.
- The palette's rows are never "selected" (`aria-selected` is the mark
  there); in place of the state it says the group, the other thing React
  Aria's study found VoiceOver dropping.
- A disabled option says "unavailable": B2 did not name it, and a silent Enter
  on an option that sounds choosable is the same gap.

Tests: `packages/core/tests-unit/listboxAnnouncements.test.tsx` (14), in
English and German; the palette's old status test in
`commandPalette.test.tsx` points there. Browser: core's screenshots, shell,
basics and accessibility suites on a temporary config (port 4311): 380
passed, 30 skipped, no baseline moved - the region is visually hidden and
only appears once something was said.

**Manual VoiceOver pass: not done** - the implementing agent has no screen
reader. What a human should check, Safari and Chrome on macOS:

1. Combobox demo: Tab in, ArrowDown - hear "N options" once. Type "ta"
   quickly - one count after the pause, not one per letter. Arrow onto the
   selected option - "…, selected"; onto a disabled one - "…, unavailable".
   Does VoiceOver's own reading of the active descendant and ours now say the
   label twice? If so, the label on moving may need to shrink to the state
   alone.
2. MultiSelect: open - count; type in the search - count; Enter - "X added";
   Tab to a checkbox and Space - only VoiceOver's own "checked", no second
   voice; Backspace on the trigger - "X removed".
3. CommandPalette (the demo shell's palette): typing counts finds, the arrows
   say find and group, and all of it is heard while the modal dialog is open
   (the region lives in the dialog - if silent there, that rule is wrong).
4. A combobox inside a `Modal`: the count is heard (the dialog's region).
5. The FIRST announcement on a fresh page and the first inside a freshly
   opened dialog: the region is built at that call and written 150 ms later.
   If VoiceOver drops that first one, the region must stand from mount.

Review (code-review against `main`, standards and spec) - fixed: the new
keys' parameters were German (`beschriftung`), now `label`; `optionCount`'s
dead zero branch removed (every list says its own empty text); the announcer
no longer imports `VisuallyHidden`'s stylesheet from `lib` (the same rule,
inline); a count still waiting is dropped when the combobox or the palette
closes (`silence()`, with a test - Enter before the rest used to be followed
by the count); the palette's count no longer re-runs on a caller's inline
wording, which would have spoken over the find the arrows named; a comment
that said "only for the keys" where the opening's count is the pointer's too.
Left as they are: the bulk actions (all / none / invert) say nothing - B2
names choosing, and those are buttons whose summary stands beside them; the
region built lazily 150 ms before its text (check 5 above); a region appended
into a React-owned `<dialog>` - React leaves a foreign last child alone.
Core suite after the review: 61 files, 1280 tests green; typecheck and lint
green.
