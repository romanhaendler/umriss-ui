# 04 — A canon of states

Status: done

Blocked by: 01

Spec: `.scratch/visuelle-wertigkeit/spec.md`

## Scope

Hover, active, focus and disabled follow **one logic** across all components
rather than a habit per component. The canon fixes **by what means** a state
comes about, not only how strongly:

- **Hover** changes the surface.
- **Active** changes the surface more strongly and may additionally suggest a
  minimal settling.
- **Focus** is exclusively the existing ring (`--u-focus-ring`) and is never
  replaced by anything else. An element that shows focus by a change of surface
  instead of by the ring is to be corrected.
- **Disabled** reduces opacity and removes **every** reaction — no hover, no
  active, no pointer.

A single control must not break away from this without a reason. Where it does
break away, the reason stands at the site.

The first step is a survey: what does each component do today in each of the four
states? Only after that is it settled whether the canon needs new tokens or gets
by with the existing ones.

Perceived quality is noticed the moment somebody moves the mouse, and it falls
apart when three buttons have three different ideas of "pressed".

## Acceptance

- A survey of all four states across all components precedes the change and
  accompanies the delivery.
- Every new token a state introduces is covered by
  `tests-unit/kontrast.test.ts`. An optical upgrade must not cost legibility.
- `tests-visual/barrierefreiheit.spec.ts` stays green. In particular: no element
  loses its visible focus.
- The focus ring is the same across all components. Divergences carry their
  reason in place.
- Disabled elements react to nothing. This is to be checked also where the
  disabling today only changes the opacity and the hover underneath keeps
  running.
- The transitions between the states use the motion vocabulary from ticket 02, if
  that has already been delivered; otherwise the existing tokens. Raw values are
  in no case permitted — the check from ticket 01 holds that.
- Screenshot baselines may move; every moved baseline is looked at individually
  and justified.

## Notes

Independent of ticket 03; both can run in parallel.

The canon is deliberately formulated as a statement about **means**, not about
values. "Hover changes the surface" is checkable by looking and leaves open how
strongly — exactly the freedom this spec wants to preserve in the values. A
formulation such as "hover lightens by 4%" would be a value rule again and does
not belong here.

The most likely finding of the survey is that focus is additionally shown by a
change of surface in several places, because that was the obvious thing to do
while building the respective component. That is the case that makes the canon
most necessary: focus and hover thereby become indistinguishable.

## Survey

Taken on `visual-quality` at 375ca94, before any change: every element a pointer
or a key can operate in core, table, schedule, calculation and the charts' DOM,
read out of the stylesheets (`:hover`, `:active`, `:focus*`, the disabled
markers) and, where the stylesheet does not tell, out of the component. "Ring"
means `--u-focus-ring` - by `composes: ring`, or written out. "—" means the
state does not occur (not focusable, cannot be disabled). **Bold** marks a
divergence from the canon.

