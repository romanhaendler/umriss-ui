# Under a finger the controls grow, and touch is told by the pointer

Status: amended by ADR-0079
Date:   2026-10

On a phone, a tablet and a touch-only kiosk every umriss control was 32 px tall,
as on a desktop. The Tag remove (16 px), the NumberInput stepper (20 px wide), a
free Checkbox or Switch (17 px), the TreeView chevron (16 px), the Splitter (8 px)
and the table's row checkbox (16 px) fell below WCAG 2.5.8's 24 px (shakedown of
2026-10-24, five personas). Two places already answered a finger. A field's text
is 16 px under a coarse pointer. A compact row gives its room back and is 35 px
(ADR-0042, ADR-0051). A third, the Select, chooses its list by the pointer of the
gesture (ADR-0043). Nothing said what "touch" is for the library as a whole.

## Decision

**Touch is the pointer, never a setting.** A size, a hit area or a look follows
`@media (pointer: coarse)`, the primary pointer. A behaviour follows the
`pointerType` of the event that starts the interaction, as the Select does. There
is no provider setting, no control size, no exported hook and no branch on the
device during render:

- the server renders one markup for every device, and nothing about touch can
  fail a hydration;
- CSS knows the pointer before the first paint;
- a touch laptop with a trackpad has a fine primary pointer, so a dense screen on
  it stays dense.

`any-pointer` is not used: it would make every touch laptop a tablet.

~~**Under a finger a `md` control is 44 px tall**, the height WCAG 2.5.5 and Apple's
guidelines name. One token block under `pointer: coarse` sets it.~~ Superseded by
[ADR-0079](0079-the-size-is-the-applications-the-hit-area-the-librarys.md): a `md` control is
32 px under any pointer, and an application that wants 44 px imports `touch-scale.css`. `sm` stays 26,
and a dense surface's `xs` becomes 26 as before. A place that chose `sm` chose
density, and a finger does not undo that: a table's toolbar, a compact table, a
tree and a breadcrumb keep their pitch, and ADR-0042 and ADR-0051 do not move.
Only the height changes; padding, icon and type stay. An application that wants
another height under a finger sets the token in its own media query (ADR-0045).

**Under a finger nothing the library draws is a target smaller than 24 × 24 px.**
A glyph drawn smaller is hit in a larger square than it is drawn, never reaching
into a neighbour's. A box too small for that grows instead. A check measures every
example of every demo under touch emulation, as the large-text check does at
200 %.

**There is no touch size in `ControlSizeProvider`.** A control size belongs to a
place and stops at every surface opened from it (ADR-0041): a dialog opened from a
toolbar starts at `md`. A touch size given there would stop at the same edge.
Touch belongs to the device and reaches every surface.

## Considered Options

- **A `touch` size the application chooses, in `ControlSizeProvider` or the root
  provider.** Rejected: the application would detect touch itself, which needs a
  hook, a render-time branch and a hydration mismatch. The size would stop at every
  popover and dialog.
- **Both: the media query and a size to opt out.** Rejected: the opt-out is the
  token; a second channel would say the same thing twice.
- **`sm` at 32 under a finger as well.** Rejected: every table and calculation row
  on a tablet would grow from 36 and 35 px to 41, so a dense surface would lose
  about a sixth of its rows. A dense place's 26 px is above the 24 px floor.
- **40 px, the large scale of Adobe's Spectrum.** Rejected: 44 is the number
  published as a target, in WCAG 2.5.5 and the HIG, so a reader can check it.

## Consequences

- ~~On upgrade, every application on a touch device sees its `md` controls at 44 px.
  Core's changelog states it under "Changed", with the line that restores 32.~~
  Superseded by ADR-0079: a `md` control stays 32 px on upgrade.
- Later touch work uses this signal. Where a component hands a control to the
  platform on touch, it decides per gesture, as the Select does, or by CSS, never
  by a render-time test.
- The date pickers keep their panel under a finger; their year Select reaches the
  platform's wheel through the Select (ADR-0043), and nothing else is handed over.
- **Under a finger** is a glossary term: the primary pointer is coarse. Sizes and
  hit areas follow it, and a behaviour follows the gesture's pointer type.
