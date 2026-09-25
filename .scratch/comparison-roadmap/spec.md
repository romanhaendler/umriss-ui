# From the library comparison to work

Status: done
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026; its notes in
`docs/research/library-comparison-2026-09/`.

The comparison's verdict: umriss loses as a general component library and has
hardly any competition as a plant library. So the work closes what an evaluator
trips over first, and then widens only the distance nobody else can close -
accessibility to the last chart and plan, the standards, docs an agent can read.
Breadth against AG Grid and ECharts is deliberately not the goal.

## The specs, in order

| Order | Spec | Priority | Why here |
| --- | --- | --- | --- |
| 1 | `core-passthrough` | must | The first integration obstacle; its guard makes every later component born right |
| 1 | `non-goals-and-honest-docs` | must | Cheap, and it fixes what undercuts trust |
| 2 | `core-foundations` | must | Switch, Slider, Drawer, ProgressBar, Accordion, Breadcrumb |
| 2 | `ai-readable-docs` | must | The largest lever for adoption; material already exists |
| 3 | `schedule-a11y` | must | The one package below the library's own accessibility level |
| 3 | `charts-alternatives` | must | Data table and an encoding without colour |
| 3 | `forced-colors` | should | Nobody documents it; umriss can lead |
| 3 | `listbox-announcements` | should | VoiceOver's known gap in our pattern |
| 4 | `alarm-standards` | should | Makes the moat standard-proof (ISA-18.2, ISA-101) |
| 4 | `control-room-demo` | should | Shows the moat at a glance |
| 5 | `table-grid-mode` | must | Editing and cell navigation; builds on the pattern of step 3 |
| 5 | `table-server-mode` | must | Archives and histories |
| 6 | `charts-stacking`, `table-column-pinning`, `core-layout-extras` | should | Common asks, useful on a plant |

Specs of one step are independent of each other and can run in parallel.

## Later ("can"), not specified yet

Tree data, clipboard, XLSX export, saved views, the schedule's utilisation view
and print, Avatar, Timeline. Each waits for a caller who needs it.

## Deliberately not

Recorded by `non-goals-and-honest-docs` as ADR-0032.

## Comments

**Delivered (2026-09-25).** All fifteen specs are implemented and merged, each
with its final polish round taken on a review page. Still with the user: the
VoiceOver pass of `listbox-announcements` 02, and the release.
