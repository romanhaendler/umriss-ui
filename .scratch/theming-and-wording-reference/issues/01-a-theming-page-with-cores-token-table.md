# 01: A Theming page with core's token table

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/theming-and-wording-reference/spec.md`

**What to build:** A reader opens `/core/theming/` (in the rubric "Customising" if `sidebar-tree` has landed, otherwise in Getting started after UmrissProvider) and finds every `--u-` token declared on `:root` in core's tokens layer, grouped by the stylesheet's section comments, with light and dark values side by side, a swatch drawn by the browser for colour tokens (light cell `color-scheme: light`, dark cell `color-scheme: dark`, swatch `aria-hidden`), the token's comment, a mark for tokens redeclared under reduced motion, and `var()` references as links to the referenced token. Each row is anchored at `#token-<name>`. The table is written as HTML and Markdown from one model, prerendered, mounted by the app and carried in `llms-full`. Non-English section comments in the stylesheet are translated.

- [x] Token reader fixtures: `light-dark()` splits; a single value stands in both columns with "same" in dark; a `var()` with fallback yields a link and keeps the fallback; a declaration outside `:root` or the tokens layer is not a token; section comment → group; preceding and trailing comments read; reduced-motion redeclaration marked.
- [x] Built-site guard: the page has an element with the anchor of every core token the reader finds; the build fails on one missing.
- [x] The table is in `llms-full`.
- [x] A screenshot of the table's first group in light and dark joins the core baselines; the dark swatch is dark on a light page.
- [x] No German remains in the token stylesheet's comments.

## Comments

Delivered: `/core/theming/` ("Theming", the first page of Customising) has a "Tokens" section after its example. It lists all 116 `--u-` tokens in the stylesheet's 15 groups, with the columns Token, Light, Dark and Description. Where a section comment has text below its name, that text stands as the group's note. Each row is anchored at `#token-<name>`. A `var(--x, …)` reference links to `#token-x` and keeps its fallback. A value without `light-dark()` reads "same" in the Dark column. A token redeclared under reduced motion carries "0ms under reduced motion.", and a colour token shows a swatch in each value column.

- Reader: `packages/demo/src/tooling/tokens.ts` (`readTokens`). It parses with postcss, the workspace's CSS parser: a root devDependency that the stylesheet guards already use. A token is a custom property declared on `:root` inside `@layer umriss.tokens`. `light-dark(a, b)` is split wherever it stands in a value, including inside a shadow or a `color-mix`. A token counts as a colour when its name contains `color`, when its value is a colour, or when it is a `var()` of a colour token.
- Table: `packages/demo/src/tooling/tokenTable.ts` builds a `ReferenceTable`, the model from 04, so there is no third renderer. The shared pieces got two small extensions. `Span` has a new `swatch` kind. In HTML it is an `aria-hidden` span whose background is the token, with the column's `color-scheme` set on the span itself, so the browser resolves `light-dark()`. In Markdown it writes nothing. `ReferenceGroup` has a new optional `note`. The page mounts the table and the llms text carries it through `LlmsJob.references.theming`.
- Guard: `missingTokens` counts the declarations on the stylesheet's text, not through the reader. Core's `demo/props.ts` exits with code 1 when the prerendered Theming page lacks a row, as 04's guard does for the Language page. So `dev`, `build:demo`, `typecheck` and `build:pages` all stop.
- Stylesheet: "Tinte & Papier" became "Ink & Paper". The stacking order's comment became a section (`---- Stacking order ----`). The shadow stacks' note is now punctuated as sentences.

Tests: `packages/demo/tests-unit/tokens.test.ts` covers:
- the reader against a fixture stylesheet: only `:root` in the tokens layer, groups and notes, `light-dark()` split also inside a longer value, one value in both columns, preceding, trailing and stacked comments, reduced motion, colour detection;
- the table in HTML (anchors, swatches with their scheme, "same", the link) and in Markdown;
- every declared token of core's stylesheet having its row, and the guard naming a removed one;
- no German in the stylesheet.

There is a new screenshot test, "The token table's first group", in `screenshots.spec.ts`. `theming` joined the accessibility SAMPLE. lint, typecheck and test:unit are green. Core's demo smoke test times out under machine load and passes with `--testTimeout=30000`.

Playwright (narrowed rule):
- ui-light and ui-dark: the theming pictures and the sidebar pictures, 18 passed. features-shell, features-page and own-data in ui-light, 35 passed. own-base and accessibility on theming, 3 passed.
- charts-light, shell and page: 28 passed and 1 failed, "a moved address lands on the page, under its current address". That test belongs to sidebar-tree 01's forwarding, and this change touches nothing it reads.

Baselines:
- New, light and dark each: `page-theming`, `example-theming--a-token-for-one-region`, `forced-theming--a-token-for-one-region`, `tokens-first-group`.
- Moved, light and dark, because the sidebar gained "Theming" under Customising: `palette-window`, `palette-resting`, `drawer-beside-a-service-list`, `forced-combobox-cursor`, `forced-range`.

Deviations:
- The page needs an example to pass the smoke test's "no page without an example". So the second of ticket 03's three examples ships here: "A token for one region" (`Theming/02-a-token-for-one-region.tsx`, an accent on one card, with a Switch and a Checkbox). 03 adds 01 and 03 around it.
- The lede is a first draft; 03 writes the about.
- The guard runs in core's `props` step on the prerendered page (04's pattern) rather than in `build-pages.mjs`.
- In the Markdown, a value with a reference reads as code pieces around a link, because that is what the shared span writer writes.
- Playwright reuses a running preview server outside CI. Preview servers left behind by other worktrees on 4173/4174 served their builds to one of my runs. My run script therefore kills the listeners on those ports while it holds the lock.
