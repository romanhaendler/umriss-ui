# Spec: Types without holes — every type in a props table says what it is

Status: ready-for-agent

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/demo-as-documentation/spec.md` (the props table and its JSDoc gate), `.scratch/ai-readable-docs/spec.md` (the text for coding agents and its completeness guard), ADR-0018 (English), ADR-0037 (the prerendered site).
Blocked by: nothing
ADR: none — the reader's header comment changes its promise ("the type stands as it was written"), and that comment is where the decision is recorded.
Tickets: `issues/01`–`08`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

A developer reading a props table on the site cannot always tell what a prop accepts. The type column shows the type exactly as it is written in the source, so a reader sees `ButtonSize`, `Accessor<T>`, `TableRef` or `Present<W>` and nothing else: no values, no definition, no link. Across the five packages, 150 of 810 props (19 %) name a type of the library whose definition appears nowhere on the site; about 110 types are named and never defined, and 26 of them are nothing but a short list of strings (`ButtonVariant`, `TextSize`, the tone types). `ButtonSize` resolves through `ControlSize` to `"sm" | "md"` and neither step is shown.

Some rows are simply wrong. On the Column page of the table, the current prop `aggregate` is typed `never`, and its deprecated predecessor `footer` is typed `never | FooterFor<W>` — an artefact of how two arms of a union are merged. `W` is not a type parameter of `FieldColumn<Z, K>` at all; it leaked in from a helper type. The header drops the constraint `K extends Field<Z>`. The two `@deprecated` tags in the code are thrown away, so a deprecated prop looks like any other.

The Default column is filled for 104 of 810 props (13 %): charts 1 of 158, schedule 0 of 94, calculation 0 of 54, table 2 of 150. At least 63 defaults are written only in the description ("Default 10.", "300 without a value"), because the reader takes defaults only from a component's destructuring pattern, and the configuration components (series, columns, axes) have none.

The same holes are in the text for coding agents. Its appendix "The rest of the API" prints the declaration of every export that no page *names* — so a type named in a table cell (`ButtonSize`, `Accessor`, `TableRef`, `Wording`, `Intent`) is exactly the one whose declaration is never printed anywhere. And the two renderers of the same props data — the table the app draws and the Markdown the prerendered page and the llms text are made from — already differ in small ways (`*` against "(required)", events set apart in one and not the other).

## Solution

Every type in a props table becomes something a reader can follow to its end, on the page they are reading, without JavaScript.

- A named alias that resolves to a short list of literal values keeps its name and shows the values under it: `ButtonSize` and, beneath, `"sm" | "md"`.
- Every other named type of the library in a type cell is a link. It leads to the type's props table where one exists, otherwise to a definition in a new block at the end of the page's API section, **Types on this page**, which holds the declaration of every library type the page's tables mention and no table defines — with its JSDoc, its members as a table where it has members, and links again inside it.
- The union merge stops producing `never`; inherited and merged members carry the type parameters of the table they stand in; a header shows its parameters with their constraints.
- `@deprecated` and `@default` are read. A deprecated prop carries a badge and the tag's sentence; a default stands in the Default column whether it came from the destructuring or from the tag. The defaults written in prose are moved into `@default`.
- The thirteen types that a table names and the package does not export are exported, so that every name a reader sees is a name they can import.
- One table model feeds both outputs. The app, the prerendered HTML and the llms text are written from it by one HTML writer and one Markdown writer, tested for parity, and the React table component that drew its own version goes.
- The llms appendix prints every export that has neither a props table nor a definition block, instead of every export no page happens to name.

## User Stories

1. As a developer choosing a button size, I want the size prop's type to show `"sm" | "md"` beneath `ButtonSize`, so that I know the two values without opening the source.
2. As a developer, I want the alias name kept beside its values, so that I can find and import `ButtonSize` when I type my own wrapper.
3. As a developer reading a chart series table, I want `Accessor<T>` to be a link to its definition, so that I learn it is `(d: T, index: number) => number | null | undefined`.
4. As a developer reading the Search page of the table, I want `TableRef` to lead to its definition on the same page, so that I know what to pass as `of`.
5. As a developer, I want a type that has its own props table on another page to link to that table, so that I am not shown a second, shorter copy of it.
6. As a developer, I want the definitions of every library type a page mentions collected at the end of the page's API section, so that I can read them all in one place.
7. As a developer, I want a definition with members to be drawn as a table like a props table, so that I read every type in the same form.
8. As a developer, I want a definition that is a union, a function or a mapped type to be shown as its declaration in TypeScript syntax, so that I see exactly what the compiler sees.
9. As a developer, I want types inside a definition to be links too, so that I can follow `TableRef` to `TableSnapshot` without searching.
10. As a developer, I want a type from core that a table or chart page names (`Limit`, `Severity`, `Wording`) defined on that page with a note naming its package, so that I know where to import it from.
11. As a developer reading the Column page, I want `aggregate` typed `AggregateFor<…>` and not `never`, so that I am not told the current prop accepts nothing.
12. As a developer, I want a prop that is forbidden together with another prop to say so in words, so that I learn the exclusivity without reading a union.
13. As a developer reading `FieldColumn<Z, K>`, I want every member typed in `Z` and `K`, so that no type parameter appears that the table never introduced.
14. As a developer, I want the table header to show `FieldColumn<Z, K extends Field<Z>>`, so that I know what `K` may be.
15. As a developer, I want `RadioGroupProps<T extends string>` in the header, so that I know my values must be strings.
16. As a developer maintaining an application, I want a deprecated prop marked with a badge and the replacement sentence, so that I stop using it before it goes.
17. As a developer, I want deprecated props to stand last in their table, so that the current API reads first.
18. As a developer, I want the Default column filled for every prop that has a default, so that I can see what happens when I leave a prop out.
19. As a developer reading a chart, I want `height` to show `300` in the Default column, so that I do not have to find the number in a sentence.
20. As a developer, I want a default that is not a literal ("the size of a ControlSizeProvider, else `md`") shown as a short phrase in the Default column, so that a conditional default is still stated where defaults are.
21. As a maintainer, I want the build to stop when `@default` and the destructuring pattern disagree, so that the table can never show a default the code does not use.
22. As a developer, I want every type a table names to be importable from the package, so that I can annotate my own variables with it.
23. As a developer reading a page without JavaScript (or a crawler), I want the definitions and links to be in the prerendered HTML, so that nothing depends on a hover.
24. As a coding agent reading `llms-full`, I want the declaration of every type and function a page names, so that I never have to guess a signature.
25. As a coding agent, I want the same table in the llms text as on the page, so that what I read is what a person reads.
26. As a maintainer, I want the app's table and the prerendered table written from one model, so that they cannot drift apart again.
27. As a maintainer, I want a parity test between the HTML and the Markdown writer, so that a change to one fails until the other follows.
28. As a reader using a screen reader, I want the alias values and the definitions as ordinary text and tables, so that I hear them like any other content.
29. As a developer, I want the required marker to read the same in every output, so that I learn one convention.
30. As a developer reading in the dark theme, I want links in type cells to be visible as links, so that I notice I can follow them.
31. As a maintainer, I want the reader's fixtures to cover each new behaviour, so that a regression is caught without building the site.
32. As a maintainer, I want the build to fail when a library type in a type cell resolves to no table and no definition, so that a new hole cannot appear unnoticed.

## Implementation Decisions

**The written type stays; resolved facts are added beside it.** The reader keeps the source text as the primary rendering — generics stay generic, `Column<T>[]` stays readable — and adds two things it learns from the checker: an expansion and a list of references.

**Expansion: only literal unions, always under the name.** When the written type is a single named alias of the library (or an array of one) and the checker resolves it, through any number of alias hops, to a union made only of string, number and boolean literals (or a single literal), the row shows the name and, on the next line, the values joined by ` | `. No member limit: the longest such union in the library is `SpaceStep` with eight members. Everything else — interfaces, function types, mapped and conditional types, unions that contain a non-literal — is not expanded but linked. A literal union written inline in the source already shows its values and gets nothing extra.

**References: every library type name in a type cell is a link.** The reader walks the written type node and records each type reference whose declaration lies in the source of this package or of another package of the workspace. Built-ins, React's types and DOM types are not linked. The cell is rendered as text segments, each either plain or a link to a target.

**One anchor scheme for a type: `#type-<Name>`.** A props table's heading carries it; a definition carries it. Names are unique within a package.

