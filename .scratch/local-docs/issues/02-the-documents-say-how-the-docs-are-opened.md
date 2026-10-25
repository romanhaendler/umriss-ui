# The documents say how the documentation is opened, and nothing names the old site

Status: ready-for-agent
Spec: `.scratch/local-docs/spec.md` (Implementation Decisions: the README of the repository, each package README, the skill, the documents map, ADR-0065, the search-visibility work, history stays; Testing Decisions: the repository test)

## What to build

The prose half of the spec, plus the repository guard. Names to use, fixed by
ticket 01: `pnpm docs` (builds and serves `http://localhost:4170/umriss-ui/`),
`pnpm build:site` (builds only), tags `<dir>-v<version>`, all six packages
on one number. Node 22 and pnpm 9 (via Corepack, `packageManager` in the root
manifest).

- Root `README.md`: the "See it running" section with the previews
  (`scripts/previews/<pkg>-light.png` / `-dark.png`, `<picture>` with
  `prefers-color-scheme`), the clone-at-tag / install / `pnpm docs` commands;
  "The demos" loses the online links and the Pages sentence.
- Each `packages/<pkg>/README.md`: online demo and `llms.txt` lines replaced as
  the spec says (absolute GitHub link to the root README section).
- `skills/umriss-ui/SKILL.md`, `docs/README.md`, `docs/releasing.md`,
  `.gitignore` comment.
- ADR-0065 plus its line in `docs/adr/README.md`; a "Superseded in part by
  ADR-0065" line on 0037, 0046, 0058, bodies untouched.
- Delete `.github/workflows/pages.yml`.
- `.scratch/search-visibility/`: delete the folder (its only open ticket is
  moot).
- A repository test beside `packages/demo/tests-unit/skill.repo.test.ts`: the
  tracked live files name no `romanhaendler.github.io`; excluded by name:
  `CHANGELOG.md` files, `docs/journal.md`, `docs/research/`, `docs/archive/`,
  `docs/adr/`, `.scratch/`.

## Acceptance criteria

- [ ] `README.md` shows six demo pictures that follow the GitHub theme and the three commands; the README of each package on npm leads to them by an absolute link
- [ ] the skill points at `node_modules/@umriss-ui/<package>/docs/llms-full.md`; its drift test passes
- [ ] ADR-0065 written; index and supersede lines in place
- [ ] no `pages.yml`, no `.scratch/search-visibility/`
- [ ] the repository test passes once ticket 01 is merged, and fails on a planted `romanhaendler.github.io` in a README
- [ ] `pnpm check demo` green

## Blocked by

None (the repository test is expected to fail on demo sources until 01 is merged)
