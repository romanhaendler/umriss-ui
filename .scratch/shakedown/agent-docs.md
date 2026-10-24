# Shakedown: the documentation an AI agent reads (all six packages, 0.40.4)

Status: needs-triage

Two routes: online, `https://romanhaendler.github.io/umriss-ui/<pkg>/llms.txt` (an index) linking page
twins (`<page>.md`) and `llms-full.txt`; installed, `node_modules/@umriss-ui/<pkg>/docs/llms-full.md`, which
the online `llms.txt` tells an agent to prefer. Run on 2026-10-24. ✓ = confirmed by the coordinating session.

## Findings

1. ✓ **[Break] The table's Provider page imports `UmrissProvider` from `@umriss-ui/table`.** It is a core
   export; the page's own prose says the table has no provider. Online `provider.md` and
   `packages/table/docs/llms-full.md:1570`. The only failing block of the 748 that start with an `import`.
   Cause: `packages/table/demo/outline.ts:91` lists `UmrissProvider` among the page's `exports`, and the
   generator writes the import line from the page's own package. The example source
   (`examples/Provider/01-provider.tsx`) imports it correctly from core.
2. **[Misfit] Scenario links are useless in every package.** Each `llms.txt` links its scenarios (core 5,
   charts 5, table 4, schedule 4, calculation 4, dashboard 1) to the same `<pkg>/index.md` without an
   anchor, so an agent gets the whole scenarios file (core: 94 KB, about 23k tokens) instead of the one named.
3. **[Misfit] The installed route carries only the one big file.** `docs/` in each package holds only
   `llms-full.md`, no index and no per-page files:

   | Package | `llms.txt` | `llms-full` | Tokens before the first props table |
   |---|---|---|---|
   | core | 4.5k | 232k | 24k |
   | table | 2.5k | 140k | 9.5k |
   | charts | 1.7k | 136k | 13k |
   | schedule | 2.5k | 112k | 10k |
   | calculation | 1.2k | 54k | 11k |
   | dashboard | 0.4k | 13.5k | 9.5k |

   Page twins are large too: core `language.md` about 22k tokens, table `first-table.md` about 14k; the API
   index twins 40k (core), 22k (charts), 18k (table). The scenarios fill the first 4–24k tokens of every
   `llms-full`.
4. ✓ **[Misfit] 843 dead in-file links in core's `llms-full.md`** (`](#/button/keyboard-button)`,
   `](#/theming)`): the demo's hash routes, which mean nothing in a Markdown file. The "Shown in" lists they
   come from also pad the props tables.
5. **[Misfit] Core's scenarios import charts, table, schedule and calculation** (`llms-full.md` lines 59, 60,
   1629–1633) and never say to install them.
6. **[Misfit] No `llms.txt` has an `## Optional` section** (llmstxt.org convention); the "Getting started" and
   "API index" pages are candidates.
7. **[Misfit] Everyday words miss in `llms.txt` and the headings:** charts "dark", "real time/live/stream",
   "threshold" (it is called "Limits"), "annotation", "brush"; core "validation"; schedule "baseline",
   "critical path", "undo"; calculation "variable", "step", "formula"; table "resize", "reorder". Also from
   round 1, core's API index misses "notification", "shortcut", "dark mode".

## Held up

All 196 links return 200 and point to `.md`/`.txt` twins; apart from the scenarios no link goes to the wrong
page · online `llms.txt`, `llms-full.txt` and npm latest all say 0.40.4, and online and installed `llms-full`
are identical for all six · table, schedule, calculation and dashboard each name core as a required peer with
the exact install command (schedule also charts) · of 1,044 extracted `ts`/`tsx` blocks, the ~300 that fail
are signature excerpts without imports, not examples; no example uses an unknown prop.

## What would help an agent most

Ship per-page files and a real index in the npm package (one file per page and per scenario, scenarios last),
and link each scenario to its own file. An agent then reads about 3k tokens of index plus a 5–15k-token page
instead of grepping a 130–930k-token file whose first 10–24k tokens are scenario prose.
