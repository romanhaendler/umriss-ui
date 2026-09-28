# Device review - every component on phone, tablet and laptop

Status: resolved

## Ask

Before the final presentation to customers: check every component of every
package for faulty rendering on other devices, fix what is found without
asking, and keep a record. Reported beforehand: the `Stepper` is not right on
phones.

## Method

Every page of the five demos (132 pages, 457 examples) was photographed at
four sizes - iPhone SE (320 px) and iPhone 13 (390 px) in WebKit, iPad portrait
(768 px) in WebKit, a 1024 px laptop in Chromium - and checked twice:

- a DOM audit per page: page wider than the screen, elements outside it,
  clipped content without an ellipsis, words broken across lines, text
  overlapping text, text spilling out of its box;
- two visual passes over every example and page slice, the second after the
  fixes, which looked for what the fixes had broken as well.

Page overflow went from 135 page-and-size pairs to none at 360 px and above.

## What was found and fixed

**core**
- `Stepper`: horizontal labels ran into each other and the lines struck them
  through. It now measures a hidden copy of its list and stands as a row,
  with labels beneath the markers, or as a column (`fit.ts`, `data-fit`).
  The desktop picture of "Where a procedure stands" showed "Acknowledge"
  overrunning its line already; that example now has room for its row.
- `CardHeader`: actions squeezed the title to a word a line; they wrap
  beneath a title that would get less than 8rem.
- The pickers' clearing cross lay on the last digits of the value on touch
  screens ("18.03.2026"); the value keeps room for it.
- `FileInput`: a long file name ran out of the zone and hid its cross.
- `Checkbox`, `Switch`: control centred on a wrapping label, now at its first
  line.
- `Input type="search" clearable`: two crosses; text ends in an ellipsis.
- `Textarea`: count on the resize grip.
- Touch targets of the small crosses and the number steps are hit larger
  than drawn, under a coarse pointer only.

**charts** - x labels no longer overlap (fewer generated ticks, then two-line
category names, then every k-th); time axes no longer stretch or take odd
steps ("07:46"); a broken phone axis ("23:26 · 13:20 · 03:13") came from
examples plotting timestamps on a number axis; limit labels keep apart and
stand inside a narrow plot; markers on the plot's edge are whole.

**schedule** - dates on narrow days cover runs of days instead of
colliding; group names win over their counts; lane labels may take a second
line; day lines stop under the date labels.

**table** - pinned blocks give way on a narrow table; the pager wraps as
one; short ids and dates stay whole; the empty message stays in view; the
alarm column keeps 10rem; a table that scrolls sideways fades at that edge.

**demo shell** - head bar at 320 px; API tables and keyboard tables as blocks
on a phone; type names whole; descriptions render `code` and **bold**; the
ADR link styled; the import line wraps with its copy key in sight; callout
marks sit beside their spot, stay on the stage and follow inner scrolling;
page names shrink on a phone.

**examples** - Breadcrumb, ContextMenu, Divider, ButtonGroup, Meter,
Sparkline, Stack and Grid, Tag, MultiSelect, Menu, the team and invoice
scenarios, calculation's invoice scenario; several schedule and table
examples (plates with non-breaking spaces, chip padding, column order).

## Deliberately left

- Fields write at 16 px under a coarse pointer: iOS would otherwise zoom
  into every field (`own.module.css`).
- `Select`'s `style` sizes the `<select>`, not its wrapper (core-passthrough);
  the filter bar example sizes a wrapper instead.
- Wide tables, the sparkline table and the flush log scroll inside their own
  box on a phone.
- An open lane group head stays one line; a working calendar's time band
  stays blank at a one-day step (the step is also the drag's snap).
- Table: the empty toolbar band (table-filters D1), the row draft's reserved
  column (ADR-0036).
- 320 px: axis 01's three y axes leave a narrow plot; calculation's front page
  reports 15 px of scroll width in WebKit's iPhone SE emulation from a native
  `<select>` that draws nothing outside the screen.

## Baselines

This ticket moves the desktop pictures its fixes change: every Scenario in
all five demos (the callout marks moved), the Stepper, Breadcrumb, Tag,
Language, Switch examples, the command palette and drawer windows, and the
charts, schedule and table pictures listed in the fix reports. Each diff was
opened before it was renewed.
