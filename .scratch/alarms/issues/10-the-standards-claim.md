# 10 - The standards claim

Status: ready-for-agent
Type: task
Size: S

Blocked by: `09-keyboard-and-announcements.md`
Spec: `.scratch/alarms/spec.md`

## What to build

`docs/standards.md` says what umriss follows of ISA-18.2, and no more than the tests hold. Read the research
first: `git show research/isa-18-2-and-eemua-191:docs/research/after-shakedown/isa-18-2-and-eemua-191.md`.
Check every sentence below against a test of `@umriss-ui/alarms` before writing it. A sentence with no test
behind it is left out, and its absence is noted under `## Comments`.

- **The page's head** names ISA-18.2 beside ISA-101, and its no-conformance paragraph covers both.
- **A section "ISA-18.2 - alarm management"** before the ISA-101 one:
  - *What umriss follows*, in the page's voice:
    > umriss follows the alarm states of the ISA-18.2 state model: an alarm is unacknowledged, acknowledged,
    > or returned to normal while still unacknowledged; normal is the absence of an alarm. Acknowledging
    > confirms that the operator recognised the alarm, and acts only on the alarms the call names. Shelved,
    > suppressed by design and out of service are kept as a second field beside that state, the way OPC UA
    > Part 9 represents them. A shelve always carries an end, and an alarm still in alarm when its shelve runs
    > out returns unacknowledged.

    Each point names where it lives: the model, `availabilityAt`, `acknowledge`.
  - *ISA's terms and umriss's names*: a table as the page had at `e027d1f7^`, now with the screen word
    beside the API name. Shelve is "Shelve" on screen and `snooze` in code; out of service is "Out of service"
    and `"disabled"`; suppressed by design is "Suppressed by design" and `"suppressed"`; in alarm is
    "In alarm" and active; returned to normal is "Returned" and resolved.
  - *Where umriss departs, and why*:
    - no latched states (IEC 62682 dropped them);
    - "acknowledge all" takes the selection or the alarms in view, umriss's own reading of "confirms
      recognition";
    - the 1 Hz flash and its reduced-motion ring are umriss's choice;
    - "first in the flood" is umriss's extension; first-out is the first of a group, as the standards use the
      term;
    - an expired shelve returning unacknowledged is one vendor's reading, taken for safety;
    - raising alarms, who may acknowledge or shelve, the audit trail, sound output and suppression by design
      are the application's, and umriss reports intents.
  - *What umriss does not claim*: no clause numbers, and no rate or priority distribution as a property of the
    library. The flood rule and ISA's reference figure are the application's to set.
- **The Sources** say that the norm texts of ISA-18.2, IEC 62682 and EEMUA 191 are paywalled and were not
  read, and that ISA forbids putting them into AI tools. They list the research's S1, S7, S10 and S16 under
  "ISA-18.2 (secondary)". The dead Tatsoft link is replaced by
  `https://docs.tatsoft.com/display/FX/ISA-101+HMI+Compliance+How-to`.
- **The alarms README** links the section in one sentence, with "no conformance claimed".

## Acceptance criteria

- [ ] Every sentence under "What umriss follows" names the module or test that holds it, and each named test
      exists and passes.
- [ ] The page names no clause number of ISA-18.2, IEC 62682 or EEMUA 191.
- [ ] The words "conform", "comply" and "certified" appear only in the denial.
- [ ] The Tatsoft link is the live one.
- [ ] `pnpm check:site` passes, and the built site renders the page (ADR-0046).
