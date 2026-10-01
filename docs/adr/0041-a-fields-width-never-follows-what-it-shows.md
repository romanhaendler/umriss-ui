# A field's width never follows what it shows

Status: accepted
Date:   2026-10

A field from `@umriss-ui/core` was `width: 100%` and nothing else. Where its
place gave it a width - a form's column, a grid's cell, a table's cell - that
was right. Where the place asked the field how wide it is - a row, a toolbar,
a column lined up at the start - the answer came from whatever the field
happened to show. A probe of every core control in the table toolbar, at 320
to 1600 px (`.scratch/control-sizes/spec.md`), found a multiselect 83, 96 and
then 133 px wide for none, one and two chosen values, showing one chip on a
1280 px screen; a select as wide as its longest option, chosen or not; a
clearable input that grew by its cross with the first letter; and a range
picker that scrolled a phone's page sideways. The only way to say a width was
`style`, and the table's own demo said it twice.

**A field fills the width its place gives it; where the place asks, it is its
natural width; and it is never wider than its place.** Every field's root is a
block (`width: auto`, not `100%`) with size containment in the inline axis and
a `contain-intrinsic-inline-size`: in a block, a stretched column or a grid's
cell it fills, as a `div` would; in a row, a shrink-to-fit place or a cell sized
by its content it is its natural width - a count of characters of its own type
(`ch`) plus its chrome. The containment takes what it shows out of the
question: value, options, chips, files, a cross that comes and goes. It is
`max-inline-size: 100%` and `min-inline-size: 0`, and what does not fit ends in
an ellipsis. One rule in `#own-styles` (`.extent`), composed by every field.

**`chars` says the count**, on every field that shows text: the room for the
value, with the field's own padding, glyph, cross and steppers added. Given,
the field is `fit-content` at that count - the same arithmetic as its natural
width, so `chars={16}` is the field without it, in a row. The default is 16 for
a text field, select and combobox: a `ch` is a figure, wider than the average
letter the browser counts for `size`, and sixteen of them make the browser's
own text field. A multiselect takes 20 - a chip costs more than its letters,
and twenty hold two short chips and the counter - a number 10, a textarea 40,
and a date picker
the length of its longest value in the formats in use - so a date never
truncates, in English or in German.

**`size` is one name for the two heights, and a place can say it once.**
`Select`'s `selectSize` became `size`. `ControlSizeProvider` sets the size of
every control inside it; a control's own `size` wins. The table's `Toolbar` is
one. A popover, dialog, tooltip or toast starts without it - React carries a
context through a portal, and a dialog opened from a small toolbar would have
taken small buttons.

## Alternatives that were real

**A width class on the place, not the field.** The table's toolbar set every
part to `width: auto` (table-filters 09). It fixed the toolbar and nothing
else: a row of one's own, a card header, a start-aligned column stayed as they
were - and `width: auto` on a field whose content sized it is exactly what made
the multiselect move.

**Natural width by default, fill on request** - Primer's `block`, MUI's
`fullWidth`. Predictable, but every form in the workspace fills its column and
would have needed the flag, and a field in a table cell or a grid's cell is
expected to fill. The block's own `auto` gives both without a flag, measured
alike in Chromium, Firefox and WebKit.

**A width in pixels, or named steps** (`short`, `medium`, `long`). A pixel
width is `style` under another name and does not grow with the type - under a
finger every text field writes at 16 px, and the root around it does too, so
sixteen characters stay sixteen. Named steps say nothing about the value; a
count does, as GOV.UK's width classes and the native `size` and `cols` do.

**The size in the root provider.** `UmrissProvider` holds application-wide
decisions, and its header says why not a component's default: two ways of
saying the same thing. A size belongs to a place - a toolbar, a dense form -
and the provider for it is scoped to that place.

## Consequences

`Input` and `Textarea` always render their wrapper: Firefox applies no size
containment to a bare native field. The class and the style land on the
wrapper, ref and rest on the control (principle 1) - and so for every wrapped
field, `Select`, `NumberInput`, `Checkbox`, `Switch`, `Slider` and `FileInput`
too. The style used to go with the rest: `<Input style={{ width: 120 }} />`,
the first thing a developer writes, would have sized the input inside a frame
that kept its own width, and on a checkbox or a file input it reached an
element hidden behind the drawn one. Class and style are how a caller dresses
and sizes what it lays out; they go to the same element. The native `size` of
`Select` and `cols` of `Textarea` are left out; neither had reached the
screen.

A field does not grow to fill a row; the row's own layout gives it room
(`flex: 1`, a grid). A place that sizes itself by its content and has no width
to stop at - an `auto` grid track, an inline block, a row that does not wrap -
gives a field at least its natural width, as it gives a native input its own.
A `FormField` is never wider than its place either, and its hint or error wraps
inside its field's width instead of widening it - a message that appeared with
the first wrong value pushed a row apart.

The combobox's panel is as wide as its field and never narrower than 200 px,
the multiselect's as before never narrower than 260: a field of six characters
would otherwise have cut every option to an ellipsis.

`Slider` and `FileInput` take no `chars` - they show no text to count. They
carry the same rule, so the readout and a list of files cannot move them.

Measured, not argued: `packages/core/tests-visual/features-sizes.spec.ts`
holds the promises on the Sizes page at 1280 and 320 px.
