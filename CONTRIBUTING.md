# Contributing

How this repository is set up, run and worked in. What is tested and why stands
in [`docs/testing.md`](docs/testing.md); the map of every other document is
[`docs/README.md`](docs/README.md).

## Prerequisites

* **pnpm 12.15.0** — pinned by the `packageManager` field in the root
  `package.json`; corepack picks it up.
* **Node 22.** `jsdom` is deliberately held at `^26`: jsdom 30 pulls a pure ESM
  package in through `require()`, which does not load on Node 22.11 and
  prevented every vitest run.

## First run

1. `pnpm install`
2. `npx playwright install chromium`
3. `pnpm test:unit && pnpm test:visual`

The third step builds the seven demos and takes the screenshot baselines into
comparison; on a platform other than darwin it will report missing baselines,
which `pnpm test:visual:update` creates and which are then checked in.

## Commands (repo root)


* `pnpm check [package]` – the shrink guard, eslint, `typecheck` and `test:unit`
  of one package (`core`, `charts`, `table`, `schedule`, `calculation`, `dashboard`, `alarms`, `demo`)
  or of all, stopping at the first failure. `typecheck` covers a package's own
  `src`, `tests-unit` and `tests-visual`, writes nothing and needs no generated file
* `pnpm typecheck` – `typecheck` and `typecheck:demo` of every package;
  `typecheck:demo` generates the props first and checks `demo/` (core's control
  room page reaches the other packages' sources there)
* `pnpm check:site` – the gates of the demos: `props` in every package, and core's
  README table
* `pnpm semgrep` – Semgrep over the seven packages' `src` and the workflows with the rule sets
  vendored in `.semgrep/`, in the pinned container image (needs Docker); CI runs the same script
  and any finding fails it. Accept a finding only with `nosemgrep: <rule-id>` and a reason at its line
* `pnpm test:unit` – vitest across all packages, the shell included
* `pnpm test:visual` – Playwright; builds the seven demos and starts
  `vite preview` automatically (ports 4173 core, 4174 charts, 4175 table,
  4176 schedule, 4177 calculation, 4178 dashboard, 4179 alarms; add
  `UMRISS_PORT_BASE=<port>` to move all seven, one base per checkout)
* `pnpm dev:core`, `pnpm dev:charts`, `pnpm dev:table`, `pnpm dev:schedule`, `pnpm dev:calculation`, `pnpm dev:dashboard`, `pnpm dev:alarms` – the demos in the dev server
* `pnpm screenshot <package> <page> <example> [--click "<button>"] [--width 1280] [--dark] [--touch] [--out file.png]` – a PNG of one demo example from a dev server on a free port, with the page's console errors printed; `--click` presses a button of the example first and shoots the whole window, `--touch` opens the page with `touch-scale.css` on
* `pnpm test:visual:update` – create or update baselines
* `pnpm lint` – among other things the rule "@umriss-ui/charts is standalone: no
  import from @umriss-ui/core (R-1.2)", and the directions of ADR-0016 and
  ADR-0022: the table, the schedule, the calculation, the dashboard and the alarms take their peers by the
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

The preview servers sit on `UMRISS_PORT_BASE` (default **4173**) plus a fixed
offset: core +0, charts +1, table +2, schedule +3, calculation +4, dashboard +5,
alarms +6 – 4173 to 4179 by default. `test:visual`, `test:visual:quick` and
`test:visual:on-main` all read the variable, so a second checkout (a worktree, an
agent) takes a base of its own, e.g. `UMRISS_PORT_BASE=4400 pnpm test:visual:quick
charts`. A running server is reused only if it answers with this checkout's path
(header `x-umriss-checkout`); one of another checkout, or a port taken by
something else, is a failing suite that names both paths rather than a mystery.

## How work is organised here

Open work lives as markdown under `.scratch/<effort>/` — one directory per
effort, `spec.md` beside `issues/NN-<slug>.md`, and a `Status:` line at the top
of each ticket carrying the triage role. A feature folder is deleted when its
last ticket is done; the commit history keeps it. The conventions are written
down for the agent skills that read them, and they hold for a person just the
same: [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md) for the
layout, [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md) for the
five role strings, [`docs/agents/domain.md`](docs/agents/domain.md) for how
`CONTEXT.md` and the ADRs are consumed.

## Where a fact is written

* **One fact, one place.** A change touches the source, its test, its example
  and — at release — the changelog. Nothing else restates it.
* **The changelog is written at the release**, from `pnpm changelog` (the
  commit subjects since the last release); `## Unreleased` is not written to
  during development.
* **An ADR is written only for a decision that is costly to reverse.** Anything
  smaller is the commit message.
* **A comment says what the code does now and why it must be so.** No ticket
  names, no history.
* **The journal is frozen** (`docs/journal.md`, 2026-10-11): no new entries; the
  commit history and the changelogs carry on. `.scratch/` holds open work only.

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
* **A prop or an export without JSDoc breaks the build.** Whatever lands in a
  props table on some page explains itself, and so does every export of a
  package's entry and its subpaths; the gate runs in `predev`, `prebuild:demo`,
  `typecheck:demo` and `check:site`. The same gate stops at a requirement number (`R-4.12`, it
  goes into `@remarks`) or a source path in a reader's text; an ADR number is
  written bare and becomes a link to its file.
* **A prop without an example breaks the build.** Every row of a props table
  a page lists (not a reference or definition table) is used by an example or a scenario of its package, or stands in the
  package's `demo/unshown.json`. That list only shrinks: the same gate stops at
  an entry whose prop an example now uses (remove the line) and at one naming
  no row.
* **A word this workspace has is used as it is defined.** `CONTEXT.md` is the
  vocabulary, including the words each term may not collide with.
* **A rename keeps its old name for one minor**
  ([ADR-0066](docs/adr/0066-one-number-peers-over-the-minor-a-rename-lives-one-minor.md)).
  The old name carries `@deprecated since 0.<N> - use <new>.` (N is the minor that
  renames; while developing it, the next one), and `check:dist` fails a marker
  older than the package's own minor, so the next release removes it. By kind:
  * **Prop**: the component reads `new ?? old` and calls `warnDeprecated` (the
    package's `dev.ts`) when the old one is given; the old prop keeps its type,
    marked, and stands in `demo/unshown.json` as "(g) deprecated alias".
  * **Export** (component, hook, constant, type): the old name re-exports the new
    one, marked. A component or hook warns on its first render or call; a
    constant or a type is only marked.
  * **Wording key**: the wording merge copies an old key onto the new one when the
    new one is not given, and warns. The old key stays in the wording type, marked.
  * **Token** (core and charts declare them): the old name is declared in the same
    tokens layer as `--u-<old>: var(--u-<new>); /* @deprecated since 0.<N> - use
    --u-<new> */`, and the library's own rules go on reading the old name for that
    minor, so either name can be set or read and there is no cycle. The removal
    release moves the rules to the new name and drops the alias. The warning comes
    from `warnDeprecatedTokens({ "--u-<old>": "--u-<new>" })` in the package's
    `dev.ts`: once per page, development only, it names an old token that a
    stylesheet outside the `umriss.*` layers declares or reads in `var()`. Every
    component whose rules read a deprecated token calls it in an effect on its
    first render; the once-flag makes many callers one scan. The migration line
    says the edge: a new name set on an element below `:root` reaches the rules
    only from the removal release, because the alias resolves at `:root`; set it
    on `:root`, or keep the old name until then.
  * **Changelog**: the entry under "Changed" names the old name, the new one and
    the release that removes the old one, in its migration line; the removal's
    entry is under "Changed" too.
  * What cannot keep an old form is a break, and is named as one under "Changed".
