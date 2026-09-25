# The standards umriss is close to

What umriss follows from **ISA-18.2** (alarm management) and **ISA-101**
(high-performance operator screens), what it deliberately does not, and where
the knowledge comes from. The claim follows the work: this page was written
after `.scratch/alarm-standards/` 01-03 were delivered, and says no more than
the code and its tests hold.

**umriss is not certified against either standard, and claims no
conformance.** Both are standards for a whole alarm system and a whole
operator interface - philosophy, rationalisation, operation, audit. A
component library can make the right thing easy and the wrong thing visible;
it cannot make a plant conform.

## ISA-18.2 - alarm management

### ISA's terms and umriss's names

umriss is for data-dense applications, not for plants alone (ADR-0035), so
its public names are the ones a cloud console or a finance tool would use.
The concept behind each is ISA-18.2's; only the word differs.

| ISA-18.2 term | umriss name | In code |
|---|---|---|
| Shelve / unshelve, shelved | Snooze / unsnooze, snoozed | `snooze`, `unsnooze`, `"snoozed"`, `Snooze` (`{ until, by }`), the field `snooze` |
| Out of service (removed from service / returned to service) | Disabled (disable / enable) | `"disabled"`, `disable`, `enable` |
| Suppressed by design | Suppressed | `"suppressed"` |
| In service | In service | `"in-service"` |
| Hidden from operation (shelved, suppressed or out of service) | Hidden | `isHidden`, `AlarmProjection.hiddenAlarms` |
| Alarm standing, in alarm | Active | `"active-unacknowledged"`, `"active-acknowledged"`, `isActive`, `activeUnacknowledged` |
| Cleared, returned to normal | Resolved | `"resolved-unacknowledged"`, `"resolved-acknowledged"`, the transition `"resolved"`, the time `Alarm.resolved` |
| Acknowledge | Acknowledge | `acknowledge` |
| Alarm limit and dead band, high/low alarm | Return band, upper/lower | `ReturnBand`, `direction: "upper" \| "lower"` |

### What umriss follows

| ISA-18.2 | umriss | Where |
|---|---|---|
| The alarm states: normal, unacknowledged, acknowledged, returned to normal while unacknowledged | The **Lifecycle state**: one field with four values - active/resolved × acknowledged/unacknowledged. Resolved and acknowledged is done and the model's only removal | `alarmModel.ts`, `nextLifecycleState` |
| A return to normal that nobody acknowledged is still an alarm | The fleeting alarm - came, resolved, unseen - stays in the list with a mark of its own; the reason the state is one field and not two booleans | `alarmModel.ts`, `AlarmList` |
| The special states, enterable from any state: **Shelved** (operator-initiated, tracked), **Suppressed by design** (logic-driven), **Out of service** | **Availability**: `snoozed`, `suppressed`, `disabled` beside `in-service` - a second field beside the lifecycle and never merged into it; a hidden alarm keeps its lifecycle underneath | `alarmModel.ts`, `availabilityAt` |
| Shelving is tracked | A snooze has an end and a name (`snooze: { until, by }`); an alarm snoozed without either cannot be written down. That a snooze *ends* is umriss's own reading of "tracked", not a quoted requirement: it ends by the model's clock - at the as-of time that reaches `until` the alarm is in service again, with no timer | the `Alarm` type, `availabilityAt` |

The transitions are pure and performed by the application - `snooze`,
`unsnooze`, `disable`, `enable` - as acknowledging is. A snooze never
overwrites disabled or suppressed: the end of a snooze must not put an alarm
disabled for maintenance back in service. Nor does disabling overwrite
suppressed: that field is the application's logic's, and enabling would lose
it.

A hidden alarm is still an alarm to the rest of the model: it can be
acknowledged, and it counts towards frequency, chatter and a flood - a
marking, never a removal. Only the live figure of active unacknowledged
alarms leaves it out, because that figure calls somebody over.

### What umriss deliberately does not do

