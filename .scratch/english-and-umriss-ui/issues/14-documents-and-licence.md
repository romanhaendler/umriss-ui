# 14 — The documents and the licence

Status: done
Type: task

Blocked by: 13

Spec: `.scratch/english-and-umriss-ui/spec.md` (The historical record; Further Notes)

## Scope

**Translated**, because they are read forwards:

- `README.md` (207 lines, German) — the design guidelines, "Tinte & Papier", the whole of it.
- `TESTS.md` (238 lines), `CLAUDE.md`, `docs/agents/*.md`.
- The German messages in `eslint.config.js` and its comments. The rules do not change.
- The German remnants under `.scratch/`: the ticket name `table-filters/issues/07-eine-seite-fuer-filter.md` (renamed to `07-a-page-for-filters.md`), and any German body in the older feature directories (`visuelle-wertigkeit` and its neighbours). Their delivered prose is not rewritten beyond language.

**Translated and split**, because a promise is currently unkept:

- `CHANGELOG.md` (766 lines) → an English changelog **per package**. Every manifest lists `CHANGELOG.md` in `files`, but only one exists, at the repository root — so every published tarball would contain none. Each package keeps the entries that are its own. The first entry of each is this effort. A line at the top records that commits before it are in German and why (the specs cite SHAs).

**Edited in place**, because they describe the architecture that holds now:

- Every ADR that names `@umriss/ui`, `@umriss/charts`, `@umriss/table` or `@umriss/demo` — ADR-0016 alone names `@umriss/ui` about a dozen times. A reader chasing a package that does not exist finds nothing. Names only; no reasoning is rewritten.

**Added:**

- **MIT.** `"license": "MIT"` in the three published manifests, and a `LICENSE` file per package (npm packs it automatically). `@umriss-ui/demo` stays `private: true` and needs none. This means anyone may use it, commercially and including competitors, with no obligation beyond carrying the licence text.

## Acceptance

- No German prose remains outside `docs/history/`-style records, the git log, and `CONTEXT.md`'s not-yet-reconciled tail (ticket 15).
- `pnpm pack --dry-run` for each of the three packages lists a `CHANGELOG.md` and a `LICENSE`.
- `pnpm lint` passes with the translated messages.
- No ADR names a package that does not exist.

## Found while doing the earlier tickets

- `TESTS.md` lines 92 and 94 name `packages/ui/tests-unit/grenzwertKonformitaet.test.ts` and `themeFallbackKonformitaet.test.ts`. All three names are now wrong: the directory is `packages/core`, and the two files are `limitConformance.test.ts` and `themeFallbackConformance.test.ts`. This document therefore corrects as well as translates.
- `packages/charts/STATUS.md` (670 lines) and `packages/charts/CHANGELOG.md` stay German after ticket 06 and both describe identifiers that have since been renamed. Same correction-not-only-translation applies.
- The older `.scratch/` feature directories name the packages under their old scope throughout. Their delivered prose is not rewritten beyond language, so a reader needs the note at the top of each changelog explaining that commits before this effort are in German.
- `packages/core/BAUM.md` is a German filename, and its line 13 points at
  `tests-visual/funktionen-baum.spec.ts`, renamed to `features-tree.spec.ts` in
  ticket 09. `packages/core/HANDOFF.md` is German throughout as well. Neither was
  in this ticket's original file list.

## Correction: there is no changelog to split

Checked before acting on it, and the ticket's premise above is wrong twice.

**All three per-package changelogs already exist**: `packages/core/CHANGELOG.md`
(696 lines), `packages/table/CHANGELOG.md` (183), `packages/charts/CHANGELOG.md`
(104). And all three manifests do list `CHANGELOG.md` in `files`
(`["dist","CHANGELOG.md"]`), so a published tarball would have carried one. The
claim that every tarball would contain none was simply false.

**The root `CHANGELOG.md` is a different document, not the unsplit original.**
It records what was *worked on in this repository* — rebuilds, tests, decisions
invisible from outside — and has 12 headings. `packages/core/CHANGELOG.md`
records what changes *for callers* and has 13. Core's own header states the
distinction explicitly and says the two deliberately do not run in parallel: an
entry there can be missing here because it changed no contract, and one sentence
here can summarise three entries there.

So the work is translation, not splitting, and the root changelog stays where it
is. Splitting it into the package files would have merged two documents that were
deliberately separated.

## Also not in the original list

- `packages/core/GLYPHEN.md` (120 lines, German, German filename).
- `packages/core/README.md` is stale as well as German: it shows
  `import { Button } from "@umriss/ui"`, documents `useBaum` — which no longer
  exists anywhere in `src`, `useTree` replaced it in ticket 08 — points at
  `GLYPHEN.md`, and line 161 still says German is the only shipped language.

## What was judged rather than translated

Two scope decisions, recorded so they can be overruled rather than discovered.

**`HANDOFF.md` is treated as a record.** Its part A.5 is translated in full,
because six comments in live code cite it and nothing else documents those
conventions. Its parts B and C are left in German: B's fifteen work packages are
delivered or superseded, C's manual checklist is replaced by the executable
`TESTS.md`, and translating a superseded specification is precisely what would
make it read as current. Part A.1–A.4 is left as well, with an English preamble
saying it describes a package that no longer exists and naming what replaces it.

**The older `.scratch/` directories are delegated, not skipped.** Roughly 800
umlaut lines across fourteen effort records. The ticket asks for them and its
instruction is exact — *their delivered prose is not rewritten beyond language* —
so they are being translated on that rule: no re-scoping, no improvement, every
SHA, ticket number and old identifier left as written, because a record is read
backwards while a README is read forwards.

`visuelle-wertigkeit` needs care beyond translation: it is the source of
`CONTEXT.md`'s design-language tail, and it uses all five of the words whose
collisions ticket 15 has to settle. Choosing an English word for any of them there
would prejudge that ticket, so the instruction is to translate the German as it
stands and list the places where a choice would bind ticket 15's hands.
