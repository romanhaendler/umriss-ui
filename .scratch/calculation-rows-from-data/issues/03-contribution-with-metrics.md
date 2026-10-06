# 03 — Contribution with metrics

Status: done
Type: task

Blocked by: 02
Spec: "Implementation Decisions" (Contribution, metrics), "Examples" 10;
user stories 31–33

## What to build

In a calculation with metrics (ADR-0038) a line has one operator and several
numbers. Where all its metrics point the same way, the line shows the
contribution as everywhere else. Where they point in different directions, it
keeps the written operator and each number its sign. A metric that is zero or
absent on the line is left out of that check; if none is left, the written
operator stands. The sentence follows the drawn operator.

## Acceptance

- [x] Rendered tests with metrics: a line whose metrics agree (operator
      turned, numbers unsigned), one whose metrics disagree (operator as
      written, signed numbers), one with a zero metric beside a negative one
      (turned), one with every metric zero or absent (as written).
- [x] Example "Rows of both signs with metrics" on Rows from data: a staff
      movement with one line that disagrees, its lead saying so.
- [x] ADR-0049 gains the rule for zero and absent metrics in its rules list.

## Comments

Done - see the delivery report in `spec.md`.
