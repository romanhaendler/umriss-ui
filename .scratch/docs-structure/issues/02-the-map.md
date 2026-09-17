# 02 — The map

Status: done
Type: task

Spec: `.scratch/docs-structure/spec.md`

## Scope

`docs/README.md`: the one page that says which document answers which question. It is the table of contents for everything that is not source.

A table, sorted by the question and not by the filename:

| I want to know | Read |
|---|---|
| what umriss is and how to install it | `README.md` |
| how a component is used, with running code | the demo of its package (`pnpm dev:core`) |
| what changed for me as a caller | `packages/<package>/CHANGELOG.md` |
| what a word in this workspace means | `CONTEXT.md` |
| why something was decided the way it was | `docs/adr/README.md` |
| how the design language works | `docs/design-language.md` |
| how this repository is worked in | `CONTRIBUTING.md` |
| what is tested, and how | `docs/testing.md` |
| what capability is proved, and by what | the capability record of the package |
| what was worked on here, and when | `docs/journal.md` |
| how an agent should read this repository | `CLAUDE.md`, `docs/agents/` |
| what a document used to be called | the "What moved" section below |

Two further sections:

- **What moved, September 2026** — an empty table with the columns *was* and *is*, filled by tickets 05, 06, 07 and 09 as they land. It exists so that a reader who follows an old spec into a path that no longer resolves does not have to grep.
- **What is deliberately not here** — no documentation website, and the demos are not duplicated as prose. One sentence each.

`CLAUDE.md` gets one line under its heading pointing here.

## Acceptance

- `docs/README.md` exists and every path it names resolves.
- Documents that do not exist yet are not listed, or the ticket that creates them adds the row.
- `CLAUDE.md` points at the map.
