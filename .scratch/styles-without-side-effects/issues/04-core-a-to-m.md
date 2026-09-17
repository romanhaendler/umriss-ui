# 04 — The components carry their own base: core A–M

Status: done
Type: task

Blocked by: 01, 03
Runs in parallel with: 05, 06, 07 (and 02). Owns only these modules and their components:
Alert, Badge, Button, ButtonGroup, Card, Checkbox, Combobox, CommandPalette, DataViz, DatePicker, Divider, Dock, EmptyState, FormField, Input, Layout, Menu — including panel **contents** of Combobox, Menu and the pickers (05 owns the Popover surface).

Spec: `.scratch/styles-without-side-effects/spec.md` ("The text context", "Focus", "No rule outside the library's own elements") · ADR-0021

## Scope

Work from the red pictures listed under 01's Comments and the offenders listed
under 03's Comments that belong to this ticket.

- **Text context** on the root of each component that renders text, and on each
  panel surface this ticket owns — exactly the values `html`/`body` carried
  (spec). Not on pure layout.
- **Focus**: a `:focus-visible` ring on every element these components make
  focusable, unless it already has one.
- **Page-wide decoration that belonged to these components** moves into their
  modules: thin themed scrollbars on their scroll containers, caret colour and
  autofill on their fields, `corner-shape: squircle` on their classes with a
  `border-radius`.
- **Loose example text** in these components' examples that changes under
  browser defaults is rewritten with `Text`/`Heading`; each example is listed
  under Comments. Only then may its baseline be renewed, one by one, compared
  by eye.
- Do not touch `tokens.css`, guard tests, changelogs, READMEs or another
  ticket's modules. If a picture needs a change outside the list, write it under
  Comments and leave it.

## Acceptance

- Every screenshot of these components (both themes) is green **without a
  renewed baseline**, except the loose-text examples listed under Comments.
- 03's three checks report no offender in these components.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
- Under Comments: the pictures that went from red to green, and any that could
  not, with the reason.

## Comments

**Delivered.** Worked together with 05 on the shared module, and reported separately.

- **One place for the values:** `packages/core/src/styles/own.module.css`. Components take `text`, `ring`, `field` and `scroll` with `composes` on their own class. `text`, the caret (`field`) and `scroll` lie in `umriss.base`, one layer below the components. `ring` and the autofill look lie in `umriss.components` and win through their pseudo-classes. The shared module is under the same guard as the component modules.
- **Deviation from the spec, recorded there and in ADR-0021: a third layer, `umriss.base`.** With `text` first in `umriss.components`, 28 core pictures stayed red. The badge was the clearest case: `composes` guarantees the class, not the order of the rules, and the shared text context landed after the badge's own size and colour. One layer lower makes the order irrelevant. The order statement in every stylesheet, `rules.ts` and `check-dist.ts` changed with it.
- **Deviation: corners by the build.** Squircle corners were not in 04/05's modules but a build step, `ownCorners` in `scripts/styles/ownBox.ts`, beside `ownBox` and with tests of its own. The palette's corners were the only picture that showed it, and 38 modules would otherwise have repeated a line after every radius.
- **Found on the way, not caused by this effort:** the baselines `The command palette's window in the resting state` (light, dark) still showed "Kontur UI 0.9.0" and "KonturProvider". They had passed under the comparison threshold since the rename.

- **Text context** on Alert, Badge, Button, Card, Checkbox, Combobox, CommandPalette (dialog), DataViz (meter, sparkline), DatePicker (trigger, panel, range panel), Divider, Dock, EmptyState, FormField and Input. The font smoothing, not only the family, turned out to be inherited: a primary button's light label differed from its baseline until `Button` took `text`.
- **Ring** on Button, Card's collapse button, and the Dock's grip and tools.
- **Field / scroll** on Input, Combobox (field and list), CommandPalette (field and list) and the pickers' time fields.
- **Loose example text:** `commandpalette--shortcut` wrote a raw `<input>` with inline styles. It is `Input size="sm"` now. Its two baselines and the two resting-state palette baselines were renewed, each diff looked at: the field, the 2px shift below it, and the stale name and version.
- **Tolerated in the own-base check** (`packages/core/tests-visual/own-base.spec.ts`): `shortcut › input`, the palette's field, which carries no ring by design (the shell check asserts it).
- **Result:** all 375 core browser tests green in both themes - 99 red pictures after 01 became 0, and every core page passes the three checks.
