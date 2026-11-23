# The surface of the three young packages (calculation, dashboard, alarms)

Research for ticket 08. Candidates only; nothing is decided. Sizes: S/M/L. "Breaks a caller" marks a change that
would break code written against 0.56.

Read: `packages/{calculation,dashboard,alarms}/API.md` in full; `src/index.ts` of each; `alarms/src/alarmModel.ts`,
`PriorityMark.tsx`, the props of `AlarmList.tsx` and `AlarmBanner.tsx`; `dashboard/src/useDashboard.ts`
(options, parts), `WidgetType.tsx`, `model.ts`, `DashboardProps` in `Dashboard.tsx`; `calculation/src/elements.tsx`,
`Reader.tsx`; `CHANGELOG.md` of each (grep for breaks and `Migration:` lines, 0.47 to 0.56); `peerDependencies`;
`CONTEXT.md` on snooze, density.
Not read: the demos, `tests-*`, the CSS, the rest of `Dashboard.tsx` (drag, menus), `Calculation.tsx`
(rendering), `calculation/src/model.ts` beyond the metrics check, `evaluate.ts`, `present.ts`, the wording keys
(`alarm*`, `dashboard*`) and the docs pages. No claim below about runtime behaviour that is not quoted from source.

## What the table's pure model gives alarms, and what the three call density

**Alarms imports from `@umriss-ui/table`** (`alarms/src/alarmModel.ts:24-25`, `AlarmList.tsx:40-41`):
- value: `tableModel` (called at `alarmModel.ts:676`), `Pagination`, `useTable`;
- types: `ModelColumn`, `SortLevel`, `TableProjection`, `TableInput`, `TableSelection`.

Nothing else. So the table's public model freeze is coupled to alarms in four places that a caller sees:
`AlarmProjection extends TableProjection<AlarmRow, AlarmColumn>` (every field of the table projection - `entries`,
`groups`, `lines`, `visibleLines`, `roots`, `exported`, `columnCount`, ... - is alarms' surface too, see
`alarms/API.md` AlarmProjection), `alarmModel(input, state: TableInput<...>)`, `AlarmColumn`-typed `ModelColumn[]`
in `alarmColumns`/`ALARM_COLUMNS`/`AlarmInput.columns`, and `DEFAULT_ORDER: SortLevel[]`. `TableSelection<string>`
is the prop type of `AlarmList.selection`. Nothing else in calculation or dashboard touches the table
(`calculation`, `dashboard` import core only).

**Density.** Core's `Density` is `"comfortable" | "compact"` (provider config, `core/API.md:100`, `189`, `1242`);
the component prop is `"regular" | "compact"`, bridged by `useDensityFor(own, fallback)`
(`core/src/lib/provider/context.ts:28-39`: "comfortable means regular"). Who uses what:
- calculation: `density?: "regular" | "compact"`, default provider else `"regular"` (`Reader.tsx:36`, `Calculation.tsx:110`).
- alarms: `AlarmList.density?: "regular" | "compact"`, default provider else `"compact"` (`AlarmList.tsx:105`, `341`).
  `AlarmBanner` and `PriorityMark` have none.
- dashboard: no density at all, no `useDensityFor`.
So the two that have it follow the table's `"regular"` name, as core's prop-level API does; the odd name is
core's provider value `"comfortable"`. The package defaults differ (calculation regular, alarms compact) - by design
(`AlarmList.tsx:340`), but the doc sentence `"compact" reduces the row height` sits over a default of compact.

## Fit to freeze

- **calculation: reads as fit.** 63 sections in its changelog, but in the last ten minors (0.47-0.56) no
  source-level break: the `Migration:` lines are peer installs, a root selector now on the surface, and a
  `decimals` carry rule (0.47.x, see `CHANGELOG.md:121`). Five of the ten releases are "in step" with no change.
  Provisional: the metrics rule is only a runtime error (finding C3), `emphasis`/`rule` "not on the Result" is prose not type.
- **dashboard: reads as fit, with one documentation hole.** In the ten minors one behavioural change to stored
  sizes (0.54), `defaultOptions` made optional (0.52, loosening), menu roles (0.52, a test selector). No type or
  signature break. Provisional: the stored `DashboardView` is an on-disk format of every caller (finding D1) and
  `API.md` omits the props of `Dashboard` (D2).
- **alarms: reads as the least settled of the three.** Youngest (0.47.0, Oct 2026), one signature break in the
  ten minors (0.54: `countAcknowledgeable` takes `asOf` as a required third argument), the snooze/availability
  model added in 0.49-0.54, and its surface is partly the table's (above). Provisional: finding A1 to A4.

