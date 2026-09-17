# Glyphs

The shared character set lives in `src/lib/glyphs/`. The specification stands as
a comment above the module – here it is in short form, followed by what actually
makes this file worth having: the list of glyphs that deviate from it.

## The specification in six points

| # | Rule |
|---|---|
| 1 | Nominal size `0 0 10 10`. Wider than tall is allowed; the height then stays 10. |
| 2 | Stroke width `1.4` at the nominal size. |
| 3 | `currentColor` – never a colour of its own. |
| 4 | `fill="none"` – it is drawn with the stroke. |
| 5 | `strokeLinecap="round"`, and `strokeLinejoin="round"` where there are bends. |
| 6 | `aria-hidden` – a glyph is decoration. |

The width 1.4 was not chosen because it is the prettiest but because it is the
most frequent: six of the eight crosses in the codebase already carried it.

The glyph names are English since `english-and-umriss-ui` 15: `CrossGlyph`,
`GripGlyph`, `MeasureGlyph`, `GridGlyph`, `AngleGlyph`, beside `PlusGlyph` and
`MinusGlyph`. Two of them waited on decisions in `CONTEXT.md`: `GridGlyph`
depicts a grid, which is a picture and not the layout grid the **Month grid**
entry forbids, and `MeasureGlyph` follows **Measure**.

## What was taken over

Only what could be taken over **pixel for pixel**. The proof was the screenshot
suite: not a single baseline moved through the migration itself. (They were all
regenerated later, for a different reason: the demo had never loaded the token
layer – see `demo/main.tsx`. For the glyphs that changes nothing; the migration
ran without a diff before it and after it.)

And only what **meets** the specification. That is the second rule of the
acceptance, and it costs something – see the section below.

| Glyph | Places | Meets the specification? |
|---|---|---|
| `CrossGlyph` | Input, Select, Combobox, DatePicker, DateTimePicker, RangeTrigger (6×) | yes |
| `PlusGlyph`, `MinusGlyph` | NumberInput | yes – the yardstick it was written against |
| `AngleGlyph` | TreeView (`tree-view`) | yes – newly drawn, not taken over |
| `GripGlyph` | Dock (`floating-dock`) | yes – newly drawn |
| `GridGlyph`, `MeasureGlyph` | the demo's dock page (`floating-dock`) | yes – newly drawn |

Seven glyphs in twelve places. The gain from the first four was the small cross
that stood identically in the code six times; the dock's three are newly drawn and
saved nothing – they are the proof that the specification also binds whoever
invents a character.

On the dock's three characters. `GripGlyph` stands in the component itself;
`GridGlyph` and `MeasureGlyph` only in the demo's dock page, so in exactly one
place each. That falls below the bar of two places this file otherwise applies,
and they lie in the set regardless – for the reason the last section gives: the
route for a new character is "take it from the set, otherwise draw it to the
specification and put it in". The bar decides whether **moving** something out of
the existing code is worth it, not where a **new** character belongs. Filing a new
character beside the set would be exactly the accident the specification abolishes.

Two notes on the drawing. `GripGlyph` carries its ridges the same way in both of
the dock's orientations, although turning them with it would be prettier: the
acceptance of ADR-0014 rules out a `rotate()` in that component, and a character
that has to be rotated to be right would be rotated along on a change of
orientation. `GripGlyph` is also deliberately not dotted – dots would be fill,
and point 4 draws with the stroke.

`AngleGlyph` is the only one that does not come from the existing code: the tree
needed an expansion angle, and this file's bar is two places. It carries **the
same path** as the expander arrow in the table's `parts.tsx` and the stroke width
of the specification. The deviation there has thereby shrunk to a single number,
and aligning it later would be one line – at the price of two moved screenshot
baselines, which it has not yet earned.

## What was **not** taken over

This is the actual list of deliverables: every character that deviates, with the
reason. It is the input for the later decision whether to align – not the decision
itself.

