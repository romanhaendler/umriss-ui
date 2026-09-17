# 05 — Pareto

Status: done

Spec: `.scratch/shopfloor-instruments/spec.md`

## Scope

The standard answer to "which three reasons cost us the most", as a pure
transform plus a composition.

- **A pure module sorts, cumulates, collapses and finds the crossing.** Descending
  by value; **ties broken by input order, stably**, so two reasons with the same
  count do not swap between renders; a running cumulative share; the index at which
  that share first crosses a threshold defaulting to eighty per cent and settable
  as a parameter.
- **A long tail collapses into a remainder.** Everything beyond a caller-named rank
  becomes one entry, placed **last regardless of its value**, marked as the
  remainder so the chart can draw it distinctly. Two hundred fault reasons is the
  ordinary case.
- **Categories are indices on the numeric x axis.** ADR-0002 already decided bars
  sit on a numeric x axis and labels come through `tickFormat`. Category *n* is
  *x* = *n*. Nothing new is needed.
- **The cumulative line sits on a second y axis**, zero to one hundred per cent,
  on the right, through the axis stacking that already exists. Its points sit at
  bar centres, which on integer categories are the integers.
- **The remainder label defaults to a German word and is a prop.**
  `@umriss/charts` has no text module and this work does not introduce one for a
  single label. The asymmetry with `@umriss/ui`'s `wortlaut` is noted in the spec,
  not resolved here.

## Acceptance

Unit tests in charts.

- Sorting is descending; **ties keep input order**, asserted with a fixture
  containing three equal values in a known order.
- Cumulation reaches exactly one hundred per cent at the last entry, including
  after a tail collapse.
- The threshold crossing: a case crossing between two entries, a case landing
  **exactly** on the threshold, and a case that never crosses.
- The tail collapse: the remainder's value equals the sum of what it replaced; it
  is last even when its value exceeds that of entries before it; it is marked.
- A collapse rank beyond the number of entries produces no remainder rather than an
  empty one.
- A screenshot tile showing a collapsed remainder and a marked threshold crossing,
  in both themes.

## Notes

The remainder placed last "regardless of its value" is the rule most likely to be
implemented as "sorted like everything else". Collapsing two hundred small reasons
routinely produces a remainder larger than the third real bar, and sorting it into
third place makes the chart claim there is a fault reason called Sonstige that is
the third biggest problem. It goes last, and it looks different.

Do not build a `<Pareto>` component that owns its axes. The value here is the
transform; the composition is four lines the caller can read, and owning the axes
means owning the second axis' formatting, which is exactly what a caller wants to
control.
