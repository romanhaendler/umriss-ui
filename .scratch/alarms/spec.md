# Alarm management comes back, as a package of its own

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, tickets "Alarm management: where it lives and which ADR
carries it" (09), "Alarm management: priorities, acknowledge-all, wording, sound, time and shortcuts" (10) and
"Alarm management: the standards claim and the slices of the first version" (11) - their Answers hold every
decision below; the requirements `.scratch/alarm-management/requirements.md` (parts A and B); facts in
`docs/research/after-shakedown/isa-18-2-and-eemua-191.md` on the local branch
`research/isa-18-2-and-eemua-191`; findings `.scratch/shakedown/operator-screens.md` (wishes and 4),
`audit-family.md` 2 and 6; the code removed in `e027d1f7` (read it at `e027d1f7^`); the withdrawn ADR-0009 and
ADR-0057; ADR-0023, ADR-0035, ADR-0010.

## Problem Statement

A control-room developer builds an alarm list and a banner on umriss, and has to write the alarm system's
states first.

- **umriss had it and removed it.** Until 0.34 the table carried `AlarmList` and its model: one lifecycle field
  with four values, a second field for snoozed, suppressed and disabled, a snooze that always ends, flood and
  chatter marked and never suppressed, acknowledgement and snoozing as intents the application applies. It left
  for lack of contact with control rooms; about 1,100 lines of code and 1,100 of tests stand at `e027d1f7^`.
- **The shakedown's operator-screen developer wrote it again** in about 80 lines (a state machine, a virtual
  table, a shelve Modal, an acknowledge-all ConfirmDialog, a sticky Alert) and asked for it back. It is the
  audience umriss is built for, and nothing else in the workspace offers it.
- **What the old code lacked for a control room:**
  - a banner that shows the worst unacknowledged alarm on every screen;
  - four priorities with a mark that is not colour alone (it had three badges);
  - first-out, and the flood as a rate;
  - shelving in the operators' words ("snoozed" on screen);
  - acknowledging what the operator sees, not the selection only;
  - a sound cue for a new alarm;
  - single-key acknowledgement;
  - announcements that stay quiet in a flood.
- **Two table gaps the list needs:**
  - A `Date` column shows minutes only, and an alarm's time needs seconds.
  - In grid mode, a selected row is a checkbox and a data attribute: a screen reader hears no selected row.

## Solution

A seventh published package, **`@umriss-ui/alarms`**, on `@umriss-ui/core` and `@umriss-ui/table`. Nothing
depends on it. One new ADR supersedes ADR-0009 and ADR-0057, keeps their boundary and adds what is new.

- **The library owns what happens to an alarm after it is raised.** That is its lifecycle, its order, its
  marks (flood, chatter, first-out), the counts, the list and the banner, the flows (acknowledge, shelve,
  unshelve) as reported intents, the announcements and the visual encoding.
- **The application owns everything that decides:** generation and thresholds, who may acknowledge or shelve
  and for how long, the audit trail and persistence, sound output, the clock, suppression by design, and the
  priority of each alarm type.
- **The first version is built in slices on the restored code:**
  - the restored model and list, unchanged in behaviour;
  - four priorities and the `PriorityMark`;
  - shelving in ISA's words;
  - `AlarmBanner`;
  - first-out and the flood rate;
  - the keyboard and quiet announcements.

  Two small table changes come first where a slice needs them. The package goes to npm once, after the last
  slice. `docs/standards.md` then claims the ISA-18.2 state model, narrowly, and no conformance.

## User Stories

1. As an operator, I want to see the highest-priority unacknowledged alarm from across the room on every
   screen, so that I know what to act on first.
2. As an operator, I want each priority shown by a shape, a number and a colour, so that I tell them apart in
   a dark room, in forced colours and if I am colour-blind.
3. As an operator, I want an unacknowledged alarm's mark to flash and to stay steady once I acknowledged it, so
   that I see what still waits for me.
