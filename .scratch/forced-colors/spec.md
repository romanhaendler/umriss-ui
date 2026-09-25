# The library in the Windows contrast mode

Status: done
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

No rule in the workspace answers `@media (forced-colors: active)`. In the
Windows contrast mode the browser replaces colours: box-shadow rings vanish (the
library draws every focus ring as a box-shadow), surface-only states (selected
row, pressed key, the accent-subtle band) disappear, verdict colours collapse.
None of the headless libraries documents this either - the comparison names it
the place umriss can lead.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| FC1 | Focus | Every ring gets a transparent `outline` beside its box-shadow, which forced colours paints in the system colour - one rule in `#own-styles` `ring`, not per component. |
| FC2 | States | A state shown only by a surface (selected, pressed, current, active option) gets a border or outline in forced colours; `aria-*` already carries it for AT. |
| FC3 | Verdicts | The verdict word and glyph stay; colour chips get `forced-color-adjust: none` only where the colour IS the information and a word stands beside it. |
| FC4 | How is it held? | Playwright projects' `forcedColors: "active"` emulation: axe plus a screenshot per demo page head in forced colours, and a stylesheet guard that every `:focus-visible` rule's ring has its outline. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | The ring survives | S |
| 02 | Core's states | M |
| 03 | Table, schedule, calculation | M |
| 04 | Final polish round | S |

## Testing

Playwright with forced-colours emulation (a project or a test option), the
stylesheet guard, axe.

## Out of scope

The charts' canvas (`charts-alternatives` ticket 03).
