# 02: The charts' tokens on the Theming page

Status: done
Blocked by: 01 (A Theming page with core's token table)
Spec: `.scratch/theming-and-wording-reference/spec.md`

**What to build:** Below core's groups, a section "@umriss-ui/charts" lists every `--uc-` token declared on the chart's root class, with the sentence that each falls back to the core token it names (linked). The tooling reads the charts stylesheet as a file; no demo imports charts' source. The charts' Installation page gains one sentence linking to the section.

- [x] Token reader fixture: a charts-style root-class declaration is read with its fallback token.
- [x] All 29 charts tokens have rows and anchors; the built-site guard counts them against the stylesheet.
- [x] The charts' Installation page links to the section.

## Comments

Delivered: the Theming page has a second reference section after "Tokens", "@umriss-ui/charts" (`#charts-tokens`). It lists the 29 `--uc-` tokens declared on `.uc-root`, each anchored at `#token-uc-<name>`, with the same columns as core's table. The lead sentence says that a token whose value names a core token takes that token, so theming core themes the charts, and that the literal after it applies where core is not loaded or has no such token (`--u-chart-1` to `--u-chart-6`). The charts' Installation page links there in one sentence.

- Reader: `readTokens(css, scope)` takes `{ layer, selector }`. The default is core's (`umriss.tokens`, `:root`); core's demo passes `umriss.components`, `.uc-root` for the charts. It now drops a section that holds no token (the charts' Axes, Legend …). A `var()` whose fallback is a colour counts as a colour, so the six series tokens get swatches. Core's table is byte-for-byte unchanged (compared before and after).
- Table: `chartsTokenTable(groups, coreGroups)` in `tokenTable.ts`. A reference becomes a link only where core declares the token, so `--u-chart-N` stays code and no link points to nothing. The swatch draws the token's value, not `var(--uc-…)`: the page declares no `--uc-` token, only a chart's root does. The value's core token then resolves in the column's `color-scheme`, as core's swatches do.
- Guard: `missingTokens` counts `--uc?-`. Core's `demo/props.ts` reads `../charts/src/styles/charts.css` as a file, not an import, and stops when the prerendered Theming page lacks a row for any token of either stylesheet.

Tests (`packages/demo/tests-unit/tokens.test.ts`):
- a charts-style fixture: only the root class, no empty sections, the fallback read, the comment, colour by fallback;
- the charts table: title and anchor, a link only to a known core token, the swatch drawn from the value;
- the real charts stylesheet: 29 tokens, every one with its row, and the guard naming a removed one.

lint, typecheck and test:unit are green. The table's demo smoke test timed out under load and passes with `--testTimeout=30000`.

Playwright (ui-light, ui-dark, charts-light, charts-dark; core's screenshots and accessibility plus charts' screenshots, `-g "theming|token|installation"`): 22 passed.

Baselines moved: `page-installation` of the charts, light and dark, for the added sentence. No other baseline changed. The charts section is not photographed; the spec asks only for the first group's picture.

Deviation: the link from the charts' Installation page is absolute (`https://romanhaendler.github.io/umriss-ui/core/theming/#charts-tokens`). The prose grammar has no link to a neighbouring demo, and an absolute address works on the site, in the dev server and in the llms text alike.
