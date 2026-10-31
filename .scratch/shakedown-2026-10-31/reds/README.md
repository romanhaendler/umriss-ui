# The reds of the 2026-10-31 shakedown

What the tickets call "the red": the failing tests and host repros the agents left, copied out of the
session scratch (without `node_modules`, screenshots and tarballs).

- `p28-table/`, `p29-core/` - vitest files. Copy into `packages/table/tests-unit/` or
  `packages/core/tests-unit/` of a worktree and run `pnpm --filter @umriss-ui/<pkg> exec vitest run <file>`.
  They encode the bug hunters' expectations; read each before trusting it (a few were exploratory, e.g.
  `p29Numbers` "tiny value is editable" expects the field to accept a digit after its own "1E-11").
- `h*/`, `p*/` - Vite hosts. Each installed the packed tarballs from the session scratch; to rerun, pack the
  current packages (`pnpm --filter @umriss-ui/<pkg> build`, then `pnpm pack --pack-destination <dir>` in the
  package), point the host's `package.json` at those files, `npm i`, start Vite on the host's port, then run
  the named script (`node tN.mjs`) or spec (`npx playwright test <file>`). Chromium only.

A fix starts by turning the repro into a unit test or a `@quick` case in the package; the host is the lead,
not the test.
