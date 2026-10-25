# Alarm management: the standards claim and the slices of the first version

Type:       grilling
Status:     resolved
Blocked by: 08, 09, 10

## Question

Decision 8 of `.scratch/alarm-management/requirements.md` part B and the cut of the first version:

- Does `docs/standards.md` get a narrow "follows the ISA-18.2 state model" (no conformance), and with which
  wording, given what the research "ISA-18.2 and EEMUA 191 in secondary sources" could support?
- The MVP as tracer bullets (part B.8): (a) restored model and list, (b) four priorities and `PriorityMark`,
  (c) the shelve flow with ISA wording, (d) the banner, (e) first-out and the flood rate, (f) keyboard and
  announcements. Is that the order, is each releasable alone, and what of A9's "later" list stays later?
- The two table prerequisites: a `Date` column with seconds (`.scratch/shakedown/operator-screens.md` 4) and
  accessible selection (`audit-family.md` 6) - part of this spec, or specs of their own that come first?
- Which acceptance criteria of A6 and scale figures of A8 the spec adopts as written.

The answer is the outline `/to-spec` writes the alarm-management spec from.

## Answer

Decided 2026-10-25 by the agent, on the maintainer's delegation, within what 08, 09 and 10 settled. Technical
calls are marked *(agent)*; three that set what umriss offers are marked *(agent, product - for review)*.

- **The claim: narrow, written last, from the research's wording** *(agent, product - for review)*.
  `docs/standards.md` gets an ISA-18.2 section only after the last slice, when the tests hold every sentence
  ("the claim follows the work"). The wording is the one the research proposed, with two sentences
  added that the slices make true:
  > umriss follows the alarm states of the ISA-18.2 state model: an alarm is unacknowledged, acknowledged, or
  > returned to normal while still unacknowledged; normal is the absence of an alarm. Acknowledging confirms
  > that the operator recognised the alarm, and acts only on the alarms the call names. Shelved, suppressed
  > by design and out of service are kept as a second field beside that state, the way OPC UA Part 9
  > represents them. A shelve always carries an end, and an alarm still in alarm when its shelve runs out
  > returns unacknowledged. No latched states. umriss follows the state model only: it is not certified
  > against ISA-18.2, IEC 62682 or EEMUA 191, and claims no conformance.
  - Beside it: a table of ISA's terms and umriss's names (the API keeps the general words, ADR-0035), and the
    departures that are umriss's own rules - "acknowledge what is in view", the 1 Hz flash, "first in the
    flood". No clause numbers (none is confirmed), no rate or priority figures as properties of the library.
  - The Sources gain S1, S7, S10 and S16 of the research and the sentence that the norm texts were not read.
    The dead Tatsoft link is replaced by the live page.
- **The slices: B.8's order, with the ADR, two table tickets, the claim and the release added** *(agent)*.
  One ticket each, in this order:
  1. the ADR (09: one ADR over 0009 and 0057);
  2. (a) the package with the restored model, list, tests and demo green (B.1, ADR-0020). "Unchanged" means
     behaviour and tests: import paths change, the 35 wording keys come back into core's register under their
     final, prefixed names (so no key is renamed after a release, ticket 19), and table exports its pure
     pipeline (`tableModel`), which the old model called from inside the table. The demo cannot be split
     off: `API.md` is generated from the demo's outline;
  3. (b) four priorities and `PriorityMark`, with the 1 Hz flash of the unacknowledged mark;
  4. (c) the shelve flow in ISA's words: reasons from the application, durations, re-annunciation when a
     shelve runs out;
  5. (d) the banner, which carries `onAnnunciate`;
  6. table: a `Date` column with seconds;
  7. (e) first-out, the flood rate, and the list at flood volume;
  8. table: a selection a screen reader hears;
  9. (f) keyboard and announcements;
  10. the standards claim;
  11. the first release (the maintainer publishes the first version by hand, `docs/releasing.md`).

  **Each slice is releasable in the workspace's sense** - it leaves every check green and adds nothing a
  later slice must take back - **but the package goes to npm once, after slice (f)** *(agent, product - for
  review)*. Published early, the restored list would teach "snooze" on screen and three priorities, and then
  change both under the upgrade promise. The two table tickets are ordinary table improvements and ship with
  the workspace's next release.
