# Decisions

Thirty-two decisions, each one written where it was made and kept afterwards. An
ADR here is not an announcement: it states the question, the alternatives that
were real at the time, and what the decision costs — which is what makes it
worth reading a year later, when the code has changed and the reasoning has not.

**A number is never reused.** The number is the chronology, and the file names
are quoted from code comments, specs under `.scratch/` and from each other.

**A superseded ADR is kept, not deleted.** The code it explains is still
readable in the history, and the reasoning that was overturned is usually the
half a later reader needs most. Exactly one is superseded today.

| ADR | Title | Status | Area |
|---|---|---|---|
| [0001](0001-affine-scale-contract.md) | Every scale is affine, and the draw loop may rely on it | accepted | charts |
| [0002](0002-bars-on-a-numeric-x-axis.md) | Bars sit on a numeric x axis, not on a categorical band scale | accepted | charts |
| [0003](0003-an-active-node-is-not-a-selection.md) | The active node and the checked set are two states, not one | accepted | tree |
| [0004](0004-a-flat-accessibility-tree.md) | The accessibility tree is flat, not nested | accepted | tree |
| [0005](0005-what-cannot-be-checked.md) | A node that cannot be checked is simply not checked | accepted | tree |
| [0006](0006-the-limit-model-lives-in-both-packages.md) | The limit model lives in both packages, on purpose | accepted | limits and alarms |
| [0007](0007-a-state-is-a-number.md) | A state is a number | accepted | charts |
| [0008](0008-control-limits-are-not-specification-limits.md) | A control limit is not a specification limit, and is never computed from the window | accepted | charts |
| [0009](0009-the-library-owns-a-lifecycle-not-a-generation.md) | The library owns an alarm's lifecycle, not its generation | accepted | limits and alarms |
| [0010](0010-a-stale-value-keeps-its-verdict.md) | A stale value keeps its verdict | accepted | limits and alarms |
| [0011](0011-named-channels-never-overloaded.md) | A channel is named, never overloaded | accepted | charts |
| [0012](0012-a-translucent-material-needs-a-floor.md) | A translucent material needs a floor | accepted | surface and motion |
| [0013](0013-a-dock-snaps-it-does-not-follow.md) | A dock snaps, it does not follow | accepted | surface and motion |
| [0014](0014-a-turn-that-cannot-be-a-transition.md) | A turn that cannot be a transition | accepted | surface and motion |
| [0015](0015-props-are-english-identifiers-are-german.md) | Props are English, identifiers are German | superseded by ADR-0018 | language |
| [0016](0016-the-table-is-a-package-that-depends-on-ui.md) | The table is a package, and it depends on `@umriss-ui/core` | accepted | architecture |
| [0017](0017-columns-are-declared-by-composition.md) | Columns are declared by composition and bound through the hook | accepted | architecture |
| [0018](0018-everything-is-english.md) | Everything is English | accepted — supersedes ADR-0015 | language |
| [0019](0019-two-wordings-ship-english-is-the-default.md) | Two wordings ship, and English is the default | accepted | language |
| [0020](0020-the-demo-shell-is-shared.md) | The demo shell is shared by all three demos, and R-1.2 binds the package source | accepted | architecture |
| [0021](0021-the-styles-load-themselves-and-touch-nothing-else.md) | The styles load themselves, and they touch nothing else | accepted | architecture |
| [0022](0022-the-schedule-is-a-package-that-depends-on-core-and-charts.md) | The schedule is a package, and it depends on `@umriss-ui/core` and `@umriss-ui/charts` | accepted | architecture |
| [0023](0023-editing-is-controlled-the-schedule-reports-intents.md) | Editing is controlled: the schedule reports intents | accepted | schedule |
| [0024](0024-the-formats-are-english-german-is-freight.md) | The formats are English, and German is freight | accepted | language |
| [0025](0025-a-lane-group-is-structure-over-lanes-never-a-lane.md) | A lane group is structure over lanes, never a lane | accepted | schedule |
| [0026](0026-span-leaves-charts-occupancy-is-the-schedules.md) | Span leaves charts; occupancy is the schedule's | accepted | charts |
| [0027](0027-a-calculation-is-written-as-it-is-shown.md) | A calculation is written as it is shown | accepted | calculation |
| [0028](0028-a-calculation-is-a-tree-or-a-chain.md) | A calculation is a tree or a chain | accepted | calculation |
| [0029](0029-a-row-groups-form-follows-its-level.md) | A row group's form follows its level | accepted | table |
| [0030](0030-a-chart-is-one-tab-stop-that-walks-its-hits.md) | A chart is one tab stop that walks its hits | accepted | charts |
| [0031](0031-the-charts-carry-their-own-wording.md) | The charts carry their own wording | accepted | charts, language |
| [0032](0032-what-umriss-is-not.md) | What umriss is not | accepted | scope |

The vocabulary these decisions are written in stands in [`CONTEXT.md`](../../CONTEXT.md).
