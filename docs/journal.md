# The journal

What was worked on in this repository, newest first. It is a work journal and
**not** a changelog: nothing here is a promise to a caller, and no version number
is announced. What changes for a caller of a package stands in that package's own
changelog, and an entry here names it where one exists.

This document records what was *worked on in this repository* — rebuilds,
tests, findings and decisions that are invisible from outside. What changes for
a **caller** of a package stands in that package's own changelog
(`packages/core/CHANGELOG.md`, `packages/table/CHANGELOG.md`,
`packages/charts/CHANGELOG.md`, `packages/schedule/CHANGELOG.md`). The two deliberately do not run in parallel:
an entry there can be missing here because it was no work of its own, and one
sentence here can summarise three entries there.

**Names read forwards.** Entries that describe a name which has since been renamed
name it as it is called today; where a thing is gone altogether, its name stands
as it stood.

## Sep. 2026 — The charts examined, and one focus

*For a caller: core 0.4.0, charts 0.4.0, table 0.2.3, schedule 0.1.3 - each
changelog carries the lines.*

- **The charts, read in full.** A grilling session examined every chart
  (`.scratch/charts-review/spec.md`): fourteen bugs, the API's gaps, and what a
  plant screen expects. The work went into four packages, each ticket test
  first: examples for the five pages that had none (`charts-demo-examples`),
  the bugs and the removal of `Span` (`charts-fixes`, ADR-0026), time axis,
  value format, step line, hidden series and empty state
  (`charts-essentials`), zoom, visible domain, downsampling, cursor sync and
  `alignTicks` (`charts-long-series`). Keyboard and screen reader
  (`charts-a11y`) wait for their own grilling.
- **Two findings from writing the examples** - a caller's `var(--…)` colour
  drew nothing on the canvas, a state band's last state ran to the axis'
  padding - were fixed after a two-axis review (standards and spec) of the
  whole range; its confirmed findings are fixed with a test each.
- **Core: one focus look** - a two-pixel accent edge on every component - and
  fields that stay put on an iPhone. Worked on in a session of its own beside
  the charts; the two met only in the charts' legend, whose focus ring now
  couples through `--uc-focus-ring`.
- **The charts' example pictures drift more.** With twice the examples, 13 to
  30 fail on a full run, a different set each time, each a sub-pixel shift;
  `testing.md` carries the numbers. Baselines were renewed only where a
  picture really changed.

## Sep. 2026 — Phones and touch, then a review of all four packages

*For a caller: core 0.3.2, charts 0.3.2, table 0.2.2, schedule 0.1.2 - each
changelog carries the lines.*

- **Measured, not guessed.** Every page of the four demos was opened at 390px
  in a phone context (touch, `isMobile`) by throwaway scripts: what leaves the
  window, what leaves its example, and what every popup trigger opens. Found:
  a `VisuallyHidden` in a table cell escaped the table's scroll box and widened
  the whole page to 758px (the phone zoomed out); the range pickers' panels
  were 572-712px wide; the table's toolbar and paging bar ran out of the frame;
  a limit label was cut at the plot's edge (on the desktop as well); the chart
  tooltip never came on a tap; the clear buttons faded in on hover only.
- **The shell.** On a narrow window the outline stands below the page, not
  forty entries above it; the props table scrolls in its box instead of
  breaking a type after every letter; long `<code>` in the prose breaks.
- **The review.** Four agents read one package each for defects that need no
  decision; what they fixed stands in the changelogs, each fix with a test.
- **The charts' example pictures** fail in a different handful on every run -
  the known open point in `testing.md`; the baselines were renewed once for the
  intended changes (limit labels in the y band, re-measuring after web fonts).

**Open, each needing a decision:**

- core: the toast timer does not pause on keyboard focus; `Tooltip` overwrites
  its child's `ref`; the card's collapse button is named only "Show"/"Hide";
  Tab out of a picker or `MultiSelect` panel leaves it open; the menu trigger
  does not open on ArrowDown; `ModalHeader`'s `description` is not wired to
  `aria-describedby`; the tab underline does not follow a label that changes
  width; German internal identifiers (`beimSchliessen`, `anker`, ...).
- charts: legend highlight by pointer only; hover reports points outside a
  fixed domain; x-axis limit labels reserve no room; `Area`/`Bar` have no
  `tone`; the DEV sortedness check sees only the first series; the tooltip has
  no `max-width`; no data alternative for screen readers.
- table: `ReturnBand.direction` is `"obere" | "untere"` (ADR-0018); CSV writes
  German regardless of the wording; CSV formula injection; no sort affordance
  and no multi-sort on touch; search on number and date columns matches the
  raw value; row detail and virtualisation do not combine; PageUp/PageDown in a
  virtualised table; a search of only spaces counts as active.
- schedule: no tooltip on touch; lanes mounted later go to the bottom; the
  tooltip is cut on a narrow plot and names no date; a transport's heading
  shows its own id when its task is missing; an `initialDomain` wholly outside
  the calendar collapses.
- Touch targets: checkboxes (16px), the table's expander and filter buttons
  (20px) and the schedule's fold chevron (16px) are below 24px and rely on the
  spacing exception of WCAG 2.5.8.

## Sep. 2026 — schedule-lane-groups: lanes that fold

*For a caller: `<LaneGroup>` and a folded group's miniature, every appearance
drawn differently, a refusal that is seen before it is met, and a demo cut by
feature. The schedule's changelog carries the lines.*

Delivery report for `.scratch/schedule-lane-groups/spec.md`, tickets 01–11.

- **The layout stopped multiplying.** `src/rows.ts` turns the lanes, the groups
  and the folded set into ROWS with a `top` and a `height`, and gives every
  real lane a SLOT — its own row, or its strip inside a miniature. Everything
  that needed a y reads it: the bars, the transports' ends, the grid, the
  overlaps, the grips, the refused lanes and both directions of the handle.
  Written test-first, because every y in the package comes from it, and the
  first thing its 21 tests ask is that a FLAT plan lays out exactly as
  `laneIndex * laneHeight` did. It did: **not one baseline moved** in that
  ticket.

  *Row* is the module's private word and appears nowhere in the API. "A lane is
  not a row" is a standing sentence of this component, and a layout that called
  them the same thing would have broken it by accident.

- **Three defects the code could not show and the picture could.** A cap flush
  with a bar's end is not a mark — on a light page it reads as the bar starting
  three pixels later, and the dark scheme had the same problem with the other
  colour; the caps sit inside now. A bar label lay ON the cap, which is exactly
  the complaint that took the hatch off the bar's face. And the label's
  contrast rule — one luminance threshold — was wrong for a mid-tone bar, which
  a muted bar is by construction: it is measured against both candidate colours
  now, and needs no tuning in either theme.

  All three were found by rendering the example and looking at it, twice at
  eight times magnification. The lesson is cheap to write down and was not
  cheap to learn: for a ticket whose deliverable is a PICTURE, reading the
  diff is not the check.

- **A test that passed for the wrong reason, twice.** One claimed a ghost stays
  on press 1 and compared against the MIDDLE of press 2 — true of a bar on
  press 2 as well. Another aimed at a cap and hit the anti-aliased edge of the
  bar beside it. Both were rewritten against what they meant.

- **`tests-visual/pixels.ts`** is new: `painted`, `paintedShare`, `rgba`,
  `colour` and `distanceFrom` count and compare paint inside a rectangle of a
  plot's canvas, counted in the browser so that two million numbers never cross
  into the test. It is what lets a promise about a DRAWING be a test —
  "hollow", "capped", "faded at the left", "a rail that stops at the main
  time" — instead of a snapshot that only says something changed.

- **`plot.ts` stopped multiplying too.** It named lanes instead of numbering
  them (04) and then read each row's height from the header the plot really
  rendered (08). The second change found a defect the first would have hidden:
  with a group's slim head above them the rows are no longer all 44 pixels.

- **The demo was re-cut by feature**, from seven chapters to twenty-eight. The
  renames are verified twice — every example moved with `git mv` and unedited,
  and ten baselines are byte-identical under their new name. The five that
  re-rendered were compared pixel by pixel first: the plot is byte-identical
  and every difference sits in anti-aliased TEXT, which is the drift
  `docs/testing.md` already records for the charts and which has now reached
  the schedule because its examples moved to different scroll positions.

- **Every example carries its own data.** `@umriss-ui/demo/checks/ownData`
  holds it: an example may import the package's `src` and bare npm specifiers,
  and whatever else it needs it SHOWS beside itself as a second tab of the code
  view. Run before the repair it named all 25 offenders, in the two demos that
  had them; `core` and `table` passed untouched. The charts' thirteen examples
  are repaired the way the check allows and their code is copyable for the
  first time.

### Decisions

1. **`dropEffect` follows the ghost, not the pointer** — the spec asked for
   `"none"` over a refused lane, and the platform then delivers no `drop` event
   at all, which would have broken the standing promise that a ghost is where a
   drop lands. Roman's call, recorded in ticket 01.
2. **The spring-open delay stayed a constant.** Making it injectable would have
   put a 600-millisecond animation delay into the public surface of
   `<Schedule>` to save four tests two seconds each.
3. **`ResolvedAppearance.hatched` keeps its name** although the hatch left the
   bars, because the spec said `resolveAppearance` stays as it is. Its doc now
   names the channel it really owns.

### Open

