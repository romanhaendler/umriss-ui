# What is tested, and how

The test standing of the workspace: which layer proves what, where the checkable
seam lies, the conventions a new test follows, and what is known to be open.

How to run any of it stands in `CONTRIBUTING.md` — this document does not repeat
the commands.

Since ADR-0020 the demos run in the same shell, the private package
`@umriss-ui/demo` - five of them since `@umriss-ui/calculation`: forty-one
pages in core, thirteen in charts, twelve in table, eight in schedule, six in
calculation.

**A rendering constant changed and the picture did not?** Then the preview
build is stale. `playwright.config.ts` reuses a running server outside CI, and
a reused server serves the `dist-demo` it was started with - so a renewal can
write the OLD picture and the next run compares it against the old build and
passes. It cost an hour in `schedule-legibility` 03, where the minimum width of
a bar label moved twice without the picture following. The remedy is one
command: `rm -rf packages/<package>/dist-demo` before the run, or kill the
preview server on its port.

**A picture can move because the page grew.** A screenshot of one example is
taken where that example happens to lie, and a new example above it moves the
one below to another scroll offset - where a canvas lands on other half pixels
and rasterises minutely differently. It cost the schedule's demonstration
picture a renewal in `schedule-refinement` 07, and it was measured rather than
assumed: the same 6171 pixels on three repeats, green again with the new
example removed. Whoever adds an example above a canvas picture should expect
that one renewal, and check it is nothing more.

What is photographed and checked stands in **one** place per demo,
`packages/<package>/tests-visual/pages.ts`. It counts nothing off but derives:
the pages from `demo/outline.ts`, the examples from the files under
`demo/examples/`. There is therefore no state in which an example is rendered but
not photographed.

## Layers


