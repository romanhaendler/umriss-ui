# 08: Records and release

**What to build:** One release breaks charts, table and schedule once, and says how to move: a migration table old → new in every changelog, covering both efforts. The capability record lists the view, `zoomable`, `zoomLimits`, 'Show all' and the gestures, drops 'clamping is the caller's', and puts a navigator under 'Later'. The READMEs and CONTEXT.md agree with the code.

**Blocked by:** 01-07 and `charts-bound-to-rows` 01-08

**Status:** done (the release itself follows the acceptance)

- [x] Every removed prop and export appears in a migration table
- [ ] Every suite green; the release builds

## Comments

### Left over from 06 (2026-10-04)

Still say "manual mode": `docs/testing.md` (also names the old test files
`manualMode.test.tsx`, `manualModel.test.ts`, now `serverMode.test.tsx`,
`serverModel.test.ts`) and two doc comments in core's
`src/lib/language/wording.ts`. ADR-0042 and `docs/journal.md` mention it as
history and stay. From charts-bound-to-rows 02: the Installation page's lead
still says "through an accessor" - reword with 05 or here.

### Open for the acceptance (from charts-bound-to-rows 07)

`TooltipPoint.value` - what a custom tooltip `render` reads - is a matrix
cell's colour, now called `level` everywhere else. Renaming it is a further
public break; put the question to the user at the acceptance.

### Known limit to name at the acceptance (from the echo fix, 75173127)

A view handed in that equals one the component reported less than a second
ago (and not yet echoed) is taken for its own echo and not applied - so an
application that restores a just-reported view within that second sees no
change. The `Echoes` rule exists three times (table, schedule, charts):
charts depends on nothing, so it cannot share core's copy.

### Left over from component-view 01 (c6b8eb5a)

- The demo shell forwards moved page ids, not example anchors:
  `/axis/#zoom-and-pan`, `/axis/#visible-domain`, `/chart/#cursor-sync` land
  on their old page without the example. Decide whether the shell should
  forward anchors too, or name it in the changelog.
- The keyboard help says "0 shows everything"; `0` returns to the axis' own
  `domain` (usually the whole data). Reword (`zoomHelp`, both wordings).
- The visual suite was not re-run after the last echo-rule change; the final
  full suite covers it.

### Delivered (2026-10-04)

Scope changed by the user: no version bump, no "Release:" commit - an
acceptance comes first. So the records stand under `## Unreleased`.

- **Changelogs.** charts, table and schedule each have an `## Unreleased`
  section with "Changed" (a migration table first, then the broken
  behaviours) and "Added". Rows: charts 16, table 5, schedule 6 - every name
  checked against `git diff 63aa408b..HEAD` and the code. The echo rule's
  one-second limit stands as "A known limit" where `initialView` is described
  in all three. `YAxis value` was never released (it lived between 02 and
  07), so charts' row names the released `YAxis accessor`. Core has no entry:
  its changes are the demo's scenarios and two doc comments.
- **Capability record.** View, `zoomable`, `zoomLimits`, 'Show all' and the
  gestures were there (01-04); added a navigator under "Later"; the heading
  `Chart<T>` is `Chart` (from `useChart`), and BoxPlot's `hidden` row speaks
  of the view. Nothing says the caller clamps.
- **Leftovers.** `docs/testing.md`: server mode and `serverMode.test.tsx`,
  `serverModel.test.ts`, plus the charts' and the schedule's view tests;
  core's `wording.ts` comments say server mode. `zoomHelp` confirmed reworded
  (03). CONTEXT.md: "accessor" gone from Materialised series, Baseline and
  State series; **View** says a view handed in applies whenever it differs.
- **Old example anchors forwarded.** `Moved` in `@umriss-ui/demo` takes a
  moved example as `page/example` on both sides; `fromPlace` reads it and the
  shell rewrites the address as for a moved page; no static forwarder (the
  anchor never reaches the server). charts: `axis/zoom-and-pan`,
  `axis/visible-domain`, `chart/cursor-sync`, `tooltip/toggling-legend`,
  `tooltip/legend-placement`; schedule: `lane-groups/controlled`. Test in
  `examples.test.ts`.
