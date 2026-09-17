# 17 — The values, not only the names

Status: done
Type: task

Blocked by: 16

Spec: `.scratch/english-and-umriss-ui/spec.md`

## Why this ticket exists

The effort reported itself finished at ticket 16. It was not. The user looked at
the stylesheets — "Schau dir doch mal die css Files an, zum Beispiel vom dock" —
and then at one attribute value — "Aber auch sowas wie `data-place="oben"` ist
noch falsch". Both were right, and both point at the same gap.

**Every detector this effort used looked for prose.** Umlauts, German function
words, German sentences. None of them looked at *identifiers* — a custom
property's name, a CSS class, a `data-*` value, a type's literal union. So the
sweep reported `tokens.css` clean while eight dock tokens underneath the
translated comments still read `--u-dock-feld`, `--u-dock-griff`,
`--u-dock-abstand`. No umlaut, no German function word, nothing for a prose
detector to find.

And three tickets had *deliberately* deferred value sets, each with the same
argument: it is a shape two parties agree on, so it moves in both places or in
neither. Ticket 04 said it about the limit model. ADR-0018 said it about
`DateRange`. Ticket 16 said it about the dock's four places, which is why eight
baselines carried `dock-oben` in their file names.

That argument is sound about **who has to move** and wrong about **whether they
may stay**. A shape two parties agree on is the one name a caller has to type.
It is the first place a second language shows, not a private corner.

## What moved

Eleven commits, each carrying one set with every consumer:

| # | Set |
|---|---|
| 17 | The eight `--u-dock-*` tokens — public custom properties, three of them read back at runtime through `getComputedStyle` |
| 18 | `Place`: `oben`/`rechts`/`unten`/`links` → `top`/`right`/`bottom`/`left`, with `data-place`, both wording registers and eight baseline file names |
| 19 | `data-zeile` → `data-row` — see the finding below |
| 20 | The limit model's wire format across core, charts, the case table and the conformance test |
| 21 | `Freshness` and `data-aktualitaet` |
| 22 | The alarm lifecycle, its transitions and the three priorities |
| 23 | `useVirtual`'s options and window fields, repeated in the table's own public `virtual` prop |
| 24 | `DateRange`, `RangePreset`, the search spans and the wording registers' parameter names |
| 25 | Every Intl instance in `formats.ts`, the word-start detection in `search.ts`, two build configs |
| 26, 28 | The props reader, its test and its fixtures |
| 27 | German test data in four files |
| 29 | CONTEXT.md and ADR-0018, which still defended two of these sets |
| 30 | An assertion sorted in German alphabetical order |
| 31 | The provider's density — the last public German: the `dichte` prop, `data-dichte`, and the rest of `core/src/lib` |
| 32 | `NumberFormat`: `format="anzahl"` is a value a caller types |
| 33 | Three leftovers no pattern caught: `_anzahl`, a CSS section marker, a stale file reference |
| 34 | The unit tests' German fixtures, and `DateFormat` |

## Finding: `data-zeile` was not only German, it never matched

`useVirtual` re-measures the row height on a real row, because an assumed height
adds up over twenty thousand rows to a scrollbar that lies by forty thousand
pixels. It looked for `[data-zeile]`.

Only the tree writes `data-zeile`. The table writes `data-row` — since its rows
were given English names. **In the table the re-measurement never fired**:
`zeilenHoehe` stayed at the value the caller passes as a starting point, and the
filler rows were sized against it.

Two visual tests had been failing on exactly this and were recorded as
pre-existing, attributed to a row rendering at 38.5px against an option of 37.
Both pass now. The German name was the defect; renaming it was the fix.

The lesson is narrower than "rename things": a `data-*` attribute has a writer
and a reader, and nothing type-checks the pair. The cross-check this effort ran
in ticket 04 compared *emitted* against *selected in CSS*. It would not have
caught this one, because the reader here is a `querySelector` in TypeScript.

## Finding: three words mean two things each

Every pattern let loose over the repository cost a round, and always for the
same reason:

- **`oben`** is a dock place *and* the upper side of a limit. Renaming the first
  had to leave the second alone — they moved in different commits.
- **`wert`** is a limit's number, a filter's value in `de.ts`, a context value in
  `language/index.tsx` and a set element in `options.ts`. 333 occurrences, of
  which about a third belonged to the limit model.
- **`seite`** is a page number in `pageOfPages` and the side of a time range in
  the two daylight-saving hints — in the same file.
- **`alt`** is a freshness state and an alarm's identifier in a test fixture.

