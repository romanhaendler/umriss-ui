# 06 - The pickers keep to `min` and `max`

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-the-calendar-jumps-to-a-month-and-a-year.md`, `03-a-date-typed-in-the-panel.md`,
`.scratch/root-contract/issues/03-core-the-pickers-are-fields-and-the-name-is-aria-label.md`,
`.scratch/plant-time-zone/issues/04-the-pickers-pick-the-zones-day-and-time.md`
Spec: `.scratch/date-jump-and-typed-entry/spec.md`

## What to build

A report's dates run from where the data starts to today, and the pickers offer nothing else (map ticket 21,
the row "`min` and `max` on the pickers", which this spec's Out of Scope left as a question of its own).
The ticket waits for 02 and 03, whose year Select and typed date it bounds, for the root contract's ticket
03, which reworks the same four pickers' props and root, and for the time zone's ticket 04, which turns the
pickers' days and today into the formats' zone; the bounds are days in that same zone.

- **The props.** `min?: Date` and `max?: Date` on all four pickers, both inclusive and day-granular: the
  calendar day of each counts, its time of day does not. In a named time zone, the day is the zone's, as
  for `value`. The DateTimePicker and the DateTimeRangePicker bound the day, not the time.
- **The calendar's head.**
  - The year Select holds only the years in range (within its ±100 years), and always the year in view.
  - In the first and the last year, the months wholly outside the range are disabled options.
  - The arrow to the previous or next month is disabled where that month is wholly outside.
- **The grid.**
  - A day outside the range is drawn quiet, is `aria-disabled`, and a click on it does nothing.
  - The grid's keys (the arrows, PageUp and PageDown with and without Shift, Home and End) never move the
    active day outside: a move that would leave the range lands on the bound.
  - On opening, an active day outside the range is moved to the nearest bound.
- **The foot.**
  - "Today" (and the DateTimePicker's "Now") is disabled when today is outside.
  - A preset wholly outside is disabled; one that overlaps a bound is cut to the range, so a picked value
    never leaves it.
- **The typed date** (03). A date outside the range is refused like a text that is no date: marked invalid
  on Enter, nothing picked, and its error announced. The error has a wording entry of its own, a function
  of the bounds written in the formats in use ("Not before …", "Not after …", "Not between … and …";
  German "Nicht vor …", "Nicht nach …", "Nicht zwischen … und …").
- **A value given outside the range** is shown as given; the pickers do not correct a controlled value.
- **Docs.** The four pickers' `min` and `max` doc comments; one example on the DatePicker page ("From the
  first reading to today") and the range picker's presets cut to a bound in one example on its page.
  Regenerate `API.md`.

## Acceptance criteria

- [ ] jsdom tests beside the date picker tests, with `min` 1 March 2020 and `max` today:
  - [ ] the year Select offers 2020 to this year only; February 2020 is a disabled month option;
  - [ ] a day before 1 March 2020 is `aria-disabled` and a click on it hands out nothing;
  - [ ] PageUp from 15 March 2020 lands on 1 March 2020; End on the week of today stops at today;
  - [ ] "Today" is enabled; with `max` yesterday it is disabled.
- [ ] A jsdom test on the DateRangePicker: a preset wholly outside is disabled; "This month" with `max`
      today hands out the first of the month to today.
- [ ] A jsdom test on the typed date: a date before `min` is marked invalid, announced with the bound, and
      hands out nothing.
- [ ] A jsdom test on the DateTimePicker: a time on the `max` day is accepted.
- [ ] Without `min` and `max`, every existing picker test passes unchanged.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core` pass; the new examples'
      screenshots are new baselines, reviewed in both themes.
- [ ] Core's changelog lists `min` and `max` under "Added".