- **READMEs.** charts: a bullet on the view; table: server mode with
  `server: true`, `rowCount`, `onRequest`. schedule and root agree already.
- **Found on the way.** `llmsGuard.test.ts` failed on HEAD for schedule: it
  took a component to be an export with a `…Props` beside it, and since
  `useSchedule` the schedule exports none. `KNOWN` names the components a hook
  hands out (charts', schedule's) now.

The heading is `## Unreleased` alone, the effort's title in bold below it:
the site's `newestRelease` (`packages/demo/src/tooling/documents.ts`) skips
exactly that heading and throws on any other that is no version - the
release renames it to `<version> – <title> (Oct. 2026)`.

Checks: `pnpm typecheck`, `pnpm lint` green; demo unit suite 348/348. The full
visual suites and the release build were not run - that is the acceptance's.

### Fixed after the spec review (2026-10-05)

- **Charts, the default is no view** (Q12, Q13). A span equal to the axis'
  own domain - up to rounding, after a gesture or `setDomain` - leaves
  `domains`, so 'Show all' goes and the report says `{}`. The default
  `zoomLimits.max` is the data's extent or the axis' own domain, whichever
  is wider: a `"nice"` domain no longer makes the first zoom out narrow the
  view. A lone point (no step) zooms into nothing. bfa3e080.
- **Start not reported** (Q5, charts and schedule). A start naming an
  unknown axis id, series name or group is, less those, where the component
  starts: nothing is reported until the reader, a setter or a view handed in
  changes the view. bfa3e080, 0cf3b272.
- **Table `viewKey`**: `hidden`, `folded` and `branches` are sets, their
  order no content; `sort`, `order` and `grouping` keep theirs. 19f045ed.
- **Pan not clamped**, as before: neither the chart's nor the schedule's pan
  stops at the data's extent, and the charts changelog already says so. Left.
- Checks: charts, schedule, table typecheck and unit suites green; the
  charts visual tests for zoom, 'Show all', cursor sync and the view (light
  and dark) green, no screenshot renewed.

### Fixed after the standards review (2026-10-05)

- **A view handed in is compared with what the chart holds**, not with the
  view it reported: the span or hidden name of a part not declared at the
  moment no longer survives a view that leaves it out and comes back when
  the part does. c657e629.
- **`Accessor<T>`, `ListAccessor<T>` are `ValueFunction<T>`, `ListFunction<T>`**
  (the glossary avoids "accessor"); a row in the charts changelog's
  migration table. CONTEXT.md's **Value** names its chart meaning - a
  series' y position, the x axis' position - and the matrix' colour as its
  **Level channel**. The internal config field `accessor` stays: no
  reader's word. 2b681076.
- **`useSchedule` at the end of the schedule's entry**: the stylesheets of
  the library, the schedule's demo and core's control room build byte for
  byte the same, so the rule holds without an exception. a63f8b8a.
- **`Echoes` once for charts and schedule**: exported from the charts'
  entry, the schedule takes it from there (ADR-0022); the table keeps its
  copy, as it may not depend on the charts. 6ef81ccf.
- **`useSchedule` memoises** what it hands back, as `useChart` does.
  4128ee48.
- **`AxisSpans`** names the span per zoomable x axis (`ChartView.domains`,
  `ChartParts.domains`, the scene's). `ScheduleView.domain` is one span, not
  a record, and keeps its tuple. 62188bb9.
- **The scene's view fields** say what they are: `heldSpans`, `heldHidden`
  (held and drawn), `reportedView` (what `useChart` reads), `hiddenNames()`,
  `viewToReport()`. aa0fe3c0.

- Checks: `pnpm typecheck` and `pnpm lint` green; unit suites charts
  797/797, schedule 337/337, table 778/778, the demo's site and llms guards
  green. The schedule's screenshots, forced colours and keyboard images
  (light and dark) 284 passed, none renewed; no charts run, nothing it draws
  changed.
