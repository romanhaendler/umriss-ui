# 06 - The table's tip for a cut value follows

Status: ready-for-agent
Type: task
Size: S

Blocked by: 05
Spec: `.scratch/toasts-above-a-modal/spec.md`, "The tooltip takes the same
way" (the table's tip), Testing Decisions seam 3; user story 49

## What to build

The tip that shows the whole of a value the table cut is drawn on the
tooltip's token and portals into the dialog its table stands in. Inside a
modal dialog it lies above the toasts, as the tooltip does since ticket 05.

- The table repeats the step by hand, as it repeats the order of portal
  targets by hand today: the same attribute under the same two conditions, the
  tip shown before it is measured, the same sheet taken back. It takes the
  form ticket 05 settled. Core gains no export for it.
- Outside a dialog, and without the Popover API, the tip is as it was.

No page shows a table in a dialog, and a page built for a repeated step would
cost more than the step. So this is the one place where a test supplies the
Popover API itself. That a tip shown this way lies above the toasts is proven
once, for the tooltip, in ticket 05.

## Acceptance

- [ ] In the table's unit tests, a table inside a `<dialog>` with the Popover
      API supplied by the test: the tip of a cut value is a manual popover and
      has been shown before it is measured.
- [ ] Without the API, and outside a dialog, the tip carries no `popover`
      attribute; every existing test of the tip passes unchanged.
- [ ] No existing screenshot of the table moves.
- [ ] `pnpm check table` and `pnpm test:visual:quick table` pass.
