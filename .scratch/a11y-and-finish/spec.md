# Spec: Accessibility on every page, and the last rough edges

Status: done

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/demo-rework/spec.md` (the page skeleton and its Keyboard section), `.scratch/demo-rubrics/spec.md` (the page fields of the outline), `docs/standards.md` and the accessibility suites of all five demos.
Blocked by: `types-without-holes` (S3), for items 4 and 5 under **Finishing** only. Everything else can start at once.
ADR: none.
Tickets: `issues/01`–`07`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

umriss sells itself on accessibility — ISA-101, forced colours, a focus guard,
a keyboard walk through charts and schedules — and its documentation tells a
reader about it unevenly.

- **Keyboard tables** stand on 31 of core's 54 pages, but on 11 of the
  table's 30, 5 of the schedule's 26, 1 of the charts' 15 and 1 of the
  calculation's 8. A chart page shows a focusable chart with a full keyboard
  walk and says nothing about it; the reader has to know that the Chart page
  holds the keys.
- **There is no accessibility section at all.** What a component exposes to a
  screen reader, what it announces and when, and what label the caller must
  supply stand in `about` paragraphs where an author happened to put them, or
  nowhere. Radix, Carbon, React Aria and Base UI all give it a section of its
  own (`component_api_reference`).

And a handful of visible blemishes remain from the inventory (`asis_site_ux`):

- the scenarios' "Code" toggle is a bare word, while every example's toggle has
  a chevron;
- on a phone, callout mark 5 on core's landing covers the title
  "Checkout slow, card payments time out";
- on a phone, the table scenario's pinned action column covers half the table
  at rest, and the first data column is cut to three letters;
- in a type cell a long union runs on one line;
- a named type in a cell is a link (after `types-without-holes`) but gives no
  preview, so every glance at a definition is a jump.

## Solution

**Two page fields and one rule.** The outline's page gains `accessibility`
(at most three short paragraphs) and `keysOf` (the pages whose keyboard tables
apply here, in this demo or a neighbour's). A browser check walks every page
of every demo: a page whose examples contain anything in the tab order must
carry a Keyboard section — its own table, or `keysOf`, or both; a page whose
examples contain a live region or a status-like role must carry an
Accessibility section. The pages that fail today get their sections in this
spec. From then on a new page cannot ship silent.

**Five finishing items**, each with its own acceptance: the scenarios' Code
toggle, the callout marks on a narrow stage, the scenario tables on a phone,
long unions in type cells, and a preview on type links.

## User Stories

1. As a keyboard user on a chart page, I want the page to tell me the chart's keys, so that I do not have to guess that they stand on the Chart page.
2. As a keyboard user, I want "The keys of Chart apply here" to link to that table, so that the keys are one click away and never copied wrong.
3. As a keyboard user on a table feature page, I want the keys of the controls in it named — core's Select, core's Menu — so that I know where their behaviour is described.
4. As a keyboard user on a schedule page, I want the plot's keys linked from every page that shows a plot, so that each feature page is complete on its own.
5. As a keyboard user on the Dependencies page, I want the dependency walk (`]`, `[`, `t`) in that page's own table, so that the keys of the feature stand with the feature.
6. As a keyboard user on a core page like Button, I want even native keys stated, so that I can rely on every interactive page having a Keyboard section.
7. As a screen-reader user, I want each component page to say what role and name it exposes, so that I know what my reader will say.
8. As a screen-reader user, I want to know what the component announces and when, so that I am not surprised by live updates in a monitoring screen.
9. As a developer, I want to know what label I must supply, so that I do not ship an unnamed control.
10. As a developer building for forced colours, I want a page to say where the component behaves differently there, so that I can trust it in high contrast.
11. As an accessibility reviewer, I want the section in the same place on every page, so that I can audit the library page by page.
12. As a coding agent, I want the Accessibility section and `keysOf` in the llms text and the `.md` twin, so that I generate accessible code.
13. As a maintainer, I want a page with tabbable content and no Keyboard section to fail the browser check, so that the gap cannot reopen.
14. As a maintainer, I want a page with a live region and no Accessibility section to fail too, so that announcements are always documented.
15. As a maintainer, I want the check's exceptions written in the check with a reason, so that every silence is a decision.
16. As a maintainer, I want `keysOf` validated at load time like `builtFrom`, so that a renamed page cannot leave a dead link.
17. As a reader of a scenario, I want its Code toggle to look and behave like an example's, so that one control means one thing everywhere.
18. As a reader on a phone, I want callout marks never to cover text, so that the scenario stays legible.
19. As a reader on a phone, I want a scenario's table to show its data columns, so that the screen does not look broken.
20. As a reader of a props table, I want a union of many members broken one per line, so that I can read the values.
21. As a reader, I want hovering or focusing a named type to preview its definition, so that I can check a shape without leaving the row.
22. As a keyboard user, I want that preview on focus and dismissed by Escape, so that it is not a mouse-only feature.
23. As a maintainer, I want the preview to show the same definition block the page already holds, so that there is one source for it.

## Implementation Decisions

### The page fields

- `accessibility?: readonly string[]` — at most three short paragraphs in the
  outline's text format (backticks and `[link](#/page)`). In this order, each
  only where it says something: the role and accessible name the component
  exposes and where the name comes from; what it announces, through which live
  region, and when; what the caller must supply (a label, a description) and
  what happens without it; where forced colours or reduced motion change it.
- `keysOf?: readonly (string | ForeignPage)[]` — page ids of this demo, or a
  neighbour's page in the `{ name, page }` form `builtFrom` already uses
  (`"@umriss-ui/core#select"`). Validated at load time exactly as `builtFrom`
  is: an unknown id fails with the file and the id.

### Rendering

The Keyboard section shows the page's own table, if it has `keys`, and under
it one sentence for `keysOf`: "The keys of [Chart] apply here." with each
entry a link to that page's Keyboard anchor. A new section **Accessibility**
stands directly after Keyboard and before API. Both reach the llms text, the
prerendered page and the `.md` twin through the same full text.

### The rule and its check

A browser check in the shell's checks, called by each demo with every page,
like the own-base check. For each page it looks only inside the example stages:

- if any element is in the tab order, the page must have a Keyboard section;
- if any element has `aria-live`, or a role of `status`, `alert`, `log`,
  `timer`, `progressbar` or `meter`, the page must have an Accessibility
  section.

Exceptions stand in the check with their reason, as in the other guards.

### The pages that gain sections in this spec

Expected from the outlines; the check is the arbiter and its exceptions are
the only way out.

- **charts**: every page with a chart in its stage — axis, line, area, bar,
  boxplot, scatter, stateband, matrix, limitline, controlchart, pareto,
  tooltip — gets `keysOf: ["chart"]`; the Chart page gets an Accessibility
  section (the plot's role, the readout and summary, the data table).
- **calculation**: tree, chain, given, metrics, what-can-go-wrong,
  worked-examples get `keysOf: ["calculation"]`; the Calculation page gets an
  Accessibility section (the accessible sentence in English and German).
- **schedule**: every page with a plot — lane, subtasks, bar-labels,
  appearances, overlap, dependencies, routes, time-axis, blocked-time,
  now-line, pan-and-zoom, interactions, tooltip, linked-schedules, handle,
  snapping, placing, where-it-may-go, ripple, findings — gets
  `keysOf: ["schedule"]`. Dependencies additionally gets its own rows for `]`,
  `[` and `t`/`T`, and pan-and-zoom its own rows for Home/End and
  PageUp/PageDown, taken from First schedule's table, where they stay. First
  schedule gets an Accessibility section (the plot's role, the readout, the
  summary).
- **table**: table (First table), column, formats, presets, search, filter,
  pre-filter, pagination, aggregate, selection, row-appearance, toolbar,
  toolbar-controls, export, view, manual-mode and verdictcolumn get a Keyboard
  section: own rows where the table binds a key itself (First table: the
  sortable header's Enter and Space, and Escape closing a cut value's tip),
  `keysOf` the core control otherwise (Input for search, Select and Popover for
  filters, Menu for column menu and export, Checkbox for selection, Button for
  pagination). installation and provider have no tabbable stage. First table
  and AlarmList get Accessibility sections.
- **core**: the pages without a Keyboard section whose stage is tabbable —
  among them button, input, textarea, card (collapsible), alert (dismiss),
  toast, typography (links), stepper — get own rows for their native keys;
  Toast, Alert, Spinner, ProgressBar, Meter, Stat and Skeleton get
  Accessibility sections for what they announce or expose.

### Finishing

1. **Scenario Code toggle.** The scenario's toggle is the example's toggle:
   the same chevron, the same class, the same accessible name "Code" and
   `aria-expanded`. Accepted when the scenario toggle and an example toggle
   produce identical markup apart from their ids.
2. **Callout marks on a narrow stage.** Below a stage width of 640 px the stage
   gets a left gutter as wide as a mark, and every mark stands in that gutter at
   the top edge of its element, instead of outside its corner. From 640 px
   nothing changes. Accepted when, at 390 px, no mark's box intersects the box
   of any text in the stage, on all five scenarios pages.
3. **Scenario tables on a phone.** A table scenario pins its action column only
   while its stage is at least 640 px wide; narrower, the column stays in the
   flow and the table scrolls inside its box. The scenario reads its stage's
   width itself, so the copied code shows the pattern an application would
   use. Accepted when, at 390 px, no pinned block exists in any table scenario
   and the page does not scroll sideways.
4. **Long unions** *(after S3)*. In a type cell, a union of more than two
   members renders one member per line, each line starting with `|`. In the
   Markdown renderer the union stays on one line (a table cell cannot break).
   Accepted on `ButtonProps.variant` and `TextProps.size`.
5. **Preview on type links** *(after S3)*. A named type in a type cell, which
   `types-without-holes` makes a link to its definition block, shows that block
   in core's `Tooltip` on hover and on keyboard focus, and Escape dismisses it.
   The preview holds the block's declaration, capped at twelve lines with an
   ellipsis — the link leads to the whole. A click follows the link. Not
   rendered into the prerendered HTML or the `.md` twin, where the anchor is
   enough. Accepted when hovering and focusing `ButtonSize` in the Button table
   show `"sm" | "md"`.

## Testing Decisions

Tests assert what a reader meets, not how a section is assembled.

- **The new page check in the browser**, run by every demo with every page
  (prior art: the own-base check and the overlays check, both called with
  every page). It fails on the two rules above; the exceptions sit in the
  check. Shown to fail by removing one `keysOf` before the pages are filled.
- **The outline's load-time validation**, in the shell's unit tests (prior
  art: the scenario `builtFrom` validation in the examples tests): an unknown
  `keysOf` id fails with its file and id.
- **The llms generator's unit tests against the fixture package** (prior art:
  the llms tests): a fixture page with `accessibility` and `keysOf` renders
  both sections in the full text.
- **Finishing items**: (1) a markup comparison in the shell suite; (2) and (3)
  measured in the browser at 390 px over every scenario — box intersections
  for marks, the absence of a pinned block and of a page-level horizontal
  scroll; (4) and (5) in the page suite on the Button page.
- **Accessibility check** (axe) runs over one page per demo with the new
  sections and over the Button page with a preview open.
- **Screenshot baselines** move for scenario pages (toggle, marks on mobile),
  for every page that gains a section, and for tables with long unions; they
  are renewed in the tickets that cause them.

## Out of Scope

- Renaming `/table/table/` (that is `sidebar-tree`, S16, which owns every
  address change).
- New keyboard behaviour in any component. This spec documents keys; it binds
  none.
- A library-level rule for pinned columns on narrow tables; the scenario
  decides for itself, as an application would.
- Translating the accessibility texts.
- An accessibility statement or conformance report for the library as a whole
  (that is `docs/standards.md`, and `concepts-and-changelog-pages`, S13, puts
  it on the site).

## Further Notes

- Siblings: `types-without-holes` (S3) blocks items 4 and 5; `page-orientation`
  (S5) lists the Keyboard and Accessibility sections in its table of contents;
  `pages-as-markdown` (S10) carries both sections into the `.md` twins without
  further work.
- Figures to beat: keyboard tables on 31/54 core, 11/30 table, 5/26 schedule,
  1/15 charts, 1/8 calculation pages; accessibility sections on 0 pages.
- Acceptance:
  - the page check passes on all five demos with an exception list whose every
    entry has a reason;
  - every chart, schedule and calculation page with a focusable plot links the
    root page's keys;
  - the five finishing items pass their own acceptance above.

## Comments

Delivered on `main` on 4 Oct 2026: every ticket under `issues/` is `Status: done` and carries its own delivery report. The whole effort was checked once more on `main` afterwards — lint, typecheck, unit and the full visual suite green.
