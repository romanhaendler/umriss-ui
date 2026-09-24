# umriss – factual inventory for a library comparison

All sources are files in the repo `/Users/romanhaendler/cc/kontur` (paths relative to it). State: 2026-09-24, commit `693be78`.

## 1. Exported components and hooks per package

### Takeaway
There are five published packages, each with zero runtime `dependencies` (only React ≥18 as a peer, plus umriss peers). `core` is a mid-sized general component set of about 35 component folders. It has no switch, slider, drawer, accordion, breadcrumb, avatar, stepper or file-upload. It does have unusual plant parts: `Stat` with limits and freshness, `Dock`, and a `CommandPalette`. Charts, table, schedule and calculation are narrow, domain-shaped packages.

### Cited findings

**Versions and package shape**
- core 0.9.2, charts 0.6.0, table 0.3.3, schedule 0.1.8, calculation 0.2.4; all under npm tag `latest`; `@umriss-ui/demo` is private — [README.md](README.md)
- Peers: core and charts need only `react`/`react-dom >=18`. The table needs core as well, the schedule core and charts, the calculation core. No package has any `dependencies` entry. Subpath exports: core and charts have `.`, `./wording/de` and `./styles.css`; the others have `.` and `./styles.css` — `packages/*/package.json`
- charts "depends on nothing but React, and it will keep doing so (R-1.2)", enforced by a lint rule — [packages/charts/README.md](packages/charts/README.md)
- MIT licence — [README.md](README.md)

**@umriss-ui/core** — [packages/core/src/index.ts](packages/core/src/index.ts), [packages/core/README.md](packages/core/README.md)
- *Forms:* `Button` (primary/secondary/ghost/danger, loading), `ButtonGroup`/`SplitButton`, `Input` (`numeric` in Geist Mono, `clearable`), `Select`, `Checkbox` (indeterminate), `RadioGroup`, `Textarea` (`autoGrow`, `maxRows`, `showCount`), `NumberInput` (locale notation, decimals, min/max, Shift×10, prefix/suffix), `Combobox` (searchable, `aria-activedescendant`), `MultiSelect` (one-line chips with "+N" overflow, search, all/none/invert, "selected (N)" view), `FormField`/`FormFieldBoundary` (auto `id`/`aria-*`).
- *Date/time:* `DatePicker`, `DateTimePicker`, `DateRangePicker`, `DateTimeRangePicker`. They handle the DST switch explicitly: a missing hour is corrected forward with a note, and for a doubled hour the user picks one occurrence with its UTC offset. Range pickers have presets and a two-month view.
- *Overlays:* `Modal` (+Header/Body/Footer, on native `<dialog>`, golden-ratio vertical placement), `ConfirmDialog`, `Popover` (the shared anchored primitive: portal, flip and clamp), `Menu`/`MenuItem`/`MenuSeparator`, `ContextMenu`, `Tooltip`, `ToastProvider`/`useToast`, `CommandPalette`/`useCommandPaletteShortcut` (subsequence search, Ctrl/⌘+K and `/`).
- *Navigation/structure:* `Tabs`/`TabList`/`Tab`/`TabPanel`, `TreeView`/`TreeSearch`/`useTree` (one active node plus separate cascading check state, type-ahead, range select, virtualised), `Card`/`CardHeader`/`CardBody` (collapsible), `Stack`/`Grid` (4 px spacing step), `Divider`, `Dock` (a tool strip that snaps to 4 edge positions of a host surface, moved by grip or arrow keys).
- *Typography/utility:* `Text`, `Heading`, `Link`, `VisuallyHidden` (skip-link mode). The glyph set is `CrossGlyph`, `PlusGlyph`, `MinusGlyph`, `AngleGlyph`, `CalendarGlyph`, `ClockGlyph`, `GripGlyph`, `GridGlyph` and `MeasureGlyph`.
- *Feedback:* `Alert` (5 tones, role follows tone), `Badge`, `Tag`/`TagGroup`, `Skeleton` (shimmer), `Spinner`, `EmptyState`.
- *Data display / industrial:* `Stat` (value read against limits: verdict word and colour, deviation from target, history, freshness), `Sparkline`, `Meter`. Pure logic: `assess`/`verdictWeight` and the types `Limit`/`LimitSet`/`Verdict` (`ok|unknown|warning|alarm`); `freshness`/`age`/`cadence` (`fresh|stale|lost`), `useFreshness`. Also `virtual`/`useVirtual` (the window arithmetic) — `packages/core/src/lib/limit.ts`, `packages/core/src/lib/freshness.ts`, `packages/core/src/components/DataViz/index.ts`
- *Configuration:* `UmrissProvider` (density, portal target, toasts, language; optional; "holds no theme"), `LanguageProvider`, `useFormats`, `useWording`.
- The README's own principle list names components that do **not yet** pass `forwardRef`/`className`/`...rest`: Badge, Card, Combobox, CommandPalette, EmptyState, FormField, Modal, MultiSelect, Skeleton, Spinner, Stat, Tabs, TreeView, TreeSearch, ConfirmDialog, Sparkline, Meter and the four pickers. Tabs is controlled-only and Card uncontrolled-only — [packages/core/README.md](packages/core/README.md) "Principles". The tracking ticket is `Status: wontfix` — [.scratch/library-audit/issues/09-the-renames.md](.scratch/library-audit/issues/09-the-renames.md)
- Absent from `packages/core/src/components/`: no Switch/Toggle, Slider, Drawer/Sheet, Accordion, Breadcrumb, Avatar, Stepper, Pagination (the table has its own), File upload, Progress bar (only `Meter`) — directory listing of `packages/core/src/components/`

