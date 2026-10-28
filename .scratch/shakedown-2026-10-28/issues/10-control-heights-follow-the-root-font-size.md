# 10: Control heights follow the root font size

**What to build:** On a 4K wall display at a raised root font size, and for a user who set a larger default font, controls grow with their text; today a 26 px button holds 22 px text at a 32 px root. The control-height tokens are written in `rem` (2rem, 1.625rem, 1.125rem - nothing moves at a 16 px root), the touch opt-in in `rem` too, and what derives from them (row pitch) follows. Spec: `../spec.md` ("Control heights follow the root font size"); repro: `../personas/p6-sven.md` 4, last run's `operator-screens.md` 2.

**Blocked by:** 09 (the touch opt-in's token rule)

**Status:** ready-for-agent

- [ ] A browser test at root 32 px: a `sm` and a `md` Button and a table row are twice their 16 px-root height
- [ ] At a 16 px root every measured height is as today (the visual suite does not move)
- [ ] The touch opt-in still gives 44 px at a 16 px root
- [ ] core's stylesheet guard (no font size by hand) stays green
- [ ] Commit body: `Changelog core Changed:` with `Migration:` (a host that raised its root font sees larger controls)
