# 01 — English formats, German optional

Status: done
Type: task

Spec: `.scratch/schedule-legibility/spec.md` (user stories 32–36, "The formats")

## Scope

- `DEFAULT_FORMATS` becomes `en-GB` (24-hour clock); `GERMAN_FORMATS` ships behind the subpath that carries `GERMAN_WORDING`.
- The collation follows the locale; the four demos show the English default.
- An ADR records the decision and points at ADR-0019, which left it open.

## Acceptance

- The formats' characterisation test pins both sets against one fixed instant.
- Every picture that shows a date or a number is renewed **with its count read and stated** - the only ticket allowed to do that in bulk.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, the browser suites green.

## Comments

**Delivered.** ADR-0024.

- `formatsFor(locale)` builds a whole `Formats`; `DEFAULT_FORMATS` is its
  `en-GB` instance (day first, 24-hour clock set explicitly - `en-GB` writes
  "24:00" for midnight without `hourCycle`), `GERMAN_FORMATS` its `de-DE` one,
  exported beside `GERMAN_WORDING`.
- **`NumberInput` would have broken and does not.** Its parser assumed a German
  dot and comma; under English notation it would have misread its own output.
  `separatorsOf(formats)` measures the two characters off the formats - one
  number with one decimal place, digits struck out - so it also holds for a
  notation an application replaced. `parseNumber`/`filterInput` take them as a
  last argument.
- **The characterisation test was rewritten once**, deliberately, and now pins
  both sets against one fixed instant - the only place where this change reads
  as a diff. Tests whose subject was the German notation moved with it: the
  date pickers' trigger labels, the month pair's month names, `Stat`'s
  notation, `mergeLanguage`'s untouched formatter, and in the table the toolbar
  ratio, a range condition, the verdict's excess and the default cell. The
  table's German-wording mount now hands in `GERMAN_FORMATS` as well, which is
  the new usage under test.
- **Baselines: 39 moved** - 2 in core (`example-stat--freshness`, both themes),
  21 in the schedule, 16 in the table. Read, not renewed blindly: the bulk run
  also caught three charts pictures, and those were **restored**, because the
  charts label their axes with their own formatter and nothing of theirs could
  move. Restoring them and running the charts projects again failed on a
  different three - the known flutter (`docs/testing.md`, Known open).
- Three browser tests asserted German literals and now assert the default:
  the table's footer sum and its virtualisation count, and the schedule's day
  band.
- **Left open on purpose, as ADR-0019 left this one:** the CSV export's decimal
  comma and semicolon. It is a machine format for a spreadsheet and never read
  the display formats; whether it should follow the locale is a question about a
  third object. Noted in ADR-0024 and in `CONTEXT.md`.
- `pnpm lint`, `pnpm typecheck`, unit tests (1,917) and the browser suite (850)
  green.
