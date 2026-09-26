# 01 - A computed aggregate without float noise

Status: done
Type: task

## Problem

A column without a `format` writes its sum and its average with
`formats.number(value)`, which shows a value to its full precision - right for
a measurement, which must not be rounded behind the reader's back, and wrong
for a computed value, whose trailing digits are arithmetic, not information.
The Formats page's "Show absent values" example shows it: three estimates of
18, 12 and 10 hours average to `⌀ 13.3333333333`. A sum can do the same:
`0.1 + 0.2` is `0.30000000000000004`. The footer and every group header write
aggregates the same way (`AggregateValue`), so both show it.

## Scope

In `@umriss-ui/table`, for `aggregate="sum"` and `aggregate="avg"` on a column
without a `format`:

- a **sum** is written with as many decimals as the most precise value that
  went into it;
- an **average** with one more than that - whole hours average to tenths;
- the digit count is fixed (`12.0` beside `13.3`), so that totals in a column
  of tabular figures stay aligned on the decimal point.

Unchanged: a column with a `format` writes its aggregates in that format;
`min`, `max` and `range` are values that went in and are written as they are;
`count` and `distinct` are counts; an aggregate of one's own keeps its
presentation.

## Acceptance

- The "Show absent values" example's footer reads `⌀ 13.3`.
- A sum of `0.1` and `0.2` reads `0.3`; a sum of whole numbers has no decimals.
- An average in a column with `format={{ decimals: 2 }}` still reads two
  decimals.
- A unit test holds each of these.
- The table's changelog names the change under "Changed".

## Comments

2026-09-26, delivered on `main` in `@umriss-ui/table` 0.6.2. `AggregateValue`
writes a sum or an average of a column without a `format` with a fixed count
of decimals: the most precise value's for a sum, one more for an average.
The example's footer reads `⌀ 13.3`; four unit tests in
`tests-unit/aggregate.test.tsx` hold the acceptance. The sum of `0.1` and
`0.2` already read `0.3` before - core writes at most ten decimals and so
rounds the float's remainder away - and its test stays as a guard. The
visual suite changed two pictures, the example's, light and dark.
