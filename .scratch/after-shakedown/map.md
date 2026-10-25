# After the shakedown

Label: wayfinder:map
Date:  2026-10-25

## Destination

For every topic the shakedown of 2026-10-24 left open - step 3 of `.scratch/shakedown/README.md`, the eight
alarm-management decisions (`.scratch/alarm-management/requirements.md`, part B) and every wish in
`.scratch/shakedown/wishes.md` - a recorded decision (take / later / never, the reason, ADR or not) or a spec
outline that `/to-spec` and then `/to-tickets` can take without asking the maintainer again.

## Notes

- **One ticket per session.** A grilling ticket calls the skills `grilling` and `domain-modeling`; the
  maintainer answers, the agent never answers for them. Research tickets run AFK in a subagent with the skill
  `research`; findings go on a local `research/<name>` branch (never pushed: only `main` goes to GitHub) and
  the ticket points at the file.
- **The maintainer delegates technical questions** (2026-10-25). The agent decides how umriss does a
  thing (API shape, build, mechanism) and marks each such decision *(agent)* in the answer. Only
  product questions go to the maintainer: what umriss offers or leaves out, what it promises, its
  scope. Technical tickets may then run in parallel, AFK, each through `/to-spec` and `/to-tickets`.
  The map's own files (this file, `CONTEXT.md`, ADR numbers) are written only by the coordinating
  session.
- **Read before claiming absence:** `packages/<pkg>/API.md`, `CONTEXT.md`, `docs/adr/`. The shakedown file
  each ticket names holds the three proofs per wish (task, workaround with lines, where it exists elsewhere).
- **The answer is shaped for `/to-spec`:** what is decided, what is explicitly out, whether it is costly to
  reverse (then an ADR), which package(s) it touches, and which spec it becomes (new folder or an existing one).
- **Not argued again here:** the decisions of `.scratch/open-points-roadmap/spec.md` (G1: the maintainer is
  the caller - "waits for a caller" parks nothing), ADR-0045 (a styling wish is answered with a token),
  ADR-0059 (the set of chart kinds is open, by its test), ADR-0062 (React 19 floor). A ticket may reopen an
  ADR only where the shakedown showed its *Instead* failing.
- **Already specified, so only pointed at:** XLSX (`.scratch/table-xlsx/`), a chart's range and "a chart
  filters a table" (`.scratch/chart-range-selection-and-navigator/`), server mode's late answer, select all,
  export and sums (`.scratch/table-server-mode-2/`), the navigator (`.scratch/chart-navigator/`), and the
  roadmap's package C (print stylesheet, avatar, timeline, saved views, horizontal bars, ...). A wish they
  cover is answered by naming the spec.
- **Already decided, straight to `/to-spec`:** the three styling needs no token reaches - a modal width, the
  eyebrows' text-transform, the button's press scale (`design-system.md` 9) - get tokens, by ADR-0045.

## Decisions so far

<!-- one line per resolved ticket: [title](issues/NN-slug.md): gist -->

- [ISA-18.2 and EEMUA 191 in secondary sources](issues/08-isa-18-2-and-eemua-191-in-secondary-sources.md): the
  states, shelving and acknowledgement hold; the second field is OPC UA's, the flood threshold ISA's, the
  silent level "diagnostic"; a narrow wording without conformance is proposed.

- [What a package ships so that Jest and Vitest load it unconfigured](issues/01-what-a-package-ships-for-jest-and-vitest.md):
  only a CJS entry without a CSS import from JS loads unconfigured in both; ADR-0021's "Vitest handles CSS
  imports" does not hold.

- [Server Components in comparable libraries](issues/03-server-components-in-comparable-libraries.md): per-module
  `"use client"`, field-name config and a data tree instead of element-type matching are what others do; dates
  either show the server's zone or need a browser-only pass.

- [Jest and Vitest with no configuration](issues/02-jest-and-vitest-with-no-configuration.md): ADR-0021
  stands (amended); the promise is a documented setup file plus two lines per runner, with a `default`
  condition and no CJS build, held by a consumer check in `check:dist`; no motion switch. Spec
  `.scratch/test-runners/`.

