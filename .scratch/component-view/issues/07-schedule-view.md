# 07: Schedule: the view

**What to build:** A schedule's view is `{ domain, folded }`, handed in through `initialView` (applied by content) and reported whole through `onViewChange`; on `useSchedule`'s return value stand `view`, `setDomain`, `toggleGroup`, `foldAll`, `unfoldAll`. Without a domain in the view the schedule shows its subtasks' extent within `zoomLimits` (confirmed 2026-10-04). `initialDomain`, `collapsedGroups`, `defaultCollapsedGroups`, `onCollapsedGroupsChange` and `onDomainChange` go; the selection stays as it is. The demo gets the page 'View', and 'Linked schedules' keep step through the view.

**Blocked by:** `charts-bound-to-rows` 08 (`useSchedule`)

**Status:** done

- [x] Model tests for the view, the default span and unknown groups falling out
- [x] Two schedules in step without a remount
- [x] Page 'View' with screenshots

## Comments

**2026-10-04, delivered.** `useSchedule({ initialView, onViewChange })` with `ScheduleView = { domain?, folded? }` (src/view.ts: `viewKey` - the fold compared as a set, an empty one as none -, `onlyKnown` for groups, `defaultSpan`). The scene holds the view: the span the view names in wall-clock time (null = the subtasks' extent, lead times included, widened or narrowed around its middle into `zoomLimits` in working time; fitted once per absence, not after every data change, so a dragged bar does not make the plan jump; without subtasks the local day of today) and the folded groups. A pan or zoom enters the view once per frame, as `onDomainChange` did. `useSchedule` builds one scene per call and binds `Schedule` to it once, so the parts keep their identity; `view` comes through `useSyncExternalStore`, a view handed in applies in a layout effect when its content differs from the last one handed in (and not at all when it equals the current view), `onViewChange` fires after the commit once per change, the start unreported. On the return value: `view`, `setDomain(span | null)`, `toggleGroup`, `foldAll`, `unfoldAll`. Gone: `initialDomain`, `collapsedGroups`, `defaultCollapsedGroups`, `onCollapsedGroupsChange`, `onDomainChange`; `selectedTask`/`onSelectedTaskChange` and `zoomLimits` stay. Exported: `ScheduleOptions`, `ScheduleView`; `ScheduleParts` now includes the view and setters.

Tests: `tests-unit/view.test.ts` (model), `tests-unit/scheduleView.test.tsx` (default span, view by content, what a view leaves out, unknown groups, one report per change and per frame of wheel steps, folding through setters, stable parts, two schedules in step without a remount); the type test refuses `initialDomain` and `collapsedGroups`. Browser: 'a view kept outlives a reload and comes back on restore'; the linked schedules now also agree once the pan rests and the lower plot stays mounted.

Demo: page 'View' (Reading, before 'Linked schedules') with "Keep and restore a view" - kept in localStorage across a reload, restored by handing it back, "Show the whole plan" = `setDomain(null)`. 'Linked schedules' use one `useSchedule` per schedule and a shared view. Lane groups: 03 'controlled' became 'fold-from-outside' (setters, `view.folded`), 05 and the miniature start from `initialView.folded`. Every other example and scenario took its span into `initialView`. Pictures renewed (all inspected): new - page view, example view--keep-and-restore, lane-groups--fold-from-outside, forced view--keep-and-restore; changed text - page heads lane-groups, pan-and-zoom, linked-schedules, handle, examples lane-groups--start-with-groups-folded, linked-schedules--in-step; moved by a pixel under the changed page text only - examples lane-groups--a-group, lane-groups--the-miniature, linked-schedules--rota-beside-incidents, pan-and-zoom--pan-and-zoom and forced lane-groups--a-group, linked-schedules--in-step, pan-and-zoom--pan-and-zoom; light and dark each. Removed: example lane-groups--controlled.

The README's own example and the paragraph on folding moved to the view. The CHANGELOG entry is 08's.
