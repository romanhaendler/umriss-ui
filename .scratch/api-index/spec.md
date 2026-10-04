# Spec: The API index — every export has a place on the site

Status: done

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/demo-as-documentation/spec.md` (one page per component; the decision that hooks and lib modules get no pages, which this spec overturns in part), `.scratch/ai-readable-docs/spec.md` (the declarations the llms appendix already emits, and the guard that every export appears in the text), `.scratch/types-without-holes/spec.md` (the definition format and the `#type-<Name>` anchors).
Blocked by: types-without-holes
ADR: ADR-0044 — Every export has a place on the site.
Tickets: `issues/01`–`05`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

A developer who needs a hook or a function cannot read its signature anywhere on the site. Of 16 hooks and 91 functions the five packages export, not one has its parameters and its return value on a page. `useToast` is used in an example on the Toast page; what it returns is learned from the example or the source. The schedule's whole editing model runs through `applyIntent`, `ripple`, `findings` and `snapTime` — thirteen functions, all named on its pages, none defined. The charts' `controlLimits`, `pareto` and `workingCalendar` are central to their pages and absent as signatures. Six hooks of core are not even named (`useVirtual`, `useLanguage`, `useUmriss`, `useDensity`, `usePortalTarget`, `useToastConfig`), nor are seventeen of its functions.

This was a decision, not an oversight: `demo-as-documentation` gave hooks and lib modules no pages because "they are a second piece of documentation with a different shape, and inventing that shape here would be the fourth thing this spec tries to do at once". The shape now exists. The llms text already emits every export's declaration, JSDoc included, for its appendix — but only for agents, and only for what no page names. A person on the site has no index of what a package exports at all; the sidebar lists components, and everything else is invisible.

## Solution

Every package gets one generated page, the **API index**, at `/<package>/api/`, in a last rubric of its own, also called **API index**. It lists everything the package's entry and its subpaths export, grouped by kind and alphabetical within a kind:

- **Components** — the name and a link to the component's page; no copy of the props.
- **Hooks**, **Functions**, **Constants** — each with its signature as the package's `.d.ts` carries it, its JSDoc as prose, library types in it linked, and a line "Used on" linking the pages that use it.
- **Types** — a link to the type's props table where one exists; otherwise the type's definition in the same form as a definition block of `types-without-holes`.

Every export gets a JSDoc comment; the gate that already stops at a prop without one stops at an export without one. The llms appendix "The rest of the API" disappears, because the API index is a page and its text is in `llms-full` like every page's. Hand-written hook pages in the style of Mantine stay out: one generated page per package is the whole new shape.

## User Stories

1. As a developer using toasts, I want the signature of `useToast` with what it returns, so that I can call it without reading the source.
2. As a developer building a tree outside `TreeView`, I want `useTree`'s options and snapshot on the site, so that I can drive my own markup.
3. As a planner-application developer, I want `applyIntent`, `ripple`, `findings` and `snapTime` with their parameters, so that I can implement the schedule's editing seam correctly.
4. As a developer computing control limits, I want `controlLimits` with its input and output, so that I can feed a chart I build myself.
5. As a developer, I want one page per package that lists every export, so that I can see the whole surface at a glance.
6. As a developer, I want the exports grouped as components, hooks, functions, constants and types, so that I find a kind of thing where I expect it.
7. As a developer, I want alphabetical order within each group, so that the page works as an index.
8. As a developer, I want a component entry to link to its page instead of repeating its props, so that there is one place for the props.
9. As a developer, I want each signature in TypeScript syntax exactly as the published `.d.ts` has it, so that what I read is what my editor will show.
10. As a developer, I want the JSDoc of a function rendered as prose above its signature, so that I learn what it is for before how to call it.
11. As a developer, I want library types inside a signature to be links, so that I can follow `Intent` to its definition.
12. As a developer, I want a "Used on" line under an export, so that I can see it working on a page.
13. As a developer reading a component page, I want an export named in its prose or its import line to be reachable on the API index, so that every name has a definition somewhere.
14. As a developer, I want the subpath exports (`@umriss-ui/core/wording/de`, `@umriss-ui/charts/wording/de`) listed with their import path, so that I know they are not in the main entry.
15. As a developer, I want each entry to have a stable anchor, so that I can link a colleague to `/schedule/api/#applyIntent`.
16. As a developer, I want the API index as the last entry of every sidebar, so that I always find it in the same place.
17. As a developer on a phone, I want the signatures to scroll inside their code block, so that the page does not scroll sideways.
18. As a coding agent, I want the API index in `llms-full` like every page, so that every declaration reaches me through the same text.
19. As a coding agent, I want the API index as its own entry in `llms.txt`, so that I can fetch only it.
20. As a maintainer, I want the build to fail when an export has no JSDoc, so that the index never shows a bare signature.
21. As a maintainer, I want the index generated from the entry's exports, so that a new export appears without anyone editing an outline.
22. As a maintainer, I want the completeness guard to check that every export has an anchor on its package's API index, so that the guarantee is held on the site and not only in the llms text.
23. As a search user, I want every entry of the index to be a search target, so that typing `applyIntent` finds it (taken up by `one-search`).
24. As a reader without JavaScript or a crawler, I want the whole index in the prerendered HTML, so that nothing is hidden behind the app.
25. As a developer, I want a deprecated export marked like a deprecated prop, so that I recognise it in the index too.
26. As a developer, I want a constant shown with its type and not its value, so that a 288-entry object does not fill the page.
27. As a developer looking for `DEFAULT_WORDING`, I want its entry to link to the wording table on the Language page, so that I find the values where they are explained.

