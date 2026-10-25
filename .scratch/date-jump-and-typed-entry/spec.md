# A distant date in a few taps, a typed date, and the fields a finger can type into

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Native pickers on touch" (its Answer holds every
decision below); findings `.scratch/shakedown/mobile-native.md` 1-3 and 8 and its handover table,
`core.md` E, `accessibility.md` (the typed date field), and the DatePicker row of `wishes.md` section 2;
the touch signal of `.scratch/under-a-finger/spec.md`; ADR-0035, ADR-0043, ADR-0045.

## Problem Statement

A person who needs a date that is not near today cannot get to it, and a person on a phone meets fields
that do not take what they type.

- **A distant date takes hundreds of presses.** The calendar moves only a month at a time. 17 March 1985
  from October 2026 is about 500 taps on a phone and about 480 clicks on a desktop. The grid knows no
  PageUp, PageDown, Home or End.
- **No date can be typed.** A user who knows the date, a keyboard user above all, still walks the grid.
- **A Select inside a panel would close the panel.** The Select's own list is portalled outside the panel
  it was opened from, so a pick in it counts as a click outside.
- **An iPhone user cannot type a negative number** into a NumberInput: the number pads it asks for have no
  minus key.
- **The DatePicker's time fields drop typed digits on iOS.** A touch places the caret and undoes the
  selection the field relies on, and the two-character limit then blocks the next digit: "0930" leaves
  00:00.
- **The time fields' arrows are 13 px high**, below the 24 px floor that the under-a-finger spec sets.
- **A MultiSelect opened by a touch raises the keyboard** at once, because it focuses its search, and the
  keyboard covers the list.

The shakedown proposed handing three pickers to the platform's date inputs on touch. That would cost the
formats and the wording, the presets, Today and Clear, the seconds, Now and Apply, the value contract and
the look of every phone form, and it leaves the DateRangePicker with no counterpart.

## Solution

The pickers stay the library's on every device. Their calendar reaches a distant date itself, and a
finger gets the platform's wheel where the wheel helps: through the Select.

- **The calendar's head holds a month Select and a year Select** between its arrows. Under a finger a
  Select opens the platform's wheel (ADR-0043); under a mouse and the keys it opens its own list, where
  typing "1985" jumps there. The grid gets the APG keys for a month, a year and the week's ends.
- **A Select inside a panel stays inside it.** Its list counts as part of the panel it was opened from.
- **The DatePicker's panel takes a typed date** in a field in its foot, read in the order the formats in
  use write a date. A digit typed on the grid starts it.
- **A NumberInput that allows a negative value asks for the text keyboard**, which has a minus key.
- **A time field takes each digit itself**, whatever the caret, and its arrows are hidden under a finger.
- **A MultiSelect opened by a touch focuses its first option**, not its search.

## User Stories

1. As a clerk entering a birthday on a phone, I want to choose the year on the phone's own wheel, so that
   1985 is a flick away and not 500 taps.
2. As a clerk on a desktop, I want to pick the year and the month from lists in the calendar's head, so
   that a distant date takes four clicks.
3. As a keyboard user, I want to type "1985" on the focused year list, so that I reach the year without
   scrolling.
4. As a keyboard user, I want PageUp and PageDown to move a month and Shift with them a year, so that the
   grid behaves as the APG date picker does.
5. As a keyboard user, I want Home and End to go to the start and the end of the week, so that I move
   within a week in one key.
6. As a planner choosing a range a year ahead, I want the same year jump in the DateRangePicker and the
   DateTimeRangePicker, so that both ends are quick to reach.
7. As a user of the month pair, I want the right month to follow when I change the left one's month or
   year, so that the two months stay neighbours.
8. As a German user, I want the month names in my formats and the two lists named in my wording, so that
   the head reads in my language.
9. As a power user, I want to type `17.03.1985` into the DatePicker's panel and press Enter, so that a
   known date takes no pointing at all.
10. As a power user, I want to type a digit while the grid has the focus and land in the typed field, so
    that Enter, the date, and Enter is the whole way.
11. As a user typing quickly, I want `17031985`, `170385` and `1985-03-17` to be read too, so that I type
    the date the way I am used to.
12. As a user typing a two-digit year, I want the year nearest to today, so that `85` means 1985 and `30`
    means 2030.
