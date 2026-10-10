# A calculation follows the density

Status: accepted
Date:   2026-10

An application built for a dense screen says `density="compact"` on its tables
and alarm lists, or once on the `UmrissProvider`, and those surfaces close up
to the compact row pitch (ADR-0042). A `Calculation` on the same screen did
not hear it: no `density` of its own, and the provider's unread. Measured in
Chromium, its line was 37 px at 13 px type beside a compact table's 27 px at
11 - and not one height either: a line with a verdict measured 38.5 px, the
Result 38, because cells that share a baseline are set a fraction lower where
their type differs, and each pushed its line out by that fraction.

**`Calculation` takes `density="regular" | "compact"`**, with the table's
default: its own value, else the density a provider explicitly set, else
`"regular"`.

**Compact is the table's compact, not a second one.** 11 px type on an 18 px
line with 4 px above and below and the hairline: 27 px under a fine pointer.
Under a finger the type stays and the room goes back to 8 px, 35 px - a line
that folds is its own target, so it is the line that grows. The Result's
number stays one type step above its lines, and its double rule is drawn
closer so that it stands inside the row.

**A compact line that says one thing is exactly that tall.** The last pixel
beneath the text belongs to the line, not to its cells, so a cell set lower
for the baseline takes it up instead of pushing the line out; the disclosure
and a verdict's badge, 20 px on a line of 18, reach into the room above and
below. A label still wraps and a note still adds a row: a calculation has
lines, not a row pitch, and the name of a quantity is read in full.

**Nothing else changes** - the columns and their gaps, the indent per depth,
folding, the hover coupling, emphasis and rule, the narrow and the two-line
form, the sentence each line is read as. A regular calculation does not move
by a pixel.

## Alternatives that were real

**A prop the provider does not reach.** The application would say it once per
calculation, and `<UmrissProvider density="compact">` would stay half true: the
default "of every component that reads it", with the third surface of rows not
among them.

**Tighter lines at the regular type.** 13 px type on a 27 px line is cramped,
and still does not match the table beside it, which is the reason to ask.

**A compact set of tokens for the whole library** (work package B.13). Still
not built, and not needed for a third surface that has lines.

**Whole-pixel, uniform lines in regular as well.** The same repair would bring
a regular line to one height. It would move every regular calculation an
application has on screen; it is a change of its own.

## Consequences

A calculation under a provider that says `density="compact"` becomes compact
on upgrade, without a change to the caller's code. It is what the setting
says it does, and it stands under "Changed" in the changelog.

**Density** is a glossary term of its own now: a table, an alarm list and a
calculation follow it. The schedule and the charts do not - a lane and a
chart's frame are not lines of text.

Measured, not argued: the calculation's browser suite holds a compact line at
27 px in Chromium and WebKit - with a disclosure, with a verdict, the Result
- and at 35 px under a coarse pointer.