4. As an operator who has asked for reduced motion, I want the mark steady with a marker instead of a flash, so
   that the screen does not move.
5. As an operator, I want to acknowledge one alarm, so that I confirm that I recognised it.
6. As an operator, I want "acknowledge all" to take the alarms I selected, or the alarms in view, and to name
   how many, so that I never acknowledge an alarm I have not seen.
7. As an operator, I want an alarm that arrives while the confirmation is open left unacknowledged, so that my
   confirmation means what I saw.
8. As an operator, I want an alarm that came and went before I saw it to stay, marked as returned, until I
   acknowledge it, so that a fleeting alarm is not lost.
9. As an operator, I want to shelve a nuisance alarm with a reason from my plant's list and a duration, so that
   it stops calling me without being forgotten.
10. As an operator, I want a shelved alarm that is still in alarm when its time runs out to come back
    unacknowledged, and the banner to count it again, so that I see it return.
11. As an operator, I want to read "shelved", "suppressed by design" and "out of service" on screen, in English
    and German, so that the screen speaks the words of my training.
12. As a shift lead, I want each shelved alarm to show until when, by whom and why, so that I can hand over.
13. As an operator, I want a flood marked with its rate, and the first alarm of a trip marked first-out, so that
    I start from the cause.
14. As an operator, I want every alarm of a flood kept in the list, so that the library never decides what I
    may not see.
15. As an operator, I want an alarm's time to the second, so that I see the order the first-out mark claims.
16. As an operator, I want the alarm I focused to keep focus while new alarms arrive and the list re-sorts, so
    that I can finish what I started.
17. As a keyboard operator, I want `A` to acknowledge the focused alarm, Shift+A to acknowledge the selection
    or the alarms in view after a confirmation, `S` to open shelving and Space to select, so that I work
    without a mouse.
18. As an operator typing elsewhere on the screen, I want those single keys to act only while the list has
    focus, so that a letter in a field never acknowledges an alarm.
19. As a screen-reader user, I want the list to say one number at most every two seconds, so that a flood does
    not drown the reader.
20. As a screen-reader user, I want the banner to interrupt me only when a new alarm of higher priority than
    the one shown arrives, never for a count, so that an interruption means something.
21. As a screen-reader user, I want a selected row to be announced as selected and the selection's count to be
    said, so that I know what "acknowledge all" will take.
22. As an operator, I want the list and the banner to keep their alarms and say "no connection" when the data
    is stale, so that a dead line never looks like a quiet plant.
23. As an application developer, I want a callback when a new unacknowledged alarm appears and when the last
    one is gone, carrying the priority, so that my application plays its own horn and silences it.
24. As an application developer, I want the library to read no clock and keep no timer, so that a shelve ends
    by the time I hand in and my tests are deterministic.
25. As an application developer, I want every operator action reported as an intent that I apply or refuse, so
    that authorisation and the audit trail stay mine.
26. As an application developer, I want four fixed priority levels, so that I map my plant's three or four
    without a type parameter on every part.
27. As an application developer, I want to name a group (a trip) and a sequence number on my alarms, so that
    first-out is right when timestamps collide.
28. As an application developer, I want a `Date` column in any table to show seconds by a format name, so that
    I need no cell renderer for a timestamp.
29. As an application developer, I want the model, the list, the banner and the mark in one package with one
    page set, so that I find alarm management in one place.
30. As an application developer, I want 1,000 standing alarms updated every second to keep focus, selection
    and scroll, so that the list holds on a real plant.
31. As the maintainer, I want the restored code to come back unchanged in behaviour and green before any change,
    so that every change is reviewed against a known baseline.
32. As the maintainer, I want `docs/standards.md` to claim only what the tests hold, so that the claim cannot
    run ahead of the code.

## Implementation Decisions

