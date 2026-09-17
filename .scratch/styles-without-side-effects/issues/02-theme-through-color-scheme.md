# 02 — Light and dark through `color-scheme`

Status: ready-for-agent
Type: task

Blocked by: 01
Runs in parallel with: 03, 04, 05, 06. Owns `tokens.css`, `packages/core/src/lib/provider/`, the theme switch in the three `demo/App.tsx`.

Spec: `.scratch/styles-without-side-effects/spec.md` ("Theme") · ADR-0021

## Scope

- **Tokens.** Every token of `:root[data-theme="dark"]` is folded into the one
  `:root` block as `light-dark(<light>, <dark>)`; shadows get one
  `light-dark()` per colour. The dark block is deleted. Tokens without a dark
  value stay as they are. `color-scheme` is removed from `tokens.css`, and the
  guard exception from 01 with it.
- **Provider.** `UmrissProvider` loses `theme` (prop, doc comment, effect,
  `Theme` type if nothing else uses it) and `useDensityOnDocument`. `density`
  keeps working through context. The provider writes nothing to
  `document.documentElement`. `provider.test.tsx` loses the `data-theme` and
  `data-density` cases and gains one: mounting any provider leaves
  `document.documentElement` attributes and style untouched.
- **Unit tests reading tokens.** `contrast.test.ts` reads light and dark out of
  the `light-dark()` pairs; the known-pair exceptions in
  `packages/demo/checks/accessibility.ts` keep their meaning.
  `themeFallbackConformance.test.ts` and `toast.test.tsx` follow.
- **Demo apps.** The theme switch in `packages/{core,table,charts}/demo/App.tsx`
  sets `document.documentElement.style.colorScheme` (initial value from
  `prefers-color-scheme`, as today). The charts demo keeps calling
  `invalidateTheme()` until 07.
- **The provider's demo page** (`packages/core/demo/outline.ts`,
  `why/umrissprovider.tsx`, examples) no longer offers or mentions `theme`.

## Acceptance

- `git grep -n 'data-theme'` finds nothing in `packages/` except charts'
  `theme.ts` comment (07 rewrites it).
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
- Every `ui-dark`, `table-dark` and `charts-dark` screenshot that was green
  after 01 is still green — the dark theme now comes from `color-scheme`, and
  the pixels do not move.
- A scratch page (not committed) with `<div style="color-scheme: dark">` around
  a `Card` shows the card dark inside a light page; noted under Comments.

## Comments
