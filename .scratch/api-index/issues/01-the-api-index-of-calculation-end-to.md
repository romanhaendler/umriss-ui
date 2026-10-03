# 01: The API index of calculation, end to end

Status: done
Blocked by: `types-without-holes` 05 (Every library type in a type cell is a link, and "Types on this page" defines the rest)
Spec: `.scratch/api-index/spec.md`

**What to build:** A reader opens `/calculation/api/`, the last entry of the sidebar, alone in a final rubric "API index", and finds every export of the package's entry with its signature. The outline gains a kind of page whose body is generated; the shell renders it with the page head and without the import line. Entries are grouped Components, Hooks, Functions, Constants, Types (by what the export is), alphabetical within a group. A component links to its page with the page's lede, or shows its declaration when it has no page; a hook, function or constant shows its JSDoc (with `@param`/`@returns` as a short list) and its emitted declaration with library type names linked; a type links to its props table or shows its definition with the writer of the definition block; every entry lists "Used on" pages; deprecated exports carry the badge. Values are anchored at `#<name>`, types at `#type-<Name>`. The page is prerendered, in the sitemap, and in `llms-full`. ADR-0044 is written.

- [x] `/calculation/api/` exists, prerendered, in the sitemap, with title, description, canonical and `h1`, last in the sidebar.
- [x] llms fixture tests: a hook, function, constant and type land in the right groups and order; a type with a table is a link; a type without one is a definition; a component without a page shows its declaration; "Used on" names exactly the pages that mention the export in code.
- [x] Built-site guard: every name of calculation's entry has an element with its anchor on the index.
- [x] Shell suite: the sidebar's last entry is "API index" and opens the page.
- [x] ADR-0044 "Every export has a place on the site" is in the ADR directory and its index.

## Comments

**Delivered.** The outline has a page kind whose body is generated: `Page.body: "api-index"`, and `apiIndexRubric(packageName)` in `packages/demo/src/outline.ts` returns the last rubric "API index" with its one page `api` (`/api/`), types and exports empty. Calculation's outline appends it. `exportDocs.ts` now holds what a package exports: `entriesOf` is exported and returns `{ file, subpath? }` (an object key is the subpath, `index` the main entry), `compilerOptionsOf` moved here from `props.ts`, and `exportedDeclarations` moved here from `llms.ts`. It reads every entry, subpaths included, and adds per export its kind, the declaration without its JSDoc, the comment, `@param`, `@returns`, `@deprecated` and the type names the declaration uses. The kind comes from the checker: `$$typeof`, or every call signature taking one object (or nothing) and returning an element or `null`, makes a component. A function named `use` + a capital is a hook, any other callable a function, any other value a constant, a type-only symbol a type. The result is cached per package for one run. `readPackage` seeds `readProps` (new `alsoDefine`) with every exported type and every type a value's declaration names, but only where the outline has an index. So a table-less exported type gets a definition. The model and both writers are in `tooling/apiIndex.ts`:
- groups Components, Hooks, Functions, Constants, Types, then one group per subpath. Each is alphabetical, case aside.
- a component's page is the one named after it (with that page's lede), else the page with its `<Name>Props` table (with the component's own comment). With neither it is shown like a function.
- a value shows its comment, its tags as a list and its declaration, the library's types in it linked.
- a type links to its table, or is defined through `definitionModel`, which is now shared with `apiSection`.
- "Used on" lists the pages whose cut of the full text names the export in code, their spliced API and reference tables excluded, plus Scenarios. It uses the same code test as `missingFrom`.
- a deprecated export gets the badge. Anchors are `#<name>` and `#type-<Name>`.

`renderLlms` writes the index into the page's cut after every other page and splices its HTML into the prerendered page. It returns the model, which `generateLlms` writes to `demo/.generated/api-index.json`. The app mounts it through `Demo.apiIndex`: `Page.tsx` gives the page its head without an import line, the HTML in `div.apiIndex` (`display: contents`, so each group is a section of the page), "On this page" with the groups, and the page turn. Where an index exists, the appendix "The rest of the API" is left out; elsewhere it lists main-entry exports only, as before. `build-pages.mjs` runs `apiIndexFaults`: every anchor of `api-index.json` has an element on `<home>api/`. ADR-0044 is written and listed in `docs/adr/README.md`. Also updated: `CONTEXT.md` (**API index**), `docs/testing.md`, and calculation's CHANGELOG (Unreleased).

**Tests.**
- `llms.test.ts`, new describe on the fixture, which gained a hook with tags, a page-less component, a table-less type, a deprecated constant and a `vite.config.ts`. It checks groups and order, a component linked with its lede and the page-less one with its declaration, the hook's list and linked type, a type with a table linked and the one without defined, "Used on" exactly Scenarios and Gauge (and not `GaugeProps`, which only its table names), the deprecated badge, every anchor in the prerendered HTML, the `llms.txt` entry, the twin's absolute links, and no appendix.
- `site.test.ts` covers `apiIndexFaults`.
- `llmsGuard.test.ts`: every name of calculation's entries, read by the compiler independently, has its id on the prerendered index. The component check no longer counts the index as a page.
- calculation `demo-smoke`: the index page renders every anchor. "No page without an example" now applies to written pages only.
- Shell suite: new optional probe `apiIndex`; calculation passes `type-MetricValues`.

**Results.**
- `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` are green.
- `pnpm build:pages` passes its guard: 141 addresses, `/calculation/api/` in the sitemap with its twin and canonical.
- Playwright calculation-light shell and page: 43 passed, 1 skipped (`moved`, which has no probe here).
- calculation accessibility for the api page, light and dark: 2 passed.
- ui-light shell and page: 55 passed, 1 failed. The failure is "The Button's configurator … Reset", a background read mid-change. The same case then passed 3 of 3 repeats (18 passed) and does not touch what changed.

**Baselines moved:** none. The calculation screenshot suite skips the api page, as the spec says ("No screenshot of the index").

**Deviations.**
1. A component whose page is found through its props table (`Ref` → Tree) shows its own comment, not the Tree's lede, which describes another thing.
2. Declarations wrap rather than scroll (`.apiDeclaration` as before, for its stated reason). The page still never scrolls sideways.
3. A type a declaration names that is neither tabled nor declared in the package (a neighbour's type named only by a value's signature) stays text. None occurs in calculation.
4. Subpath groups and the `exportedDeclarations` subpath reading are built; their fixture test is ticket 02's.
5. The page title follows the shared formula: "API index – React calculation · @umriss-ui/calculation".

**For ticket 02:** append `apiIndexRubric(...)` to the other four outlines, and import `./.generated/api-index.json` in their `demo/examples.ts`. Pass `apiIndex` to `checkShell`, and exclude `api` from their screenshots and own-base page lists. Then delete the appendix branch in `renderLlms` and the `KNOWN.appendix` checks.
