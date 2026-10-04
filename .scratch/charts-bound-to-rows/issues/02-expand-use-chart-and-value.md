# 02: Expand: `useChart` and `value` beside the old shape

**What to build:** A developer can write a chart as they write a table: `useChart(rows)` hands back `Chart`, `XAxis`, `YAxis` and every series kind typed at the row, and a series or axis names its value as `value` - a field name or a function (ADR-0048). A series with its own `data` is typed by that `data`. Named channels (`baseline`, the box channels) take the same two forms. A field name is compared by its name, so changing it updates the chart. The free parts and `accessor` keep working beside it, so nothing else breaks yet; `data` on `<Chart>` stays accepted until the contract.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Type tests: an unknown field fails, a field of the wrong type fails, a field of another row type fails in a series with its own `data`, a function still works
- [ ] The parts the hook returns keep their identity across renders
- [ ] Switching `value` from one field to another redraws the series
- [ ] One example written in the new shape (the first chart of the Installation page)
- [ ] All existing tests pass unchanged
