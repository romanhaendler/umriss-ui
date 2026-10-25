# ISA-18.2 and EEMUA 191 in secondary sources

Type:   research
Status: resolved

## Question

Do the claims about ISA-18.2-2016 and EEMUA 191 in `.scratch/alarm-management/requirements.md` (A1, A2, A4,
A7) hold against citable secondary sources, given that the norm texts themselves were not read?

Check each, with the clause number where a source gives one:

- the alarm states (normal, unacknowledged, acknowledged, returned-unacknowledged) and the special states
  (shelved, suppressed by design, out of service), and that they are orthogonal;
- "acknowledge means seen"; shelving tracked, time-limited, with a reason;
- EEMUA 191's reference rates (about 1 per 10 min sustained, 10 in 10 min a flood) and priority counts
  (3 or 4, plus a non-annunciated level);
- first-out, chattering, fleeting and stale alarms as the standards or their guides define them;
- ISA-101 on priority shown by shape plus colour plus text, and flashing only while unacknowledged.

Sources: ISA and EEMUA summaries, vendor white papers (Honeywell, Emerson, Yokogawa, exida), the
ISA-18.2 technical reports where public. Record which claim each source supports, which none does, and the
exact wording a narrow "follows the ISA-18.2 state model" could rest on. Compare `docs/standards.md` on ISA-101.

## Answer

Findings: `docs/research/after-shakedown/isa-18-2-and-eemua-191.md` on the local branch
`research/isa-18-2-and-eemua-191` (`git show research/isa-18-2-and-eemua-191:docs/research/after-shakedown/isa-18-2-and-eemua-191.md`).

- **Hold:** the four states (18.2 also draws two latched states, which IEC 62682 dropped); shelved, suppressed
  by design, out of service; acknowledge = "operator action that confirms recognition"; shelving tracked and
  time-limited (required since 18.2-2016); EEMUA's "under 1 per 10 min"; three or four priorities; chattering;
  stale (over 24 h); flashing only while unacknowledged.
- **Corrected:** the special states as a second, orthogonal field have a precedent in OPC UA Part 9, not in
  18.2, whose diagram draws them as further states. The flood threshold is ISA-18.2's (more than 10 per
  10 min per operating position), not EEMUA's. "Three or four" priorities is credited to ISA-18.2; the fourth
  is a rare "highest" (under 1 %); the non-annunciated level is called **"diagnostic"**, never "journal".
  A shelve reason traces to IEC 62682. First-out marks the first alarm of a group or trip, not of a flood.
  Shape + colour + text comes from the High Performance HMI Handbook, not a cited ISA-101 clause.
- **No source:** "acknowledge only the rows shown" as a rule; a 1-2 Hz flash rate; any clause number for the
  states (only 18.2-2016's Figure 3 is confirmed).
- **Proposed wording** for `docs/standards.md`, once the restored model's tests hold it: "umriss follows the
  alarm states of the ISA-18.2 state model: unacknowledged, acknowledged, returned to normal while still
  unacknowledged; normal is the absence of an alarm. Acknowledging confirms that the operator recognised the
  alarm and acts only on the alarms named. Shelved, suppressed by design and out of service are kept as a
  second field, as OPC UA Part 9 represents them; a shelve always carries an end. No latched states. Not
  certified against ISA-18.2, IEC 62682 or EEMUA 191; no conformance claimed."
- Limits: ISA forbids entering its material into AI tools, so clauses need a person with a licensed copy;
  EEMUA 191 is in its 4th edition (2024) and the rates quoted are from 1999. The Tatsoft link in
  `docs/standards.md` returns 404 (working page: `https://docs.tatsoft.com/display/FX/ISA-101+HMI+Compliance+How-to`).