13. As a user typing a date, I want the grid to show it as soon as it is complete, so that I see what Enter
    will pick.
14. As a user typing 31 February, I want the field marked invalid and nothing picked, so that a wrong date
    never lands in the form.
15. As an application developer, I want the DatePicker's trigger to stay a button, so that my tests that
    find it by its role keep passing.
16. As an application developer, I want a Select inside a Popover's panel to work, so that a pick in its
    list does not close the panel around it.
17. As an application developer, I want Escape in a nested list to close only that list, so that the
    panel around it stays open.
18. As an iPhone user, I want to type a negative temperature into a NumberInput, so that a value the field
    allows can be entered.
19. As an application developer whose field is never negative, I want `min={0}` to keep the number pad,
    so that my users keep the faster keyboard.
20. As an application developer, I want my own `inputMode` to win, so that I decide the keyboard where I
    know better.
21. As an iPhone user, I want to type `0930` into the time fields and get 09:30, so that a time can be
    typed at all.
22. As a phone user, I want no time-field arrows I cannot hit, so that every target I see is large enough
    for a finger.
23. As a phone user, I want a MultiSelect to open without the keyboard, so that I see the list I came to
    tick.
24. As a phone user who wants to search a MultiSelect, I want a tap on its search field to bring the
    keyboard, so that searching still works.
25. As a desktop user, I want a MultiSelect opened by a click or a key to focus its search as today, so
    that I can type at once.
26. As the maintainer, I want the floor check's open list to lose the time-field entries, so that the
    24 px promise holds without exceptions in core.

## Implementation Decisions

- **No handover.** No picker renders a native date or datetime input, on any device. The touch signal of
  the under-a-finger spec applies wherever a behaviour differs on touch: the `pointerType` of the gesture,
  or CSS, never a render-time test.
- **A surface inside a panel.**
  - A Popover opened from inside another Popover's panel counts as inside it. A pointer-down in the inner
    surface does not close the outer one.
  - Escape closes only the innermost open surface.
  - This holds for every Popover: the Select's and the Combobox's lists, a Menu, a nested Popover. It
    holds whether the outer panel is portalled to the body or into a dialog.
- **The calendar's head.**
  - Between the arrows stand two `sm` Selects: the month, then the year. They replace the month's text.
    Choosing in either moves the view; the active day moves with it, as paging does today, so the grid's
    tab stop stays in the visible month.
  - The months are named by a new format, `monthName` ("March"; German "März"). It is built from the
    locale, as `month` is, and is a key of `Formats` that a caller may override.
  - The years run from 100 years before today to 100 after, written as plain digits. The year in view is
    always in the list, even outside that span.
  - The two Selects are named in the wording ("Month", "Year"; German "Monat", "Jahr").
  - In the month pair, only the left month carries the Selects; the right month keeps its text and its
    forward arrow and follows the left.
  - All four pickers share the calendar, so all four get the head.
- **The grid's keys** (APG date picker dialog): PageUp and PageDown move the active day a month, keeping
  the day of the month as paging does; Shift+PageUp and Shift+PageDown move it a year; Home and End go to
  Monday and Sunday of the active week. The view follows, as it does for the arrows.
- **The typed date** (DatePicker only).
  - A text field in the panel's foot, before Today and Clear. It is named by the wording ("Type a date";
    German "Datum eingeben"). Its placeholder is a sample date written in the formats in use.
  - The reading is a pure function of the text and the formats in use:
    - The order of day, month and year is read from how the formats in use write a sample date with three
      distinct parts. A text with a four-digit first part is read as year, month, day (ISO).
    - Any run of non-digits separates the parts. Digits only are split by the order: eight digits as two,
      two and four; six as two, two and two.
    - A two-digit year is the one nearest to today; a tie goes to the past.
    - A day that does not exist in its month is no date. There is no rollover.
  - As soon as the text is a date, the grid's view and active day follow it.
  - Enter picks it through the same path as a click in the grid, so the value is local midnight. A text
    that is no date is marked invalid on Enter, its error is announced in the wording ("Not a date";
    German "Kein gültiges Datum"), and nothing is picked.
  - A digit typed while the grid holds the focus moves the focus to the field, and the digit lands there.
  - On opening, the focus goes to the grid's active day, as today. The field is never focused by itself,
    so a touch opening raises no keyboard.
