# 01: Pages can say their keys and their accessibility

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** The outline's page gains `accessibility` (up to three short paragraphs: role and name, what it announces and when, what the caller must supply, forced colours and reduced motion) and `keysOf` (pages of this demo, or a neighbour's page in the `builtFrom` form, whose keys apply here). `keysOf` is validated at load time exactly as `builtFrom` is. The Keyboard section shows the page's own table and under it "The keys of [Chart] apply here." linking each page's Keyboard anchor; a new Accessibility section stands after Keyboard and before API. Both reach the demo, the prerendered page, the llms text and the twin through the same full text. Proved on the Chart page (Accessibility) and the Line page (`keysOf: ["chart"]`).

- [x] An unknown `keysOf` id fails at load time with its file and id (shell tooling tests)
- [x] A fixture page with `accessibility` and `keysOf` renders both sections in the full text
- [x] The Line page links the Chart page's Keyboard anchor; the Chart page shows an Accessibility section, in the demo and the prerendered page

## Comments

Delivered.

- `Page` (`packages/demo/src/outline.ts`) gains `keysOf` and `accessibility`. `ForeignPage` and `isForeign` moved there from `tooling/examples.ts` (which re-exports the type), so `addresses()` checks `keysOf` the way `readScenarios` checks `builtFrom`. A bad entry fails with "`demo/outline.ts`: `<page>` takes the keys of `"<id>"` …". The file is named as `demo/outline.ts` because `addresses()` cannot know which package it is in. One addition: a local id must name a page that has a keyboard table (`keys`), because otherwise the link would lead to an anchor that does not exist.
- `keysOfText` in `outline.ts` writes the sentence "The keys of [Chart](#/chart/keyboard-chart) apply here." in the texts' format. A neighbour's page is linked through a function each medium passes in: `hrefOfNeighbour` in the app, the sibling directory under the homepage in the llms text.
- The Keyboard section stands where a page has `keys` or `keysOf` and shows the table, then the sentence. Accessibility follows it, before API. Both sections are listed in "On this page" (`Page.tsx`) and in the full text, so the twin gets them too. On the prerendered page the Keyboard and Accessibility headings carry the app's ids (`keyboard-<id>`, `accessibility-<id>`). `pageTexts` passes `accessibility` through the ADR linking and the gate.
- Charts: the Chart page has three Accessibility paragraphs (the role and name, the readout and the `DataTable`, forced colours and reduced motion). The Line page has `keysOf: ["chart"]`.
- Tests: `examples.test.ts` (unknown id, a page without keys, a malformed foreign page). `llms.test.ts` (both sections in the full text, a page that has only `keysOf`, a foreign link, anchors on the prerendered page, the twin). `llmsGuard.test.ts`: on all five demos, every local `keysOf` link and every Accessibility section is on the prerendered page. `charts/tests-unit/demo-smoke.jsdom.test.tsx`: Line links `/chart/#keyboard-chart`, and Chart puts Accessibility right after Keyboard in the app. `chart` was added to the charts axe `SAMPLE`.
- Runs: lint, typecheck and test:unit all green. Playwright under the lock, `ui-light` and `charts-light` × features-shell, features-page and accessibility: 115 passed.
- Baselines: none moved. The screenshots show only page heads and examples.
