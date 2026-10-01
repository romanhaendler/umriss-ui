# 05: Final polish round

Spec: `.scratch/box-plot/spec.md`

**What to build:** the visible result goes to the user as a rendered review
page: every example in light and dark, each open point of B12 (fill, median
weight, cap width, mean mark, far-out ring, notch depth) a card. Spacing and
optical corrections are settled by the agent; new tokens or visibly new colours
go as a card first.

**Blocked by:** 02, 03, 04

**Status:** done

- [x] The user has taken every card on the review page
- [x] Every moved screenshot baseline looked at individually, never rebuilt in bulk

## Comments

**2026-10-01, agent:** Review page `.scratch/box-plot/prototype/review.html`
(the seven examples light and dark, eight cards of three variants each). The
user handed every card to the agent: "look at it all extremely critically and
take only the best option". Taken, each against a precedent:

1. Fill 0.18 - the `Area` default; 0.12 loses the box on a grid, 0.28 lets
   the fill compete with the median.
2. Median 2px - one step over the 1px outline; 3px blots out a notch's
   inset ends.
3. Caps half the box wide - the convention; a third vanishes on a grouped
   box, three quarters competes with the box.
4. Mean × 3.5px - a diamond and a plus are marker shapes under encoding by
   marks (`marks.ts`) and would read as another series; × is none.
5. Dot r 3 - the `Scatter` default; ring r 3, not filled with the ground,
   so that two outliers on one value still both show.
6. Notch depth 0.2 per side - deep enough to read on a box 0.4 wide, still a
   waist and no bow tie.
7. `boxWidth` 0.8 - the `barWidth` default; a different one would make the
   DEV warning fire on every chart that mixes bars and boxes with defaults.
8. A notch beyond its quartile is drawn as given - folding outward says
   "few values"; clamping would hide exactly that.

Found only rendered, and corrected (spacing and optics are the agent's):
- 1px outlines, whiskers and caps lay between pixels and blurred to 2px;
  now on half pixels, the 2px median on whole ones (R-3.5).
- Two boxes side by side shared their touching outline; now 3px apart.
- A whisker stood one pixel beside the grid line at its x through float
  noise; its centre is now computed as the grid's, to the bit.

The open questions settled the same way: `tone` stays per series (B5: the
caller judges; a box out of specification is a series of its own judgement);
German keeps "Notch" as it keeps "Whisker"; n is written without the y
format - "120 s" would be wrong.

Note for baselines: `maxDiffPixelRatio` 0.001 keeps a baseline whose change
is a few hundred pixels - `--update-snapshots` alone left the one-pixel
whisker shift unwritten; `--update-snapshots=all` with `-g` rewrites them.