- **`onDomainChange` and `initialDomain` can stand a frame apart.** Two
  schedules in step disagree by about one move of a drag while it runs: the
  span is reported once per frame and handed back as the other's
  `initialDomain`, and the round trip through React arrives after the plan has
  moved on. Found by a test written for something else, recorded in ticket 04,
  belongs to no ticket of this spec.
- **A muted bar and a setup are the closest pair in the picture.** 50 per cent
  of the task colour against 28, distinguishable and guarded by a measured
  distance — but if "without doubt" is not met, the number to move is the mix
  in `barFace` and nothing else.

### Evidence

`pnpm typecheck`, `pnpm lint` (0 errors) — clean. Unit: 196 in the schedule,
1959 across the workspace. `pnpm test:visual` for the schedule: **293 green**,
143 skipped (the behaviour tests run light only). Baselines: 70 at the start,
132 at the end — 18 byte-identical under new names, and every renewal counted
and named in its ticket.

## Sep. 2026 — schedule-legibility: a plan one can read

*For a caller: bars can carry text, transports have routes and anchors, bars
have appearances and a progress rail, and `canMoveTo` narrows where a drag may
land. The schedule's changelog carries the lines.*

Delivery report for `.scratch/schedule-legibility/spec.md`, tickets 02–06.
Ticket 01 (the formats) has its own entry below.

- **The check came before the features**, deliberately: `overlays.ts` walks
  every page and holds two invariants - every overlay inside its clipping box,
  no two labels of a kind over each other - and it was shown to fail on the
  defect it was written for before anything was built on top of it.
- **It earned its keep the same afternoon.** With the bar labels in, it
  reported two labels covering each other on the mill. They do, because their
  bars do, and that is the overlap the demo plans on purpose: a label IS its
  bar, so the "apart" invariant does not apply to it, and the element says so
  itself.
- **Two appearances were redrawn on Roman's objection:** a faint fill already
  means a setup or a teardown, so "another shift" and "65 per cent done" could
  not be told from a run-out time. Muted is drawn slim at full colour now, and
  progress runs as a rail along the bar.
- **The glossary decided a colour.** The schedule's refusal was first drawn in
  the danger colour; `CONTEXT.md` says a **Refusal** is not an error and wears
  no warning colour, which is why the dock's does not. The schedule's does not
  either now, and the entry names both.
- **Two hours went to the pictures**, and both lessons are in
  `docs/testing.md`: a reused preview server serves the build it was started
  with, and `--update-snapshots=missing` does not renew a picture that already
  exists. Either one makes a change look as though it had not taken effect.

## Sep. 2026 — schedule-legibility: English formats first

*For a caller: `DEFAULT_FORMATS` is English, German ships as `GERMAN_FORMATS`
beside the German wording, and `NumberInput` reads the notation it writes.
core's changelog carries the lines.*

Delivery report for `.scratch/schedule-legibility/spec.md`, ticket 01
(ADR-0024). The rest of that spec - text in the bars, transport routes, bar
styling, where a subtask may go, and the check against the picture being in its
own way - follows in tickets 02–06.

- **The question had been open since ADR-0019**, which made the wording English
  and said so of the formats: "the locale of the formats is a decision about a
  different object and deserves its own". Roman asked why the schedule's dates
  were German; this is the answer, and `en-GB` keeps the day first and the clock
  at 24 hours, the two things an operations screen is read wrongly without.
- **One set per locale.** `formatsFor(locale)` replaced twelve hard-wired
  `de-DE` tags; `DEFAULT_FORMATS` is its English instance and `GERMAN_FORMATS`
  its German one, shipped behind the subpath that already carried the German
  wording.
- **A defect the change would have caused, prevented:** `NumberInput` parsed a
  dot as a thousands separator by hand, so under English notation it would have
  read its own output wrongly. The separators are measured off the formats now
  (`separatorsOf`), which also holds for a notation an application replaced.
- **39 pictures moved** - 2 in core, 21 in the schedule, 16 in the table - and
  three charts pictures were **restored** after the bulk renewal: the charts
  write their axis labels with their own formatter, so nothing of theirs could
  move, and what the renewal had caught was the known flutter. Checked by
  restoring them and running the charts projects again, where a different three
  failed.

## Sep. 2026 — schedule-refinement: the schedule in daily use

*For a caller: the wheel and the selection callback changed; tooltip, now line,
auto-pan, shift raster, whole-order shift, the place intent with drag from
outside, the domain report and a ref handle are new; core gains six wording
entries. The two changelogs carry the lines.*

Delivery report for `.scratch/schedule-refinement/spec.md`, tickets 01–09.

- **The scene was divided first**, because everything else touched it: one
  thousand lines doing six things became registration and data, view and
  layout, drawing, gestures, and a scene that joins them. Nothing was allowed
  to change while it happened - the ticket's acceptance was that no test and no
  baseline moved, and none did.
- **The wheel now behaves like every other scrolling area.** Zooming on every
  wheel movement had trapped the wheel on a long page and left twenty lanes
  unreachable by it. Ctrl, ⌘ and the pinch zoom instead; the plain wheel scrolls
  the lanes and stops preventing the default once they are at their end.
- **Two bugs the work turned up.** A drag anchored on the pixel it started at,
  which auto-pan moves under it - it anchors on the operating time now. And
  after a drop the hover was not read anew, so the tooltip named the times a
  subtask had before it moved until the pointer moved again.
- **A picture moved for a reason worth writing down:** the demonstration's,
  because a new example above it made the page longer and the canvas landed on
  other half pixels. Measured on three repeats and confirmed by removing the
  new example again; the finding stands in `docs/testing.md`.
- **The dock's word grew a second home.** The schedule's setup and teardown
  grips are the dock's gesture - press the small thing to move the big one - so
  `CONTEXT.md` widens **Grip** rather than inventing a second word for it.
  **Place** and **Now line** are new there.

## Sep. 2026 — schedule: a fourth package

*For a caller: `@umriss-ui/schedule` is new; core gains `ContextMenu` and three
wording entries; charts publishes `resolveColours`, `subscribeTheme` and
`toOperatingTimeClamped`. The changelogs carry the lines.*

Delivery report for `.scratch/schedule/spec.md`, tickets 01–08 (ADR-0022,
ADR-0023).

- **The first dependency on charts.** The schedule takes the scale, the time
  steps, the operating calendar and the canvas colour resolution from charts'
  public entry, and core's styling regime, provider and wording from core's. The
  lint holds both directions. Wiring it up found a hole in the lint beside it:
  the configuration block that forbids charts' demo to import the table also
  matched `packages/charts/src/**`, and as a later block of the same rule it
  replaced the R-1.2 ban on core there. The block now leaves `src/` out.
- **Pictures that reproduce.** Every position reaches the canvas through
  `Math.round`, and the fifty schedule baselines passed three consecutive runs -
  evidence for the root fix `docs/testing.md` names for the charts.
- **Editing through the seam.** The browser suite drags, reads the ghost's
  label for its times and findings, and compares the reported intent as JSON;
  nothing in it reads a pixel.
- **Baselines moved in core:** the overview and the palette window, both of
  which had still shown the former brand; the new `ContextMenu` page added its
  own.

## Sep. 2026 — styles-without-side-effects: one import, no side effects

*For a caller: no stylesheet import, no base layer, cascade layers, light and dark
through `color-scheme`, `UmrissProvider` without `theme`, charts classes `uc-*`.
The three changelogs carry the lines.*

Delivery report for `.scratch/styles-without-side-effects/spec.md`, tickets
01–08 (ADR-0021).

The question was asked plainly: why does a caller import a stylesheet at all, and
why does importing one button change the page? The measured answer before the
work: the JavaScript loaded no CSS, and `global.css` styled `html`, `body`, `*`,
the focus of everything, the selection and the page's scrollbars. `tokens.css`
set `color-scheme` on `:root`, and the provider wrote `data-theme` and
`data-density` onto `<html>`. An experiment with `global.css` emptied kept every
behaviour test green and moved 412 screenshots, which showed what the components
had been leaning on.

- **The build does the mechanical part.** `scripts/styles/` holds the rules and
  three build steps. `ownBox` gives every class of a stylesheet `border-box`,
  and a type-named subject its full selector, never a caller's `*`. `ownCorners`
  adds squircle corners after every own radius. `importOwnCss` puts the
  stylesheet import at the head of the entry chunk. `check-dist.ts` holds the
  built package to the same rules before a publish.
- **The components carry the rest**, from one shared module,
  `scripts/styles/own.module.css`, which core and table compose as
  `#own-styles`: `text`, `ring`, `field`, `scroll`. The table first carried a
  copy of core's; the review found that a copy only pictures could keep in step,
  and the lint forbids the table to read core's source even in a test - so the
  classes moved beside the build steps, where both packages already reach.
- **Review follow-up.** The two-axis review found seven focusable elements still
  leaning on the old page-wide ring - the calendar's days and month arrows, the
  range presets, MultiSelect's scopes and counter, the close buttons of Modal and
  Toast - which the browser check cannot reach while their panels are closed. A
  unit guard in core and table (`scripts/styles/focus.ts`) now reads every
  element in the tab order from the source. The same review had the box step give
  `::before`/`::after` their box again, the rule guard refuse `html`, `body` and
  `:root` inside compound selectors, and the charts demo style its own controls
  instead of tolerating them - which also brought to light three tokens the demo
  had named wrongly all along (`--u-font-size-*` for `--u-text-*`).
- **A third layer was not planned.** `composes` fixes the class but not the order
  of the rules, and the shared text context landed after a badge's own size and
  colour. `umriss.base`, one layer below the components, made the order
  irrelevant.
