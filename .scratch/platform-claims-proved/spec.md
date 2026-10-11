# Two claims about the platform, proved

Status: ready-for-agent
Date:   2026-10-11
Origin: `.scratch/open-points-roadmap/spec.md`, rows X1 and X2 and "Taken as
agreed" 6; the facts in `docs/research/open-points-2026-10/platform_claims.md`.

## Problem Statement

Five READMEs say "React 18 or 19", every `peerDependencies` says `>=18`, and
React 18 is installed nowhere: the devDependencies are `^19.0.0`, the lockfile
holds 19.2.8, and CI runs one job. Core keeps `forwardRef` in 75 places because
React 19 passes a ref through `...rest` and 18 does not
(`docs/testing.md`) - one test guards that, and the rest of the suite has never
met 18. A library whose argument is honesty claims a range it has not run.

The second claim is unsaid, which is worse for a caller on Next.js: nothing
promises that the packages render on a server, and nothing carries `"use
client"`. Only charts (`ssr.test.tsx`) and two core fields (`fieldWidth.test.tsx`)
are rendered with `renderToString`; table, schedule (a canvas) and calculation
never are. In an App Router application a component that uses `useState` and is
imported from a Server Component without the directive fails with a message
about the caller's file, not about the library.

## Decisions

The roadmap decided X1 and X2 and "Taken as agreed" 6 (`"use client"` heads
every built entry, so every component is a client component). They are carried
out here, not argued. The choices below are the ones the code forced.

| # | Question | Decision |
| --- | --- | --- |
| P1 | How 18 is installed | A second CI job, `unit-react18`, beside `check`. After `pnpm install --frozen-lockfile` it sets `pnpm.overrides` for `react` and `react-dom` to `18.3.1` in the runner's copy of the root `package.json` and runs `pnpm install --no-frozen-lockfile`, then `pnpm test:unit`. The checkout is thrown away with the job: no second lockfile, nothing committed, a developer installs what they did. |
| P2 | What the job proves | A step before the tests prints the installed `react` version and fails unless it starts with `18.`. Without it a silent no-op override would pass every test and prove nothing. Lint, types and build stay in `check` - types are `@types/react` 19 and say nothing about the runtime. |
| P3 | A test fails under 18 | The ticket fixes the library, never the assertion. A test whose own scaffolding uses a 19 API is rewritten to say the same thing in an API both have. A genuine 19-only behaviour of the library is fixed in the library (a `forwardRef`, an effect). If it cannot be, the ticket stops and reports - lowering the claim to `>=19` is the maintainer's, not the ticket's. |
| P4 | Server tests run where there is no window | Each new server-rendering test begins `// @vitest-environment node`, so a stray `window` or `document` reads as a ReferenceError and not as jsdom's answer. Setup files that touch `window` are guarded with `typeof window !== "undefined"`. The charts' test stays as it is. |
| P5 | The mechanism for `"use client"` | A post-step in `scripts/styles/`, `useClient.ts`, beside `importOwnCss.ts`. It is not `banner` (see below), and it is not a plugin from outside: ADR-0021 and "no foreign dependency" apply to the build as well as to the packages. |
| P6 | Which entries | Every entry the manifest's `exports` names under `import`: `.`, `./wording/de` where there is one, and the future `@umriss-ui/table/xlsx`. Not the shared chunk (`formats-*.js` in core): it holds no component and is only imported by entries. |
| P7 | The wording | It gets the directive. A wording holds functions (plurals, a third argument), and a function cannot cross from a Server Component to a client one as a prop - unless it is a client reference, which is what a module with the directive exports. So `wording={de}` is writable in a server file. This is reasoned, not tested: the README claims only that the directive is there (P10). |
| P8 | The xlsx entry | The same: it carries the directive through P6 with no change of its own. The `table-xlsx` ticket adds its entry to `exports`; the step and the check follow the manifest. |
| P9 | What `check-dist` asserts | For every `import` target in `exports`: the file begins `"use client";`. For the main entry the existing line follows it: `import "./<pkg>.css";` second, not first. The check reads the manifest instead of a longer argument list, so a new entry is checked when it is declared. |
| P10 | What the READMEs say | That every entry begins with `"use client"`, that each package is rendered to a string in a test, and that React 18.3 and 19 are run in CI. Nothing about a Next.js version, nothing about Server Components rendering a component's output, nothing about Remix, Astro or streaming: none of those is run. |