- [Alarm management: where it lives and which ADR carries it](issues/09-alarm-management-where-it-lives.md): a
  new package `@umriss-ui/alarms` on core and table; one new ADR supersedes 0009 and 0057; the first ticket
  restores `e027d1f7^` unchanged.

- [Alarm management: priorities, acknowledge-all, wording, sound, time and shortcuts](issues/10-alarm-management-the-models-decisions.md):
  four fixed levels ("diagnostic" later); acknowledge the selection or the rendered rows; ISA words in the
  wording only; sound as a callback; time as `asOf`; shortcuts only with focus.

- [Alarm management: the standards claim and the slices of the first version](issues/11-alarm-management-standards-claim-and-first-slices.md):
  a narrow ISA-18.2 claim (state model, no conformance) after the last slice; B.8's order with the ADR, two
  table tickets (seconds, accessible grid selection), the claim and a first hand-published release after the
  keyboard slice; `alarmFilter` never, analysis views and "diagnostic" later. Spec `.scratch/alarms/`.

- [The upgrade promise](issues/19-the-upgrade-promise.md): release in step, peers `^0.x.0`, a rename works one
  more minor with a DEV warning, fixes in the latest minor only, TypeScript 5.4 floor; an ADR. Spec
  `.scratch/upgrade-promise/`.

- [A theme object](issues/20-a-theme-object.md): none; a complete token file to copy and the layer order in
  core's README, row height follows density. Spec `.scratch/theming-recipe/`.

- [Scroll in a dashboard widget](issues/14-scroll-in-a-dashboard-widget.md): the widget body scrolls what
  exceeds its size instead of cutting it, a tab stop while it overflows; inert in the editing mode; ADR-0064
  amended. Spec `.scratch/scroll-in-a-widget/`.

- [Pivot with columns unknown at compile time](issues/13-pivot-with-columns-unknown-at-compile-time.md): pivot
  stays "never"; a tested recipe (computed columns keyed by value, footer and row-total sums) plus the fix of
  a column that keeps a stale accessor under a reused key; ADR-0032 amended. Spec
  `.scratch/table-columns-from-the-data/`.

- [Linked views](issues/16-linked-views.md): no coordinator - the application holds the key, each view takes
  and reports it through props it has; the table's one gap becomes a **Current row** (`currentRow`,
  `onCurrentRowChange`); drill-down an example; cross-filter is the range spec's; an ADR. Spec
  `.scratch/linked-views/`.

- [What umriss promises a Server Component](issues/04-what-umriss-promises-a-server-component.md): a Server
  Component hands umriss its data, every view stays a Client Component; a calculation may be written in a
  Server Component; the server's HTML shows no instant and no schedule summary it cannot know; an ADR, and
  ADR-0060 amended. Spec `.scratch/server-components/`.

- [Chart export, now that toDataURL fails](issues/12-chart-export-now-that-todataurl-fails.md): export is
  taken - `useChart` returns `toPng()`, the **Picture** of what the reader sees, drawn by the chart itself; a
  new ADR supersedes ADR-0032 on export; print redraws on `matchMedia("print")` (Chromium promised). Spec
  `.scratch/chart-picture-and-print/`.