- **The demos became the proof.** Their example stages stand on the browser's
  defaults, and three checks ask the computed style for what a picture cannot
  see: own type, own box, visible focus. The focus check first counted the
  browser's own ring and passed every `Button`, which had lost its ring with the
  base layer. It no longer counts that ring, and it found all seven.
- **The charts resolve canvas colours through a probe element**, because a
  `light-dark()` token reads back as text. Their demo no longer calls
  `invalidateTheme()`: the observer on `<html>` catches the switch.
- **Found on the way:** the baselines of the command palette's resting state
  still showed the library's former name and an old version. They had passed
  under the comparison threshold since the rename, and were renewed after a look
  at the diff.

Pictures renewed on purpose, each diff looked at: the provider's page head
(its sentence lost "theme"), `commandpalette--shortcut` (a raw `<input>` became
`Input`) and the palette's resting state. Every other picture is pixel-identical
to its baseline, apart from the charts' known-open non-reproducibility.

## Sep. 2026 — first-publication: core goes to npm, the demos go online

*For a caller: `@umriss-ui/core` goes to the registry as `0.1.0`; `@umriss-ui/charts`
`0.3.0-rc.0` and `@umriss-ui/table` `0.2.0-rc.0` under the tag `next`. The count
of core started again — its changelog says why and how the old numbers read now.*

The preparation for the first publication, without a spec: the decisions were
made in the session, and they were three.

* **core is `0.1.0`, not `0.10.0`.** The numbers it had counted inside the
  repository stand in its changelog as *internal*, every heading prefixed, so no
  heading claims a version the registry never saw. Older documents that name a
  core version — the table's changelog, this journal — mean the internal one,
  and are not rewritten.
* **charts and table go out as release candidates** under `next`, with
  `publishConfig.tag` in their manifests so that a publish cannot move `latest`
  — except the first one, which the registry puts on `latest` regardless.
* **The demos go online as they are**, on GitHub Pages under
  `romanhaendler/umriss-ui`. `scripts/build-pages.mjs` builds them with a
  relative base into `site/<package>/` and puts a front page before them; the
  vite configs of the demos are untouched, so the screenshot suites build what
  they built before. The hash addressing of the shell needs nothing from the
  host.

Found on the way: the demo headers carried their version as a literal, and
core's had stayed at `0.9.0` through all of `0.10.0`. They read the manifest
now.

Added: `.github/workflows/pages.yml`, `.github/workflows/ci.yml` (lint, types,
unit tests, build — the screenshot suite stays local), `docs/releasing.md`, and
`repository`, `homepage`, `bugs`, `keywords` and `publishConfig` in the three
manifests.

## Sep. 2026 — demo-rubrics: the sidebar gets a shape

*For a caller: nothing. No export, prop or behaviour of any package changed; the
sidebar of the core demo and the glossary did.*

Delivery report for `.scratch/demo-rubrics/spec.md`, tickets 01–05.

`demo-consolidation` had regrouped the charts demo four hours earlier and left
core as it was, which is what somebody saw when they opened it: forty pages in
four rubrics, and one of them a leftovers box. **Foundation** held
infrastructure, actions, marks, surface, text, waiting and an accessibility
primitive — four subjects, not one — and its own sentence gave it away by saying
what the rubric was *not*: "What every surface needs before it is a form or a
table". **Structure and overlays** carried a seam that its name admitted. The
order inside a rubric was the order of delivery from August, appended to ever
since.

- **Eight rubrics, the same forty pages**: `Setup` 1 · `Layout and text` 5 ·
  `Actions` 2 · `Forms` 13 · `Status and waiting` 7 · `Overlays` 6 ·
  `Navigation and structure` 3 · `Monitoring` 3. Within a rubric the pages now
  run from the simple to the composed — `Button` before `ButtonGroup`, `Tooltip`
  before `Popover` before `Menu`.
- **No page was split, renamed or moved to another package.** All forty page
  objects are byte-identical to their version before the change, and the set of
  ids is unchanged. A rubric has no address, so no link broke and no example
  picture moved.
- **The rule for the order stands in `CONTEXT.md`** now, under **Rubric** — it
  existed only in the spec, which is the one place a person editing the outline
  does not look.
- **The pictures**: 240 baselines before, 240 after, 54 of them moved — 48 page
  heads of the 24 pages whose rubric name changed, the 2 overview pictures, and
  all 4 palette pictures, which are whole-viewport and carry the sidebar behind
  the palette's translucent pane. Not one of the 146 example pictures moved.
- **A fifth place named the rubrics, and only the browser found it.** The
  palette's matcher searches a candidate's *group* as a fallback, and a page's
  group is its rubric name — so renaming the rubrics changed which candidates a
  query finds, and the shell suite's `pointer` probe went red. Nothing in
  `CommandPalette` changed: the mark had stayed on a row that legitimately
  survived the narrower query. The probe was re-chosen by computing the matcher
  over the real candidate list instead of trying queries by hand.
- **The demo of `@umriss-ui/table` was checked against the same three findings
  and deliberately left alone** (ticket 05): twelve pages in four rubrics, no
  remainder, no name joined by "and", no order of arrival.
- **What the spec asked a human for did not get one.** Ticket 01 wanted the
  eight names confirmed before they were spent. They were taken as recommended
  under a brief to finish in one go, so `Status and waiting` and `Navigation and
  structure` — the two the spec itself called the weakest — ship unconfirmed.
  The alternatives stand argued in the ticket, and a later rename costs pictures
  and nothing else.

## Sep. 2026 — demo-consolidation: one demo machine, three contents

*For a caller: nothing. No export, prop or behaviour of any package changed; the
charts demo and the workspace's lint rule did.*

Delivery report for `.scratch/demo-consolidation/spec.md`, tickets 01–10.

The charts demo was a second implementation of the shell the other two demos
share: `Shell.tsx` (391 lines) and `shell.css` (623) beside `@umriss-ui/demo`,
**18 of their 29 class names identical**, and the jump palette built a second
time by hand while the shared shell uses the `CommandPalette` this workspace
ships, tests and photographs. It could also do less — no source beside the
example, no props table, no "Why it is like this", no copy button — so the
sentence "the demo **is** the documentation" held for two packages out of three.

- **The rule moved before anything else did** (ADR-0020). R-1.2 —
  `@umriss-ui/charts` imports nothing from `@umriss-ui/core` — now binds
  `packages/charts/src/**`, which is what is published. The demo was the weakest
  of the four pieces of evidence for it, because it proved something about the
  demo; the other three (the lint rule on the source, the manifest naming core
  in neither `dependencies` nor `peerDependencies`, the package's own unit and
  SSR tests, and `files` shipping `dist/` only) are unchanged and mechanical.
  The rejected alternative — a core-free shell behind a `palette?: ReactNode`
  prop — is recorded in the ADR, so that it is a decision and not an oversight.
- **The second list is gone.** The thirteen examples were written down twice:
  once in `demo/outline.ts` and once as hand-typed `data-example` attributes in
  the JSX. They are thirteen files under `demo/examples/` now; the file is the
  list, as in the other two demos, and nothing in `demo/` writes a
  `data-example` attribute by hand.
- **The levels line up.** Four rubrics, fourteen pages, single-segment addresses
  with the rubric deliberately outside them. What charts called a page — "Axes
  and area" — was a rubric in this workspace's vocabulary; a page is `Line`,
  `ControlChart`, `Matrix`, something a reader looks up by name.
- **Five pages carry no example of their own**: `Area`, `Bar`, `Scatter`,
  `StateBand` and `Tooltip & Legend` are each drawn inside a composed example on
  another page. Their API tables are complete regardless, because those come
  from `src/`. The smoke test carries the five as a named exception, so a sixth
  fails rather than passing unnoticed — and writing five small examples is the
  obvious next ticket, deliberately not smuggled into this one.
- **The props gate now runs for charts too, and the debt was measured rather
  than estimated: 48 props without JSDoc across fourteen `*Props` interfaces.**
  The precedent said to measure — core had been estimated at "roughly sixty" and
  turned out to be 149 — and 48 was one sitting's work, so it was paid off here
  instead of becoming a second ticket. The `*Config` interfaces stay out of the
  tables: they are registration shapes the chart passes among its own parts.
- **The baselines had to be rebuilt, and the ticket said they would not.** Every
  example id was carried over unchanged, which is what the tickets' claim rested
  on — but an example is now photographed inside the shared shell, with a page
  head, a code block and a different width around it. The pictures are of
  something else, so keeping the old files would have meant comparing two
  different demos. The 26 old baselines were removed and the new set taken.
- **Core and table moved too, and for one reason each.** The rubric rename is
  visible in a page head, on the overview and in the palette's finds; and the two
  new pages of `Dock` and `TreeView` make those pages long enough to scroll,
  which narrows the content column by the scrollbar's width and re-wraps the
  demonstrations. 23 core and 9 table pictures were adopted and 8 added; both
  suites are green afterwards (538 passed).
- **And one thing is left open, deliberately.** The charts' example pictures do
  not reproduce: two to four of the twenty-seven differ from run to run, by 0.001
  to 0.006 of the image against a bound of 0.001. Three different waits were
  tried and none helped; `--repeat-each=3` then showed the same picture passing
  one repeat and failing the next **inside one run**, which puts the variance in
  the rasterisation rather than in the timing. The old demo drew in a fixed
  1080-pixel column in `system-ui` and could not have it. The finding, its
  measurements and the three ways out stand in `docs/testing.md` under Known
  open; none was taken here, because each is a decision rather than a repair.
