# 03 - What the application writes itself, shown in the demo

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/root-contract/issues/09-scroll-to-a-lane-and-a-subtask.md` (`scrollToLane`, and the hook's
`visibleDomain` from 06 that it follows)
Spec: `.scratch/schedule-keyboard-and-reader/spec.md`

## What to build

The "never" answers of the triage, each shown in a few lines of application code in the schedule's demo.
Each example passes the shell's page rules, names in its lead what the schedule offers and what the
application writes, and uses `aria-label`, not `ariaLabel`.

- **Zoom and fit buttons**, a new example on the pan and zoom page. Three buttons beside a schedule:
  - "Zoom in" and "Zoom out" halve and double the span in view around its middle, read from the hook's
    `visibleDomain`, and kept within the limits the example passes as `zoomLimits`;
  - "Fit" calls `setDomain(null)`.
- **Undo**, a new page.
  - The application applies every intent and keeps the plan before it on a stack. Ctrl+Z (⌘Z on a Mac) and
    an "Undo" button pop it.
  - The key is the page's, not the plot's: the plot leaves Ctrl to the page.
  - The lead says that the history is the application's (ADR-0023, ADR-0032).
- **Start-to-start**, in the undo example. One dependency with a negative lag stands for "may start an
  hour after the other starts". It is drawn apart with its own `route` and `ends`, and the lead says why a
  negative lag is the way to write it.
- **The critical path**, a new example on the dependencies page. The application holds the path as subtask
  ids, as its planning system would hand them over. A switch marks it: every subtask off the path gets
  `"muted"`. The example computes no path.
- **A lane highlight**, a new example on the lane page. A list of lanes beside the schedule. Picking one
  puts a `Badge` into that lane's `label` and brings it into view with `scrollToLane`.
- **The findings list** with "go to" is root-contract 09's example; this ticket adds none.

## Acceptance criteria

- [ ] The four new examples render in the demo, and the demo's smoke and silent-pages tests pass.
- [ ] One Playwright check on the undo example: a drag moves a bar, Ctrl+Z puts it back.
- [ ] Each example's code reads as an application would write it: no import from the schedule's sources
      beyond its public entry.
- [ ] `pnpm check schedule`, `pnpm check:site` and `pnpm test:visual:quick schedule` pass; new examples
      get their screenshots if the shell's screenshot suite asks for them.
