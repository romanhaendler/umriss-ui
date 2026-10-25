# A skill points a coding agent at the documentation, and there is no MCP server

Status: accepted. Superseded in part by ADR-0065 (the skill points at the packaged file, not at online `llms.txt` files)
Date:   2026-10

The documentation is already published for coding agents: `llms.txt`, a
Markdown twin of every page and `docs/llms-full.md` in every package. What was
missing is one file an agent loads when a user works with umriss-ui, saying
where the facts are and which rules of this library it would otherwise get
wrong.

**A skill, `skills/umriss-ui/SKILL.md`, points a coding agent at the
documentation and names the few rules it cannot guess; the library builds no
MCP server.** The skill is not a second copy of the documentation: where to
read, how each package is entered, four surprising rules and the ADR-0032
list, in under 100 lines, taken from the package READMEs and the ADRs.

- **The place** is the repository root, the folder the `skills` CLI searches
  in a GitHub repository, with `name` and `description` as frontmatter; the
  description carries the triggers - package, hook and provider names. The
  install is `npx skills add romanhaendler/umriss-ui --skill umriss-ui`, noted
  in the root README.
- **A guard against drift,** `packages/demo/tests-unit/skill.repo.test.ts`:
  imported names, and hook and multi-word component names in code font, must be
  exported by some package entry - the compiler's export list, as
  `llmsGuard.test.ts` reads it.

## Considered Options

- **An MCP server.** The files an agent reads are enough, and a server is a
  thing to run, version and keep in step with them.
- **Props tables and examples copied into the skill.** They would drift; the
  documentation stays the one source.
- **Checking prose claims against the sources.** The test checks names only.

## Consequences

- The skill's prose can go stale where the test cannot see it: the listed
  intents and the `chars` default, and the ADR-0032 table, which leaves the
  category scale out on purpose (ADR-0052).
- The install command was confirmed from the `skills` CLI's README only, and
  not run against this repository before it was pushed with the skill.
- `skills/` is not in the published packages' `files`.
