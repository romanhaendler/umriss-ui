# 15 — The design-language tail, resolved

Status: done
Type: task

Blocked by: 14

Spec: `.scratch/english-and-umriss-ui/spec.md` (The design-language tail is resolved, not translated)

## Scope

`CONTEXT.md` lines 538–658 arrived with `.scratch/visuelle-wertigkeit/` and have carried a "not yet reconciled" marker ever since. **This is the only ticket in the effort containing design decisions rather than mechanical work**, and it cannot be done by translation: the file itself names five collisions with the glossary above it, and each one gets worse in English, not better.

Settle all five, then translate the section and merge it into the glossary proper, retiring the marker.

| Word | Below | Above | Why English makes it worse |
|---|---|---|---|
| **Kachel** | a section of the demo | on the `_Avoid_` list — the demo has no tiles any more | Both become "Tile" |
| **Ebene** | a step in a shadow stack | the **Level** of a tree node | "Layer" and "Level" are near-synonyms in English; the German pair was further apart |
| **Ton** | a semantic colour role | **Verdict** avoids "Ton" for a verdict | Both become "Tone"; they may coexist only if the colour role never means the verdict |
| **Skala** | the projection of the DataViz marks | **Scale**, the affine mapping of a chart axis | Both become "Scale" — and both are real, live concepts |
| **Raster** | the 42-cell month grid | "no layout grid exists or should" | "Grid" invites exactly the layout grid the entry forbids |

