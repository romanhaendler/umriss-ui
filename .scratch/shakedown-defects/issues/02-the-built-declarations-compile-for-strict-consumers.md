# 02: The built declarations compile for strict consumers

Spec: `.scratch/shakedown-defects/spec.md` (Core: strict declarations, resolution and stylesheet types; Check of the built package, part 2)
Findings: `core.md` A5 and B11, `design-system.md` 1, `cross-package.md` 13

**What to build:** a consumer with `strict`, `exactOptionalPropertyTypes`,
`skipLibCheck: false` and `declaration: true` imports every entry of every
package - including `wording/de` and `styles.css` - and compiles, under
`bundler` and under `node10` resolution. A wrapper library that re-exports
`useToast()` or `useFormField()` keeps them in its emitted declarations.

**Blocked by:** 01 (both extend `check:dist`)

**Status:** ready-for-agent

- [ ] Red first: `check:dist` compiles a consumer file under those settings, both resolutions, re-exporting one hook's return type - red today on core (`RefProp`, TS4058)
- [ ] `RefProp`'s `ref` and any other optional the compile names accept `undefined`
- [ ] `ToastContextValue`, `FormFieldContextValue` and the freshness as-of time type exported under names that read as API; `API.md` regenerated with `props`
- [ ] `typesVersions` for `wording/de` in core and charts
- [ ] Every package's `styles.css` export has a one-line declaration; a side-effect import type-checks on TS 6/7
- [ ] `check:dist` green for all six packages after a build; `pnpm check:site` green
- [ ] The findings struck from their shakedown files (B11's `Tooltip.children`/`Menu.trigger` typing stays open)