- **Small things.** `Dock` and `TreeView` each had only a 151- and 232-line
  demonstration and now have two small examples before it. The criterion for
  when a page carries a "Why it is like this" moved out of a delivered spec into
  `CONTEXT.md`, where the next person editing a demo will find it, and charts
  got its first five texts — each linking an ADR instead of retelling it. The
  gap at `Column/09` in the table demo is closed by renumbering, which touches
  no baseline because a picture is named after the anchor.
- **The rubric `Operations` is `Monitoring`** in all three demos. A figure, a
  trend and a fraction are not tied to a producing plant, and the word was taken
  twice over already — `lib/options.ts` performs set operations. The specificity
  moved into the rubric's sentence, where it costs nothing. Where "operations
  packages" names the three efforts under `.scratch/`, it stays.

## Sep. 2026 — docs-structure: the documents get a shape

*For a caller: two of the three published packages now carry a README, so their
package page will not be blank. Nothing else about any package changed.*

Delivery report for `.scratch/docs-structure/spec.md`, tickets 01–09.

The content was never the problem — nineteen ADRs that argue instead of
announcing, three package changelogs keeping a discipline most published
libraries do not. What was missing was order by genre and by audience. There was
no `README.md` at the root, so the first thing a visitor met was a workshop
note; two of three published packages had no README at all; four files were
called `CHANGELOG.md` in two different meanings; and one genre carried three
names (`STATUS.md`, `TREE.md`, and nothing at all for the table).

- **Three rules, and everything follows from them.** One genre per file, one
  home per genre. The audience decides the level: what travels to npm lives in
  the package, what describes the workspace lives at the root. And capitals are
  reserved for the names the ecosystem knows — which disposes of `GLYPHS.md`,
  `TREE.md`, `STATUS.md`, `HANDOFF.md` and `TESTS.md` without a further
  argument. A package root now holds `README.md`, `CHANGELOG.md`, `LICENSE`,
  `package.json` and configuration, and nothing else.
- **New at the root**: `README.md` (with the publication state checked against
  the registry on the day — all three still 404), `LICENSE`, `CONTRIBUTING.md`.
- **New under `docs/`**: `README.md` as the map, `design-language.md`,
  `testing.md`, `journal.md`, `adr/README.md` and `archive/`.
- **`TESTS.md` split along its audience**: the runbook into `CONTRIBUTING.md`,
  the standing into `docs/testing.md`. No sentence stands in both.
- **The root changelog became `docs/journal.md`** — this file. It was never a
  changelog: it records what was worked on here. Merging it with the package
  changelogs was asked and answered once already (`english-and-umriss-ui` 14,
  no); what it lacked was a name of its own and an entry head that can be found
  without a search. The entries from `english-and-umriss-ui` onwards now carry
  the month, the effort slug and one line saying what it meant for a caller.
- **Nineteen ADRs got a status and a date** taken from each file's first commit,
  and an index that sorts them by number with their area. Exactly one is
  superseded: ADR-0015 by ADR-0018, which both files already said in prose and
  nothing said on the outside.
- **`CONTEXT.md` is a glossary again.** Roughly 150 lines of `Old → New` tables
  — a record of what *was*, in the document that says what *is* — moved to
  `docs/archive/rename-2026-09.md`. What stayed is what is still a rule: the
  register rule, the words taken twice over, the two output conventions that are
  German on purpose. The doubled `Design language` heading is gone, and the file
  is ordered by reach rather than by arrival. One bold paragraph fewer stands in
  it than before (124 against 125), and it is the one ticket 08 itself sends to
  `docs/testing.md`: the rule about German test fixtures, which is a testing
  convention and not vocabulary.
- **The design language has its own document.** It governs all three packages
  and was filed in the appendix of one package's README, which did five jobs and
  now does three. The passage moved unchanged; the generated component table and
  its guard stayed exactly where they were.
- **What was deliberately not touched**: `CONTEXT.md` and `docs/adr/` did not
  move — both are addressed by name, and the mechanism that keeps the vocabulary
  in use is worth more than the tidiness. The 52 files under `.scratch/` that
  name an old path were not rewritten either: they are delivery records, read
  backwards. `docs/README.md` carries a "What moved" table for whoever follows
  one of them. And no prose was "improved" while being moved.

## Sep. 2026 — the seam of a button group

*For a caller: a visual repair to `ButtonGroup`. No export, prop or behaviour
changed.*

Reported from the demo, on the `ButtonGroup` page: a vertical line at "Grid" and
at "Timeline" that does not belong there.

It was the button's own edge. `Button` draws its edge as a `box-shadow` spread
over all four sides — the decision that a border would change the height of the
control and shift it against its neighbours. `ButtonGroup` never took that edge
back on the two sides that face into the group, so at each seam two full-height
edges stood on top of the one hairline the group draws itself, which is inset to
15% and stops short of the rounded outline on purpose. The bug was therefore
invisible on `primary` and `ghost` groups, which carry no edge at all, and it
had stood since the component was written.

- **The cut is subtractive, and that is the whole argument for it.** A
  `clip-path` on the children takes the edge away where it faces into the group
  and lets it through above and below; the first and last child keep their outer
  side with its rounded corner. Restyling the edge instead would have meant
  giving `primary` and `ghost` an edge they do not have.
- **Focus lifts the cut, hover does not.** The focus ring is four pixels and
  would be sheared; the hover edge is one pixel and would land on the seam —
  the very line the cut exists to remove. Hovering therefore lights the segment
  through its surface and its top and bottom edge, and the group stays one
  control while the pointer moves across it.
- **Four baselines**, the two examples in light and dark. The page head has no
  group in it and did not move.
- **The visual suite would not have caught this, and did not.** Two seams of
  about thirty pixels are some hundred pixels on a picture of a thousand by a
  hundred and fifty, which stays under the `maxDiffPixelRatio` of `0.001` in
  `playwright.config.ts`. The six `buttongroup` tests passed against the old
  baselines after the repair, and `--update-snapshots` left them alone because
  nothing had failed; `--update-snapshots=all` was needed to write them. Worth
  knowing before trusting the pictures on a defect of this size — the threshold
  is there for font rendering, and a hairline is the same order of magnitude.

## Sep. 2026 — english-and-umriss-ui 37: the provider gets a page

*For a caller: nothing. The demo gained a page and two examples; the provider
and the wording subpath are unchanged.*

The demo is the documentation, and the one thing ADR-0019 actually ships to a
user — a second language — appeared in it nowhere. `UmrissProvider`,
`LanguageProvider`, `useWording` and `GERMAN_WORDING` did not occur once under
`packages/core/demo/`. The switch existed in three places, all of them outside
the demo: the README, this package's changelog, and two unit tests that hold the
subpath wired. The only provider example in the workspace was the table's
`09-provider`, and it shows entry-by-entry overrides rather than a language.

- **`UmrissProvider` has a page**, the first in the Foundation rubric. It was
  absent from the outline altogether, so the missing language example had no
  page to stand on — the gap was the provider, not the example.
- **Two examples, and both are a comparison.** `01-the-second-language` renders
  the same three components twice, once without a provider and once under the
  whole `GERMAN_WORDING`; `02-entry-by-entry` overrides two wording entries and
  two formats and leaves the neighbouring entries standing, so that the fallback
  is visible rather than asserted. The second half of each picture is the only
  German in the core baselines, which is what ADR-0019 meant by testing the
  language rather than photographing it a second time.
- **Theme and density are deliberately not demonstrated.** Both write on the
  root element, so an example would colour the whole demo page around it and the
  picture taken of it would be a picture of the demo. They stand in the table
  and in "Why it is like this"; the theme switch in the header is the running
  proof.
- **The props gate found four undocumented props** the moment the page claimed
  their tables: `UmrissProviderProps.portalTarget`, `.toast`, `.children` and
  `LanguageOptions.formats`. They had never been in a table, so nothing had ever
  asked them to explain themselves.
- **The demo build learned the subpath.** `vite.demo.config.ts` aliased only the
  bare package name; `vitest.config.ts` had carried the `wording/de` rule since
  ticket 13. Without it the example's import would have reached for `dist/`,
  which need not exist when the demo is started.
- **A wrong snippet was corrected in two places.** `de.ts` and this package's
  changelog both wrote `<UmrissProvider wording={GERMAN_WORDING}>`. There is no
  `wording` prop on the provider — it is `language={{ wording: … }}`, as the
  README had it right all along. The error stood in the file a reader imports
  from.
- **Eight baselines.** Six are new (the page head and two examples, light and
  dark); the overview moved, because it counts its pages and lists its chips.
  Looked at one by one, as `CONTEXT.md` requires.

## Sep. 2026 — english-and-umriss-ui: one language, one scope

*For a caller: everything. The scope, every package name and most public names
changed; the three package changelogs carry the lists, and nothing had been
published against the old names.*

Delivery report for `.scratch/english-and-umriss-ui/spec.md`, tickets 01–13.

The workspace was written in two languages by rule — identifiers German, prose
English, props English by the carve-out of ADR-0015 — and three things had made
that rule wrong. The npm org secured for this library is called `umriss-ui`, and
it is English. The shipped user-facing text was German only, by design, which
under an English scope is a product defect rather than a style question. And
nothing had ever been published: `@umriss/ui`, `@umriss/charts` and
`@umriss/table` all returned 404 from the registry, so every cost this change
would normally carry — a deprecation window, an alias, a broken consumer — was
zero, and will not be zero again.

