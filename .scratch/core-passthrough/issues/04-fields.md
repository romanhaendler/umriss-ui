# 04 - The combobox family and the pickers

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/core-passthrough/spec.md`

## Scope

`Combobox`, `MultiSelect`, `DatePicker`, `DateRangePicker`, `DateTimePicker`,
`DateTimeRangePicker`: the ref on the field's wrapper, `...rest` on it, the
field id from `FormField` untouched.

## Acceptance

- The guard is green for all 21; the principle's "Not yet met" list in core's
  README is gone.

## Comments

`Combobox` and `MultiSelect` put ref, class and rest on their field wrapper;
the four pickers on the span around trigger and cross, through
`RangeTrigger`. The spec calls the wrapper "the element that carries the ring":
that holds for `MultiSelect`, whose field shows the ring on `:focus-within`;
for the combobox and the pickers the ring is on the input or button inside,
and the wrapper is the field's outermost element - the one a caller lays out.
The field id from `FormField` stays on the input or button. `MultiSelect`'s
field composes a caller's `onClick` and `onKeyDown` (caller first,
`preventDefault` stops the field's own). Guard green for all 31; rule 1's list
in the README is replaced by what the rule now says. Core's screenshot and
own-base suites (`ui-light`, `ui-dark`): 384 passed, 104 skipped, no baseline
moved.
