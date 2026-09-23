# Contributing

How this repository is set up, run and worked in. What is tested and why stands
in [`docs/testing.md`](docs/testing.md); the map of every other document is
[`docs/README.md`](docs/README.md).

## Prerequisites

* **pnpm 9.14.4** — pinned by the `packageManager` field in the root
  `package.json`; corepack picks it up.
* **Node 22.** `jsdom` is deliberately held at `^26`: jsdom 30 pulls a pure ESM
  package in through `require()`, which does not load on Node 22.11 and
  prevented every vitest run.

## First run

1. `pnpm install`
2. `npx playwright install chromium`
3. `pnpm test:unit && pnpm test:visual`

The third step builds the five demos and takes the screenshot baselines into
comparison; on a platform other than darwin it will report missing baselines,
which `pnpm test:visual:update` creates and which are then checked in.

## Commands (repo root)


* `pnpm test:unit` – vitest across all packages, the shell included
* `pnpm test:visual` – Playwright; builds the five demos and starts
  `vite preview` automatically (ports 4173 core, 4174 charts, 4175 table,
  4176 schedule, 4177 calculation)
* `pnpm dev:core`, `pnpm dev:charts`, `pnpm dev:table`, `pnpm dev:schedule`, `pnpm dev:calculation` – the demos in the dev server
* `pnpm test:visual:update` – create or update baselines
* `pnpm lint` – among other things the rule "@umriss-ui/charts is standalone: no
  import from @umriss-ui/core (R-1.2)", and the directions of ADR-0016 and
  ADR-0022: the table, the schedule and the calculation take their peers by the
  public entry, and nothing imports any of them.

The accessibility check runs inside the same Playwright suite and needs no
command of its own. It checks a sample of pages one at a time, in both themes,
against WCAG 2.1 AA – axe's "best-practice" rules are deliberately not included:
a check that reports opinions as errors gets switched off rather than read. The
suppression list in the file is empty, and a test of its own holds that every
future entry must carry a reason.

For the charts part only:

```bash
npx playwright test --project=charts-light --project=charts-dark
```

The dev servers run on fixed ports: **4173** core, **4174** charts, **4175**
table, **4176** schedule, **4177** calculation. The screenshot suites address exactly those, so a port taken by something
else is a failing suite rather than a mystery.

## How work is organised here

Specs and tickets live as markdown under `.scratch/<effort>/` — one directory
per effort, `spec.md` beside `issues/NN-<slug>.md`, and a `Status:` line at the
top of each ticket carrying the triage role. The conventions are written down
for the agent skills that read them, and they hold for a person just the same:
[`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md) for the layout,
[`docs/agents/triage-labels.md`](docs/agents/triage-labels.md) for the five role
strings, [`docs/agents/domain.md`](docs/agents/domain.md) for how `CONTEXT.md`
and the ADRs are consumed.

A delivered spec is a record: it is read backwards, it cites commit SHAs by
hand, and it is not rewritten to look current.

## The rules that bind a change

Each of these is argued somewhere; the link is the argument, not the rule.

* **Tokens only, no raw colour values.** A new value becomes a token first —
  [`docs/design-language.md`](docs/design-language.md), and a stylesheet guard in
  `packages/core/tests-unit/` reads the modules as text.
* **Everything is English** — identifiers, props, prose and the default wording
  ([ADR-0018](docs/adr/0018-everything-is-english.md)). German ships as
  `@umriss-ui/core/wording/de` ([ADR-0019](docs/adr/0019-two-wordings-ship-english-is-the-default.md)).
* **A new export goes at the END of `src/index.ts`.** The order of exports
  decides the order of the module styles in the bundle; filing two of them
  alphabetically once moved the table images by two pixels —
  [`docs/testing.md`](docs/testing.md), "The order of exports is part of the
  appearance".
* **A baseline moves only when a ticket says it may.** A bulk rebuild without
  review is never admissible (`CONTEXT.md`, **Baseline**).
* **A prop without JSDoc breaks the build.** Whatever lands in a props table on
  some page explains itself; the gate runs in `predev`, `prebuild:demo` and
  `pretypecheck`.
* **A word this workspace has is used as it is defined.** `CONTEXT.md` is the
  vocabulary, including the words each term may not collide with.
