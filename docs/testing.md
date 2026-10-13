# What is tested, and how

The test standing of the workspace: which layer proves what, where the checkable
seam lies, the conventions a new test follows, and what is known to be open.

How to run any of it stands in `CONTRIBUTING.md` — this document does not repeat
the commands.

Since ADR-0020 the demos run in one shell, the private package `@umriss-ui/demo`.

**A rendering constant changed and the picture did not?** Then the preview
build is stale. `playwright.config.ts` reuses a running server outside CI, and
a reused server serves the `dist-demo` it was started with - so a renewal can
write the OLD picture and the next run compares it against the old build and
passes. It cost an hour in `schedule-legibility` 03, where the minimum width of
a bar label moved twice without the picture following. The remedy is one
command: `rm -rf packages/<package>/dist-demo` before the run, or kill the
preview server on its port.

**A word changed and the picture did not?** Then it stayed inside the
tolerance. `maxDiffPixelRatio` is 0.001, and one word in an example's lead is
fewer pixels than that, so the old picture passes - and `--update-snapshots`
alone renews only pictures that fail, keeping the old words in the baseline.
`--update-snapshots=all` with `-g` on the picture writes it anew. Found in
`calculation-metrics`, where "column" stayed in a baseline after the lead said
"metric".

**A picture can move because the page grew.** A screenshot of one example is
taken where that example happens to lie, and a new example above it moves the
one below to another scroll offset - where a canvas lands on other half pixels
and rasterises minutely differently. It cost the schedule's former demonstration
picture a renewal in `schedule-refinement` 07, and it was measured rather than
assumed: the same 6171 pixels on three repeats, green again with the new
example removed. Whoever adds an example above a canvas picture should expect
that one renewal, and check it is nothing more.

What is photographed and checked stands in **one** place per demo,
`packages/<package>/tests-visual/pages.ts`. It counts nothing off but derives:
the pages from `demo/outline.ts`, the examples from the files under
`demo/examples/`. There is therefore no state in which an example is rendered but
not photographed.

## Kinds of test

Which test lives where is what the file tree shows (`packages/*/tests-unit/`,
`packages/*/tests-visual/`, `tests-unit/` of the demo shell); this is what each
kind is for.

* **Unit tests (vitest, jsdom)** prove logic and behaviour that needs no layout:
  the pure modules, model and hook behaviour, roles, focus and dismissal, the
  demo shell's tooling (props reader, generated text for agents, addresses).
  They run per package.
* **Smoke tests of a demo** open every page and every example in jsdom and check
  that each renders, and that the package is named in the source it shows.
* **Guards** read the sources as text or walk the exports and fail on a rule,
  not on a behaviour: no raw colour or `--u-` variable in a module, no German in
  a component, one stroke width in the glyphs, a focus ring and a word or glyph
  beside every verdict colour, the style rules of ADR-0021, the pass-through of
  props, the vocabulary of `CONTEXT.md`. A new rule of that kind becomes a guard.
* **Type tests** (`tsc`) prove what must compile and what must not
  (`@ts-expect-error`).
* **Screenshot comparisons (Playwright)** hold the appearance of every page head
  and example, light and dark. They are derived, not listed (see above).
* **Interaction tests (Playwright)** prove what jsdom cannot measure: layout,
  position, sticky and pinned parts, canvas pixels, keyboard walks through a
  real plot, forced colours, server mode against the example's fake server. They
  run in the light project only.
* **The accessibility check (axe, WCAG 2.1 AA)** runs a sample of pages in both
  themes inside the same Playwright suite.
* **The check on the built package** (`check:dist`, before publishing and in
  CI) holds what only the built file shows: the directive, the stylesheet
  import, the rules of ADR-0021 - and the **residue**: an entry that imports a
  built entry and uses nothing is bundled, and what remains must stay under one
  budget. An unmarked call at the top of a module fails it, named.
* **The benchmark pages** of the charts, the table, the schedule and core's
  tree are no tests. They are opened by hand (or driven by a script through
  their `data-role` names), they assert nothing, and their figures are written
  into the package's capability record with the machine they were taken on.

## Pure modules (the checkable seam)

The logic that can be checked without a DOM, in core, charts, table and schedule, is
kept pure and tested directly. The limit stands **twice**, once in each package
– that is deliberate and argued in ADR-0006, and a conformance test in
`packages/core/tests-unit/limitConformance.test.ts` runs both versions from one
case table and holds them against each other. `themeFallbackConformance.test.ts`
runs in the same direction: it holds the charts' substitute colours – the literal
in `charts.css` and `FALLBACK_THEME` – against the light token, with one named
exception for muted text.

The logic that can be checked without a DOM lies deliberately outside the React
bodies. Placement follows ownership: with the module it belongs to, and in
`src/lib/` only once two or more need it.

The time zone is pinned to `Europe/Berlin` in `packages/core/vitest.config.ts`,
`packages/table/vitest.config.ts` and `packages/schedule/vitest.config.ts`: the clock-change tests check concrete
transitions (29.03.2026 forward, 25.10.2026 back).

## Conventions


* Screenshots run against the real demo build (`vite preview`), never against the
  dev server.