### What the build does today

Measured with Vite 6.4.3 on a one-module library build: a module-level
`"use client"` in the entry is **dropped with a warning** (`Module level
directives cause errors when bundled, "use client" in "entry.js" was ignored`);
the chunk begins with the first import. So a directive in `src/index.ts` would
not survive, and would be wrong anyway - the components are bundled into one
file, not one module each. `output.banner` would survive, but it goes onto every
chunk, the shared one included, and cannot be told "entries only" without a
function that reads the chunk. Two steps also each want the head of the file -
the directive and the stylesheet import `importOwnCss` writes (ADR-0021) - so
their order is written down. It is: `importOwnCss` writes `import "./x.css";`, then `useClient`
prepends `"use client";\n`, so the directive is the very first statement, which
is the only place a directive counts. Both run in `writeBundle`, with `enforce:
"post"`; `useClient()` is listed after `importOwnCss()` in each `vite.config.ts`
and is idempotent as it is.

## Solution

| Ticket | Scope | Size | Blocked by |
| --- | --- | --- | --- |
| 01 | The unit tests run against React 18 in CI | M (S if nothing fails) | - |
| 02 | A server-rendering test for table, schedule, calculation | S | - |
| 03 | `"use client"` at the head of every entry, checked | M | - |
| 04 | The READMEs, changelogs and `docs/testing.md` say what is now tested | S | 01, 02, 03 |

01, 02 and 03 are independent. 02 also runs under 18 through 01.

## What the server tests assert

- **Table:** `useTable(rows, { rowKey })` with two columns and one footer
  aggregate renders to a string without throwing; the markup holds `role="grid"`
  or the table role the component uses, every column header, every cell of the
  first row, and the aggregate. Then a second render with `selection` set and
  `loading`, to cover the paths that read the store before an effect.
- **Schedule (canvas):** `useSchedule` with two lanes, a subtask, a milestone and
  `now` as a number renders to a string; the markup holds the labelled frame (the
  `ariaLabel`) and the canvas elements, present and empty; no lane label is in it - lanes, subtasks and the summary's counts arrive on the client after mount, and the first client render is the same empty frame. Nothing was drawn
  because nothing may touch `getContext` before an effect. `now={true}` is
  rendered as well: it reads the clock, and must not on the server in a way that
  differs from the client's first render (hydration).
- **Calculation:** a `Calculation` from the package's own test fixtures
  (`tests-unit/costing.tsx`) renders to a string: the list with its label, every
  row's label and amount in the language in use, the folded rows `hidden`.
- All three: the same markup twice in a row (`renderToString` is deterministic;
  no id from a counter that differs), the cheapest hydration guard there is.

## Testing

The server tests are the tests. `check-dist` is run by `prepublishOnly` and, new,
by a step in `check` after `pnpm build` (`pnpm -r check:dist`), so the directive
is guarded by CI and not by the release alone. The React 18 job is its own proof.

## Out of scope

A Next.js fixture application, a Remix or Astro run, a hydration test in a
browser, and a React 17 claim. Whether a Server Component may *render* these
components is exactly what a Next fixture would prove; until one exists the
documents say less than that.

## Decided while writing

- A second CI job with `pnpm.overrides` set in the runner, not a matrix over the one job and not a second lockfile (P1).
- Only `react` and `react-dom` are overridden, not their types (P2).
- Server tests use the node environment, one step stricter than the charts' (P4).
- The directive goes on the wording as well, by reasoning from functions that cannot cross the boundary (P7).
- `check-dist` reads `exports` for its list of files, and runs in `check` as well as before publishing (P9).
- The directive stands before the stylesheet import, so `check-dist`'s existing "imports the stylesheet first" test and the comment in `importOwnCss.ts` ("at the head of the entry chunk") change to "right after the directive". ADR-0021 names no position and stays untouched.
- The schedule's server markup is the labelled frame and an empty canvas; lanes, subtasks and the summary's counts arrive on the client after mount, and the first client render is the same frame. Decided by the coordinator on 2026-10-11; to be confirmed by the maintainer at acceptance. The schedule is not refactored for it (P10 claims no more).