Every one of these renames therefore ran over an explicit **file list**, and the
list was built by grepping for the *fields* — which is how `scene.ts`,
`LimitLine.tsx` and four more files were missed in the first pass of ticket 20:
they carry the literals without carrying a field name. The three unit suites
stayed green, because they assert the old values. The **typecheck** caught it.

> For a literal rename the compiler is the witness, not the test count.

## Finding: the register rule

`de.ts` and `wording.ts` hold German display text and German parameter names in
the same line:

```ts
pageOfPages: (seite, gesamt) => `Seite ${seite} von ${gesamt}`,
```

A word-boundary replacement of `von` breaks the sentence. The rule that came out
of it, and that CONTEXT.md now carries:

> German nouns are capitalised, so a **lowercase** German word in a wording
> register is an identifier and never display text. The exceptions are `von`,
> `bis` and `ab`, which do stand in the German sentences — and those are replaced
> only in parameter position and inside `${…}`.

## What went wrong while doing this

**BSD `sed` has no `\b`.** Two renames — `roh` in `useFreshness.ts`, `vor`/`hier`
in `search.ts` — were run as `sed -e 's/\bvor\b/before/'`, applied to nothing,
and reported as done. The typecheck stayed green, because an identifier nobody
renames stays consistent with itself. Every other pass in this ticket used
Python's `re.sub`, which does support `\b`. Corrected in 27.

**A commit landed with a red test.** The gate for ticket 22 ran typecheck and
lint and then committed; the table suite was failing on a free-text search for
`"Kesseldruck"`, a label the same commit had translated. Amended. Every gate
after it makes the commit conditional on the test result as well — which is what
caught the `describe: () => "leer"` / `toContain("leer")` pair in 27.

**A rename ran over German prose.** Ticket 26 moved the props reader's
identifiers and left its 299 German comment lines standing, so the file came out
reading "Der Leser weiss nichts **from** der Demo" and "ein Prop **omitted**
JSDoc". Ticket 05 had written this rule down after the same mistake: a pass over
a file whose prose is still German must mask comments. Repaired in 28 by doing
what was outstanding anyway — writing the file out.

## Finding: four German fragments were shipped text, not identifiers

`propsReader.ts` maps `HTMLElement` onto `"dem gerenderten Element"`,
`HTMLHeadingElement` onto `"der Überschrift"`, `HTMLTableCellElement` onto
`"der Zelle"`, and `POLYMORPH` is `"dem gewählten Element"`. `PropsTable.tsx`
splices them into an **English** sentence, so every API table in the demo read

> Also takes every attribute of dem gerenderten Element

They are `"the rendered element"`, `"the heading"`, `"the cell"` and
`"the chosen element"` now. This is the only reason a demo baseline moves.

## Finding: a detector that matches nothing reports success

Two sweeps in this ticket came back clean because the tool was silently wrong,
not because the code was:

- **`sed -e 's/\bvor\b/before/'`** — BSD `sed` has no `\b`. Two renames applied
  to nothing and were reported as done. The typecheck stayed green, because an
  identifier nobody renames stays consistent with itself.
- **`git grep -- 'packages/*/src'`** — a glob pathspec has to match the whole
  path, not a directory prefix, so this searched **no files at all**. It is what
  reported the library clean while `<UmrissProvider dichte>` was still public.

Both failed by returning nothing. The habit that follows: a detector must be
shown to find something known before its silence is believed.

## Finding: German that is the subject, not a leftover

Five test files keep German fixtures, and translating them removed what they
measure — nine tests at once:

- `defaults.test.tsx` and `tableModel.test.ts` sort a row named **Änderung**,
  because German collation files Ä with A. "Change" proves nothing.
- The three tree tests encode **letters**: the type-ahead jumps on "a", "ge"
  has to tell *Gemischt* from *Gesperrt*, a search for "a" reaches *Anlagen*,
  *Einzelblatt* and *Archiv* but not *Leer*.

The test for whether a fixture may be translated is not "is it German" but
"does the test measure the value, or a property of the value".

## What stays German, and why

- **`de.ts`** — the German wording. It is freight a caller takes on purpose
  (ADR-0019), and `pageOfPages` still says `Seite ${page} von ${total}`.
- **`packages/core/HANDOFF.md`** — its own preamble carries the reasoning:
  translating a superseded specification would make it read as current, which is
  the one thing it is not. Only its part A.5 is translated, because live code
  points into it.

## Open, and deliberately not taken here

`DEFAULT_FORMATS` is `de-DE` throughout — date, time, number, per cent,
collation and the relative phrase — while the wording has been English by default
since ADR-0019. That is a product decision about a second axis, not a rename, and
it wants its own ticket.