- **The packages moved to the new scope.** `@umriss/ui` is `@umriss-ui/core` and
  its directory is `packages/core`; `@umriss/table` is `@umriss-ui/table`,
  `@umriss/charts` is `@umriss-ui/charts`, and the private demo shell is
  `@umriss-ui/demo`. The repository directory stays `umriss`: that is the name
  of the thing, not of the npm scope. The version numbers stay where they are —
  they are an honest record of work done, and nothing was ever published against
  them.
- **`core` means the package you install first, not a layer everything sits
  on.** `charts` depends on nothing and will keep depending on nothing
  (ADR-0016), so a reader who finds that `charts` does not import `core` is owed
  that sentence; `CONTEXT.md` carries it. The alternative,
  `@umriss-ui/components`, buys honesty at the cost of a name nobody types.
- **Everything is English** (ADR-0018, which supersedes ADR-0015): identifiers,
  file and directory names, the long prose headers that carry the design
  reasoning, the demo artefacts, and every document that is read forwards. The
  headers were **translated, not shortened**. They are the memory of the design,
  and compressing them while translating would have been the only real loss
  available in this effort.
- **The public surface was renamed once, alone.** Twenty-one German names
  crossed from `core` into `table` and `demo` at seventy-two import sites. While
  they read German in one package and were imported as German in another, no two
  branches could touch them without colliding, so one ticket renamed all of them,
  `src/index.ts` and all seventy-two call sites in a single commit, with nothing
  running beside it. `core/src/lib` went with that ticket rather than into the
  parallel phase: `useWording`, `useFormats`, `useVirtual`, `LanguageProvider`
  and `mergeLanguage` largely *are* the public surface, and all 125 component
  files import them.
- **Deprecated aliases were considered and rejected.** They were the right answer
  for the prop renames of ADR-0015, because there were callers. Here there are
  none, so an alias buys nothing but a cleanup ticket.
- **The library ships two wordings** (ADR-0019). English is the default; German
  moved to the subpath export `@umriss-ui/core/wording/de`. Both are typed
  `Wording`, so an entry added to the interface and forgotten in the other
  language is a compile error before it can become a missing label on a screen.
  Semantic drift between the two cannot be caught by anything and is accepted as
  the price of shipping two.
- **Two renames avoided a word that was already taken.** The table's `kern/`
  became `model/` and not `core/` — the path would have been free, the collision
  was semantic, and one grep with two answers is precisely what the "words with
  more than one meaning" section of `CONTEXT.md` exists to prevent.
  `kern/begleiter.ts` became `companion.ts` and not `state.ts`, because **State**
  is heavily loaded by the charts (state series, state band, ADR-0007).
  `demo/werkzeug/` became `tooling/` and not `tools/`, because a **Tool** is an
  entry in a dock.
- **`Anbieter` became `Provider`, which deleted an avoidance.** The glossary
  listed `_Avoid_: Provider` under **Anbieter**; that avoidance existed only
  because the German word had to win, and the component has been called
  `UmrissProvider` all along. The entry is gone.
- **German is tested rather than photographed.** One unit test per package mounts
  under the German wording, and the seam for that already existed.

Deliberately not done here. The formats are still `de-DE`, so the English default currently renders
"43 of 1.204" and a date as "17.03.2026" — English words around German digits;
ADR-0019 records that rather than hiding it, because a locale is not a language
and changing it moves every number, date and percentage in the library. The 370
screenshot baselines are left failing on purpose: the middle tickets renamed the
files the demo is built from, and a bulk rebuild without inspection is what
`CONTEXT.md` forbids, so one ticket of its own rebuilds them rubric by rubric
with review. And the design-language tail of `CONTEXT.md` names five collisions —
Kachel, Ebene, Ton, Skala, Raster — that cannot be translated without being
decided; deciding them is its own ticket, the only one in this effort that
contains design decisions rather than mechanical work.

### The values, not only the names (tickets 17–28)

The effort reported itself finished and was not. Every detector it used looked
for German **prose** — umlauts, function words, sentences — and none looked at
identifiers. So `tokens.css` passed as clean while eight dock tokens underneath
its translated comments still read `--u-dock-feld`, `--u-dock-griff`,
`--u-dock-abstand`.

Three sets had also been deferred on purpose, each with the same argument: it is
a shape two parties agree on, so it moves in both places or in neither. That
argument is right about **who has to move with a name** and wrong about whether
the name may stay — a shape two parties agree on is the one name a caller has to
type, and therefore the first place a second language shows. All three moved:
the limit model across `core`, `charts`, the case table and the conformance test;
`DateRange` across `core` and `table`; and the dock's four resting places,
together with the eight baselines that carried `dock-oben` in their file names.

Eleven commits, one value set each: the dock tokens, `Place`, the limit model,
`Freshness`, the alarm lifecycle, the virtualisation window, `DateRange` and the
wording registers' parameter names, the Intl instances in `formats.ts`, the props
reader, and the German test data in four files. `packages/` now holds no German
identifier and no German prose. What stays German is `de.ts`, which is the
wording, and `docs/archive/handoff-2026-08.md`, whose own preamble says why a superseded
specification is not translated.

**One defect fell out of it.** `useVirtual` re-measures the row height on a real
row and looked for `[data-zeile]` — an attribute only the tree writes, while the
table writes `data-row`. In the table the re-measurement had never fired. Two
visual tests had been failing on exactly this and were carried as pre-existing;
both pass now.

**And one piece of German turned out to be shipped text.** The props reader maps
`HTMLElement` onto `"dem gerenderten Element"` and three siblings onto German
fragments, and `PropsTable.tsx` splices them into an English sentence — so every
API table in the demo read "Also takes every attribute of dem gerenderten
Element".

## The table leaves @umriss-ui/core (Sep. 2026)

Delivery report for `.scratch/umriss-table/issues/14-remove-table-from-ui.md`,
the last ticket of `umriss-table`.

- `@umriss-ui/core` 0.9.0 has no table and no alarm list any more: components,
  model, export, view, selection and alarm model stand only in
  `@umriss-ui/table`, the copies there have lost their copy note, and three
  entries of the wording that only the old table read are struck.
- No test was deleted whose guarantee was not already running against the demo of
  `@umriss-ui/table`. Where a guarantee was still missing there, it was added
  first: five table tests out of `features-basics` as tests of the demonstration,
  the density of the alarm list, the filter strip and the list filter under a
  provider with a foreign wording. What `@umriss-ui/core` guarantees itself — the
  density through `useDensityFor` — it now checks without a table.
- The demo of `@umriss-ui/core` has thirty-nine pages in four rubrics; the
  example of the `Sparkline` stands without a table. Four baselines moved and
  were looked at one by one — the overview, the head of the `Spinner` page, the
  example of the `Sparkline`, the window of the command palette; every other one
  is untouched.
- `docs/archive/handoff-2026-08.md` B.10: inline editing now aims at `@umriss-ui/table`.

## The table's demo (Sep. 2026)

Delivery report for `.scratch/table-demo/spec.md`. The two decisions the spec
left open for confirmation are implemented as recommended: the shell is moved out
rather than copied (A), and the demo has one page per part (B).

- **The shell stands once.** `packages/demo` (`@umriss-ui/demo`, private, never
  published) carries the shell, the page, the example, the copy button, the props
  table, their stylesheets, the props generator with its reader and its gate, the
  source rewriting, the examples read from the files, and their tests. The demo
  of `@umriss-ui/core` moved onto it without a single baseline or a single
  generated props table moving; the suites for the shell and the page, and the
  tolerated colour pairs of the accessibility check, stand with the shell and run
  against both demos. Lint holds that no `src/` imports the shell.
- **The generator reads the shapes of the table**: a type alias as an
  intersection in the order of its parts, with a sentence instead of a copy where
  a part has a table of its own; a discriminated union as one table; the members
  of a conditional helper type with the type arguments of their position.
- **`packages/table/demo`**: eleven pages in four rubrics, forty-one examples,
  `pnpm dev:table`, port 4175, the projects `table-hell` and `table-dunkel`. The
  `Table` page ends with the work-order list from the `umriss-table` spec as a
  demonstration.
- **The behaviour tests of the old table have counterparts**, guarantee for
  guarantee, and what jsdom could not prove is proven by
  `features-browser.spec.ts`. `umriss-table` 14 can be triaged on that basis.
- **Two defects only a browser shows** are fixed in `@umriss-ui/table`: control
  cells that grew wider than their sticky offsets, so that the row header slid
  over the expander when scrolling sideways; and the label of a condition in the
  filter strip, muted on the surface of the tag below 4.5:1.

## The table becomes a package (Sep. 2026)

Delivery report for `.scratch/umriss-table/spec.md`, tickets 01–13.

The table was the most important component of the library, and its interface let
a column be described up to four times: in the column field, in the header, in
the cell, in the footer. Where the repetition was missing, model and screen
contradicted each other — "status and budget to the front" reordered the column
menu, the export and the link, and moved nothing on the screen.
`@umriss-ui/table` is the answer: a third package that depends on
`@umriss-ui/core` (ADR-0016), and columns as JSX elements, typed through the hook
that gets the rows (ADR-0017). The table renders its rows itself, and the mistake
can no longer be written.

Two prototypes went ahead. The first (`prototype/typen/`) wrote the interface as
types with four reference tables and found that the overloads of computed values
have to differ by required properties. The second (`prototype/laufzeit/`)
measured three kinds of registration: reported out of effects, every update
renders the body twice; written into a registry during the render, once — and the
columns stand in the first frame.