**@umriss-ui/charts** (canvas) — [packages/charts/src/index.ts](packages/charts/src/index.ts), [packages/charts/README.md](packages/charts/README.md)
- Components: `Chart`, `Line`, `Area`, `Bar`, `Scatter`, `StateBand`, `Matrix` (heatmap), `LimitLine`, `LimitBand`, `ControlChart`, `XAxis`, `YAxis`, `Legend`, `Tooltip`; `LinearScale`, `invalidateTheme`.
- Pure modules exported: `assess`, `controlLimits`, `zones`, `violations`, the Nelson-style rules (`ruleOutlier`, `ruleRun`, `ruleTrend`, `ruleTwoOfThree`), `pareto`, `operatingCalendar`/`toOperatingTime`/`toWallClock`/`breaks`/`operatingTicks`, `resolveColours`, `subscribeTheme`, `DEFAULT_CHARTS_WORDING`.
- Series are JSX children, not a config object; JSX order decides the drawing order and the palette slot — [packages/charts/README.md](packages/charts/README.md)

**@umriss-ui/table** — [packages/table/src/index.ts](packages/table/src/index.ts), [packages/table/README.md](packages/table/README.md)
- `useTable(rows, options)` returns a row-typed `Table` and `Column` (no unbound `Column`; ADR-0017). Also `column`, `columnFilter`, `ColumnMenu`, `Export`, `Pagination`, `Search`, `Toolbar` (each usable outside the table via `of`), `useTableSelection`, `VerdictColumn`, `AlarmList`, `alarmModel` and helpers (`acknowledge`, `detectFlood`, `frequencyByType`, `nextLifecycleState`, `priorityRank` …) — `packages/table/src/alarms/index.ts`
- Features: filter (the values that occur, a range, or custom), multi-sort, grouping up to 3 levels, aggregates (`sum`, `avg`, `min`, `max`, `range`, `count`, `distinct`, or custom), paging, selection across pages, row detail, row actions, bulk actions, column widths, column reorder/hide, sticky row header, CSV export, view state as an object (`initialView` / `t.view`), virtualisation, "Twenty thousand rows" — [packages/table/README.md](packages/table/README.md), [docs/testing.md](docs/testing.md)
- Not found by search in `packages/table/src`: cell editing, tree data/sub-rows, server-side mode, column pinning beyond the one sticky row-header column (grep for `editable|treeData|subRows|serverSide|manualPagination` returned nothing).

