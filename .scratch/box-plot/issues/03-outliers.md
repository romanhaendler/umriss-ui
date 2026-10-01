# 03: Outliers

Spec: `.scratch/box-plot/spec.md`

**What to build:** a caller passes `outliers` as an array per datum and sees
them as points with their box, in its colour; one beyond three IQR of the box's
own quartiles is a ring. They pull the extent, are never hits of their own, and
are read in the tooltip as a count and their values, cut after five ("and N
more"), and in a data table column that appears only when given.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Two named channels (values, offsets) per ADR-0040, null for every other kind; gaps and empty arrays in `materialize.test`
- [ ] jsdom: the cut after five in both wordings, the column only where given, extent including outliers, `hidden` hides them with the box
- [ ] Demo example "with outliers" including far-out ones; baselines light and dark

## Comments
