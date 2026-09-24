# 03 - Overlays and composites

Status: ready-for-agent
Type: task
Blocked by: 01

Spec: `.scratch/core-passthrough/spec.md`

## Scope

`Modal`, `ConfirmDialog`, `CommandPalette`, `Tabs`, `TreeView`, `TreeSearch`
(P1-P3). A caller's handlers compose with the component's own.

## Acceptance

- The guard is green for these six; the existing keyboard tests stay green.
