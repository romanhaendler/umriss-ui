# Agent skill for people who build with umriss-ui

Status: done

## Problem

The documentation is already published for coding agents (`llms.txt`, a Markdown
twin per page, `docs/llms-full.md` in every package). What is missing is the
package around it: one file an agent loads when a user works with umriss-ui,
saying where the facts are and which rules of this library it would otherwise
get wrong. It must not become a second copy of the documentation.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Place | `skills/umriss-ui/SKILL.md` at the repository root | the folder the `skills` CLI searches in a GitHub repository |
| Format | frontmatter `name` and `description` (triggers: package names, hook and provider names), then the body | what the CLI requires; matches the skills this repository consumes |
| Body | where to read, how each package is entered, four surprising rules, the ADR-0032 list | only what an agent cannot guess; under 100 lines |
| Facts | taken from the package READMEs and the ADRs, not restated at length | the documentation stays the one source |
| Drift guard | `packages/demo/tests-unit/skill.repo.test.ts`: imported names and hook / multi-word component names in code font must be exported by some package entry | small; the compiler's export list, as `llmsGuard.test.ts` reads it |
| Install | `npx skills add romanhaendler/umriss-ui --skill umriss-ui`, noted in the root README | see below |

## Out of scope

- An MCP server. The files an agent reads are enough.
- A copy of any props table or example in the skill.
- Checking prose claims (widths, defaults) against the sources; the test checks names only.

## To check when accepting

1. **The install command.** Confirmed only from the `skills` CLI's README
   (github.com/vercel-labs/skills: `npx skills add <owner/repo>`, `--skill <name>`,
   discovery in `skills/<name>/SKILL.md`); not run against this repository, which
   is not pushed with the skill yet. Run `npx skills add romanhaendler/umriss-ui --list` once it is.
2. The listed `intents` (`move`, `lane`, `stretch`, `place`) and the `chars` default of 20 against the current schedule and core.
3. The ADR-0032 table still matches the ADR. The category scale is left out of it on purpose: ADR-0052 lets an x axis read a category as it comes, and the ADR's own list is amended by `chart-rows-as-they-come` 07.
4. Whether `skills/` belongs in the published packages' `files` (it does not now).

## Comments

**Accepted and released (2026-10-11).** The maintainer checked it by hand on the running demo ("Alles händisch geprüft, sieht gut aus") and took the decisions above as they stand; released in the repository, with the release of 11 Oct 2026.
