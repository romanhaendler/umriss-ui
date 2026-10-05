# 02 — A checkbox and a switch in a field stand on the field line

Status: ready-for-agent

Blocked by: 01

Spec: `.scratch/field-row-alignment/spec.md`

## What to build

A checkbox or a switch inside a `FormField`, standing in a row of fields, sits
on the field's centre line as the horizontal radio group does after 01: the
height of a control at its size, its own label on the select's baseline, its
hint or error below as today. Standing outside a `FormField` - a list of
checkboxes, a settings panel - both stay exactly as compact as they are.

## Acceptance criteria

- [ ] The row-of-fields example from 01 gains a checkbox in a field and a switch in a field, at `md` and at `sm`
- [ ] The layout test measures both on the field line within 1 px, at both sizes
- [ ] The layout test measures that a list of checkboxes and a switch outside a field keep today's height
- [ ] A hint or error under a checkbox or switch in a field still stands below it
- [ ] Changed screenshots are reviewed and updated, not suppressed
- [ ] Lint, types, unit, build and visual pass
