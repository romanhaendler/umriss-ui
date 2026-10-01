# A box carries its outliers

Status: accepted
Date:   2026-10

A box plot's outliers are a list per box, and its length differs from box to
box. A materialised series is parallel `Float64Array` channels with one number
per point (ADR-0011); a list does not fit one.

The alternative was a composition: `<BoxPlot>` registers its boxes and, beside
them, a `Scatter` of the outliers with data of its own - rows of x and value -
as `ControlChart` registers its violations. No new channel shape, no new hit
case. It costs a second legend entry for every box series ("outliers of X"),
a colour that has to be kept equal to the box's through the name, a legend
toggle that hides the boxes and leaves their outliers standing, and a caller who
has the outliers per group already and must flatten them into a second dataset.

**The box carries its outliers.** `outliers` is an accessor returning an array
per datum, and it materialises into two named channels: one flat array of the
values and one of offsets, a box's outliers standing from its offset to the
next. Both are null for every other kind.

## Consequences

The materialised series is no longer one number per point throughout. The two
channels are named for what they hold, as ADR-0011 asks, and the test that keeps
every channel null for the kinds that do not use it covers them as well.

An outlier is never a hit of its own: it is read in its box's tooltip and table
row. Whoever needs to point at a single outlier draws a `Scatter` over the box
plot - the composition rejected here stays available to the caller.

A far-out outlier (beyond three IQR) is not a third channel: it is derived when
drawing from the box's own quartiles.
