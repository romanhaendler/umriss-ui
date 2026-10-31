# 39: Server mode groups - fold, select, export and keyboard

Status:     done
Blocked by: 38

Spec: `../spec.md`, decision 9.

**What to build:** a grouped server-mode table works like a grouped table in the browser for everything a
user does with groups.

- [x] Folding or opening a group sends one request with the new `folded`; until the answer the group's header shows its new state and its rows dim (the `answers` rule of ADR-0072).
- [x] A fitted page (ADR-0080) counts group lines like rows; select all on a page and "all that match" keep their meaning; a group's own checkbox (as in the browser's grouping) selects the group as a state in the request's terms (`{ request, group: path }`), passed to bulk actions.
- [x] `exportRows(request)` receives the grouping, and the export writes the rows in the groups' order (ticket 20's rule for grouped exports).
- [x] Keyboard and ARIA: group header lines are reachable rows in grid mode, `aria-rowcount`/`aria-rowindex` count lines over every page, fold is announced (ticket 21's announcer).
- [x] Unit tests and a `@quick` browser case; `pnpm check table`, `pnpm check:site`.

## Comments

**From ticket 38.** Left to this ticket: (1) `foldAll`, `unfoldAll` and Alt+click on a fold act only on the groups of the page the table holds; (2) no group selection box is drawn in server mode (GroupCheckbox returns null; the group holds rows the table does not); (3) export of a grouped page and of all matches under a grouping; (4) keyboard for server groups was not touched, and the fitted-page anchor (`pageKeeping` in server mode) counts rows, not lines. Groups are read by `answeredLines` (model/grouping.ts) into the browser's `Line` model; `request.folded` uses the view's path strings, `groupPath(values)` writes them.

**Delivered (2026-10-31, run coordinator).** A fold sends one request; `foldAll`/Alt+click folds the
page's groups in one request and keeps other pages' folds; a group's box chooses the group like "all
that match" scoped to it - its rows show ticked, unticking adds to `except`, the box goes indeterminate,
a bulk action receives `{ request, except, group }` (first built without the rows ticked - the screen
contradicted itself; the coordinator asked for this shape); export asks for every match in the groups'
order; group lines are grid rows reachable by arrows; a fitted server page anchors by lines. ADR-0082,
README, tests, `@quick` case. Looked at in light and dark. Decided: a new server option `matchCount`
(rows that match, as `rowCount` counts lines while grouped); one group chosen at a time; fold all acts on
the groups of the page held. Left: the selected-row tint stops before the actions column in this example
(review fix list).
