# umriss is for data-dense applications, not for plants alone

Status: accepted. Superseded in part by ADR-0066 (the consequence "no deprecated aliases")
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
  Superseded in part by ADR-0066: from then on a rename keeps its old name for
  one minor, and the hard cut stands as history.
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

## Amended: an example carries its world

"Their data lives once" held for the files, not for the reader. An example
imported its world from `@umriss-ui/demo`, and the code view showed the world as
a second tab beside it — but a reader copies one block, and the shell is never
published, so the block did not run.

Every example and scenario now carries the part of its world it uses, copied
verbatim under the line `Data from the <world> world, written out here so the
example runs on its own.` The values, seeds and generators are the world's, so
nothing rendered changed. `packages/demo/src/worlds` stays the source those
copies are taken from, and what the world tests read; an example imports only
its package and npm (`checks/ownData`), and the code view has no tabs any more.
The plant check finds the plant world by that line instead of by the import.

`packages/demo/src/worlds` and the plant-words check were removed later; the examples keep the data they carry.

## Amended

The alarms package states ISA's words on its screen and in its speech, in English and German, while its API keeps the general names; that is a partial exception to this decision, for that package only (ADR-0078).