**@umriss-ui/schedule** — [packages/schedule/src/index.ts](packages/schedule/src/index.ts), [packages/schedule/README.md](packages/schedule/README.md)
- `Schedule`, `Lane`, `LaneGroup`, `Subtasks`, `Transports`; the pure functions `applyIntent`, `findings`, `overlaps`, `lateTransports`, `ripple`, `shiftTask`, `snapTime`, `subtaskFromPlace`, `resolveAppearance`; a ref handle `ScheduleHandle` (client point ↔ time/lane).

**@umriss-ui/calculation** — [packages/calculation/src/index.ts](packages/calculation/src/index.ts), [packages/calculation/README.md](packages/calculation/README.md)
- `Calculation`; tree operators `Given`, `Sum`, `Difference`, `Product`, `Quotient`, `Ref`; chain form `Chain`, `Plus`, `Minus`, `Times`, `DividedBy`, `Interim`.

### Inferences
- The core component count (~35 folders) is well below MUI or Mantine. Its breadth is in forms, pickers and overlays; its layout and navigation primitives are thin.
- "Zero runtime dependencies in every package" is a clear differentiator against libraries built on Floating UI, date-fns and the like.

### Gaps
- I did not count the exact number of exported symbols per package; the `export *` re-exports would have to be resolved.

## 2. Cross-cutting capabilities

### Takeaway
The stylesheets load themselves, touch nothing but the library's own elements and sit in cascade layers, so the app always wins. Dark mode is plain CSS `color-scheme` + `light-dark()`. i18n is a typed wording object (English default, German subpath) plus a separate formats seam. Accessibility is checked by axe (WCAG 2.1 AA), by a custom own-base/focus check and by static guards. Visual regression uses about 736 checked-in screenshot baselines.

### Cited findings

**Styles, bundle, theming**
- The JS imports its own CSS (`sideEffects`). No rule targets `html`, `body` or `*`, and none sets `color-scheme`. Everything lies in the layers `umriss.tokens`, `umriss.base` and `umriss.components`, so unlayered app CSS wins regardless of load order (ADR-0021) — [README.md](README.md), [packages/core/README.md](packages/core/README.md)
- Theming is CSS custom properties `--u-*`. `packages/core/src/styles/tokens.css` has 317 lines and ~117 token declarations (`grep -c "--u-"`). Charts colours come from `--uc-*`, which fall back to core tokens or to literals — [packages/charts/README.md](packages/charts/README.md)
- Dark mode: every two-valued token is `light-dark(light, dark)` and follows the app's `color-scheme`, so next-themes, Mantine, MUI and DaisyUI switchers work with no extra line. The library holds no theme state. It is "no pure black", sunken surfaces are lighter in dark mode, and the primary button inverts. A page region can be dark on its own — [docs/design-language.md](docs/design-language.md)
- Browser floor: Chrome 123, Firefox 120, Safari 17.5 (because of `light-dark()`); older browsers show the UI unstyled — [packages/core/README.md](packages/core/README.md)
- Fonts are not loaded; Geist Sans/Mono is recommended. Numbers use mono with tabular figures everywhere — [docs/design-language.md](docs/design-language.md)
- `corner-shape` squircles are added by the build step (`scripts/styles/ownBox.ts`) as a progressive enhancement — [docs/design-language.md](docs/design-language.md)
- Built sizes (raw / gzip) in `packages/*/dist`: core.js 182 KB / 48.7 KB and core.css 143 KB / 16.5 KB; charts.js 129 KB / 36.3 KB; table.js 117 KB / 33.0 KB; schedule.js 89 KB / 25.2 KB; calculation.js 19.8 KB / 6.6 KB (measured with `gzip -c | wc -c` on the local build output)