- **The package.**
  - `@umriss-ui/alarms` is set up as the dashboard was: a manifest with `exports` (main entry and
    `styles.css`), `files`, `sideEffects`, `check:dist`, `prepublishOnly`; a Vite build with the client
    directive; `props` writing its `API.md`; a demo in the shared shell (ADR-0020) on port 4179.
  - Peers are `@umriss-ui/core` and `@umriss-ui/table` (`workspace:^`), React 19.
  - Its version is the workspace's one number, and it moves with the others at each release.
  - It imports only the public entries of core and table, which the lint holds. Nothing in the workspace
    imports it, and the lint holds that too.
  - It joins every list of packages: check, lint, visual configuration, quick visual check, changelog
    script, the shell's package list and title map, the launch configuration, `CONTRIBUTING.md`, and the
    dependency map in `CLAUDE.md`.
  - It joins the publish list and the front page only at the first release. That release is published by
    hand first, because npm gives no Trusted Publisher to a package that does not exist yet
    (`docs/releasing.md`).
- **The restore (B.1).** Model, list, CSS, tests, the eight example pages and the scenario "Work through the
  alerts" come back as they stood at `e027d1f7^`. "Unchanged" means behaviour and tests, with three mechanical
  moves:
  - **Import paths** move to the public entries of core and table.
  - **Table exports its pipeline.** `alarmModel` calls the table's pure `tableModel` (filter, sort, page over
    rows and model columns), which never left the table's internals. Table now exports `tableModel` and
    `TableProjection` from its main entry, with JSDoc, so they get their entry on table's API index
    (ADR-0044). The types it already exports (`ModelColumn`, `TableInput`, `SortLevel`) are unchanged.
  - **The 35 wording keys** come back into core's `Wording` and `GERMAN_WORDING`, in a section of the alarms
    package, as the table's, the schedule's, the dashboard's and the calculation's entries stand there. One
    provider switches every package. They get their final names now, each with the prefix `alarm` as the
    other packages' keys carry theirs. No key is renamed after a release, which the upgrade promise would
    make a deprecation. Identifiers keep the general words (snooze, disabled, suppressed); only texts change
    later.
  - The CSS's private custom properties take the package prefix (`--_alarms-`), as the style guard asks.
  - If the table's API moved since 0.34 in a way the list touches, the list follows with the smallest change,
    and the test that proves the behaviour stays as it was.
- **Priorities.** `Priority` becomes four fixed named levels: `"critical" | "high" | "medium" | "low"`, most
  urgent first, in the order of `PRIORITIES`.
  - It is a different scale from a limit's Severity, on a different object (ADR-0006).
  - An alarm of an unknown type stays `"high"`, the level it had: it must not slide down, and "critical" is
    kept for what the application rationalised as such.
  - "Diagnostic" (not annunciated) comes later, under that name.
- **`PriorityMark`.** A small exported component, used by the list and the banner.
  - A distinct shape per level: a diamond, a triangle, a square and a circle, from 1 to 4. The shapes differ
    by outline, so they hold in forced colours and greyscale.
  - The level's number inside the shape, and a colour from a token per level. Defaults: red, amber, yellow,
    blue, each with the number at AA and the shape at 3:1 against the surface, in light and in dark.
  - Its name is "Priority 1, critical" from the wording.
  - The mark of an active, unacknowledged alarm in service flashes at 1 Hz: a CSS animation whose duration is
    a token. It is steady once acknowledged. A returned, unacknowledged alarm is steady and carries its word.
  - Under reduced motion, the flash becomes a steady ring. An application turns the flash off with the token
    (ADR-0045).
  - 1 Hz is umriss's choice; no source gives a rate.
  - A shelved, suppressed or out-of-service alarm's mark is neutral, its number kept.