- **NumberInput's keyboard.** `inputMode` is `text` while negative values are allowed (`min` unset or
  below 0), else `decimal` or `numeric` as today. A caller's `inputMode` wins, as it already does. Core's
  changelog lists it under "Changed", with `min={0}` as the way back to the number pad.
- **The time fields.**
  - A time field takes each typed digit itself, independent of the caret and of the selection. The first
    digit after the field gains focus replaces the value; the second completes it and moves on to the next
    field, as today. Backspace and the arrow keys behave as today. The two-character limit goes.
  - Under `pointer: coarse` the arrows are hidden by CSS; the markup stays one. Under a fine pointer they
    stay as they are, with their hold repetition.
  - The floor check's open list loses the time-field entries.
- **MultiSelect.** The trigger remembers the `pointerType` of the gesture that opens the panel, as the
  Select does. Opened by a touch, the panel focuses its first enabled option, or keeps the focus on the
  trigger when there is none. Opened otherwise, it focuses the search, as today.
- **No ADR.** Every part is additive or a fix; each is a commit message. The under-a-finger ADR states in
  one sentence that the date pickers keep their panel under a finger and reach the platform's wheel
  through the Select.

## Testing Decisions

- A good test here does what a user does and asserts what they see or what the form receives: the value
  handed to `onChange`, the focused element by its role and name, the visible month, the keyboard type the
  field asks for. It never asserts on class names or internal state.
- **A surface inside a panel:** jsdom unit tests beside the Select's listbox tests. A Select inside a
  Popover: a pick in its list keeps the Popover open and reaches `onChange`; Escape closes the list and
  leaves the Popover open; a second Escape closes the Popover. A feature test inside a Modal holds the same,
  since there the panels portal into the dialog.
- **The calendar's head and keys:** jsdom unit tests beside the existing date picker tests (prior art:
  "Paging with the arrows"). Choosing a year and a month shows that month and keeps the tab stop in it;
  the month pair follows; PageUp, Shift+PageUp, Home and End land where the APG says. A touch press on the
  year Select opens no own list and leaves the press to the platform, as the Select's listbox test already
  asserts for a plain Select.
- **The reading of a typed date:** a pure unit test of the reading function, over the English and the
  German formats and an override that writes month first: every accepted shape, two-digit years either
  side of the nearest-year line, an impossible day, and too few parts.
- **The typed field:** jsdom unit tests: typing and Enter hands out local midnight and closes; an invalid
  text is marked and hands out nothing; a digit on the grid lands in the field.
- **NumberInput:** a unit test on the rendered `inputmode` for `min` unset, below 0, and at 0, with and
  without `decimals`, and that a caller's value wins.
- **The time fields:** a test in WebKit under touch, launched from a feature test as the calculation's
  density suite launches WebKit: a tap on the hour field, then typing `0930`, shows 09:30. If emulation
  does not reproduce the lost selection, a jsdom unit test that collapses the selection after focus
  stands in for it. The floor check, with its open list emptied, holds the hidden arrows.
- **MultiSelect:** jsdom unit tests with `pointerType: "touch"` and `"mouse"` pointer events on the
  trigger: the focus lands on the first option or on the search.

## Out of Scope

- Native date and datetime inputs on any device; two native dates for a range.
- A typed trigger (an APG combobox, Mantine's `DateInput`), and typed entry in the DateTimePicker, the
  DateRangePicker and the DateTimeRangePicker.
- `min` and `max` on the pickers, which would bound the year list and disable days: a question of its own.
- `role="grid"` on the calendar and Tab leaving an open panel: the accessibility triage.
- The panel standing over the on-screen keyboard: the defects triage (`mobile-touch.md` 3).
- The Slider's +/- steppers: "Core's single wishes".

## Further Notes

- The head's two Selects change every date picker screenshot, in both themes. The first take uses the
  Select as it is, at `sm`. Whether they should read quieter, closer to today's month title, is a look for
  the maintainer to judge in the comparison; a change there is CSS in the date picker's own module.
- On upgrade, a NumberInput without `min` shows the text keyboard on a phone. That is the price of a minus
  key that iOS does not offer on its number pads; `min={0}` or the caller's own `inputMode` restores the
  pad.
- A month name that the formats write in a case other than the nominative (some Slavic languages) is the
  caller's to override through `monthName`.