**Motion vocabulary**
- Every motion is a named token. `--u-transition` is 120 ms on `--u-ease-out` `cubic-bezier(0.22,1,0.36,1)`. Also: press 80 ms, path 140 ms, medium 240 ms, draw 320 ms (checkbox tick), exit-fast 100 ms, exit 160 ms, exit-collapse 200 ms, spin 700 ms, shimmer 1.6 s. Under `prefers-reduced-motion` the durations drop to 0 but the state change stays; continuous spin and shimmer are excluded from that — `packages/core/src/styles/tokens.css` lines ~243–310
- Overlays open from a computed "motion origin", the edge that faces the trigger (`motionOrigin` in `position.ts`), with scale 0.96 plus opacity. Exits are faster, on `--u-ease-exit`. Native `<dialog>` open and close are choreographed — [docs/design-language.md](docs/design-language.md)

**Glyphs**
- There is one glyph set: stroke width 1.4, longer viewBox side 10, `currentColor`, no fill, `aria-hidden`. A unit test on every package's inline `<svg>` enforces it — [docs/testing.md](docs/testing.md), `packages/core/docs/glyphs.md`

**i18n**
- All identifiers, props, prose and the default wording are English (ADR-0018, which supersedes ADR-0015). German ships as `GERMAN_WORDING` via `@umriss-ui/core/wording/de`. Both objects are typed `Wording`, so a missing entry is a compile error (ADR-0019) — [packages/core/README.md](packages/core/README.md)
- The formats (dates, numbers, durations, collation) are a separate seam. The default is `en-GB` on a 24 h clock; `GERMAN_FORMATS` sits on the same subpath (ADR-0024) — [docs/adr/0024-the-formats-are-english-german-is-freight.md](docs/adr/0024-the-formats-are-english-german-is-freight.md)
- Charts carry their own `ChartsWording`, with `GERMAN_CHARTS_WORDING` at `@umriss-ui/charts/wording/de`, because charts may not depend on core (ADR-0031) — [docs/adr/0031-the-charts-carry-their-own-wording.md](docs/adr/0031-the-charts-carry-their-own-wording.md)
- A wording guard test forbids German literals in JSX bypassing the wording — [docs/testing.md](docs/testing.md)
- Only two languages ship; other languages would have to be supplied as a whole `Wording` object (inferred from the typed-object design; no third wording found).

**Accessibility**
- axe WCAG 2.1 AA runs on sample pages of all five demos. Three justified colour pairs are tolerated, listed once in `packages/demo/checks/accessibility.ts` — [docs/testing.md](docs/testing.md)
- The own-base check (Playwright): every focusable element shows the library's ring (the browser's own ring does not count), every library element is `border-box`, and example text has its own type. A static focus guard reads the sources for every tab-order element and requires a focus style — [docs/testing.md](docs/testing.md)
- Tree: the active node and the checked set are separate states (ADR-0003). The a11y tree is a flat list of `treeitem`s with level, position and set size, so it works with virtualisation (ADR-0004) — [docs/adr/0003…](docs/adr/0003-an-active-node-is-not-a-selection.md), [docs/adr/0004…](docs/adr/0004-a-flat-accessibility-tree.md)
- Charts: a chart with a `Tooltip` is one tab stop (`role="application"`, `aria-roledescription` "chart"). ←/→, Home/End and PageUp/PageDown walk the Active point; ↑/↓ switch series; `+`/`−`/`0` zoom. A polite live readout is announced 150 ms after keys rest, plus a summary (ADR-0030, charts 0.6.0) — [packages/charts/docs/capabilities.md](packages/charts/docs/capabilities.md)
- The core components use roving tabindex and arrow keys (RadioGroup, TagGroup, Tabs, MultiSelect chips) and treat "Keyboard operation and aria as definition of done" — [packages/core/README.md](packages/core/README.md)
- The schedule has **no** keyboard or screen-reader access to subtasks and findings; it was declared out of scope for "a spec of its own". The only key handler is Escape to cancel an edit — [.scratch/schedule-refinement/spec.md](.scratch/schedule-refinement/spec.md) line ~318, `packages/schedule/src/Schedule.tsx` ~l.316

**SSR**
- Charts have an SSR test: `renderToString` does not throw (R-7.4) — `packages/charts/tests-unit/ssr.test.tsx`, [packages/charts/docs/capabilities.md](packages/charts/docs/capabilities.md). The schedule uses `useSyncExternalStore` with `getServerSnapshot`. No SSR test for core or table was found (grep for `renderToString` in tests-unit found only charts).

