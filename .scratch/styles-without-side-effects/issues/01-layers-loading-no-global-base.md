# 01 — Layers, loading, and no global base

Status: done
Type: task

Blocked by: —
Runs in parallel with: nothing — it touches every stylesheet and every build config.

Spec: `.scratch/styles-without-side-effects/spec.md` · ADR-0021

## Scope

1. **Loading.** `dist/core.js`, `dist/table.js`, `dist/charts.js` import their
   own `./<name>.css` as the first statement. `dist/wording/de.js` imports
   nothing. A dist check (e.g. `scripts/check-dist.mjs`) runs in each package's
   `prepublishOnly` after the build and fails if the import is missing, if the
   CSS does not start with `@layer umriss.tokens, umriss.components;`, or if it
   contains a forbidden selector (spec, "No rule outside the library's own
   elements").
2. **Layers.** `tokens.css` → `@layer umriss.tokens { … }` (the dark block
   stays as it is; ticket 02 rewrites it). Every `*.module.css` in core and
   table → `@layer umriss.components { … }`, written in the source. Every
   shipped stylesheet begins with the order statement. `charts.css` gets the
   order statement and its layer here too, **without** renaming `.kc-*` (07).
3. **`box-sizing` by the build.** One shared PostCSS module adds
   `box-sizing: border-box` to every rule whose selector contains a module class
   and whose last compound is not `*`; rules already declaring it are left
   alone. Wired into the library builds and the three demo builds. Unit tests
   for the step: `.a`, `.a:hover`, `.a::before`, `.a input` get it;
   `.a > *`, `.a *`, `:root`, `html` do not.
4. **No global base.** `packages/core/src/styles/global.css` is deleted and its
   import removed from `src/index.ts`. None of its rules is carried into a
   module here: text context, focus, scrollbars, caret, autofill and squircle
   corners belong to the tickets that own the components (04–07), guided by
   03's checks and the red pictures.
5. **Demos.** `packages/*/demo/main.tsx` and `packages/{charts,table}/demo/
   ui-styles.css` stop importing `global.css`. `html`/`body` of the demo pages
   get no font, colour, background or box model. The shell's chrome
   (`packages/demo/src/shell.css`, `page.css`) sets what it needs on its own
   classes — the header, rail, page head and example frames must look as before.
6. **Guards.** `stylesheets.test.ts` (core) and `styleGuard.test.ts` (table) gain:
   every rule lies inside `@layer umriss.*`; no forbidden selector.
7. **`tokens.css` keeps `:root { color-scheme: light }` for now** — ticket 02
   removes it together with the theme. Note it as a known exception in the
   guard with a pointer to 02.

## Acceptance

- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
- `pnpm build` in all three packages, then the dist check passes; `head -1
  dist/core.js` shows the CSS import.
- `git grep -n "global.css"` finds nothing outside `.scratch/`, `docs/journal.md`
  and changelogs.
- The shell's own pictures — every page head (`page-*`, `Seitenkopf *`) and the
  overview pages — are unchanged, or each changed one is listed with the reason.
  They show the shell, not a component, so a red one here is 01's to fix.
- `pnpm test:visual` has been run, and **the list of red screenshots is appended
  under Comments**, grouped by the ticket that owns the component (04, 05, 06,
  07 — see the ownership table in the spec). No baseline is renewed.

## Comments

**Delivered.** The library builds import their own stylesheet, every shipped rule lies in `@layer umriss.tokens` or `umriss.components`, and `global.css` is gone.

- `scripts/styles/rules.ts` (`offendersIn`, `LAYER_ORDER`), `scripts/styles/ownBox.ts` (the box-sizing step), `scripts/styles/importOwnCss.ts` (the import at the head of the entry chunk) and `scripts/check-dist.ts`, wired as `check:dist` into `prepublishOnly` of all three packages. `postcss` is a root dev dependency for them. Tests: `packages/core/tests-unit/stylesheetRules.test.ts` (33 cases).
- Every stylesheet under `packages/*/src` begins with the order statement and holds one layer block. The guards in `stylesheets.test.ts` (core, tokens included) and `styleGuard.test.ts` (table) run `offendersIn`; `tokens.css` tolerates its two `color-scheme` declarations until 02, named in the test with the reason.
- `dist/core.css` fails `check:dist` on exactly those two declarations - expected until 02. `dist/table.css` and `dist/charts.css` pass.
- **Checked in a throwaway consumer** (Vite, `import { Button } from "@umriss-ui/core"` and nothing else): the built CSS holds the layer order, the tokens and the button's rules. The import survives tree shaking.
- The demos: `global.css` is no longer imported; `shell.css` gives the demo application `body { margin: 0 }` and the shell its type on `.shell`; `.exampleStage` resets font, colour and smoothing to the browser's defaults. No page head and no overview picture moved.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green (core 982, table 370, charts 395, demo 29).

**`pnpm test:visual` after this ticket: 438 passed, 199 failed, 161 skipped.** Every failure is a screenshot; no behaviour test failed. The red pictures by owning ticket - no baseline was renewed:

**04** (32): `The command palette's window in the resting state` (dark, light) · `alert--tones` (dark, light) · `alert--with-actions-and-dismiss` (dark, light) · `badge--counter` (dark, light) · `badge--tones` (dark, light) · `button--variants` (light) · `card--anatomy` (dark, light) · `card--collapsible` (dark, light) · `checkbox--states` (dark, light) · `combobox--states` (dark, light) · `combobox--typing-filters` (dark, light) · `commandpalette--shortcut` (dark, light) · `datepicker--states` (dark, light) · `datepicker--value-contract` (dark, light) · `daterangepicker--presets` (dark, light) · `daterangepicker--span` (dark, light) · `datetimepicker--only-on-commit` (dark, light) · `datetimepicker--with-seconds` (dark, light) · `datetimerangepicker--maintenance-window` (dark, light) · `datetimerangepicker--shift-window` (dark, light) · `divider--horizontal` (dark, light) · `divider--vertical` (dark, light) · `emptystate--an-invitation` (dark, light) · `formfield--hint-and-error` (dark, light) · `input--clearing` (dark, light) · `input--numeric` (dark, light) · `input--states` (dark, light) · `meter--fraction` (dark, light) · `sparkline--history` (dark) · `stack-and-grid--stack` (dark) · `umrissprovider--entry-by-entry` (dark, light) · `umrissprovider--the-second-language` (dark, light)

**05** (22): `multiselect--chips-in-the-field` (dark, light) · `multiselect--states` (dark, light) · `numberinput--bounds-and-empty` (dark, light) · `numberinput--notation` (dark, light) · `radiogroup--side-by-side` (dark, light) · `radiogroup--with-descriptions` (dark, light) · `select--native-select` (dark, light) · `stat--freshness` (dark, light) · `stat--history-and-target` (dark, light) · `stat--the-fourth-outcome` (dark, light) · `stat--value-against-limits` (dark, light) · `tag--removable` (dark, light) · `tag--tones` (dark, light) · `textarea--autogrow-and-counter` (dark, light) · `textarea--states` (dark, light) · `toast--feedback` (dark) · `treeview--a-tree` (dark, light) · `treeview--demonstration` (dark, light) · `treeview--ticking` (dark, light) · `typography--level-and-size` (dark) · `typography--mono-tracking-and-links` (dark) · `typography--sizes` (dark)

**06** (46): `alarmlist--flood-and-chatter` (dark, light) · `alarmlist--lifecycle` (dark, light) · `column--absent-values` (dark, light) · `column--computed-value` (dark, light) · `column--defaults` (dark, light) · `column--footer` (dark, light) · `column--format` (dark, light) · `column--own-ordering` (dark, light) · `column--presentation` (dark, light) · `column--presets` (dark, light) · `column--row-header` (dark, light) · `column--value-from-field` (dark, light) · `column--width` (dark, light) · `column--wrapper` (dark, light) · `columnmenu--show-hide-and-order` (dark, light) · `export--download` (dark, light) · `export--text` (dark, light) · `filter--conditions-from-outside` (dark, light) · `filter--list-filter` (dark, light) · `filter--own-filter` (dark, light) · `filter--own-filter-minimal` (dark, light) · `filter--range-filter` (dark, light) · `pagination--paging` (dark, light) · `pagination--without-a-bar` (dark, light) · `rowactions--bulk-action` (dark, light) · `rowactions--overflow` (dark, light) · `rowactions--row-actions` (dark, light) · `rowdetail--detail-row` (dark, light) · `search--outside` (dark, light) · `search--search` (dark, light) · `table--demonstration` (dark, light) · `table--density` (dark, light) · `table--empty-and-loading` (dark, light) · `table--first-table` (dark, light) · `table--initial-view` (dark, light) · `table--pre-filter` (dark, light) · `table--provider` (dark, light) · `table--selection` (dark, light) · `table--sticky-parts` (dark, light) · `table--styling-rows` (dark, light) · `table--virtualisation` (dark, light) · `toolbar--in-the-table` (dark, light) · `toolbar--outside` (dark, light) · `verdictcolumn--format` (dark, light) · `verdictcolumn--four-verdicts` (dark, light) · `verdictcolumn--sorting` (dark, light)

**07** (5): `chart--sizes` (light) · `controlchart--control-chart` (light) · `line--basic` (light) · `matrix--matrix` (dark) · `pareto--pareto` (dark, light)

`umrissprovider--*` and `The command palette's window in the resting state` are listed under 04: the provider page is Setup and belongs to nobody else, the palette is 04's.
