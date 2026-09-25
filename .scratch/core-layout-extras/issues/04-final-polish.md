# 04 - Final polish round

Status: done
Type: task

Spec: `.scratch/core-layout-extras/spec.md`

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

- **splitter-grip**: the dock's `GripGlyph`, no new glyph, centred on the separator's line - `--u-color-text-muted` at rest, `--u-color-text-secondary` under the pointer and while held; turned by 90 degrees across a stacked splitter's line (a splitter's orientation does not change while it stands, so the dock's reason against a rotation does not apply). The glyph is a few pixels, so no splitter baseline crossed the tolerance; it was looked at in the browser in both themes and both orientations.
- **splitter-f6**: F6 is left out on purpose. The browsers own F6 (it moves the focus to the address bar and the browser's own panes), and Tab already reaches every pane's content; the APG marks F6 as optional.
- **stepper-round**: the circles stay, and `docs/design-language.md` (Squircles) names the exception: a mark that shows a state is round, a key is not.

No baseline moved.