What holds now:

- `packages/table`, with lint in both directions: nobody imports the table, and
  it takes `@umriss-ui/core` only through the front door. The window arithmetic,
  `useVirtual` and `useDensityFor` became public in `@umriss-ui/core` for that,
  and the table's wording still stands there.
- Model, export, view, selection and the state-holding companion are copied
  unchanged with their tests; the model gained one rule — absent values stand
  last in both directions.
- The rendering now belongs to the library and has component tests; the typing is
  product and has a file full of expected compiler errors that `typecheck`
  translates.
- `VerdictColumn` and `AlarmList` are built only out of the public interface, and
  one test each reads their source to hold that. The alarm list found a trap that
  concerned every table: without a pagination bar it stopped at the tenth row. A
  table now pages only when a `Pagination` stands.

`@umriss-ui/core` keeps its table until `@umriss-ui/table` has a demo with
equivalent behaviour tests (ticket 14, a spec of its own).

## The demo is the documentation (Sep. 2026)

Delivery report for `.scratch/demo-as-documentation/spec.md`.

The demo showed thirty-six components and told a reader about none of them how to
use it. Not one line of source stood on the page. Whoever saw the `Stat` with its
limits set and wanted it had to find the demo's `KennzahlenKachel.tsx`, read past
the head comment and reconstruct the call. That was not documentation but a
screenshot with a repository attached to it.

Now: **one page per component.** The name and one sentence of what it is for, an
import line to copy, a run of examples that each show their own source, the
complete props table — and, only where there is one, a section "Warum so".

### The file is the example

An example is a file under `demo/examples/<Component>/NN-<anchor>.tsx`. The page
fetches the running component through a normal import and the source through
`?raw` out of **the same** file. The code shown is therefore the code that ran —
not out of discipline, but because there is only one file.

The list of examples stands nowhere. `import.meta.glob` reads the directory, the
number in the file name orders the run, the rest of the name is the anchor. A new
example is a new file and nothing else.

What is displayed is the whole file, minus the `title` export — bookkeeping of
the demo — and with `"../../../src"` rewritten to `"@umriss-ui/core"`. That is
the only permitted difference between file and display, it is a pure string
replacement, and it exists because at exactly this point "what runs here" and
"what runs for you" really do come apart.

### The props table is generated, not written

`demo/props.ts` reads the types directly with the TypeScript compiler API out of
`src/` and writes `demo/.generated/props.json` — not checked in, regenerated on
every `dev`, `build:demo` and `typecheck`. Three behaviours make a ready-made
docgen the wrong shape, and all three would have to be written on top of it
anyway:

* Inherited DOM props collapse into **one sentence**. `ButtonProps extends
  ButtonHTMLAttributes<HTMLButtonElement>` yields three rows and below them "also
  takes every attribute of `<button>`".
* Generic components stay generic: `Table<T>` shows `T` as `T`.
* **A prop without JSDoc breaks the build.** That is the reason the script exists
  and no dependency stands in its place.

The type stands there as it was written, and not in the checker's normalised
form: `"primary" | "secondary" | "ghost" | "danger"` is what the reader needs.

The gate found **149 props without a comment** in one go. They are written — that
is the honest price of a table that is correct, and it is paid once.

### Addresses: `#/button`, and the rubric is not in it

A rubric sorts the sidebar and means nothing inside the library. Were it in the
address, every re-sorting of the sidebar would break every link. Component names
are unique, so one segment is enough.

Examples are linkable along with it: `#/button/loading-and-disabled` opens the
page and brings the example into view. "Look at this" thereby becomes a link, and
that is half the purpose of an address space. The jump palette finds both — pages
and examples, examples under their component.

### What has disappeared

`Kachel` does not exist in `demo/` any more, not even as a word: it is called
page, example, demonstration, rubric (`CONTEXT.md`, "The demo"). `data-kachel`
has become `data-baustein` at the page and `data-example` at the example.

Eleven components had **no entry at all** — `Badge`, `Card`, `Checkbox`,
`Sparkline`, `Meter`, `EmptyState`, `Stack`, `Grid`, `Popover`, `Skeleton`,
`Spinner`, `VisuallyHidden`. They were visible everywhere and explained nowhere.
Now they have a page like all the others.

### The demonstration

`Table`, `TreeView` and `Dock` each keep one large example, shown whole. They
have a model and not a handful of props: five separate miniatures would have
documented five features and kept quiet about the component.

## The demo pages get an outline (Aug. 2026)

Both demos showed everything one below the other — twenty-one and thirteen tiles
respectively, for kilometres. They now have a shell: a header bar, a sidebar, one
group in the content, a jump palette.

### Why not tabs

Twenty-one parts fit into no tab bar, and tabs claim **one** level while two
exist here: group and part. What component libraries actually use is a persistent
sidebar with exactly one group in the content — the only structure that really
shortens the scrolling instead of merely making it navigable. A part is thereby
**not in the document** as long as its group is not up; that is the difference
between "hidden" and "not there".

On top of that: a front door that answers the question a long page never answers
— what is actually in here. A jump palette on ⌘K and `/`, with the group named at
every hit. And addresses: `#gruppe/baustein` is linkable, and the back button
does what it should.

### There is exactly one view

A second mode showing everything one below the other would have been a second
truth about the same page — and the tests would have checked something nobody
gets to see. They navigate like a human instead, through `open(page, …)` from
`tests-visual/navigation.ts`. The address comes from the demo's outline, and that
is at the same time the source of the page list: a page missing there is
unreachable and is not photographed either. The jsdom smoke test walks the groups
and checks something along the way that an everything-mode would never have
checked: that **each group on its own** mounts.

### Naming and grouping

An entry is now called what a developer searches for — by the component and not
by a category. "Selection" is no information; "Select, Combobox and MultiSelect"
is. "Very large sets" is now **Virtualisation**, "The view" is **Share and export
the view**.

The **table has a rubric of its own**: it is too central to stand between other
parts — its own model, its own view, its own virtualisation. The text area and
the choice group moved from the foundation to the forms, where they belong; for
that, `BausteineKachel` was split into `FundamentKacheln` and `FormularKacheln`,
so that the files follow the outline instead of contradicting it.

### Three findings from using it

**Two entries of the same group one after the other did not jump.** The effect
hung on the active group — which no longer changes on the second click. It now
hangs on a counter of its own, and the marking is restarted through a forced
reflow.

**The line at the sidebar became a bracket in the charts demo.** The demo gives
every `<button>` six pixels of radius; on a two-pixel-wide left border that
rounds both ends.

**The jump landed too far up**, because the sticky header bar lay over the tile.
`scroll-margin-top` keeps it away.

### And one from the check

Under load, axe measured an **intermediate colour of the running jump marking**
and reported a long-tolerated colour pair as a new find — reproducible only in
the full run, never on its own. `open` now waits until the marking is through. A
flickering test that one would have believed would have cost more than the two
lines.

## Three deliveries for producing plants (Aug. 2026)

Delivery report for `.scratch/judging-values/spec.md`,
`.scratch/shopfloor-instruments/spec.md` and
`.scratch/plant-at-a-glance/spec.md` — twenty tickets, both packages.
`@umriss-ui/charts` goes to 0.2.0, `@umriss-ui/core` to 0.6.0.

### New in `@umriss-ui/charts`

| Part | What it is |
|---|---|
| `<StateBand>` | fifth series kind: states over time, on one lane of the Y axis |
| `<Matrix>` | sixth series kind: machine × hour, coloured by assessment or by gradient |
| `<Span>` | seventh series kind: spans with an explicit end, idle and overlap |
| `<LimitLine>`, `<LimitBand>` | limits on the chart, with a role (specification, control, zone) |
| `<ControlChart>` | the control chart as a composition — without one line of drawing code of its own |
| `limit.ts` | the same rule as in `@umriss-ui/core`, a second house (ADR-0006) |
| `controlLimits.ts` | control limits, zones, four rule violations after Nelson |
| `pareto.ts` | sort, accumulate, collect the remainder, find the cutoff |
| `operatingTime.ts` | wall clock ↔ operating time, breaks, readable ticks |
| `state.ts`, `cells.ts`, `spans.ts` | the geometry of the three new kinds |
| `<XAxis calendar>` | an axis that shows only the hours in which somebody was there |
| `ticks` on both axes | fixed tick values for lanes and categories |
| `tone` on `<Line>`/`<Scatter>` | a role instead of a colour value; the theme resolves it |

### New in `@umriss-ui/core`

`<Stat>`, `<AlarmList>` with `alarmModel`, `lib/limit`, `lib/freshness` and
`useFreshness`, `Formats.relative`, some thirty new wording entries. The contract
stands in `packages/core/CHANGELOG.md`.

### Decisions

**The limit stands there twice, on purpose.** `@umriss-ui/charts` may import
nothing from `@umriss-ui/core`, and the other way round would mean paying for
thirty lines of comparison with a canvas library. A third package for thirty
lines is a build, a versioning and a publication for thirty lines. The
duplication is made honest by being **executably explained**: a case table, run
out three times, and a conformance test that holds both versions against each
other. A second test holds that no runtime dependency has grown out of it
(ADR-0006).

**A state is a number.** The accessor yields the index into the state list. That
keeps the materialised series the same three channels, the drawing loop
monomorphic and the affine scale contract untouched — the fifth series kind costs
R-5.2 nothing. A key accessor would have paid for a prettier call with the rule
that carries sixty frames per second at three million points (ADR-0007).