## Implementation Decisions

**One page per package, generated.** Its address is `/<package>/api/`, its name "API index", its lede "Everything `@umriss-ui/<package>` exports, with its signature. A component's props stand on its own page." It stands alone in the last rubric of the outline, named "API index" (`sidebar-tree` fixes the tree around it; if this spec lands first, the rubric is appended as the last one). The outline gains a way to declare a page whose body is generated rather than written; the shell renders that body from generated data and gives it the page head, the import line omitted.

**The source of truth is the package's entry, plus its subpaths.** The existing code that emits every export's declaration for the llms appendix is extended to the subpath entries declared in the package's `exports` map and becomes the source of the index. Re-exports are listed under the exported name; an export of another package's name (none exist today) would be listed with its origin.

**Kinds, by what the export is, not by its name.** A value whose type the checker sees as a React component (a function component or a `forwardRef` result) is a Component; a function named `use` + capital letter is a Hook; any other function is a Function; any other value is a Constant; a type-only export is a Type. Order of groups: Components, Hooks, Functions, Constants, Types, then one group per subpath named by its import path. Within a group: alphabetical, case-insensitive.

**What an entry shows.**
- Component: name, link to its page, the page's lede. If a component has no page (`ModalBody`, `MenuSeparator`, `TabList`, `ToastProvider`, `LanguageProvider`, the glyphs), it is shown with its declaration and JSDoc like a function, and "Used on" links.
- Hook, Function, Constant: name as heading, JSDoc as prose, then the declaration as emitted for a `.d.ts` as TypeScript code with library type names linked by the reference rules of `types-without-holes`. Overloads stand together. A Constant shows its declared type; where the constant is a wording or format directory, a sentence links to the table on the Language page (`theming-and-wording-reference`).
- Type: if a props table of the package defines it, a link to that table and nothing else. Otherwise its definition exactly as a definition block of `types-without-holes` renders it — same writer, so a type defined on a component page and on the index reads the same.
- Every entry: "Used on" — the pages whose import line, examples, scenarios or prose name it in code, by the same code-mention test the llms guard uses. Omitted when empty.
- A `@deprecated` export carries the same badge as a deprecated prop.

**Anchors.** Values (components, hooks, functions, constants) at `#<name>`; types at `#type-<Name>`, the scheme `types-without-holes` set. Links from type cells and definition blocks to a type without a table may now point at the API index of its package; they keep pointing at the page's own definition block, because that keeps a reader on the page. Links from a function or hook named in a page's prose or import line go to its API index anchor.

