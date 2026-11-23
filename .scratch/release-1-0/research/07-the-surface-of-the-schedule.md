# 07 - The surface of `@umriss-ui/schedule`

Research for ticket 07. Candidates only, no decision. Paths are relative to `packages/schedule/` unless stated.
"Breaks" = the fix changes what a caller writes or types (goes to the maintainer). "Costs a major later" = yes if
the shape is frozen at 1.0 and changed afterwards; loosening a type or adding an optional field never costs one.
Sizes S/M/L. Version read: 0.56.0.

## Read

`API.md` (all), `src/index.ts`, `src/model.ts`, `src/appearance.ts`, `src/findings.ts` (types and signatures),
`src/ripple.ts`, `src/shiftTask.ts`, `src/snap.ts`, `src/view.ts`, `src/parts.tsx`, `src/useSchedule.ts`,
`src/Schedule.tsx` (props and destructuring, lines 1-320), `src/sceneGestureTypes.ts`, the type declarations in
`src/sceneData.ts` (`ScheduleTooltipTarget`) and `src/sceneView.ts` (`ScheduleHit`), the head of `src/timeAxis.ts`,
`src/refusal.ts` (head), `demo/outline.ts` (head), `demo/unshown.json`, one demo example
(`Selection/02-control-the-selection.tsx`), `package.json` (exports, peers), `CHANGELOG.md` (grep for
deprecations), `CONTEXT.md` section "The schedule", and for comparison `packages/{charts,table,core}/API.md` and
`packages/charts/src/view.ts`.

## Not read

`scene.ts`, `sceneDraw.ts`, `sceneGestures.ts`, `sceneKeys.ts`, `sceneMarks.ts`, `geometry.ts`, `rows.ts`,
`walk.ts`, `context.ts`, `DataTable.tsx`, `ScheduleTooltip.tsx`, the CSS, tests, `tests-consumer`, and 33 of the
34 demo example folders. Behaviour was therefore **not** checked against doc sentences at runtime; the doc-vs-
behaviour findings below are doc-against-type (and doc-against-doc) only. The generated `docs/llms-full.md` and
`llms.txt` do not exist in this worktree (`.gitignore:19` keeps `packages/*/docs/llms-full.md` out), so the full
prop tables could not be compared with `API.md`.

## Already clean

- No deprecated alias is alive: `grep -rni "deprecat\|ScheduleHandle\|ariaLabel" src` finds nothing. The handle
  ref and `ariaLabel` were removed in 0.44 (`CHANGELOG.md:145-147`).
- Every name exported from `src/index.ts` (52) stands in `API.md`, and nothing in `API.md` is missing from the
  index (checked by script over both files). Nothing exported is undocumented in source; internal types
  (`GhostSummary`, `Spoken`, `ScheduleSnapshot`, `overlapDepth`) are not exported.
- The three controlled/uncontrolled pairs that exist follow the hook family: `initialView`/`onViewChange`/
  `setView` read the same as charts' and table's, including the "read once, like `defaultValue`" and "not
  reported for `setView`" sentences. `scrollToLane`/`scrollToSubtask`/`focusSubtask` return `boolean` as the
  table's `scrollToRow`/`focusCell` do. `folded`, `toggleGroup`, `foldAll`, `unfoldAll` match the table's
  `folded`, `toggleFold`, `foldAll`, `unfoldAll`.
- `canMoveTo` is asked about a dragged-in item under the caller's own key, not the internal sentinel
  (`src/sceneGestures.ts:667-680`), so no `"\u0000placing"` id reaches a caller.
- All times are epoch milliseconds in every type; the pure functions take their arguments in one order
  (`subtasks`, `dependencies`, `blocked`/`intent`).

## `API.md` against what it says it lists

Header: "every export, and the props, options and returns of each component and hook". Verified by grep:

