# The order of the work after the shakedown

Status: ready-for-agent
Date:   2026-10-25
Origin: the map beside this file, whose last open point this page settles. The maintainer left the order
to the agent ("Entscheide du").

158 tickets in 30 specs: the 27 specs of the map, plus package B of `.scratch/open-points-roadmap/`
(`table-server-mode-2`, `table-xlsx`, `chart-range-selection-and-navigator`). They are cut into six
releases here. Each release ends after the maintainer has looked at it by hand, with the full check of
`docs/agents/` and a release commit. Within a release a ticket starts as soon as its `Blocked by` is done,
so specs in the same release may run in parallel.

## How it was decided

- **Package B goes in, package C waits.** B is specified and ready, so it runs in release 3. C has no
  specs yet (`open-points-roadmap/next.md`, "After that"). It follows release 6, because the
  shakedown's needs came from 30 host applications and C's did not.
- **The contract comes first.** The upgrade promise says how a rename is shipped. The root contract
  renames props across all packages. Everything built after them is built on the names that stay.
- **A rename costs two releases.** `root-contract` 10 removes the aliases kept for one minor, so it sits
  in the release after the contract.
- **The time comes before the alarms.** An alarm list shows instants, so `alarms` is born on the plant
  time zone and the number formats. It needs no other spec's ticket and gets its own release, because it
  is a new package that is published by hand (`alarms` 11).
- **The ticket graph was checked:** no cycle, no reference to a missing ticket, and each spec waits only
  on specs of its own release or an earlier one. The longest chain is nine tickets.

## The releases

### 1 - The ground (24 tickets)

| Spec | Tickets | What |
| --- | --- | --- |
| `test-runners` | 4 | Vitest and Jest load umriss with the lines its README gives |
| `upgrade-promise` | 6 | Release in step, aliases for one minor, TypeScript 5.4 floor |
| `theming-recipe` | 5 | A token file to copy, the layer order, three new tokens |
| `scroll-in-a-widget` | 2 | A widget body scrolls what exceeds its size |
| `table-columns-from-the-data` | 2 | A column keeps its accessor only under its id; the pivot recipe |
| `server-components` | 5 | What umriss promises a Server Component |

### 2 - The contract (35 tickets)

| Spec | Tickets | What |
| --- | --- | --- |
| `root-contract` | 9 (01-09) | Four shapes of root, `aria-label`, code-driven actions on the hook |
| `views-in-their-frame` | 4 | A table stays within its frame, a schedule fills it and takes `loading` |
| `number-formats` | 5 | One number format for columns, series and axes |
| `under-a-finger` | 11 | 44 px under a finger, long press, the floor check |
| `linked-views` | 6 | A current row; trace a batch; drill-down |

### 3 - Package B and the warnings (33 tickets)

| Spec | Tickets | What |
| --- | --- | --- |
| `root-contract` | 1 (10) | The deprecated names go |
| `table-server-mode-2` | 8 | A late answer, an error, all that match, export, sums, search debounce |
| `table-xlsx` | 5 | XLSX through `@umriss-ui/table/xlsx`; the CSV writes a day as its day |
| `chart-range-selection-and-navigator` | 6 | A chart reports a range; a chart filters a table |
| `chart-picture-and-print` | 4 | `toPng()` and print at the page's width |
| `dev-warnings` | 9 | Seven silent traps warn in DEV |

### 4 - Time and pickers (24 tickets)

| Spec | Tickets | What |
| --- | --- | --- |
| `date-jump-and-typed-entry` | 6 | Month and year jump, typed entry, `min` and `max` |
| `plant-time-zone` | 8 | An IANA `timeZone` every package reads |
| `long-option-lists` | 3 | A windowed and async listbox |
| `core-small-additions` | 4 | `MoreGlyph`, the palette shortcut, a label beside its field |
| `data-quality` | 3 | Quality as a third axis on `Stat` and `Given` |

The two time specs interleave by ticket: `plant-time-zone` 04 waits for `date-jump-and-typed-entry` 03
and 04, and `date-jump-and-typed-entry` 06 waits for `plant-time-zone` 04.

### 5 - The wishes (31 tickets)

| Spec | Tickets | What |
| --- | --- | --- |
| `dashboard-small-wishes` | 5 | `headingLevel`, stored options, the never lines |
| `dashboard-locked-widget` | 2 | A widget a reader cannot move |
| `table-small-wishes` | 5 | Shift-click ranges, a view that survives JSON, a column drag |
| `schedule-keyboard-and-reader` | 3 | `+`, `-` and `0` zoom the plan; the plan as a table |
| `charts-small-additions` | 4 | Side legend, `maxGap`, month ticks, `bin` on a typed column |
| `charts-floating-bar` | 2 | `baseline` on `Bar`: waterfall and error bars |
| `charts-matrix-reading` | 2 | A colour bar and cell labels |
| `charts-recipes` | 8 | Eight recipes in the charts demo |

### 6 - Alarms (11 tickets)

| Spec | Tickets | What |
| --- | --- | --- |
| `alarms` | 11 | `@umriss-ui/alarms`, first release by hand |

### After that

Package C of `.scratch/open-points-roadmap/spec.md`, in its own order. Each piece needs a spec first,
some a grilling. The navigator (`.scratch/chart-navigator/`) is one of them.

## ADR numbers

Thirteen tickets write a new ADR. Specs may run in parallel worktrees, so the numbers are given here and
not taken as "the next free one". Each of these tickets names its number in its head.

| ADR | Ticket | Release |
| --- | --- | --- |
| 0066 | `upgrade-promise` 01 | 1 |
| 0067 | `server-components` 01 | 1 |
| 0068 | `root-contract` 01 | 2 |
| 0069 | `number-formats` 01 | 2 |
| 0070 | `under-a-finger` 01 | 2 |
| 0071 | `linked-views` 01 | 2 |
| 0072 | `table-server-mode-2` 01 | 3 |
| 0073 | `table-xlsx` 01 | 3 |
| 0074 | `chart-range-selection-and-navigator` 01 | 3 |
| 0075 | `chart-picture-and-print` 01 | 3 |
| 0076 | `plant-time-zone` 01 | 4 |
| 0077 | `data-quality` 01 | 4 |
| 0078 | `alarms` 01 | 6 |

An ADR written outside this list takes the next number after the highest one in `docs/adr/` and this table.

## Not in this order

- `.scratch/shakedown/`: the findings that are neither a decision nor a wish. They are defects or polish
  and need a triage of their own, as step 2 had.
- `.scratch/demo-rework/` 30 and `.scratch/local-docs/` 03: both are `ready-for-human`.
