# 26: Alarms - the priority at 375 px

Status:     done
Blocked by: None (can start immediately)

Source: earlier-runs-open 10-28 p6-6.

- [x] At 375 px every alarm row shows its priority without scrolling sideways (the priority mark in the first column, or the column first) - priority is what an operator reads first.
- [x] `alarms/tests-visual/small-looks.spec.ts` covers it at 375 px; `pnpm check alarms`.

## Comments

**Delivered (2026-10-31, run coordinator).** The Priority column comes first (DOM and reading order
match), so at 375 px every row's priority is in view; a `@quick` case in `small-looks.spec.ts` checks
every mark lies inside the scroller. Looked at 375 px (light) and desktop (dark): reads cleanly, the
alarm name follows. Decided: the column first at every width, not a CSS reorder.
