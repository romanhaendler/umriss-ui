# 08 — The documents follow

Status: done
Type: task

Blocked by: 02, 03, 04, 05, 06, 07
Runs in parallel with: nothing. It is the only ticket of this effort that edits shared documents.

Spec: `.scratch/styles-without-side-effects/spec.md` · ADR-0021

## Scope

- **READMEs** (root, core, table, charts): setup is one import; `styles.css`
  optional; fonts are recommended, not loaded, and overridden through
  `--u-font-sans`/`--u-font-mono`; light/dark through `color-scheme` with the
  one-line example for an own switch; overriding tokens with `:root { … }`;
  the browser floor (Chrome 123, Firefox 120, Safari 17.5). Remove every
  sentence that tells a caller to import the stylesheet or that mentions
  `data-theme`.
- **Changelogs**: core, table and charts each get "Changed" entries under the
  unreleased versions they already carry (core `0.1.0`, table `0.2.0-rc.0`,
  charts `0.3.0-rc.0` — nothing is published yet, so no number moves): the
  automatic stylesheet, the layers, no global base, `color-scheme`,
  `UmrissProvider` without `theme` and without writing to `<html>`, `.kc-*` →
  `.uc-*`.
- **`CONTEXT.md`**: **Token** (layer, `light-dark()`); new **Text context** and
  **Own element**; remove whatever still says `data-theme`.
- **`docs/design-language.md`**: the dark theme section says how it is switched.
- **`docs/testing.md`**: the three checks of 03; the demos run without a page
  base, and why.
- **`docs/journal.md`**: the delivery entry for this effort.
- **The spec**: `Status: done`, with the delivery report under Comments.

## Acceptance

- `git grep -n -E 'styles\.css' -- '*.md' ':!.scratch'` shows only the optional
  mention per README and the changelog entries.
- `git grep -n 'data-theme'` finds nothing outside `.scratch/`, ADR-0021's
  alternatives and the journal/changelog history.
- The README code examples still typecheck (paste them into a scratch file in
  each package and run `tsc --noEmit`; do not commit it).

## Comments

**Delivered.**

- **READMEs:** the root and core READMEs show one import. Core's has a **Styles** section (loading, no side effects, layers and overriding, `color-scheme` with the one-line switch, fonts as the application's with Geist recommended, the browser floor), and its `UmrissProvider` row no longer names a theme. Table and charts drop their stylesheet imports from the smallest examples and point to the same rules. The code examples of all three READMEs typecheck (a scratch file per package, not committed).
- **Changelogs:** a "Styles that load themselves" section with **Changed** in each package, under the numbers they already carry. Charts names the `kc-` → `uc-` rename for callers who wrote selectors against the DOM.
- **`CONTEXT.md`:** **Token** (layer, `light-dark()`, overriding, `_Avoid_: theme attribute`); new **Own element** and **Text context**.
- **`docs/design-language.md`:** the dark theme is `color-scheme`; squircles and the connoisseur's details are scoped to the library's own elements, and the text selection is the application's.
- **`docs/testing.md`:** rows for the style rules and the own-base checks, the convention that examples stand on browser defaults, and `ui-styles.css` importing only the tokens.
- **`docs/journal.md`:** the delivery entry.
- **Acceptance greps:** `styles.css` in documents outside `.scratch/` stands only as the optional export, in changelog history and in ADR-0021's "before". `data-theme` stands only in ADR-0021, the journal, core's changelog entry and a test comment that says it is gone.