**Testing / maturity**
- Test layers: vitest unit + jsdom, Testing Library, Playwright interaction, screenshot comparison (light and dark, darwin baselines), axe, own-base, the stylesheet "vocabulary" guard (no hand-written colours, durations, radii or shadows), the ADR-0021 style-rule guard with `scripts/check-dist.ts` on `prepublishOnly`, the glyph guard, pixel counting inside canvases for the schedule, and type tests with `@ts-expect-error` for the table — [docs/testing.md](docs/testing.md)
- Token contrast is checked as a unit test over token pairs in both themes — [docs/testing.md](docs/testing.md)
- Counts (my own measurement, approximate): unit-test files / `it|test(` calls — core 50/782, charts 35/465, table 35/370, schedule 18/135, calculation 10/59, demo 2/29, about 1,840 total. Playwright spec files: core 10, charts 7, table 12, schedule 10, calculation 6. Screenshot PNG baselines: core 244, charts 96, table 194, schedule 132, calculation 70 (736 total).
- Demo pages: core 41, charts 13, table 12, schedule 8, calculation 6. The demo is the documentation: live examples, source and props tables generated from `src/` — [docs/testing.md](docs/testing.md), [README.md](README.md)
- Every package is 0.x and "no version number promises compatibility". The CHANGELOG dates of all releases are Aug–Sep 2026; core 0.1.0 ("First publication") was Sep 2026 — [README.md](README.md), `packages/*/CHANGELOG.md`
- There are 31 ADRs, one superseded — [docs/adr/README.md](docs/adr/README.md)

### Inferences
- Layers plus a no-global-rules policy make umriss unusually safe to drop into an existing app next to MUI, Mantine or Tailwind; that is ADR-0021's stated goal.
- Quality assurance (screenshot baselines per example, axe, custom guards) is dense for a 0.x single-author library, but the adoption signals (downloads, contributors) are unknown.

### Gaps
- No RTL support was found or mentioned (not searched exhaustively).
- No measured tree-shaking/per-component import size was found; the bundles are single files.
- Author and contributor count, and npm downloads, were not looked at. The git log shows 149 commits, the earliest dated 2026-09-17, so the history appears rewritten or squashed, while the CHANGELOGs go back to Aug 2026.

## 3. Domain-specific strengths (industrial/plant)

### Takeaway
The core distinction is a consistent plant vocabulary across packages. Limits and verdicts appear in core, charts, table and calculation, with an explicit freshness axis and an alarm lifecycle. The instruments are control charts with Nelson-style rules, Pareto, an operating-time axis that cuts out non-working hours, and state bands. On top sits a production schedule with transports, conflict findings and a controlled-editing intent model, plus an auditable calculation component. Charts performance is measured and published.

### Cited findings

**Limits, verdicts, freshness, alarms**
- A limit is a rule with a severity (`warning|alarm`). `assess()` gives four outcomes (`ok|unknown|warning|alarm`). The same model lives in both core and charts on purpose, held together by a conformance test (ADR-0006) — [docs/testing.md](docs/testing.md), `packages/core/src/lib/limit.ts`
- Freshness has three states (fresh, stale, disconnected) and is computed from an as-of time, not the fetch time. A stale value keeps its verdict (ADR-0010) — [docs/adr/0010-a-stale-value-keeps-its-verdict.md](docs/adr/0010-a-stale-value-keeps-its-verdict.md)
- The alarm model owns the lifecycle (standing/cleared × acknowledged/not), ordering, repeat counts per type and flood detection. It never generates alarms (ADR-0009). `AlarmList` is a table with density and toolbar; `VerdictColumn` reads values against a limit set — [docs/adr/0009…](docs/adr/0009-the-library-owns-a-lifecycle-not-a-generation.md), [packages/table/README.md](packages/table/README.md)