Also in this section and needing a word: **Vokabular**, **Kante**, **Bewegungsursprung**, **Zustands-Kanon** (whose obvious "state canon" collides with the charts' State — ADR-0007), **Maß**, **Benannte Ausnahme**.

For each: either one word wins and the other is renamed in code and glossary, or both stand with a disambiguating qualifier recorded under "Words already taken". A rename reaching into code is in scope here — it is the last chance to make it before the baselines are rebuilt.

Whether any of this warrants an ADR is a judgement to make while doing it: hard to reverse, surprising without context, a real trade-off. If one of the five qualifies, write it; do not write five.

## Acceptance

- `CONTEXT.md` has no German prose and no "not yet reconciled" marker.
- Each of the five collisions is resolved in writing, and any code rename it implies has landed.
- `pnpm typecheck`, `pnpm lint`, `pnpm test:unit` pass.

## Found after 09 and 10 landed: German survives in the shared shell

These belong here rather than anywhere else, because this ticket is the last
point at which a rename reaching into code is still free — ticket 16 rebuilds
every baseline immediately afterwards. No open ticket owns them.

All of them are the same shape, and it is the shape ticket 04 learned the hard
way from `data-aktualitaet`: a German word emitted by the shared shell and
selected on from two packages' suites, so it moves in **one** commit across all
of them or it breaks something silently.

- **`data-baustein="uebersicht"`** — emitted at `packages/demo/src/Shell.tsx:280`,
  with `id="uebersicht-titel"` beside it and `aria-labelledby` pointing at it.
  Selected from `packages/demo/checks/shell.ts:68` and `:129`,
  `packages/demo/checks/navigation.ts:13`, `packages/core/tests-visual/pages.ts:26`
  and `:39`, `packages/core/tests-visual/screenshots.spec.ts:37-38`,
  `packages/table/tests-visual/pages.ts:17` and `:26`, and
  `packages/table/tests-visual/screenshots.spec.ts:21-22`.
- **`"uebersicht"` as a page id** in the `PAGES` list of both packages, and in
  the table's `SAMPLE` list.
- **`data-vorfuehrung`** — emitted at `packages/demo/src/Example.tsx:84`,
  selected at `packages/demo/src/page.css:222`.
- **`data-beispiel`** — selected at `packages/core/tests-visual/features-tree.spec.ts:20`
  and `:23`.

Six baselines carry `uebersicht` in their filename, in all three packages
(`uebersicht-charts-*`, `seite-uebersicht-ui-*`, `seite-uebersicht-table-*`).
Note that `seite-` is German too, so those names carry two.

Whether `Baustein` is worth a glossary entry or should simply become `part` is a
judgement for this ticket; what is not in question is that a demo whose whole
point is to be read cannot ship a German attribute name.

### Correction: the blast radius above is bigger than first written

The list above was taken from a search of the visual suites. A search of the
whole workspace gives the real extent, and the difference matters — under-scoping
a `data-*` rename is exactly how ticket 04 removed a colour without noticing.

**`data-baustein` is emitted twice, not once.** Besides the overview at
`Shell.tsx:280`, `packages/demo/src/Page.tsx:52` puts it on **every page**:
`data-baustein={seite.id}`. So the attribute is not an overview marker, it names
every block of the demo, and renaming it touches every page snapshot rather than
six.

**`data-beispiel` is also queried at runtime**, not only in tests:
`packages/demo/src/Shell.tsx:125` does
`document.querySelector('[data-beispiel="${ziel}"]')` to scroll to an example.
A rename that misses this line breaks jump-to-example in the shipped demo, and
no unit test covers it — it is a DOM query behind a click.

**Seventeen files reference the three attributes**, not the ten listed above:
`packages/demo/checks/shell.ts` alone has sixteen occurrences, and there are
three each in `accessibility.spec.ts` and `screenshots.spec.ts` of *both* core
and table, plus `features-browser.spec.ts`, `features-table.spec.ts`,
`features-virtual.spec.ts`, `checks/page.ts`, `checks/navigation.ts`, and the
`demo-smoke.test.tsx` of both packages.

**And `Page.tsx:52` is still German in two more ways**, on the same line:
the variable is `seite`, and it writes `aria-labelledby={`seite-${seite.id}`}`.
That `seite-` prefix is an accessibility contract read by the suites, and it is
why the baselines are named `seite-uebersicht-…`. It has to move with everything
else or not at all.

### The shared shell is still German — the full inventory

Taken after ticket 12 landed, so this is the whole of it. `packages/demo` was
ticket 05's, and ticket 05 renamed its files and classes but not this. Together
with the `data-*` attributes above, it is one commit's worth of work and should
be done as one, because several of these are contracts between the shell and
both demos.

**The `title` / `titel` split — the reason the accommodations cannot simply be
deleted.** Ticket 10 renamed `@umriss-ui/core`'s 67 example files to
`export const title`; ticket 12 deliberately kept `export const titel` in the
table's 46, calling it the shell's contract to close. So the two demos now
disagree, and the shell tolerates both:

- `src/tooling/examples.ts:51` — `titel?: unknown;` in `ExampleModule`
- `src/tooling/examples.ts:67` — `const title = mod.title ?? mod.titel;`
- `src/tooling/source.ts:42` — `TITLE_START = /^export const (?:title|titel)\b/`
- `src/tooling/fileName.ts:16` — `EXAMPLE_PATTERN` accepting `beispiele|examples`
- `checks/pages.ts:29` — a synthetic `/beispiele/${sub.name}/${file}` path

Rename the table's 46 exports to `title`, then all five alternations go. Until
then they are load-bearing, not dead code — which corrects what ticket 16's note
assumes.

**One assertion is already vacuous**, and it is the same trap that
`demo-smoke.test.tsx` had: `checks/page.ts:126` asserts
`expect(content).not.toContain("export const titel")`. Against core's demo,
whose files now say `title`, it passes while checking nothing.

**German identifiers, aria ids and messages in the shell itself:**

- `src/Page.tsx:62` and `:64` — `aria-labelledby={`abschnitt-beispiele-${seite.id}`}`
- `src/Shell.tsx:280` and `:282` — `id="uebersicht-titel"`
- `src/tooling/source.ts:49` — `withoutTitle(quelle: string)`
- `src/tooling/source.ts:54` — a thrown message, in German: "Eine Beispieldatei
  ohne `export const titel` – ohne Titel hat das Beispiel keinen Namen."
- `src/tooling/fileName.ts:39` — a thrown message, in German, naming a German
  path shape: "`${pfad}` heißt nicht wie ein Example. Erwartet:
  beispiele/<Baustein>/NN-<anker>.tsx", with the parameter itself named `pfad`
- Comments naming `demo/beispiele/` at `src/demo.ts:9` and `:33`,
  `src/tooling/fileName.ts:3`, `checks/pages.ts:3` and `:7`

The two thrown messages are worth separating out: they are the only German a
consumer of `@umriss-ui/demo` would ever see, and they appear exactly when
somebody has made a mistake and is least able to guess at the meaning.

### Five German names are still public API

`packages/core/src/index.ts` is `export *` throughout, and line 48 re-exports
`./lib/glyphs`. So these are exported names of `@umriss-ui/core`, documented in
its README as components:

`KreuzGlyph` · `GriffGlyph` · `MassGlyph` · `RasterGlyph` · `WinkelGlyph`
(`PlusGlyph` and `MinusGlyph` are already neutral.)

Ticket 08 left `lib/glyphs` alone deliberately, because components A–K use it as
well and it belonged to no single ticket; ticket 07 said the same. Between them
nobody owned it, so five German words survived an effort whose entire purpose was
to remove them — and they survived in the one place that is hardest to change
later, the published surface. Nothing outside `src` imports them (the demos and
the table do not), so the blast radius is eight files plus the README row.

Suggested, subject to the glossary: `CrossGlyph`, `GripGlyph`, `MeasureGlyph`,
`GridGlyph`, `AngleGlyph`. Note **`RasterGlyph` → `GridGlyph`** walks straight
into the Raster/Grid collision this ticket has to settle anyway, and
`MassGlyph` → `MeasureGlyph` into `Maß`.

`packages/core/GLYPHEN.md` (120 lines, German, German filename) is the
specification they are drawn to. Renaming it reaches into code: it is cited from
`src/lib/glyphs/index.tsx` (three times), `src/components/Dock/Dock.tsx:76`,
`packages/core/README.md`, and `packages/core/CHANGELOG.md` twice.

### The Raster/Grid collision is now live, in English

Ticket 14 translated `.scratch/visuelle-wertigkeit/`, and in doing so it turned
one of this ticket's five warnings into a fact rather than a prediction:

- `visuelle-wertigkeit/issues/05-tiefenarbeit-drei-oberflaechen.md` now says
  **"grid"** for the DatePicker's month grid.
- `visuelle-wertigkeit/spec.md` now says **"grid"** for the design grid it
  *rejects* — "force everything onto a grid", "a spacing grid", "a baseline grid".

So one grep for "grid" already returns two answers, which is exactly the state
this ticket exists to end. `Stack und Grid` is also a component page name, making
three senses.

Deliberately still German in `spec.md`'s Further Notes: **Raster**, **Skala** and
**Maß**, in the passage that *names* the collisions ('A design "Raster" or a
typographic "Skala"'). That paragraph is about the words themselves, so it needs
rewriting here rather than translating — it is the one place where choosing the
English word IS the decision.

Further placements ticket 14 had to make, each of which this ticket can overrule:

- **Skala → "scale"**: `spec.md` ("modular scale with factor 1.2", "ratio
  scale", Out of Scope "A modular type scale").
- **Ebene → "level"**, and *Schicht* → **"layer"** nearby ("the token layer",
  "token and base layer"). So "layer" is already spoken for, which narrows what
  `Ebene` can become. `demo-as-documentation/issues/08` keeps the rubric name
  "Struktur und Ebenen" untranslated.
- **Ton → "tone"**: the whole of `tone-contrast/spec.md`, plus
  `consumable-package/04` and `demo-as-documentation/spec.md`.
- **Kachel → "tile"**: heaviest in `consumable-package/04` ("18 demo tiles"),
  also `demo-as-documentation`, `table-surface/09`, `judging-values`. Backticked
  `Kachel`, `data-kachel` and `data-baustein` were left as identifiers.

### German that stays in the tests, and why

Checked rather than assumed, so that the next reader does not "finish" it. Three
kinds, all correct as they stand:

1. **Fixture data.** `"Änderung"`, `"Basalt"`, `"Cirrus"` in the table's rows,
   `"Vergrößern"` as a dock tool's label, `"Stückzahl"` on a Stat, an Alert's
   `"Fehlgeschlagen"`. These are a test author's invented content, not shipped
   strings. They prove nothing about language, and translating them is churn
   against assertions that name them.
2. **Deliberate German-wording assertions.** `toolbarWording.test.tsx` passes
   `wording={{ filterReset: "Zurücksetzen" }}` and asserts the button carries it.
   The German is the point: it proves an override reaches the component. Ticket 13
   added one such mount test per package for exactly this reason.
3. **`wordingSource.test.ts`.** Its regex is
   `[A-ZÄÖÜ][a-zäöüß]{3,}` and its fixtures are German on purpose - it is the
   guard that detects German literals in JSX, so German is its input.

The same holds for `de.ts` (44 lines), which is the shipped German wording
(ADR-0019), and for `propsReader.ts` with its tests and fixtures (~80 lines),
which is ticket 05's recorded deviation.
