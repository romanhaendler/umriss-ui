# 01: Every row names the examples that show it

Status: ready-for-agent
Blocked by: `types-without-holes` 01 (One table model, two writers), `types-without-holes` 02 (Rows that are true: no `never`, no free type parameters, constraints in the header)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** The props generator learns, through the type checker, which example and which scenario uses which documented row: JSX attributes, JSX children, object literals under a contextual type, property access on output types, and spreads counted by their own declared type only. A use is keyed by the property's declaration, so an inherited row is covered by its parent's use and two components with a `value` never cover each other. Each row gets an anchor `#<Type>-<prop>`, its name links to that anchor, and under its description it carries "Shown in" with up to three example links (own page first, then other pages in outline order, then scenarios; "Title (Page)" off-page, "Title (Scenarios)" for a scenario) and "and N more". The line is the same in the demo, in the prerendered page and in `llms-full.txt`, because all three draw from the one table model.

- [ ] Fixture tests in the shell's tooling tests cover each kind of use: attribute, children, object literal, property access on an output type, a spread whose type carries the prop and one whose type does not, two components sharing a prop name, an inherited row
- [ ] `shownIn` order is own page, other pages in outline order, scenarios; two runs write byte-identical output
- [ ] A row with four uses renders three links and "and 1 more" in both writers; a row without a use shows no line
- [ ] Every row has the id `<Type>-<prop>` in the demo and in the prerendered HTML; the prop name links to it
- [ ] The built-site guard fails when a `#<Type>-<prop>` link on any prerendered page has no matching element on its target page
- [ ] Page suite: a "Shown in" link lands on the example with it in view; clicking a row name puts its anchor in the address
- [ ] Screenshot baselines of pages with props tables renewed once
