# What a package ships so that Jest and Vitest load it unconfigured

Type:   research
Status: resolved

## Question

What must an ESM-only React package with a side-effect CSS import ship so that Vitest 5 (jsdom and happy-dom)
and Jest 29/30 (babel-jest, jsdom) load it with their default configuration?

- `exports` conditions: what does a `default` condition beside `import` change for Jest's resolver; is a CJS
  build needed, or does Jest 30's ESM support suffice; what do Mantine, MUI, Radix, React Aria ship?
- The CSS: `dist/core.js` imports `core.css`, and Vitest fails with `Unknown file extension ".css"`
  (`.scratch/shakedown/core.md` A3). How do comparable libraries deliver CSS (an explicit
  `import 'lib/styles.css'` by the caller, CSS-in-JS, a `style` condition) and what does each cost a Vite
  and a Next app?
- What a test of a chart needs in jsdom: a sized `ResizeObserver`, a `getContext` stub
  (`cross-package.md` 10). Which libraries export such a setup file?

Facts only, with primary sources (the tools' docs, the libraries' `package.json`). The decision is
"Jest and Vitest with no configuration".

## Answer

Findings: `docs/research/after-shakedown/jest-and-vitest.md` on the local branch `research/jest-and-vitest`
(`git show research/jest-and-vitest:docs/research/after-shakedown/jest-and-vitest.md`). Reproduced with Jest
29.7/30.5, Vitest 5.0.5 (jsdom, happy-dom), Node 22/24, against umriss 0.41.1 and five comparable libraries.

- A `default` condition lets Jest resolve the package but not run it: ESM still needs
  `transformIgnorePatterns`, or Node 24.9+ with `--experimental-vm-modules` (Jest's ESM is experimental).
- A CSS import from JS needs a `moduleNameMapper` in Jest whatever the build, and fails in Vitest's default
  pool for every package, dual and CJS builds included: Vitest hands `node_modules` to Node, which rejects
  `.css`. Only `server.deps.inline` or `pool: "vmThreads"` help. **ADR-0021's premise "Vitest handles CSS
  imports" does not hold.**
- The only unconfigured shape found: a CJS build that imports no CSS from JS. Every compared library (Mantine,
  MUI, Radix, React Aria, Chakra, Headless UI, xyflow, sonner) ships a `require` entry and imports no `.css`
  from JS; CSS comes from a caller import (one line in Vite and Next), runtime injection, or not at all.
- Charts in jsdom need a mock that reports a size, not a polyfill: jsdom has no layout, no ResizeObserver,
  `getContext` returns null; happy-dom's ResizeObserver never fires. No library exports a jsdom setup; the
  closest precedent for a setup subpath is `@testing-library/jest-dom/vitest`.
