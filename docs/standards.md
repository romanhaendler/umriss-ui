# The standards umriss is close to

What umriss follows from **ISA-18.2** (alarm management) and **ISA-101**
(high-performance operator screens), what it deliberately does not, and where
the knowledge comes from. The claim follows the work: this page says no more
than the code and its tests hold.

**umriss is not certified against either standard, and claims no
conformance.** Both are standards for a whole alarm system and a whole operator
interface - philosophy, rationalisation, operation, audit. A
component library can make the right thing easy and the wrong thing visible;
it cannot make a plant conform.

## ISA-18.2 - alarm management

`@umriss-ui/alarms` is the package this section is about. Tests named below
are in `packages/alarms/tests-unit`.

### What umriss follows

umriss follows the alarm states of the ISA-18.2 state model: an alarm is
unacknowledged, acknowledged, or returned to normal while still
unacknowledged; normal is the absence of an alarm. Acknowledging confirms that
the operator recognised the alarm, and acts only on the alarms the call names.
Shelved, suppressed by design and out of service are kept as a second field
beside that state, the way OPC UA Part 9 represents them. A shelve always
carries an end, and an alarm still in alarm when its shelve runs out returns
unacknowledged.

- **The alarm states.** The model's `lifecycle` has the four values active and
  returned, each acknowledged or not; a returned, acknowledged alarm is the
  only one that leaves the list, and a returned, unacknowledged one stays
  (`alarmModel.test.ts`: "the fleeting alarm", "the four transitions").
- **Acknowledging.** `acknowledge` changes the alarms whose ids the call
  names, counts what it changed, and passes unknown ids over
  (`alarmModel.test.ts`: "acknowledging").
- **A second field.** `availability` (`in-service`, `snoozed`, `suppressed`,
  `disabled`) sits beside `lifecycle`; `snooze` never touches the lifecycle,
  and a hidden alarm stays in the list (`availability.test.ts`: "snooze",
  "hidden, never absent").
- **A shelve has an end.** `availabilityAt` puts a snoozed alarm back in
  service at the as-of time that reaches `until`, with no timer
  (`availability.test.ts`: "the snooze expires by the model's clock").
- **It returns unacknowledged.** At `until` the alarm is in alarm,
  unacknowledged, counted and acknowledgeable; one millisecond earlier it is
  shelved and nothing is acknowledgeable
  (`reannunciation.test.ts`: "a shelve that ends").

### ISA's terms and umriss's names

umriss is for data-dense applications, not for plants alone (ADR-0035), so the
API keeps general words where a cloud console or a finance tool would use
them. The screen says ISA's word; the concept is the same.

| ISA-18.2 term | On screen | In code |
|---|---|---|
| Shelved | "Shelve", "Shelved" | `snooze`, `unsnooze`, `"snoozed"`, the field `snooze` |
| Out of service | "Out of service" | `"disabled"`, `disable`, `enable` |
| Suppressed by design | "Suppressed by design" | `"suppressed"` |
| In alarm | "In alarm" | `"active-unacknowledged"`, `"active-acknowledged"` |
| Returned to normal | "Returned" | `"resolved-unacknowledged"`, `"resolved-acknowledged"` |
| First out | "First out" | `firstOut` |

`isaWords.test.ts` holds that no English or German alarm text uses the general
words.

### Where umriss departs, and why

- **No latched states.** IEC 62682 dropped them from the state diagram; the
  lifecycle has four values.
- **"Acknowledge all" takes the selection, or the alarms in view** without a
  selection, and the number is named before anything is acknowledged: on the
  button for a selection, in a confirmation for the alarms in view, whose ids
  are fixed when it opens. That is umriss's own
  reading of "confirms recognition": what the operator is shown
  (`alarmList.test.tsx`: "Acknowledging").
- **The 1 Hz flash and its reduced-motion ring** are umriss's choice. The mark
  flashes only for an active, unacknowledged alarm in service; under reduced
  motion it stands still and is ringed (`priorityMark.test.tsx`).
- **"First in the flood" is umriss's extension.** First out is the first alarm
  of a group, as the standards use the term; the first of a flood is a mark of
  its own, worded apart (`firstOut.test.ts`, `alarmListFlood.test.tsx`).
