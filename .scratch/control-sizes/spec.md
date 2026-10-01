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

1. **A field fills the width its parent gives it** - unchanged.
2. **Where the parent asks, a field answers with its natural width, never with
   what it shows.** Every field's root carries size containment in the inline
   axis and a `contain-intrinsic-inline-size`: chosen values, options, a
   clearing cross, a file list cannot move it.
3. **`chars` says the width in characters** - the room for the value, in `ch`
   of the field's own type; the field's own chrome (padding, chevron, cross,
   steppers) is added by the field. Given, the field is exactly that wide in
   every parent; not given, the field's default is its natural width.
   Defaults: 20 (the browser's own default for a text field) for `Input`,
   `Textarea`, `Select`, `Combobox`, `MultiSelect`; 10 for `NumberInput`; the
   date pickers the length of their own format, so a date never truncates.
4. **A field is never wider than its parent** (`max-inline-size: 100%`) and
   may shrink below its natural width (`min-inline-size: 0`); what does not fit
   ends in an ellipsis.
5. **Every field has a root that is not the native element** - `Input` and
   `Textarea` always wear their wrapper (Firefox applies no size containment
   to a bare `<input>`). Principle 1 holds: the class on the wrapper, ref and
   rest on the control.
6. **One size, one name, one scope.** `size` is `"sm" | "md"` on every control
   that has two heights (`ControlSize`); `Select`'s `selectSize` becomes
   `size`. `ControlSizeProvider` sets the default for the controls inside it;
   a control's own `size` wins. The table's `Toolbar` provides it. A surface of
   its own - popover, dialog, drawer, tooltip, toast - starts without it, so a
   dialog opened from a small toolbar keeps its buttons.

Not decided here: `Slider` and `FileInput` take no `chars` - they show no text
to measure; they get the containment and a natural width, and their width is
the layout's. `Stack` stays pure layout.

## Tickets

- `issues/01-control-size-scope.md`
- `issues/02-natural-width-and-chars.md`
- `issues/03-table-follows.md`
- `issues/04-docs.md`
- `issues/05-final-polish.md`

## For the changelogs (written at release)

core, **Added**: `chars` on `Input`, `Textarea`, `Select`, `Combobox`,
`MultiSelect`, `NumberInput` and the four date pickers; `ControlSize`,
`ControlSizeProvider`. **Changed**: a field's width no longer follows what it
shows - where its parent asks, it is its natural width; `selectSize` is now
`size` (no alias); `Input` and `Textarea` always render their wrapper, so
`className` lands on the wrapper; every control with `size` follows a
`ControlSizeProvider` around it.

table, **Changed**: `Toolbar` sets the size of core controls put into it;
the search is as wide as its natural width (20 characters) instead of 160 px.
