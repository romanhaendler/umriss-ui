# What is tested, and how

The test standing of the workspace: which layer proves what, where the checkable
seam lies, the conventions a new test follows, and what is known to be open.

How to run any of it stands in `CONTRIBUTING.md` — this document does not repeat
the commands.

Since ADR-0020 the demos run in the same shell, the private package
`@umriss-ui/demo` - five of them since `@umriss-ui/calculation`: fifty-one
pages in core, thirteen in charts, twelve in table, eight in schedule, eight in
calculation.

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

## Layers


| Layer | Tool | Place | Status |
|---|---|---|---|
| Unit tests of the charts (ticks, scale, layout, hit, materialisation, scene, bar geometry, **limit, state, cells, control chart, Pareto, working time, limits and bands in the scene, downsampling, the time axis, the draw calls, the limit's default axis, the data table's rows, the marks, the stacking**) and their jsdom tests (legend toggle, empty state, tone, tooltip format, control chart violations, the scene across frames: hover, highlight, cursor sync, double click, **the keyboard's walk, the readout and summary, zoom by key, the wording, the data table, the legend under encoding by marks, a stack in the tooltip, readout, table and hit**, **the view: zoom through `zoomable` and `setDomain`, the legend's toggle and gestures, 'Show all', a view handed in by content and its late echo - `zoomKeys`, `legendToggle`, `showAll`**) and **the walk as a pure module (positions, bands, cells)**, **the view as a pure module (`view.test.ts`), `useChart`'s identity and rows (`useChart.jsdom.test.tsx`) and its types (`useChart.test-d.tsx`)** | vitest | packages/charts/tests-unit/ | green |
| jsdom smoke test of the charts demo (every page, every example, the package by name in the source) + SSR test | vitest | packages/charts/tests-unit/ | green |
| jsdom smoke test of the core demo, **the ten configurators of the closed list each at rest with only its required props** | vitest | packages/core/tests-unit/ | green |
| jsdom smoke test of the table demo: every page with its tables, every example with a title, the package by name in the source | vitest | packages/table/tests-unit/demo-smoke.test.tsx | green |
| The shell's tooling: props reader against fixtures (inherited DOM props, generics, gaps, **type alias as an intersection, union with a discriminant, conditional helper type, call signatures**, **`@default` - a value, a phrase, one that contradicts the destructuring pattern stopping the reader with file and line - and `@deprecated`, also from one arm of a union**, **a `never` in a union's arm merged away with its sentence kept, a helper's parameters replaced by the arguments at the use, a header's constraints and defaults, a free type parameter stopping the reader**), source rewriting for both package names, **the gate stopping at an export of the entry or a subpath without JSDoc, every one with file and line (`exportDocs.test.ts`)**, **the gate's internal references - a requirement number, a source path, an ADR number no file answers - flagged with file and line in a description and in an outline's texts, every ADR number a link to its file in both writers, and every prerendered page of the five demos naming no requirement and no ADR outside a link (`references.test.ts`, `propsReader.test.ts`, `llmsGuard.test.ts`; on the built site the guard in `scripts/build-pages.mjs`)**, **the configurator: a prop's type to its control (a union of up to five a choice, more a select, a boolean a switch, a number a number field, a phrase default to the value it comes to), the code leaving every default out, and a prop the table lacks or no control can be made of failing with file and prop (`configurator.test.ts`)**, **which example shows which row, through the type checker against a fixture package - a JSX attribute, JSX children, an object literal by its contextual type - also one a callback maps into the array a prop takes -, a property access on an output type, a spread counted by its own type only, two props of one name kept apart, an inherited row covered in both tables, a configurator's controls, required props and text counted against `<Name>Props` (its file's name, or the `name` it exports) as "Configurator" on its page; own page first - its configurator before its examples -, then the outline's order, then the scenarios; the same on every run; the gate stopping - on the props tables a page lists, never a reference or definition table - at a row no example uses that `demo/unshown.json` does not list - an entry's reason is either "not shown yet" or an exception's category with its one-line reason: (a) a pass-through to the DOM or React, (b) an escape hatch the prose explains, (f) a twin of a prop shown on a sibling type, (g) a deprecated alias -, at an entry whose row is shown now (stale) and at one naming no row, all of them in one run (`shownIn.test.ts`) - and the "Shown in" line written alike in HTML and Markdown: three links and "and N more", none without a use, the row's name a link to `#<Type>-<prop>` (`apiTable.test.ts`); on the built site every `#<Type>-<prop>` link finds its id (`typeLinkFaults`, `site.test.ts`)**, **"Props on this page" on a page without a table of its own: exactly the rows its examples use, cut from each full table in its order, introduced by the full table and its page, each name linking to the full row, no "Shown in" line, none on a page with a table (`apiTable.test.ts`), and the same section in the full text and the prerendered page (`llms.test.ts`)** | vitest | packages/demo/tests-unit/ | green |
| The text for coding agents (`llms.txt`, `llms-full.txt`): the generator against a fixture package (pages and links, examples in the demo's order with the demo's source, a shown file once, the props table escaped, a why page as prose, the install command derived from the manifest in the install line and as text under the import line of the page that installs; the command itself in `install.test.ts`), and the completeness guard - every name each package exports, subpaths included, appears in its text; **the props table written from one model by two writers, HTML and Markdown, held to the same rows, order, types, defaults and required labels, a deprecated row last with its badge, a phrase default as prose (`apiTable.test.ts`), and every page of all five demos carrying in its prerendered API section the HTML the app mounts**; **every page's Markdown twin its cut of the full text, lifted so that its name is the `#`, under a header naming package, version, page and both index files, linked absolutely and without the list of every page, and `llms.txt` linking the twins**; **a page's Keyboard section with the sentence naming the pages whose keys apply, each linked to that page's Keyboard anchor - a neighbour's in its own demo - and its Accessibility section after it, in the full text and on the prerendered page with the app's anchors; over all five demos, every such link and section on the prerendered page (`llmsGuard.test.ts`), and on the charts' Chart and Line pages in the app (`demo-smoke.jsdom.test.tsx`)**; **the wording tables read from an interface and two objects - a string entry, a function entry with its parameters and body, a nested entry flattened, a group from a section comment, an entry without a comment - and written as the same rows in HTML and Markdown (`wordingTable.test.ts`); against the running objects, the German column of the Language page's tables and the guard that stops core's `props` at a wording key without a row (`packages/core/tests-unit/languageTables.test.ts`)**; **the token table: the reader against a fixture stylesheet - `light-dark()` split, one value in both columns, a `var()` linked with its fallback kept, only `:root` in the tokens layer, a section comment as group and its text as the group's note, preceding and trailing comments, reduced motion marked; the charts' tokens on the chart's root class, a section of rules without a token dropped, a fallback colour counted, a fallback linked only where core has the token and a swatch drawn from the value - and every token core's and the charts' stylesheets declare, counted on their text, with its row on the Theming page, which core's `props` also stops at (`tokens.test.ts`)**; **the API index (ADR-0044) against the fixture: every export in its group - components, hooks, functions, constants, types - and alphabetical in it, a component with a page linked with the page's lede and one without shown with its comment and declaration, a hook's `@param` and `@returns` as a list and the library's types in its declaration linked, a type with a table linked to it and one without defined as a page defines it, "Used on" naming exactly the pages whose import line, examples, prose or scenarios name the export in code, a deprecated export badged, a subpath's exports grouped under its import path, a wording directory leading to its table, a hook or a function a page's text names as code linked to its entry, every export anchored on the prerendered page, and the appendix gone; over the real packages, every name of an entry with its anchor on the index where the package has one (`llmsGuard.test.ts`)** | vitest | packages/demo/tests-unit/llms.test.ts, llmsGuard.test.ts, apiTable.test.ts, install.test.ts, wordingTable.test.ts, tokens.test.ts | green; the guard was red over all five packages until the text carried the declarations of the exports no page names |
| The site a search engine reads (ADR-0037): a page's address as a path and back, an old hash forwarded, a text's `#/page/example` made an address, **a moved page id (`MOVED` in the outline) read as its current page with its example, and one that shadows a page or points nowhere refused by name**; **a `keysOf` entry naming no page of the demo with a keyboard table, or a neighbour's page not written as `{ name, page }`, refused with the outline's file and the entry**; each prerendered page cut from the full text with its title formula, plain description, `h1`, anchors on its examples, every page linked, markup escaped; **a forwarder at each moved id's old address (canonical to the current one, `noindex`, the anchor carried, a plain link)**; and over the built site, every sitemap address a file with title, description, canonical and `h1`, every forwarder outside the sitemap pointing into it, and no other file the sitemap misses; **every page with its Markdown twin beginning with its name, its head announcing that twin once, and every link of every `llms.txt` leading to a file of the site** (`twinFaults`); ****every name a package's entries export with an element carrying its anchor on its API index (`apiIndexFaults`)**; the front page with one h1 "umriss-ui", its promise, the install command and the theme script, both buttons and every claim leading into the sitemap (or `llms.txt`), fewer than 20 addresses linked outside "Every page" and every sitemap address inside it** (`frontFaults`) | vitest; a guard in the build | packages/demo/tests-unit/examples.test.ts, llms.test.ts, site.test.ts; `scripts/build-pages.mjs` runs `siteFaults`, `twinFaults`, `frontFaults`, `apiIndexFaults` and **`searchFaults` - every entry of the merged `search.json` on a sitemap page and an anchor it carries, the whole under 500 kB** (fail the build) | green |
| Unit tests of @umriss-ui/schedule: findings (overlap per lane with lead-in and lead-out, offset depth, violated dependency by its anchors), ripple (push by what is missing, down a chain, never earlier, the intent's own subtask untouched, a cycle ends), the time axis (fine step from the quarter hour to the day, local ticks and days across the clock change, the working calendar, zoom around a point, pan), snapping on local time **with a shift offset, the whole-task shift, the auto-pan speed and the place intent's helpers**, **the keyboard's walk as a pure module (`walk.test.ts`), and through the scene: the active subtask as the hover, pointer handover, the view following, the brackets and `t` along a dependency, Alt proposing exactly the intents a drag of one step reports (`keys.test.ts`)**, **the canvas palette under forced colours - the selection colour the active subtask's alone (`palette.test.ts`)**, **the selection's grey - towards the colour's own lightness, the selected subtask whole, its siblings halfway, the rest grey, a task selected by its dependency whole, two steps under forced colours (`selectionGrey.test.ts`)**, **the view - by content, what it leaves out, unknown groups, one report per change and per frame, the setters, stable parts, two schedules in step, a late echo (`view.test.ts`, `scheduleView.test.tsx`, `useSchedule.test.tsx`)** | vitest | packages/schedule/tests-unit/ | green |
| jsdom smoke test of the schedule demo (every page, every example, the package by name in the source), **the plot's role, readout and summary in English and German (`readout.test.tsx`)**, and the package's guards - style rules, focus, wording | vitest | packages/schedule/tests-unit/ | green; one named exception: the `ripple` page has no props table |
| Unit tests of @umriss-ui/calculation: reading the declaration (the OEE case, `.map` and fragments, one test per development error asserting its message), **reading a chain (the costing sheet, a Minus on a reference, `.map` of lines, a chain in a tree and a tree in a chain, one test per chain rule), the signed sum and interims in evaluation, the statement look (operands before their result, a chain standing open with its interims beneath their lines, a chain as an operand folding and opening whole, no disclosure column where nothing folds, the formula beneath a folded label, the count above four operands, the operator in the sentence)**, evaluation (each operator in operand order, absence through two levels with the given at its root, division by zero, the approximation mark set and not set, assessment and the worst verdict), the rendered lines (formulas, references, initial folding, folding by click and keyboard, the worst-verdict marker, an absent given through to the result), the accessible sentence in English and German, hover and focus coupling; **metrics (ADR-0038): one test per development error asserting its message, each metric evaluated on its own - the lead case, an absence kept in its metric, a chain with Minus, the approximation mark in one metric only - and the view: the head, units only where a result closes, the short badge, the sentence in English and German** | vitest | packages/calculation/tests-unit/ | green |
| jsdom smoke test of the calculation demo and the package's guards - style rules, focus, wording | vitest | packages/calculation/tests-unit/ | green |
| A derivation of the calculation opens beneath the line that was clicked, and that line does not move; a chain in view stands open with one disclosure only for the tree in its lines; **with metrics, two metrics stay on one line on a phone while three go to two, and no frame is wider than its place at 1280, 390 or 320 px** | Playwright | packages/calculation/tests-visual/features-calculation.spec.ts | green; the one promise of the statement look a picture cannot hold - beside it, three pictures of OEE outside the loop - derivations open, a row hovered inside them, and a phone's width - since every tree starts folded and nothing else would show a band that stops short or a layout that breaks when narrow |
| Unit tests of core (number, options, grid, scale, time, range, value contract, popover geometry and motion origin, textarea measurement, token contrast, row window, formats characterisation, tree model, limit, limit conformance, freshness, the command palette's searcher, **the dock's resting places**) | vitest | packages/core/tests-unit/ | green |
| Unit tests of @umriss-ui/table: the model (table model, CSV, selection, companion, alarm model – taken over with their tests from @umriss-ui/core, the original left with umriss-table 14), value rules, absent values in the model, **pinned columns (the order they stand in, the declaration, the user's choice and what of it the view carries, where a cell sticks)**, **the grid's walk as a pure module (the lines and their cells, grouped and pinned; the step per key; the next cell that edits; where the Active cell stands after a sort, a filter, a hidden or pinned column)**, **server mode in the model (the rows passed through as they came, the pages from the server's total, a requested page kept while no total is known - `serverModel.test.ts`)** | vitest | packages/table/tests-unit/ | green |
| Component tests of @umriss-ui/table: registration and order, hiding and reordering across head, body and foot, defaults per value type under a provider with foreign formats, the toolbar with the column filters' conditions (including the ones a table sets up for itself), column menu, pre-filter, list, range and custom filter, export, paging, row detail and actions, widths, virtualisation, initial state from a view, verdict column, alarm list with its density and what is hidden, toolbar and list filter from the provider's wording and formats, **pinned blocks in head, body, foot and export, in grouped and in virtual lines**, **grid mode (one tab stop, every key, a cell's controls behind Enter and Escape, Space selecting the Active cell's row, the Active cell across a sort, a hidden column, a grouping and a virtual window) and editing in place (the edit lifecycle: Enter, F2 and typing, Enter, Escape and Tab, a draft that does not validate, `aria-readonly` on every cell that does not edit, an editor of one's own - `gridMode.test.tsx`, `cellEditing.test.tsx`)**, **server mode against a fake server with latency (the request reported through `onRequest` once when the table stands and once per change, under Strict Mode too, with exactly its five parts and not for a width, an order, a pin, a fold or a hidden column; the rows unsorted by the table; paging by the server's count; placeholders over the previous page; a list filter's values from the application; keys kept across pages and a bulk action's rows; no footer and no grouping; the page exported; the Active cell on the next page - `serverMode.test.tsx`)**, **row filters (by the whole row and with AND to a column's condition; ratio, Reset, page one, the view and `initialView`; a chip only with `describe`; a toolbar of the table's own for a table with only row filters; known by id; reported in server mode and not applied - `rowFilters.test.tsx`), a pre-filter over rows new on every render (`preFilter.test.tsx`) and the toolbar's one size reaching search, column menu, export and Reset (`toolbarSize.test.tsx`)** | vitest + Testing Library | packages/table/tests-unit/ | green; what jsdom cannot see is checked by the package's demo in the browser |
| Type tests of @umriss-ui/table: what must compile and what must not (`@ts-expect-error`) | tsc (`pnpm typecheck`) | packages/table/tests-unit/types.test-d.tsx | green; an expected error that fails to appear makes the type check fail |
| Stylesheet guard: no `--u-` variable in a module, no copied hover edge; and the **vocabulary check** across the stylesheets of core, table, schedule, calculation and charts - no colour, font size, line height, duration, timing curve, radius or shadow with depth written by hand, and no reference to a token that does not exist; spacing, paddings, widths and heights are deliberately not read (`stylesheets.test.ts`, reads the modules as text) | vitest | packages/core/tests-unit/ | green; the exceptions stand in the test, each with a reason |
| Glyph check: every inline `<svg>` of a component keeps one stroke width (1.4) at one nominal size (the longer `viewBox` side 10), `currentColor`, no fill, `aria-hidden` (reads the sources as text; rules in `scripts/glyphs.ts`) | vitest | `packages/{core,table,schedule,calculation,demo}/tests-unit/glyphs.test.ts` | green; four named drawings that are not glyphs, each with a reason, and the shell's code-block chevron, not read yet until a ticket may renew the example screenshots |
| No verdict colour without its word or glyph (ISA-101): a register of every stylesheet of core, table, schedule, calculation and charts that reaches for a danger, warning or success token, each with what says the same without the colour; a new one fails until it is written down, a stale entry fails as out of date | vitest | packages/core/tests-unit/verdictColour.test.ts | green; per stylesheet, not per rule, and blind to the caller's content - both limits stand in the test and in `design-language.md` |
| Style rules (ADR-0021): every shipped stylesheet begins with the layer order, keeps every rule inside `umriss.tokens`, `umriss.base` or `umriss.components`, and selects only its own elements; the build steps `ownBox`/`ownCorners` and the dist check | vitest, node | `packages/core/tests-unit/stylesheetRules.test.ts`, the guards of core, table and charts, `scripts/check-dist.ts` (`prepublishOnly`) | green |
| Focus guard (ADR-0021): every element a component puts into the tab order - native controls, a `tabIndex` other than a literal `-1`, arrow-key focus via `data-nav` - has a focus style of its own in its stylesheets; read from the source, so closed panels are covered | vitest | `packages/{core,table}/tests-unit/focusGuard.test.ts`, reading `scripts/styles/focus.ts` | green; the elements the reading cannot see stand in the guard with their reason |
| Pass-through guard (principle 1 of core's README): every exported component, read from the package's exports, takes a ref, a class, a style and a data attribute at the element the principle names, and is a `forwardRef` (React 19 passes a ref through `...rest` by accident, React 18 does not); beside it what `rest` may not override (`passthrough.test.tsx`) | vitest | packages/core/tests-unit/ | green; the wrappers without an element of their own and the native fields that put the class on their wrapper stand in the test with their reason |
| Wording guard: no German text in a component's JSX node or prop, bypassing the wording (`wordingSource.test.ts`, reads the sources through the TypeScript parser) | vitest | packages/core/tests-unit/ | green; the exception list is empty |
| Behaviour tests of ContextMenu (opening at a point, keyboard cycle, focus return, portal; its real position and its flip at a window edge stand in the browser suite), Popover, Tooltip, Modal, Toast (role follows tone), the four date pickers (now, reopening, Enter, presets), month pair, RadioGroup, Tag, SplitButton, Alert, the language seam, the root provider with `useDensityFor`, the tree (keyboard, screen reader, ticking, search, virtualisation), Stat, command palette, **Dock**, **what the combobox, the multi-select and the palette announce through the shared live region, and the announcer itself (`listboxAnnouncements.test.tsx`, `announce.test.ts`)**, and the six foundations - **Switch, Slider (the keys of the slider pattern), Drawer, ProgressBar, Accordion, Breadcrumb (its fold as arithmetic over measured widths, then through the menu)**, and the layout tier after them - **Splitter (the window splitter's keys, Enter collapsing and restoring, a drag against a box handed in), Stepper (the states as words and `aria-current`), FileInput (the choice, a drop through `accept` and `multiple`, removal, controlled; `accept` itself as the standard's rule, `FileInput/accept.ts`)** | vitest + Testing Library | packages/core/tests-unit/ | green |
| Screenshot comparisons (page heads and examples × light/dark) | Playwright | packages/*/tests-visual/screenshots.spec.ts (core, charts, table, schedule, calculation) | baselines checked in (darwin); green for core, table and schedule, **and not reproducible for the charts' examples – see Known open**; one image per example with the code **collapsed**, one per page from the head to the first example; plus two images outside the loop, the command palette's open window searching and in its populated resting state – the topmost layer is in no example – and the **dock's four resting places**, because the loop only photographs the one it starts at, **and the drawer standing open at either edge**, since its examples are photographed closed |
| The charts under forced colours, emulated (`page.emulateMedia({ forcedColors: "active" })` - the `forcedColors` context option does not exist in this Playwright): a chart without `encoding` draws its legend by marks in `CanvasText` and no palette colour on its canvas; five examples photographed in both projects, the loading silhouette among them | Playwright | packages/charts/tests-visual/forced-colors.spec.ts | green |
| The library under forced colours, emulated the same way (forced-colors), one suite in the shell (`@umriss-ui/demo/checks/forcedColors.ts`) that each spec calls: every page's first example photographed (`firstExamples`), and the states no first example rests in - a focused button, a combobox's cursor, a chosen range, selected rows and a whole group selected, pinned blocks scrolled, bands, a focused virtual row, the schedule's active subtask, the calculation's hover coupling; the ring's outline measured on three kinds of ring; axe over each demo's sample with `color-contrast` off (`FORCED_BY_THE_SYSTEM`: the pairs are the system's, and axe reads `-webkit-text-fill-color`, which Chromium resolves against the unforced colour) | Playwright | packages/{core,table,schedule,calculation}/tests-visual/forced-colors.spec.ts | green |
| The ring and the edge keep an outline for forced colours: every focus rule that draws the ring token carries `outline: 2px solid transparent`, every resting rule that draws an edge or a depth `outline: 1px solid transparent` - the interaction-state canon's checks `outline` and `edge` | vitest | packages/core/tests-unit/stylesheets.test.ts | green |
| Interaction tests of the charts (**with Tab and the keys, the pointer taking the Active point over, a synced chart following the keys**) | Playwright | packages/charts/tests-visual/features-interaction.spec.ts | green |
| Nothing the schedule draws in the DOM is in its own way: every overlay inside its clipping box, no two labels of a kind over each other | Playwright | `packages/demo/checks/overlays.ts`, called by `packages/schedule/tests-visual/overlays.spec.ts` with every page - and by the editing suite in the middle of a drag, which is the one moment a static page cannot reach | green; it was written against a real defect (the ghost's label clipped in the topmost lane) and shown to fail on it |
| The rows of a schedule's plot: a flat plan laid out exactly as the arithmetic it replaces, a tree of lane groups, a fold, a fold inside a fold, a strip's floor of three pixels, and `laneAt` as the inverse of `laneTop` over forty trees drawn at random | Vitest | packages/schedule/tests-unit/rows.test.ts | green; written **before** `src/rows.ts`, because every y in the package comes from it |
| What a drawing actually put where: counted pixels of a rectangle of a plot's canvas, counted inside the browser | Playwright | `packages/schedule/tests-visual/pixels.ts`, used by `features-schedule.spec.ts` and `features-editing.spec.ts` | green; it is what lets "hollow", "capped at its ends", "faded at the left", "a rail that stops at the main time" and "a strip inside a folded group" be tests rather than snapshots that only say something changed |
| Every example runs as it is copied: it imports the package's `src` and bare npm specifiers, and whatever else it needs it SHOWS beside itself | Playwright (file system) | `packages/demo/checks/ownData.ts`, called by `packages/*/tests-visual/own-data.spec.ts` | green in all five demos; run before the repair it named all 25 offenders, in the two demos that had them |
| Behaviour of the schedule: its name and lane headers as text, the day band and the fine band's step under zoom, pan in both directions with headers and bands holding still, hover, click and right-click with their target, task-wide selection with its subtask, **the wheel scrolling the lanes and releasing the page, Ctrl-wheel and a pinch zooming, the tooltip's content and an application's own, the now line, two schedules kept in step and the point-to-time handle** | Playwright | packages/schedule/tests-visual/features-schedule.spec.ts | green; the pinch is driven through the protocol - Playwright has no multi-touch API, and Chromium turns the touches into pointer events |
| The schedule by keyboard: Tab into the plot and its ring, the arrows, the brackets and `t`, the readout, the pointer taking the active subtask over, Space selecting; one picture per theme of a focused schedule with an active subtask | Playwright | packages/schedule/tests-visual/features-keyboard.spec.ts | green |
| Editing through the seam (ADR-0023): the ghost's times and findings before the drop, the reported move and lane intents after it, Escape, a read-only schedule that pans instead, lead-in grips on selection, stretch, the scenario's context menu changing the plan through an intent, **auto-pan at the edge of a drag, the shift raster, the whole-order shift, a drag into a removed night stopping at the seam, and work dragged in from a list with its place intent** | Playwright | packages/schedule/tests-visual/features-editing.spec.ts | green; asserts what is reported and what the DOM says, never pixels. The drag from outside is the platform's own, driven by the mouse, and the ghost is observable while it is in flight |
| Operating the demo shell (outline, jumps, palette, addresses - paths, an old hash forwarded to one, and a moved page's old path forwarded to its current one, with an example, where a demo has a moved page; **the sidebar's last entry the API index in every demo, alone in its rubric, opening the page with an export's anchor on it - a subpath's in core and the charts (ADR-0044)**; "On this page" - a column from 1300 px, a disclosure narrower, the current entry marked, a section anchor a plain scroll; the one theme - the switch stores `umriss-ui:theme`, a reload is dark before the app runs, with nothing stored the system decides live, with storage throwing the switch still switches; **the head following the page - on the first load and after a move the title by the formula and exactly one alternate link to the page's Markdown twin, which the server serves**; **a fold never hides a target - the address of a row in a long props table's folded group opens the group and shows the row, on a full load and after a jump without one, and the fold opens with Enter and passes axe, in core, table and schedule**; **on the built site (`site/`, handed to the browser by route at the site's address, skipped where `pnpm build:pages` has not run), the palette finds another package's page - Select from the table, a table example at its anchor from core - and opens it by a full navigation, the own package's finds stand once, and with the site's index blocked the own package is still searched without a word (.scratch/one-search 03)**) | Playwright | packages/*/tests-visual/features-shell.spec.ts | green; **one** suite at the shell (`packages/demo/checks/shell.ts`), which calls each of the five demos with its own pages and terms – with axe and the palette's rules that jsdom cannot express (a resting pointer, the resting state, the material). Charts had a shell and a suite of its own until ADR-0020; beside the shared call there stands the one promise that is charts' own – the benchmark does not run on the front door |
| Own base (ADR-0021): every example's text in a type of its own, every element with a library class in `border-box`, every element that takes the keyboard focus showing the library's ring (the browser's own ring does not count) | Playwright | `packages/demo/checks/ownBase.ts`, called by `packages/*/tests-visual/own-base.spec.ts` with every page; light only | green; the tolerated offenders stand in the spec files with their reason |
| No silent page (a11y-and-finish): a page whose example stages - and its configurator's, where it opens with one - hold anything Tab reaches carries a Keyboard section (its own table or `keysOf`), one whose stages hold a live region (`aria-live`, or a role of status, alert, log, timer, progressbar or meter) an Accessibility section - read off the page by the sections' anchors | Playwright | `packages/demo/checks/silentPages.ts`, called by `packages/{core,charts,calculation}/tests-visual/silent-pages.spec.ts` with every page; light only | green; one exception in the check with its reason (the chart's and the schedule's readout, described on the Chart and the First schedule page every chart page links); shown to fail by every chart and calculation page before they were filled, and by core's Stepper, whose deployment shows a progress bar |
| Interaction tests of core, the context menu's position and its flip included, **and what jsdom cannot show of the foundations: Space on the switch, the slider's keys and its ring on the thumb, the drawer's focus trap, focus return and reduced motion, a breadcrumb folding at a real width**, **and of the layout tier: a splitter's panes at real sizes under the keys and the pointer, the file input's dialog on Space and Enter and a drop written back into the input**, **a card keeping its height while the button in its head refreshes it** | Playwright | packages/core/tests-visual/features-basics.spec.ts | green |
| Sizes (ADR-0041), what jsdom cannot measure: a field fills the place that gives it a width; in a row a multiselect holds still while values are chosen and removed, a select is not its longest option, a search field does not grow by its cross, and a message under a field moves nothing; `chars` fixes a field without cutting its value, and a date picker shows its whole date; at 320 px no field is wider than its place, the page does not scroll sideways and a value too long ends in an ellipsis; one size for a place reaches every control and stops at a dialog | Playwright | packages/core/tests-visual/features-sizes.spec.ts | green; the mechanism - containment on a block root - was measured alike in Chromium, Firefox and WebKit before it was chosen, and the suite runs in Chromium as every suite does |
| Control size (ADR-0041): own `size` over a `ControlSizeProvider` over `md`, for each of the sixteen controls with two heights; a popover's and a modal's content start without the provider; `chars` as an inline style - rounded, at least one, nothing for what is no count, a natural count of a picker's own, a number's affixes (`extent.ts`); the table's toolbar reaching a control of one's own | vitest + Testing Library | packages/core/tests-unit/controlSize.test.tsx, extent.test.ts; packages/table/tests-unit/toolbarSize.test.tsx | green |
| Operating a page (code switch, page switch, copy button, **"Copy page" in the page head: the twin the server serves on the clipboard and in the status region, after a move the new page's, the menu under the keys of core's Menu, "View as Markdown" opening the twin and "Open in Claude" and "Open in ChatGPT" the encoded prompt, the button inside the rubric line at 390 px**), and the install command on the page that installs; **the Button's configurator: a choice changing the button and its code, Reset, the code on the clipboard, every control by Tab and its keys, the panel beside the stage from 900 px, the former first example titled at its anchor; the IconButton's glyph in its code and import, the Meter's value stepping by a hundredth**; **a row's "Shown in" link landing on its example in view, and a row's name putting `#<Type>-<prop>` into the address; a feature page's "Props on this page" named in "On this page", and its row's name landing on the full row on the table's page** | Playwright | packages/*/tests-visual/features-page.spec.ts → `packages/demo/checks/page.ts` | green; the copy test checks what really lies on the clipboard – none of which can be expressed in jsdom. `checkInstall` runs in all five demos, `checkPage` in core, table and schedule |
| Pinned columns scrolled: into the middle (both shadows), to the end (only the start block's), grouped (a group header's label and aggregates in their blocks), and the column menu with its pin keys | Playwright | packages/table/tests-visual/pinning.spec.ts, light and dark through the projects | green; the resting picture is the example's own in `screenshots.spec.ts` |
| Grid mode in the browser: one tab stop and the Active cell's ring, the keys, a checkbox reached and left, typing into a comment the example applies, a setpoint held open by its message - **the editor over its cell, the message in a popover beneath it, the table not moving** - Tab to the next editor, a picked day committing, the keys walking a virtual window, **the Active cell kept clear of the sticky head and the pinned block by the scroll area's padding** | Playwright | packages/table/tests-visual/features-grid.spec.ts | green; the resting pictures are the examples' own |
| Server mode in the browser, against the example's fake server with its 400 ms: placeholders over the previous page at its height, the next page, a list filter offering the server's values, "select all" on the page with a key from another page kept | Playwright | packages/table/tests-visual/features-server.spec.ts | green; the resting picture is the example's own, a settled page - the first page comes with the document |
| Interaction tests of the table: conditions in the toolbar, multi-sort, row detail, row actions, widths, width in the view, sorting, search with a footer, selection across all pages, paging, bulk action; virtualisation | Playwright | packages/table/tests-visual/features-table.spec.ts, features-virtual.spec.ts | green; the counterparts of the suites that ran in core until umriss-table 14, promise for promise |
| The table's position stays put while one searches, filters and resets (table-filters D1) | Playwright | packages/table/tests-visual/features-table.spec.ts (`@both-themes`) | green; measures the table's head in both themes – a toolbar that grows a line taller moves it in only one |
| What jsdom cannot prove about the table: a sticky row header behind selection and expanders, a silent gesture as a computed colour, focus in the column menu, the download and its content, reordering moves head, body and foot, **both pinned blocks staying put while the rest scrolls, their shadow only over content, a column pinned from the column menu with the focus kept on its key** | Playwright | packages/table/tests-visual/features-browser.spec.ts | green; on its first run the first test found control cells growing wider than their sticky offsets |
| Interaction tests of the tree | Playwright | packages/core/tests-visual/features-tree.spec.ts | green |
| Interaction tests of the dock | Playwright | packages/core/tests-visual/features-dock.spec.ts | green; drag, refusal, change and reduced motion – none of it observable in jsdom |
| The plant world's kiln line: a seed is a shift, and over forty seeds the one limit crossing is the alarm raised at that minute, the alarm verdict of `assess`, one alarm resolved after the dead band, and the scrap in the OEE's count | vitest | packages/core/tests-unit/plant.test.ts | green |
| The kiln line scenario's clock and regions: still under a frozen clock, a minute per second once it moves, stopped by Pause and under reduced motion; a landmark per region, and a skip link that moves the focus and leaves the address | Playwright | packages/core/tests-visual/features-control-room.spec.ts | green |
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
| `table/model/tableModel.ts` | filter → sort → group → page, column order and visibility; in server mode none of it but the page count; with tree rows the sort per level, the path rule and the sets footer and export read |
| `table/model/grouping.ts` | row groups, aggregates, the order of groups, date periods, the lines of a page and of a window |
| `table/model/pinning.ts` | pinned columns: the order, the declaration, the choice, the view, where a cell sticks |
| `table/model/gridWalk.ts` | grid mode: the lines and their cells, the step per key, the next cell that edits, where the Active cell stands |
| `table/motion.ts` | `deltas`: how far each line that stays has moved |
| `table/model/csv.ts` | the filtered set as delimiter-separated text |
| `lib/virtual.ts` | a row's visible window and scroll target |
| `Dock/place.ts` | the zone under the pointer, the strip's length, the space required, arrow → resting place |
| `lib/language/formats.ts` | date, time, number, percentage, collation, relative duration |
| `lib/limit.ts` | limit, target value, assessment – four outcomes |
| `lib/freshness.ts` | reading → fresh \| stale \| disconnected, and the cadence for it |
| `table/alarms/alarmModel.ts` | lifecycle, availability and its four transitions, order, frequency, flood, return band |
| `table/values.ts` | absent, the kind of a value, text without children, sort and export value |
| `lib/language/wording.ts` | every text the library emits |
| `Textarea/measure.ts` | the character counter and height clamping |
| `FileInput/accept.ts` | the `accept` attribute as the HTML standard reads it: an extension, a MIME type, a type's family |
| `styles/tokens.css` (checked, not executed) | contrast of the token pairs, both themes |
| `charts/limit.ts` | the same rule, a second house (ADR-0006) |
| `charts/state.ts` | the segment boundary and the segment under the pointer |
| `charts/cells.ts` | the cell edge in two dimensions, a hit inside the cell |
| `charts/controlLimits.ts` | control limits, zones, four rule violations |
| `charts/pareto.ts` | sort, accumulate, collect the remainder, cutoff |
| `charts/workingTime.ts` | wall clock ↔ working time, breaks, ticks, clamped position |
| `charts/downsample.ts` | first, min, max and last per pixel column, gaps kept, the window of a zoomed course |
| `charts/marks.ts` | a palette place → its dash, marker and hatch; a hatch's lines on a grid of the plane; a marker as one closed sub-path |
| `charts/stack.ts` | a stack's edges per member, matched by x: gaps as zero, negatives downward apart, the total, shares that top at exactly 100 |
| `charts/table.ts` | the data table's rows: the visible domain, series merged on x, above 500 rows the downsampled course and the count it stands for |
| `charts/time.ts` | the time step, ticks on local boundaries across the clock change, labels by level |
| `charts/hit.ts` (`nearestIndex`, `nearestPoint`, `lowerBound`) | the nearest x, the nearest point in pixel space, the first index not below a value |
| `schedule/findings.ts` | overlaps per lane, offset depth, violated dependencies |
| `schedule/ripple.ts` | the cascade over successors, as moves |
| `schedule/walk.ts` | the keyboard's walk: rows of work in time order, a folded group as one row, the step per key, following a dependency |
| `schedule/timeAxis.ts` | fine step, local ticks and days through the calendar, zoom and pan |
| `schedule/snap.ts` | a time onto a raster in local time, with a shift offset |
| `schedule/shiftTask.ts` | a whole task moved, as move intents |
| `schedule/autoPan.ts` | how fast the plot pans at the edge of a drag |
| `schedule/appearance.ts` | what a bar says besides its colour, and which of two contradicting words wins |
| `schedule/geometry.ts` (`barLabelBox`, `dependencyPath`) | where a bar's label lies and when there is none; the route and the anchor of a dependency |
| `schedule/geometry.ts` (checked in the browser) | subtask boxes on whole pixels, dependency curves, the hit |

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
* **The core demo's scenarios import every package.** They reach charts,
  table, schedule and calculation by alias to their sources, in the demo build,
  the unit tests and the typecheck alike, and not by a devDependency - that would
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
* Interaction tests run only in the light project – they are behaviour tests, not
  appearance tests.
* Demo data is seed-based and deterministic (R-6.2); the interaction tests check
  concrete values at known positions.
* Unit tests build their own fixtures, never the demo data – otherwise the suite
  breaks on a changed demo line. The two exceptions are the worlds themselves,
  where the demo data is the subject: `plant.test.ts` (what the kiln line holds
  is a property over forty seeds, not a line of the demo) and `worlds.test.ts`
  in `packages/demo` (every world deterministic, import-free, its ids unique).
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
  `side: "top"`) and, since library-audit 01, its portal rule as well – the same
  function `portalTargetFor` (dialog, then the setting, then the body), so that a
  tooltip inside a modal no longer sits behind the dialog. It does not take the
  element: it has neither focus nor dismissal, its entrance is a different one,
  and on scrolling it disappears instead of travelling along. The remaining
  difference is therefore only behaviour, not a layer.
* jsdom is pinned to ^26: jsdom 30 pulls a pure ESM package in through
  `require()`, which does not load on Node 22.11 and prevented every vitest run.
