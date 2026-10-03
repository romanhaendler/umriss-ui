# 02: Long tables fold their secondary groups, and a fold never hides a target

Status: done
Blocked by: 01 (Props are grouped and ordered by one rule everywhere)
Spec: `.scratch/props-table-hygiene/spec.md`

**What to build:** A table of more than 15 rows shows each secondary group as a closed native disclosure whose summary names the group and its count ("Events · 12"); at 15 rows or fewer every group is open and plain; Main never folds; the content is in the prerendered HTML either way. When an address's anchor names a row inside a closed group, the shell opens the group before scrolling to the row, on a full load and on an in-app jump.

- [x] Table-model fixture: a 16-row table folds its secondary groups, a 15-row one does not.
- [x] Shell suite: an address whose anchor names a row in a closed group opens the group and shows the row in the viewport, on a full load and after an in-app jump.
- [x] The Markdown writer writes every group as a sub-heading with its rows.
- [x] The folds are keyboard-operable and pass the shell suite's axe run.

## Comments

Delivered:

- `tableHtml` in `packages/demo/src/tooling/apiTable.ts` folds when a table has more than 15 rows (`FOLD_OVER`). Then each secondary group is a closed `<details class="apiFold">`, and its `<summary class="apiGroupTitle">` reads "Events · 4". At 15 rows or fewer every group keeps its `<h4>`. Main never folds. The model is unchanged. Folding is decided in the HTML writer from the group's title and the table's row count. The Markdown writer still writes every group as a `######` sub-heading.
- Every row has the id `<Type>-<prop>` (`TableProps-onCellEdit`), with `scroll-margin-top` for the sticky header. Before this, no anchor could name a row, so nothing could point into a fold. The id is the one `props-to-examples` specifies. The name link, "Shown in" and the built-site guard are still that spec's 01.
- `Shell.tsx` opens every closed `<details>` around the target before `scrollIntoView`. The same effect runs on a full load and on every in-app move, and it reaches any id, not only rows.
- `page.css`: the summary is at least 24 px tall and fits its content, and it has the focus ring with a transparent outline for forced colours.

Folding today hits PopoverProps (core, 16 rows), TableProps (table, 20) and ScheduleProps (schedule, 28). BoxPlotProps (19) and TableSnapshot (41) have only main rows, so nothing folds there.

Tests:

- `tests-unit/apiTable.test.ts`:
  - A 16-row fixture folds its three secondary groups, closed, with "Events · 2" and so on. All 16 rows are in the HTML and Main is not folded.
  - A 15-row fixture stays plain, with `h4`s.
  - The Markdown of the 16-row fixture has the same sub-headings and rows as the HTML.
  - Rows carry `<Type>-<prop>`.
- `packages/demo/checks/shell.ts` has a new probe, `foldedRow`, set for core (`popover`), table (`first-table`) and schedule (`schedule`). Three tests use it:
  - An address naming the row opens its fold and shows the row, on a full load.
  - The same holds after a clicked link moves without a reload.
  - The fold opens with Enter, and axe over `.apiTables` (with the page suite's tolerated colour pairs) is clean with the fold closed and open.
- lint, typecheck and test:unit are green.
- Playwright, shell and page suites in ui-light, table-light and schedule-light: 112 passed, 2 skipped, 1 failed. The failure is `a moved address lands on the page` in table-light (`/table/` lands on the scenarios page). It fails the same way with `packages/demo/src` reset to main, so it does not come from this change. The new fold tests fail against main's `src` on both the full load and the jump, so the shell change is what makes them pass.

Baselines moved: none. The pictures that show an API table (`drawer-beside-a-service-list`) show DrawerProps, which has fewer than 16 rows.

Deviations: the row ids come in here and not in `props-to-examples` 01, because the shell test needs a target inside a fold. Folding is a writer decision (`tableHtml`) and not a field on the model, as the spec's "folding is an HTML matter" puts it. The table-model fixture tests it through `tableHtml`.