**Chart instruments**
- `ControlChart`: control limits come from a named reference window or are given, "never from everything visible" (ADR-0008). Sigma comes from the mean moving range; there are four Nelson rules, each switchable, with run lengths as parameters, and zone lines at 1σ/2σ. Violations come back as data (`onViolations`). Control limits are distinguished from specification limits by role and stroke — [packages/charts/docs/capabilities.md](packages/charts/docs/capabilities.md)
- `pareto()`: stable descending sort, cumulative share, a cutoff crossing, and the remainder collected last — same source
- Operating-time axis (`calendar`): wall clock ↔ operating time, monotonic. Removed spans become gaps with one break mark each, and the ticks stay on wall-clock local boundaries (tested under Europe/Berlin across DST) — same source
- `StateBand`: a state is a number (an index into the state list, ADR-0007); the legend explains states; one state is highlighted across bands — same source
- `Matrix`: a named value channel (ADR-0011), coloured by gradient or by a limit set — same source
- Also: multiple axes per orientation, `alignTicks`, `time` axes with DST-correct local ticks, `syncId` crosshair sync across charts, a legend toggle, `Line step` (sample-and-hold), zoom and pan only when `onDomainChange` is given — same source

**Long-series performance** — [packages/charts/docs/capabilities.md](packages/charts/docs/capabilities.md), [packages/charts/README.md](packages/charts/README.md)
- Data is materialised into `Float64Array` once per change. Two canvas layers mean hover redraws only the overlay. Lines and areas are downsampled to first/min/max/last per pixel column, while the tooltip searches the raw data.
- Measured (one machine, one day, `charts-long-series` 03): 3×100k lines, 8.3 ms materialisation and 2.6 ms draw (7.6 ms without downsampling). 3×1M lines, 51.4 ms and 8.2 ms. 3×1M mixed (bar+area+line), 52.2 ms and 57.3 ms. Hover is 60 FPS in every case. A kiln week at 1 Hz (2×604,800 points) draws in 8–23 ms, and a zoomed 45 min in 0.6 ms. A hover hit test costs about 3 µs per move, independent of point count.
- The README cites older figures: 3×100k in 10.5 ms / 10.8 ms and 3M points in 49.8 ms / 49.6 ms. The capabilities doc says its table differs because it was measured before and after downsampling; the README and the doc do not match exactly.

**Schedule** — [packages/schedule/README.md](packages/schedule/README.md)
- Subtasks on lanes, with setup/teardown, cross-machine transports with durations, `now` line, tooltips, zoom/pan (Ctrl-wheel, pinch), touch pan/tap, `LaneGroup` to any depth with folded "miniature" rows (ADR-0025), appearances (`provisional`, `fixed`, `muted`, `open`), `progress` rail, snapping to shift rasters with offset.
- Editing is controlled (ADR-0023). A drag shows a ghost with the findings the drop would cause and reports an intent (`move|lane|stretch|setup|teardown|place`); the application applies it with `applyIntent`. `canMoveTo` refuses visibly. `ripple` computes the cascade over dependent subtasks but never applies it; `shiftTask` moves a whole order. Findings (overlaps per lane, late transports) are available as data. External work can be dragged in with native HTML5 DnD (`placing` → `place` intent).
- It uses the charts' operating calendar and time arithmetic (ADR-0022). Occupancy is the schedule's job, not the charts' (ADR-0026).

**Calculation** — [packages/calculation/README.md](packages/calculation/README.md)
- A derivation (e.g. OEE, a payslip) is declared as JSX in the shape it is shown (ADR-0027) and **evaluated by the library**, so the display cannot disagree with the number. It has two forms, tree or chain (ADR-0028), which can be mixed. Precision is full, with "≈" where rounded operands don't sum. An absent given propagates absence, never zero. Target and limits go through core's `assess()`; the worst hidden verdict is flagged. Each line is readable as one sentence to screen readers. Declaration errors (dangling `Ref`, cycles, operand count, duplicate ids) throw on the first render.

