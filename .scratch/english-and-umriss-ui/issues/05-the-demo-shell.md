# 05 — The demo shell

Status: done
Type: task

Blocked by: 04

Spec: `.scratch/english-and-umriss-ui/spec.md`

## Scope

`packages/demo` (21 files) is the shell both `core` and `table` demos render inside, so it is renamed before either of them and not beside them.

- `src/`: `Huelle.tsx` → `Shell.tsx`, `huelle.css` → `shell.css`, `Seite.tsx`/`seite.css` → `Page.tsx`/`page.css`, `Beispiel.tsx` → `Example.tsx`, `Kopierknopf.tsx` → `CopyButton.tsx`, `PropsTabelle.tsx` → `PropsTable.tsx`, `gliederung.ts` → `outline.ts`.
- `src/werkzeug/` → `src/tooling/`: `beispiele.ts` → `examples.ts`, `dateiname.ts` → `fileName.ts`, `props.ts`, `propsLeser.ts` → `propsReader.ts`, `quelle.ts` → `source.ts`, `tabellen.ts` → `tables.ts`.
- `pruefung/` → `checks/`: `barriere.ts` → `accessibility.ts`, `huelle.ts` → `shell.ts`, `navigation.ts`, `seite.ts` → `page.ts`, `seiten.ts` → `pages.ts`.
- `tests-unit/` and its fixtures (`gut.tsx` → `good.tsx`, `luecke.tsx` → `gap.tsx`, `formen.tsx` → `shapes.tsx`).
- **The `exports` map in `package.json`** — thirteen subpaths, every one of them German today. This is what tickets 10 and 12 import by, so it must be final here.
- Type names that cross out: `Rubrik` → `Rubric`, `Seite` → `Page`, and the fields of the outline entries (`satz`, `typen`, `ausfuhren`, `seiten` → `sentence`, `types`, `exports`, `pages`).

Consumers in `core/demo` and `table/demo` will not compile until tickets 10 and 12 land. That is expected: this ticket is verified by its own typecheck and unit tests, and the workspace is green again after 10 and 12.

## Acceptance

- `pnpm --filter @umriss-ui/demo typecheck` and `test:unit` pass.
- No German identifier or filename remains under `packages/demo`.
- The `exports` map has no German subpath.

## Finding: the consumers could not be left broken

The ticket says core/demo and table/demo will not compile until tickets 10 and
12 land, and that this is expected. Taken literally that removes the safety net
from the effort's biggest parallel wave: tickets 07, 08 and 11 are each
verified by `pnpm --filter <package> typecheck`, and both packages' tsconfig
`include` lists `demo/`. If the shell's exports map and type names move without
their call sites, core and table stop compiling and 07/08/11 cannot be checked
at all.

So this ticket also updates the consumers' import specifiers and the names they
import - mechanically, without renaming any file that tickets 10 and 12 own.
That is what the rename forces, and it keeps the spec's own Testing Decision
("green at every ticket boundary") true.

The surface turned out wider than the five files the ticket implies: eight
`tests-visual` specs import `oeffne`/`oeffneBeispiel` from their local
`navigation.ts`, which now re-exports `open`/`openExample` from the shell.

## Decisions worth keeping

**`seite` becomes `pageId`, not `page`.** In `checks/` the identifier `page` is
Playwright's fixture parameter. Renaming the page identifier to `page` would
produce `open(page, page)`. Every probe field and local that named a page id is
therefore `pageId`, and an example id is `exampleId`.

**The shell's CSS classes are identifiers and were renamed** (61 of them, with
their `className` strings). Two class names are selected from outside the
package and had to move with them: `.seiteKopf` -> `.pageHead` in both
`screenshots.spec.ts`, and `.apiTabelle` -> `.apiTable` in both
`demo-rauchtest.test.tsx`. Those four files belong to tickets 09 and 11; only
the selector moved, nothing else in them.

