# 02 - Core's states

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/forced-colors/spec.md`

## Scope

FC2, FC3 across core.

## Acceptance

- Forced-colour screenshots of the core page heads; axe clean.

## Comments

**Delivered** with 01 and 03.

- Beyond the states: every edge and every card's or overlay's depth is a
  box-shadow, and forced colours made a button a word and a field a line of
  text. Every resting rule that draws an edge or a depth carries
  `outline: 1px solid transparent` (37 sites; the canon check `edge` holds
  it), and every `Button` carries it too.
- States: tab underline, switch on, progress and meter fill, slider track
  (`forced-color-adjust: none` to keep its gradient, in system colours) in
  `Highlight`; checkbox dash, radio dot, divider in `CanvasText`; combobox and
  command-palette cursor, active tree node, chosen day, range ends, band and
  preset as outlines in `Highlight`; badges, tags, chips with an edge; the
  accordion's section line a border.
- FC3: every verdict keeps its word; nothing needed `forced-color-adjust:
  none` for its colour. The meter's tone (colour alone, no word) goes to
  `Highlight` - FC3 keeps a colour only where a word stands beside it.
- Pictures: the FIRST EXAMPLE of every page, not the page head - a page head
  is title, import line and copy button and shows no component. Plus a
  combobox's cursor and a chosen range (viewport, panel at rest). Axe under
  forced colours over the sample with `color-contrast` off
  (`FORCED_BY_THE_SYSTEM`, reason at the site): axe reads
  `-webkit-text-fill-color`, which Chromium resolves against the unforced
  colour, and reported the dark primary button as #171717 on black while it
  showed white.
- The suite stands in the shell (`@umriss-ui/demo/checks/forcedColors.ts`),
  as `ownBase` and `overlays` do.
- Left for 04: badge dots leave a gap; primary and secondary buttons look
  alike; the slider on moz untested.