| Component · element | Hover | Active | Focus | Disabled |
|---|---|---|---|---|
| Button primary / danger | darker surface (`-hover`) | stronger surface (`-active`) + scale 0.98 | ring | opacity 0.5, not-allowed, hover/active guarded; busy is not greyed (reason in place) |
| Button secondary | sunken surface + hover edge | **scale only, no surface** | ring | as above |
| Button ghost | accent-subtle surface | **scale only, no surface** | ring | as above |
| ButtonGroup | the Button's; z-index lift | settling removed (reason in place) | ring, clip lifted | the Button's |
| Checkbox | **none** | **none** | ring on the box | **repaint: sunken box, muted label; no opacity** |
| RadioGroup | hover edge on the dot (guarded) | **none** | ring on the dot | opacity 0.5, not-allowed |
| Tabs · tab | type darkens (a tab has no surface) | **none** | ring | **muted colour, no opacity; hover not guarded - a disabled tab darkens under the pointer** |
| Card · collapse button | accent-subtle surface | **none** | ring | — |
| Alert · close | currentColor 12 % surface, opacity 1 | glyph 0.8, **no surface** | ring (+ opacity 1) | — |
| Tag · remove key | currentColor 14 % surface | glyph 0.8, **no surface** | the tag's ring | tag opacity 0.5; the key is not rendered |
| Toast · close, Modal · close | sunken surface + type | **none** | ring | — |
| Fields: Input, Textarea, Select, Combobox, DatePicker trigger, TimeField, NumberInput, MultiSelect | hover edge (guarded) | — (a field has no press) | ring on the edge (`:focus-visible` / `:focus-within`) | **repaint: sunken ground + muted type, no opacity** |
| Field clear keys (Input, Select, Combobox, DatePicker) | sunken surface + type | **none** | — (not in the tab order) | not rendered |
| NumberInput · stepper | sunken surface + type (guarded) | **whole key scale 0.9 - neither 0.98 nor the glyph's 0.8; no surface** | — | opacity 0.18, default cursor (at a bound) |
| DatePicker · time stepper | sunken surface + type, **not guarded** | glyph 0.8, **no surface** | — | opacity 0.18; **the group's hover lifts a disabled stepper back to opacity 1 and paints it** |
| DatePicker · page, day, preset | sunken surface | **none** | ring | — |
| Menu · item | sunken surface | **none** | **surface (sunken), ring suppressed** | **muted colour, no opacity; hover not guarded (a counter-rule resets it)** |
| Menu · danger item | danger-subtle surface | **none** | **surface (danger-subtle)** | as the item |
| Combobox · option | the list cursor (sunken), moved by pointer and keys | **none** | the focus stays in the field, ring there | **muted colour, no opacity; the pointer still moves the cursor onto a disabled option** |
| CommandPalette · row | the list cursor (accent-subtle) | **none** | field without ring (reason in place) | — |
| MultiSelect · chip | danger-subtle surface + × | **none** | **surface (danger-subtle), no ring** | not-allowed; **the × still appears under the pointer** |
| MultiSelect · counter | accent 18 % surface (guarded) | **none** | ring | — |
| MultiSelect · scope | type darkens (a segment, like a tab) | **none** | ring | — |
| MultiSelect · option | sunken surface | **none** | the checkbox's ring | — |
| TreeView · row | sunken surface | **none** | ring | row muted and navigable, checkbox disabled; no opacity |
| Dock · tool | sunken surface + type (guarded) | **none** | ring | **muted colour, default cursor, no opacity** |
| Dock · grip | type darkens | grabbing cursor + ink while dragged | ring | — |
| Typography · link | accent-hover + underline (a link has no surface) | **none** | ring | — |
| Table · sort button | type darkens + indicator (a header label) | **none** | ring | — |
| Table · filter button | sunken surface + type | **none** | ring | — |
| Table · condition tag button | **none** | **none** | ring on the tag (reason in place) | — |
| Table · column move key | sunken surface + type (guarded) | **none** | ring | opacity 0.5 **+ muted colour** (dimmed twice), default cursor |
| Table · grouping option | text 10 % into sunken (guarded) | **none** | ring | **muted colour, default cursor, no opacity** |
| Table · fold | text 8 % surface + type | **none** | ring | — |
| Table · expander | sunken surface + type | **none** | ring | — |
| Table · row actions | accent type on row hover or focus-within (reason in place) | — | the buttons' ring | — |
| Table · virtual row | the row band | — | **2 px accent outline inset, not the token; no reason at the site** | — |
| Schedule · fold chevron | **type darkens, no surface** | **none** | ring **+ type darkens** | — |
| Calculation · disclosure | sunken surface + type (also on row hover) | **none** | ring | — |
| Charts · legend entry (button) | **none** | **none** | ring (`--uc-focus-ring`) | — |

What the survey finds, in the canon's order:

- **Hover** changes the surface almost everywhere. Five controls change only
  their type, and four of them have no surface to change: the tab, the link, the
  table's sort label and the MultiSelect's scope segment (a segment of a tab
  strip). They stay, with the reason at the site. The schedule's fold chevron is
  a square key like the table's expander and the calculation's disclosure, and
  it gets their surface; the charts' legend entry gets one for the first time.
- **Active** is the widest gap: only the primary and danger buttons darken their
  surface. The rest has either nothing or a settling alone. Neutral surfaces
  have no stronger step in the vocabulary - the pressed surface is a new token.