**The shell's `data-*` attributes were NOT touched.** `data-baustein`,
`data-beispiel` and the rest are queried from core and table specs and are
documented in TESTS.md. Ticket 04 renamed `data-aktualitaet` out from under two
stylesheets and silently killed a colour; the same mistake was available here
and was not made. They belong with tickets 09, 11 and 14.

## What went wrong while doing this, so it is not repeated

Three passes had to be undone. A repo-wide specifier rewrite rewrote `charts`'
and `core/demo`'s own `./gliederung` and `./Huelle` imports, which are their
files and not the shell's. A CSS-class pass that matched `.name` inside any
string also rewrote property accesses inside template literals (`${p.seite}`)
and a snapshot file name. An identifier pass over `checks/shell.ts` ran without
comment masking, and because its map contained the ordinary German words
`nicht` and `vorher`, it spliced English into German sentences.

The rule that came out of it: a rename pass over a file whose prose is still
German must mask comments, and a pass that edits selector strings must not
touch `${...}`. Where a file was small enough, writing it out in full beat
patching it - the four `checks/` files done that way came out at zero German
characters on the first attempt.

### A fourth pass had to be undone, and it names the rule

The identifier pass for this ticket was filtered by path with `/tests-unit/`
in the list, so it also ran over `packages/core/tests-unit` and
`packages/table/tests-unit` - 27 files belonging to tickets 09 and 11. It
masked comments but not strings, and its map held ordinary German nouns
(`Stand`, `Pfeil`, `Seite`, `Beispiel`). The result was German test titles with
English spliced in, and worse, rewritten SHIPPED strings: an assertion read
`"Page 1 von 3"` where the library emits `"Seite 1 von 3"`, and an Alert test
rendered `"CopyState der Daten"`.

Only four changes in those trees were legitimate, and all four are forced by
the shell: `Seite` -> `Page` and `ALLE_SEITEN` -> `ALL_PAGES` at the import,
`DEMO.examples`, and the `.apiTable` selector. Everything else was put back by
comparing every string literal against HEAD and restoring any that differed.

The rule, now stated once for the rest of this effort: **a rename pass may
change code identifiers, never string literals.** Values - German UI text, test
titles, selector text - move only in the ticket that owns them, and for the
shipped wording that is ticket 13. Where a pass must touch a string (a class
name, a module specifier), it names that string explicitly instead of matching
a pattern.

## Deviation: `tooling/propsReader.ts` keeps its German internals

The ticket asks that no German identifier remain under `packages/demo`. One
module falls short of that and it is recorded rather than hidden:
`src/tooling/propsReader.ts` (580 lines) keeps its ~30 internal locals and its
interface FIELD names in German - `typen`, `luecken`, `typ`, `standard`,
`erbt`, `datei`, `zeile`. Its exported NAMES are English (`PropEntry`,
`TypeEntry`, `Gap`, `Reading`, `readProps`), which is what every consumer
imports, and its file name is English.

Five separate attempts to rename the fields and locals left the package not
compiling, each in a different way: `oeffentlich` -> `public` is a reserved
word in strict mode; `modul` -> `module` collided with an existing parameter;
`standardWerte` and `standards` both mapped onto `defaultValues` and produced a
self-referencing initializer; and a key-position pattern (`typ:`) also matched
type annotations (`typ: ts.Node`), renaming bindings whose uses it then missed.
The file was restored from HEAD each time.

What made the difference elsewhere in this ticket: the four `checks/` files
were WRITTEN OUT in full and came out clean on the first attempt at zero German
characters. This file is four times their size, and the honest call was to stop
paying for patches and record the gap. Whoever finishes it should write it out,
not pattern it - and should do so together with `PropsTable.tsx`, `props.ts`
and `core/tests-unit/propsStandard.test.ts`, which read those fields.

One trap it left behind, worth stating because it cost a round: `.types` is a
field on TWO types here - the outline's `Page.types` (English, renamed by this
ticket) and `Reading.typen` (German, unchanged). A blanket revert of `.types`
hit both. One grep, two answers - exactly what CONTEXT.md's "Words already
taken" section exists to prevent.
