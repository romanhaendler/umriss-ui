# The charts for keyboard and screen reader

Status: done
Date:   2026-09-24
Origin: `.scratch/charts-review/spec.md`, rows Q11 and Q26.
Decisions: ADR-0030 (one tab stop, one Active point), ADR-0031 (the charts'
own wording). Glossary: **Active point** in `CONTEXT.md`.

## Problem

A chart offers nothing to a keyboard and little to a screen reader: the plot
area is `role="img"` with a label, the canvases are `aria-hidden`, the tooltip
is `role="presentation"` with no live region, and there is no `tabIndex` or key
handling anywhere in `packages/charts/src`. A user without a pointer learns the
chart's name and nothing it shows.

## Decisions

Grilled on 24 Sep 2026. Q1-Q7 were put to the user, who took every
recommendation; the rounds after that were decided on the same footing and are
recorded here so they can be challenged.

| # | Question | Decision |
| --- | --- | --- |
| Q1 | How the keyboard gets in | A chart with a `<Tooltip>` makes its plot area **one tab stop**: `role="application"`, `aria-roledescription` "chart", the existing `aria-label`. Without a tooltip it stays `role="img"`, no tab stop. No stand-in element per point. |
| Q2 | The walk | ←/→ previous/next x position across the visible series; Home/End first/last position in the visible domain; PageUp/PageDown a tenth of the visible domain; ↑/↓ change the emphasised series (the legend's hover emphasis). Gaps are skipped, as by the pointer. |
| Q3 | Name and number of cursors | One **Active point**, set by pointer and keyboard alike, the last input winning; drawn as the hits (crosshair, markers, tooltip); travels over `syncId`. No selection. |
| Q4 | What is spoken | A polite live region, fed only by keystrokes, never by the pointer. It reads what the tooltip shows: x, then series with name, value and unit, the emphasised series first; formats from the series' `format` and the axis' `tickFormat`. |
| Q5 | Data table | Not now. A summary in the plot's description instead. A table on demand is a later ticket if asked for. |
| Q6 | Zoom by key | Only with `onDomainChange`: `+`/`−` zoom around the Active point, Shift+←/→ pan, `0` asks for the data extent. The walk never pans by itself at the edge; after a domain change the Active point moves to the nearest visible position. |
| Q7 | Words | A typed `ChartsWording` with English defaults, prop `wording` on `Chart`, German behind `@umriss-ui/charts/wording/de`. Existing string props win. |
| R1 | Where the walk starts | On focus with no Active point: the last position in the visible domain (a time series' newest value). One set by the pointer stays. |
| R2 | Leaving | Escape clears the Active point, the focus stays. Tab leaves. |
| R3 | Pointer and keyboard | `pointerleave` clears the Active point only when the pointer set it. |
| R4 | Hidden series | Neither emphasised by ↑/↓ nor contributing positions. |
| R5 | Positions | The union of x over the visible series within the visible domain; for bars, the categories. |
| R6 | Scatter under `"nearest"` | ←/→ step through the emphasised series' points in x order; ↑/↓ switch series. |
| R7 | Other kinds | Matrix: four arrows cell to cell, Home/End to the row's ends. StateBand: ←/→ from state change to state change, ↑/↓ lane to lane. ControlChart: as a line. Limit lines and bands are no walk targets. |
| R8 | How focus looks | The plot area shows the charts' `--uc-focus-ring` on `:focus-visible` (inset, so it survives the clip); the Active point draws as the pointer's hit. |
| R9 | API | No public Active point (no `onActiveChange`): nobody has asked, and sync already carries it between charts. |
| R10 | Summary | A visually hidden element tied by `aria-describedby`, not live: the kind, the series by name, the visible x range, each series' minimum and maximum there, and the key help. Rebuilt on data, domain or visibility change. |
| R11 | Pace of speech | The readout is written 150 ms after the last keystroke, so a held key speaks where it stops, not every step. The tooltip follows every step at once. |
| R12 | Release | A minor: `@umriss-ui/charts` 0.6.0 with the new subpath. |

## Solution

| Ticket | Scope |
| --- | --- |
| 01 | The wording register (ADR-0031) and its subpath |
| 02 | The Active point and the walk (Q1-Q3, R1-R9) |
| 03 | The readout and the summary (Q4, R10, R11) |
| 04 | Zoom and pan by key (Q6) |
| 05 | Examples, capabilities, release (R12) |

## Testing

- The walk as a pure function over materialised series - positions, gaps,
  hidden series, the visible domain, the kinds of R7 - tested in unit tests at
  that seam, with known-good literals.
- Interaction tests in the charts' Playwright projects: Tab reaches the plot,
  the keys of Q2/Q6/R2 move and clear the Active point, the pointer and the
  keyboard hand it over (R3), a synced chart follows.
- The readout and the summary checked as text in jsdom.
- axe stays clean on every sample page, with no new tolerated pair; the
  own-base focus check finds the new tab stop and its ring.
- One screenshot per theme of a focused chart with an Active point.

## Out of scope

A data table; touch; announcing pointer moves; a public Active point API.

## Comments

**Delivered** in `@umriss-ui/charts` 0.6.0, tickets 01-05. The walk is a pure
module (`walk.ts`, 16 unit tests); the scene reuses the hit test for every
keyboard position. Tests: jsdom for keyboard (10), readout and summary (4),
zoom keys (4), wording (4); two Playwright interaction tests (Tab and keys;
pointer handover and sync); a focused-chart screenshot per theme; axe clean on
every sample page with no new tolerated pair.
