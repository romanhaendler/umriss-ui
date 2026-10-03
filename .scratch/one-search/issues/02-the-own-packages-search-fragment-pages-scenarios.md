# 02: The own package's search fragment: pages, scenarios and examples with ledes, ranked by kind

Status: done
Blocked by: 01 (Keywords on a CommandPalette candidate)
Spec: `.scratch/one-search/spec.md`

**What to build:** The generator run that writes a demo's generated pages also writes its search fragment. It holds one entry per page, scenario and example, with address, label, group (`<package> · <rubric or page>`), kind, and keywords (a page's lede, an example's lead).

The shell loads the fragment lazily on the palette's first opening. Until it arrives, the palette shows today's candidates.

**Ranking:**
- By tier: name, then group, then keyword.
- Within a tier, by kind: page, scenario, example, export, prop, token, wording.
- A small tie-break goes to the own package.

The palette's words become "Search pages, examples, props, tokens …", "Search umriss-ui", "Jump anywhere in umriss-ui" and "Found".

The one-time synonym pass adds the spec's list of other libraries' names to the ledes within the "synonyms once" rule: snackbar, dialog, chip, frozen, Gantt and the rest.

- [x] The fixture package's fragment holds one entry per page, scenario and example, with the addresses the pages carry (tooling unit test).
- [x] Under `pnpm dev:core`, "snackbar" finds Toast and "chip" finds Tag. Under `pnpm dev:table`, "frozen" finds Width and pinning.
- [x] Typing a component's name shows that component's page first, above its examples.
- [x] A find in the own package jumps in place with the highlight, as today.
- [x] `⌘K`, `Ctrl+K` and `/` open the palette; the existing palette tests in the shell suite stay green.

## Comments

**Delivered.** `packages/demo/src/search.ts` holds the entry shape (`address`,
`label`, `group`, `kind`, `keywords?`) and `searchEntries`, which the generator
(`renderLlms`) and the shell share. Each demo's `props` run writes
`demo/.generated/search.json`: the front page, every scenario, every page
(its lede as plain text in keywords) and every example (its lead). Addresses
are site-relative and carry the package's directory (`/core/toast/`,
`/core/#resolve-an-incident`); groups are `<package> · <rubric or page>`.
The five `demo/examples.ts` pass `search: () => import("./.generated/search.json")`.
In the build it is a chunk of its own (`assets/search-*.js`); the dev server
serves it too.

**Shell.** The fragment is fetched on the palette's first opening and kept.
Until it arrives, or if it fails, the same entries come from the outline in
hand. Kind weights (`KIND_WEIGHT`, 10,000 apart) put a page above a
scenario, example, export, prop, token and wording key within each matcher
tier. `OWN_PACKAGE_WEIGHT` (0.25) breaks only exact ties. An own address
jumps in place through `placeOfLocation`/`fromPlace`. Any other address
gets a full navigation beside the demo's base, ready for 03. The palette's
words are the spec's four.

**Synonym pass.** Seven ledes gained a word: Drawer (side panel), Popover
(popup), Accordion (disclosure), Splitter (resizable panes, was "panels"),
Combobox (typeahead), Width and pinning (frozen or sticky columns),
Calculation (KPI tree). The rest of the spec's list was already in its
lede.

**Tests.** `packages/demo/tests-unit/search.test.ts` checks the fixture's
fragment: one entry per page, scenario and example, every address on a
prerendered page and an anchor it carries, ledes and leads as plain text.
The shell suite has two new probes. "A component's name finds its page
first, above its examples" runs in all five demos. "Another library's word
finds the page" runs for snackbar → Toast and chip → Tag in core, and
frozen → Width and pinning in table. Under `features-shell` the five light
projects are green (174 passed). So are core and table `features-page` in
`ui-light` and `table-light`.

**Probes changed.** Pages now rank above examples, so the pointer test's
fourth row survived the narrow query. Core now uses `se`/`sel`, which drops
`Slider`. Table now uses `ta`/`tag`, because every table group begins with
"table ·" and "tab" finds everything through the group. The field name in
the probes and in core's palette screenshot is "Search umriss-ui".

**Baselines.** `palette-window-ui-{light,dark}` moved. The groups now read
"core · Dates and times", and the front page behind the window has its newer
"On this page" row.
Not moved: `palette-resting-*`, `drawer-beside-a-service-list-*`,
`forced-combobox-cursor-*` and `forced-range-*` already fail on `main`. They
show the sidebar from before sidebar-tree's rubrics. The drawer and combobox
pictures will also pick up their new ledes when someone rebuilds them.

**Deviations.** The header's search button still reads "Search …". The
spec has it follow the placeholder, but the header belongs to
shell-across-packages 02, and changing it would move every picture with a
header. Core's changelog is unchanged: nothing a caller of a package sees
changed.
