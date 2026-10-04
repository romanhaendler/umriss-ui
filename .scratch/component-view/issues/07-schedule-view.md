# 07: Schedule: the view

**What to build:** A schedule's view is `{ domain, folded }`, handed in through `initialView` (applied by content) and reported whole through `onViewChange`; on `useSchedule`'s return value stand `view`, `setDomain`, `toggleGroup`, `foldAll`, `unfoldAll`. Without a domain in the view the schedule shows its subtasks' extent within `zoomLimits` (confirmed 2026-10-04). `initialDomain`, `collapsedGroups`, `defaultCollapsedGroups`, `onCollapsedGroupsChange` and `onDomainChange` go; the selection stays as it is. The demo gets the page 'View', and 'Linked schedules' keep step through the view.

**Blocked by:** `charts-bound-to-rows` 08 (`useSchedule`)

**Status:** ready-for-agent

- [ ] Model tests for the view, the default span and unknown groups falling out
- [ ] Two schedules in step without a remount
- [ ] Page 'View' with screenshots