**Table grouping** — [docs/adr/0029-a-row-groups-form-follows-its-level.md](docs/adr/0029-a-row-groups-form-follows-its-level.md), [packages/table/README.md](packages/table/README.md)
- The group form follows the level: outer levels get a header row carrying the count and every aggregate under its column, and the innermost of several levels becomes a *span* beside its rows. The ADR notes the prototype needed 25 lines for 13 orders with header-only grouping. Groups fold, select as a whole, page and virtualise. Grouping is up to 3 levels, by a column or a computed value; aggregates also form the filtered-set footer.

### Inferences
- No mainstream React UI kit (MUI, Mantine, Radix) ships SPC control charts, operating-time axes, alarm lifecycles or a production schedule. Against AG Grid, ECharts and Bryntum, umriss offers a far smaller feature surface, but with domain semantics (limits, verdicts, freshness) shared across all components.
- The "pure modules exported" pattern (arithmetic usable without the components) is a consistent API choice across charts, schedule and table.

### Gaps
- No benchmarks for table virtualisation beyond "twenty thousand rows", and none for schedule scale (subtasks/lanes).

## 4. Documented non-goals, "later" and known limits

### Takeaway
The docs are explicit. Charts deliberately exclude category and log scales, smoothing, animation, export, WebGL, horizontal bars and pie/radar/candle. Wanted-but-not-built are a data table view, `onSelect`, stacking, box plot and line colour by limit. The schedule lacks keyboard access and touch editing. Core lacks full `forwardRef`/`className` pass-through on about 20 components. Every `.scratch` spec is marked `Status: done`; no open tickets remain.

### Cited findings
- **Charts "Later"** (wanted, waits for a caller): a data table view (a11y), `onSelect`, stacking (stacked bars and areas), box plot, line colour by limit — [packages/charts/docs/capabilities.md](packages/charts/docs/capabilities.md) "## Later"
- **Charts "Out"** (never): category scale (ADR-0002; bars on a numeric x), log scale (it breaks the affine contract, ADR-0001), smoothing, animation, export (the caller uses `toDataURL`), WebGL, horizontal bars, pie/radar/candle ("the set of kinds is closed (no renderer interface for third parties)") — same, "## Out"
- **Charts known limit**: change detection compares accessors and `tickFormat` by source text, so two same-text closures over different captured values count as equal — same, "## Known limits"
- **Charts a11y out of scope**: data table, touch a11y, announcing pointer moves, a public Active-point API — [.scratch/charts-a11y/spec.md](.scratch/charts-a11y/spec.md)
- **Schedule out of scope**: keyboard and screen-reader access to subtasks and findings; creating by drawing and deleting by drag; dragging out to other components; a controlled domain prop or view persistence; a controlled selected-subtask prop; moving a whole task by gesture; touch editing; tooltips on lane headers — [.scratch/schedule-refinement/spec.md](.scratch/schedule-refinement/spec.md) "## Out of Scope"
- **Core open items**: the `forwardRef`/`className`/`rest` pass-through and the controlled/uncontrolled gaps (`library-audit` 09, now `wontfix`); collapsing the dock onto its grip is out of scope "because it doubles the state space". The README roadmap still lists "a text tone for danger and warning" as open, but `.scratch/tone-contrast/spec.md` says `Status: done` and core 0.7.0 is "A text token for danger", so the README is stale — [packages/core/README.md](packages/core/README.md), [.scratch/tone-contrast/spec.md](.scratch/tone-contrast/spec.md), [packages/core/CHANGELOG.md](packages/core/CHANGELOG.md)
- **Testing known-open**: popover positioning is checked only as pure arithmetic, not in the DOM; jsdom is pinned to ^26; screenshot baselines are darwin-only unless regenerated per platform — [docs/testing.md](docs/testing.md)
- All 42 feature directories under `.scratch/` carry `Status: done`, and no issue file carries an open status (only `library-audit/09` is `wontfix`) — scan of `.scratch/*/` status lines

### Inferences
- The explicit Out list is a strong selling point for honesty, but it also marks the charts as a poor fit for general BI dashboards (no pie, no categorical axis, no stacking).
- The schedule's missing keyboard access is the largest a11y gap relative to the rest of the workspace's a11y bar.

### Gaps
- No public issue-tracker data (GitHub issues) was checked; only local `.scratch`.
