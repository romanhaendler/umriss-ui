# Spec: One language, one org — the library becomes English and moves to `@umriss-ui`

Status: done

Origin: `/grill-with-docs` session, 12 Sep 2026. It began with two statements — "I have secured the org `umriss-ui` on npm, so I want to rebuild everything as `umriss-ui/core`, `/table`, `/charts`" and "I do think all texts and names should be English" — and ended in a rename table, a second shipped wording, and a ticket order built around the one seam that cannot be parallelised.

Builds on `.scratch/umriss-table/spec.md` and `.scratch/table-filters/spec.md` (both delivered). Reverses ADR-0015 ("Props are English, identifiers are German") in full, and the glossary's rule that German is the only shipped language.

Glossary: no new domain terms. The whole of `CONTEXT.md` changes language, which ticket 02 performs and ticket 15 finishes.

ADRs: **0018 — Everything is English** (supersedes 0015) and **0019 — Two wordings ship, English is the default**. Written in ticket 13.

Tickets: `issues/01`–`16`. Serial spine: 01–05, then 13–16. The parallel middle runs in two waves — **06, 07, 08, 11** together, then **09, 10, 12** once their subjects have landed. Each ticket names what blocks it.

---

## Problem Statement

The workspace is written in two languages by rule. `CONTEXT.md` fixes it: identifiers German, prose English. ADR-0015 carved out one exception — component props are English — and drew the seam at the destructuring pattern. That rule was coherent and it was followed.

It is now wrong for three reasons that did not exist when it was written.

**The org is called `umriss-ui`.** The npm scope has been secured, and it is English. A package whose name, scope and props are English and whose every internal identifier is German asks each reader to switch language per line — the exact complaint ADR-0015 was written to settle, moved one level inwards.

**The audience is not German-speaking.** The library ships German user-facing text by design: `Wortlaut` is 562 lines of it, and its own header states that German is "die Voreinstellung und die einzige mitgelieferte Sprache" because there is no second one. Published under an English scope, that is a product defect, not a style question.

**Nothing has been published.** `@umriss/ui`, `@umriss/charts` and `@umriss/table` all return 404 from the npm registry. There is no consumer to break, no deprecation window to run, no alias to keep. Every cost this change would normally carry is currently zero, and it will not be zero again.

### What this touches

| | |
|---|---|
| Source | 516 files, 61,086 lines across four packages |
| Baselines | 370 screenshots (core 226, table 118, charts 26) |
| Glossary | 103 terms, of which **86 already carry their English word** |
| Cross-package seam | **21 German public names at 72 import sites** |
| German-only prose | `CHANGELOG.md` 766 lines, `README.md` 207 lines, `CONTEXT.md` lines 538–658 |
| Contradicting decisions | ADR-0015 in substance; every ADR that names `@umriss/ui` by name |

## Solution

Four moves, in an order chosen so the expensive one happens once.

**The packages move to the new scope.** `@umriss/ui` → `@umriss-ui/core` (directory `packages/core/`), `@umriss/table` → `@umriss-ui/table`, `@umriss/charts` → `@umriss-ui/charts`, `@umriss/demo` → `@umriss-ui/demo` (private, never published). The repository directory stays `umriss`: that is the name of the thing, not of the npm scope. Version numbers stay where they are — they are an honest record of work done, and nothing was ever published against them.

**Everything is English.** Identifiers, file and directory names, the long German prose headers that carry the design reasoning, demo artefacts, and every document read forwards. The prose headers are **translated, not shortened**: they are the memory of the design, and compressing them while translating would be the only real loss available in this effort.

**The library ships two wordings.** English is the default; German moves to the subpath export `@umriss-ui/core/wording/de`. Both are typed `Wording`, so a missing entry is a compile error. Semantic drift between the two cannot be caught by anything and is accepted as the price.

**The historical record stays in the language it happened in — except where it is read forwards.** The `CHANGELOG`, the `README` and the German remnants in `.scratch/` are translated.