**A control limit is not a specification limit**, and it is never computed from
what happens to be visible. The origin sits in the type: there is "given" and
"from this reference window", and "from everything there is" cannot be expressed.
The convenient route would yield a chart that looks professional and cannot do
its job (ADR-0008).

**A stale value keeps its verdict.** Freshness and assessment are two axes. The
obvious version turns "stale" into "unknown" and thereby throws away, at the
moment the connection drops, exactly the picture the human then needs (ADR-0010).

**Channels are named, not overloaded.** The matrix needs a third value, the span
a second X. Both get a channel of their own instead of borrowing the baseline
channel; a test holds that both are `null` for every kind that does not need them
— otherwise they become general-purpose fields within one delivery (ADR-0011).

### Two defects only the browser found

**A band has no point.** In tooltip mode `x` the scene groups hits whose X pixels
lie close together. The pixel of a state band is the **start of its segment** and
lies arbitrarily far to the left of the pointer — the band thus fell out of the
group and appeared in the tooltip sometimes and sometimes not. Areal hits are now
always in: they cover the pointer, or they would not have reported a hit at all.
No unit test would have seen this; both calculations were right on their own.

**Open means NaN *or* infinity.** The drawing code checked for NaN, the module
knows both cases under the name `isOpen`. A span with `Infinity` as its end would
have been drawn solid instead of dashed. Found while counting the unused exports
— the unused name *was* the finding.

## The last five open tickets (Aug. 2026)

Delivery report for `.scratch/consumable-package/spec.md` (tickets 01, 02, 04,
05) and `.scratch/table-surface/spec.md` (ticket 09). With that, no spec in the
tracker is open any more.

### New

| Part | What it is |
|---|---|
| `lib/language/` | every formatter and every text in one place, overridable entry by entry |
| `UmrissProvider` | one place to configure: theme, density, portal target, messages, language |
| `lib/virtual.ts`, `useVirtual`, `TableVirtualBody` | virtualisation of very large tables |
| `lib/glyphs/` | a character set with a written-down specification |
| `tests-visual/accessibility.spec.ts` | axe over every tile, both themes, WCAG 2.1 AA |

### Decisions

**The wording is a directory, not a translation call.** A `t("clear.input")`
demands a key that nothing checks and, in case of doubt, gives the key back. A
field on a type demands nothing: whoever leaves it out gets the default text, and
whoever mistypes gets a type error.

**The root provider is voluntary, and its absence is the checked normal case.**
As soon as it exists the temptation grows to require it, because the code would
be shorter with configuration always present. A library whose components work on
their own can be introduced component by component — that is worth more than the
shortening.

**Virtualisation and paging exclude each other,** and the companion enforces that
instead of merely documenting it. Both at once would be a control that
contradicts itself.

**The row height is re-measured, not believed.** Two pixels off add up over
twenty thousand rows to a scrollbar that lies by forty thousand pixels.

**Of the character set, only what was pixel-identical was taken over.** The list
of deviations in `packages/core/docs/glyphs.md` is the actual deliverable, not the
migration.

### What the accessibility check found

Four findings, all with impact `serious`, **none suppressed**:

* `Meter` carried `role="meter"` without an accessible name.
* The row actions of the table lay at `opacity: 0.4` at rest and thereby came to
  about **1.6:1** — no longer readable text. Nobody had noticed, because they
  appear on hover anyway. Fixed with `0.9`.
* A disabled `Tag` said so only through a CSS class.
* A scrollable code block of the demo could not be reached without a mouse.

Three are library defects and are fixed; one belonged to the demo.

### Moved baselines

Two: the table, light and dark, because of the contrast defect above. The diff
shows nothing but the action labels. All remaining baselines stand unchanged —
that is the proof that the move of the formats was output-identical and the glyph
migration pixel-identical.

### Side finding

The second table on the demo page overturned four existing interaction tests:
they reached across the whole page for `tbody tr` and `th`. The fault was always
in the selector and only came to light through the second table. Narrowed down
and recorded as a convention in `docs/testing.md`.

## The table as a surface, part two (Aug. 2026)

Delivery report for part C.6. Basis: `.scratch/table-surface/spec.md`, tickets
03, 06, 07 and 08. Ticket 09 (virtualisation) stays open; it is expressly marked
in the spec as separately deliverable.

### New

| Part | What it is |
|---|---|
| `TableFilterStrip` | the active conditions as a set, with the hit ratio and "reset everything" |
| `TableExpandButton` / `TableRowDetail` | expand a row; the detail row spans the visible columns |
| `TableRowActions` | the quiet action column at the end of the row |

`Column` carries `resizable` and `width`; `useTable` gains `expanded`,
`toggleRow`, `isExpanded`, `widths` and `setWidth`. `Th` takes `width`,
`resizable` and `onResize`. The widths travel in the view link
(`breit=projekt:220`).

### Decisions

**Expanded rows survive a change of filter.** The alternative would be to discard
keys that fall out of the filtered set. Against that speaks the more frequent
case: whoever filters, looks something up and widens the filter again would
otherwise find their row collapsed.

**The action column reacts to hover *or* focus in the row.** A reveal on hover
only looks finished, passes every screenshot and is invisible to everyone who
does not use a mouse. Without a pointing device the actions are permanently
visible.

**The filter strip does not look inside any filter.** It renders a list the
application supplies. Without conditions it is not there — not empty, gone.

### An old finding was none

The two interaction tests that had stood red since the takeover had no defect of
the checkbox as their cause; they aimed at the hidden input instead of at the
enclosing `<label>`. Two lines. **The Playwright suite is thereby green for the
first time** (54 tests).

### Delivered alongside

Out of `.scratch/consumable-package/`: the **token contrast check** (ticket 03,
30 tests across both themes, with five documented and justified exceptions) and
the **release process** (ticket 06: a package changelog of its own, version
0.4.0, `prepublishOnly`, the client-only decision in writing).

## Closing the foundation (Aug. 2026)

Delivery report for part C.6. Basis: `.scratch/foundation-primitives/spec.md`,
tickets 01 to 08 — complete.

### New

| Part | Purpose |
|---|---|
| `Textarea` | multi-line input; `autoGrow` with `maxRows`, `showCount` |
| `RadioGroup` | one out of few, with an explanatory line per option |
| `Alert` | a message that stays — five tones, optionally dismissible |
| `Tag` / `TagGroup` | a removable label with arrow-key navigation |
| `Divider` | a separating line as a layout primitive, horizontal/vertical, with a label |
| `VisuallyHidden` | text only for the screen reader; `focusable` for skip links |
| `ButtonGroup` / `SplitButton` | buttons that belong together; a main action plus variants |
| `Text` / `Heading` / `Link` | typography on the token scale |

### Decisions

**Purely additive.** No existing component was touched. Two obvious
consolidations were deliberately left undone: the tag was built anew instead of
being extracted from the MultiSelect, and the arrow-key navigation of the
RadioGroup is component-local instead of living in a shared helper. Either would
have turned eight new components into a refactoring of exactly the parts the
HANDOFF protects most strongly.

**The role of the Alert follows its tone**, not the caller: the two urgent tones
interrupt the screen reader, the rest do not.

**`Heading` separates level from size.** Whoever couples the two will sooner or
later pick the wrong outline level in order to get the right size.

**The typography primitives are narrow.** They release the token scale and
nothing else — a generous version would legitimise the fraying they exist
against.

### Tests

The behaviour tests of RadioGroup, Tag, SplitButton and Alert lie in the vitest
layer, not in the Playwright suite. The reason: the radio input lies — like the
checkbox — invisibly on the drawn dot, and that is exactly what the two red
interaction tests have failed on since the takeover. Laying the same check there
would mean repeating the same known failure.

76 new tests, suite 322 green. Six new demo tiles with baselines in both themes.

### Pulled in from the review

The spec review found a violated guarantee: the tag group had **no** roving
tabindex — every removable tag was a tab stop, and a test had written the fault
down as correct. The group now manages the stop at the DOM; the test checks the
guarantee instead of the implementation.

Also put right:

- The character counter of the `Textarea` stayed on the initial text for an
  uncontrolled field — uncontrolled, the browser holds the value, not React.
- The field label of a `RadioGroup` pointed into the void. The id of the field is
  now carried by the group, not by an option — the latter would make a click on
  the label select the first option.
- A `RadioGroup` whose controlled value pointed at a disabled option had no tab
  stop at all and was unreachable by keyboard.
- `Divider` claimed without a label to be both a separator and decorative.
- The remove button of a tag with non-textual content was called "[object Object]
  entfernen".
- `ButtonGroup` now passes a ref through (principle 1).
- The error focus ring of the `Textarea` follows the value of the `Input`.

`Text` and `Link` were cut back to the ticket's scope: `truncate` and `underline`
are behaviour, not scale, and have gone. In exchange, tracking and leading were
added, which the ticket expressly names.

### Open out of the review

Ticket 06 demands a screenshot baseline of the **focused** skip link; the tiles
are photographed at rest, so this state is unphotographed. And the eight parts
came in one commit instead of one by one, against the spec's own recommendation.

### Not included

The switch (HANDOFF B.6) belongs to the same foundation, but is already specified
there and is carried as a sibling delivery.

## The table as a surface, part one (Aug. 2026)

Delivery report for part C.6. Basis: `.scratch/table-surface/spec.md`, tickets
01, 02, 04 and 05 of nine.

### New

