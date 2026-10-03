# 04: The wording tables on the Language page

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/theming-and-wording-reference/spec.md`

**What to build:** On core's Language page, after the examples and before the API section, three tables — "Wording", "Charts wording" (with the sentence that it goes into `Chart`'s `wording` prop and its German into the charts' German subpath) and "Formats" — with columns Key, English, German, Description, grouped by the interfaces' section comments. A function entry shows its parameters and its template body as code; nested entries are flattened with dots; a missing comment reads "—". Rows are anchored at `#wording-<key>`, `#charts-wording-<key>`, `#format-<key>`. HTML and Markdown from one model, prerendered, mounted, in `llms-full`.

- [ ] Wording reader fixtures: string entry, function entry with parameters and body, nested entry flattened, group from a section comment, entry without a comment.
- [ ] Built-site guard: the Language page has an anchor for every key of the three directories, counted against the source.
- [ ] The tables are in `llms-full`.
- [ ] The German column shows the same text `GERMAN_WORDING` and the charts' German wording carry.

## Comments

Delivered: the Language page has three sections after its examples: "Wording" (295 rows in 12 groups), "Charts wording" (26) and "Formats" (12). Their columns are Key, English, German and Description. Each row is anchored at `#wording-<key>`, `#charts-wording-<key>` or `#format-<key>`, with dots kept (`#wording-presets.today`).

- Reader: `packages/demo/src/tooling/wordingTable.ts`. It works through the TypeScript parser. `readEntries` reads an interface for its keys, order, section-comment groups, JSDoc and a function's parameter names. `readTexts` reads an object literal: a string as its text, a function body or any other value as written, in code. `wordingTable` builds the table model.
- Model and writers: `packages/demo/src/tooling/referenceTable.ts`. It is a generic sibling of `apiTable.ts` and reuses that file's span writers (`spansHtml`, `spansMarkdown`, `markdownCell`, `markdownCode`, now exported). There is one model, an HTML writer and a Markdown writer.
- Mounting and llms: `LlmsJob.references` (page id → tables). `llms.ts` writes `#### <title>` plus the Markdown body into llms-full, and splices the HTML into the prerendered page the way the API section is spliced; the splice is now a list. `generateLlms` writes `demo/.generated/references.json` and returns the site's pages. `Page.tsx` mounts each table in a `Section` between the examples and "When to use something else".
- Core: `packages/core/demo/tooling/languageTables.ts`. It reads core's and the charts' wording files. The formats have no texts to read, since both sets are `formatsFor(locale)`, so their columns show what each set writes for one sample per key. The samples are typed `Record<keyof Formats, …>`, so a new format without one is a compile error. The locale is read from the source and the sets are built under Europe/Berlin.
- Guard: `missingAnchors` counts keys from the running `DEFAULT_WORDING`, `DEFAULT_CHARTS_WORDING` and `DEFAULT_FORMATS`, independently of the reader. `demo/props.ts` exits 1 when the prerendered Language page lacks a row, so `dev`, `build:demo` and `typecheck` stop.

Tests: `packages/demo/tests-unit/wordingTable.test.ts` covers a string entry, a function entry with its parameters and body, a nested entry flattened (with the parent's comment as fallback), a group from a section comment, an entry without a comment ("—"), a missing text throwing, and HTML/Markdown parity with row anchors. `packages/core/tests-unit/languageTables.test.ts` checks the German column against `GERMAN_WORDING` and `GERMAN_CHARTS_WORDING` (every string entry), the German formats, and that the guard names a removed row. lint and typecheck are green. test:unit is green; the table's demo smoke test timed out under machine load (load average 60–80) and passed in full with `--testTimeout=60000`. Playwright (narrowed rule): features-shell and features-page in ui-light and table-light, 60 passed. Beforehand, axe on the Language page passed in ui-light and ui-dark; I added it to `SAMPLE` for that run only and took it out again.

Baselines moved: none. The tables stand below the examples, outside every picture.

Deviations: Formats shows sample outputs, not function bodies (see above). In the parameterised entries the interface's parameter names stand in the key and the object's body stands as written, so `asOfAgo(duration)` shows `` `As of: ${dauer}` ``. The guard runs in the generation step and checks the prerendered page HTML that `build-pages.mjs` writes, rather than running inside `build-pages.mjs`. A nested entry without its own JSDoc shows its parent's comment.
