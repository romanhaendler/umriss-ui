# 02 — Light and dark through `color-scheme`

Status: done
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

**Delivered.**

- `tokens.css` holds one `:root` block. The 34 dark declarations are folded in as `light-dark(<light>, <dark>)`; the two shadows carry one `light-dark()` per colour, the rest of their structure is shared. Both comments of the dark block stand beside their tokens, marked "Dark:". `color-scheme` is gone from the file, and with it the guard's exception from 01; `dist/core.css` now passes `check:dist`.
- `UmrissProvider` holds four things. `theme` (prop, config field, the `Theme` type) and both document effects are removed; nothing else in `src` read `theme`. `provider.test.tsx` lost the seven theme cases and the two `data-density` cases and gained one: a provider with every setting, and its teardown, leave the attributes and the style of `<html>` exactly as they were.
- `contrast.test.ts` reads light and dark out of the pairs; `themeFallbackConformance.test.ts` reads the light half.
- The three demo apps switch with `document.documentElement.style.colorScheme`. The provider's demo page no longer mentions a theme; its "Why" explains `color-scheme` instead.
- **Pictures.** Against 01's run nothing in core or table moved: every `ui-dark`/`table-dark` picture that was green is green, the dark theme now coming from `color-scheme`. Two baselines were renewed on purpose - `page-umrissprovider` light and dark, whose sentence lost "theme" (diff looked at: only that line moved).
- **Expected red until 07:** the charts. `theme.ts` reads `--uc-*` as text and now gets `light-dark(…)`, which a canvas cannot draw - 13 pictures and `switching the theme changes the axis and series colours without a reload`. That is exactly 07's canvas step.
- The scoped check, run as a throwaway Playwright test against the built core demo (not committed): `color-scheme: dark` set on the stage of the first `Card` example turned the card's background from `rgb(255, 255, 255)` to `rgb(22, 22, 24)` - the dark surface - while the shell around it stayed `rgb(250, 250, 250)`.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green (core 974 after the removed cases, table 370, charts 395, demo 29).

**Review follow-up** (see the spec's Comments): the renewal of `page-umrissprovider` is now named in the spec's Testing Decisions.