**Where a link points, in this order.** (1) To the type's props table, if a page of the same package has one — on the same page as an in-page anchor, otherwise on that page's address. (2) Otherwise to its definition in the page's own **Types on this page** block. A type that has no table is defined on every page that mentions it: the copy is generated, so it cannot drift, and the reader never leaves the page to learn a two-word union. A type from another package of the workspace is defined in the block too, with a line naming its package (`from @umriss-ui/core`).

**The block "Types on this page".** It stands at the end of the page's API section, after the props tables, and is omitted when it would be empty. Its content is the closure: every library type the page's tables mention without a table on this page, plus every library type those definitions mention, stopping at types that have a table (those are linked instead). Order: first appearance. Each entry is the name with its parameters and constraints, the type's own JSDoc as prose, and then either a members table — drawn by the same reader and writer as a props table, for interfaces and object-literal types — or the declaration as the compiler emits it for a `.d.ts`, as TypeScript code with library type names linked. The emitted declaration is reused from the existing code that already produces it for the llms appendix.

**The union merge stops producing `never`.** A member typed `never` in an arm is a prohibition in that arm, not a shape. It contributes no type to the merged row; its description is kept and stands after the descriptions of the arms that give the member a real type, so "Not together with `footer`" still reads. A member that is `never` in every arm does not appear.

