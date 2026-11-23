# What `.scratch` still holds

Research for ticket 14. It reads, proposes, decides nothing. Read on the branch `worktree-release-1-0-map` (HEAD
`553b4bd0`, packages at 0.56.0), 2026-11-23. "Built" was checked against `packages/<pkg>/API.md`, the
`CHANGELOG.md` files and `docs/adr/` (0066-0082 all exist), not against status lines.

## Summary

| Folder | What it is | Still open | Proposal |
| --- | --- | --- | --- |
| `after-shakedown` | map + order of 25 decision tickets | nothing | delete |
| `alarm-management` | requirements draft | nothing | delete |
| `chart-navigator` | spec, `needs-triage` | the whole thing | after 1.0 |
| `demo-rework` | spec + 30 tickets + page research | nothing | delete |
| `local-docs` | spec + 3 tickets | one box of one ticket | before 1.0 (a person's act), then delete |
| `open-points-roadmap` | roadmap spec + `next.md` | package C remainder | after 1.0 (remainder); delete the rest |
| `security-hardening` | spec + ticket 07 | ticket 07 | before 1.0 (a person's act), then delete |
| `shakedown` | first shakedown's reports (27 files) | nothing | delete |
| `shakedown-2026-10-28` | second shakedown | nothing | delete |
| `shakedown-2026-10-31` | third shakedown, 42 tickets, throwaway hosts | nothing | delete (matrices may move) |
| `shakedown-defects` | spec, `done` | nothing | delete |
| `straighten-0-49` | spec, `done` | nothing | delete |
| `table-fills-its-frame` | spec, `done` | nothing | delete |
| `touch-scale-opt-in` | spec, `done` | nothing | delete |

Why fifteen folders stand despite "a folder is deleted when its last ticket is done": all the tickets of the
spec-only folders are gone (their work shipped), but the spec file itself stayed because the rule names tickets,
not specs. Of the 13 folders that held tickets, only `local-docs` and `security-hardening` still hold open ones.

Before deleting: see "References that would dangle" at the end.

## Per folder

### `after-shakedown` - delete
- Holds `map.md`, `order.md` and 25 tickets, every one `Status: resolved`. The map's destination (a decision or
  spec outline per shakedown topic) was reached.
- The 27 specs and 158 tickets it cut were built and their folders deleted: `.scratch/` has none of
  `test-runners`, `root-contract`, `plant-time-zone`, `alarms` and so on. The thirteen ADRs it numbered
  (0066-0078) exist in `docs/adr/`. `packages/alarms/CHANGELOG.md` shows the package released and in step at 0.56.0.
- Overtaken by: the ADRs, the packages' CHANGELOGs, and ADR-0066's upgrade promise.
- Open tickets: none.

### `alarm-management` - delete
- `requirements.md`, `Status: draft - input for /grill-with-docs` (2026-10-24), the persona's wishes plus the
  coordinator's eight decisions.
- Overtaken by `@umriss-ui/alarms` (ADR-0078, after-shakedown tickets 08-11, released and at 0.56.0; its `API.md`
  exists). The old code it points to (`e027d1f7^`) is history.
- Open tickets: none. Unbuilt spec: none (the draft was never a spec; its content was decided in after-shakedown 10 and 11).
- Not taken, by decision: a louder annunciator variant, horn, latched alarms, statistics views, "diagnostic"
  level (shakedown-2026-10-28 spec, Out of Scope). Capabilities, additive, not 1.0 work.

### `chart-navigator` - after 1.0
- `spec.md`, `Status: needs-triage` (2026-10-11), "waits for a design session". It decides nothing and holds
  ten open questions plus a table of how Recharts, MUI X, ECharts and Highcharts do it.
- Unbuilt: the whole navigator. Absent from `packages/charts/API.md`; ADR-0032 does not forbid it;
  `packages/charts/docs/capabilities.md` lists it under "Later".
- Capability, not polish. Could be added without a break: it would be a new registered part beside `Tooltip`,
  `Legend` and `DataTable`, reading `domains` and writing through the scene's existing pan and zoom entry
  points (ADR-0047). It needs no change to a present prop.
- Open ticket: none written. One unbuilt spec (this one, unreviewed).

### `demo-rework` - delete
- `spec.md`, `research-component-pages.md` and tickets 01-30. Every ticket is `done`. The spec's header line
  ("ticket 30 ... ready-for-human") is stale: ticket 30's own file says it was closed as overtaken on 2026-10-10,
  its pages having been rebuilt by `.scratch/docs-roadmap/` (gone) and accepted 4 Oct.
- Overtaken by: the shell, scenarios and component pages that exist in `packages/*/demo`, ADR-0035, the
  `docs/research/component-docs-2026-10/` study.
- Open tickets: none. Unbuilt spec: none.
- `research-component-pages.md` is a 26 KB study; `docs/research/component-docs-2026-10/asis_site_ux.md` and
  `packages/charts/demo/outline.ts` point at the folder. Repoint or move the study to `docs/research/` first.
- The spec's remaining sentence "visual baselines wait on `demo-rework-baselines`" is overtaken: the ticket says
  baselines were renewed since.

### `local-docs` - before 1.0 (one manual step), then delete
- `spec.md` (header still `ready-for-agent`, stale) and three tickets.
- Tickets 01 "The site builds and runs locally, at one address" and 02 "The documents say how the documentation is
  opened, and nothing names the old site": `done`. ADR-0065 and `docs/README.md` show it built.
- **Open ticket: "The hosted site is switched off"** (`ready-for-human`). Every box is ticked except one: the
  Google Search Console, "Indexing -> Removals -> prefix removal of the old address; later Settings -> Remove
  property". That is the maintainer's, in Google's interface; no source change.
- Why before 1.0: the old hosted address would still be indexed when `1.0.0` is announced. It costs a few
  minutes and touches no code. After it is ticked the folder can go.
- Unbuilt spec: none.

### `open-points-roadmap` - delete the delivered, carry package C after 1.0
- `spec.md` (`ready-for-agent`, 2026-10-11) and `next.md` ("Where the work stands", 11 Oct). Both predate the
  shakedowns.
- Package A: released 0.33.0 (stated in the spec). Package B (`table-server-mode-2`, `table-xlsx`,
  `chart-range-selection-and-navigator`): release 3 of after-shakedown's order; ADRs 0072-0074 exist.
  `docs/adr/0082` covers groups from the server.
- Package C, "each a spec of its own", checked against the API files and CHANGELOGs:

  | Piece | State |
  | --- | --- |
  | avatar | built (`Avatar` in core's `API.md`, shakedown-2026-10-31 ticket 34) |
  | print stylesheet | built (0.52.0 charts, calculation, alarms; shakedown-2026-10-31 tickets 27-28) |
  | groups from the server | built (ADR-0082, ticket 38-39) |
  | dependencies across tasks | built (`Dependencies`, `ripple`, `violatedDependencies` in the schedule's `API.md`) |
  | line colour by limit | unclear: a limit's own `color` exists since charts 0.10.0; whether the C item meant more is not stated |
  | horizontal bars | not built: no horizontal orientation on a bar in charts' `API.md` (`orientation` there is only a limit's) |
  | stacked overlap in the schedule | not found in `API.md` (only `overlaps` as a finding) |
  | utilisation line under the plan | not built (core's `Meter` only) |
  | timeline (events list) | not built |
  | saved views | not built |
  | navigator | see `chart-navigator` |
  | Sankey, bullet graph | not built, "when their case is there" |

  All unbuilt pieces are capabilities that can be added without a break (new component, new kind, new optional
  prop). Horizontal bars and stacked overlap touch existing parts (Bar, Schedule) and need a look at whether a
  default would change; none is polishing.
- Loose ends in `next.md`, both outside any folder now: `search-visibility` 05 (the sitemap, Bing) and the
  VoiceOver pass of the listbox announcements are "put aside, not closed", but neither folder exists in `.scratch/`.
  The sitemap point is the same Search Console matter as `local-docs` 03; the VoiceOver pass is real-device work
  (the shakedown notes "no real screen readers" as a standing gap). "Four browser cases written and not run"
  (`rows-that-keep-arriving.spec.ts`, `fixme`): not re-checked here.
- Decision G2, "1.0 is not a goal now", is what ADR-0066 says and what this map supersedes.
- Open tickets: none. Unbuilt specs: none written; package C is a list of titles.
- `docs/README.md` has a row pointing to `next.md` ("where the work stands"); it would need a new target.

### `security-hardening` - before 1.0 (a person's act), then delete
- `spec.md` (header `ready-for-human`) and ticket 07; tickets 01-06 are gone (done): ADR-0073 stands, Semgrep
  exists (`pnpm semgrep` in CLAUDE.md), the publish workflow is split (`docs/releasing.md`).
- **Open ticket: "07 - The settings only a person can make"** (`ready-for-human`, size S). All unchecked:
  - GitHub environment `npm`: required reviewer, branches limited to `main`;
  - npm, each of the seven packages: "Require two-factor authentication and disallow tokens";
  - GitHub branch `main` protected with the CI and Semgrep checks required;
  - GitHub Actions: "Require actions to be pinned to a full-length commit SHA";
  - the next release goes out with the reviewer's approval, green in both publish jobs;
  - left from 01-06: first CI run's `semgrep` job green; a manual Publish run on a commit that publishes
    nothing; the first grouped Dependabot pull request looks as intended.
  Whether some are done in the web interface since the ticket was written cannot be seen from the repo
  (the ticket's boxes were not ticked afterwards); the ticket's own `baseline-browser-mapping` box is ticked.
- Why before 1.0: the release path is what a 1.0 promise rests on, and the settings are not in source.
  It adds no capability and breaks no caller.
- The spec's "Out of Scope" names "a `SECURITY.md` with a disclosure policy (worth doing; a separate, smaller
  change)". Neither `SECURITY.md` nor `.github/SECURITY.md` exists; a candidate for the 1.0 packaging list.
- Unbuilt spec: none (the spec is built; only the person's settings remain).

### `shakedown` - delete
- 27 reports of the first shakedown (2026-10-24), each `needs-triage`, plus a `README.md` with the order of work.
- Step 2 (defects): `shakedown-defects`, `done`. Steps 3-5 (decisions, wishes, alarms): `after-shakedown`,
  all resolved and built. The README's own list says the leftovers (misfits, looks) "need a triage of their
  own": that triage was `shakedown-2026-10-31/earlier-runs-open.md`, which re-read every defect against 0.51.0
  and took the open ones into its spec (done).
- Open tickets: none. Unbuilt specs: none.
- Caveat: I did not verify each of the ~150 lines of `earlier-runs-open.md` against what 0.51.0-0.56.0 did.
  Its spec is `done` and says it took them; the lines most likely still true are the ones the spec's Out of
  Scope names as kept by judgement (see the next two folders).

### `shakedown-2026-10-28` - delete
- `spec.md` (`done`, delivered in 0.49.0), `README.md`, a `table-feature-matrix.md`, eight persona reports.
- Overtaken by: its spec (22 tickets, 0.49.0), then `straighten-0-49` (0.50.0), then the third shakedown.
- Open tickets: none. Unbuilt specs: none.
- Decided and kept, not defects (its Out of Scope; ADR-0032 stands): range selection, paste and Delete, fill handle,
  infinite scroll, column virtualisation, styled Excel, header drag, context menu, pinned rows, runtime pivot,
  row drag, cell merge, formulas, RTL; sorting by clicking the whole header cell; `hourCycle` and a 12-hour
  panel; a size prop for alarms; an app bar, a chart `title`, a page reset, an initial-focus prop.

### `shakedown-2026-10-31` - delete (the three matrices may move first)
- `spec.md` (`done`), `README.md`, `run.md`, `earlier-runs-open.md`, three matrices, 42 tickets (all `done`,
  including the field contract ADR-0081 and its old-name removal, ticket 42) and `reds/` (about 700 KB: throwaway
  hosts, probes and red tests of the run).
- Overtaken by: its own spec, delivered; ADRs 0080-0082.
- Open tickets: none. Unbuilt specs: none.
- Reusable material: `table-feature-matrix.md` (also in 10-28), `core-coverage-diff.md`, `form-libraries-matrix.md`
  compare umriss with AG Grid, MUI X, Mantine, TanStack and others. They are research, not work; they would
  fit `docs/research/` if the maintainer wants to keep them. `reds/` is only evidence for fixed defects.
- Its Out of Scope is the longest list of "decided and kept" and is the best source for the polishing review:
  "Kept as they are, by judgement" - a Stat as a flex item, the Drawer as full screen at 375 px, the chart's data
  card beside core's tooltip, the clipboard text without a formula guard, control characters in CSV,
  no React-version check (ADR-0062), a changed `initialView` after mount ignored, the calculation's minus,
  old rows under a new page in server mode without `loading`; and "Wishes not taken" (TagsInput, PinInput,
  Chip, `useMediaQuery`, Dropzone progress, a theme object; table: cell merge, floating filters, bulk edit, row
  drag, PDF, status bar, delta API, nested column groups, `maxWidth`, comparator, RTL). All are additive, so
  none blocks 1.0; the first group is where a name or behaviour might still be reconsidered before it is frozen.

### `shakedown-defects` - delete
- `spec.md`, `Status: done`: the confirmed defects of the first shakedown (Modal closing on a click inside a
  Popover, SSR toast, CSV formula injection, calculation rounding, and so on). Delivered; the README of
  `shakedown/` marks step 2 delivered 2026-10-24.
- Open tickets: none. Unbuilt spec: none.

### `straighten-0-49` - delete
- `spec.md`, `Status: done`, delivered in 0.50.0 (its Comments). 16 tickets, none left.
- Overtaken by: the release it names. Its Out of Scope holds one design question that could matter at 1.0 and
  is not recorded elsewhere: "Space tokens in `rem` (row padding grows with the controls but not with the root
  font; whether the spacing scale should follow the root size is a design decision of its own)", and
  "centred versus start-aligned group labels (no decision asked for)". If either is wanted, it has to be copied
  into the map's polishing candidates before deletion.
- Open tickets: none.

### `table-fills-its-frame` - delete
- `spec.md`, `Status: done` (2026-10-30), decisions of the user, ADR-0080 "a page is what its frame holds".
- Open tickets: none. Unbuilt spec: none.
- `docs/research/table-height-and-paging-2026-10/report.md` cites the folder; repoint to ADR-0080.

### `touch-scale-opt-in` - delete
- `spec.md`, `Status: done` (2026-10-28), ADR-0079 "the size is the application's, the hit area the library's".
- Open tickets: none. Unbuilt spec: none.

## Open tickets, by title (all of them)

1. `local-docs` - "The hosted site is switched off" (`ready-for-human`; one box: the Google Search Console removal).
2. `security-hardening` - "07 - The settings only a person can make" (`ready-for-human`; GitHub and npm settings
   plus the first watched release).

No other ticket in the fifteen folders is open: after-shakedown 01-25 are `resolved`, demo-rework 01-30 are
`done`, shakedown-2026-10-31 01-42 are `done`, local-docs 01-02 are `done`.

## Unbuilt specs and unwritten specs, by title

- `chart-navigator` - "A navigator shows the whole course" (`needs-triage`, undecided).
- `open-points-roadmap` package C remainder: horizontal bars, stacked overlap in the schedule, the utilisation
  line, timeline, saved views, (the navigator), Sankey and bullet graph. Titles only; no spec was written.
- Specs whose status line is stale but whose work is built: `local-docs` (`ready-for-agent`),
  `open-points-roadmap` (`ready-for-agent`), `security-hardening` (`ready-for-human`),
  `demo-rework` (header names ticket 30 as open).

## For the polishing map, not for deletion

Facts a 1.0 review might want that live only here:
- the "decided and kept" and "wishes not taken" lists above (shakedown 10-28 and 10-31 Out of Scope);
- the spacing-scale and group-label notes in `straighten-0-49`;
- the `needs-triage` navigator;
- the two ready-for-human tickets.

## References that would dangle on deletion

Found by searching `docs/`, `packages/`, `CONTRIBUTING.md`, `README.md`, `CONTEXT.md`, `CLAUDE.md` (the frozen
`docs/journal.md` excluded):

- `shakedown`: `docs/README.md`, `docs/adr/0081-...md`, `docs/agents/shakedown/brief.md`, `docs/agents/shakedown/README.md`.
- `shakedown-2026-10-31`: `docs/adr/0081-...md`.
- `open-points-roadmap`: `docs/README.md` (two rows).
- `chart-navigator`: `packages/charts/docs/capabilities.md` (keep this folder, so no break).
- `demo-rework`: `docs/research/component-docs-2026-10/asis_site_ux.md`, `packages/charts/demo/outline.ts`.
- `table-fills-its-frame`: `docs/research/table-height-and-paging-2026-10/report.md`.
- No outside reference: after-shakedown, alarm-management, local-docs, security-hardening, shakedown-2026-10-28,
  shakedown-defects, straighten-0-49, touch-scale-opt-in.

## Not checked

- Whether the settings in `security-hardening` 07 were made in the GitHub and npm interfaces since the ticket
  was written (not visible from the repo).
- The Search Console state.
- Each line of `shakedown-2026-10-31/earlier-runs-open.md` against current source.
- Package C items by anything other than `API.md` and CHANGELOG text; "line colour by limit" is unresolved.
- Whether the four `fixme` browser cases of `rows-that-keep-arriving` still exist.
