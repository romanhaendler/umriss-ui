# 03 — Package scaffold

Status: done

Spec: `.scratch/umriss-table/spec.md` · ADR-0016

## Scope

- `packages/table` modelled on `packages/charts`: `package.json` (`@umriss/table`, `0.1.0`, peers `react`, `react-dom`, `@umriss/ui`), library build with type declarations, `tsconfig`, vitest, `CHANGELOG.md`, an empty public entry.
- Root: `lint` covers the new package; a `dev:table` script once a demo exists (not now).
- ESLint: `@umriss/charts` and `@umriss/ui` may not import `@umriss/table`; `@umriss/table` may import `@umriss/ui` only through its public entry (no `@umriss/ui/*`, no relative path into `packages/ui`).
- Documents that count the packages: `CLAUDE.md`, `docs/agents/domain.md`, the opening sentence of `CONTEXT.md`.

## Acceptance

- `pnpm build`, `pnpm typecheck`, `pnpm test:unit` and `pnpm lint` are green across the workspace.
- A forbidden import in each direction fails lint (verified once, not committed).

## Comments

- `packages/table`: `package.json` (`@umriss/table` 0.1.0; peers `@umriss/ui` as `workspace:^`, `react`, `react-dom`; no runtime dependencies), `vite.config.ts` (library build, `@umriss/ui` external like React), `vitest.config.ts` (jsdom, the same time zone as `@umriss/ui`), `tsconfig.json`, `tsconfig.build.json`, `CHANGELOG.md`, `tests-unit/setup.ts`, `src/index.ts`.
- **Typecheck and tests run against `@umriss/ui`'s source**, through a `paths` entry and a vitest alias pointing at `../ui/src/index.ts`. `dist/` is not checked in; a typecheck that needs a build first fails on a fresh clone. The build's declarations use `tsconfig.build.json`, without the path, so they refer to `@umriss/ui` as a caller installs it. The lint rule is what keeps imports on the public entry.
- Root `lint` covers `packages/table`. No `dev:table` script — there is no demo yet.
- ESLint: `@umriss/charts` and `@umriss/ui` may not import `@umriss/table`; `@umriss/table` may import neither `@umriss/ui/*` (except `@umriss/ui/styles.css`, the one export besides the entry), nor a path into `packages/ui`, nor `@umriss/charts`. Verified once with probe files in all three packages, then deleted: each forbidden import failed with its message, `@umriss/ui` and `@umriss/ui/styles.css` passed.
- `CLAUDE.md`, `docs/agents/domain.md` and the opening of `CONTEXT.md` count three packages.
