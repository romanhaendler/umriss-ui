# Spec: The documents get a shape

Status: done

Origin: session of 13 Sep 2026. The brief, in the words it was given in: "Mir gefällt die Gliederung und Sortierung der Doku noch nicht. Kannst du, ohne Code, mir einen Vorschlag erarbeiten, sodass die Doku maximal professionell wirkt?" — the structure and the ordering of the documentation, made professional, without touching code. An inventory was taken first (every markdown file in the workspace, every cross-reference between them, the repository's hygiene files); this spec is what came out of it, cut into tickets on request.

Builds on: `.scratch/english-and-umriss-ui/spec.md` ticket 14, which translated the documents, split nothing that was already split, and added the per-package licences — it is the reason there is an English set of documents to sort at all. `docs/agents/domain.md` fixes where `CONTEXT.md` and `docs/adr/` live; this spec does not move either.

Glossary: no new domain terms. `CONTEXT.md` is edited by ticket 08, and only by removal: what leaves it is history, not vocabulary.

ADRs: none proposed. Every move here is reversible at the cost of an afternoon and none of it reads as surprising — the same judgement `demo-as-documentation` made, for the same reason.

Tickets: `issues/01`–`09`. Tickets 01–04 are pure additions and break no link. 05–07 move files. 08–09 are content surgery inside documents that stay where they are. Every ticket can be taken alone; only the ordering in **Sequencing** is recommended, not required.

---

## Problem Statement

The content is unusually good. Nineteen ADRs argue their decisions instead of announcing them, three package changelogs keep a discipline most published libraries do not, and `CONTEXT.md` records not only what a word means but which words it may not collide with. What is missing is order **by genre and by audience**. Ten findings, all measured:

**There is no `README.md` at the root.** A visitor opening the repository sees `CHANGELOG.md`, `CONTEXT.md`, `TESTS.md`, `CLAUDE.md` — a workshop note, a glossary, a test standing, and an instruction file for agents. The first document is not an introduction, and there is no place that says what umriss is, who it is for, or which of the four packages to install first.

**Two of the three published packages have no README.** `@umriss-ui/charts` and `@umriss-ui/table` are MIT-licensed with a `files` list and a `prepublishOnly` gate. npm always packs a README when one exists; for these two there is none, so their package page would be blank. Only `packages/core/README.md` exists.

**Four files are called `CHANGELOG.md`, in two different meanings.** The three package changelogs record what changes for a caller. The root changelog (50 kB) records what was worked on in the repository — its own head says so, and ticket 14 of `english-and-umriss-ui` checked exactly this and correctly refused to merge them. What it did not do is give the second document a name of its own. One word, two meanings, in the repository whose glossary forbids precisely that.

**`CONTEXT.md` is a glossary and a migration archive in one file.** Of its 955 lines, roughly 150 are `Old → New` tables from the German-to-English rename: `Wortlaut → Wording`, `data-urteil → data-verdict`, the dock's tokens, the value sets. That is a record of what was, in the document that says what is. It also carries a doubled heading — `## Design language` immediately followed by `### Design language` — left over from the merge in `english-and-umriss-ui` 15.

**`TESTS.md` serves three audiences in one file.** A runbook (four commands, the first run on a new machine), a strategy (layers, the checkable seam, conventions), and a status (green, known open). Whoever wants `pnpm test:visual` reads 230 lines of reasoning to find it.

**One genre carries three names.** `packages/charts/STATUS.md` and `packages/core/TREE.md` are the same kind of document — a capability record, every capability with the level at which it is proved, and `TREE.md` says so in its own second line ("After the pattern of `packages/charts/STATUS.md`"). `@umriss-ui/table` has none. A reader who knows one cannot guess the next.

**`packages/core/README.md` does five jobs.** The "Ink & Paper" design language (which governs all three packages, not core), installation, the generated component table, the principles for new components, and a roadmap (a repository concern). The best-written passage in the workspace — the design language — sits in the appendix of one package.

**`packages/core/HANDOFF.md` is an archive that does not look like one.** 533 lines, half of it still German by a deliberate and well-argued decision, self-declared as "a historical record, not a description of the workspace as it is" — and filed at the top level of the package, beside the README, where a new reader meets it as current documentation. Six code comments cite its part A.5, so it cannot simply go.

**Nineteen ADRs, no index and no status line.** That ADR-0015 was superseded by ADR-0018 is recorded in prose, inside both documents. Nothing on the outside of a file says whether the decision in it still holds.

**No `LICENSE`, `CONTRIBUTING.md` or `.github/` at the root.** The three published packages each carry a `LICENSE`; the repository itself does not. This is the hygiene a visitor checks in the first fifteen seconds.

## Solution

Three rules, from which everything below follows.

**A — One genre per file, one home per genre.** There are six genres in this workspace: front door (README), contract history (CHANGELOG), vocabulary and decisions (CONTEXT, ADR), evidence (capability records, the test document), work journal, and agent documentation. No file serves two.

**B — The audience decides the level.** What travels to npm with a package lives in the package. What describes the workspace lives at the root. Nothing lives at both levels, and nothing is duplicated between them.

**C — Capitals are reserved.** A capitalised filename means the ecosystem knows the file under exactly that name: `README`, `LICENSE`, `CHANGELOG`, `CONTRIBUTING`, plus `CLAUDE.md` and `CONTEXT.md`, which the agent tooling addresses by name. Everything else is lower-case and lives under `docs/`. That one rule disposes of `GLYPHS.md`, `TREE.md`, `STATUS.md`, `HANDOFF.md` and `TESTS.md` without a further argument.

The target:

```
/
├── README.md                     the front door
├── CONTRIBUTING.md               setup, commands, first run, how work is done here
├── LICENSE
├── CLAUDE.md                     unchanged in purpose; points at docs/README.md
├── CONTEXT.md                    the glossary, and only the glossary
└── docs/
    ├── README.md                 the map: which document answers which question
    ├── design-language.md        Ink & Paper, dark theme, motion
    ├── journal.md                what was worked on here (today's root CHANGELOG.md)
    ├── testing.md                layers, the checkable seam, conventions, known open
    ├── adr/README.md             the index, with status
    ├── adr/0001-… 0019-…         each with a status line
    ├── agents/                   unchanged
    └── archive/
        ├── handoff-2026-08.md    today's packages/core/HANDOFF.md
        └── rename-2026-09.md     the Old → New tables out of CONTEXT.md
packages/core/    README.md · CHANGELOG.md · LICENSE · docs/glyphs.md · docs/capabilities-tree.md
packages/charts/  README.md · CHANGELOG.md · LICENSE · docs/capabilities.md
packages/table/   README.md · CHANGELOG.md · LICENSE
```

A package root then holds only what npm and a code host know by name. That is the most visible single effect of this effort.

## Implementation Decisions

### `CONTEXT.md` and `docs/adr/` do not move

Both are addressed by name from `docs/agents/domain.md` and from the installed skills, and `CONTEXT.md` is read by every session that starts here. Moving them would buy tidiness and cost the one mechanism that keeps the vocabulary in use. They stay at the root; ticket 08 only takes out of `CONTEXT.md` what was never vocabulary.

### `.scratch/` is not touched

Fifty-two files under `.scratch/` name `CONTEXT.md`, `TESTS.md` or `docs/adr/`. They are delivery records, and this repository has already decided once — in `english-and-umriss-ui` — that a record is read backwards and must not be rewritten to look current. Moved documents are therefore chased through live pointers only: code comments, `CLAUDE.md`, `TESTS.md`, the changelogs and the ADRs. A reader who follows an old spec into a moved file finds the note in `docs/README.md` that says where it went.

### The map is part of every move

`docs/README.md` (ticket 02) is the one file that would rot fastest, because every later ticket changes what it names. So every ticket from 05 onwards carries, in its own Acceptance, the line that the map names the new place. That is cheaper than a ticket at the end whose job is to notice what nine others did.

### The root changelog becomes a journal, and keeps its ordering

Newest first, as today. What is added is an entry head that can be located without a search: the month, the effort slug from `.scratch/`, and one line saying what it meant for callers (usually: nothing, or a pointer at the package changelog that carries it). What is *not* done is a merge with the package changelogs — that question was asked and answered in `english-and-umriss-ui` 14, and the answer was no.

### The component table in core's README stays generated

`demo/tooling/readmeTable.ts` is a guard over it and runs in `pretypecheck`. Ticket 09 lifts the design language out of that README and must leave the generated table and its guard exactly where they are.

## Testing Decisions

There is nothing to test here in the ordinary sense, and two things to check mechanically:

- `pnpm typecheck` must stay green through ticket 07: `packages/core/demo/tooling/readmeTable.ts` reads the README, and six code comments cite `HANDOFF.md` by path.
- `pnpm lint` must stay green through every ticket; no rule here touches source.
- After ticket 04, `pnpm pack --dry-run` for all three published packages lists a `README.md`, a `CHANGELOG.md` and a `LICENSE`. Today two of the three do not.

No baseline moves in this effort. No file under `packages/*/src` is edited.

## Sequencing

**Stage 1 — additions, no link breaks: 01, 02, 03, 04.** This is the largest part of the effect and it can be delivered in an afternoon.

**Stage 2 — moves: 05, 06, 07.** Each updates its own live pointers.

**Stage 3 — content: 08, 09.** Independent of everything above; can be taken first if the mood is for prose rather than filing.

## Out of Scope

- A documentation website. The demos are the documentation for the components (`demo-as-documentation`); a site that hosts both demos and the prose is a product decision and a spec of its own. Nothing here prevents it — the map in ticket 02 is its table of contents.
- `.github/`, CI, issue templates. The repository has no CI today; adding one is a separate decision with its own consequences.
- The stale `Status: ready-for-agent` on `.scratch/english-and-umriss-ui/spec.md`, whose seventeen tickets are all `done`. Noticed while taking the inventory, recorded here, not fixed here — it belongs to whoever closes that effort.
- Anything about the demo. That is `.scratch/demo-consolidation/spec.md`, written in the same session.

## Further Notes

**Why no ADR.** Three of these moves reverse an earlier arrangement, and none of them reverses an earlier *argument*: nobody decided that the workspace should have no README, or that a capability record should be called `STATUS` in one package and `TREE` in another. Where an argument does exist — the root changelog being a separate document from the package changelogs — this spec keeps it and only renames the file.

**What this effort is not allowed to improve.** The prose. Every document here is translated, argued and dated; a pass that "tightens" it while moving it would destroy the one property that makes it worth keeping. Tickets move, split and index. Only tickets 08 and 09 write new sentences, and only to carry a section to a new home.
