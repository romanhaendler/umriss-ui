# 01 - The ADR: alarm management is a package of its own

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/alarms/spec.md`
ADR:    ADR-0078, given in `.scratch/after-shakedown/order.md`; use it wherever this ticket says "the next free number" or ADR-NNNN

## What to build

The decision record, before any code.

- Take the next free number in `docs/adr/` at the time of writing.
- Add its row to `docs/adr/README.md`, area: limits and alarms.
- Mark ADR-0009 and ADR-0057 superseded by it: their status line, and their rows in the README.
- Add one line to ADR-0035, under a heading "Amended", that points at the new ADR for the alarms package's
  wording.
- Put the **Alarms** section back into `CONTEXT.md`, unless the map's coordinating session has already put it
  there. Take it from `e027d1f7^`, and change it to the decisions below: four priorities, the ISA words on
  screen beside the API names, and the new terms **First-out**, **Annunciation** and **In view**.

The ADR's text is below. Write it in the voice of the ADRs that stand, with ADR-0009 and ADR-0057 as the
model, and change nothing of its substance.

> **Title:** Alarm management is a package on core and table; it owns an alarm's lifecycle, never its
> generation
>
> **Supersedes** ADR-0009 and ADR-0057, withdrawn on 2026-10-11 with the alarm list.
>
> The alarm list left `@umriss-ui/table` in 0.34, for lack of contact with control rooms. A control-room
> developer then wrote it again in about 80 lines and asked for it back: a state machine, a shelve dialog, an
> acknowledge-all confirmation and a sticky alert. Those are the screens umriss is for, and the old code
> (about 1,100 lines and as many of tests) got its hardest parts right.
>
> **`@umriss-ui/alarms`, a published package on `@umriss-ui/core` and `@umriss-ui/table`, owns what happens
> to an alarm after it is raised: its lifecycle, its order, its marks, and how it is shown and answered. It
> never raises one. Nothing depends on it.**
>
> - **Why a package.** Core stays the general component library and the table a general table; neither
>   learns an alarm system's states. The control-room audience finds the model, the list, the mark and the
>   banner in one place, and the package carries the standards claim with it.
> - **The boundary, kept from ADR-0009 and ADR-0057.** The application owns:
>   - generation and thresholds (limits, dead bands, delays, scan rates);
>   - who may acknowledge or shelve, and for how long at most;
>   - the audit trail and persistence;
>   - sound output;
>   - the clock;
>   - suppression by design;
>   - the rationalisation of each alarm type (its priority, its consequence).
>
>   The library owns:
>   - the pure transitions and the order;
>   - the flood, chatter and first-out marks;
>   - the counts, the list and the banner;
>   - the flows (acknowledge, shelve, unshelve) as intents it reports and never applies (ADR-0023);
>   - the announcements and the visual encoding.
> - **Kept rules.**
>   - The lifecycle is one field with four values, never two booleans: a pair invites `if (active)`, and that
>     filter loses the fleeting alarm.
>   - Availability is a second field: in service, snoozed, suppressed, disabled. ISA-18.2 draws these states
>     inside its one diagram; the second field is the way OPC UA Part 9 represents them, and a shelved alarm
>     keeps its lifecycle underneath.
>   - A snooze always has an end and a person.
>   - Nothing is suppressed: a flood and a chatter are marked, and every alarm stays a row.
>   - Time is the as-of time the host hands in. There is no timer: a closed tab must not be the reason a
>     shelve never ends.
> - **Added.**
>   - *Four fixed priorities*, `critical`, `high`, `medium` and `low`, not a type parameter. A plant with
>     three leaves one unused. A non-annunciated level may come later, named "diagnostic". Priority stays a
>     different scale from a limit's Severity (ADR-0006).
>   - *First-out* marks the first alarm of a group the application names (a trip), by the earliest raise,
>     ties broken by the application's sequence number. The earliest alarm of a flood is shown as "first in
>     the flood", an extension of umriss's own.
>   - *The banner* is one landmark on every screen. It shows the worst unacknowledged alarm, the counts per
>     priority and the flood. It speaks assertively only when a new unacknowledged alarm of a higher priority
>     than the one shown arrives, never for a count.
>   - *Acknowledge what is seen.* "Acknowledge all" takes the selection, or else the rows rendered in the
>     list's visible area, with the ids fixed when the confirmation opens. It never takes the filtered set as
>     such, and never an alarm that arrived after the confirmation opened. This is umriss's own reading of
>     "acknowledge confirms recognition"; no source states it as a rule.
>   - *Re-annunciation.* An alarm still in alarm when its shelve runs out returns unacknowledged, so that it
>     is not forgotten. A shelve ended by hand keeps the lifecycle.
>   - *Sound* is a callback, `onAnnunciate`, never audio in the library: autoplay policies, and an
>     accessibility surface the library cannot own.
>   - *Single-key shortcuts* act only while the list has focus (WCAG 2.1.4). There is no remapping API.
>   - *Wording.* The screen and the speech use ISA's words, in English and German: shelved, suppressed by
>     design, out of service, in alarm, returned. The API keeps its general names (`snooze`, `disabled`,
>     `suppressed`, active, resolved). This is a partial exception to ADR-0035, for this package only: the
>     audience of an alarm list is trained in those words, and the API is read by developers of every kind.
>
> **Considered options.**
> - *Model, mark and banner in core, the list in table,* as before 0.34. Core would carry an alarm system
>   again, and the table would grow an alarm list beside a general table.
> - *A type parameter for three or four priorities.* A generic on every part, for a choice a plant makes once.
> - *A "journal" level now.* No source uses the word; the sources say "diagnostic", and it is not needed yet.
> - *Acknowledging the filtered set.* With a virtual or long list it acknowledges alarms nobody saw.
> - *Audio inside the library, or a timer that ends a shelve.* See above.
> - *A remapping API for the keys.* Focus-bound keys already meet WCAG 2.1.4.
> - *ISA's words in the API as well.* A second rename within months, and against ADR-0035 for every
>   developer who is not in a control room.
> - *A wording register of the package's own,* as the charts have one (ADR-0031). The charts need theirs
>   because they depend on nothing. This package depends on core, and one provider switching every package
>   is the rule of every other package on core.
>
> **Consequences.**
> - A seventh published package, with a demo of its own in the shared shell (ADR-0020). `CLAUDE.md`'s
>   dependency map changes: something depends on the table now.
> - The table exports its pure pipeline, `tableModel`, which `alarmModel` runs its rows through.
> - The alarm wording stands in core's register, in the package's section, with the prefix `alarm`.
> - `docs/standards.md` claims the ISA-18.2 state model narrowly, with no conformance, once the tests hold it.
> - The flood rule, the shelve durations and the shelve reasons are the application's, with no defaults.

## Acceptance criteria

- [ ] The ADR stands in `docs/adr/` with the next free number, `Status: accepted`, and the date of writing.
- [ ] Its row stands in `docs/adr/README.md`, and the count in that README's first sentence goes up by one.
- [ ] ADR-0009 and ADR-0057 say "superseded by ADR-0078" in their status line and in their README rows.
- [ ] ADR-0035 has its amendment line pointing at the new ADR.
- [ ] `CONTEXT.md` has an **Alarms** section with **Alarm**, **Alarm type**, **Lifecycle state**,
      **Priority**, **Flood**, **Availability**, **Snoozed**, **Suppressed**, **Disabled**, **First-out**,
      **Annunciation** and **In view**. Each term names its ISA word where it differs, and each has an
      _Avoid_ line. **Severity** and **Rank** again name **Priority** as the other scale.
- [ ] `pnpm check:site` passes.
