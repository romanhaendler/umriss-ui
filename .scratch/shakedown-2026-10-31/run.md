# The weekend run: every ticket of this spec, unattended

Status: ready-for-agent

You coordinate an unattended run over `issues/01-…` to `issues/42-…` of `spec.md` beside this file. The
maintainer is away and trusts you: decide what a ticket leaves open yourself, write the decision into the
ticket's `## Comments`, and go on. Stop only for something destructive or irreversible.

## Before the first wave

1. Read `spec.md` (Decisions above all), `README.md` and `reds/README.md`. Read each ticket when you start it.
2. Keep the Mac awake for the whole run: `caffeinate -dims` in the background.
3. Schedule the hourly check (CronCreate, an off-minute): it finds tickets that stalled or aborted and
   resumes them. Delete it as the last step of the run.

## The loop

- **Frontier:** a ticket whose `Blocked by` tickets all carry `Status: done`. Lowest number first; 01 before
  anything else that waits on it.
- **Waves of at most five agents**, each in its own worktree (`isolation: "worktree"`), Sonnet; Haiku for a
  mechanical S ticket (docs, tokens, a small prop), Sonnet after two failed checks. Brief each worker with the
  ticket path, `spec.md`, the reds it names, and the rules below; nothing more.
- **Worker rules:** start from the red (the ticket's repro as a unit test or a `@quick` case); do not edit an
  existing test (exception: tickets 02 and 03 rename a deprecated prop in tests) - if one seems to need it,
  stop and report; no Playwright runs of the shared visual suite; `Changelog <pkg> <Added|Changed|Fixed>: …`
  and `Migration:` lines in the commit body, never `CHANGELOG.md`; finish with the ticket's checks plus
  `pnpm typecheck`; commit on the worktree branch.
- **Per finished ticket, you:** read the whole diff against the ticket's checklist; rerun its checks; for every
  visible change, start the demo on a free port, screenshot (both themes where colour changes, 375 px where
  layout does) and judge it as a user; then merge into local `main`, set the ticket `Status: done` with a
  short delivery note under `## Comments`, and start the next frontier ticket.
- A failure that is a timeout during a busy wave is rerun alone before it is believed.

## The release (after ticket 41, before 42)

The maintainer allowed it for this run (2026-10-31): release and push `main`.

1. On a quiet machine, ports 4173-4177 free: `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm build`,
   `pnpm check:site`, then `pnpm test:visual`; fix what fails; review every changed screenshot before
   updating it.
2. Release 0.52.0 of all seven packages as `docs/releasing.md` says: versions, each package's `CHANGELOG.md`
   from the commit bodies' `Changelog <pkg> …` and `Migration:` lines
   (`git log --format=%B <last release>..HEAD | grep ^Changelog`), the root README table; `pnpm -r check:dist`
   and `pnpm build:site` before the release commit.
3. `git fetch origin`, check `origin/main` is an ancestor of `main`, `git push origin main`. Then verify:
   `gh run list --repo romanhaendler/umriss-ui` (Publish waits for the maintainer's approval of the npm
   environment - that is expected, do not wait for it).
4. Then ticket 42 on `main`, merged and pushed too (it ships with the next release; no version bump).

## At the end

1. Write the run's report under `spec.md` `## Comments`: what was delivered per ticket, every decision you
   took alone, the release and its runs, what is left and why. Set `spec.md` to `Status: done` only if all 42
   are done.
2. Delete the cron job, stop caffeinate, remove the worktrees you merged.
