# 03: Outliers

Spec: `.scratch/box-plot/spec.md`

**What to build:** a caller passes `outliers` as an array per datum and sees
them as points with their box, in its colour; one beyond three IQR of the box's
own quartiles is a ring. They pull the extent, are never hits of their own, and
are read in the tooltip as a count and their values, cut after five ("and N
more"), and in a data table column that appears only when given.

**Blocked by:** 01

**Status:** done

- [x] Two named channels (values, offsets) per ADR-0040, null for every other kind; gaps and empty arrays in `materialize.test`
- [x] jsdom: the cut after five in both wordings, the column only where given, extent including outliers, `hidden` hides them with the box
- [x] Demo example "with outliers" including far-out ones; baselines light and dark

## Comments

**2026-10-01, agent:** Built. `BoxChannels.outliers` (flat) and
`outlierOffsets` (a `Uint32Array` of n + 1, box i's from offsets[i] to
offsets[i + 1]); both null without the accessor. A non-finite value in a list
is left out; a gap's list is not read. The tooltip and the table write them
top to bottom as drawn (largest first), five, then "and N more"; no row where
a box has none. The demo example uses literal numbers: the operations world's
hourly latency has no outliers under 1.5 IQR - its surge is a quarter of an
hour's values.
