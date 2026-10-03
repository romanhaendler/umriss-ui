# 02: The own package's search fragment: pages, scenarios and examples with ledes, ranked by kind

Status: ready-for-agent
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

- [ ] The fixture package's fragment holds one entry per page, scenario and example, with the addresses the pages carry (tooling unit test).
- [ ] Under `pnpm dev:core`, "snackbar" finds Toast and "chip" finds Tag. Under `pnpm dev:table`, "frozen" finds Width and pinning.
- [ ] Typing a component's name shows that component's page first, above its examples.
- [ ] A find in the own package jumps in place with the highlight, as today.
- [ ] `⌘K`, `Ctrl+K` and `/` open the palette; the existing palette tests in the shell suite stay green.
