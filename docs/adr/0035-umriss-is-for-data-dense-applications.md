# umriss is for data-dense applications, not for plants alone

Status: accepted
Date:   2026-09

umriss grew out of plant screens, and until now it said so: ADR-0032 opened
with "a React library for the screens of a producing plant", the README named
"plant screens" in its first line, and the demos played almost every example in
a plant. The components never needed that frame. A limit, an alarm, a schedule
of work on lanes and a calculation that shows its working serve a cloud
operations console, a fleet planner or a finance tool exactly as they serve a
control room — and a reader who meets a pump on every page concludes the
library is not for them.

**umriss is a set of React components for data-dense applications: dashboards,
monitoring, planning, and the tools in which people read a lot of data and act
on it.** Industry is one world among several it is shown in, not its purpose.
What it does not build (ADR-0032) still holds; the reason is now "a data-dense
application does not need it", not "a plant screen does not need it".

## Consequences

- ADR-0032's positioning sentence is replaced by the one above; its list of
  exclusions stands, with its reasons stated for data-dense applications.
- Public names that only make sense inside a plant are renamed, in one hard cut
  before 1.0 with a migration table in each changelog — no deprecated aliases.
  The cut is deliberately wide:
  - table, alarms: `shelve`/`unshelve` → `snooze`/`unsnooze`,
    `"out-of-service"` → `"disabled"`, `"suppressed-by-design"` →
    `"suppressed"`, `isHiddenFromOperation` → `isHidden`, lifecycle
    standing/cleared → active/resolved; `acknowledge` stays.
  - schedule: `setup`/`teardown` → `leadIn`/`leadOut`, `Transport` →
    `Dependency` with `lag` for `duration`, a late transport → a violated
    dependency (and every name built on them); German wording
    "Vorlauf"/"Nachlauf"/"Abhängigkeit". A dependency still joins two subtasks
    of one task only — `Task`, `Subtask` and `Lane` keep their names.
  - schedule gains blocked time on a lane (leave, maintenance, unavailability);
    milestones and stacked overlap stay "not yet".
  - charts: `operatingCalendar` → `workingCalendar`, with every
    `operating…` name after it; `ControlChart` stays, as the SPC term.
  - `ReturnBand.direction` `"obere"`/`"untere"` → `"upper"`/`"lower"`.
  - JSDoc, READMEs and wording examples speak of no plant unless the thing is
    one.
- The demos play in up to five recurring worlds — operations, controlling,
  planning and the like; a plant is one of them and holds no more than a
  quarter of any package's examples. Their data lives once, in
  `@umriss-ui/demo`.
- A check flags plant words (plant, machine, shift, operator, pump …) in code
  and demos outside the plant world, so the frame does not creep back.
- The industrial standards umriss follows (`docs/standards.md`, ISA-18.2 and
  ISA-101) stay, as evidence of quality rather than as the reason it exists;
  `docs/standards.md` maps each ISA term to umriss's name for it.