## Implementation Decisions

### `core` means the component library, not a shared base

`charts` depends on nothing and will keep depending on nothing (ADR-0016, R-1.2). A reader who sees `@umriss-ui/core` and then finds that `charts` does not import it will ask what "core" means. It means *the package you install first*, not *the layer everything sits on*. `CONTEXT.md` says so in one sentence, because the alternative — `@umriss-ui/components` — buys honesty at the cost of a name nobody types.

### The public surface is renamed once, alone

21 German names cross from `core` into `table` and `demo` at 72 import sites: `Wortlaut`, `Formate`, `Urteil`, `Bewertung`, `bewerte`, `GrenzwertSatz`, `AktualitaetsSchwellen`, `AktualitaetsZustand`, `useAktualitaet`, `SpracheOptionen`, `SpracheProvider`, `verschmelzeSprache`, `useWortlaut`, `useFormate`, `useDichteFuer`, `useVirtuell`, `VirtuelleZeilen`, `VirtuellOptionen`, `TagGruppe`, `schwere`, and the `Anbieter` context behind `UmrissProvider`.

While those still read German in `core` and are imported as German in `table`, no two branches can touch them without colliding. Ticket 04 renames all of them, `src/index.ts` and all 72 call sites in one commit, and nothing else runs beside it.

**`core/src/lib` belongs in that ticket, not in the parallel phase.** `useWortlaut`, `useFormate`, `useVirtuell`, `SpracheProvider` and `verschmelzeSprache` *are* largely the public surface, and all 125 component files import them. Renaming lib beside the components is the one way to make the parallel phase collide with itself. At 19 files and 2,399 lines it stays small enough to sit in the spine.

Deprecated aliases were considered and rejected. They are what ADR-0015 did for the props renames, and they were right there — there were callers. Here there are none, so an alias buys nothing but a cleanup ticket.

### Two renames avoid a word that is already taken

**`table/src/kern/` becomes `model/`, not `core/`.** The path would be free — the collision is semantic. "Core" would name both the package and the table's pure model layer, one grep with two answers, which is precisely what the "Mehrfach belegte Wörter" section of `CONTEXT.md` exists to prevent. The file's own header calls it the model.

**`kern/begleiter.ts` becomes `companion.ts`, not `state.ts`.** "State" is heavily loaded by the charts — state series, state band, state list, and ADR-0007 ("A state is a number"). The companion metaphor carries the meaning and collides with nothing.

**`demo/werkzeug/` becomes `tooling/`, not `tools/`**, because "Tool (Werkzeug)" is the glossary's word for a tool of a dock.

### `Anbieter` becomes `Provider`, which deletes an avoidance

The glossary currently lists `_Avoid_: Provider` under **Anbieter**. That avoidance existed only because the German word had to win; the component has been called `UmrissProvider` all along. The entry goes.

### The demo runs English, and German is tested rather than photographed

All 370 baselines are rebuilt in English. German is not photographed a second time — one unit test per package mounts under the German wording, and the seam for that already exists (`wortlautwache.test.ts`, `tabellenleisteWortlaut.test.tsx`).

### `CONTEXT.md` loses its parentheses

86 entries read "Series (Serie)". The header says why: "Where the two differ, the German word is the one to grep for." Once identifiers are English the parenthesis is dead weight, and it goes. The `_Avoid_` lists stay — they carry the disambiguation work, and they carry more of it after this change, not less.

### The design-language tail is resolved, not translated

`CONTEXT.md` lines 538–658 are German prose marked "not yet reconciled", and the file names five collisions with the glossary above it: **Kachel**, **Ebene**, **Ton**, **Skala**, **Raster**. They cannot be translated without being decided — "Level" twice in English is worse than "Ebene" twice in German, because then the grep really does find both. Ticket 15 decides them. It is the only ticket in this effort that contains design decisions rather than mechanical work.

## Testing Decisions

