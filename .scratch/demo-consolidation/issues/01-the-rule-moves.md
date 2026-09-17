# 01 — The rule moves, and keeps its proof

Status: done
Type: task

Spec: `.scratch/demo-consolidation/spec.md`

## Scope

Before anything is moved, the rule that forbids the move is rewritten — with its evidence replaced rather than removed.

**`eslint.config.js`.** The block for `packages/charts/**/*.{ts,tsx}` narrows to `packages/charts/src/**/*.{ts,tsx}`: no import of `@umriss-ui/core` (R-1.2), no import of `@umriss-ui/table`. `packages/charts/demo/**` and `packages/charts/tests-visual/**` are released from the core ban and keep the table ban. The header comment at the top of the file — "@umriss-ui/charts imports nothing from @umriss-ui/core … its demo included" — is corrected in the same commit; a stale comment above a changed rule is worse than no comment.

In the `packages/demo/**` block, the pattern that forbids `@umriss-ui/charts` goes ("@umriss-ui/demo is the shell for core and table; charts has its own (R-1.2)"). The shell does not import charts either way — but the message now states a thing that is no longer true.

**`docs/adr/0020-the-demo-shell-is-shared.md`.** Title: *The demo shell is shared by all three demos, and R-1.2 binds the package source.* It records: what R-1.2 protects (nothing published from `charts` may pull in `core`); that the demo was a second, weaker piece of evidence for it; the four checks that carry the claim afterwards — the lint rule on `src/**`, the manifest naming core in neither `dependencies` nor `peerDependencies`, the package's own unit and SSR tests mounting it without core, and `files` shipping `dist/` only; and, as a rejected alternative worth remembering, the core-free shell described in the spec. Status and date lines per `.scratch/docs-structure/issues/03`.

**`packages/charts/package.json`.** `@umriss-ui/core` and `@umriss-ui/demo` as `devDependencies` (`workspace:*`), exactly as `packages/table` has them. `dependencies` and `peerDependencies` are not touched.

Nothing in `demo/` changes yet. This ticket makes the next four possible and is independently reversible.

## Acceptance

- `pnpm lint` is green, and a deliberate `import { Button } from "@umriss-ui/core"` inside `packages/charts/src/` still fails it.
- The same import inside `packages/charts/demo/` passes.
- `packages/charts/package.json` names core in neither `dependencies` nor `peerDependencies`; `pnpm pack --dry-run` in `packages/charts` lists `dist/` and `CHANGELOG.md` and nothing from `demo/`.
- ADR-0020 exists and names the four replacement checks.
- No comment in `eslint.config.js` claims the demo is bound by R-1.2.
