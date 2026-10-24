# 03: A click inside a dialog's panel leaves the Modal open

Spec: `.scratch/shakedown-defects/spec.md` (Core: backdrop)
Finding: `core.md` A2

**What to build:** in a Modal or Drawer, a click on a date in a DatePicker, on
a MenuItem, or anywhere inside a Popover or Tooltip opened from the dialog
does what it should and leaves the dialog open. A press counts as backdrop
only where it lands on the dialog element itself or one of its two spacers.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first: a unit test presses inside a Popover, a Menu and a DatePicker panel opened inside a Modal and a Drawer; the dialog stays open
- [ ] A press on the backdrop and on either spacer still closes; `closeOnBackdrop` off still never closes
- [ ] A caller's `onMouseDown` that prevents default still keeps it open
- [ ] `pnpm check core` green
- [ ] A2 struck from `.scratch/shakedown/core.md`
