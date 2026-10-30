# 09: The alarm list pages in a sized pane

Status:     ready-for-agent
Blocked by: 03, 04, 06

Spec: `../spec.md`, user stories 54-55, decision "The alarm list".

**What to build:** `AlarmList` in a pane of definite height, without
`maxHeight`, fills the pane and pages with a fitted page instead of
scrolling, so that new alarms do not roll the list away under the operator
(NUREG-0700 4.2.8-4 prefers paging). The rule of ticket 06 - no re-cut while
focus is in the rows - covers the operator at work.

- [ ] Without `maxHeight` and when the table is `framed`, the alarm list renders a Pagination and its page is the fitted page; the wrapper around its table passes the height on.
- [ ] With `maxHeight` it scrolls virtually, as today; in flow it renders every row, as today.
- [ ] While focus is in the list's rows a resize does not re-cut its page.
- [ ] The alarm list's docs say how it behaves in a sized pane; API.md regenerated.
- [ ] Tests in the alarms' tests: pages in a sized pane; virtual with `maxHeight`; all rows in flow.
- [ ] `pnpm check alarms` and `pnpm check:site` pass; the alarms demo looked at as a user and its screenshots accepted.

## Comments
