# 05 — The table demo is checked, and left alone

Status: done
Type: task

Spec: `.scratch/demo-rubrics/spec.md`

## Scope

The same question was asked of `@umriss-ui/table` and answered the other way, and
that answer should be written down rather than remembered — otherwise the next
inventory asks it a third time.

Twelve pages in four rubrics: `Tables` (3) · `Rows` (2) · `Unbound parts` (5) ·
`Monitoring` (2). Each is one subject, each sentence describes what the rubric is
instead of what it is not, and the largest holds five pages. There is no
leftovers box and no name joined by "and".

Check it once against the same three findings this effort raised for core — a
rubric that is a remainder, a name that joins two nouns, an order that is the
order of delivery — and record the outcome. If all three come back clean, the
demo is not touched.

## Acceptance

- A note in this file says, page by page, whether the three findings apply.
- If they do not: no file under `packages/table/` is edited, and the note says
  so explicitly, so that the absence of a change reads as a decision.

## Comments

**Checked against all three findings, page by page. All three come back clean,
and no file under `packages/table/` was edited.**

| Rubric | Pages | In the order they stand | Sentence | Verdict |
|---|---|---|---|---|
| `tables` | 3 | `Table` · `Column` · `Filter` | *Where a table begins: the hook that binds the row kind, and the column that has exactly one value.* | one subject; reads from the hook to the column to what restricts a column |
| `rows` | 2 | `RowDetail` · `RowActions` | *What hangs on a row without being a column: the detail beneath it and the actions beside it.* | one subject; the order is the sentence's own order |
| `unbound` | 5 | `Toolbar` · `Search` · `ColumnMenu` · `Export` · `Pagination` | *The parts that touch no row: placed in the table they read it, outside they take `of`.* | one subject, and a sharp one — the rubric is defined by a property of the parts, not by a leftover |
| `monitoring` | 2 | `VerdictColumn` · `AlarmList` | *A reading, read against its limits - and alarms with a lifecycle.* | one subject; the order is the sentence's own order |

**Finding 1 — a rubric that is a remainder: does not apply.** Every one of the
four is defined by something the pages share, and each sentence says what the
rubric *is*. `Unbound parts` is the one that could have become a leftovers box
and did not: "touches no row" is a real property, checkable against any page, and
it is exactly the property that makes those five take an `of` prop. Nothing is
grouped there for want of a better place.

**Finding 2 — a name that joins two nouns: does not apply.** `Tables`, `Rows`,
`Unbound parts`, `Monitoring`. Not one carries an "and". `Unbound parts` is two
words but one idea — an adjective on its noun, not a seam.

**Finding 3 — the order is the order of delivery: does not apply.** Each run goes
from what a reader meets first to what stands on it. `Table` before `Column`
before `Filter`; `Toolbar` first because it is the place the next three are met
in, then `Pagination`, which is the one part of the five that does not stand in
the toolbar. Both two-page rubrics run in the order their own sentence names
them, which is as strong a sign as this check can give that the order was chosen
and not appended to.

**The largest rubric holds five of twelve pages.** Core's problem was a rubric of
thirteen that was a quarter of the demo and had no subject; nothing here is close
to that shape.

**Outcome: the demo of `@umriss-ui/table` is deliberately not changed.** `git
status` for this effort shows no file under `packages/table/` — the absence of a
change here is a decision, taken on the evidence above, and not an omission.