Note that the table's characters now live in `@umriss-ui/table`, which left this
package with umriss-table 14. They stay in this table because this is where the
specification stands.

| Place | Character | Deviation |
|---|---|---|
| `Alert.tsx` | cross | Path and nominal size as `CrossGlyph`, but **width 1.5**. One character, two widths – the clearest candidate for aligning. |
| `Modal.tsx`, `Toast.tsx` | closing cross | **Nominal size 12**, width 1.5. Identical in both places – a genuine duplication, which stays because the character misses the specification. |
| `Calendar.tsx` | paging arrows left/right | Width **1.5**. Mirror images of each other. |
| `DatePicker.tsx`, `DateRangePicker.tsx` | calendar sheet | **Nominal size 14**, width 1.3 (1.1 for the range arrow). |
| `DateTimePicker.tsx`, `DateTimeRangePicker.tsx` | clock | **Nominal size 14**, width 1.3. Identical in both places – the second genuine duplication. |
| `Combobox.tsx` | tick | Width **1.8**, nominal size `0 0 10 8`. |
| `Tag.tsx` | cross | The same path, **width 1.6**, drawn at 8 px. |
| `MultiSelect.tsx` | cross on the chip | **Nominal size 8**, path scaled accordingly (`M1.2 1.2l5.6 5.6…`). The third version of the same character. |
| `Checkbox.tsx` | tick | Like the combobox's, but without `width`/`height` (CSS determines the size) and with `pathLength={1}` for the drawing animation. No longer a plain character but an animated one. |
| `TimeField.tsx` | arrow up/down | **Nominal size 10 × 6**, width 1.4. |
| `ButtonGroup.tsx` | arrow down | **Nominal size 10 × 6**, width 1.5 – the same shape as in the TimeField, a different width. |
| table, `parts.tsx` | expander arrow right | The same path and the same nominal size as `AngleGlyph`, but **width 1.5**. Rotated by CSS. After `tree-view` the clearest candidate for aligning: it is exactly one number. (Until then this line named a `PfeilRechtsGlyph` that never existed in the set.) |
| table, `parts.tsx` | sort arrow | Width **1.6**; the direction comes from a CSS rotation, and the class hangs on the `<svg>`. |
| table, `parts.tsx` | sortable indicator | **Nominal size 10 × 12**, two paths, width 1.5. |
| table, `unbound.tsx` | move up / move down | **Two characters, nominal size 10, width 1.5**, in the column reordering. Not recorded here before: they were added with the unbound table and never entered in this list, which is precisely the drift this file exists to prevent. |
| table, `filter.tsx` | funnel | Nominal size 14, width 1.4, but **`fill` switches to `currentColor`** when the filter is active. By point 4 not a glyph but a depiction of state. |
| `Toast.tsx` | tone symbols | Nominal size 12, width 1.6, **filled circles**; four variants in one `<svg>`. |
| `Spinner.tsx` | loading ring | Animated, `role="status"`, carries an accessible name – by point 6 not a glyph. |
| `Sparkline.tsx` | history | A chart with a gradient fill, not a character. |

## Why the duplications stay

The closing cross stands twice in the code (Modal, Toast), the clock twice (both
time pickers), the calendar sheet twice in variants. All three could be merged
pixel for pixel – and they stay where they are regardless.

The reason stands in the ticket's acceptance: *"Where a component's glyph differs
from the specification, leave it and record the difference."* A rule that collects
its own exceptions is no longer a yardstick but a drawer – a new character could
then appeal to any exception at all, and the specification would only be standing
there.

This table is therefore not an appendix but the result: it is the input for the
later decision whether to align. Whoever makes it puts the characters into the set
afterwards.

## When a new character arrives

Take it from the set. If it is not there, draw it to the specification and put it
into the set. A character that cannot keep to the specification belongs in the
table above with its reason – then the deviation is a decision and not an
accident.