**Type parameters are substituted, constraints are shown.** Where a table takes members from a helper type, an inherited type or the arms of an aliased union, the helper's parameters are replaced by the arguments at the use, as already happens for conditional helper types. The table header and a definition's heading show each parameter with its `extends` constraint and its default. No member may name a type parameter that the header does not introduce; the reader reports one as an error.

**Tags are read.** `@deprecated`: the row carries a "Deprecated" badge followed by the tag's text, and the row moves to the end of its table (the grouping of `props-table-hygiene` keeps that rule within each group). `@default`: the tag's text wins over the destructuring default. If both exist and differ (compared after trimming whitespace), the generator stops with the file, line and both values. The Default column shows the text as code when it parses as a JavaScript literal, an identifier or a property access; otherwise as prose. `@remarks` and every other tag are dropped. `@since` is **not** introduced: the packages are 0.x, a retroactive value for 810 props would be guessed, and a column that is filled for new props only reads as if old props had always been there; the changelog is the place for "since".

**The prose defaults move into `@default`.** Every prop whose description states its default gets the tag, and the sentence that only stated the default is removed from the description. A description that is empty after that is rewritten into a real sentence (the gate would stop on it). Charts, schedule, calculation and table are where the work is; core already has 101 defaults from destructuring.

**The thirteen unexported types are exported.** `Present`, `Absent`, `Pin`, `ToolbarSize`, `FormatFor`, `FilterFor`, `GroupFor`, `FooterFor`, `AggregateFor`, `Presentation` from the table, `TextTracking`, `TextLeading`, `Align` from core — whatever the reader lists when it checks references against the entry's exports. Each package's changelog records the additions as new public types. `props-table-hygiene` adds the gate that keeps it so.

**One table model, two writers.** The reader's output stays the generated data it is today, extended by the expansion, the references, the deprecation, the parameter constraints and the definitions. A pure function turns one type entry into a table model (heading with anchor, rows of segmented cells, badges, closing sentences). One writer turns the model into HTML, one into Markdown. The prerendered page, the page the app shows and the llms text all take their API section from these two writers: the app mounts the generated HTML for the API section instead of drawing its own table, and the React table component that drew it is removed. Links in the generated HTML are ordinary addresses; the shell handles them like every other in-site link. Required props read "required" as a small label in both writers.

**The llms appendix.** Until the API index (`api-index`) replaces it, "The rest of the API" prints every export of the entry that has neither a props table nor a definition block in the text. The rule "named somewhere in code" is removed.

