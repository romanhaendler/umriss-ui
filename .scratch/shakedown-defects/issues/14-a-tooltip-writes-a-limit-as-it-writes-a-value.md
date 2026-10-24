# 14: A tooltip writes a limit as it writes a value

Spec: `.scratch/shakedown-defects/spec.md` (Charts)
Finding: `operator-screens.md` 1

**What to build:** a limit row in the tooltip, and the same limit in the
keyboard readout, is written as a value of its y axis: in the axis's
`tickFormat` when the caller gave one, else in the value format the tooltip
uses for series. LL 0.5 reads 0.5 and HH 4.8 reads 4.8 on an axis whose ticks
step by 1. `LimitLine` and `LimitBand` get no `format` of their own.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first (charts' tooltip-limits jsdom test): LL 0.5 and HH 4.8 on an axis stepping by 1 read 0.5 and 4.8
- [ ] With a `tickFormat`, limits read in it, as series values do
- [ ] The keyboard readout says the same as the tooltip
- [ ] `pnpm check charts` green
- [ ] Finding 1 struck from `.scratch/shakedown/operator-screens.md`
