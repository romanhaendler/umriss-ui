# 04 — The public surface and `lib`

Status: done
Type: task

Blocked by: 03

Spec: `.scratch/english-and-umriss-ui/spec.md` (The public surface is renamed once, alone)

## Scope

The one seam that cannot be parallelised. **Nothing else may run beside this ticket.** It renames every name that crosses out of `@umriss-ui/core` and every call site that reads one, in a single commit, so that afterwards the packages' internals are genuinely disjoint.

- **`core/src/lib/` in full** (19 files, 2,399 lines): directories `sprache/` → `language/`, `anbieter/` → `provider/`, `glyphen/` → `glyphs/`, and every file per the dictionary. Lib is here rather than in the parallel phase because it *is* largely the public surface and all 125 component files import it.
- **`core/src/index.ts`** (42 export lines) and every name it re-exports.
- **The 21 German public names**, against the dictionary from ticket 02:
  `Wortlaut` · `useWortlaut` · `Formate` · `useFormate` · `Urteil` · `Bewertung` · `bewerte` · `GrenzwertSatz` · `AktualitaetsSchwellen` · `AktualitaetsZustand` · `useAktualitaet` · `SpracheOptionen` · `SpracheProvider` · `verschmelzeSprache` · `useDichteFuer` · `useVirtuell` · `VirtuelleZeilen` · `VirtuellOptionen` · `TagGruppe` · `schwere` · the `Anbieter` context behind `UmrissProvider`.
- **All 72 import sites** in `packages/table` and `packages/demo` that name one of them.
- Inside the component files, rename **only** what these renames force (the imported name and its uses). Component internals belong to tickets 07 and 08; do not drift into them.

The `Wortlaut` interface's *field names* become English here (`eingabeLeeren` → `clearInput`). Its *values* stay German — the English text is ticket 13.

## Acceptance

- `pnpm typecheck`, `pnpm lint`, `pnpm test:unit` pass.
- No German name is exported from `core/src/index.ts`.
- `grep -rE '\b(Wortlaut|Formate|SpracheProvider|verschmelzeSprache|useDichteFuer|VirtuelleZeilen|TagGruppe)\b' packages` finds nothing.
- No baseline moved — the library still says the same German things, under English names.

## Finding: the limit model's field names are NOT in this ticket

ADR-0006 puts the limit model in both packages on purpose, and what makes the
doubling honest is `grenzwertKonformitaet.test.ts`. That test deliberately does
not import the types - neither version may become the truth about the other - so
it compares **structurally, at runtime**: it reads `urteil`, `grenzwert`,
`ueberschreitung` and `abweichung` off both results and renders
`${grenzwert.stufe} ${grenzwert.seite} ${grenzwert.wert}` into a string. The
shared case table in `charts/tests-unit/grenzwertFaelle.ts` feeds
`{ grenzwerte, sollwert }` and `{ wert, seite, stufe }` into **both**.

The field names are therefore not core's private business: they are the wire
format the two packages agree on, and renaming them in core alone turns every
conformance case red.

This ticket renames the **names** - `Urteil` to `Verdict`, `Bewertung` to
`Assessment`, `bewerte` to `assess`, `GrenzwertSatz` to `LimitSet`, `schwere` to
`verdictWeight` - and leaves the field names and the string literals as they
are. That is the ticket's own scope: all 21 names it lists are type, function
and hook names, and the one field-level rename it asks for is named explicitly
and separately ("The `Wortlaut` interface's field names become English here").
The conformance test needs only its import line moved and keeps working, so the
suite stays green at this boundary.

The field names and the `"warnung"`/`"oben"`/`"frisch"` literals stay German for
now. They are one coupled rename across both packages - and the literals are
also written into `data-urteil` and matched by `Stat.module.css` and
`VerdictColumn.module.css`, so the attribute, the selector and the literal move
together or not at all. Whoever does it does it in one commit across core,
charts, the case table and the conformance test. It is not free anywhere in this
effort's remaining shape, and it is written down here rather than discovered
again.

## Finding: a second conformance test couples charts to core (ticket 06)