- **A9's "later" list** *(agent, product - for review)*:
  - **In the first version after all:** the display of suppressed and out of service. The restored list
    already draws them, neutrally with their word; slice (c) only gives them ISA's words. Offering
    out-of-service from the list stays out (ADR-0057's line).
  - **Later, each a spec of its own when taken:** the chatter and fleeting analysis views (the chatter *mark*
    is restored and stays), a summary/KPI component (the banner's counts per priority are in), the journal
    view (and with it A8's 10,000 history rows), the handover report view, the "diagnostic" level (10).
  - **Never:** `alarmFilter` (on-delay, off-delay, dead band) - it decides when a condition becomes an alarm,
    which is generation, the application's by the ADR. The restored `hasReturned` stays as it was.
    Latched states, audio, a remapping API and "who" on an acknowledgement (the application knows its user
    and keeps the audit trail) are never as well.
- **The two table prerequisites are tickets of this spec, each before the slice that needs it, each a table
  change released on its own** *(agent)*. Neither is fixed or specified elsewhere in `.scratch/`.
  - *A `Date` column with seconds* (`operator-screens.md` 4): `DateFormat` gains `"timeWithSeconds"` and
    `"dateTimeWithSeconds"`, mapped to core's existing `formats.time(d, true)` and `formats.dateTime(d, true)`.
    Before (e), whose first-out mark needs the order visible to the second (A4). The epoch-number warning is
    ticket 18's.
  - *Accessible selection* (`audit-family.md` 6), only the part the keyboard slice needs: in grid mode,
    `aria-multiselectable` on the grid, `aria-selected` on each selectable row, and the selection's count
    announced when it changes. Space already selects in grid mode (`gridKeys.ts`). Announcing sort, page and
    export, and `aria-colcount`, stay with the table's own wishes (23).
  - *Not a prerequisite:* the virtual grid that drops focus when its active row is re-sorted out of the window
    (`audit-family.md` 2). The list stays a native, non-virtual table unless slice (e)'s measurement says
    otherwise; then that defect and virtual rows become a ticket of their own.
- **A6, adopted** *(agent)*:
  - 1, in part: 500 arrivals in 10 s lose none (`rows === 500`); the flood is marked at the first as-of time
    past the threshold; focus keeps its alarm; at most one polite update per 2 s, throttled by the view's as-of
    time and not by a timer (10). "60 fps (virtual)" becomes a measured render budget for 1,000 rows, recorded,
    not a gate.
  - 2, as written: "Acknowledge 12 alarms in view", the ids fixed when the confirmation opens.
  - 3, 7, 8 and 9, as written. 3 and 8 hold already in the restored tests.
  - 4, as written. That an expired shelve returns unacknowledged is one vendor's reading (Elipse), taken
    because a shelve exists so that the alarm is not forgotten. A manual unshelve keeps the lifecycle.
  - 5, without "moves": a new row above the focused one shifts it; focus stays on the same alarm and is never
    taken, and the banner changes.
  - 6, with the sourced meaning: 40 alarms of one *group* (a trip) within 2 s, exactly one marked first-out;
    ties by the application's sequence number. The earliest of a flood is "first in the flood", worded as
    umriss's extension.
  - 10, through the demo shell's large-text check and ticket 06's touch sizes; nothing of its own.
- **A8, adopted** *(agent)*: 1,000 standing rows, 500 arrivals in 10 s, 100 alarm types, one update a second
  without losing focus, selection or scroll. **Not adopted:** 10,000 history rows (the journal is later) and
  the heap soak over days (the model is pure and holds nothing; one soak may be recorded in slice (e), not
  gated).
- **Costly to reverse:** the package and its boundary - the ADR of 09, ticket 01 of the spec, carries every
  decision above that is not a commit message. The claim is a page, not an ADR.
- **Touches:** a new `packages/alarms`; core (the 35 restored wording keys and those the slices add, English
  and German); table (`tableModel` exported, two `DateFormat` names, grid selection semantics); the
  workspace's lists of packages, `CLAUDE.md`, `docs/standards.md`, `docs/adr/` (the new ADR; 0009, 0057
  superseded; a pointer in 0035).
- **Becomes the spec** `.scratch/alarms/`.