| Layer | Tool | Place | Status |
|---|---|---|---|
| Unit tests of the charts (ticks, scale, layout, hit, materialisation, scene, bar geometry, **limit, state, cells, control chart, Pareto, operating time, limits and bands in the scene, downsampling, the time axis, the draw calls, the limit's default axis**) and their jsdom tests (legend toggle, empty state, tone, tooltip format, control chart violations, the scene across frames: hover, highlight, cursor sync, double click) | vitest | packages/charts/tests-unit/ | green |
| jsdom smoke test of the charts demo (every page, every example, the package by name in the source) + SSR test | vitest | packages/charts/tests-unit/ | green |
| jsdom smoke test of the core demo | vitest | packages/core/tests-unit/ | green |
| jsdom smoke test of the table demo: every page with its tables, every example with a title, the package by name in the source | vitest | packages/table/tests-unit/demo-smoke.test.tsx | green |
| The shell's tooling: props reader against fixtures (inherited DOM props, generics, gaps, **type alias as an intersection, union with a discriminant, conditional helper type, call signatures**), source rewriting for both package names | vitest | packages/demo/tests-unit/ | green |
| Unit tests of @umriss-ui/schedule: findings (overlap per lane with setup and teardown, offset depth, late transport by its anchors), ripple (push by what is missing, down a chain, never earlier, the intent's own subtask untouched, a cycle ends), the time axis (fine step from the quarter hour to the day, local ticks and days across the clock change, the operating calendar, zoom around a point, pan), snapping on local time **with a shift offset, the whole-task shift, the auto-pan speed and the place intent's helpers** | vitest | packages/schedule/tests-unit/ | green |
| jsdom smoke test of the schedule demo (every page, every example, the package by name in the source) and the package's guards - style rules, focus, wording | vitest | packages/schedule/tests-unit/ | green; one named exception: the `ripple` page has no props table |
| Unit tests of @umriss-ui/calculation: reading the declaration (the OEE case, `.map` and fragments, one test per development error asserting its message), **reading a chain (the costing sheet, a Minus on a reference, `.map` of lines, a chain in a tree and a tree in a chain, one test per chain rule), the signed sum and interims in evaluation, the statement look (operands before their result, a chain standing open with its interims beneath their lines, a chain as an operand folding and opening whole, no disclosure column where nothing folds, the formula beneath a folded label, the count above four operands, the operator in the sentence)**, evaluation (each operator in operand order, absence through two levels with the given at its root, division by zero, the approximation mark set and not set, assessment and the worst verdict), the rendered lines (formulas, references, initial folding, folding by click and keyboard, the worst-verdict marker, an absent given through to the result), the accessible sentence in English and German, hover and focus coupling | vitest | packages/calculation/tests-unit/ | green |
| jsdom smoke test of the calculation demo and the package's guards - style rules, focus, wording | vitest | packages/calculation/tests-unit/ | green |
| A derivation of the calculation opens beneath the line that was clicked, and that line does not move; a chain in view stands open with one disclosure only for the tree in its lines | Playwright | packages/calculation/tests-visual/features-calculation.spec.ts | green; the one promise of the statement look a picture cannot hold - beside it, three pictures of OEE outside the loop - derivations open, a row hovered inside them, and a phone's width - since every tree starts folded and nothing else would show a band that stops short or a layout that breaks when narrow |
| Unit tests of core (number, options, grid, scale, time, range, value contract, popover geometry, textarea measurement, token contrast, row window, formats characterisation, tree model, limit, limit conformance, freshness, the command palette's searcher, **the dock's resting places**) | vitest | packages/core/tests-unit/ | green |
| Unit tests of @umriss-ui/table: the model (table model, CSV, selection, companion, alarm model – taken over with their tests from @umriss-ui/core, the original left with umriss-table 14), value rules, absent values in the model | vitest | packages/table/tests-unit/ | green |
| Component tests of @umriss-ui/table: registration and order, hiding and reordering across head, body and foot, defaults per value type under a provider with foreign formats, the toolbar with the column filters' conditions (including the ones a table sets up for itself), column menu, pre-filter, list, range and custom filter, export, paging, row detail and actions, widths, virtualisation, initial state from a view, verdict column, alarm list with its density, toolbar and list filter from the provider's wording and formats | vitest + Testing Library | packages/table/tests-unit/ | green; what jsdom cannot see is checked by the package's demo in the browser |
| Type tests of @umriss-ui/table: what must compile and what must not (`@ts-expect-error`) | tsc (`pnpm typecheck`) | packages/table/tests-unit/types.test-d.tsx | green; an expected error that fails to appear makes the type check fail |
| Stylesheet guard: no colour value by hand, no duration outside a reduced-motion block except the named ones, no `--u-` variable in a module, no copied hover edge (`stylesheets.test.ts`, reads the modules as text) | vitest | packages/core/tests-unit/ | green; six named durations, each with a reason |
| Style rules (ADR-0021): every shipped stylesheet begins with the layer order, keeps every rule inside `umriss.tokens`, `umriss.base` or `umriss.components`, and selects only its own elements; the build steps `ownBox`/`ownCorners` and the dist check | vitest, node | `packages/core/tests-unit/stylesheetRules.test.ts`, the guards of core, table and charts, `scripts/check-dist.ts` (`prepublishOnly`) | green |
| Focus guard (ADR-0021): every element a component puts into the tab order - native controls, a `tabIndex` other than a literal `-1`, arrow-key focus via `data-nav` - has a focus style of its own in its stylesheets; read from the source, so closed panels are covered | vitest | `packages/{core,table}/tests-unit/focusGuard.test.ts`, reading `scripts/styles/focus.ts` | green; the elements the reading cannot see stand in the guard with their reason |
| Wording guard: no German text in a component's JSX node or prop, bypassing the wording (`wordingSource.test.ts`, reads the sources through the TypeScript parser) | vitest | packages/core/tests-unit/ | green; the exception list is empty |
| Behaviour tests of ContextMenu (opening at a point, keyboard cycle, focus return, portal; its real position and its flip at a window edge stand in the browser suite), Popover, Tooltip, Modal, Toast (role follows tone), the four date pickers (now, reopening, Enter, presets), month pair, RadioGroup, Tag, SplitButton, Alert, the language seam, the root provider with `useDensityFor`, the tree (keyboard, screen reader, ticking, search, virtualisation), Stat, command palette and **Dock** | vitest + Testing Library | packages/core/tests-unit/ | green |
| Screenshot comparisons (page heads and examples × light/dark) | Playwright | packages/*/tests-visual/screenshots.spec.ts (core, charts, table, schedule, calculation) | baselines checked in (darwin); green for core, table and schedule, **and not reproducible for the charts' examples – see Known open**; one image per example with the code **collapsed**, one per page from the head to the first example; plus two images outside the loop, the command palette's open window searching and in its populated resting state – the topmost layer is in no example – and the **dock's four resting places**, because the loop only photographs the one it starts at |
| Interaction tests of the charts | Playwright | packages/charts/tests-visual/features-interaction.spec.ts | green |
| Nothing the schedule draws in the DOM is in its own way: every overlay inside its clipping box, no two labels of a kind over each other | Playwright | `packages/demo/checks/overlays.ts`, called by `packages/schedule/tests-visual/overlays.spec.ts` with every page - and by the editing suite in the middle of a drag, which is the one moment a static page cannot reach | green; it was written against a real defect (the ghost's label clipped in the topmost lane) and shown to fail on it |
| The rows of a schedule's plot: a flat plan laid out exactly as the arithmetic it replaces, a tree of lane groups, a fold, a fold inside a fold, a strip's floor of three pixels, and `laneAt` as the inverse of `laneTop` over forty trees drawn at random | Vitest | packages/schedule/tests-unit/rows.test.ts | green; written **before** `src/rows.ts`, because every y in the package comes from it |
| What a drawing actually put where: counted pixels of a rectangle of a plot's canvas, counted inside the browser | Playwright | `packages/schedule/tests-visual/pixels.ts`, used by `features-schedule.spec.ts` and `features-editing.spec.ts` | green; it is what lets "hollow", "capped at its ends", "faded at the left", "a rail that stops at the main time" and "a strip inside a folded group" be tests rather than snapshots that only say something changed |
| Every example runs as it is copied: it imports the package's `src` and bare npm specifiers, and whatever else it needs it SHOWS beside itself | Playwright (file system) | `packages/demo/checks/ownData.ts`, called by `packages/*/tests-visual/own-data.spec.ts` | green in all five demos; run before the repair it named all 25 offenders, in the two demos that had them |
| Behaviour of the schedule: its name and lane headers as text, the day band and the fine band's step under zoom, pan in both directions with headers and bands holding still, hover, click and right-click with their target, task-wide selection with its subtask, **the wheel scrolling the lanes and releasing the page, Ctrl-wheel and a pinch zooming, the tooltip's content and an application's own, the now line, two schedules kept in step and the point-to-time handle** | Playwright | packages/schedule/tests-visual/features-schedule.spec.ts | green; the pinch is driven through the protocol - Playwright has no multi-touch API, and Chromium turns the touches into pointer events |
| Editing through the seam (ADR-0023): the ghost's times and findings before the drop, the reported move and lane intents after it, Escape, a read-only schedule that pans instead, setup grips on selection, stretch, the demonstration's context menu changing the plan through an intent, **auto-pan at the edge of a drag, the shift raster, the whole-order shift, a drag into a removed night stopping at the seam, and work dragged in from a list with its place intent** | Playwright | packages/schedule/tests-visual/features-editing.spec.ts | green; asserts what is reported and what the DOM says, never pixels. The drag from outside is the platform's own, driven by the mouse, and the ghost is observable while it is in flight |
| Operating the demo shell (outline, jumps, palette, addresses) | Playwright | packages/*/tests-visual/features-shell.spec.ts | green; **one** suite at the shell (`packages/demo/checks/shell.ts`), which calls each of the four demos with its own pages and terms – with axe and the palette's rules that jsdom cannot express (a resting pointer, the resting state, the material). Charts had a shell and a suite of its own until ADR-0020; beside the shared call there stands the one promise that is charts' own – the benchmark does not run on the front door |
| Own base (ADR-0021): every example's text in a type of its own, every element with a library class in `border-box`, every element that takes the keyboard focus showing the library's ring (the browser's own ring does not count) | Playwright | `packages/demo/checks/ownBase.ts`, called by `packages/*/tests-visual/own-base.spec.ts` with every page; light only | green; the tolerated offenders stand in the spec files with their reason |
| Interaction tests of core, the context menu's position and its flip included | Playwright | packages/core/tests-visual/features-basics.spec.ts | green |
| Operating a page (code switch, page switch, copy button) | Playwright | packages/{core,table}/tests-visual/features-page.spec.ts → `packages/demo/checks/page.ts` | green; the copy test checks what really lies on the clipboard – none of which can be expressed in jsdom |
| Interaction tests of the table: conditions in the toolbar, multi-sort, row detail, row actions, widths, width in the view, sorting, search with a footer, selection across all pages, paging, bulk action; virtualisation | Playwright | packages/table/tests-visual/features-table.spec.ts, features-virtual.spec.ts | green; the counterparts of the suites that ran in core until umriss-table 14, promise for promise |
| The table's position stays put while one searches, filters and resets (table-filters D1) | Playwright | packages/table/tests-visual/features-table.spec.ts (`@both-themes`) | green; measures the table's head in both themes – a toolbar that grows a line taller moves it in only one |
| What jsdom cannot prove about the table: a sticky row header behind selection and expanders, a silent gesture as a computed colour, focus in the column menu, the download and its content, reordering moves head, body and foot | Playwright | packages/table/tests-visual/features-browser.spec.ts | green; on its first run the first test found control cells growing wider than their sticky offsets |
| Interaction tests of the tree | Playwright | packages/core/tests-visual/features-tree.spec.ts | green |
| Interaction tests of the dock | Playwright | packages/core/tests-visual/features-dock.spec.ts | green; drag, refusal, change and reduced motion – none of it observable in jsdom |
| Accessibility check of a sample of pages (axe, WCAG 2.1 AA) | Playwright | packages/{core,charts,table,schedule,calculation}/tests-visual/accessibility.spec.ts | green; three individually justified colour pairs tolerated – the list stands once, at the shell (`packages/demo/checks/accessibility.ts`), and holds for all five demos, none added for the charts or the schedule – plus one run each with every code block open |

## Pure modules (the checkable seam)


Since the three operations packages the same holds for `@umriss-ui/charts`; the
table below lists both packages. The limit stands **twice**, once in each package
– that is deliberate and argued in ADR-0006, and a conformance test in
`packages/core/tests-unit/limitConformance.test.ts` runs both versions from one
case table and holds them against each other. `themeFallbackConformance.test.ts`
runs in the same direction: it holds the charts' substitute colours – the literal
in `charts.css` and `FALLBACK_THEME` – against the light token, with one named
exception for muted text.

The logic that can be checked without a DOM lies deliberately outside the React
bodies. Placement follows ownership: with the module it belongs to, and in
`src/lib/` only once two or more need it.

| Module | Content |
|---|---|
| `NumberInput/number.ts` | German notation: reading, formatting, clamping, counting |
| `lib/options.ts` | option lists: filtering, set operations, navigation |
| `DatePicker/grid.ts` | the month grid, the range band, the keyboard step |
| `DatePicker/time.ts` | the clock change (`ok \| missing \| duplicate`) |
| `DatePicker/range.ts` | presets, day counting, the two-month window, the pair's calendar configuration |
| `DatePicker/format.ts` | date and time formats, in one place |
| `DatePicker/contract.ts` | the value contract: `day` or `instant` |
| `DataViz/scale.ts` | projection and clamping of the marks |
| `Popover/position.ts` | clamping and flipping, pure arithmetic |
| `table/model/tableModel.ts` | filter → sort → page, column order and visibility |
| `table/model/csv.ts` | the filtered set as delimiter-separated text |
| `lib/virtual.ts` | a row's visible window and scroll target |
| `Dock/place.ts` | the zone under the pointer, the strip's length, the space required, arrow → resting place |
| `lib/language/formats.ts` | date, time, number, percentage, collation, relative duration |
| `lib/limit.ts` | limit, target value, assessment – four outcomes |
| `lib/freshness.ts` | reading → fresh \| stale \| disconnected, and the cadence for it |
| `table/alarms/alarmModel.ts` | lifecycle, order, frequency, flood, return band |
| `table/values.ts` | absent, the kind of a value, text without children, sort and export value, footer |
| `lib/language/wording.ts` | every text the library emits |
| `Textarea/measure.ts` | the character counter and height clamping |
| `styles/tokens.css` (checked, not executed) | contrast of the token pairs, both themes |
| `charts/limit.ts` | the same rule, a second house (ADR-0006) |
| `charts/state.ts` | the segment boundary and the segment under the pointer |
| `charts/cells.ts` | the cell edge in two dimensions, a hit inside the cell |
| `charts/controlLimits.ts` | control limits, zones, four rule violations |
| `charts/pareto.ts` | sort, accumulate, collect the remainder, cutoff |
| `charts/operatingTime.ts` | wall clock ↔ operating time, breaks, ticks, clamped position |
| `charts/downsample.ts` | first, min, max and last per pixel column, gaps kept, the window of a zoomed course |
| `charts/time.ts` | the time step, ticks on local boundaries across the clock change, labels by level |
| `charts/hit.ts` (`nearestIndex`, `nearestPoint`, `lowerBound`) | the nearest x, the nearest point in pixel space, the first index not below a value |
| `schedule/findings.ts` | overlaps per lane, offset depth, late transports |
| `schedule/ripple.ts` | the cascade over successors, as moves |
| `schedule/timeAxis.ts` | fine step, local ticks and days through the calendar, zoom and pan |
| `schedule/snap.ts` | a time onto a raster in local time, with a shift offset |
| `schedule/shiftTask.ts` | a whole task moved, as move intents |
| `schedule/autoPan.ts` | how fast the plot pans at the edge of a drag |
| `schedule/appearance.ts` | what a bar says besides its colour, and which of two contradicting words wins |
| `schedule/geometry.ts` (`barLabelBox`, `transportPath`) | where a bar's label lies and when there is none; the route and the anchor of a transport |
| `schedule/geometry.ts` (checked in the browser) | subtask boxes on whole pixels, transport curves, the hit |

The time zone is pinned to `Europe/Berlin` in `packages/core/vitest.config.ts`,
`packages/table/vitest.config.ts` and `packages/schedule/vitest.config.ts`: the clock-change tests check concrete
transitions (29.03.2026 forward, 25.10.2026 back).

## Conventions


* Screenshots run against the real demo build (`vite preview`), never against the
  dev server.
* Light and dark through the Playwright projects (colorScheme emulation); the
  demos initialise their theme from `prefers-color-scheme` and switch it with
  `color-scheme` on the root, as an application does.
* **The examples stand on the browser's defaults.** The shell gives its own
  chrome a type (`.shell`), and `.exampleStage` resets font, colour and smoothing
  to the browser's (`page.css`); the library has no base layer (ADR-0021). A
  component that leans on its surroundings shows it in its screenshot, and the
  own-base checks catch what a picture cannot see.
* The clock is frozen in every test (`page.clock.setFixedTime`, 17.03.2026
  10:30). Where a hook reads the clock – freshness does, that is its job – it
  stands still in the jsdom test too (`vi.useFakeTimers`).
* A page carries `data-block`, an example `data-example`. Neither list is
  maintained but derived (`pages.ts`): a new example file is a new image, without
  anything being added anywhere. An image without a baseline fails instead of
  being skipped silently.
* One page of @umriss-ui/table's demo shows many tables. No test reaches
  page-wide for `th` or `tbody tr`; whoever means a particular one writes that
  into the selector (`[data-example="vorfuehrung"]`). The fault was always in
  the selector, and in @umriss-ui/core's old table page it only came to light
  through the second table.
* Photographs are taken only with the code **collapsed**. An open code block
  would tie the baseline to the source, and a renamed variable in an example
  would become an image diff.
* The charts' benchmark example is excluded from the screenshots (R-5.1). It is
  the one gap in a derived list, and it carries its rule at the place where it is
  made (`packages/charts/tests-visual/pages.ts`).
* **A demo resolves the neighbouring package's stylesheet from source, and that
  is the one path exception.** `@umriss-ui/core/styles.css` exists only after a
  build, so the demos of `@umriss-ui/table` and `@umriss-ui/charts` alias it to a
  short `demo/ui-styles.css` that imports the tokens out of
  `packages/core/src/styles/`. The lint forbids exactly this route for `.ts` and
  `.tsx` and cannot see it in CSS; the reason stands in both files and in the
  alias that puts them there (`vite.demo.config.ts`).
* The demo data of the operations instruments carries domain reference – a state
  band without states and a Pareto without fault reasons show nothing. The other
  half of R-6.2 holds unchanged and is the more important one: everything is
  seed-based and identical across runs and platforms.
* Interaction tests run only in the light project – they are behaviour tests, not
  appearance tests.
* Demo data is seed-based and deterministic (R-6.2); the interaction tests check
  concrete values at known positions.
* Unit tests build their own fixtures, never the demo data – otherwise the suite
  breaks on a changed demo line.
* Expected values come from an independent source: weekdays from the system
  calendar, clock changes from the real transitions, notation from the rule –
  never from the implementation's own arithmetic.

**German that is the subject and not a leftover.** Five test files keep German
fixtures on purpose, and a sweep must leave them alone:

- `defaults.test.tsx` and `tableModel.test.ts` sort a row named **Änderung**.
  The test exists to show that German collation files Ä with A; renamed to
  "Change" it checks nothing.
- `treeModel.test.ts`, `treeSearchAndSize.test.tsx` and
  `treeInteraction.test.tsx` encode **letters**: the type-ahead jumps on "a",
  "ge" has to tell *Gemischt* from *Gesperrt*, and a search for "a" must reach
  *Anlagen*, *Einzelblatt* and *Archiv* but not *Leer*.
- `toolbarWording.test.tsx` and `wordingSource.test.ts` assert the German
  **wording** itself.

Translating the first five took nine tests' subject away before it was noticed.
The rule: before renaming a fixture, ask whether the test measures the value or
measures a property *of* the value.

On the command palette's translucent material (ADR-0012): the contrast test
cannot assess it – a value with alpha has no known ground. It holds the type
against the opaque substitute colour underneath instead, that is against the
genuinely worst case one can compute; that the pane really carries the material
is checked by `features-shell.spec.ts` through the computed style. The open
question of whether a blurred image stays stable from run to run is answered: it
did across repeated runs, and the baseline is checked in.

The screenshot baselines are platform-specific (a suffix in the filename). On a
platform other than darwin, `pnpm test:visual:update` produces that platform's
baselines; they are checked in as well.

## The demo shows one page at a time – tests navigate


There is **one** view: a sidebar, a page in the content. There is deliberately no
second mode rendering everything one below the other – that would be a second
truth about the same page, and the tests would then have checked something nobody
gets to see.

Tests therefore go where a person would go too:
`packages/core/tests-visual/navigation.ts` provides `open(page, pageId)` and
`openExample(page, pageId, exampleId)` and takes the address from
`demo/outline.ts` – the only place that knows the address format. The rubric is
deliberately **not** in the address: it sorts the sidebar and means nothing
inside the library, so a re-sorting must not break a link (CONTEXT.md, "Rubric").

`open` waits for three things: the fonts, the page's visibility, and **the end of
the jump highlight**. The third is not caution but a finding: under load, axe
measured an intermediate colour of the running animation and reported a
long-tolerated colour pair as a new finding.

## The order of exports is part of the appearance


`src/index.ts` determines the order in which the module styles land in the
bundle, and two rules of equal specificity are decided by order. Filing two new
exports alphabetically moved the table images by two pixels – and it was caught
by exactly the assurance that exists for it: **no existing baseline moves.** New
exports therefore stand at the end of the file, with a note there. Whoever
re-sorts them should expect baselines to wander.

On the dock (floating-dock): here the counterpart to "pure modules" is expressly
what does **not** stand in jsdom. Without layout there are no zones (jsdom
reports every element as zero-sized), so no space requirement and no refusal
either; and without `Element.animate` no change of orientation. The arithmetic
therefore stands without a DOM in `dockPlace.test.ts`, the gesture in the browser
in `features-dock.spec.ts`, and what remains in jsdom is exactly what a person
would observe on the tree: tab stops, arrow keys, marking, announcement. So that
the drag can be reproduced there at all, `setup.ts` carries two polyfills –
jsdom has no `PointerEvent` at all, and no pointer capture either.

## Known open

* **The charts' example pictures do not reproduce, and that is new.** Two to
  four of the twenty-seven differed from run to run – a different set each time, by
  371 to 2338 pixels, which is a ratio of 0.001 to 0.006 against the workspace
  bound of 0.001. The differences sit on the numeric tick labels and along the
  marks. Since the charts-review packages (2026-09-23) the demo has more
  examples and it is worse: 13 to 30 of the example pictures fail per full run,
  again a different set each time, a whole plot shifted by a fraction of a pixel
  (up to a ratio of 0.01); a picture that fails passes on a repeat.

  **The same drift reaches the schedule when an example MOVES.** Cutting the
  demo by feature (`schedule-lane-groups` 05) put every example at a different
  scroll position on a shorter page, and five of them re-rendered with their
  text on a different subpixel. Measured on `selection`, 988 × 404: 6392 of
  399152 bytes differ, **none of them inside the plot** – 1147 in the lane
  headers and 2338 in the time labels, both of them text. The drawing is
  byte-identical. So a schedule picture that changes only in its text after an
  example has been renamed is this, and not a change to the component; a
  picture that changes inside the plot is not.

  It is not a settling race, and that was established rather than assumed. Three
  waits were tried in `packages/charts/tests-visual/navigation.ts`: two frames,
  then the plot rectangles holding still (rounded, then at full precision), then
  two consecutive frames that are pixel-identical on every canvas. None of them
  changed the outcome. The decisive measurement was `--repeat-each=3`: **inside
  one run** the same picture passes one repeat and fails the next, so the
  variance is in the rasterisation and not in when the picture is taken.

  What changed to bring it on: until ADR-0020 the charts demo drew in a fixed
  1080-pixel column in `system-ui`, and its 26 baselines were stable at the same
  bound. In the shared shell the column is laid out against a sidebar and the
  labels are set in Geist, so the marks and the DOM labels no longer land on the
  same pixel grid.

  **The schedule is evidence for the first way.** Its canvas draws on the same
  kind of plot, in the same shell and font, and every position goes through
  `Math.round` before it reaches the canvas (`packages/schedule/src/geometry.ts`);
  its fifty pictures passed three consecutive runs without a difference.

  Three ways out, none of them taken yet, because each is a decision and not a
  repair: **round the scene's measurements and the canvas backing to whole device
  pixels** in `packages/charts/src` – the root fix, its own ticket, and it
  rebaselines charts once more; **a named exception** raising the bound for the
  two charts projects with the measurement written at it – which `CONTEXT.md`
  argues against, since taking on an exception is allowed and softening the bound
  is not; or **photograph the charts pages at the page head only** and let
  `features-interaction.spec.ts` carry the marks, which it already does through
  the canvas pixels rather than through a picture.

* ~~Two interaction tests fail on the hidden checkbox `input`.~~ **Done
  (table-surface, Aug. 2026).** The finding was not a defect of the checkbox but
  of the two tests: they clicked the input, which lies invisibly beneath the
  decorative spans. A person hits the drawn box, and that belongs to the
  enclosing `<label>` – a click on it toggles the input natively. Two lines, and
  the Playwright suite has been fully green since. Whoever operates a checkbox in
  a test aims at the label, not at the input.
* The popover position is only checked as pure arithmetic, not through the
  element: jsdom reports every element as zero-sized, and there is no layout
  there. Dismissal, focus and roles do run in jsdom.
* The tooltip takes its geometry from the primitive (`align: "center"`,
  `side: "top"`) and, since library-audit 01, its portal rule as well – the same
  function `portalTargetFor` (dialog, then the setting, then the body), so that a
  tooltip inside a modal no longer sits behind the dialog. It does not take the
  element: it has neither focus nor dismissal, its entrance is a different one,
  and on scrolling it disappears instead of travelling along. The remaining
  difference is therefore only behaviour, not a layer.
* jsdom is pinned to ^26: jsdom 30 pulls a pure ESM package in through
  `require()`, which does not load on Node 22.11 and prevented every vitest run.
