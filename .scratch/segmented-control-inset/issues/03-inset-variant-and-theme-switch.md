# 03 — The inset variant and the theme switch example

Status: done

Blocked by: 01, 02

Spec: `.scratch/segmented-control-inset/spec.md`

## What to build

`variant="inset"` draws a segmented control that stands on its own - in a
menu, a settings panel, a sheet: a sunken track without an edge, the choice a
raised surface with the card shadow and corners concentric with the track's,
the other possibilities in the secondary text colour without seams, turning
to the text colour under the pointer. It is as tall as every control of its
size. Focus ring, invalid edge, disabled and forced colours behave as in the
field variant, and the keys are unchanged. The segmented control's page shows
it as a theme switch - Light | Dark | System, inset, filling, with icons - in
both themes, without a line of caller CSS. The owner judges the dark theme
from a screenshot before it ships.

## Acceptance criteria

- [x] `variant?: "field" | "inset"` on `SegmentedControl`, default `"field"`; without it, everything is as in 0.26 (existing tests and baselines untouched).
- [x] Inset track: sunken surface, no edge, the field's radius for its size, a small inner padding (about 3 px at `md`, 2 px at `sm`), total height the control height of its size - equal to a select's box at `md` and `sm` (layout test).
- [x] Chosen inset segment: surface colour, text colour, card shadow, radius the track's minus the padding, written so the stylesheet guards pass.
- [x] Unchosen inset segments: secondary text colour, no seams, text colour under the pointer; every inset segment in medium weight, so the width does not follow the choice.
- [x] Focus ring on the focused segment, the invalid danger edge in a `FormField` with an error, disabled dimming and the not-allowed cursor: as in the field variant.
- [x] Forced colours: the chosen segment in the selection colours, the track with a visible boundary; the new example joins the forced-colours spec.
- [x] The keyboard and role unit tests run for the default and for `variant="inset" fill` alike.
- [x] A new example "Theme switch" on the segmented control's page: inset, `fill` in a narrow panel, icons from the shared set or small inline SVGs; `variant` named in the configurator.
- [x] The component's header comment and its page say when to use which variant (`field` in a row of fields, `inset` standing alone); the glossary entry **Segmented control** gains one sentence on the inset drawing.
- [x] The new example joins the screenshot baselines, light and dark; a screenshot of it in both themes is left in this ticket's comments for the owner (the dark pill stands darker than its track - the owner decides).
- [x] Core's changelog has a feature entry.

## Comments

Delivered. `variant="inset"`: track in the sunken surface, padding 3 px (2 px
at `sm`) inside the control height, the chosen segment in the surface colour,
text colour and card shadow, radius `calc(var(--_radius) - var(--_pad))`;
unchosen words in the secondary ink and medium weight, the text colour under
the pointer, no seams. The inset rules stand before the forced-colours block,
which names the inset choice too, so it keeps the selection colours; the
stylesheet guard asked for the transparent outlines beside the lift and the
ring, and has them. `variant` is in the configurator.

Tests: the keys and roles for `variant="inset" fill` (unit); the theme switch
at the control height and the configurator's inset at the small height, the
chosen segment lifted (layout); the ring on the theme switch, the track's
outline and the selection colours under forced colours, with a baseline.

**For the owner - the dark theme.** The screenshots to judge are the theme
switch example's baselines,
`packages/core/tests-visual/screenshots.spec.ts-snapshots/example-segmentedcontrol--a-theme-switch-ui-{light,dark}-*.png`.
In the dark one the pill (`#161618`) stands darker than its track
(`#1e1e21`), held apart by the card shadow's edge, as the spec foresaw. It
reads as a selection; whether it reads as *lifted* is the owner's call.

The page head's new paragraph moved every example on the page by a fraction
of a pixel; the segmented control's baselines were redrawn for it. Without
that paragraph every existing baseline held unchanged (checked).

**Review (code-review, high).** Fixed: under forced colours the invalid inset
ring kept a transparent outline on the chosen segment, and the chosen inset
segment kept the card shadow beside the selection colour - both now as the
field's, and the forced-colours test focuses the chosen segment, where the
keys land; an `icon` of `false` or `null` drew an empty box with a gap; the
toast's 600 px stands in two files, and the module now says so. Left: the
dark pill (owner's call, above); the toast tokens resolve `--u-space-*` on
`:root` (the Theming page's limit on a token that names another); the card
shadow's reach below a 3 px padding (the requested look); icon sizing shared
with the button through `#own-styles` (six lines, two places - shared when a
third control takes icons); the redrawn field baselines (checked: unchanged
without the page head's paragraph).

**Inset is the default (2026-10-06).** Having seen the theme switch in the
browser, the owner made `inset` the default and kept `fill` opt-in (equal
shares in a row would cut the longer word). `field` gives the 0.26 drawing.
The row of fields now shows inset, and its alignment tests - box equal to the
select's, words on the select's line, md and sm - run against it; a new
example "Drawn as a field" holds the field drawing to the same test.