1. **No component props at all.** `grep -n "laneHeight\|onIntent\|canMoveTo\|headerWidth\|zoomLimits\|selectedTask\|placing" API.md`
   returns nothing. The file has `## Hooks`, `## Functions`, `## Types` and `## Options and returns` with
   `### useSchedule` only; there is no `### Schedule`, `### Lane`, `### LaneGroup`, `### Subtasks`,
   `### Dependencies`, `### BlockedTimes`, `### Milestones` with a `#### props` section (the table's `API.md` has
   them for `Toolbar`, `Search`, `Pagination` ...). The 22 own props of `Schedule` (`src/Schedule.tsx:64-179`)
   are named nowhere; only `Schedule: (props: ScheduleProps) => ReactNode` at `API.md:77` points at them.
2. **The `*Props` types list no fields.** `grep -v "\["` over the Types section shows `ScheduleProps`, `LaneProps`,
   `LaneGroupProps`, `SubtasksProps`, `DependenciesProps`, `BlockedTimesProps`, `MilestonesProps` as one sentence
   each with no `[...]` field list, unlike `Subtask` or `Dependency`. So `data`/`tasks` of `Subtasks` and `id`/
   `label` of `Lane` also appear nowhere. (`ScheduleProps` is an intersection with `HTMLAttributes`, which the
   generator probably cannot expand; `LaneProps` is a plain interface and still has none, so the *Props types are
   skipped by rule or by the hook-only outline.)
3. **Union members are not listed.** `Intent`, `IntentKind`, `ScheduleHit`, `SubtaskAppearance`,
   `DependencyRoute`, `DependencyAttachment`, `DependencyEnds` are one sentence each with no values; the values
   `"provisional" | "fixed" | "muted" | "open"`, `"curve" | "straight" | "orthogonal"`, `"centre" | "nearest"`,
   `"dot" | "none"` and the hit kinds are only in source (`src/appearance.ts:13`, `src/model.ts:127,136,141`,
   `src/sceneView.ts:36-41`). A reader of `API.md` alone cannot write `appearance: [...]`.
4. **Fields carry no types or defaults.** Interface fields show only names in brackets
   (`Subtask [id, task, lane, from, to ...]`); only `ScheduleOptions`/`ScheduleParts` show types and doc
   sentences, and these only because they are the hook's options and returns.
5. **`ScheduleHit` is the one exported data type with neither fields nor member list** (`API.md:50`).
6. `Lane`, `LaneGroup`, `Subtasks`, `Dependencies`, `BlockedTimes`, `Milestones` appear in the returns as
   `typeof Lane` etc. with no sentence (`API.md:78-83`).

Candidate (all S, no caller breaks): give the generator a `### Schedule` / `### Lane` ... props section as the
table has, list union members, say so in the header. Not a major if left, but 1.0 documentation is the promise.

## Findings

### A. Names

**A1. `from`/`to` mean times in six types and subtask ids in two.** `Subtask.from/to` (`src/model.ts:32,34`),
`MoveIntent`, `StretchIntent`, `PlaceIntent`, `BlockedTime`, `Overlap`, `InBlockedTime` are instants;
`Dependency.from/to` (`src/model.ts:97,99`) are subtask ids, and `ScheduleTooltipTarget` (dependency variant)
`from`/`to` are `Subtask` objects (`src/sceneData.ts:290-293`). One key, three types. `CONTEXT.md` ("Dependency",
"Violated dependency") already speaks of predecessor and successor. Costs a major later (a dependency is plain
data the caller holds and stores). Smallest change: `Dependency.from/to` -> `predecessor/successor` (or
`fromSubtask/toSubtask`), the tooltip's likewise; `ViolatedDependency.dependency` stays. **Breaks.** M (types,
`ripple`, `findings`, demos, the German wording unaffected).

