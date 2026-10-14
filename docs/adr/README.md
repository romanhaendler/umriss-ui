# Decisions

Sixty-four decisions, each one written where it was made and kept afterwards. An
ADR here is not an announcement: it states the question, the alternatives that
were real at the time, and what the decision costs — which is what makes it
worth reading a year later, when the code has changed and the reasoning has not.

**A number is never reused.** The number is the chronology, and the file names
are quoted from code comments and from each other.

**A superseded ADR is kept, not deleted.** The code it explains is still
readable in the history, and the reasoning that was overturned is usually the
half a later reader needs most. The status column says which are superseded, withdrawn, amended or extended.

| ADR | Title | About | Status | Area |
|---|---|---|---|---|
| [0001](0001-affine-scale-contract.md) | Every scale is affine, and the draw loop may rely on it | Axis scales stay linear mappings | accepted | charts |
| [0002](0002-bars-on-a-numeric-x-axis.md) | Bars sit on a numeric x axis, not on a categorical band scale | Bars on numeric axis, categories as positions | accepted, superseded in one consequence by ADR-0052 (a category is a value; the library keeps its position) | charts |
| [0003](0003-an-active-node-is-not-a-selection.md) | The active node and the checked set are two states, not one | Keyboard position and ticked nodes are separate | accepted | tree |
| [0004](0004-a-flat-accessibility-tree.md) | The accessibility tree is flat, not nested | Tree accessibility uses a flat list | accepted | tree |
| [0005](0005-what-cannot-be-checked.md) | A node that cannot be checked is simply not checked | Unticking nodes that cannot be ticked | accepted | tree |
| [0006](0006-the-limit-model-lives-in-both-packages.md) | The limit model lives in both packages, on purpose | Limit rule kept in both packages | accepted | limits and alarms |
| [0007](0007-a-state-is-a-number.md) | A state is a number | Machine states drawn as numeric codes | accepted | charts |
| [0008](0008-control-limits-are-not-specification-limits.md) | A control limit is not a specification limit, and is never computed from the window | Control limits versus specification limits | accepted | charts |
| [0009](0009-the-library-owns-a-lifecycle-not-a-generation.md) | The library owns an alarm's lifecycle, not its generation | Alarm lifecycle ownership (withdrawn) | withdrawn. The alarm list was removed from `@umriss-ui/table`, so this decision no longer applies to any code. | limits and alarms |
| [0010](0010-a-stale-value-keeps-its-verdict.md) | A stale value keeps its verdict | Old readings keep their verdict | accepted | limits and alarms |
| [0011](0011-named-channels-never-overloaded.md) | A channel is named, never overloaded | Each data channel has one meaning | accepted | charts |
| [0012](0012-a-translucent-material-needs-a-floor.md) | A translucent material needs a floor | Contrast of translucent surfaces | accepted | surface and motion |
| [0013](0013-a-dock-snaps-it-does-not-follow.md) | A dock snaps, it does not follow | Dock snapping behaviour (withdrawn) | withdrawn. The Dock was removed from `@umriss-ui/core`, so this decision no longer applies to any code. | surface and motion |
| [0014](0014-a-turn-that-cannot-be-a-transition.md) | A turn that cannot be a transition | Dock turning animation (withdrawn) | withdrawn. The Dock was removed from `@umriss-ui/core`, so this decision no longer applies to any code. | surface and motion |
| [0015](0015-props-are-english-identifiers-are-german.md) | Props are English, identifiers are German | Which language props and identifiers use (replaced) | superseded by ADR-0018 | language |
| [0016](0016-the-table-is-a-package-that-depends-on-ui.md) | The table is a package, and it depends on `@umriss-ui/core` | Table package depends on core | accepted | architecture |
| [0017](0017-columns-are-declared-by-composition.md) | Columns are declared by composition and bound through the hook | Table columns declared as child components | accepted | architecture |
| [0018](0018-everything-is-english.md) | Everything is English | Code and default text are English | accepted — supersedes ADR-0015 | language |
| [0019](0019-two-wordings-ship-english-is-the-default.md) | Two wordings ship, and English is the default | English and German wording both ship | accepted | language |
| [0020](0020-the-demo-shell-is-shared.md) | The demo shell is shared by all three demos, and R-1.2 binds the package source | One shared shell for all demos | accepted | architecture |
| [0021](0021-the-styles-load-themselves-and-touch-nothing-else.md) | The styles load themselves, and they touch nothing else | Stylesheets load themselves, no global effects | accepted | architecture |
| [0022](0022-the-schedule-is-a-package-that-depends-on-core-and-charts.md) | The schedule is a package, and it depends on `@umriss-ui/core` and `@umriss-ui/charts` | Schedule package depends on core and charts | accepted | architecture |
| [0023](0023-editing-is-controlled-the-schedule-reports-intents.md) | Editing is controlled: the schedule reports intents | Schedule reports edits, caller applies them | accepted | schedule |
| [0024](0024-the-formats-are-english-german-is-freight.md) | The formats are English, and German is freight | Default formats English, German formats shipped | accepted, extended by ADR-0061 (the CSV follows the language in use) | language |
| [0025](0025-a-lane-group-is-structure-over-lanes-never-a-lane.md) | A lane group is structure over lanes, never a lane | Lane groups structure lanes, hold no work | accepted | schedule |
| [0026](0026-span-leaves-charts-occupancy-is-the-schedules.md) | Span leaves charts; occupancy is the schedule's | Occupancy drawing moves from charts to schedule | accepted | charts |
| [0027](0027-a-calculation-is-written-as-it-is-shown.md) | A calculation is written as it is shown | Calculations are written as they are shown | accepted | calculation |
| [0028](0028-a-calculation-is-a-tree-or-a-chain.md) | A calculation is a tree or a chain | Calculation as tree or chain | accepted | calculation |
| [0029](0029-a-row-groups-form-follows-its-level.md) | A row group's form follows its level | Table row groups: header or span | accepted | table |
| [0030](0030-a-chart-is-one-tab-stop-that-walks-its-hits.md) | A chart is one tab stop that walks its hits | Chart keyboard: one tab stop | accepted, amended by ADR-0047 (zoom by key wherever an x axis is zoomable) and on 2026-10-10 (the zoom keys without a tooltip) | charts |
| [0031](0031-the-charts-carry-their-own-wording.md) | The charts carry their own wording | Charts bring their own texts | accepted | charts, language |
| [0032](0032-what-umriss-is-not.md) | What umriss is not | What umriss deliberately does not build | accepted, superseded in two points by ADR-0052 (the x axis reads categories; still no band scale) and by ADR-0059 (the set of kinds is open; horizontal bars are the first to come); extended by ADR-0060 | scope |
| [0033](0033-the-schedules-keys-walk-past-the-view.md) | The schedule's keys walk past the view | Schedule keyboard walk continues outside the view | accepted | schedule |
| [0034](0034-the-table-becomes-a-grid-only-on-request.md) | The table becomes a grid only on request | Table grid mode only when requested | accepted, amended by ADR-0036 (the first click edits) | table |
| [0035](0035-umriss-is-for-data-dense-applications.md) | umriss is for data-dense applications, not for plants alone | Target audience: data-dense applications | accepted | scope |
| [0036](0036-a-grid-edits-on-the-first-click-and-saves-rows-on-purpose.md) | A grid edits on the first click, and saves rows on purpose | Grid cells edit on first click | accepted | table |
| [0037](0037-the-demos-are-addressed-by-path-and-prerendered.md) | The demos are addressed by path and prerendered, so that a search engine can read them | Demo pages get paths and prerendering | accepted | demo |
| [0038](0038-a-calculation-can-carry-several-metrics.md) | A calculation can carry several metrics | Calculations with several parallel metrics | accepted | calculation |
| [0039](0039-an-icon-button-names-itself-once.md) | An icon button names itself once, and shows that name | Icon buttons name themselves once | accepted | components |
| [0040](0040-a-box-carries-its-outliers.md) | A box carries its outliers | Box plots carry their outliers | accepted | charts |
| [0041](0041-a-fields-width-never-follows-what-it-shows.md) | A field's width never follows what it shows | Field width ignores its content | accepted | components |
| [0042](0042-a-rows-height-never-follows-what-it-shows.md) | A row's height never follows what it shows | Table row height ignores its content | accepted | table |
| [0043](0043-the-select-draws-its-own-list-under-a-pointer.md) | The select draws its own list under a pointer and the keys | Select draws its own list | accepted | components |
| [0044](0044-every-export-has-a-place-on-the-site.md) | Every export has a place on the site | Every export gets an API index entry | accepted | demo |
| [0045](0045-tokens-are-the-styling-api-data-attributes-are-not.md) | Tokens are the styling API; data attributes are not | Styling through tokens, not data attributes | accepted | components |
| [0046](0046-the-site-renders-the-workspaces-own-documents.md) | The site renders the workspace's own documents | Demo site renders the repository's documents | accepted | demo |
| [0047](0047-a-component-holds-its-own-view.md) | A component holds its own view | Components keep their own view state | accepted | architecture |
| [0048](0048-charts-are-bound-to-their-rows-by-the-hook.md) | Charts are bound to their rows by the hook | Charts take rows through a hook | accepted | charts |
| [0049](0049-a-sum-takes-rows-from-data.md) | A sum takes rows from data, and a line shows its contribution | Sums over rows from data | accepted | calculation |
| [0050](0050-a-chart-fills-its-frame-never-below-its-floor.md) | A chart fills its frame, never below its floor | Chart fills its frame, with a minimum | accepted | charts |
| [0051](0051-a-calculation-follows-the-density.md) | A calculation follows the density | Calculation spacing follows density | accepted | calculation |
| [0052](0052-a-chart-reads-its-rows-as-they-come.md) | A chart reads its rows as they come | Charts read rows and categories directly | accepted, supersedes ADR-0002 and ADR-0032 in one consequence each | charts |
| [0053](0053-a-milestone-is-a-mark-on-a-lane.md) | A milestone is a mark on a lane, not a piece of work | Milestones are marks, not work | accepted | schedule |
| [0054](0054-a-histogram-is-a-helper-for-bar-not-a-chart-kind.md) | A histogram is a helper for Bar, not a chart kind, and its last bin is closed | Histogram helper for bars | accepted | charts |
| [0055](0055-the-summary-names-labelled-limits-the-tooltip-only-on-request.md) | The summary always names labelled limits, and the tooltip only on request | Chart summary and tooltip name limits | accepted | charts |
| [0056](0056-a-chart-reports-a-chosen-hit-and-holds-no-selection.md) | A chart reports a chosen hit and holds no selection | Chart reports a hit, keeps no selection | accepted | charts |
| [0057](0057-the-alarm-list-offers-snoozing-the-application-decides.md) | The alarm list offers snoozing and reports it, and the application decides | Alarm snoozing (withdrawn) | withdrawn. The alarm list was removed from `@umriss-ui/table`, so this decision no longer applies to any code. | limits and alarms |
| [0058](0058-a-skill-points-an-agent-at-the-documentation.md) | A skill points a coding agent at the documentation, and there is no MCP server | Agent skill instead of an MCP server | accepted | architecture |
| [0059](0059-the-set-of-chart-kinds-is-open.md) | The set of chart kinds is open, and a kind is added when it answers a question no kind there answers better | Chart kinds are an open set | accepted, supersedes ADR-0032 in two points | charts |
| [0060](0060-validation-and-a-layout-editor-are-never-time-zones-not-yet.md) | Form validation and a dashboard a user arranges are never built, and time zones are not yet | Never built: form validation, layout editor, time zones | accepted, extends ADR-0032; superseded in one point by ADR-0064 | scope |
| [0061](0061-the-csv-follows-the-language-in-use.md) | The CSV follows the language in use | CSV follows the active language | accepted, extends ADR-0024 | table, language |
| [0062](0062-react-19-is-the-floor.md) | React 19 is the floor: the peers are `>=19`, a component takes `ref` as a prop and is never wrapped, and no code reads React's version | React 19 is the floor | accepted | core, packages |
| [0063](0063-inside-a-modal-dialog-the-toasts-and-the-tooltips-stand-in-the-top-layer.md) | Inside a modal dialog the toasts and the tooltips stand in the top layer, and everywhere else the token scale orders them | Toasts above a modal | accepted | core, table |
| [0064](0064-a-dashboard-a-user-arranges-is-a-sequence-on-fixed-columns.md) | A dashboard a user arranges is built: a sequence of widgets at named sizes on columns that never change in number | Dashboard a user arranges | accepted, supersedes ADR-0060 in one point | scope, dashboard |

The vocabulary these decisions are written in stands in [`CONTEXT.md`](../../CONTEXT.md).