| Part | What it is |
|---|---|
| `model/csv.ts` → `asCsv` | the filtered set as delimiter-separated text |
| `model/view.ts` → `alsSuchparameter`, `ausSuchparametern` | the view as a link and back |
| `model/tableModel.ts` → `orderColumns` | column order, shared with the companion |

`Column` carries two new fields: `label` (column menu, CSV header row) and
`hideable` (`false` for columns that identify the row). `TableInput` takes
`hidden` and `order`; `TableProjection` gives the visible columns back in order,
and `columnCount` derives from that. `useTable` gains `sortRankOf`,
`toggleColumn`, `columnChoices`, `setOrder`, `initialView` and `view`.

### Changed

The sort is an ordered list of levels. The model still accepts a single level,
which is why all fourteen existing model tests stayed green unchanged. Without a
modifier key, one actuation replaces the list and turns up/down as before; with a
modifier key it appends, turns, and at the end of the cycle takes itself out
again.

`Th` reports the modifier key to `onSort` (second parameter) and shows the rank
from two levels on.

### Decisions

Hiding is pure presentation: the pipeline goes on working with all columns, so
that a sort by a hidden column is preserved. And hiding does not reset the page —
unlike search, sort and page size it does not change the set of rows.

`asCsv` returns text and triggers no download; file name and timestamp belong to
the application. Likewise the library does not write the address bar itself —
which is why the package hangs on no routing library.

No server mode: the model stays synchronous.

### Demo

The table is pulled out of `Showcase.tsx` into a `TabellenKachel.tsx` of its own
— it is the densest component of the system and gets two tiles instead of one.
The first is the working table: column menu with switching away and reordering,
export as a real file, multi-level sort with a rank figure. The second, "The
view", shows live what the model makes of it — sort levels, column choice, the
link and the CSV of the filtered set — and lets five example views be loaded.
Loading changes the `key` of the tile, as the contract of `initialView` foresees;
that demonstrates the way back through `ausSuchparametern` as well.

`Showcase.tsx` shrinks in the process from 842 to 501 lines.

### Open

Ticket 03 (the filter chip strip) is blocked — it needs the tag from
`.scratch/foundation-primitives/`. Tickets 06 to 09 (detail row, row actions,
column widths, virtualisation) are outstanding, as are the interaction tests for
multi-level sorting and the column menu.

## Shared parts of the range panels (Aug. 2026)

Delivery report for part C.6. Basis: `.scratch/range-panel-bausteine/spec.md`.

### New

Four parts, all internal, all in the picker folder:

| Part | What it is |
|---|---|
| `range.ts` → `calendarPairProps` | the shared calendar configuration |
| `RangePanel.tsx` → `PresetColumn` | the preset column |
| `RangePanel.tsx` → `MonthPair` | the two chained months with their window arithmetic |
| `RangeTrigger.tsx` | the trigger, the clear ×, and the aria wiring |

`calendarPairProps` closes point 10 out of `picker-shared-modules`, which the
review had found not implemented.

### Changed

Nothing in the behaviour. No commit moment, no two-click rule, no footer, no
class name. Both range pickers are composed out of the same parts; the nesting in
the DOM stays as it was.

### Decisions that were not prescribed here

1. **The earlier estimate was wrong and is withdrawn.** The announcement was to
   make the `DateTimeRangePicker` a composition of the `DateRangePicker` and to
   strike about 60 % of a 570-line file in the process. The files were already
   281 and 526 lines; A.5 §5 forbids the change to the two-click logic that would
   be needed; and the panels cannot be rendered into one another anyway, because
   footers, band derivation and nesting differ.
2. **The focus-follows-active effect stays doubled.** The two versions differ
   with reason: the DateTimeRangePicker must not pull the focus back out of a
   time field. Uniting them would need a parameter that describes nothing but the
   difference.
3. **The trigger takes four named bundles instead of seventeen single props.**
   Built as single values first, then bundled on the review's advice: `refs`,
   `panel`, `feld`, `zustand`.

### Open

- **The line count rises by 115.** The two pickers lose duplicated lines, the
  parts cost more. The gain is locality, not size: "clear while the panel is
  open" previously had to be fixed in four pickers one by one, and one of them
  was forgotten in the process. The preset column, the month pair and the
  configuration carry their weight; the trigger only just does.

### Evidence

`pnpm typecheck`, `pnpm lint` (0 errors), `pnpm build` — clean. `pnpm test:unit`:
233 tests green. `pnpm test:visual`: 44 green, 2 red (pre-existing). No screenshot
baseline has moved.

---

## umriss-ui_12 → the architecture rebuild (Aug. 2026)

Delivery report for part C.6 of the handoff. The basis is five specifications
under `.scratch/`, arising from an architecture review of the package. Order of
implementation: `pure-logic-seams`, `picker-shared-modules`,
`picker-value-contract`, `popover-seam`, `table-model`.

### New

**Pure modules.** The checkable logic now lies outside the React bodies.
Placement by ownership: with the module that owns it, `src/lib/` only from two
users on.

| Module | What it is |
|---|---|
| `NumberInput/number.ts` | German notation: read, format, clamp, step |
| `lib/options.ts` | option lists: filter, set operations, navigation |
| `DatePicker/grid.ts` | month grid, range band, keyboard step |
| `DatePicker/time.ts` | the clock change (`ok \| fehlend \| doppelt`) |
| `DatePicker/range.ts` | presets, day count, two-month window |
| `DatePicker/format.ts` | date and time formats, in one place |
| `DatePicker/contract.ts` | the value contract: a day or an instant |
| `DatePicker/TimeField.tsx` | the time field, extracted from the DateTimePicker |
| `DataViz/scale.ts` | projection and clamping of the marks |
| `Popover/position.ts` | clamp, flip, align — pure arithmetic |
| `model/tableModel.ts` | filter → sort → page |
| `model/companion.ts` | holds the state, carries the selection along |

**`Popover`** (public, package B.4): the one dismissible, anchored surface.
Portal, position, outside click, escape with focus return, travelling along,
stacking order, entrance.

**Tests.** `packages/core` went from 1 to 153 unit tests (repo: 226).

### Changed (with reasons)

- **`NumberInput` reports a clamped value on every route.** Previously a key
  press gave out the unclamped value while blur and stepping gave the clamped one
  — one prop with two contracts that the caller could not tell apart. The text
  stays untouched while typing. A.2 has been brought into line.
- **`DatePicker` "today" gives out local midnight.** The grid already did; the
  button supplied the time of day with it.
- **`DateTimePicker` "now" goes through `resolveLocalTime`.** It was the only way
  around it.
- **The choice between two identical wall-clock times applies per day.** It was
  only reset on opening.
- **Clearing while the panel is open closes it.** Previously a panel stayed
  standing that was filled out of a deleted value (all four pickers).
- **`DateTimePicker` has `size`** — of the four it was the only one missing it.
- **`TablePagination` clamps internally.** Without hits it said "page 1 of 1"
  while "next" was disabled.
- **`Th` gains `column`** and passes the identifier on to `onSort`.
- **Eight panel modules lie on the primitive.** Gone: eight copies of the outside
  click, eight of the escape handler, eight of the scroll follower, nine position
  calculations in four incompatible versions, four of five `@keyframes panelIn`.
  The tooltip takes only the geometry.
- **Stacking order as a scale** (`--u-z-popover/-toast/-tooltip`). A surface
  inside a `<dialog>` portals there and no longer lies behind it.
- **Lint covers `packages/core`.** Previously every rule applied only to
  `packages/charts`.

### Decisions that were not prescribed here

1. **Presets in the `DateTimeRangePicker` keep `23:59`/`23:59:59`.** The
   specification predicted a shift to midnight. That would be a regression: "last
   7 days" would lose the hours of the last day. `23:59` *is* the end of the day
   at this picker's resolution. What was fixed was the actual problem — that a
   shared constant silently delivered different things — now through
   `rangeFromDays`.
2. **The tooltip takes only the geometry, not the element.** It has neither focus
   nor dismissal, its entrance is a different one, its preferred side is above.
   B.4 names exactly that: "position logic only".
3. **The table markup stays composed.** Only the pipeline (~47 lines) moves
   behind the model; the cells are idiosyncratic (trend lines, bars, badges) and
   were better left so.
4. **`Calendar` stays internal.** Its interface first needs a design — four of
   eleven props exist only because it holds no state.
5. **`Calendar` takes `today`.** Without an injectable reference day the grid is
   not deterministically checkable.
6. **The time zone in `vitest.config.ts` is nailed to `Europe/Berlin`.**

### Open

- Two interaction tests stay red (`features-basics.spec.ts`): Playwright cannot
  click the hidden checkbox, because the decorative spans of the `.box` intercept
  the pointer events. Pre-existing, untouched. The selection semantics behind it
  are now checked directly.
- Export `Calendar` — only after a design of its interface.
- `DateTimeRangePicker` is a fork of the `DateRangePicker`, not a composition. If
  one released its fixed "the second click commits and closes", about 60 % of a
  570-line file could be struck.
- Aria on the trigger (`aria-expanded`, `aria-controls`) is still written by every
  caller; the primitive owns only the surface.

### Evidence

`pnpm typecheck`, `pnpm lint` (0 errors), `pnpm build` — clean. `pnpm test:unit`:
226 tests green. `pnpm test:visual`: 44 green, 2 red (see Open). **Not a single
screenshot baseline has moved** — the proof that position, stacking order and
entrance moved house without anything shifting on the screen.
