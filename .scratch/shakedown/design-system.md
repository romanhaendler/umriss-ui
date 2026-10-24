# Shakedown: wrapping umriss into a company design system (0.39.0 → 0.40.4)

Status: needs-triage

A pnpm workspace: `@acme/ui` (Vite 8 library mode, vite-plugin-dts, TS 5.9) wrapping umriss, `@acme/app`
importing only `@acme/ui`, Storybook 10.6 (react-vite, docs, themes). Built on umriss 0.39.0 from npm, then
upgraded to the 0.40.4 tarballs. Chromium, 2026-10-24. Not covered: WebKit, SSR, schedule and calculation
rendering, two umriss copies, TS 7.

## Findings

1. ~~**[Break] The wrapper's declaration emit silently loses its `useToast` and `useFormField` wrappers - and
   the build exits 0:**~~ **Fixed 2026-10-24** (spec `.scratch/shakedown-defects/`). TS4058/TS4023 on `ToastContextValue`/`FormFieldContextValue` (not exported),
   `dist/Toast.d.ts` missing while `dist/index.d.ts` still re-exports it; the app then fails with TS2305.
   Workaround: annotate `(): ReturnType<typeof useToast>`. Same cause as `core.md` B11; this is the silent
   part.
2. **[Break, upgrade] A complete company `Wording` stops compiling at 0.40.0:** `Wording` grew from 259 to
   302 required keys (43 `dashboard*`), listed under "Added" in core's CHANGELOG, not "Changed". Idea: list
   new required keys under "Changed", or make new keys optional in the input type.
3. **[Misfit] Density is two systems:** dense or roomy tokens leave table rows at 36 px; only
   `<UmrissProvider density="compact">` reaches the table (27 px) and the calculation
   (`table/src/Table.module.css:77`, `:165`). The provider writes nothing to the document, so a wrapper must
   bridge both.
4. **[Misfit] A Modal's width cannot be themed:** `.sm/.md/.lg` set `--_width` 400/520/720 px
   (`core/src/components/Modal/Modal.module.css:53`); `className` and `style` land on the full-viewport
   `<dialog>`, not the sheet; there is `--u-drawer-width` but no modal width token. Idea: `--u-modal-width-*`
   or a sheet class/style prop.
5. **[Misfit] A wrapper's layered CSS loses to umriss depending on load order:** `@layer acme { … }` before
   core loses, after core wins; declaring `@layer umriss.tokens, umriss.base, umriss.components, acme;` first
   wins in both orders (unlayered always wins). Idea: one README line for wrapper authors (see `core.md` B7).
6. **[Misfit] `@acme/ui` cannot hide core's `light-dark()` collapse (A1):** the app's build without
   `cssTarget` collapses the wrapper's own tokens too.
7. **[Misfit] Storybook autodocs list only the wrapper's own props** (`children | variant`); everything
   inherited from umriss is missing, even with a `propFilter` allowing `@umriss-ui`. Idea: ship a
   machine-readable props file in the package (the repo has `API.md`, the tarball does not).
8. **[Look] A compact table's line height is a fixed 18 px** (`Table.module.css:165`) while the regular one
   has a rem floor (`:77`): at root 32 px compact rows stay 27 px around 26 px text.
9. **[Misfit] Not reachable by a token:** uppercase eyebrows (`Table.module.css:100`, `:899`,
   `Card.module.css:73`, `Divider.module.css:59`, `Typography.module.css:87`, `Dashboard.module.css:54`,
   `DatePicker.module.css:125`, `:231`, `CommandPalette.module.css:162`); the button's press scale and
   disabled opacity (`Button.module.css:44`, `:37`); virtual-row focus uses `--u-color-accent`, not
   `--u-focus-ring` (`Table.module.css:1501`); 63 fixed px lengths in table, schedule, calculation and
   dashboard CSS; modal widths; the matrix gradient (`charts/src/Matrix.tsx:24`, a prop only); `--uc-shadow`
   literals (`charts.css:60`); schedule task colours (per-task prop, no palette token); `--uc-*` tokens are
   redeclared on `.uc-root` inside a layer, so a parent cannot set them (set them on the Chart, or use
   `--u-chart-1..6`).
10. **[Misfit] Hashed class names change between versions** (65 of 431, e.g. `_button_17kqd_4` →
    `_button_1j4pr_4`); a rebuild of the same version is identical. Documented: ADR-0045.

## Wishes

- **A `FormField` label style or placement slot** (horizontal layout). Workaround: a span as `label`; label
  size shares `--u-text-sm` with every control (`FormField.module.css:14`). Elsewhere: Mantine `labelProps`,
  MUI `FormLabel` slots. Unlisted.
- **Stable part hooks** (`data-part`, slot props, `classNames` per part). never: ADR-0045. **Instead (a
  token per need) holds for 5 of 7 needs** (colours, radius, font, ring, shadows) and **fails for the modal
  width, text-transform and the press scale** - no token exists.
- **A theme object** (`createTheme({ accent, neutral, radius, font, density })`). Workaround: about 50 lines
  of tokens and a 10-line provider. Elsewhere: MUI and Mantine `createTheme`. Unlisted.

## Held up

All seven rebrand axes through tokens alone - accent, blue-tinted greys, radius 6–16, Inter, dark, dense,
roomy - with zero console errors · the chart palette via `--u-chart-N: light-dark(…)` follows a theme switch
on the canvas · one unlayered `:root` block wins in any import order; umriss loads its own CSS · types through
the wrapper: bad fields, variants and sizes error, generic `Combobox<T>` and `useAcmeTable<Z>` infer,
`skipLibCheck:false` clean apart from the two hooks above · Storybook: every story and docs page renders,
overlays work in the canvas, the theme addon switches · 0.39.0 → 0.40.4: the wrapper type-checks and builds
unchanged, its `dist` byte-identical, the app's screenshots pixel-identical in 3 densities × 2 themes ·
a brand variant via `--u-color-primary-*` carries hover, active and disabled.
