# Native pickers on touch, and the DatePicker's year jump and typed entry

Type:       grilling
Status:     resolved
Blocked by: 06

## Question

Which pickers hand over to the native control on touch, and what does the library's own DatePicker gain
for everyone else?

`.scratch/shakedown/mobile-native.md` proposes, touch only, desktop unchanged: DatePicker to `type="date"`,
DateTimePicker and DateTimeRangePicker to `datetime-local`; DateRangePicker "needs a design"; every other
component keeps its own UI. Each handover loses formats, wording, presets, Today/Clear, seconds, Now/Apply,
and turns the value into a string that must become a local-midnight `Date`.

- Hand over (which ones, triggered by the touch signal "A touch size for the controls" chose), or keep the
  library's pickers and fix them on touch instead.
- DateRangePicker: two native dates, or a year jump in the library.
- The year/month jump and typed entry in the DatePicker, wished by five personas, the keyboard persona among
  them (`core.md` E, `accessibility.md`) - needed on desktop whatever happens on touch.
- The two touch breaks that are not a handover: NumberInput without a minus key on iOS (`mobile-native.md`
  2), the time fields dropping digits in WebKit (3), MultiSelect's autofocus (8).

## Answer

Decided 2026-10-25 by the agent; the maintainer delegated the technical questions. Product calls are marked
*(agent, product - for review)*. The touch signal is the one "A touch size for the controls" settled.

- **No picker hands over to the native control** *(agent, product - for review)*. DatePicker,
  DateTimePicker, DateRangePicker and DateTimeRangePicker keep their own panel under a finger. The one
  thing native did better, reaching a distant date, the library's calendar now does itself (next point).
  A handover would cost every promise the pickers make: the formats and the wording, `presets`,
  Today/Clear, the seconds, Now/Apply, the value contract, and a field that looks like its neighbours. It
  would bring a second markup and the platform's unstyled date input on every phone. The DateRangePicker
  has no native counterpart at all, so the four would split into two kinds. Cheap to reverse: a handover
  decided by CSS or per gesture could be added later.
- **The calendar jumps to a month and a year, for everyone** *(agent)*:
  - The month header of the calendar becomes two `sm` Selects, the month and the year, between the
    arrows. The arrows stay.
  - Under a finger a Select opens the platform's wheel (ADR-0043). So the phone gets its native wheel
    exactly where it helps, inside the library's picker, and nothing else changes. 17 March 1985 from
    October 2026 then takes about four taps instead of about 500.
  - Under a mouse and the keys, the Select's own list is used, with its typing: "1985" typed on the year
    jumps there.
  - The year list runs from 100 years before today to 100 after, and always holds the year in view.
  - In the range pickers' month pair, the left month carries the two Selects and the right month follows,
    as its arrows already do. That answers the DateRangePicker: a year jump in the library, not two
    native dates.
  - The month names come from a new format, `monthName` (the month alone, "March"). It is built from the
    locale, as `month` is, and is additive in `Formats`.
  - A Select inside a panel needs one fix first *(agent)*. Its own list is portalled outside the date
    panel, so by the code a pick in it would close the panel. A surface opened from inside a Popover's
    panel counts as inside that panel, and Escape closes only the innermost surface.
  - The grid gets the APG date-grid keys: PageUp and PageDown move a month, Shift+PageUp and
    Shift+PageDown move a year, Home and End go to the start and end of the week.
- **Typed entry, in the DatePicker's panel** *(agent, product - for review)*:
  - The panel's foot gets a text field before Today and Clear: "Type a date". Its placeholder is an
    example date in the formats in use.
  - It reads the day, the month and the year in the order the formats in use write them, with any
    non-digit between them. It also takes digits only (`17031985`, `170385`), a two-digit year (the one
    nearest to today), and ISO `1985-03-17`.
  - As soon as the text is a date, the grid shows it. Enter picks it and closes the panel. A text that is
    no date (31 February, too few parts) is marked invalid on Enter and picks nothing.
  - A digit typed while the grid has the focus starts typed entry. So Enter on the trigger, then
    `17.03.1985`, then Enter is the whole way.
  - The trigger stays a button: no consumer's role-based test breaks, and the four pickers keep one
    trigger. A typed trigger (an APG combobox, Mantine's `DateInput`) is later.
  - No typed entry in the range and time pickers: they are later, each on a caller. The time is already
    typed in the time fields.
- **The two touch breaks that are not a handover** *(agent)*:
  - *NumberInput's minus.* A field that allows a negative value (`min` unset or below 0) takes
    `inputmode="text"`. A field with `min` at 0 or above keeps `decimal` or `numeric`. iOS's number pads
    have no minus key, and whether a pad shows one cannot be known without sniffing the platform during
    render, which the touch signal rules out. A caller's `inputMode` still wins. Core's changelog states
    this under "Changed": `min={0}` brings the number pad back.
  - *The time fields on WebKit.* A time field takes each typed digit itself, whatever the caret and the
    selection. The first digit after focus replaces the value, the second completes it and moves on. The
    `maxLength` that blocked a typed digit once a touch had undone the selection goes.
  - *The time fields' arrows* (13 px, left to this ticket by the floor). Under a finger they are hidden by
    CSS: two of them cannot reach 24 px within a 26 px field, and the number pad is the faster route there.
    The floor check's open list then loses its time-field entries.
  - *MultiSelect's autofocus.* Opened by a touch, as told by the `pointerType` of the opening gesture, the
    panel focuses its first option instead of the search, so no keyboard covers the list. A tap on the
    search brings the keyboard. Opened by a mouse or the keys, it is unchanged.
- **Explicitly out:**
  - Native date or datetime inputs on any device, and two native dates for a range.
  - A typed trigger, and typed entry in the range and time pickers (later).
  - `min` and `max` on the pickers (`core.md` E): a new question for the map, see below.
  - `role="grid"` on the calendar (`core.md` E) and Tab leaving an open panel (`accessibility.md` 2): the
    accessibility triage.
  - The panel over the on-screen keyboard (`mobile-touch.md` 3): the defects triage.
  - The Slider's +/- steppers: "Core's single wishes".
- **Costly to reverse: no.** Every part is additive or a fix: a later handover, a typed trigger or `min`
  and `max` can each come on top. So there is no ADR. The under-a-finger ADR records, in one sentence, that
  the date pickers keep their panel under a finger and reach the platform's wheel through the Select.
- **Touches:** core only - Popover (a Select inside a panel), the Calendar, DatePicker, TimeField,
  NumberInput, MultiSelect, `Formats` (`monthName`), and the wording in English and German (the two
  Selects' names, the typed field's label and its error).
- **Becomes the spec** `.scratch/date-jump-and-typed-entry/`.
