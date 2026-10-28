Status: ready-for-agent
Size: M
Blocked by: none

# `@umriss-ui/core/touch-scale.css`: the 44 px block becomes an opt-in

Spec: `../spec.md`, Implementation steps 2, 3, 7 (as commit-body changelog lines), 8 and 9.

- Delete the `@media (pointer: coarse)` block setting `--u-control-height: 44px`
  (and its comment) from `packages/core/src/styles/tokens.css`.
- Add `packages/core/src/styles/touch-scale.css` exactly as the spec shows. It is
  a plain stylesheet (not a CSS module, not bundled into `core.css`); the build
  emits it as `dist/touch-scale.css` (`packages/core/vite.config.ts`; see
  `scripts/styles/importOwnCss.ts` for how `dist/styles.d.ts` is written).
- `packages/core/package.json`: export `./touch-scale.css` beside `./styles.css`
  with `types: ./dist/styles.d.ts`, plus the `typesVersions` entry. If
  `packages/core/tests-consumer` checks the exports, extend it to import the new one.
- The existing visual test `packages/core/tests-visual/features-sizes.spec.ts`
  ("under a finger" / "a md control is 44 px") states the old default: change it
  to expect 32 under touch. This is the one existing test you may edit.
- Any comment or doc in the packages that still says a `md` control is 44 px
  under a finger by default (grep `44`, `coarse`, `ADR-0070`) is corrected.
- README Styles section: the "Touch" paragraph (spec step 8).
- `pnpm --filter @umriss-ui/core props` to regenerate `API.md`.
