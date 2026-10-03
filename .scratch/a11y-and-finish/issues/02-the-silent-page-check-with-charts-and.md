# 02: The silent-page check, with charts and calculation filled

Status: ready-for-agent
Blocked by: 01 (Pages can say their keys and their accessibility)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** A browser check in the shell's checks, called by a demo with every page like the own-base check: inside the example stages, anything in the tab order requires a Keyboard section (own table or `keysOf`); anything with `aria-live` or a role of status, alert, log, timer, progressbar or meter requires an Accessibility section. Exceptions stand in the check, each with its reason. Wired into charts and calculation, whose pages are filled: every chart page gets `keysOf: ["chart"]`; tree, chain, given, metrics, what-can-go-wrong and worked-examples get `keysOf: ["calculation"]`; the Calculation page gets its Accessibility section.

- [ ] Removing one `keysOf` from a chart page makes the check fail naming the page
- [ ] The check passes on every page of charts and calculation; every exception carries a reason
- [ ] Axe passes on one charts page with the new sections