**A2. Same field name, id in one type and object in another.** `InBlockedTime.subtask`/`.blocked`
(`src/findings.ts`, ids) against `ScheduleTooltipTarget.blocked: readonly BlockedTime[]`
(`src/sceneData.ts:275`, objects); `ViolatedDependency.dependency` (id) against the tooltip's and hit's
`dependency` (object); `Subtask.task` (id) against tooltip `task: Task | undefined` (object); intents' `subtask`
(id) against `ScheduleHit.subtask` (object). The tooltip also calls overlaps `overlapping` where the finding is
`overlaps`, and blocked time `blocked` where the finding is `inBlockedTime`. Costs a major later (tooltip target and
hit are what a caller's render function destructures). Smallest change: one rule for the whole surface, either ids keep the bare noun
and objects get another name (`subtaskRecord`), or objects keep the noun and ids end in `Id` (`subtaskId`).
**Breaks.** M. Maintainer picks the rule.

**A3. `ResolvedAppearance` fields name the old drawing, not the statement.** `{ dashed, hatched, muted, open }`
(`src/appearance.ts:19-33`); the doc admits "Two of the field names (`dashed`, `hatched`) are older than the
drawing" and that `hatched` is "not a hatch". `CONTEXT.md` ("Appearance") says a hatch means a lane is not
available and "only during a Refusal". Names that contradict the glossary on an exported type. Costs a major
later. Smallest change: `{ provisional, fixed, muted, open }`, one word per `SubtaskAppearance` member. **Breaks**
only callers who read the resolved object (a custom legend); `resolveAppearance` is exported for exactly them. S.

**A4. `name` and `label` split without a rule.** `Task.name`, `Subtask.name` (`src/model.ts:19,40`) against
`BlockedTime.label`, `Milestone.label` (`:70,88`), `Lane.label`/`LaneGroup.label` (`src/parts.tsx:17,38`, a
`ReactNode`), and `Schedule.label` (`src/Schedule.tsx:159`, a *function* from subtask to text). Four meanings of
`label` on one surface: text on a record, node on a part, header text, and a render function; a reader cannot tell
`<Schedule label>` from `<Lane label>`. Costs a major later. Smallest change: `Schedule.label` -> `barLabel`
(glossary term **Bar label**, `CONTEXT.md`), and decide `name` vs `label` for records (the demo mixes them:
vehicles are `{ id, label }`, tasks `{ id, name }`). **Breaks.** S for `barLabel`, M for the record rule.

**A5. Dependency presentation fields collide with the anchors.** `route`, `attach`, `ends` on `Dependency`
(`src/model.ts:111-122`) and on `Schedule` (`src/Schedule.tsx:135-153`) sit beside `leaves`/`arrives`; the doc has
to warn "not to be confused with the two anchors" and `DependencyAttachment` carries a paragraph on why it is
"deliberately not called an anchor". `ends` ("dot" | "none") reads as the two ends that `from`/`to` name. Costs a
major later. Smallest change: `ends` -> `endMarks` (or `dots: boolean`), keep `route`; `attach` could stay. The
glossary's own umbrella word is **Route** (`CONTEXT.md`), so a single `route: { shape, attach, ends }` object is a
larger alternative. **Breaks.** S for `ends`, L for the object.

**A6. The tooltip is a prop here and a component in charts.** `tooltip?: false | ((target) => ReactNode)`
(`src/Schedule.tsx:163`) against charts' `<Tooltip render>` (`packages/charts/API.md:213-219`) and its
`onSelect`; `onSelectedTaskChange(task, subtask)` positional (`:128`) against charts' `onSelect(hit)` and table's
`onSelectionChange(keys, all)`. Not wrong, but three shapes for "the user chose something". Costs a major later
only if the maintainer wants one pattern; it is a product call. S-M. **Breaks** if changed.

### B. Shapes

**B1. Selection: a controlled half.** `selectedTask?: string | null` is controlled (`undefined` means
uncontrolled, `null` means none; `src/scene.ts` `setControlledTask`, read via `Schedule.tsx:285-287`), but the
callback reports `(task, subtask)` and the **Selected subtask** (`CONTEXT.md`) cannot be given back, so a
controlled selection loses which leg was clicked; there is no `defaultSelectedTask`, and the selection is not in
`ScheduleView` or `ScheduleOptions`. The demo's own lead says the callback "also names the leg"
(`demo/examples/Selection/02-control-the-selection.tsx:9`) while only half of it can be held. Costs a major later
if the pair becomes `selection: { task, subtask } | null` / `onSelectionChange`. Smallest change: leave it and
document that only the task is controlled (S), or make the selection one value (M). **Breaks** in the second case.

**B2. `snap` is a four-way union.** `"ticks" | number | SnapRaster | false` (`src/Schedule.tsx:96`); the pure
`snapTime` takes only `number | SnapRaster` (`src/snap.ts:24`), so the prop's value cannot be passed to the
function that explains it. `"ticks"` and `false` have no number form, and `"ticks"` is the default, which means the
raster of a drag changes with the zoom (the fine band's step, `src/timeAxis.ts` `fineStep`), so the stored data
depends on how far out the planner was. Costs a major only if the default or the union changes; adding forms later
is free. Smallest change: keep, document the default's zoom dependence (S); or `snap: false | { step, offset? } |
"ticks"` dropping the bare number (M, breaks).

**B3. Booleans against unions in the same neighbourhood.** `now?: boolean | number` (`:167`), `loading?: boolean`,
`tooltip?: false | fn`, `snap?: ... | false`, `ends?: "dot" | "none"` (a two-valued string where `boolean` would
do, and `route`/`attach` are three-/two-valued strings). `ends` is the odd one: every other two-state option is a
boolean. Costs a major later (it is the same field as A5). S.

**B4. `Dependency.lag` is required, its siblings optional.** `lag: number` (`src/model.ts:102`) with the doc
"zero where the successor may begin as soon as the predecessor ends"; making it optional later breaks nobody, so
it costs no major. S, no break. Listed so it is not mistaken for one.

**B5. `onInteraction` swallows the browser menu.** "While it is set, a right-click opens no browser menu"
(`src/Schedule.tsx:118-120`): setting a handler for `"hover"` or `"click"` also removes the context menu, and no
prop says so by name. The doc says it, so no doc-vs-behaviour gap, but it is a coupling a 1.0 caller meets
unannounced. Costs a major later if a `contextMenu` opt-out is wanted (adding an option later is free). S.

**B6. `ScheduleHit.part` is an inline union with no name.** `"leadIn" | "main" | "leadOut"`
(`src/sceneView.ts:37`), also the shape of the glossary's three **parts**. Naming it (`SubtaskPart`) is an addition
and breaks nothing. S.

### C. Types

**C1. Two `ZoomLimits`.** `src/timeAxis.ts:132` and `packages/charts/src/view.ts:25` declare the same
`{ min, max }`; charts' doc calls it "the schedule's shape", and both packages export the name
(`src/index.ts:26`, `packages/charts/src/index.ts:138`). Structurally identical, so mixing them compiles; a change
to one would silently differ from the other. Costs a major later only if they drift. Smallest change: the schedule
re-exports charts' (it depends on it, ADR-0022). Not a break. S.

**C2. A public prop's type comes from another package and is not re-exported.** `calendar?: CalendarInput`
(`src/Schedule.tsx:87`) is charts'; callers `import { workingCalendar } from "@umriss-ui/charts"` themselves.
Charts is a peer (`package.json:77-82`), so this is workable, but `API.md` of the schedule never says where
`CalendarInput` comes from. Costs nothing later if charts stays a peer. S (docs).

**C3. Loose strings that could be checked.** `Task.color: string` (any CSS colour, deliberate, `src/model.ts:17`),
`Subtask.lane/task: string`, `Dependency.from/to: string` and intents' ids are plain `string`. A generic
`Subtask<LaneId, TaskId>` would check them but changes every signature; not recommended for 1.0, and adding generics
with defaults later is not a break. No `any`, no `unknown` found on the exported surface (grep over
`src/index.ts`-reachable declarations read). S to note, L to do.

**C4. `ScheduleProps` requires `aria-label` even with `aria-labelledby`.** `"aria-label": string` is required
(`src/Schedule.tsx:59-62`) while the doc says "the name (`aria-label`, `aria-labelledby`) reaches the figure root
and the plot"; a caller that names the plot by an existing heading must still pass a string, which then
competes with the labelledby. Loosening the type later is not a break. S, no major.

**C5. `ScheduleHit` and `ScheduleTooltipTarget` are unions of inline object types**, so `API.md` cannot list their
fields (see the API.md section) and their `kind` values (`"subtask" | "dependency" | "milestone" | "lane" |
"nothing"` against `"subtask" | "milestone" | "dependency"`) differ without a note.

### D. Doc sentences against the type

**D1. `children` doc is stale.** "`Lane`, `Dependencies` and `Subtasks`, in the order they are to stand and be
drawn" (`src/Schedule.tsx:176-177`) omits `LaneGroup`, `BlockedTimes`, `Milestones` and `DataTable`, all of which
the same file's component doc (`:192-196`) lists. S, no break.

**D2. Tooltip docs leave out milestones.** `tooltip` ("hovered subtask or dependency", `src/Schedule.tsx:160-163`)
and `ScheduleTooltipTarget` ("the hovered subtask or dependency", `src/sceneData.ts:260-261`), while the union has a
`kind: "milestone"` member (`:277-282`). A render function written from the docs would mishandle a milestone hover.
S, no break.

**D3. `useSchedule` returns `view` and `visibleDomain()`.** Two ways to read the span; `view.domain` is absent while
the default is in force, `visibleDomain()` always returns a pair. Documented separately and consistent with charts'
`view`/`domains`; no gap found, noted only so it is not rediscovered. No action.

## Smaller notes

- `IntentKind` and `ScheduleParts` list `leadIn`/`leadOut` by field name against `move`/`stretch`/`lane`/`place`
  by action; consistent with `CONTEXT.md` ("each is changed on its own"). No action.
- `resolveAppearance` returns a four-flag object while `Subtask.appearance` is a list with a later-wins rule for
  `provisional`/`fixed`; the rule is frozen behaviour at 1.0 (changing it would alter drawn plans). Costs a major
  if changed.
- Peer ranges `workspace:^0.56.0` for charts and core move to `^1.0.0` with the release; ticket 13's matter.
- The whole surface has no `@deprecated` tags to remove before 1.0.

## Summary table

| # | Candidate | Breaks | Costs major later | Size |
|---|-----------|--------|-------------------|------|
| A1 | `Dependency.from/to` (ids) vs times; tooltip `from/to` (objects) | yes | yes | M |
| A2 | same field, id vs object; tooltip `overlapping`/`blocked` vs findings | yes | yes | M |
| A3 | `ResolvedAppearance.dashed/hatched` | yes (readers of it) | yes | S |
| A4 | `Schedule.label` (function) vs `Lane.label`, `name` vs `label` | yes | yes | S-M |
| A5 | `ends`/`attach`/`route` beside anchors | yes | yes | S-L |
| A6 | tooltip/selection callback shapes vs charts, table | if changed | product call | S-M |
| B1 | selection only half controllable | if made one value | yes | S-M |
| B2 | `snap` four-way union, zoom-dependent default | if union changes | partly | S-M |
| C1 | two `ZoomLimits` | no | no | S |
| C4 | `aria-label` required with `aria-labelledby` | no | no | S |
| D1, D2 | stale doc sentences on `children`, `tooltip` | no | no | S |
| - | `API.md` has no props, no union values | no | no | S |
