# 02: API indexes for all five packages, subpaths included; the appendix goes

Status: done
Blocked by: 01 (The API index of calculation, end to end)
Spec: `.scratch/api-index/spec.md`

**What to build:** `/core/api/`, `/charts/api/`, `/table/api/`, `/schedule/api/` join calculation's. Subpath entries of each package's exports map are listed in a group per subpath, named by its import path. A function or hook named in a page's prose or import line links to its index anchor. A constant that is a wording or format directory carries a sentence linking to the Language page. The llms appendix "The rest of the API" and its filter are removed; the llms guard stays green through the index.

- [x] All five indexes exist, prerendered, in the sitemap, last in their sidebars.
- [x] All 16 hooks and 91 functions stand on their package's index with their declaration.
- [x] A subpath export (e.g. the German wording) is grouped under its import path; fixture test covers it.
- [x] Built-site guard: every name of every entry and subpath has an anchor on its index; the build fails on one missing.
- [x] The appendix no longer exists in `llms-full`, and the llms completeness guard is green.

## Comments

**Delivered.** Core, charts, table and schedule append `apiIndexRubric(...)` and mount `api-index.json`; all five indexes are prerendered, in the sitemap and last in their sidebars (core 255 anchors, charts 126, table 124, schedule 53). Core's and the charts' `wording/de` stand in a group named by the import path. A hook or a function a page's text names as code becomes `` [`name`](#/api/name) `` (`linkApiNames` in `references.ts`, applied wherever ADR numbers are linked - outline texts, example and scenario leads, export comments - in the app and the generator alike); the span grammar reads a link around code (`Span.code`), and `Prose` and both writers render it. The app's import line links the same names (`ApiIndexModel.linked`, `.importLine code a` underlined as in a declaration); the prerendered import line is a fence and stays plain. A wording or format directory carries "Every entry, with its value, stands in ..." from the new `Page.values` (`apiIndexRubric(name, values)`): core's `DEFAULT_WORDING`/`GERMAN_WORDING` and `DEFAULT_FORMATS`/`GERMAN_FORMATS` lead to the Language page's tables, the charts' two wordings to core's Language page. "The rest of the API" and its filter are gone from `renderLlms`.

**What the generator newly met** (every value's signature is now defined in all five packages):
- core: two types named `Side` (limit's, public; the popover's, private). The by-name map now prefers what an entry exports (`propsReader.ts`).
- table: its signatures named eleven unimportable types. They are exported as types at the end of `src/index.ts`, with comments; the model's `Column` is renamed `ModelColumn` (internal name only), since ADR-0017 forbids a free `Column`. CHANGELOG says so.
- core `VirtualOptions.overscan`, charts `AxisConfig.grid`, `ParetoOptions.remainderName`, `MaterializedSeries`, schedule `ResolvedAppearance`: a default or a requirement number or a source path in prose moved into `@default`/`@remarks` or out.

**Tests.** `llms.test.ts`: the fixture has a subpath `wording/de` (`GERMAN_GAUGE_WORDING`), grouped last under `@umriss-ui/fixture/wording/de` with its own section id; its values sentence links the table; a page sentence naming `fraction` links it in the text, the prerendered page and the twin, and an existing link stays; no appendix with or without an index. `references.test.ts`: `linkApiNames` and the code link. `llmsGuard.test.ts`: every name of every entry has its anchor on its index (no longer conditional), and `useTree`, `useToast`, `controlLimits`, `useTable`, `applyIntent` stand there with their declaration (replaces the `KNOWN.appendix` checks). Demo smoke tests of the four packages: the index renders every anchor; "no written page without an example"; core's Toast page links `useToast` in its import line. Shell probes: `GERMAN_WORDING`, `GERMAN_CHARTS_WORDING`, `useTable`, `applyIntent`.

**Results.** lint, typecheck, `pnpm test:unit` green; `pnpm build:pages` passes its guard (153 addresses, five `/api/` in the sitemap). Playwright light shell, page, own-base and silent-pages for core, charts, table, schedule: 560 passed, 16 skipped.

**Baselines moved** (the links' underline, which the ticket asks for): `page-findings` schedule light and dark, `example-language--own-components` ui-dark. Every other linked head or lead stays within the tolerance. Failing on `main` already and not moved here: charts' Installation page head and its two examples, the charts scenario (language-switch's header and text), core's token table's first group.

**Deviations.** The screenshot suites and own-base skip `api`, as calculation's do. The prerendered import line carries no links (a fence); the app's does.

