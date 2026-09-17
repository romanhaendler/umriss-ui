# 06 — The journal is not a changelog

Status: done
Type: task

Blocked by: 02

Spec: `.scratch/docs-structure/spec.md`

## Scope

Four files are called `CHANGELOG.md`. Three record what changes for a caller. The fourth, at the root, records what was worked on in this repository — its own head says so, and `english-and-umriss-ui` 14 checked the question of merging them and correctly refused. What that ticket did not do is give the second document a name.

- `CHANGELOG.md` → `docs/journal.md`. The content is not rewritten.
- Its opening paragraph gains one sentence saying what the document is and what it is not, and the existing cross-reference to the three package changelogs stays.
- **The entry heads get a locatable form.** Today: `## The seam of a button group (Sep. 2026)`. Instead: the month first, then the effort slug from `.scratch/` where there is one, then the title — and one line under the head saying what it meant for a caller, which is usually "nothing" or a pointer at the package changelog and version that carries it. Apply this to the entries from `english-and-umriss-ui` onwards; older entries keep their heads, because reconstructing a slug for work that predates the tracker would be invention.
- Ordering stays newest first.

Live pointers to update: the head of `packages/core/CHANGELOG.md` ("The changelog in the root directory of the repository describes something else"), the heads of the charts and table changelogs where they name the root, `CLAUDE.md` if it names it, and `docs/README.md`. Leave `.scratch/` alone.

## Acceptance

- `docs/journal.md` exists, `CHANGELOG.md` at the root does not, and the three package changelogs are untouched except for the sentence that names the journal.
- No entry text was rewritten — a diff of the body shows head lines and the new caller line, nothing else.
- The map (ticket 02) has the row under "What moved".