## Findings

Format: where, what stands there, would later cost a major, smallest change, size.

### Alarms

**A1. The same type of ages is called `ages` in core and calculation and `freshness` in alarms. Breaks a caller.**
`alarms/src/AlarmList.tsx:60-62` (`freshness?: FreshnessAges`), `AlarmBanner.tsx:29`; against
`core/API.md:1078` (`ages?: FreshnessAges`) and calculation `GivenProps.ages` (`elements.tsx`). In the same
alarm props `asOf?: Date | number | null` while calculation's `asOf?: Date | number` (no `null`) and
`AlarmInput.asOf: number` (ms only). Later: yes, a rename is a major. Smallest change: rename alarms'
`freshness` to `ages` (the `asOf`/`ages` pair is core's). Size S (two props, demos, tests, changelog line).

**A2. `lifecycleAt` is named in the 0.47.0 changelog as an export the application uses; `index.ts` does not
export it.** `alarms/src/index.ts` vs `alarmModel.ts:~216` (`export function lifecycleAt`), `CHANGELOG.md:92`.
Also unexported and used by the components: `RATE_WINDOW_MS`, `priorityWord`. A caller that wants an alarm's
lifecycle at a time (what `AlarmRow.lifecycle` holds) cannot call it. Later: no (adding an export is not a
break). Smallest: export it, or strike the sentence. Size S.

**A3. The list's data shape leaks the table's.** `AlarmProjection extends TableProjection`, `alarmModel(input, state: TableInput)`
(`alarmModel.ts:592`, `631`). Whatever the table-review decides for its public model (ticket 06, group 7) moves
alarms too; `unknown`-typed members of the table's projection would be alarms' surface. Later: yes, a major for
both. Smallest: decide the table's model first, then say in alarms' docs which projection fields are its own contract
(`flood`, `rate`, `activeUnacknowledged`, `unacknowledgedByPriority`, `hiddenAlarms`, `filtered`, `visible`, `total`,
`page`, `pageCount`) or narrow the type with `Pick`. Size M. Marks: narrowing breaks a caller who reads `entries`/`lines`.

**A4. Two vocabularies for one act: snooze in code, shelve on screen.** `snooze`, `unsnooze`, `Snooze`,
`onSnooze`, `onUnsnooze`, `snoozeReason(s)`, `snoozeDurations`, `Availability = "snoozed"`, and the screen word
"Shelve" (`alarmModel.ts:105-110`, `AlarmList.tsx`). `CONTEXT.md:676-681` records this on purpose
("ISA-18.2 and the screen say *shelved*"), so it is not a mismatch with `CONTEXT.md`, but it is a pair of names a
caller must learn, and wording can change "Shelve" without a break while code names cannot. Later: yes. Smallest:
none needed if the maintainer keeps it; otherwise rename code to `shelve`. Size M if renamed. Breaks a caller.

**A5. Shapes and names, smaller.**
- `acknowledge(alarms, ids, time)` takes `time`, `countAcknowledgeable(alarms, ids, asOf)` takes `asOf`,
  `snooze(alarm, until, by, reason?)` positional with an optional fourth, `Acknowledgement` returned as an object
  `{alarms, count}` while `snooze`/`disable` return an `Alarm` (`alarmModel.ts:426-440`, `465`). Rename of a
  parameter is not a break; positional `snooze` could become an object later only with a major. S.
- `AlarmList.hiddenOnly`/`onHiddenOnlyChange` is a controlled-only pair (no `defaultHiddenOnly`); core and table
  use their own control patterns, not compared here (not read). S to align.
- `PriorityMark.priority` is the word (`"critical"|"high"|...`), its doc sentence speaks of "1 a diamond" (the
  level number); the number is derived from `PRIORITIES.indexOf` (`PriorityMark.tsx:10,36`). Doc only. S.
- `AlarmList.snoozeDurations` carries `@default no default` which `API.md` prints as "(default: no default)"
  (`AlarmList.tsx:~83`). Doc only. S.
- `AlarmType.returnBand.limit` is "expressly not read" (`alarmModel.ts:~165`): a required field that nothing uses.
  Making it optional later is not a break; removing it is. S.
- `Alarm.availability === "suppressed"` has no transition; the application writes it. Intended; mention only.

### Dashboard

**D1. The stored `DashboardView` is the caller's persistence format and is frozen by 1.0.**
`dashboard/src/model.ts` (`DashboardView {widgets}`, `DashboardWidget {id,type,size,options: unknown,locked?}`,
`WidgetSize` closed set of six names). `options: unknown` is the one loose member (typed per widget type through
the hook only). The reader is lenient (`readView`), so additions are safe: a new size name or a new field in the view
does not break stored data; removing or renaming `type`/`size`/`widgets` would. The doc already says the view is "an
object so that more can join it later". Later: only a rename/removal costs a major. Smallest: state in the docs
that `DashboardView` is the supported storage format and that additions are minor. Size S (docs).

**D2. `API.md` omits what it says it lists.** `dashboard/API.md` has "Props" only for `WidgetType`; `Dashboard`
(`DashboardProps`: `children`, `catalogue?: ReadonlyArray<string>`, `headingLevel?: 2|3|4|5|6` default 2,
`Dashboard.tsx:24-35`), `WidgetContent`, `WidgetFormProps` (`options`, `change`) and `HeadingOptions` are named but their
members are not (the type line shows no brackets for `DashboardProps`, `WidgetContent`, `WidgetFormProps`). Same hole
the table review found. Later: no. Smallest: have the props step expand them. Size S (generator).

**D3. One word, three jobs: `catalogue`.** A prop of `Dashboard` (names of types the catalogue lists), a function
in `DashboardParts` (`catalogue: () => void`, opens it) and a boolean in the internal `Editor`
(`useDashboard.ts:~60,85`). Callers see the first two. Later: yes. Smallest: rename the function to
`openCatalogue` (beside `edit`/`done`/`cancel`, the others are verbs). Size S. Breaks a caller.

**D4. `defaultView` / `initialView` do not follow React's pair.** `defaultView` is the app's arrangement
(`reset` goes to it), `initialView` is the reader's kept one, read once (`useDashboard.ts:~20-32`); in React's
vocabulary `default*` is the initial value. The docs say so ("as React ignores a changed `defaultValue`"), but a
reader meets the inversion. Later: yes, a rename is a major. Smallest: none, or rename `defaultView` to
`fallbackView`/`presetView`. Size S. Breaks a caller.

**D5. `WidgetType` is exported twice**: top-level (`index.ts`) and as a typed member of `DashboardParts`
(`WidgetType: typeof WidgetType`). Same function; the hook's one is for the type inference of options. Later: removing
either is a major. Smallest: say in the docs which is the one to use. Size S.

### Calculation

**C1. The `Result` is not a prop: `emphasis`/`rule` "Not on the Result" is prose only.**
`elements.tsx` `QuantityProps.emphasis` and `rule` are accepted on every element, including the outermost
quantity; the doc says they are ignored or not allowed there. Not checked at runtime in what was read. Later:
no (tightening to a warning is not a type break; narrowing the type would be). Smallest: warn once in dev, as
`dev.ts` already does. Size S.

**C2. `asOf`/`ages` here vs `freshness` and `Date|number|null` in alarms** - see A1 (the side that stays is core's).

**C3. `metrics` restrictions are a runtime failure, not a type.** `model.ts:86` ("a calculation with metrics only adds
and subtracts"), `Reader.tsx:28`: `Product`, `Quotient`, `Times`, `DividedBy`, `target` and `limits` are accepted
by the types and fail or are ignored with metrics on. Later: a tighter type later is a break; today's runtime error
is the contract. Smallest: leave and freeze as documented. Size S (docs), L if typed.

**C4. `format?: "percent"` is a one-member union**, deliberate room for growth; `unit` and `decimals` are plain. Adding
members later is not a break for callers. Mention only.

**C5. Operators as `(props) => null` consts that throw when rendered outside `<Calculation>`** (`elements.tsx:~95-140`).
Intended (ADR-0027). The server-component hazard is documented in the file header; the README/API.md says only
"Calculation — a derivation..." Docs. Size S.

## The five that matter most

1. **A1 - `freshness` vs `ages`, and `asOf` with and without `null`/`Date`** across alarms, calculation and core. Breaks a caller (rename). S.
2. **A3 - alarms' projection and input are the table's types**: its freeze must be decided with ticket 06's model group; narrowing breaks a caller. M.
3. **A2 - `lifecycleAt` promised by the 0.47 changelog, not exported** (and `API.md` therefore silent). No break; settle before the first 1.0 `API.md`. S.
4. **D2 - dashboard `API.md` lists no props for `Dashboard`, `WidgetContent`, `WidgetFormProps`, `HeadingOptions`**; a freeze of an undocumented surface. No break. S.
5. **D3/D4 - `catalogue` doing two jobs and `defaultView`/`initialView` inverting React's meaning**; both are renames. Break a caller. S each.

Marked as breaking: A1, A3 (if narrowed), A4 (if renamed), D3, D4. Not breaking: A2, A5 (docs and parameter names), D1, D2, D5, C1-C5.
