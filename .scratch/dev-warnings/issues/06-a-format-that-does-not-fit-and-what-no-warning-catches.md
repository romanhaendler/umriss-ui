# 06 - A format that does not fit says so, and the documents say what no warning catches

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/dev-warnings/spec.md`

## What to build

An application has ISO strings in a column and gives it `format="dateTime"` behind an `as any`. The cells
show the raw strings, as they do today. In development the table now logs once that the column holds no
points in time, and that a point in time is a `Date` in the row. The documents carry the traps that no
warning can catch.

- **The check.** The table reads a column's kind off its first value present. Where it does, it warns once
  per column:
  - when a date format (`"date"`, `"time"`, `"dateTime"`) meets a kind other than a point in time;
  - when a number format (`"percent"`, `"count"`, an object) meets a kind other than a number.

  An empty column does not warn. Only the format's kind is read, so Intl options from
  `.scratch/number-formats/` need nothing here.
- **The table's column documentation** (the demo, and so `llms-full.md`) says:
  - a value sorts by its kind, and a string sorts as text, so numbers given as strings are converted in the
    rows or given `sortValue={Number}`;
  - a point in time is a `Date` in the row, and an epoch number or an ISO string is converted there.
- **Core's README**, beside the browser floor, gives the line an application uses to check the floor
  itself: `CSS.supports("color", "light-dark(red, red)")`.

## Acceptance criteria

- [ ] A `dateTime` column over ISO strings warns once, naming the column; over epoch numbers likewise.
- [ ] A `{ decimals: 2 }` column over strings warns once.
- [ ] A date column over `Date`s, a number column over numbers, and an all-empty column stay silent.
- [ ] The column documentation and core's README carry the sentences above.
- [ ] `pnpm check table` and `pnpm check:site` pass.
- [ ] The changelog notes the warning under "Added".
