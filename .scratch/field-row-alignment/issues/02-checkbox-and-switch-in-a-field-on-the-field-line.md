# 02 — A checkbox and a switch in a field stand on the field line

Status: done

Blocked by: 01

Spec: `.scratch/field-row-alignment/spec.md`

## What to build

A checkbox or a switch inside a `FormField`, standing in a row of fields, sits
on the field's centre line as the horizontal radio group does after 01: the
height of a control at its size, its own label on the select's baseline, its
hint or error below as today. Standing outside a `FormField` - a list of
checkboxes, a settings panel - both stay exactly as compact as they are.

## Acceptance criteria

- [x] The row-of-fields example from 01 gains a checkbox in a field and a switch in a field, at `md` and at `sm`
- [x] The layout test measures both on the field line within 1 px, at both sizes
- [x] The layout test measures that a list of checkboxes and a switch outside a field keep today's height
- [x] A hint or error under a checkbox or switch in a field still stands below it
- [x] Changed screenshots are reviewed and updated, not suppressed
- [x] Lint, types, unit, build and visual pass

## Comments

Delivered. In a field each takes the control height of its place, its first
line - the label's, or the box or track alone - on the field line. The
checkbox has no size of its own, so it reads the place's (`useControlSize`)
for that height alone. 14 baselines changed and were reviewed: the field
cases grow, and pages below them shift by a fraction of a pixel (text
anti-aliasing only - a standalone checkbox keeps its 16.9 px, measured).

Found on the way, not changed: the team scenario sets five checkboxes in one
`FormField` ("Working days"), each taking the field's id - five equal ids.
A field holds one control; a group of checkboxes there is outside the model,
and a column of them would now also spread to the control height.
