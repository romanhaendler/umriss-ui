# What a package ships so that Jest and Vitest load it unconfigured

Type:   research
Status: open

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
