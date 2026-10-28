# 03: The alarm list takes its name, a long state ends in an ellipsis, the banner time stays on one line

**What to build:** Two alarm lists on one screen read their own names: the caller's `aria-label` / `aria-labelledby` reach the grid, as ADR-0068 routes names in a composite; the wording's "Alarms" stays the default. A long lifecycle state (a third language is 35 % longer) ends in an ellipsis with the full text available to pointer and screen reader instead of being cut mid-word. The AlarmBanner's time does not wrap its "AM" at 375 px. Spec: `../spec.md` ("AlarmList name", "Smaller looks"); repros: `../personas/p3-petra.md` 2, `../personas/p13-third-language.md` 5 and 6.

**Blocked by:** 02 (the same component)

**Status:** ready-for-agent

- [ ] A component test: `aria-label="Line 1"` names the grid "Line 1"; without it the grid is named by the wording
- [ ] A browser test: a state text wider than its cell shows an ellipsis, and the full text is reachable (title or accessible name)
- [ ] A browser test at 375 px: the banner time is one line
- [ ] Reproduce the ellipsis and wrap findings first; report any that do not reproduce
- [ ] Commit body: `Changelog alarms Fixed:` lines
