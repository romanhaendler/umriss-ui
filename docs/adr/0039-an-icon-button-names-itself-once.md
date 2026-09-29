# An icon button names itself once, and shows that name

Status: accepted
Date:   2026-09

A button that showed only an icon was a `Button` with an `aria-label`: the
name was optional, the tooltip was the caller's to remember, and the result was
an oblong 38 × 26 px. Inside the library a dozen components drew such a button
by hand, at 20, 22, 24, 28 and 30 px (`.scratch/icon-button/spec.md`).

**`IconButton` is its own component.** Square at the control heights, a
required `aria-label` that is both the accessible name and the tooltip, the
icon as children, sized by the button. It is a `Button` underneath and shares its
stylesheet, so a variant means one look in both.

## Why a component and not a prop on `Button`

A `square` prop would have kept the name optional. The one thing a button
without text cannot do without is its name, and only a prop the type requires
holds that. It is spelled `aria-label`, as principle 6 of core's README spells
every name of a root element (ADR-0015 kept that when it reversed the rest),
and required the way `Tag` requires it. A first draft called it `label`;
ADR-0015 had rejected exactly that, a word that reads as a visible caption.
`aria-labelledby` and `title` are not taken: either would part the name from
the tooltip.

## Why the tooltip cannot be switched off

Whoever sees only an icon needs its name as much as whoever hears it. A hint
that says more than the name is a `Tooltip` around a `Button`; the table's
column filter and column picker keep exactly that. The tooltip does not
describe its trigger with the words that already name it, so a screen reader
hears the name once. And it opens for keyboard focus, not for the focus a click
leaves behind: the Modal's close button takes the focus when a dialog opens,
and a menu hands it back to its trigger when it closes - a tip at each would
have stood over what the pointer had just started.

## Why `plain`, and not `ghost`

Every hand-drawn icon button in the library was quiet and neutral; `ghost` is
quiet in the accent. Making `ghost` neutral on one component and accented on
the other would have given one variant name two looks. `plain` is the fifth
variant of both, and the default of `IconButton`.

## Why "icon" and not "glyph"

The glossary kept "icon" out, for the **Glyph** of the shared set. An icon
button carries Font Awesome's, lucide's or the application's own drawings, which
are not glyphs; **Icon** is now the wider term, and a glyph one kind of it.

## Where it is not used

Field parts keep their geometry - a field's clearing cross, the steppers, a
tag's remove, fold carets - and so do the Alert's dismiss (tinted by its tone),
the Toast's close (sized to its line), the table's header filter and column
picker (a hint that says more than the name), the Breadcrumb's "…" (a link's
look, and text), the Dock's tools (their own token, `aria-pressed`, a measured
strip) and the SplitButton's trigger, a segment of its group rather than a
button beside it. The table's row-actions trigger is an `IconButton` in
`ghost`, like every other action in its row.
