# 08: The schedule stops a false warning, names its plot apart, and warns about times that are not milliseconds

**What to build:** A developer who copies the schedule README's smallest example (`Dependencies` before `Subtasks`) sees no warning that a drawn dependency "is left out": the unknown-subtask check for dependencies runs once every layer has registered, like the lane check beside it. The plot is named "<label>, plot", so a screen reader does not hear the caller's name twice. A subtask whose `from`/`to` are ISO strings, Dates or seconds warns once in DEV instead of silently vanishing. Spec: `../spec.md` ("Schedule dependency check", "DEV warnings for props", "Smaller looks"); repros: `../personas/p1-lena.md` 1 and 4 (`s-dep-ok-before`, `s-strtimes`, `s-datetimes`, `s-seconds`), `../personas/p13-third-language.md` 7, `../personas/p3-petra.md` 4.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A component test: the README's example in both orders logs no warning; a dependency naming a missing subtask still warns once
- [ ] A component test: with `aria-label="Plan"` the figure is named "Plan" and the plot "Plan, plot" (wording in English and German)
- [ ] A component test: strings, Dates and second-based numbers in `from`/`to` warn once each, naming the expected milliseconds
- [ ] Commit body: `Changelog schedule Fixed:` / `Added:` lines
