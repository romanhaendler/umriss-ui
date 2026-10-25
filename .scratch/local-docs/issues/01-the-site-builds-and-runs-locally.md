# The site builds and runs locally, at one address

Status: ready-for-agent
Spec: `.scratch/local-docs/spec.md` (Implementation Decisions: one command, the build rename, the site's address, the packaged `llms-full.md`, `homepage`, what existed only for search engines; Testing Decisions)

## What to build

The code half of the spec. Everything that reads a package manifest's
`homepage` to know where the site is reads the one constant
`http://localhost:4170/umriss-ui/` from the demo shell's package list instead.
`pnpm start` builds the site and serves it there; `build:pages` becomes
`build:site` (script file renamed to match). The site verification file and the
Open Graph tags go; the share picture stays as the front page's collage
(`scripts/collage.png`). No generated output - the built
site, the generated `llms.txt` / twins / `llms-full.md` - names
`romanhaendler.github.io`; the packaged `llms-full.md` names no site address at
all. Each manifest's `homepage` becomes
`https://github.com/romanhaendler/umriss-ui/tree/main/packages/<dir>#readme`.

## Files (this ticket only)

`package.json` (root scripts), `scripts/` (the site build, `previews.mjs`,
`check-dist.ts`, the verification file, the share picture, a docs server if
one is written), `packages/*/package.json` (`homepage` only),
`packages/demo/src/**` (package list, tooling, outline, comments naming the
build), `packages/charts/demo/outline.ts`, `packages/demo/checks/shell.ts`,
`packages/demo/tests-unit/**` where a test spells the old address or the old
command. Not the READMEs, `docs/`, the skill or `.github/` - ticket 02 has
those.

## Acceptance criteria

- [ ] `pnpm build:site` writes `site/`, its guard passes, and the guard has a rule that fails on `romanhaendler.github.io` in any file it wrote
- [ ] `pnpm start` builds, then serves at `http://localhost:4170/umriss-ui/`: front page, a component page, a `.md` twin and a rendered document answer 200, an unknown path 404, `/` reaches the front page; a taken port is an error naming it; no new dependency
- [ ] `check:dist` fails when a packed `llms-full.md` names a site address; links between pages inside it point into the file, other links keep only their text or go to GitHub
- [ ] no `og:` tags, no verification file in `site/`
- [ ] `pnpm check demo`, `pnpm check:site`, `pnpm typecheck` green; the shell's built-site probes still find the site
- [ ] `grep -r "github.io" scripts packages --include=*.ts --include=*.tsx --include=*.mjs --include=*.json` (outside `node_modules`, `dist*`, changelogs) finds nothing

## Blocked by

None
