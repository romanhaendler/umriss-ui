# 01 — Layers, loading, and no global base

Status: ready-for-agent
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
