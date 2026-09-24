# 03 - Overlays and composites

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/core-passthrough/spec.md`

## Scope

`Modal`, `ConfirmDialog`, `CommandPalette`, `Tabs`, `TreeView`, `TreeSearch`
(P1-P3). A caller's handlers compose with the component's own.

## Acceptance

- The guard is green for these six; the existing keyboard tests stay green.

## Comments

The six forward their ref; `ModalHeader`, `ModalBody`, `ModalFooter`,
`TabList`, `Tab`, `TabPanel`, `MenuItem` and `MenuSeparator` came along (see
01). Where the component keeps its own ref on the same element (the dialog's
choreography, the tab list's indicator, the tree's row window) the two meet in
`lib/mergeRefs.ts`, which also replaced the hand-written copies in `RadioGroup`
and `Tag`. `Modal` and `CommandPalette` take `...rest` now and compose a
caller's `onCancel` and `onMouseDown` with their own - the caller first, and a
`preventDefault` keeps the window standing; `ConfirmDialog` hands its rest to
the `Modal`. `TreeView`'s role stands after `rest`. Tests in
`callerHandlers.test.tsx`; the keyboard suites (unit and `features-tree`) stay
green.
