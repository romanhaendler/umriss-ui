# Control sizes

Asked for by the user on 1 Oct 2026, after a probe of every core control in
the table toolbar at 320, 375, 768, 1280 and 1600 px: "das gesamte Handling der
Größen gerade ziehen ... dass ein Multiselect nicht größer oder kleiner wird,
wenn ich verschiedene Dinge auswähle ... nicht nur auf die Tabelle und Toolbar,
sondern die allgemeine Verwendung."

## What the probe found

A field from `@umriss-ui/core` was `width: 100%` and nothing else. Where its
parent gave it a width (a form column, a grid cell, a table cell) that was
right. Where the parent asked the field how wide it is - the table toolbar,
which sets its parts to `width: auto` since table-filters 09, a row, anything
shrink-to-fit - the answer came from whatever the field happened to show:

- a `MultiSelect` was 83, 96, then 133 px for 0, 1, 2 chosen values, and then
  showed a single chip with "+N" on a 1280 px screen - its width read its chips
  and its chips read its width;
- a `Select` was as wide as its longest option, chosen or not (314 px for
  "All depots");
- a clearable `Input` was 18 px wider once it held text;
- `Input` 157, `Combobox` 197, `NumberInput` 230 px - the browser's leftovers;
- a `DateTimeRangePicker` was wider than a 320 px phone and scrolled the page.

The only way to say a width was `style` - the table's own demo did, twice.

Heights had the same seam: the toolbar is `sm`, a core control is `md` unless
told, so a control of one's own stood taller than the search beside it unless
the caller remembered `size="sm"` on each. `Select` called the same prop
`selectSize`.

## Decided (ADR-0041)

1. **A field fills the width its place gives it** - a form's column, a grid's
   cell, a dialog, a table's cell. Its root is a block with `width: auto`, not
   `100%`: it fills as a `div` would.
2. **Where the place asks, a field answers with its natural width, never with
   what it shows.** A row, a toolbar, a column lined up at the start, a cell
   sized by its content. Every field's root carries size containment in the
   inline axis and a `contain-intrinsic-inline-size` (`.extent` in
   `#own-styles`): chosen values, options, chips, a clearing cross, a file list
   cannot move it. Measured alike in Chromium, Firefox and WebKit.
3. **`chars` says the width in characters** - the room for the value, in `ch`
   of the field's own type; the field adds its own chrome (padding, chevron,
   cross, steppers). Given, the field is that wide in every place. Defaults:
   16 for `Input`, `Select`, `Combobox` - a `ch` is a figure, wider than the
   average letter the browser counts for `size`, and sixteen make the
   browser's own text field (20 made a dispatcher's bar three lines); 20 for
   `MultiSelect`, two short chips and the counter (at 16 the second chip never
   came);
   10 for `NumberInput`, with a text prefix and suffix counted; 40 for
   `Textarea`; the date pickers the length of their longest value in the
   formats in use, so a date never truncates.
4. **A field is never wider than its place** (`max-inline-size: 100%`) and may
   shrink below its natural width (`min-inline-size: 0`); what does not fit
   ends in an ellipsis. A `FormField` is never wider than its place either,
   and its hint or error wraps inside its field's width instead of widening
   it.
5. **Every field has a root that is not the native element** - `Input` and
   `Textarea` always wear their wrapper (Firefox applies no size containment
   to a bare native field). Principle 1 holds: the class on the wrapper, ref
   and rest on the control. Under a finger a text field's root writes at the
   field's 16 px, so sixteen characters stay sixteen.
6. **One size, one name, one scope.** `size` is `"sm" | "md"` on every control
   that has two heights (`ControlSize`); `Select`'s `selectSize` becomes
   `size`, `ButtonGroup` gains one for its buttons. `ControlSizeProvider` sets
   the default for the controls inside it; a control's own `size` wins. The
   table's `Toolbar` provides it. A popover, dialog, drawer and tooltip start
   without it, so a dialog opened from a small toolbar keeps its buttons; the
   toast region stands where the `ToastProvider` stands, at the application's
   root, and needs no reset.

Also: the combobox's panel is never narrower than 200 px.

Not decided here: `Slider` and `FileInput` take no `chars` - they show no text
to measure; they get the containment and a natural width. `Stack` stays pure
layout: a field does not grow to fill a row, the row's layout gives it room.

## Tickets

- `issues/01-control-size-scope.md`
- `issues/02-natural-width-and-chars.md`
- `issues/03-table-follows.md`
- `issues/04-docs.md`
- `issues/05-final-polish.md`
- `issues/06-own-styles-copied-per-module.md` - a finding of the developer's round
- `issues/07-the-default-counts.md`, `08-the-multiselects-gap.md`,
  `09-the-sliders-readout.md`, `10-a-field-that-fills-a-row.md` - the
  questions the acceptance left open

The decisions, as the design language states them for later work:
`docs/design-language.md`, "Sizes".

## For the changelogs (written at release)

core, **Added**: `chars` on `Input`, `Textarea`, `Select`, `Combobox`,
`MultiSelect`, `NumberInput` and the four date pickers; `ControlSize`,
`ControlSizeProvider`; `size` on `ButtonGroup`; the demo page Sizes.
**Changed**: a field's width no longer follows what it shows - where its place
asks, it is its natural width, and it is never wider than its place; a field's
root is a block (it was `inline-flex` for `Input`, `Select`, `Combobox`,
`NumberInput`), so in a row it no longer takes the row's width; `selectSize`
is now `size` (no alias); `Input` and `Textarea` always render their wrapper,
so `className` lands on the wrapper; on every wrapped field (`Input`,
`Textarea`, `Select`, `NumberInput`, `Checkbox`, `Switch`, `Slider`,
`FileInput`) `style` lands where `className` does, on the wrapper - it went to
the control inside; `Textarea` no longer takes `cols`; every
control with `size` follows a `ControlSizeProvider` around it; a FormField's
message wraps inside its field's width; the combobox's panel is at least 200 px.

table, **Changed**: `Toolbar` sets the size of core controls put into it;
no part of the toolbar is given a width any more - the search is its natural
width instead of 160 px, the page-size select as wide as its longest size.