- **Wording in ISA's words.** On screen and in speech, English and German say what the operator was trained
  in. This is a partial exception to ADR-0035, for this package only, recorded in the new ADR. The API keeps
  its general names.

  | Concept | API | English | German |
  |---|---|---|---|
  | Snoozed | `"snoozed"`, `snooze()` | Shelved, Shelve, Unshelve | Zurückgestellt, Zurückstellen, Zurückstellung aufheben |
  | Suppressed | `"suppressed"` | Suppressed by design | Durch Auslegung unterdrückt |
  | Disabled | `"disabled"` | Out of service | Außer Betrieb |
  | Hidden (the count) | `isHidden`, `hiddenAlarms` | Suppressed or shelved: 3 | Unterdrückt oder zurückgestellt: 3 |
  | Active / resolved | `"active-…"`, `"resolved-…"` | In alarm / Returned | Gekommen / Gegangen |
  | The four states | the lifecycle | In alarm, unacknowledged; In alarm, acknowledged; Returned, unacknowledged; Returned, acknowledged | Gekommen, unquittiert; Gekommen, quittiert; Gegangen, unquittiert; Gegangen, quittiert |
  | The list's name | | Alarms | Alarme |

  "Suppressed or shelved" is OPC UA Part 9's umbrella (`SuppressedOrShelved`). The German state words are the
  control-room usage of "gekommen / gegangen / quittiert".
