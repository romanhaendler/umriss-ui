# 07 - Final polish round

Status: done
Type: task

Spec: `.scratch/core-foundations/spec.md`

## Scope

The visible result goes to the user as a rendered before/after page (the
review page pattern of visuelle-wertigkeit 05): every surface of this spec in
light and dark, each decision a card. Spacing, tracking and optical corrections
are settled by the agent; new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

Delivered on the user's decisions from the review page (every card taken as recommended):

- **progress-indeterminate**: the indeterminate bar's segment rests centred (`margin-inline: auto`) with ends fading out of a gradient in the accent, and sweeps ±217% of its own width from there - the same path and speed as before. With animations off (the screenshots) it no longer reads as a share done. Under forced colours the fill stays a plain `Highlight`.
- **breadcrumb-fold**: the "…" key stays a ghost key with no surface at rest; it is now `--u-control-height-sm` tall and at least as wide, and its dots carry a dotted underline. Deviation to note: the breadcrumb's links have no underline today (`text-decoration: none`), so the dotted underline stands on the fold key alone; the links were left as they are. A folded trail is 26px tall, an unfolded one keeps its line height.
- **slider-invalid**: `aria-invalid="true"` (set by `FormField` with an error) draws the track with the fields' danger edge (`0 0 0 1px var(--u-color-danger)`, WebKit and Gecko tracks); the thumb is unchanged. The Slider is in the ISA-101 register now (`verdictColour.test.ts`, which failed first). No demo example rests in the invalid state, so it was looked at in the browser, not photographed.

Baselines moved: `example-progressbar--counts-and-the-unknown` and `example-breadcrumb--folded-when-narrow`, light and dark - each looked at. Nothing else of this spec moved.
