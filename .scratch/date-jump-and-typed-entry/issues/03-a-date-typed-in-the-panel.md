# 03 - A date typed in the DatePicker's panel

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-the-calendar-jumps-to-a-month-and-a-year.md`
Spec: `.scratch/date-jump-and-typed-entry/spec.md`

## What to build

A user who knows the date types it: Enter on the trigger, `17.03.1985`, Enter.

- **The reading**, a pure function of the text and the formats in use (spec, "The typed date"):
  - the order of day, month and year as the formats write a sample date with three distinct parts; a
    four-digit first part is ISO;
  - any run of non-digits separates; eight digits split two, two, four, six digits two, two, two;
  - a two-digit year is the one nearest to today, a tie to the past;
  - a day that does not exist in its month is no date.
- **The field**, in the DatePicker panel's foot before Today and Clear:
  - named in the wording, English and German ("Type a date"; "Datum eingeben");
  - its placeholder is a sample date in the formats in use;
  - once the text is a date, the grid's view and active day follow it;
  - Enter picks it through the grid's own path (local midnight) and closes;
  - a text that is no date is marked invalid on Enter, its error is announced ("Not a date";
    "Kein gültiges Datum"), and nothing is picked.
- **A digit typed on the grid** moves the focus to the field, and the digit lands there.
- On opening, the focus still goes to the grid's active day; the field never focuses itself.
- The trigger stays a button. The other three pickers get no field.

## Acceptance criteria

- [ ] A unit test of the reading over the English formats, the German formats and an override that writes
      the month first: every accepted shape, two-digit years either side of the nearest-year line, 31
      February, and too few parts.
- [ ] jsdom tests: typing a date and Enter hands out local midnight and closes the panel; an invalid text
      is marked, announced and hands out nothing; a digit on the grid lands in the field.
- [ ] The panel still fits its width at 375 px with the field, Today and Clear in one row.
- [ ] Core's changelog lists the typed field under "Added"; the DatePicker's documentation shows it.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core` pass.