- **Shelving.**
  - **The panel.** The list's "Shelve" offers the application's durations and its reasons. The new
    `snoozeReasons` is a list of strings shown as choices; a free-text field takes a reason not on it. With
    `snoozeReason="required"`, one of the two must be given.
  - **What it reports.** `onSnooze(ids, until, reason)`, with `until` counted from the view's as-of time, as
    before. Only alarms in service or already shelved are reported (ADR-0057's rule).
  - **Re-annunciation** (A6.4). An alarm whose shelve ended at or before the as-of time, and which is still
    active, is projected as active and unacknowledged. It counts for the list's number, the banner and
    `onAnnunciate`, and `acknowledge` acknowledges it.
    - One derived reading serves the projection, `countAcknowledgeable` and `acknowledge`, so the number named
      and the action cannot drift.
    - A manual unshelve keeps the lifecycle underneath.
    - It is one vendor's reading (Elipse), taken because a shelve exists so that the alarm is not forgotten.
- **`AlarmBanner`.** An exported component, taking the projection of an unfiltered `alarmModel` (so that a
  filter in the list never hides the worst alarm from the banner), and `asOf` and `freshness` as the list does.
  - **What it shows.** The worst active, unacknowledged alarm in service: its `PriorityMark`, its type and
    its time. Then the count of such alarms per priority, "n more", and the flood when one is marked.
  - **What it reports.** "Acknowledge" reports that one alarm through `onAcknowledge([id])`; "Open list"
    calls `onOpen`. It applies nothing.
  - **Its landmark.** One named region. A visually hidden element with `role="alert"` changes its text only
    when a new active, unacknowledged alarm of a higher priority than the one shown arrives; a count change
    never does.
  - **A stale or lost source** keeps every alarm counted and shows its freshness. Without alarms and with a
    lost source it says that the connection is down, never "No alarms".
  - **`onAnnunciate(event)`.** `{ kind: "new", priority }` when an alarm appears active, unacknowledged and in
    service that was not so in the previous projection, carrying the highest priority among them. A
    re-annunciated shelve counts as new. `{ kind: "cleared" }` when the last such alarm is gone. The
    reminder horn and the silence button are the application's. The banner derives events by comparing
    projections, with no timer.
  - Sticky placement is the host's layout.
- **First-out and the flood rate.**
  - **First-out.** An `Alarm` may carry `group` (the application's trip or unit) and `sequence` (its order
    where timestamps collide). The row's `firstOut` marks, per group, the alarm with the earliest `raised`,
    ties broken by the lower `sequence`, among the alarms the model is given. That is the standards' sense:
    the first of a group or a trip.
  - **The flood** gets `first`, the earliest of the flood by the same rule. On screen it is "first in the
    flood", worded as umriss's extension, not as first-out.
  - **The rate.** The projection gains `rate`, the alarms raised in the last ten minutes before the as-of
    time. The flood badge names the count and the window.
  - **The rule** stays the caller's (`flood: { windowMs, atLeast }`). The documentation gives ISA-18.2's
    reference: more than 10 alarms in 10 minutes per operating position is `{ windowMs: 600000, atLeast: 11 }`.
    The application passes one operating position's alarms.
  - **Time to the second.** The list's "Raised" column shows seconds, through the table's new date format.
- **The table's `Date` column with seconds.** `DateFormat` gains `"timeWithSeconds"` and
  `"dateTimeWithSeconds"`. They map to core's existing `formats.time(d, true)` and `formats.dateTime(d, true)`,
  so an application's own formats still apply, wherever the column writes its value as text. Exports keep raw
  values (ADR-0061).
- **The table's selection, heard.** In grid mode with a selection, the grid carries
  `aria-multiselectable="true"` and each selectable row `aria-selected`. A change of the selection is said
  through core's `announce` ("3 selected"). A native table keeps its checkboxes, which already say it.
  Announcing sort, page and export stays with the table's own wishes.
- **The list at flood volume.**
  - It stays a native, non-virtual table.
  - The slice measures one update of 1,000 rows and 100 types in a production build. If an update takes
    longer than 50 ms, that is recorded under the ticket's Comments: virtual rows, and the virtual grid's
    focus drop (`audit-family.md` 2), then become a ticket of their own.
- **Acknowledge what is seen.**
  - **What it takes.** "Acknowledge all" takes the selection, or, without one, the rows rendered inside the
    list's visible area. It never takes the filtered set as such. This is umriss's own rule; no source states
    it.
  - **When the ids are fixed.** When the confirmation opens. An alarm arriving afterwards is not acknowledged.
  - **The confirmation** is core's `ConfirmDialog` and names the count: "Acknowledge 12 alarms in view" or
    "… selected".
- **Keyboard.**
  - The list renders its table in grid mode: one tab stop and the arrow keys.
  - Space selects (the table's own key). `A` acknowledges the focused cell's alarm. Shift+A opens the
    acknowledge-all confirmation. `S` opens shelving for the focused alarm, or for the selection when there
    is one. Escape closes what is open.
  - The single keys act only while focus is inside the list (WCAG 2.1.4). There is no remapping.
  - The list finds the focused alarm through the row it rendered, with no new table API. If the grid turns
    out to swallow these keys, that is recorded under the ticket's Comments before any table change.
- **Announcements.** The list's live region stays polite and says one number. Its text changes at most once
  every two seconds of the view's as-of time, and the host's next tick delivers the last change. There is no
  timer, by decision 7 of map ticket 10. Assertive speech is the banner's alone.
- **The root contract.** Every component of the package takes the shape `.scratch/root-contract/` sets for
  its kind: rest props and an element ref on the root, and `aria-label` by that name. If that spec has not
  landed when a component is written, the component takes core's principle 1 as it stands.
- **The standards claim.** `docs/standards.md` gains an ISA-18.2 section, written last, with the wording of
  map ticket 11's Answer:
  - a table of ISA's terms and umriss's names;
  - umriss's own rules as departures: acknowledge what is in view, the 1 Hz flash, first in the flood;
  - no latched states;
  - the sources S1, S7, S10 and S16 of the research.

  The dead Tatsoft link is replaced.
- **ADRs.**
  - One new ADR, the spec's first ticket, with its text in that ticket. It supersedes ADR-0009 and ADR-0057,
    and both are marked superseded by it.
  - ADR-0035 gets a pointer line for the wording exception.
  - The rest is commit messages.

## Testing Decisions

- A good test here asserts what an operator sees and what the application receives. That means rows, words,
  roles, names, the ids an intent reports, and the order. It never asserts internal class names or module
  state. Model tests write their expected values as literals from the rules, not computed by the module, as
  the restored tests do.
- **The baseline.** The restored suites: `alarmModel`, `availability`, `alarmList`, the snooze reason and the
  public-entry guard. They run green before any change; each later slice changes a test only where its
  decision changes the behaviour.
- **Model** (pure, with as-of times as literals):
  - the four priorities in order;
  - re-annunciation at, before and after `until`, for active and resolved alarms, manual against expired;
  - first-out per group, with ties by sequence;
  - the flood's `first` and `rate` at the window's edges;
  - 500 alarms over ten ticks of one second, with none lost and the flood marked at the first tick past the
    threshold.
- **Components** (jsdom, Testing Library, through the package's public entry):
  - the mark's name and its state per lifecycle and availability;
  - the banner's worst alarm, its counts, its intents, its alert only on a higher priority, and
    `onAnnunciate` per transition;
  - the shelve panel's reasons, and what it reports;
  - acknowledge-all with ids fixed at opening, and an arrival afterwards left out;
  - the keys only with focus inside;
  - the live region's text over as-of times two seconds apart;
  - focus kept on an alarm across a re-sort and a new critical alarm.
- **Table:** the two date formats in a cell and in a filter's text, English and German. In grid mode,
  `aria-selected`, `aria-multiselectable` and the announced count, held by the existing table suites'
  patterns.
- **Demo:** the shell's checks run on the alarms demo as on every demo: pages, own data, own base,
  accessibility, forced colours, large text, silent pages. Screenshots are light and dark, with the clock
  frozen as table's suite did for the old list. The mark's shapes are photographed in forced colours.
- **Scale:** the measurement of 1,000 rows is a recorded number in the ticket, not a gate.
- **Prior art:** the restored tests at `e027d1f7^`; the dashboard's setup as the newest package (its
  `tests-unit` guards: styles, wording, glyphs, SSR, demo smoke); table's grid-key tests.

## Out of Scope

- **Generation:** limits, dead bands, on-delay and off-delay (`alarmFilter` is never built), scan rates, and
  suppression-by-design logic. The application's, by the ADR.
- **Authorisation, the audit trail, persistence, "who" on an acknowledgement, and limits on shelve length.**
- **Sound inside the library**, a reminder horn, and a silence button. The application's, through
  `onAnnunciate`.
- **Latched states**, and a remapping API for the keys.
- **Later, each its own spec when taken:**
  - the chatter and fleeting analysis views (the chatter mark stays);
  - a summary or KPI component;
  - the journal view, with 10,000 history rows;
  - the handover report;
  - the "diagnostic" level.
- **Offering out-of-service or enable from the list** (ADR-0057's line). They are shown, not offered.
- **Data quality** (good, uncertain, bad) on an alarm's value, in this first version. It is core's, specified
  in `.scratch/data-quality/` with an ADR of its own; freshness (ADR-0010) is what the list shows. When the
  list takes it later: the alarms package declares neither the `Quality` type nor its words, an alarm on a
  bad value keeps its state and count, and the list and banner say the quality beside the freshness. The
  alarms ADR names the quality ADR among its related decisions.
- **Virtual rows and the virtual grid's focus drop**, unless the measurement asks for them.
- **The table's other silent changes:** sort, page, export, and `aria-colcount`.
- **An epoch number in a `Date` column.** Map ticket 18 decides its warning.

## Further Notes

- The norm texts of ISA-18.2, IEC 62682 and EEMUA 191 were not read, and ISA forbids putting them into AI tools.
  A clause number needs a person with a licensed copy. The spec and its tickets name none.
- The flood threshold is ISA-18.2's (more than 10 in 10 minutes per operating position), not EEMUA's. "Three
  or four priorities" is credited to ISA-18.2. A shelve's reason traces to IEC 62682.
- If the root-contract, test-runners, server-components or upgrade-promise specs land before a ticket here,
  the ticket follows them for the new package, the way their tickets bring the other packages along. For
  example, a consumer test in both runners, a "use client" paragraph in the README, and peers in the form
  that spec sets.
- New demo pages must pass the shell's page rules, and a fresh worktree needs `pnpm install` and `props` per
  package before the checks run.