The suite is the safety net for a rename of this size, and it must stay green at every ticket boundary rather than only at the end. Each ticket runs `pnpm typecheck`, `pnpm lint` and `pnpm test:unit` before it is done.

Screenshots are the exception and are deliberately deferred. Tickets 06–12 will leave baselines failing — the demo still says German things in English-named files — and that is expected, not a regression. Ticket 16 is the only ticket permitted to move a baseline, and it rebuilds them rubric by rubric with review. `CONTEXT.md` forbids a bulk rebuild without inspection; that holds here, where the whole point is that the text changed.

Type tests (`typen.test-d.tsx`) rename with their subjects. The wording conformance in ticket 13 is carried by the type system: both wordings are typed `Wording`, so a missing entry fails the typecheck without a test being written for it.

## Out of Scope

- **Publishing.** Nothing is pushed to npm in this effort. The scope, the licence and the changelogs are prepared; the release is a separate decision.
- **Any behaviour change.** If a rename reveals a defect, it is written down in the ticket and fixed in its own commit, never folded into a rename.
- **Translating the delivered specs' prose in `.scratch/`** beyond the German remnants. They record what was decided when, and they are already English where it matters.
- **A second language beyond German.** The wording seam takes any object; shipping a third is an application's business.

## Further Notes

A prerequisite that is easy to miss: the locked worktree `demo-datepicker-sm-wert` holds one unmerged commit. A mass rename makes it practically unmergeable — every file it touches is renamed underneath it. Ticket 01 lands or drops it first. The same ticket puts `.claude/worktrees/` into `.gitignore`, where it has always belonged.

Each package's manifest lists `CHANGELOG.md` in `files`, but only one changelog exists, at the repository root. Every published tarball would therefore contain none. Ticket 14 fixes that while it translates.

## Follow-ups this effort deliberately did not take

**The formats are still `de-DE`.** Ticket 13 made English the default wording,
but `DEFAULT_FORMATS` still groups and separates numbers the German way, so the
default now renders "43 of 1.204" and a date as "17.03.2026" — English words
around German digits. ADR-0019 records this rather than hiding it.

It was left out on purpose, and not for lack of noticing. A locale is not a
language: changing it moves every number, date and percentage in the library,
which is a second pass over all 370 baselines and a second decision about what
the default should even be (`en-GB` and `en-US` disagree about dates, and a
library whose audience is unknown arguably should not pick either — the seam
exists so an application can). That is a ticket with its own reasoning, not a
line to slip into a rename.

What makes it safe to defer is that the seam already works: `UmrissProvider`
takes `formats`, the table's tests prove the cells use it rather than their own
formatters, and nothing about the current default is load-bearing.

**Two documents describe a workspace that no longer exists.** `CLAUDE.md` still
says three packages at `packages/charts`, `packages/ui` and `packages/table`
under the `@umriss/*` scope. Ticket 14 translates it; whoever does that should
also correct it, because it is the file every agent reads first.

## The detector was wrong for most of this effort

Recorded because it invalidates how tickets 04, 07, 08 and much of 14 verified
themselves, and because the next effort will reach for the same broken tool.

**German does not require umlauts.** Large parts of this workspace write it
transliterated — `Flaeche`, `fuer`, `haette`, `groesser`, `koennen`,
`ZURUECKLIEST`. Every check in this effort counted `[ÄÖÜäöüß]`, so those lines
were invisible. `packages/core/src/styles/tokens.css` reported ten German lines
and had seventy-five.

**Use function words instead**, and word-bounded:

```sh
grep -nwE 'der|die|das|und|nicht|mit|von|als|eine|ist|sind|wie|dem|den|sich|ohne|fuer|ueber|waere|haette|steht|damit|weil' <file>
```

Two traps in the check itself: BSD `grep -c` counts *occurrences* when combined
with `-o` and *lines* without it, so the same command reports wildly different
numbers on macOS and Linux; and without `-w`, `der` matches inside `border`.