- **Focus** is shown by surface in exactly the two places the ticket expected:
  the menu item and the MultiSelect chip. The table's virtual row draws the ring
  as an outline for a reason nobody wrote down; the schedule's chevron adds a
  colour to the ring. The list cursors of Combobox and CommandPalette look like
  focus by surface but are not: DOM focus stays in the field, which carries the
  ring, and the cursor is what the pointer moves too.
- **Disabled** is opacity in four places (Button, RadioGroup, Tag, the steppers)
  and a repaint in muted colours in the rest. Three disabled elements still
  react: the disabled tab darkens, the disabled time stepper comes back to full
  presence under its group's hover, and the × of a disabled chip appears.
  Combobox moves its cursor onto a disabled option with the pointer.

## Delivery

Delivered on the branch `worktree-agent-a20e4ca0333803b02`, survey first
(bacba05), then the canon.

- **No new colour for hover, three for the press.** Hover already had its
  surfaces; the press had no step below them. `--u-color-surface-pressed`,
  `--u-color-accent-subtle-pressed` and `--u-color-danger-subtle-pressed` are
  light-dark pairs in `tokens.css`, and `contrast.test.ts` holds the type on
  each at 4.5:1 in both themes. Tone-relative grounds (the alert's close, the
  tag's remove key, the table's fold and grouping option, the MultiSelect's
  counter) press by a stronger mixture of the colour they hover with; the
  counter stops at 24 % because 26 % measured 4.49:1.
- **Every quiet key now sinks while pressed**, and the settlings are the two
  the design language names: 0.98 on a button, 0.8 on a glyph - the
  NumberInput's stepper had a third, 0.9 on the whole key.
- **Focus by surface is gone**: the Menu item and the MultiSelect chip carry the
  ring. The chip's ring needed room in the clipping summary row; the chips do
  not move. The schedule's chevron no longer darkens its type on focus. Four
  places where a hover edge outweighed the ring were found on the way - the
  secondary button, Checkbox, RadioGroup, and the chosen, range-end and preview
  days of the date pickers - and exclude the focused element now.
- **Disabled dims and reacts to nothing**: the fields, Checkbox, tab, menu item,
  combobox option, dock tool and the table's move key and grouping option dim
  to 0.5 instead of being repainted. Fixed underneath: the disabled tab's
  hover, the time stepper's comeback under its group's hover, the disabled
  chip's ×, and Combobox's pointer moving the cursor onto a disabled option
  (a unit test, `combobox.test.tsx`).
- **Standing divergences, with their reason at the site**: type-only hover on
  the tab, the link, the sort label, the scope segment and the dock's grip;
  the list cursors of Combobox and CommandPalette (virtual focus - the ring
  stays on the field); the virtual row's inset outline; the TreeView's disabled
  row (focusable, so muted rather than faded); the steppers' 0.18 at a bound.
- **The check** is part of `stylesheets.test.ts`: no hover or press rule reaches
  an element with a disabled state without excluding it; a rule for the
  element's own focus paints no surface or type and draws the ring or nothing;
  no hover edge outweighs the ring; a disabled rule sets no colour or surface.
  Four named exceptions, each with its reason, and a self-test that each check
  fires. Its ceiling: a disabled state carried by a class other than
  `.xDisabled` (RadioGroup's and Tag's `.disabled`) is not tied to its element.
- **Baselines**: none moved. The full visual suite ran on its own ports and was
  green, the accessibility and own-base checks included, but for one table
  behaviour test (below). The dimmed fields and checkbox stay under the
  comparison's per-pixel threshold - half-opacity ink on paper is, to the byte,
  the muted type it replaces (#8b8b8b) - and the new pressed, hovered and
  focused states are not photographed. Menu and chip focus were looked at in
  the built demo.
- **Seen, not caused here**: `features-table.spec.ts` "A click on a condition
  opens the panel of its filter" fails deterministically - the filter panel
  still leaving (ticket 02's 100 ms exit, `data-closing`, inert) and the newly
  opened one both match the role query. Nothing of this ticket touches the
  panel's lifecycle; it was not re-run on the base commit.
- `CONTEXT.md` is unchanged: the canon's meaning stands as defined.
  `docs/design-language.md` gained a **States.** paragraph.