* Light and dark through the Playwright projects (colorScheme emulation); with
  nothing stored the shell's theme follows `prefers-color-scheme` and switches
  it with `color-scheme` on the root, as an application does. A test starts
  with empty storage, so the emulation decides.
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
* The benchmark examples of the charts, the table, the schedule and core are
  excluded from the screenshots (R-5.1 for the charts). They are the gaps in a
  derived list, and each carries its rule at the place where it is made (the
  package's `tests-visual/pages.ts`).
* **A demo resolves the neighbouring package's stylesheet from source, and that
  is the one path exception.** `@umriss-ui/core/styles.css` exists only after a
  build, so the demos of `@umriss-ui/table` and `@umriss-ui/charts` alias it to a
  short `demo/ui-styles.css` that imports the tokens out of
  `packages/core/src/styles/`. The lint forbids exactly this route for `.ts` and
  `.tsx` and cannot see it in CSS; the reason stands in both files and in the
  alias that puts them there (`vite.demo.config.ts`).
* **The core demo's scenarios import every package.** They reach charts,
  table, schedule and calculation by alias to their sources, in the demo build,
  the unit tests and `typecheck:demo` alike, and not by a devDependency - that would
  close a cycle with the table's peer dependency on core. The lint allows it in
  `packages/core/demo/**` and nowhere else in core.
* A demo with a clock of its own advances by what `Date.now()` says has passed,
  never by counting timer ticks: the suites freeze `Date` and leave the timers
  running, so only the first holds still for a picture. The kiln line scenario is
  the one such screen, and its suite moves the frozen clock by hand to see it run
  (`features-control-room.spec.ts`).
* The demo data of the operations instruments carries domain reference – a state
  band without states and a Pareto without fault reasons show nothing. The other
  half of R-6.2 holds unchanged and is the more important one: everything is
  seed-based and identical across runs and platforms.
* Each package's browser suite follows one pattern: `screenshots.spec.ts` for the
  pictures, `features-<subject>.spec.ts` for behaviour, `accessibility.spec.ts`
  for the axe run, `pages.ts` and `navigation.ts` for the two derived lists every
  spec of that package reads. A unit test file is named after its subject.
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

## Three ways to run the visual suite

* **Quick:** `pnpm test:visual:quick <package>` (`core`, `charts`, `table`,
  `schedule`, `calculation`) builds only that demo and runs the light project's
  tests tagged `{ tag: "@quick" }`: the page-head and scenario screenshots, the
  phone and narrow-width layout checks, and the shell's sideways-scroll checks.
  A test that should belong takes the tag in its `test(...)` or `describe(...)`
  call; nothing else lists them. It does not replace the full run.
* **Full:** `pnpm test:visual` (20-50 minutes). `DEMOS=table,charts`
  (comma-separated, unset = all) limits `webServer` and `projects` to those
  packages, in any playwright call.
* **On main:** `pnpm test:visual:on-main '<pattern>'` exports `main` with
  `git archive` into a temporary directory, installs offline, runs
  `playwright test -g '<pattern>'` there and removes the directory: the answer
  to "did this fail before me?". It refuses to start while one of ports
  4173-4177 is in use.

`.github/workflows/visual.yml` runs the full suite on macOS when started by
hand (Actions → Visual → Run workflow). It has not run yet, and the runner's
fonts may differ from the maintainer's; once a run is green it goes on every
push to `main`.

## Known open

* ~~The charts' example pictures do not reproduce.~~ **Done (Sep. 2026).** 13 to
  30 of the example pictures failed per full run of the two charts projects, a
  different set each time, and a failing one passed on a repeat. It was never
  the rasterisation. Measured at the moment of the picture, the y band of a
  failing chart was **one or two whole pixels wider** than in the run before –
  `47.13` against `49.13` for the first tick label – and so the plot, its line
  and every label moved with it. The band width was path-dependent: the layout
  keeps band widths under hysteresis (R-3.4, a band grows at once and shrinks
  only by `HYSTERESIS` = 8 pixels), and a layout that ran before Geist had
  arrived remembered the width of the fallback font. `loadingdone` cleared the
  measurement cache but not that memory, so whether a band stayed a pixel too
  wide depended on which came first under load, the font or the first frame.
  `ChartScene` now clears the hysteresis together with the cache, on a font
  load and on a change of theme; with that, every plot's geometry and canvas
  signature were identical across repeats under full parallel load, 28 of the
  92 baselines were taken anew once (they had been recorded with a band left
  too wide), and the suite has passed two full runs and a `--repeat-each=3`
  since.

  Not the cause, and measured rather than assumed: the unrounded plot rectangle
  (`getBoundingClientRect`), the per-frame `getImageData` in
  `packages/charts/tests-visual/navigation.ts`, and the missing GPU flags with
  `fullyParallel` – under all three unchanged the canvas signature came out
  identical once the band width was. Whoever sees this again: probe the label
  positions at the moment of the picture before suspecting the pixels.

  **The schedule note stands apart and is still true.** When a schedule example
  MOVES (`schedule-lane-groups` 05 put every example at a different scroll
  position), five pictures re-rendered with their text on a different subpixel
  – 6392 of 399152 bytes on `selection`, none of them inside the plot. That is
  deterministic, not a flake: a schedule picture that changes only in its text
  after an example has been renamed is this, and not a change to the component.

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
  `side: "top"`) and its portal rule as well - the same function
  `portalTargetFor` (dialog, then the setting, then the body). Inside a dialog
  it also stands in the top layer, as a manual popover shown before it is
  measured, so that it lies above the toasts there and a transforming dialog
  does not move it. It does not take the element: it has neither focus nor
  dismissal, its entrance is a different one, and on scrolling it disappears
  instead of travelling along. The remaining difference is therefore only
  behaviour, not a layer.
* jsdom is pinned to ^26: jsdom 30 pulls a pure ESM package in through
  `require()`, which does not load on Node 22.11 and prevented every vitest run.