What the corrected sweep found still outstanding is listed in ticket 15 and
ticket 16.

### The replacement detector over-reports, badly

Added after two agents used it. The function-word list is right that umlauts miss
German, but it is wrong as a to-do list, because in this workspace `von`, `bis`,
`mit`, `ohne`, `hier`, `und` and `gruppe` are **live identifiers**: `DateRange`'s
fields, `RowWindow`'s, `MatchSpan`'s, the formats' `mitSekunden`, the palette
candidate's `gruppe`. Seven of one agent's eight files scored between 5 and 21 and
were already fully English.

So: use the function-word grep to find files worth **reading**, never as a count
of work outstanding. Anyone treating the number as a backlog will rename public
API to make it go down. The only reliable check is reading the hit.

## What the two-axis review left open

The review at the end of this effort (`.agents/skills/code-review`, fixed point
the last commit before it) found things this effort did not close. The ones below are deliberately
**not** closed here, because each is a public-API change on a finished effort and
belongs to a ticket that says so.

**German field names on public types.** `core/src/index.ts` re-exports
`lib/virtual` and `lib/useVirtual` with `export *`, so `RowWindow.{von, bis,
vorher, nachher}` and `VirtualOptions.{zeilenHoehe, puffer}` are published names —
and `packages/table` consumes them across the package boundary
(`model/companion.ts:22,54,172`, `types.ts:300`). This is the shape already
recorded for `DateRange`: a contract two packages agree on, which moves in one
commit across both or not at all.

**German internals behind English surfaces**, each colliding with a word
`CONTEXT.md` marks `_Avoid_`, which is what makes them more than untidy:

- `lib/useFreshness.ts:35-65` — `schwellen`, `schwelleAlt`, `takt`, `bezugszeit`.
  `Schwelle` is the avoided word for **Limit**, and the glossary renamed this very
  concept `schwellen` → `ages` ("not thresholds; they bound an age"). The prop
  moved; the hook's internals did not.
- `lib/options.ts:18-22` — `suche`, `begriff`. `Suche` is avoided for **Query**.
- `lib/language/formats.ts:105,140` — `RELATIVE_STUFEN`, `einheit`, `groesse`.
  `Stufe` is avoided for **Severity**.
- `lib/language/wording.ts:218,283` — English entries typed with German
  parameters: `filteredOfTotal: (treffer, gesamt)`, `columnForward: (spalte)`.
- `components/TreeView/TreeView.tsx:222` — `data-zeile=""`. `Zeile` is avoided for
  **Flattening entry**.

**One duplication worth a ticket.** The freshness-to-wording cascade is written
twice — `Stat.tsx:91-97` and `AlarmList.tsx:162-167` — with byte-identical
`[data-aktualitaet]` blocks in both stylesheets. ADR-0016 already makes core's
internals available to the table, so one exported piece would do. That copy is
also why `data-aktualitaet` could not be renamed from one branch in ticket 04.

### The detectors this effort outgrew

Four in order, each one confidently wrong before it was replaced:

1. `[ÄÖÜäöüß]` — misses transliterated German (`Flaeche`, `fuer`, `haette`).
   `tokens.css` reported ten German lines and had seventy-five.
2. German function words — over-reports, because `von`, `bis`, `mit` and `gruppe`
   are live identifiers. A count is a reading list, never a backlog.
3. `data-*` emitted-vs-selected — missed `grip.dataset.dragging = ""` and the
   quoted key `"data-zustand": z.lifecycle`, reporting both as orphans.
4. CSS class defined-vs-used — anchored on `^\.`, so compound selectors
   (`.striped .virtualBody tr`) counted as undefined.

The rule that survived all four: a grep finds files worth reading. Only reading
finds defects.

## Comments

### Status corrected (2026-09-24)

Delivered: all seventeen issues done (journal "one language, one scope"); the remaining German identifiers are gone, and the `de-DE` formats follow-up became ADR-0024. The Status line had not been moved when the work landed.
