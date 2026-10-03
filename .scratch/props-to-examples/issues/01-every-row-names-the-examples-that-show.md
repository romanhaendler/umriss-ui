# 01: Every row names the examples that show it

Status: done
Blocked by: `types-without-holes` 01 (One table model, two writers), `types-without-holes` 02 (Rows that are true: no `never`, no free type parameters, constraints in the header)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** The props generator learns, through the type checker, which example and which scenario uses which documented row: JSX attributes, JSX children, object literals under a contextual type, property access on output types, and spreads counted by their own declared type only. A use is keyed by the property's declaration, so an inherited row is covered by its parent's use and two components with a `value` never cover each other. Each row gets an anchor `#<Type>-<prop>`, its name links to that anchor, and under its description it carries "Shown in" with up to three example links (own page first, then other pages in outline order, then scenarios; "Title (Page)" off-page, "Title (Scenarios)" for a scenario) and "and N more". The line is the same in the demo, in the prerendered page and in `llms-full.txt`, because all three draw from the one table model.

- [x] Fixture tests in the shell's tooling tests cover each kind of use: attribute, children, object literal, property access on an output type, a spread whose type carries the prop and one whose type does not, two components sharing a prop name, an inherited row
- [x] `shownIn` order is own page, other pages in outline order, scenarios; two runs write byte-identical output
- [x] A row with four uses renders three links and "and 1 more" in both writers; a row without a use shows no line
- [x] Every row has the id `<Type>-<prop>` in the demo and in the prerendered HTML; the prop name links to it
- [x] The built-site guard fails when a `#<Type>-<prop>` link on any prerendered page has no matching element on its target page
- [x] Page suite: a "Shown in" link lands on the example with it in view; clicking a row name puts its anchor in the address
- [x] Screenshot baselines of pages with props tables renewed once

## Comments

Delivered: `packages/demo/src/tooling/shownIn.ts` (new). It builds one TypeScript program over a demo's example and scenario files and asks the checker which property each use resolves to. Five kinds of use count:

- a JSX attribute, through the contextual type of the element's attributes;
- JSX children, as `children`;
- an object literal's properties, through its contextual type (of a union, the arms the literal is assignable to);
- a property access, and a name an object pattern takes out;
- a spread, for the properties of its own type only.

A use is keyed by its declaration's file and position (`declarationKey`). The reader now hands back `declaredAt`: every place each row was read from, so a row merged from several union arms has several places, and an inherited row has its parent's place. `generateProps` attaches `shownIn` (page, example, title, pageName) to every row that has a use. The order is the row's home page, then the other pages in outline order, then the scenarios. In `apiTable.ts`, the model's row carries a `shownIn` line ("Shown in: A, B (Page), C (Scenarios) and N more"). The model puts the examples of the page it renders on first, so a definition shown on another page reads right too. The HTML writes the line as `<p class="apiShown">` in the description cell, and the row name becomes `<a href="#<Type>-<prop>">` on the `<tr id>` that props-table-hygiene 02 introduced. The Markdown writes `<br>Shown in: [..](#/page/example)` in the cell, and the twins make those links absolute as before. `typeLinkFaults` (built-site guard) now also checks every `#<Type>-<prop>` link. In real data, rows with a "Shown in" line: core 327, charts 132, table 145, schedule 104, calculation 63 (the TableSnapshot, `invalid` and Wording gaps are the ones the spec expects). The scan adds about 5 s to core's `props`.

Tests:

- `tests-unit/shownIn.test.ts` runs against a new fixture package, `fixtures/shown`. It covers each kind of use, a loose spread that does not count, two `value`s kept apart, an inherited `id` covered in both tables, the order, the titles and page names, and two runs giving identical output.
- `apiTable.test.ts` covers four uses written as three links plus "and 1 more" in HTML and Markdown, own page first, no line without a use, and the name linking to its own anchor.
- `site.test.ts` covers the row-anchor guard.
- In the page suite (`checks/page.ts`), a "Shown in" link lands on its example in view, and a click on a row's name puts `#<Type>-<prop>` into the address. Both pass in ui-light, table-light and schedule-light.
- Real table and llms output is byte-identical over two runs.
- lint and typecheck are green. test:unit is green in every package. In the parallel run, the charts' `readout.jsdom.test.tsx` failed once under load and passed on a rerun; nothing in charts was changed. The shell and page suites passed in ui-light and table-light.

Baselines moved: `drawer-beside-a-service-list` (ui-light, ui-dark), the only picture that shows an API table. The baseline on main was already stale from the header and heading changes merged before this ticket. The renewal carries those changes as well as the "Shown in" lines.

Deviations:

- `shownIn` stores `pageName` for every entry, not only for other pages, so the writers can decide "same page" for the page they render on.
- The Markdown row name is not a link, because Markdown has no row anchors. Only the HTML (app and prerendered page) has them.
- The page suite takes an optional `tablePageId`: the table and schedule probe pages are feature pages without a table.
- No CHANGELOG entry, as in the earlier props-table tickets: only `docs/llms-full.md` gains the lines.