- **Generate alarms.** The library receives them (ADR-0009). Bounds, sampling,
  dead bands in the field and the decision that a condition is an alarm are
  the application's.
- **Suppress anything by rule.** A flood is marked, chatter is marked, a
  hidden alarm is drawn neutrally - none is removed. Deciding that a human
  should not see an alarm is a safety decision, and it stays with the application.
- **Write suppressed.** It is the application's logic that suppresses; the
  application writes the field from that logic, and the model has no
  transition for it.
- **Authorise a snooze or limit its length.** Who may snooze, and for how long
  at most, is the alarm philosophy's; the model takes `until` and `by` as
  given.
- **Latched alarms.** ISA-18.2 names a latched state; umriss does not model it.
- **Keep an audit trail.** The model knows the current snooze and who set
  it, not the history of snoozes. Recording changes is the application's.
- **Alarm system performance measures.** umriss counts frequency per type in a
  window and marks floods; it computes no rates against a target.

## ISA-101 - high-performance operator screens

### What umriss follows

- **A grey base, colour for the abnormal.** "Ink & Paper" is almost
  monochrome; danger, warning and success come from a verdict, a lifecycle or
  a freshness, never from decoration.
- **Never colour alone.** Every verdict colour stands beside a word or a
  glyph. A register of every library stylesheet with a verdict colour holds
  what carries its meaning without it
  (`packages/core/tests-unit/verdictColour.test.ts`).
- **Hidden, not absent.** Snoozed and suppressed alarms get their own
  neutral treatment - "not absent, just deliberately hidden", as the ISA-101
  source puts it: they stay in the list, drawn neutrally with their state as a
  word, and the list counts them ("Hidden: 3") - `AlarmList`.

The rule, its check and its limits stand in
[`design-language.md`](design-language.md), "Colour for the abnormal".

### Where umriss departs, and why

- **The danger button and a menu's destructive item are red** for a
  consequence, not an abnormal state; their label names the action.
- **The "ok" verdict word is tinted green**, where a strict ISA-101 screen
  would leave normal grey: it is a verdict the caller asked for.
- **No colour per priority beyond three tones.** ISA-101 does not specify the
  colours; a typical field mapping uses four (P1 red, P2 amber, P3 yellow, P4
  blue or cyan). umriss has three priorities, drawn danger, warning and
  neutral, each with its word. The mapping to a plant's convention is the
  caller's.
- **Screens, navigation and faceplates** are the application's. umriss ships
  components, not an operator interface.

## Sources

The norm texts of ISA-18.2 and ISA-101 are paywalled and were **not** read.
Everything above rests on secondary sources - white papers, vendor
documentation and reference sites - gathered in the library comparison of
24 September 2026 (`research/library-comparison-2026-09/charts_industrial.md`).
Where they and the norm text differ, the norm text wins, and this page is
wrong.

**ISA-18.2** (secondary)

- ISA / PAS white paper, *Understanding ISA-18.2* -
  <https://www.isa.org/getmedia/55b4210e-6cb2-4de4-89f8-2b5b6b46d954/PAS-Understanding-ISA-18-2.pdf>
- ICONICS, alarm state transition diagram (vendor documentation) -
  <https://documentation.iconics.com/v10.97.3/Content/Alarming/Alarm%20Server/Alarm%20References/alarm-state-transition-diagram.htm>
- Siemens, white paper on alarm management after ISA-18.2 (vendor) -
  <https://support.industry.siemens.com/cs/attachments/109772836/WP_Alarm_Management_ISA_18.pdf>

**ISA-101** (secondary)

- HMI Library, *ISA-101* - <https://hmilibrary.com/standards/isa-101>
- Industrial Monitor Direct, ISA-101 colour strategy (vendor knowledge base) -
  <https://industrialmonitordirect.com/blogs/knowledgebase/isa-101-high-performance-hmi-design-principles-color-strategy>
- Tatsoft, FrameworX ISA-101 compliance guide (vendor) -
  <https://docs.tatsoft.com/display/FX/ISA-101+HMI+Compliance+How-to+Guide>
