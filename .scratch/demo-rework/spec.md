# Demo rework: scenarios first, generic worlds, pages that explain

Status: done for tickets 01–29 (2026-09-25); ticket 30, the final polish, is ready-for-human. The visual baselines wait on `demo-rework-baselines` for that review. Positioning and renames: ADR-0035.
Page research: `research-component-pages.md`.

## Settled

- **Scenarios page** opens each of the five demos: up to five scenarios
  (CONTEXT.md, "Scenario"), each a composed, realistic screen in a different
  world; it may use neighbouring packages. The five former demonstrations
  (core Control room, Dock, TreeView; table; schedule) go into these pages and
  the "demonstration" form is removed from the shell, tests and llms output.
- **Component pages** have no scenario: introduction, then the examples ladder
  from simple to rich. Explanations move out of code comments into visible page
  text. The `why/` pages go; what a user must know becomes a paragraph of the
  introduction, the reasoning stays in the ADRs.
- **Worlds**, data once in `@umriss-ui/demo/worlds/<world>.ts`, all names
  invented:
  1. operations — a SaaS platform: services, latency, error rate, incidents, on-call
  2. logistics — a parcel carrier: depots, vehicles, tours, delivery windows
  3. controlling — a mid-sized company: cost centres, budget, forecast, actuals, invoices
  4. planning — an agency/software team: people, projects, sprints, capacity, leave
  5. plant — today's kiln line (`core/demo/plant.ts`)
  The plant holds no more than a quarter of any package's examples.
- **Scenarios per demo** (starting point; each ticket fixes the content):

  | Demo | Operations | Logistics | Controlling | Planning | Plant |
  |---|---|---|---|---|---|
  | core | incident console | dispatcher form | budget approval with dialogs | team settings | control room |
  | charts | latency dashboard with limits | vehicle utilisation (StateBand) | budget vs forecast | burn-down | control chart |
  | table | service alarm list | shipment list with filters | cost-centre report (groups, totals) | capacity grid (grid mode) | — |
  | schedule | on-call rota | tour plan (vehicles, dependencies) | — | project plan with leave as blocked time | machine plan |
  | calculation | SLA availability | cost per tour | invoice with discount and VAT | — | OEE |

- **Rubrics**
  - core: Scenarios · Getting started (installation, UmrissProvider, language)
    · Layout · Typography · Actions · Forms · Feedback (Alert, Toast, Spinner,
    Progress, Skeleton, EmptyState) · Overlays · Navigation · Data display
    (Stat, Meter, Sparkline, Badge, Tag).
  - every demo starts with Scenarios and Getting started; charts' and table's
    Monitoring becomes **Limits and alarms**; schedule: Plan · Time (axis,
    calendar, blocked time, now line) · Reading · Editing · Findings, and its
    Demonstration page goes.
- **Hard renames** and the plant-word check: ADR-0035.
- **Schedule** gains blocked time per lane; milestones, stacked overlap and
  dependencies across tasks are "not yet".

- **Component page skeleton** (research §4, adapted):
  rubric · H1 · **lede** (what it does for the user of the screen and when to
  reach for it, synonyms once; up to ~60 words, no praise words, no prop names)
  · import line · **about** (optional, at most three short paragraphs of what a
  user must know to use it right; small components have none) · first example
  without heading · Examples · When to use something else · Keyboard · API (one
  table per part; events apart for table and schedule) · **Known limits**
  (what it deliberately does not do, pointing to ADR-0032). No "Why" section.
- **Examples**: nouns for appearance, verb-first tasks for behaviour, sentence
  case, no code in titles; one visible `lead` sentence (≤ ~25 words, situation
  plus prop) exported beside `title`; code below, collapsed; every ladder
  includes the empty, loading, error and overflow states the component can hit.
- **Scenarios page**, after Polaris patterns: each titled by the user's job,
  one sentence on who uses the screen, the live screen with numbered callouts
  explained below, a "Built from" list linking each component's page, code
  collapsed.
- The research's checklist (§4.9), adapted as above, is the acceptance of every
  page ticket.

## Ticket cut

1. Shell: `lead`, lede and about, known limits, keyboard, scenarios page;
   "demonstration" removed.
2. World datasets.
3. Hard renames, one ticket per package, with the plant-word check.
4. Schedule: blocked time per lane.
5. Scenarios page, one ticket per demo.
6. Component pages: core one ticket per rubric, the other demos one or two each.
7. READMEs and changelogs.
8. Final polish, accepted by the user on the rendered pages.

5 and 6 may run in parallel once 1–3 stand.
