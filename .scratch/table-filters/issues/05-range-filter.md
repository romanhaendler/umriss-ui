# 05 — The range filter

Status: done
Type: task

Blocked by: 03 (may run in parallel with 04)

Spec: `.scratch/table-filters/spec.md` (Column filters › The range filter)

## Scope

- `filter="range"` for `number` and `Date` values, built with `spaltenFilter`; a type error on any other value type.
- Numbers: two `NumberInput`s, applied while typing; `von > bis` marks the fields invalid and keeps the last valid condition.
- Dates: `DateRangePicker`, condition set on the second click, two-click logic untouched; calendar-day bounds in local time, end day inclusive.
- Inclusive bounds, open ends, absent values never match.
- `beschreibe`: "100–500", "ab 100", "bis 500"; dates as days via `formate`.
- Wording entries in `@umriss/ui` ("Von", "Bis", "ab", "bis", invalid range).
- Demo: `Column › bereichsfilter` with a number and a date column.

## Acceptance

- Component tests for bounds, open ends, absent values, invalid input, whole end day, a `Date` with a time of day.
- Type tests: `filter="range"` on text and on boolean are errors.
