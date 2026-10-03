# 06: Scenarios behave and fit on a phone

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** Three finishing items on the scenarios pages. The scenario's Code toggle becomes the example's toggle (same chevron, class, name "Code", `aria-expanded`). Below a stage width of 640 px a stage gets a left gutter one mark wide and every callout mark stands in it at its element's top edge. A table scenario pins its action column only while its stage is at least 640 px wide, reading the width itself; narrower, the table scrolls inside its box.

- [x] Shell suite: a scenario toggle and an example toggle have identical markup apart from their ids
- [x] At 390 px, on all five scenarios pages, no mark's box intersects any text box in its stage
- [x] At 390 px no table scenario has a pinned block and no page scrolls sideways; from 640 px nothing changes
- [ ] Screenshot baselines of the scenarios pages renewed

## Comments

**Delivered.**

- **Toggle.** `CodeToggle` in `packages/demo/src/Example.tsx` is the one toggle (chevron, `exampleToggle`, "Code", `aria-expanded`, `aria-controls`); the titled examples, the hero's foot and `Scenarios.tsx` all render it. The scenario's toggle keeps its place under "Built from".
- **Marks.** The stage measures its own width; below 640 px it carries `data-narrow`, `page.css` gives it a left gutter one mark wide (`--u-space-4` + 20 px) and puts every mark in it (`left: --u-space-2`, no corner offset), level with its element's top. Two spots on one line (a search and a column menu in one toolbar) would share a place there, so a later mark steps down by a mark's height. From 640 px the corner placement is unchanged.
- **Tables.** The library pinned the actions column always, so there was nothing a scenario could decide: `RowActions` takes `pin` (default `true`; `false` leaves the column in the flow; an end-pinned column still takes it along, and an open Row draft's Save still sticks, ADR-0036). Table CHANGELOG entry under Unreleased/Added. Scenarios `find-a-late-shipment` (`<RowActions pin={wide}>`) and `plan-the-team-capacity` (`pin={wide ? "start" : undefined}` on Person) carry a `useWide()` hook of their own, a ResizeObserver on their root that compares with 640 px, so the copied code shows the pattern.

**Tests.** `pinnedColumns.test.tsx`: `pin={false}` pins nothing, the default pins the actions at the end, and an end-pinned column takes them along. Shown red with the old `end` rule. Shell suite (`packages/demo/checks/shell.ts`, all five demos): the scenario toggle's `outerHTML` equals a titled example's apart from `aria-controls`; at 390 px no mark's box crosses a visible text box of its stage or another mark, no stage has a pinned cell, and the page does not scroll sideways; at 1280 px every stage is at least 640 px wide without `data-narrow`, and the table's `find-a-late-shipment` keeps a pinned cell (new probe `pinnedScenario`). Before the change, a probe at 390 px found marks on text in every one of the five demos and pinned blocks in two table scenarios. Runs under the lock: `features-shell` and `features-page` in the five light projects; scenario screenshots, `pinning` and the pin tests of `features-browser` in the five light projects and table-dark. All green except `a moved address lands on the page` in charts-light and table-light, which fails from main's routing (97678e09/8a00cb3d) and is untouched by this diff. `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green. The table demo smoke test's Grouping page times out at 5 s under load average ~55, also with main's sources, and passes with `--testTimeout=30000`.

**Baselines moved: none.** The scenario pictures show only the stage at 1280 px, where nothing changes. They were run in the five light projects and table-dark and passed unchanged. No picture shows a scenario's toggle or a narrow stage, so the fourth box has nothing to renew. The phone layout is held by the measurements above.

**Deviations.** A library prop (`RowActions pin`) the ticket did not name. Without it the action column could not be unpinned. The marks switch at a stage border box of 640 px, while the scenario's hook measures its own root, which is the stage's content box, 32 px narrower. So between 640 and 672 px the table already scrolls whole while the marks still stand at their corners.

