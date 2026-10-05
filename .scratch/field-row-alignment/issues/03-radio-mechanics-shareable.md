# 03 — Prefactor: the radio mechanics can be shared

Status: ready-for-agent

Blocked by: None (can start immediately)

Spec: `.scratch/field-row-alignment/spec.md`

## What to build

The radio group's behaviour becomes usable by a second component that draws
differently: real radio inputs; one tab stop that sits on the chosen option, or
on the first selectable one; arrow keys that move and choose, skip disabled
options and wrap; controlled and uncontrolled; the surrounding `FormField`'s
id, description, required and invalid state on the group. The radio group
draws and behaves exactly as before. One behaviour in one place - the
segmented control (04) builds on it rather than copying it.

## Acceptance criteria

- [ ] The radio mechanics are reachable from another core component without going through the radio group's drawing
- [ ] Nothing about it is exported from the package
- [ ] Every existing radio group test passes without being changed
- [ ] The radio group's screenshots are unchanged
- [ ] Lint, types, unit, build and visual pass