- [A touch size for the controls](issues/06-a-touch-size-for-the-controls.md): touch is told by the pointer
  (sizes by `pointer: coarse`, behaviour by the gesture's `pointerType`), never a setting or hook; `md` is
  44 px **under a finger**, no target below 24 px, held by a shared check; long press for Tooltip and
  ContextMenu; no bottom sheet, no media hook; an ADR. Spec `.scratch/under-a-finger/`.

- [Number formats](issues/15-number-formats.md): a format is `"percent"`, `"count"` or Intl's options plus
  `decimals`, taken by table columns, chart series and axes in the language's locale; a year is
  `useGrouping: false`, no "-0"; calculation and `Stat` keep `unit` + `decimals`, per-line rounding never; an
  ADR. Spec `.scratch/number-formats/`.

- [One root contract across the packages](issues/05-one-root-contract-across-the-packages.md): four shapes -
  element, field, composite, no element - say where `ref`, `className`, `style` and the rest land; `ref` is
  always an element, code-driven actions (`scrollToRow`, `focusCell`, `scrollToLane`, ...) are on the hook;
  `aria-label` everywhere, old names kept one minor per the upgrade promise; an ADR. Spec
  `.scratch/root-contract/`.

- [Loading, empty and filling the parent](issues/17-loading-empty-and-filling-the-parent.md): the chart has
  all three already; a table stays within a parent of definite height; a schedule fills its frame (floor
  400 px) and takes `loading`, no `empty`; no widget loading, pixel size, retry or `onError`; ADR-0050 and
  ADR-0042 amended. Spec `.scratch/views-in-their-frame/`.

- [DEV warnings for the silent traps](issues/18-dev-warnings-for-the-silent-traps.md): seven traps warn in
  DEV (row shape, stale accessor by a DEV probe, seventh series, missing `Pagination`, unnamed Calculation, a
  format that does not fit, a virtual table rendering every row); rows that are not an array read as none;
  strings as numbers and the browser floor documented; each package keeps its own `dev.ts`. Spec
  `.scratch/dev-warnings/`.

- [Native pickers on touch](issues/07-native-pickers-on-touch.md): no picker hands over to a native input;
  the calendar head gets a month and a year Select (the OS wheel under a finger), the grid the APG keys, the
  DatePicker typed entry in its panel's foot; NumberInput with negatives asks for the text keyboard; time
  fields take their digits themselves. Spec `.scratch/date-jump-and-typed-entry/`.

- [A plant time zone](issues/25-a-plant-time-zone.md): taken - an IANA `timeZone` in core's formats that
  every package reads (charts as a `Chart` prop the app or the schedule passes); a day is the zone's day;
  ticks on the zone's real hours across a clock change; the zone named once per view where the reader's
  differs; a new ADR supersedes ADR-0060's time-zone point. Spec `.scratch/plant-time-zone/`.

- [Core's single wishes](issues/21-cores-single-wishes.md): taken - a `MoreGlyph`, a palette shortcut that
  can be switched off, `labelPlacement` and a label token, a windowed and async listbox for Combobox and
  MultiSelect, `min`/`max` on the pickers; the rest never, several as recipes. Specs
  `.scratch/core-small-additions/`, `.scratch/long-option-lists/`.

- [The table's and the schedule's single wishes](issues/23-the-tables-and-the-schedules-single-wishes.md):
  taken - Shift-click row ranges, a column drag in the ColumnMenu's list, named own aggregates, a view that
  survives JSON, search debounce, CSV day dates, keyboard zoom, touch editing, a schedule data table, a DEV
  warning for malformed data; the rest never, several as examples. Specs `.scratch/table-small-wishes/`,
  `.scratch/schedule-keyboard-and-reader/`.

- [The charts' single wishes](issues/22-the-charts-single-wishes.md): taken - side legend, `maxGap`, month
  ticks under bars, `bin` on `ArrayLike`, `baseline` on `Bar` (waterfall, error bars), a matrix colour bar and
  cell labels; the rest are recipes in the charts demo; no new kind, no ADR. Four specs.

- [Calculation, dashboard and operator-screen wishes](issues/24-calculation-dashboard-and-operator-screen-wishes.md):
  taken - a widget lock, `headingLevel`, stored options over `defaultOptions`, data quality as a third axis on
  `Stat` and `Given`, the calculation in P3's print stylesheet; never - skipping missing values,
  uncertainty, drag from the catalogue, a head slot, a mimic layer. Specs `.scratch/dashboard-small-wishes/`,
  `.scratch/dashboard-locked-widget/`, `.scratch/data-quality/`.

## Not yet specified

- **The order of the work.** Once the decisions stand, one page that orders the resulting specs into
  releasable packages, as `.scratch/open-points-roadmap/spec.md` did for October - after that roadmap's
  packages B and C, or interleaved with them.

## Out of scope

- The shakedown's findings that are neither a step-3 item nor a wish - the unconfirmed misfits and looks in
  `accessibility.md`, `zoom.md`, `qa.md`, `upgrade.md`, `agent-docs.md` and the per-package files. They are
  defects or polish, not decisions: a triage of their own, as step 2 was.
- Building anything. This map ends at decisions and spec outlines.
