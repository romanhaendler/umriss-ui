# 03: The schedule's tree: First schedule in Getting started, Findings folded into Reading

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/sidebar-tree/spec.md`

**What to build:** In the schedule demo:
- `First schedule` stands in Getting started after Installation, so the path to the first plan ends with a plan.
- Plan opens with Lanes.
- The one-page rubric Findings disappears, and "Findings as data" becomes Reading's last page.
- No address changes.

- [x] The schedule's sidebar shows Getting started (Installation, First schedule), Plan opening with Lanes, and Reading ending with Findings as data. There is no Findings rubric.
- [x] Every schedule page keeps its address.
- [x] Shell suite probes for the schedule are updated and green.
- [x] Only `page-*` images whose rubric label changed move; no `example-*` image changes content.

## Comments

**Delivered.** `packages/schedule/demo/outline.ts`: `schedule` ("First schedule") stands in Getting started after Installation, so Plan opens with Lanes. The rubric `findings` is gone and its one page, "Findings as data", is now the last page of Reading. Every page id is the same as before, so no address changes. The outline's head comment now gives the new reading of the rubrics. The rubric sentences stay as they were: Getting started keeps "before the first plan", as the table's keeps "before its first table" with First table inside it. Sidebar, page heads, palette groups and `llms.txt` all derive from the outline. No other file was edited to follow it, and no README or prose named the Findings rubric.

**Tests.** The shell probes in `packages/schedule/tests-visual/features-shell.spec.ts` now check the new tree:
- the neighbours are Installation → First schedule, both in Getting started;
- the palette probe looks for "findings as data" and expects the rubric "Reading".

Results: `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` are green. Playwright for schedule-light and schedule-dark (shell, page, screenshots, accessibility) gave 243 passed and 27 skipped.

**Baselines moved: 4 of 54 `page-*` images, the two whose rubric label changed, each in light and dark.** They are `page-schedule-*` ("Plan" → "Getting started") and `page-findings-*` ("Findings" → "Reading"). Both images were looked at. The label is small enough to stay inside the 0.001 tolerance, so I rewrote these four with `--update-snapshots=all`; otherwise the baselines would still show the old label. No `example-*` image changed.
