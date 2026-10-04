# 01: Prefactor: the scene reads view state through one seam

**What to build:** The chart's scene asks one place whether a series is hidden, whether an x axis may zoom, and where a proposed domain goes, instead of reading the series' `hidden` and the axis' `onDomainChange` wherever it needs them. Nothing a caller sees changes; the view tickets of `component-view` then change that one place.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Every read of a series' hidden state and of an axis' zoom handler in the scene goes through the seam
- [ ] All existing unit, interaction and screenshot tests pass unchanged
