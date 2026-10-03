# 01: A Theming page with core's token table

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/theming-and-wording-reference/spec.md`

**What to build:** A reader opens `/core/theming/` (in the rubric "Customising" if `sidebar-tree` has landed, otherwise in Getting started after UmrissProvider) and finds every `--u-` token declared on `:root` in core's tokens layer, grouped by the stylesheet's section comments, with light and dark values side by side, a swatch drawn by the browser for colour tokens (light cell `color-scheme: light`, dark cell `color-scheme: dark`, swatch `aria-hidden`), the token's comment, a mark for tokens redeclared under reduced motion, and `var()` references as links to the referenced token. Each row is anchored at `#token-<name>`. The table is written as HTML and Markdown from one model, prerendered, mounted by the app and carried in `llms-full`. Non-English section comments in the stylesheet are translated.

- [ ] Token reader fixtures: `light-dark()` splits; a single value stands in both columns with "same" in dark; a `var()` with fallback yields a link and keeps the fallback; a declaration outside `:root` or the tokens layer is not a token; section comment → group; preceding and trailing comments read; reduced-motion redeclaration marked.
- [ ] Built-site guard: the page has an element with the anchor of every core token the reader finds; the build fails on one missing.
- [ ] The table is in `llms-full`.
- [ ] A screenshot of the table's first group in light and dark joins the core baselines; the dark swatch is dark on a light page.
- [ ] No German remains in the token stylesheet's comments.
