# Alarm management: requirements

Status: draft - input for `/grill-with-docs`, then `/to-spec`
Date:   2026-10-24
Origin: the shakedown persona P6 (operator-screen developer, `.scratch/shakedown/operator-screens.md`) wished for alarm
management; the maintainer removed the old alarm list in `e027d1f7` for lack of touchpoints with control rooms and
wants it back if the need is defined precisely. Part A is the persona's draft, part B the coordinator's review.

**The old code is the starting point:** `git show e027d1f7^:packages/table/src/alarms/alarmModel.ts` (611 lines),
`AlarmList.tsx` (473), `index.ts`, the tests `alarmModel.test.ts` (476) and `alarmList.test.tsx` (518), six demo pages,
35 wording keys; withdrawn ADR-0009 and ADR-0057.

# Part A - the persona's draft


Basis: removed `alarmModel.ts`/`AlarmList.tsx` (e027d1f7^), ADR-0009/0057/0006/0010/0023/0035, my host workaround (`src/alarms.ts`, 23 lines of state plus about 55 of screens). Clause numbers are from memory of ISA-18.2-2016 and EEMUA 191; the norm texts were not read, so the coordinator should verify them.

## A1. Who and what for
Roles: **operator** (acts in seconds, alone, at night), **shift lead** (reviews what was shelved or left standing, hands over), **alarm engineer** (analyses floods, chatter and stale alarms afterwards; configures nothing in the UI).
Jobs:
1. See the highest-priority unacknowledged alarm from across the room, on every screen (banner).
2. Acknowledge one alarm, or the visible set, without acknowledging anything unseen (ISA-18.2 ack means "seen").
3. Find the alarm that matters in a list of 100+ standing alarms: worst first, filter by state, priority, area.
4. See an alarm that came and went unseen (returned-unacknowledged).
5. Shelve a nuisance alarm with a reason and a timeout; see all shelved alarms and when they come back (18.2 states shelving is tracked and time-limited).
6. See that a flood is under way, and which alarm came first (first-out).
7. Know that the alarm's data is not trustworthy: stale or lost source, bad quality.
8. Hand over: list of shelved, suppressed, out-of-service and standing alarms with who/why/until.
9. Afterwards (engineer): top-N most frequent, chattering and stale alarms over a period; alarms per 10 min (EEMUA 191 reference rates: about 1 per 10 min sustained, 10 in 10 min is a flood).
10. Be heard: a sound for a new unacknowledged alarm, silence without acknowledging (the sound is the application's).

## A2. Inventory of the old model
| Old | Verdict | Reason |
|---|---|---|
| `LifecycleState` (4 values, one field), `nextLifecycleState`, fleeting alarm | **keep** | Correct and the best idea in the old code; matches 18.2 normal/unack/ack/RTN-unack. Add "normal" only as absence of an alarm. |
| `Availability` in-service/snoozed/suppressed/disabled as second field | **keep, rename** | Right (18.2 special states are orthogonal to the alarm state). Wording: use the ISA words (shelved, suppressed by design, out of service); operators say "shelved", never "snoozed". The audience argument of ADR-0035 does not hold here; add a wording key, keep the API name if needed. |
| `Snooze {until, by, reason}` with a mandatory end | **keep** | An unbounded shelve is the 18.2 anti-pattern. |
| `availabilityAt(asOf)` with no timer | **keep, plus tick** | Pure and testable. But a wall screen needs the list to re-evaluate: the host ticks `asOf`. Document it. |
| `snooze/unsnooze/disable/enable` transitions | **keep** | Pure; refusing to override the stronger state is right. |
| `ReturnBand`, `hasReturned` (deadband) | **change** | Only half a deadband: raise logic is the app's. Keep as a helper (`alarmFilter`: on-delay, off-delay, deadband), see 4. |
| `Priority` high/medium/low | **change** | EEMUA 191 and most plants use 3 or 4, plus "diagnostic/journal". Make the set a type parameter with 3 or 4 named levels; ADR-0009's two-severity vs three-priority split stays. |
| `AlarmType` catalogue | **keep** | Frequency, chatter, flood are per type. Add `area`, `class`, `consequence` as free text columns. |
| `detectFlood`, `FloodRule`, `Flood` (marked, never suppressed) | **keep, change** | Never suppress: correct. Add first-out and a rate in alarms per 10 min. |
| `frequencyByType`, `ChatterRule` | **keep** | Needed by job 9. |
| `acknowledge`, `countAcknowledgeable` | **keep, change** | Add "acknowledge only these ids" semantics explicitly (no hidden rows). Add who. |
| `alarmModel` projection into the table pipeline | **keep** | Reuse of sort, filter, virtual rows is right; the old sort (availability, priority, unack, newest) is right for operators. |
| `AlarmList` (table, selection, ack and snooze as reported intents, polite one-number live region, hidden alarms drawn neutrally, freshness) | **keep, change** | Intents (ADR-0023/0057) are right: authorisation is the plant's. Missing: banner, counts, keyboard, first-out, virtual rows at flood volume, sound hooks. |
| Snooze reason (`snoozeReason`) | **keep** | 18.2 asks for a reason; make the reason list the app's (a `reasons` prop), free text optional. |
| Hidden alarms drawn neutrally | **change** | Neutral yes, but a shelved alarm that is still active must show a visible "shelved" mark and its return time; "hidden" is the wrong word on screen. |
| No history/journal | **add (later)** | Event journal is the application's; the library shows one it is given. |
| ISA-18.2 claim in standards.md | **drop for now** | Reinstate only as "follows the state model", never "conforms". |

## A3. Boundary
Library owns: state-transition functions (pure), ordering, flood/chatter/first-out marking, counts, list, banner, flows (ack, shelve, return), accessible announcements, visual encoding.
Application owns: **generation and thresholds**, alarm and shelve **authorisation** (who may acknowledge or shelve; the library asks via intents), **audit trail and persistence**, **sound output** (library offers a callback), time source, suppression-by-design logic, rationalisation data (priority, consequence).
I keep ADR-0009's line unchanged. One argued exception: a pure `alarmFilter` helper (deadband, on-delay, off-delay) that the app may call. It generates no alarm; it is opt-in and stateless (previous state is passed in).

## A4. Concepts
- **Normal / Active-unacknowledged / Active-acknowledged / Returned-unacknowledged**: the existing four, with "normal" meaning no row. Modelled.
- **Shelved** (operator, timed, reason), **Suppressed by design** (logic, app writes), **Out of service** (maintenance, app writes). Modelled as availability; displayed; transitions app-applied.
- **Priority**: ordered named levels, 3 to 4 plus an optional non-annunciated "journal". Modelled; mapping from limit severity is the app's.
- **First-out**: the alarm in a flood or trip with the earliest `raised` (ties: the app's sequence number, because timestamps collide). Modelled, displayed. Timestamp precision: milliseconds, display to the second.
- **Flood**: more than N alarms per 10 min per operator (default shape from EEMUA 191: 10); marked, never suppressed. Modelled and displayed as a banner state.
- **Chattering**: same alarm raised at least M times in W; marked per type. Fleeting: raised and cleared within a short time, unseen (the RTN-unack case). Modelled; displayed.
- **Stale alarm**: standing longer than T unacknowledged or acknowledged. Displayed (age); limit T is the app's.
- **Data not trustworthy**: reuses ADR-0010 freshness per alarm row. Displayed; a stale source keeps its alarm state.
- **Deadband, on-delay, off-delay**: helper only (section 3); the list never applies them.

## A5. Parts
- **AlarmList**: in: alarms, types, asOf, selection, `reasons`, shelve durations, flood/chatter rules; out (intents): `onAcknowledge(ids, who?)`, `onShelve(ids, until, reason)`, `onUnshelve(ids)`, `onSelect`. Applies nothing.
- **AlarmBanner**: in: the same projection; shows highest priority unacknowledged alarm, count by priority, "n more", flood state; one tap/key to the list or to acknowledge the shown one; sticky is the host's layout. Out: `onAcknowledge`, `onOpen`.
- **AlarmSummary**: counts by priority x state (active-unack, active-ack, RTN-unack, shelved, suppressed, out of service); pure data function plus small component.
- **PriorityMark**: shape plus colour plus number ("P1"); used by the list, banner and elsewhere.
- **Shelve flow**: reason picker plus duration plus confirmation; returns an intent.
- **Keyboard**: list is one grid; Space toggles select, `A` acknowledges the focused row, Shift+A acknowledges selection after confirmation, `S` opens shelve, `Escape` closes. Remappable.
- **Sound/flash hooks**: `onAnnunciate(event: new-unack | still-unack | cleared)` carrying the highest priority; no audio inside the library. Flash is a CSS state, not an animation by default.
- **Pure model**: `alarmModel`, transitions, `detectFlood`, `firstOut`, `chatterByType`, `alarmFilter`.

## A6. Behaviour and acceptance
1. 500 alarms arrive in 10 s (arrival rate 50/s): none lost (`rows === 500`); flood marked within 1 s of the threshold; the list stays at 60 fps scrolling (virtual); focus on an Ack button keeps its row; screen-reader output is at most one polite update per 2 s.
2. Acknowledge-all acts only on rows in view or selection and says how many ("Acknowledge 12 of 500 shown"); alarms arriving between click and confirm are not acknowledged.
3. An alarm that returns while unacknowledged stays in the list, marked "returned", until acknowledged.
4. Shelve requires reason (if required) and a timeout; shelved alarm returns to unacknowledged-active when time expires and the condition still holds; the banner counts it again.
5. A new P1 while the operator focuses a row neither moves the focused row nor steals focus; the banner changes.
6. First-out: given 40 alarms within 2 s of one trip, exactly one row is marked "first".
7. Stale source: alarm rows keep their state and show stale; the banner does not drop them.
8. Chatter: type with at least M raises in W is marked; no row disappears.
9. Banner on every screen: one landmark, `role="alert"` only on a new higher-priority unacknowledged alarm, never on a count change.
10. Wall display: with root font-size scaled 2x, row height, buttons and priority mark scale together; no clipping at 3840x2160.

## A7. Visual and accessibility
Priority mark: distinct shape per level plus colour plus text; never colour alone (ISA-101, and already in design-language). Colour only for active alarms; shelved, suppressed and out of service are neutral with a word. Flash only for unacknowledged, 1 to 2 Hz, steady after acknowledgement, disabled under `prefers-reduced-motion` (then a steady marker). Dark control room: `color-scheme` follows the host; priority colours must hold AA in both. Wall: tap/click targets at least 44 px in touch density, type scaled by root. Announcements: polite, summarised, rate limited; assertive only for a new top-priority alarm.

## A8. Scale
At least 1,000 standing rows, 500 arrivals in 10 s, 10,000 history rows in the journal view (virtual), 100 alarm types, update every second without losing focus, selection or scroll, heap flat over days (my soak test: flat to 4 h of simulated time).

## A9. MVP versus later
**MVP**: four-state lifecycle, shelve with end and reason, priority (3-4) with mark, `AlarmList` with intents and counts, `AlarmBanner`, flood and first-out marking, polite announcements, keyboard ack, hooks `onAnnunciate`, German wording.
**Later**: chatter and fleeting analysis views, summary/KPI component, journal view, `alarmFilter`, suppression and out-of-service display, handover report view.

## A10. Open decisions
1. **Which package?** I recommend `@umriss-ui/core` for the model and mark and banner (so the dashboard and the table can use them), the list in table, as before; alternative is a new `alarms` package, which costs the dependency map (CLAUDE.md) but avoids table bloat.
2. **Restore ADR-0009 and ADR-0057?** Yes, superseded by a new ADR that keeps the boundary and adds first-out and the banner; the cost of not restoring is a second boundary debate.
3. **How many priorities?** 4 (plus optional journal); 3 is what the old code had and loses the "critical" of many plants. Cost of 4: one more shape and colour.
4. **Wording**: ISA words (shelved) instead of snoozed? Yes, because the audience here knows the standard; cost: ADR-0035 naming rule changes, a migration of 35 keys.
5. **Standards claim**: reinstate "follows the ISA-18.2 state model" in standards.md? Yes, narrow, no conformance claim.
6. **Sound**: callback only, never audio? Yes; cost of audio inside the library is autoplay policies and an accessibility surface.
7. **Time/clock**: keep the as-of parameter and make the host tick? Yes; cost of an internal timer is the old argument (tab closed means no return).

# Part B - the coordinator's review

The draft holds up: it keeps what the old code got right (one lifecycle field with four values, availability as
a second axis, a shelve that always ends, intents the application applies, nothing suppressed) and adds what a
control room misses (banner, first-out, counts, keyboard). Eight points need settling before a spec:

1. **Restore, do not rewrite.** About 1,100 lines of model and list and 1,100 lines of tests exist at
   `e027d1f7^`. The first ticket brings them back unchanged and green; every change in A2 follows as its own
   ticket against that baseline.
2. **The package.** A2/A10 put model, mark and banner in core and the list in table. The history argues against
   core: the model moved out of core in 0.34 for a reason, and core stays the general component library. A new
   package **`@umriss-ui/alarms`** (depends on core and table) keeps both generic, gives the audience one place
   to look, and carries the standards claim with it - at the cost of a seventh package and a new line in the
   dependency map (CLAUDE.md: "nothing depends on the table" changes). Costly to reverse: an ADR either way.
3. **Priorities: four fixed named levels, not a type parameter.** "3 to 4" as a type parameter adds a generic
   to every part for a choice a plant makes once; four levels serve a three-level plant that leaves one unused.
   Plus the non-annunciated "journal" level, or not - a decision.
4. **"Acknowledge what is seen" needs one definition.** With a virtual list "in view" can mean the rows in the
   viewport or the filtered set. ISA-18.2's sense is "presented to the operator"; the safe reading is the
   selection or, without one, the rows currently rendered in the viewport - and never rows that arrived after
   the confirmation opened (A6.2 already says so).
5. **Single-key shortcuts** (`A`, `S`) meet WCAG 2.1.4 only while the list has focus, or when they can be turned
   off or remapped; say which. A2's "remappable" is the stronger promise and needs an API.
6. **Wording.** Going back from "snooze" to "shelve" reverses part of ADR-0035 for this audience. Proposal: the
   identifiers keep the general names, the English and German wording use the ISA words - a wording decision,
   not an API one.
7. **The standards claim** stays as A10.5 proposes - "follows the ISA-18.2 state model", no conformance - and the
   clause numbers in A1 and A4 are checked against secondary sources before any of them is written into an ADR
   or `docs/standards.md` (the norm texts were not read; `docs/standards.md` says the same of ISA-101).
8. **The MVP is large.** As a tracer bullet: (a) restored model and list; (b) four priorities and the
   `PriorityMark`; (c) the shelve flow with ISA wording; (d) the banner; (e) first-out and the flood rate; (f)
   keyboard and announcements. Each is usable alone. Depends on two table findings from the shakedown: a `Date`
   column with seconds (`operator-screens.md` 4) and accessible selection (`audit-family.md` 6).

## Decisions for the maintainer

| # | Question | Recommendation |
|---|---|---|
| 1 | Where does it live: core + table, or a new `@umriss-ui/alarms`? | new package |
| 2 | ADR-0009 and ADR-0057 back, under one new ADR that also covers first-out and the banner? | yes |
| 3 | How many priority levels; a non-annunciated "journal" level? | four fixed; journal later |
| 4 | Which rows does "acknowledge all" take? | the selection, else the rendered rows; never later arrivals |
| 5 | ISA words in the wording, general names in the API? | yes |
| 6 | Sound only as a callback, never audio in the library? | yes |
| 7 | Time only as an `asOf` the host ticks, no timer inside? | yes |
| 8 | A narrow "follows the ISA-18.2 state model" in `docs/standards.md`? | yes, after checking sources |