- **An expired shelve returns unacknowledged.** That is one vendor's reading,
  taken for safety; no source settles it.
- **The application's, not umriss's:** raising alarms, who may acknowledge or
  shelve, the audit trail, sound output and suppression by design. umriss
  reports intents (`onAcknowledge`, `onSnooze`, `onAnnunciate`) and writes no
  alarm.

### What umriss does not claim

No clause numbers of ISA-18.2, IEC 62682 or EEMUA 191, and no rate or
priority distribution as a property of the library. The flood rule and ISA's
reference figure are the application's to set.

## ISA-101 - high-performance operator screens

### What umriss follows

- **A grey base, colour for the abnormal.** "Ink & Paper" is almost
  monochrome; danger, warning and success come from a verdict or
  a freshness, never from decoration.
- **Never colour alone.** Every verdict colour stands beside a word or a
  glyph. A register of every library stylesheet with a verdict colour holds
  what carries its meaning without it
  (`packages/core/tests-unit/verdictColour.test.ts`).
The rule, its check and its limits stand in
[`design-language.md`](design-language.md), "Colour for the abnormal".

### Where umriss departs, and why

- **The danger button and a menu's destructive item are red** for a
  consequence, not an abnormal state; their label names the action.
- **The "ok" verdict word is tinted green**, where a strict ISA-101 screen
  would leave normal grey: it is a verdict the caller asked for.
- **Screens, navigation and faceplates** are the application's. umriss ships
  components, not an operator interface.

## OPC UA - how far a source vouches for a value

### What umriss follows

- **The three levels of a status code's severity:** good, uncertain, bad
  (`Quality`). A tile whose source says uncertain or bad keeps its number, its
  verdict and its age, and says the level in a word and a line under the figure
  (ADR-0077).

### Where umriss departs, and why

- **No status codes and no sub-statuses.** They are a protocol's vocabulary;
  the application maps its source's code to one of the three levels.

## Sources

The norm texts of ISA-18.2, IEC 62682, EEMUA 191 and ISA-101 are paywalled and
were **not** read, and ISA forbids putting its texts into AI tools.
Everything above rests on secondary sources - white papers, vendor
documentation and reference sites - gathered in the library comparison of
24 September 2026 (`research/library-comparison-2026-09/charts_industrial.md`).
Where they and the norm text differ, the norm text wins, and this page is
wrong.

**ISA-18.2** (secondary)

- Siemens, *Setting a new standard in alarm management*, white paper, 2021 -
  <https://assets.new.siemens.com/siemens/assets/api/uuid:234f1026-298f-49dc-8961-0c5223c38588/white-paper-alarm-management-2021-final.pdf>
- G. Nasby, *Introduction to the ISA 18.2 Alarm Management Standard*, training
  slides, 2013 -
  <https://www.grahamnasby.com/files_publications/NasbyG_2013_IntroToAlarmMgmt_YorkRegion_oct2013_slides.pdf>
- OPC Foundation, *OPC 10000-9, Alarms & Conditions* (3.1.1, 5.8.2, 5.8.17,
  Annexes C and E) - <https://reference.opcfoundation.org/specs/OPC-10000-9/5.8.2>
- EEMUA, *Publication 191 Edition 4*, contents (titles only) -
  <https://eemua.org/getattachment/9d3f8071-55c3-49bf-a74a-3bf6ad4a2e0f/Contents-EEMUA-Publication-191-Edition4-November-2024.pdf>

**ISA-101** (secondary)

- HMI Library, *ISA-101* - <https://hmilibrary.com/standards/isa-101>
- Industrial Monitor Direct, ISA-101 colour strategy (vendor knowledge base) -
  <https://industrialmonitordirect.com/blogs/knowledgebase/isa-101-high-performance-hmi-design-principles-color-strategy>
- Tatsoft, FrameworX ISA-101 compliance guide (vendor) -
  <https://docs.tatsoft.com/display/FX/ISA-101+HMI+Compliance+How-to>

**OPC UA**

- OPC Foundation, *OPC UA Part 4: Services - StatusCode* -
  <https://reference.opcfoundation.org/Core/Part4/v105/docs/7.38>