`themeFallbackKonformitaet.test.ts` lives in core and reads
`charts/src/theme.ts` (`FALLBACK_THEME`) and `charts/src/styles/charts.css`,
pairing the fields `colorWarnung`/`colorAlarm` with the CSS variables
`--uc-color-warnung`/`--uc-color-alarm`. Those names are charts' and are renamed
by ticket 06 - but the test that reads them is core's, and ticket 09 owns it.
Ticket 06 must therefore update that test's `Feld` type and `PAARE` table in its
own commit, or it leaves core red. This is written into ticket 06.

## What this ticket did, and one thing it did not

`core/src/lib/` is English in full: nineteen files, the three directories
(`sprache` -> `language`, `anbieter` -> `provider`, `glyphen` -> `glyphs`), the
exported names, and the 357 German comment lines translated **in full rather
than shortened** - they are the reasoning, and compressing them while
translating would have been the only real loss available here.

The `Wording` register's 179 field names, its eight preset keys and the twelve
`Formats` fields are English; the values stay German, as this ticket's scope
says. The rename was scoped three ways, because a wording key is a very common
German word: definitions only in `wording.ts`/`formats.ts`, override objects
only inside a `wording`/`formats` object literal, and reads only where the
receiver IS a wording object. A first attempt renamed `.key` repo-wide and
rewrote every unrelated object that happened to share a name - `.sollwert` on a
limit set, `.eintraege` on a Pareto result, `.stunde` on a cell point, and the
same in charts, which this ticket may not touch at all. It was reverted whole
rather than repaired, and the second attempt asserts that no foreign receiver
moved.

Identifier renames run on code spans only. Comments keep their words until they
are translated as prose - otherwise a German sentence ends up reading "von der
Assessment getrennt", which is neither language. The same rule was applied to
German prose inside string literals: 38 test titles and demo sentences were put
back after the first pass reached into them.

**Not done here, deliberately: the limit model's field names and its
`"warnung"`/`"oben"`/`"frisch"` literals.** See the Findings above - they are
the wire format two packages agree on, pinned by a conformance test that
compares both versions structurally at runtime, and they are also written into
`data-urteil` and matched by two stylesheets. They move in one commit across
core, charts, the case table and the conformance test, or not at all.

## Finding: four baselines move, and "no baseline moved" could not hold

This ticket's acceptance says no baseline moves, on the reasoning that the
library still says the same German things under English names. That is true of
the library and false of the demo, for one reason the ticket did not foresee:
a page head prints the package's export names. `Seite.tsx` renders

    `import { ${ausfuhren.join(", ")} } from "${paket}";`

from the outline's `ausfuhren`, so renaming a public name changes visible text
on that page. Two pages name a renamed export - `tag` (`TagGruppe` ->
`TagGroup`) and `stat` (`useAktualitaet` -> `useFreshness`) - which is four
images across the two themes. They are not touched here. Ticket 16 owns
baselines and rebuilds them with review.

Four other images moved and were defects, not consequences. They are fixed:

- **`stat--aktualitaet`, both themes.** The freshness tone was gone: "Veraltet"
  rendered muted instead of amber, "Keine Verbindung" muted instead of red. The
  rename had matched inside the DOM attribute `data-aktualitaet` - the
  word-boundary check passes after a hyphen - and renamed it to
  `data-freshness`, while `Stat.module.css` and `AlarmList.module.css` still
  select `[data-aktualitaet=...]`. The attribute name is restored; the
  stylesheets belong to tickets 08 and 11 and rename it with them. A
  cross-check of every `data-*` written in TSX against every one selected in
  CSS now reports no orphan but `data-zieht`, which is written through
  `dataset.zieht` and was always so.

- **`table--dichte`, both themes.** The example's title read "Density: am Tisch
  oder am Anbieter". Values stay German in this ticket; the rename had reached
  into the title.

Both belong to the same root cause: comments are masked from the rename, but
STRINGS are not - deliberately, because `${wording.clear}` inside a template is
code. That leaves German values and German prose inside string literals
exposed. The sweep for it is now a comparison against HEAD rather than a
keyword heuristic: no string literal under `src/` or `demo/` may differ from
HEAD except where it contains code. One shipped value had survived every
earlier check that way - `paletteFindCount` returned "1 Find" instead of
"1 Fund".
