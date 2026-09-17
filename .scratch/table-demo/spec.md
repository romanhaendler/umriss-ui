# Spec: The demo of `@umriss/table`

Status: done

Origin: written on request, 11 Sep 2026, after `umriss-table` tickets 01–13 were delivered. It was **not** produced in a grilling session. Two decisions below change the shape of the work and are marked **Needs confirmation**; everything else follows from existing specs, ADRs and the glossary. Once A and B are confirmed (or overturned and this spec amended), the status becomes `ready-for-agent` and the tickets are cut.

Delivery note: the spec was implemented on request the same day, with A and B **taken as recommended and not confirmed in a session**; overturning either now means amending this spec and the code. No tickets were cut — the work followed **Sequencing** in one delivery. Findings the delivery made beyond the spec: two defects in `@umriss/table` that only a browser shows (control cells wider than their sticky offsets; the filter strip's condition label below 4.5:1 on the tag surface), both fixed there and recorded in its changelog; the same label colour in `@umriss/ui`'s own filter strip, left for `umriss-table` 14 to remove with it; and a re-measure tolerance of 0.5 px in `useVirtuell` that lets a start value within half a pixel of the real row height stand, which over 20,000 rows is 10,000 px of scroll height.

Unblocks: `.scratch/umriss-table/issues/14-remove-table-from-ui.md`, which may not delete the table's behaviour tests from `@umriss/ui` before equivalents run against this demo.

Builds on: `.scratch/demo-as-documentation/spec.md` (page anatomy, examples as files, props tables, the JSDoc gate, the screenshot rules — all of which apply here unchanged unless stated), `.scratch/umriss-table/spec.md`, ADR-0016, ADR-0017, `CONTEXT.md` (**The demo**, **Tables**).

Prose is English per `CONTEXT.md`, identifiers German. The demo's visible text is German, as in the other two demos.

---

## Problem Statement

`@umriss/table` has no demo, and three things wait on one.

**Nobody can see the package.** Its public surface — `useTabelle`, six hook-bound building blocks, five free ones, `VerdictColumn`, `AlarmList`, `spalte` — exists as source, types and 285 unit tests. There is no page on which a developer finds out that `<Column value="menge" footer="sum" />` is how a sum is written, and no running table in a browser at all.

**The old table cannot leave `@umriss/ui`.** Its interaction suites — `funktionen-tabelle.spec.ts` (14 tests) and `funktionen-virtuell.spec.ts` (17 tests) — and the screenshots of the `Table` and `AlarmList` pages run against ui's demo. `umriss-table` forbids deleting working behaviour tests to make room for a rewrite, so the table, the model, the export, the view link, the selection and `meldeModell` stay duplicated across two packages until this demo carries equivalent suites.

**Some promises of the new package are unproven.** jsdom cannot observe layout, real focus movement or colour. `umriss-table` deferred these to "the demo of the package": the sticky row header actually sticking (10), the quiet gesture of row actions (09), focus after moving a column in the column menu, where a moved DOM node loses focus in a real browser (08), the download started by `Export` (08), and virtual scrolling with keyboard navigation over rows never rendered (10).

The old demo showed the old table badly — nine examples, seven of them three-row miniatures, and the column filter, filter strip, column menu, widths, row actions, export and view link had no example of their own (`umriss-table`, Problem Statement). This demo is the chance not to repeat that.

## Solution

A demo in `packages/table/demo`, built exactly like ui's: one page per building block, examples that are files and show the code that ran, props tables generated from the types behind a JSDoc gate, a "Warum so" section where there was a decision, a command palette, flat addresses. It runs with `pnpm dev:table`, builds with `build:demo`, and is photographed and exercised by Playwright projects of its own.

The shell it runs in is shared with ui's demo rather than copied a second time (decision A). Its pages are the package's building blocks, with `Table` and `Column` carrying most of the examples (decision B).

## User Stories

1. As a developer new to the package, I want one page that shows the smallest working table and the call that produced it, so that I can start by copying.
2. As a developer, I want every column prop — value, presentation, format, footer, row header, list filter, width, sort and export values — to have an example of its own, so that I do not reverse-engineer a demonstration.
3. As a developer, I want the defaults by value type shown as a running table, so that I can see what a column without `children` looks like before writing one.
4. As a developer, I want presets and wrappers shown with the call that types and the one that does not, so that I pick the route that the compiler checks.
5. As a developer, I want the free building blocks shown both inside a table and outside it with `of`, so that my page layout is not dictated by the table's.
6. As a developer, I want one demonstration that uses everything together, so that I see how filter, selection, actions, view link and export meet.
7. As a developer, I want the view link shown with the address it writes, so that I understand that the string is mine to place.
8. As a developer, I want a virtualised table with enough rows to feel it, so that I can judge when to switch it on.
9. As a developer, I want the props of every building block in a table generated from the source, so that the table cannot be wrong about the code.
10. As a developer working on a shop floor application, I want `VerdictColumn` and `AlarmList` on pages of their own, so that the domain layer is documented where I look for it.
11. As a maintainer, I want the old table's interaction tests to have equivalents here, assertion by assertion, so that ticket 14 can delete the originals without losing a guarantee.
12. As a maintainer, I want the promises jsdom could not check proven in a browser, so that "sticky", "quiet at rest" and "focus stays" are facts and not intentions.
13. As a maintainer, I want every example photographed in both themes and a sample of pages checked by axe, so that this demo is held to the standard of ui's.
14. As a maintainer, I want the shell of two demos of the same shape to exist once, so that a fix to the palette or the copy button is not made twice.
15. As a reader of the demo, I want the palette to find pages and examples of this package, so that I jump instead of scroll.

## Decisions that need confirmation

### A — The shell is extracted, not copied  *(Needs confirmation)*

ui's demo shell is about 3,000 lines: `Huelle.tsx`, `Seite.tsx`, `Beispiel.tsx`, `Kopierknopf.tsx`, `PropsTabelle.tsx`, three stylesheets (≈1,080 lines), the tools under `demo/werkzeug/` (props generator and reader, source rewriting, example discovery, file names), and their tests (the shell and page Playwright suites, `propsLeser`, `quelle`). `@umriss/table` cannot import any of it: its lint forbids paths into `packages/ui`, and ui's demo is not part of ui's public entry.

**Recommended: a private workspace package `packages/demo` (`@umriss/demo`, `"private": true`, never published)** holding the shell, its stylesheets, the tools and their unit tests, configured per demo by what differs:

- the outline (`GLIEDERUNG`),
- the example and source globs — `import.meta.glob` resolves relative to the file that calls it, so each demo keeps a ten-line `beispiele.ts` that globs its own directory and hands the result to the shell,
- the package name shown in import lines and substituted into copied source (`@umriss/ui`, `@umriss/table`),
- the source directory and type names the props generator reads,
- the "Warum so" modules.

ui's demo moves onto it in the first ticket, **without a single baseline moving** — the extraction is a move, not a redesign.

Why not copy, as the charts demo did: charts copied because it is standalone (R-1.2) and a *different shape* — canvas, few props, no props tables. The demo-as-documentation spec anticipated exactly this moment: "If the charts demo should follow later, the shell is extracted then, from something that has proven itself." The table demo is the second demo of the *same* shape, and three thousand lines in two places is the drift this repository's rules exist to prevent.

Why not one documentation site for both packages: a site under `apps/` importing both would give readers one palette and one address space, and is arguably the better product. It moves ui's demo out of `packages/ui`, changes every baseline path and every `navigation.ts` import, and decides the future of charts' demo too. It is a spec of its own if wanted; the extraction here does not prevent it — it is its first step.

Dependency direction stays clean: `@umriss/demo` imports `@umriss/ui`'s public entry (the palette, the tokens) and nothing else; `@umriss/ui` and `@umriss/table` depend on it only from their `demo/` directories, as a devDependency. Lint gains one rule: `packages/*/src` may not import `@umriss/demo`.

### B — What a page is  *(Needs confirmation)*

The glossary defines a **Page** as everything the demo says about one component, and the ui demo's rule is "one page per component a developer would search for by name", compound parts on their parent's page, hooks on their component's page.

**Recommended: eleven pages in four rubrics.**

**Tabelle** (2): `Table` (with `useTabelle`, which is where a table starts — the hook has no page of its own, by ui's rule) · `Column` (with `spalte`, the preset helper)

**Zeilen** (2): `RowDetail` · `RowActions` (with `Action`, which exists only inside it)

**Leiste** (5): `Toolbar` · `Search` · `ColumnMenu` · `Export` · `Pagination`

**Betrieb** (2): `VerdictColumn` · `AlarmList` (with `meldeModell`)

The alternative was pages by topic — "Werte und Formate", "Filter", "Breiten", "Ansicht" — which would read well and break the glossary's definition, the palette's grouping and the rule that an address names a component. It is rejected for the same reason ui's demo rejected category pages. The consequence is accepted: `Column` and `Table` are long pages, as `Table` was in ui's demo, and "Warum so" on each carries the topics.

**Reversed in part for `Filter` (table-filters 07, Sep. 2026).** With `filter="list"`, `filter="range"` and `spaltenFilter` the subject grew past what a paragraph under "Warum so" can carry: writing one's own filter is a walkthrough, not a remark, and its examples sat on `Column` while the pre-filter sat on `Table`. `Filter` is now a page of its own, and the glossary's **Page** admits a concept that several components share and none owns. The rest of this decision stands: no "Werte und Formate", no "Breiten", no "Ansicht" page.

`Search`, `ColumnMenu`, `Export` and `Pagination` could share the `Toolbar` page as compound parts. They do not, because each is imported and searched by its own name and each has a behaviour worth an example (`of`, reordering, download or callback, the rule that a table pages only when a `Pagination` stands).

## Implementation Decisions

### Where it lives and how it runs

- `packages/table/demo/` with `index.html`, `main.tsx`, `gliederung.ts`, `beispiele/<Baustein>/NN-<anker>.tsx`, `warum/<seite>.tsx`, `.generiert/` (ignored, as in ui).
- `packages/table/package.json`: `dev` (`vite --config vite.demo.config.ts`), `build:demo`, `preview:demo` on **port 4175**, `props` with `predev` and `prebuild:demo`, as in ui. Root `package.json`: `dev:table`.
- `vite.demo.config.ts` aliases `@umriss/ui` to ui's source, like the unit tests (ADR-0016's public-entry rule is about imports, not about where the resolver finds them). **The token and base stylesheets are imported explicitly** in `main.tsx` through `@umriss/ui/styles.css`, aliased to a small file that imports ui's `tokens.css` and `global.css`: ui's demo learned that the bundler drops them otherwise and the whole demo renders unstyled (`packages/ui/demo/main.tsx`, header comment).
- `@fontsource/geist-sans` and `@fontsource/geist-mono` become devDependencies of `@umriss/table`, as in ui. The package keeps zero runtime dependencies; `files` stays `["dist", "CHANGELOG.md"]`.
- `playwright.config.ts` gains a web server for the table demo and the projects `table-hell` and `table-dunkel` with `testDir: "packages/table/tests-visual"`.

### Examples and source

- Examples import the package as `"../../../src"`; the code block shows `"@umriss/table"`. Imports of `@umriss/ui` are shown as written. The rewrite is the existing one (`quelle.ts`), parameterised by package name — still the only difference between the file and the page.
- Fixtures stay inside the example file (demo-as-documentation; TESTS.md). Data is seed-based and deterministic; a virtualised example builds its 20,000 rows from a seed in the file.
- **Every column prop has an example.** "Four examples that differ only in one prop value are one example plus a table" (demo-as-documentation, Übergabe) applies: the defaults by value type are one example showing string, number, date, boolean and an absent value side by side.

### The props tables

The generator reads interfaces today. The table package declares its most important shapes differently: `Column` is an interface of **overloaded call signatures** (`SpaltenKomponente`), and `FeldSpalte` is an **intersection alias** with conditional member types (`FormatFuer<Z[K]>`). Decided:

- The generator learns to read a type alias whose right-hand side is an intersection of object types and interfaces, listing members in declaration order and showing member types as written (`FormatFuer<Z[K]>` stays that text).
- A page names the props types it documents in its outline entry, as ui's pages do. `Column` documents `FeldSpalte`, `SpaltenGrund` and `WertWege`; the overloads are a type-level mechanism, explained under "Warum so" (why a computed value needs an `id`, why `footer` on text does not compile) rather than rendered as six tables.
- `ActionProps` is a union discriminated by `bulk`; its table lists the members of both arms once, with `onSelect` shown in both forms.
- **The JSDoc gate applies.** Several members lack comments today (`FeldSpalte.id`, `.format`, `.footer`; `UrteilsGrund`'s members; some `*Props` of the free building blocks). Writing them is part of this work. `UrteilsGrund` is not exported; `VerdictColumn`'s table documents it because the page names it, which is what "public" means to the generator.
- `TabelleOptionen` and `TabellenStand` get tables on the `Table` page: the hook's options and return value are the table's API as much as `TableProps` is.

### Pages and their examples

What each page must show. Anchors are indicative; the files decide.

**Table** — `erste-tabelle` (three columns, rows, nothing else) · `auswahl` (`selectable`; "alle" means the filtered set) · `klebende-teile` (`stickyHeader`, `stickyRowHeader`, horizontal scroll) · `dichte` (`density`, and a `UmrissProvider` that sets it) · `leer-und-laden` (`empty`, `loading`, and "nothing matches" with its way back) · `zeilen-gestalten` (`rowProps`) · `ansichtslink` (`initialeAnsicht`, `suchparameter` shown as the address it would write) · `virtualisierung` (`virtuell`, `maxHeight`, 20,000 rows) · `anbieter` (wording and formats overridden once for both packages) · **Vorführung** — the order list from `umriss-table`'s Solution: toolbar with search, column menu and export, list filters, two-level sort, selection, row detail, row and bulk actions, pagination, view link.

**Column** — `wert-aus-feld` · `berechneter-wert` (with `id`) · `darstellung` (`children(wert, zeile)`) · `voreinstellungen` (the defaults table, running) · `fehlende-werte` · `format` · `fusszeile` · `zeilenkopf` · `listenfilter` · `breite` (`width`, `resizable`) · `eigene-ordnung` (`sortValue`, `exportValue` on an object value) · `vorlagen` (`spalte<P>()`, spread, overridden) · `huelle` (a wrapper with `of`).

**RowDetail** — `detailzeile` (several open; open rows survive a filter change).

**RowActions** — `zeilenaktionen` (two inline) · `sammelaktion` (a list of one on the row, the selection in the toolbar) · `ueberlauf` (three actions, all in the menu).

**Toolbar** — `in-der-tabelle` (bulk actions appear with a selection) · `ausserhalb` (`of`).

**Search** — `suche` · `ausserhalb` (`of`, placed elsewhere on the page).

**ColumnMenu** — `ein-ausblenden-und-ordnen` (with a sticky row header, which cannot be moved).

**Export** — `download` · `text` (`onExport`, showing the text).

**Pagination** — `blaettern` · `ohne-leiste` (a table without it shows all rows).

**VerdictColumn** — `vier-urteile` · `sortierung` (`sortBy`) · `format`.

**AlarmList** — the two existing examples of ui's page, rewritten against the English props (`view`, `selection`, `onAcknowledge`, `asOf`, `freshness`).

### "Warum so"

- **Table**: columns are elements and the table renders its rows — the defect this package exists to remove (ADR-0017); the hook binds the row type and there is no free `Column`; the library remembers nothing (the view is a string the application places); selecting all means the filtered set; virtualisation is an option, never beside paging; a table pages only when a `Pagination` stands.
- **Column**: one value, and presentation is not value; absent values and why `children` never sees one; defaults by value type decided at runtime from the first present value; why the compiler refuses `footer` on text, requires `id` for a computed value and requires a renderer for an array; presets over wrappers.
- **RowActions**: the quiet gesture; two inline, three in a menu; a bulk action always receives a list.
- **VerdictColumn**: an unknown verdict is a verdict (ADR-0010); sort by severity; export the value; built only from public API. Links ADR-0006 rather than retelling it.
- **AlarmList**: ui's essay moves unchanged (ADR-0009 and the four sections), plus one paragraph on what the re-expression taught (`umriss-table` 13).

ui's `demo/warum/table.tsx` does **not** move: its first section ("Die Zellen bleiben von Hand gebaut") is the decision ADR-0017 reversed. It is deleted with ui's `Table` page in ticket 14.

### Glossary

`CONTEXT.md`'s section **The demo** begins "The demo of `@umriss/ui` is documentation". It becomes "The demos of `@umriss/ui` and `@umriss/table` are documentation"; the four terms apply to both unchanged. No new term is needed. If decision A holds, the section gains one sentence: the shell is shared and lives in `@umriss/demo`.

## Testing Decisions

### Equivalents of the old table's interaction tests

Ticket 14 may delete an old test only when its equivalent below is green. Each equivalent is written against the new API and the example named; the assertion is the same, the selectors follow the new markup.

`funktionen-tabelle.spec.ts` → `packages/table/tests-visual/funktionen-tabelle.spec.ts`

| Old assertion | Against |
|---|---|
| Filter strip appears only once something restricts | Table › Vorführung |
| Strip names the ratio of matches to total | Table › Vorführung |
| Removing one condition leaves the others | Table › Vorführung |
| "Alles zurücksetzen" clears the strip | Table › Vorführung |
| Modifier key adds a second sort level, with rank digits | Table › Vorführung |
| A row expands and collapses by keyboard | RowDetail › detailzeile |
| Several rows stay open at once | RowDetail › detailzeile |
| Row actions are reachable by keyboard | RowActions › zeilenaktionen |
| The overflow menu opens and executes | RowActions › ueberlauf |
| The overflow menu returns focus to its trigger | RowActions › ueberlauf |
| Dragging the handle changes width and does not sort | Column › breite |
| Double-clicking the handle fits the content | Column › breite |
| Alt with arrow keys changes width | Column › breite |
| The dragged width appears in the view link | Table › ansichtslink |

`funktionen-virtuell.spec.ts` → `packages/table/tests-visual/funktionen-virtuell.spec.ts`, all against **Table › virtualisierung**: renders a fraction of the rows · the scrollbar measures the full set · scrolling reveals rows never rendered · the way back leads to the start · the header stays while scrolling · the first column sticks while scrolling sideways (now: the sticky row header) · arrow keys move row to row · the keyboard alone gets into the grid · there is exactly one tab stop · End brings focus into an unrendered range · Home leads back · focus does not land behind the sticky header · a selection survives its row leaving the window · select all covers the whole set, not the window · sorting orders all rows, not only the rendered · searching shrinks the set and the scrollbar · there is no pagination beside virtualisation.

### Proofs jsdom could not give

`packages/table/tests-visual/funktionen-browser.spec.ts`:

- **Sticky row header** stays in place while scrolling sideways, behind the selection and expander cells, and nothing overlaps it (`umriss-table` 10).
- **The quiet gesture**: a row action's computed colour is the secondary text colour at rest and the accent on row hover and on focus within the row (09).
- **Column menu focus**: after "nach vorn", focus is on the moved column's button in the real DOM; at the end of the list it moves to the sibling button (08).
- **Export download**: `page.waitForEvent("download")` receives `auftraege.csv`, and its content is the filtered set in visible order (08).
- **The regression, in a browser**: reordering through the column menu moves header, body and footer cells on screen.

### The standard of ui's demo

- **Screenshots**: one per example with code collapsed, one page header per page, light and dark — derived from the outline and the example files, never counted (`seiten.ts`). `beispiel-table--*`, `seite-table`, `beispiel-alarmlist--*` and `seite-alarmlist` of ui's suite are replaced by this suite's baselines of the same pages; ticket 14 deletes ui's only then.
- **Accessibility**: axe (WCAG 2.1 AA) in both themes over a sample — overview, `table`, `column`, `rowactions`, `columnmenu`, `alarmlist` — plus one page with all code blocks open. Tolerated colour pairs are the ones ui's suite tolerates, with the same written reasons; none is added.
- **Shell and page behaviour** (palette, addresses, code switch, copy button): if decision A holds, these suites live with the shell and run against both demos from one source; if it does not, they are copied.
- **Unit**: a jsdom smoke test of the demo (every page renders, every example has a title); the generator against a fixture with an intersection alias and an overloaded interface; the import rewrite for `@umriss/table`.
- **Clock** frozen at 17.03.2026 10:30 in every test, as in ui.

Commands before delivery: `pnpm build`, `pnpm typecheck`, `pnpm test:unit`, `pnpm lint`, `pnpm test:visual`. ui's baselines do not move in any ticket of this spec.

## Sequencing

1. **Extract the shell** into `@umriss/demo` and move ui's demo onto it. Acceptance: ui's full visual suite green with no baseline regenerated. *(Only if A is confirmed.)*
2. **The table demo stands**: scripts, Playwright projects, the generator reading the table's types, the smoke test, and the **`Table` page complete in final form** including the Vorführung — the shape proven on one real page before ten follow, as `Button` proved ui's.
3. **Column.** The longest page; every column prop.
4. **Rows**: `RowDetail`, `RowActions`.
5. **The free building blocks**: `Toolbar`, `Search`, `ColumnMenu`, `Export`, `Pagination`.
6. **Betrieb**: `VerdictColumn`, `AlarmList` with its moved essay.
7. **Equivalent interaction suites** and **browser proofs** (Testing Decisions), and the table demo's screenshot and axe suites.
8. **Hand-over**: `umriss-table` 14's `Blocked by` line points at this spec's delivery; `TESTS.md` lists the table demo's suites.

Tickets 3–6 are independent of each other once 2 is done. Ticket 7 depends on the pages it tests.

## Out of Scope

- Removing anything from `@umriss/ui` — that is `umriss-table` 14, which this spec unblocks.
- A single documentation site for all packages (see decision A), and any change to `packages/charts/demo`.
- A README for `@umriss/table` and a README table generator for it.
- Changing `@umriss/table`'s public API. JSDoc comments and, where the gate needs a name to read, an exported props interface are the only additions to `src/`.
- The two naming conflicts recorded after `umriss-table`'s review (German `format` values; the mixed language of the hook's options). The demo documents the API as it is; if the names change, the examples change with them.
- Pages for later specs (grouping, live data, grid navigation, inline editing).
- Deploying either demo.

## Further Notes

**Why not simply move ui's table pages across.** Every one of ui's nine table examples is written against the old API (`useTabelle(zeilen, spalten)`, `Th`, `Td`, hand-applied hiding). None survives the move; their fixtures and their essays partly do. The mapping of assertions above is what carries over, not the files.

**The Vorführung is the reference table of the spec.** `umriss-table`'s Solution section sketched an order list as the hypothesis the API was built to satisfy. Making exactly that the demonstration closes the loop: the example on the page is the call the package was designed for, and the interaction suite tests it.

**The props generator will find gaps.** ui's gate expected sixty missing comments and found 149. The table package's types were written with the gate in mind, but not under it.
