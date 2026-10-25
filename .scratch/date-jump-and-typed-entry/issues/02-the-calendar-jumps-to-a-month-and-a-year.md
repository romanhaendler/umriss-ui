# 02 - The calendar jumps to a month and a year

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-a-surface-inside-a-panel-stays-inside-it.md`
Spec: `.scratch/date-jump-and-typed-entry/spec.md`

## What to build

The tracer bullet: 17 March 1985 is about four taps or clicks away in every date picker, and a finger gets
the platform's wheel for the year.

- **The head.** Between the arrows, two `sm` Selects, the month and the year, replace the month's text.
  - Choosing in either moves the view. The active day moves with it, as paging does, so the grid's tab
    stop stays in the visible month.
  - The years run from 100 years before today to 100 after, as plain digits, and always hold the year in
    view.
  - Both are named in the wording, English and German ("Month", "Year"; "Monat", "Jahr").
  - In the month pair only the left month carries the Selects; the right keeps its text and its forward
    arrow and follows.
- **`monthName`**, a new key of `Formats`: the month alone ("March", "März"), built from the locale as
  `month` is, overridable by a caller. The month Select's options use it.
- **The grid's keys** (APG): PageUp and PageDown move the active day a month, keeping its day of the month
  as paging does; Shift with them moves a year; Home and End go to Monday and Sunday of the active week.
  The view follows.
- All four pickers share the calendar, so all four get the head and the keys. Their value contracts do
  not change.
- Update the date picker screenshots deliberately, in both themes; the head is the only change in them.

## Acceptance criteria

- [ ] jsdom tests beside "Paging with the arrows": choosing 1985 and March shows March 1985 with the tab
      stop in it; the month pair follows its left month; PageUp, Shift+PageUp, Home and End land where the
      APG says, across a month and a year boundary.
- [ ] A jsdom test: a touch press on the year Select opens no own list, as the Select's listbox test
      asserts for a plain Select.
- [ ] With the German wording and formats, the head reads "März" and "Jahr".
- [ ] `monthName` is in `Formats`, documented, and in core's `API.md`; an override reaches the head.
- [ ] Core's changelog lists the head, the keys and `monthName` under "Added".
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core` pass; the screenshot changes
      are the head only.
