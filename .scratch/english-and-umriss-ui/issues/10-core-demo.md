# 10 — The `core` demo

Status: done
Type: task

Blocked by: 05, 07, 08

Spec: `.scratch/english-and-umriss-ui/spec.md`

## Scope

86 files. Second wave: needs the shell (05) for its imports and both component tickets (07, 08) for the names it demonstrates.

- `Anwendung.tsx` → `App.tsx`, `gliederung.ts` → `outline.ts`, `beispiele.ts` → `examples.ts`, `props.ts`.
- `demo/beispiele/` → `demo/examples/`, and **every example filename**: `01-toene.tsx` → `01-tones.tsx`, `02-groessen.tsx` → `02-sizes.tsx`, `03-laden-und-sperre.tsx` → `03-loading-and-disabled.tsx`, and so on through all 70. The numeric prefix is the ordering and stays.
- `demo/warum/` → `demo/why/` (13 files) — these are the "why it is like this" pages and are dense German prose. Translated in full: they are the same kind of reasoning as the source headers.
- The outline's German copy: every page's `satz` (the one-line description in the sidebar and the page head) and the rubric names — `fundament` → `foundation`, `formulare` → `forms`, and the rest.
- **Addresses do not change.** They are already single-segment English component names (`#/button`), and `CONTEXT.md` argues under "Rubric" that the rubric must stay out of the address. Nothing here touches that.

Visible text in examples changes as a consequence, which will move baselines. Do not update them.

## Acceptance

- `pnpm --filter @umriss-ui/core typecheck` and `test:unit` pass; `pnpm lint` clean.
- `pnpm --filter @umriss-ui/core props` regenerates without a diff beyond the renames.
- No German filename, identifier or visible string remains under `packages/core/demo`.
- The generated props tables carry English type and export names.