**Every export carries JSDoc, and the gate says so.** The gate that stops at a prop without a comment also stops at an export of the entry or a subpath without one, listing all of them with file and line in one run. This spec writes the missing comments. For a hook or function the comment says what it is for and, where a parameter or the return value is not self-explanatory from its type, a `@param` or `@returns` line; those tags are rendered under the prose as a short list.

**The llms appendix goes.** The API index is a page of the outline; `llms-full` carries it like every page, and the completeness guard (every export appears in the text) is satisfied by it. "The rest of the API" and the rule that filtered it are removed.

**What is overturned.** `demo-as-documentation`, "Hooks and lib modules do not get pages", is replaced by ADR-0044: every name a package exports has exactly one canonical place on the site — its component page, a props table, or its entry on the API index — and the API index is generated, never written by hand. Hand-written hook pages remain not built; a hook whose use needs explaining is explained on the component page that uses it, as today.

**Size.** core has about 250 exports, charts 125, table 94, schedule 53, calculation 22. The core page will be long; the on-this-page navigation of `page-orientation` lists its groups, and search (`one-search`) reaches every entry.

## Testing Decisions

A good test states which exports appear where and what an entry shows, not how kinds are detected.

- **llms tests against the fixture package** (the existing fixture with exports and pages): the index page lists a fixture hook, function, constant and type in the right groups and order; a type with a table becomes a link; a type without one becomes a definition; a component without a page gets its declaration; "Used on" names exactly the pages that mention the export in code; a subpath export is grouped under its import path; the appendix no longer exists.
- **Gate test** (beside the existing gate behaviour): a fixture export without JSDoc stops the generator and is listed with file and line.
- **Built-site guard** (the guard of the pages build): for every package, every name of its entry and subpaths has an element with its anchor on `/<package>/api/`; the API index is in the sitemap and has a title, description, canonical and `h1` like every page.
- **llms guard** (existing): every export appears in `llms-full` — now through the index; the test's expectation does not change, its mechanism does.
- **Shell suite**: the sidebar's last entry in every demo is "API index", and it opens the page.
- No screenshot of the index: its content is text held by the guards.

Prior art: the llms tests and the llms guard, the built-site guard of the search-visibility work, the shell suite's per-demo call.

## Out of Scope

- Hand-written pages for individual hooks or lib modules.
- A separate page per export, TypeDoc-style.
- Showing the values of constants.
- An index of CSS tokens or wording keys — `theming-and-wording-reference`.
- Search over the index — `one-search` indexes it.
- An MCP server; the report's decision stands: one Markdown file per page first (`pages-as-markdown`), a server when users ask.

## Further Notes

Siblings: `types-without-holes` (definition format, anchors, reference rules), `theming-and-wording-reference` (the wording and token tables the constants link to), `one-search` (indexes every entry), `sidebar-tree` (the place of the rubric), `pages-as-markdown` (the index gets its `.md` twin like every page).

Motivating numbers (build of `main` @ 3b2fa14): 16 hooks and 91 functions with no signature on the site; core alone exports 80 components, 14 hooks, 27 functions, 7 constants and 124 types; the llms appendix omitted exactly the names pages mention — `applyIntent`, `useTree`, `useToast`, `controlLimits` among them.

ADR-0044 to write with this spec: "Every export has a place on the site". Context: the hooks exclusion of `demo-as-documentation` and its reason (effort); the emit that now exists. Decision: one generated API index per package; every export carries JSDoc; the appendix goes. Consequences: a new export is documented the moment it carries a comment; the gate grows by one class.

Acceptance:
- [ ] `/core/api/`, `/charts/api/`, `/table/api/`, `/schedule/api/`, `/calculation/api/` exist, prerendered, in the sitemap, last in their sidebars.
- [ ] All 16 hooks and 91 functions stand on their package's index with signature and JSDoc.
- [ ] Every export of every entry and subpath has an anchor on its index; the guard fails on one missing.
- [ ] The gate fails on an export without JSDoc; no export lacks one.
- [ ] The llms appendix is gone and the llms guard is still green.

## Comments

Delivered on `main` on 4 Oct 2026: every ticket under `issues/` is `Status: done` and carries its own delivery report. The whole effort was checked once more on `main` afterwards — lint, typecheck, unit and the full visual suite green.
