# A chart reports the hit a reader chose

Status: done
Date:   2026-10-11
Origin: `packages/charts/docs/capabilities.md`, "Later": `onSelect`. The
maintainer decided on 10 Oct 2026: report only, no `selected` prop.

## Problem

The chart has a hit model (the tooltip) but no way to tell the application that
the reader chose one. What a selection is stays the application's: an active
node is not a selection (ADR-0003) and components report (ADR-0023). So the
chart reports the hit and holds, draws and remembers nothing.

## Decisions

| Question | Decision |
|---|---|
| Where it lives | `onSelect` in `ChartOptions` of `useChart`, beside `onViewChange`; `ChartOptions` gains the row type `Z` (default `unknown`). Not a prop on `Chart`: the hook is where the row type is bound |
| What is handed over | The `TooltipHit<Z>` a custom tooltip's `render` receives (`xValue`, `points` with `seriesName`, `xValue`, `yValue`, `datum`, `index`, pixel positions). No second shape |
| Selection state | None. Nothing drawn, nothing kept; no `selected` prop |
| Pointer | A click that lands on a hit (the Active point under the pointer) reports it once |
| End of a drag | Does not report: a press that travelled more than 4 px before its click is a pan (`scene.ts`, `pointerDown`/`drag`) |
| Double click | Reports once, on the first click (`event.detail > 1` is ignored); the double click resets the zoom as before |
| Touch | A tap reports too: it already shows the tooltip, so the hit is on the screen, and the click that follows a tap is the same event |
| Keyboard | Enter on the Active point (ADR-0030), without Shift. Space is left alone (nothing needs it, but the legend uses it and the plot has no other use yet) |
| Key help | The summary adds `selectHelp` ("Enter chooses the point.") only where `onSelect` is given; English default, German "Enter wählt den Punkt."; a new `ChartsWording` entry |
| Without a Tooltip | No hits, so nothing is reported; the development build warns once (`warnOnce`), the production build is silent |
| `syncId` | The hit does not travel; only the pointer's x does, as before |
| Handler identity | The latest `onSelect` is read when the reader acts (as the hook's rows); a new function each render needs no memo |
| Example | "Choose a hit" on the Tooltip page: a chart beside the detail of what was chosen, held in the example's own `useState` |

## Out of scope

- A drawn selection or a `selected` prop (the application draws what it keeps,
  e.g. with its own series or `LimitLine`).
- Selecting a range, and a navigator under the plot:
  `.scratch/chart-range-selection-and-navigator/spec.md`.
- Reporting a click on empty plot, a legend click, or the data table's rows.
- Space as a second key.

## For the maintainer to look at

- The 4 px drag threshold and "double click reports on the first click":
  alternatives are reporting on the click's own `detail === 1` only after a
  delay (rejected: a delay for every click), or on every click (twice).
- Tap reports: confirm that is wanted on a touch chart whose tap also pans.
- `ChartOptions` now generic: a caller who named the type without arguments is
  unaffected (default `unknown`).
- `selectHelp` is a new required wording key; a custom `ChartsWording`
  written out in full needs it.
- The example sits on the Tooltip page; the `onSelect` paragraph in the page's
  "about" and the row in `capabilities.md`.
- Tests: `packages/charts/tests-unit/onSelect.jsdom.test.tsx` (click once, double
  click once, Enter, drag does not, summary, warning). No screenshot baseline
  for the example yet.

## Comments

**Accepted and released (2026-10-11).** The maintainer checked it by hand on the running demo ("Alles händisch geprüft, sieht gut aus") and took the decisions above as they stand; released in @umriss-ui/charts 0.15.0.

The decision is recorded in ADR-0056, written after the release.
