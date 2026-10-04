# 08: `useSchedule`

**What to build:** The schedule is declared like the table and the chart: `useSchedule(options)` hands back `Schedule` and its parts. It binds no row type - its subtasks, tasks and lanes are the library's types; what it gains is the place where the view and its setters will stand (`component-view` 07). The ref handle stays. The free `Schedule` goes in the same ticket - the schedule's callers are few enough to move at once.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Every schedule example, scenario and test uses `useSchedule`
- [ ] Which parts are returned and which stay free imports is recorded in the ticket
- [ ] Every suite green; screenshots unchanged
