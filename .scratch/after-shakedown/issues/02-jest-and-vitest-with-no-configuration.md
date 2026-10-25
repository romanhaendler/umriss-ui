# Jest and Vitest with no configuration

Type:       grilling
Status:     open
Blocked by: 01

## Question

Does umriss promise that a consumer's Jest and Vitest load every package without configuration - and if so,
by which change to what the packages ship?

- How the CSS reaches the page: keep the side-effect import in `dist/*.js`, or have the caller import the
  stylesheet once (a breaking change for every app; costly to reverse, so an ADR).
- An `exports` `default` condition, a CJS build, or neither.
- A testing aid: a documented or exported setup (sized `ResizeObserver`, `getContext` stub, `matchMedia`) and
  the Jest recipe (`cross-package.md` 10, wish "A testing aid"); a test-mode switch that turns motion off
  (`qa.md` 3, wish `data-motion="off"`).
- How the promise is held: a consumer test in CI for both runners?

Input: the research of "What a package ships so that Jest and Vitest load it unconfigured";
`.scratch/shakedown/core.md` A3, `cross-package.md` 8-12, `qa.md`.
