# 05 - Tabs uncontrolled, Card controlled

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/core-passthrough/spec.md`

## Scope

P5, with unit tests at the seam of each (a user switching a tab without a
handler; a card collapsed from outside).

## Acceptance

- Rule 2's "Not yet met" list is gone; CHANGELOG under Added.

## Comments

`Tabs` take `defaultValue`, and `value` and `onChange` became optional; `Card`
takes `collapsed` and `onCollapsedChange` beside `defaultCollapsed` - both in
the pattern of `Dock`'s `place`: controlled, the component reports and waits;
uncontrolled, the report is a message. Tests in
`tests-unit/controlledAndNot.test.tsx` (a tab switched without a handler, a
card collapsed from outside, and both directions of each). Rule 2's list is
gone from the README, and so is the roadmap's pointer to ticket 09; CHANGELOG
under `## Unreleased`, Added and Changed.
