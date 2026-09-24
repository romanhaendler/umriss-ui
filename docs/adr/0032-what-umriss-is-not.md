# What umriss is not

Status: accepted
Date:   2026-09

The library comparison of September 2026 (`docs/research/library-comparison-2026-09/`)
put umriss beside MUI, Mantine, AG Grid, ECharts, Bryntum and a dozen others,
and its verdict was plain: as a general component library umriss loses, as a
library for plant screens it has hardly any competition. Every row in those
tables where another library has a tick and umriss has a dash is a question a
reader will ask - "not yet, or never?" Until now the answers stood in scattered
"Out" lists, in the "Out of scope" sections of specs, or nowhere. A dash with no
answer reads as "not yet", and a library whose argument is honesty cannot leave
a reader to guess.

**umriss is a React library for the screens of a producing plant - values read
against their limits, a machine's day, a shift's schedule, a calculation a
planner can check - in English and German. What does not serve such a screen is
not built, however common it is elsewhere.** The list below is the "never"; what
is only "not yet" stands in each package's record and in the open specs under
`.scratch/`, and waits for a caller who needs it.

## Everywhere

- **More languages than English and German, and right-to-left.** Two wordings
  ship (ADR-0019), and each register is a type, so a third language is a typed
  object any application can pass - umriss does not write it. RTL is not a
  wording but a mirrored layout of every component, the canvas axes included;
  for a plant library in German- and English-speaking plants that is a second
  library's worth of testing for no reader it has. *Instead:* pass your own
  wording object; for RTL, a general library.
- **Rich text, carousel, and the rest of a marketing site's parts.** An editor
  is a product of its own (Mantine wraps Tiptap for it), and a carousel hides
  all but one value at a time - the opposite of a plant screen, which shows
  everything at once. *Instead:* a dedicated editor; for a carousel, a list.

## The table

- **Pivot.** A pivot turns rows into columns chosen at runtime, and with it the
  column declaration (ADR-0017) stops being the source of the columns. It is an
  analysis tool, and the analysis is the application's - or a BI tool's.
  *Instead:* compute the pivoted rows and declare their columns; grouping with
  aggregates (ADR-0029) covers "the same measure per line and shift".
- **Cell range selection and undo.** Both belong to a spreadsheet: a range is
  what one copies into Excel, and undo presumes the table owns the data. The
  table does not own the data - editing, when `table-grid-mode` brings it,
  reports what was typed and applies nothing, the rule ADR-0023 set for the
  schedule. An undo stack in the component would be a second truth beside the
  application's. A clipboard for ranges goes with the ranges; copying rows
  stays among the "later" items of `.scratch/comparison-roadmap/spec.md`.
  *Instead:* undo in the application's state, where the data lives; select
  rows, not ranges.

## The charts

- **Pie, donut, radar, candlestick.** The set of kinds is closed - there is no
  renderer interface for third parties - and none of the four answers a question
  a plant screen asks: a share is read better from sorted bars (`pareto()`), a
  profile from a line, and candles are for markets. *Instead:* `pareto()` with
  `Bar` and `Line` for a share, a `Line` per axis for a profile.
- **A log scale and a category scale.** Every scale is affine, and the drawing
  loop and the operating-time axis rely on it (ADR-0001); categories are numeric
  positions with a naming `tickFormat` (ADR-0002). *Instead:* for values over
  decades, a second y axis with its own extent, or the logarithm computed in
  the accessor and named in the `tickFormat`; for categories, their index on x.
- **WebGL.** Downsampling keeps a week of seconds under 25 ms on Canvas 2D
  (`packages/charts/docs/capabilities.md`); a second renderer would double
  every kind for figures no plant screen needs. *Instead:* a WebGL specialist
  for tens of millions of points.
- **Smoothing, animation, export, horizontal bars.** A smoothed curve invents
  values the plant never measured, an animated one is harder to read, a canvas
  already exports itself (`toDataURL`), and bars grow along the y axis. Each is
  argued in the capability record's "Out". *Instead:* `Line step` for what was
  held, `canvas.toDataURL()` for a picture, a `Matrix` or bars on x for a
  ranking.

## The schedule

- **Dependency types and a critical path.** Finish-to-start, start-to-start and
  the rest, with lags, slack and auto-scheduling, are a project-management
  engine: they decide where a task goes. The schedule draws where the
  application put a task and reports what a planner wants to change (ADR-0023);
  it computes transports and findings, never a plan. A Gantt engine is the
  commercial tier of Bryntum, DHTMLX and SVAR for a reason - it is a product of
  its own. *Instead:* the application's planning system decides, and the
  schedule shows the result and the findings.

## Consequences

- A request for any of these is answered with this ADR, not with a discussion.
  It is not a wall: a caller who brings a plant-screen question one of them
  answers reopens it, and the ADR is superseded, not edited.
- umriss will look narrower than a general library in every comparison table.
  That is the price, and it is paid on purpose: every item here would cost a
  test suite, a design pass and a maintenance share that the plant components
  would otherwise get.
- The capability record's "Out" (`packages/charts/docs/capabilities.md`) and the
  "Out of scope" sections of the specs keep their detail and point here; this
  file carries the reasons, they carry the case.