**What the reader's header comment says afterwards.** "The type stands as it was written, and beside it what it resolves to and where it is defined." The old sentence about `"primary" | "secondary" | …` being what a reader needs is now true.

## Testing Decisions

A good test here states what a reader sees for a given source and never how the reader finds it: given this fixture type, the row's type text is X, its expansion is Y, its link targets are Z.

- **Reader fixtures** (the existing tooling unit tests of the props reader, against the fixture package): an alias that resolves over two hops to a literal union keeps its name and carries the values; an alias to an interface carries no expansion and one reference; an inline literal union carries no expansion; an arm with `member?: never` merges to the real type with both descriptions; a member `never` in every arm is absent; an inherited member's parameter is substituted; a constraint and a default appear in the parameter list; a free type parameter is reported; `@deprecated` and `@default` are read; a conflicting `@default` stops the generator with file and line.
- **Writer parity** (new cases beside the llms tests): for a fixture entry with a deprecated row, a default, an expansion, a link and a closing sentence, the HTML and the Markdown contain the same rows in the same order with the same type text, defaults, badges and link targets.
- **Definition block** (llms tests against the fixture package): a page mentioning a table-less type gets a block with that type; the closure includes a type mentioned only inside a definition and stops at a type with a table; a type with a table on another page is a link, not a definition.
- **Built-site guard** (the guard the pages build already runs over the built site): every `#type-` link on every page resolves to an element with that id on the target page; no type cell contains the text `never` that came from a merge (checked as: no row of the generated data has a type equal to or starting with `never |`); every library type referenced in a type cell has a target.
- **Appendix** (llms tests): an export named in a table cell but with no table and no definition still appears in the appendix with its declaration.
- **Screenshot baselines**: the page-head and example pictures do not show the API section and stay; no new baseline is added for the tables — their content is held by the guard and the fixtures, not by pixels.

Prior art: the props reader fixture suite (16 cases), the llms and llms-guard tests, the built-site guard of the search-visibility work.

## Out of Scope

- Hover popovers over linked types and breaking unions of more than two members onto lines — `a11y-and-finish`.
- Anchors per prop and links from rows to the examples that show them — `props-to-examples`.
- Grouping of rows, the Events split everywhere, internal IDs in prose, and the gate's new error classes — `props-table-hygiene`.
- Pages or index entries for hooks and functions — `api-index`. This spec defines types only.
- A `@since` column (argued above).
- Documenting `@param` tags of callback props as a separate list; a callback's signature stays in its type cell.

## Further Notes

Siblings: `props-to-examples`, `api-index`, `props-table-hygiene`, `configurator` and the type items of `a11y-and-finish` all build on the resolved types and the one table model delivered here; this is the first spec of the reference work.

Motivating numbers (build of `main` @ 3b2fa14): 810 props in 134 tables; 150 props (19 %) with an undefined library type; about 110 such types, 26 of them literal unions behind 48 prop mentions; `Accessor<T>` behind 18 chart props; Default column 13 % (104); at least 63 prose defaults; two lost `@deprecated`; thirteen named types not exported.

Acceptance:
- [ ] `ButtonSize` shows `"sm" | "md"` beneath its name on the Button page.
- [ ] No props row anywhere has a type that came out of a merge as `never` or `never | …`.
- [ ] No member of any table names a type parameter its header does not introduce; every header shows its constraints.
- [ ] Zero props name a library type that has neither a table nor a definition reachable from the page.
- [ ] The Default column is filled for at least 90 % of the props that today state a default in prose, and every one of those descriptions no longer repeats it.
- [ ] Both `@deprecated` props show the badge and the sentence and stand last.
- [ ] The thirteen types are exported and in their packages' changelogs.
- [ ] The app's API section and the prerendered page's are the same HTML; the Markdown writer passes the parity test.
- [ ] Every type among `ButtonSize`, `Accessor`, `TableRef`, `Wording`, `Intent` is defined in the llms text, in a definition block or in the appendix, and the appendix holds `applyIntent`, `useTree`, `useToast` and `controlLimits` with their declarations.
