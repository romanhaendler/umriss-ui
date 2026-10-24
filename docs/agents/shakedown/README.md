# The shakedown

A **shakedown** puts the packed packages into applications someone else would build and tries to break them
there: in hostile set-ups (a foreign build tool, a CSS reset, a dialog library, a test runner) and in the
hands of customers who are not the maintainer (a beginner, a junior under deadline, a staff engineer, a
designer, an operator-screen developer). The workspace's own checks run against the source; this runs
against the tarball, in the consumer's toolchain, and finds what those checks cannot see.

Run it before a release that changes a dependency floor, a build tool or the styling, and otherwise every
few minors. The first run was 2026-10-24; its findings stand in `.scratch/shakedown/`.

## Steps

1. **Pack.** Build every package and `pnpm pack` it into a session scratch directory (never into the repo).
   Write `brief.md` there with the tarball paths filled in.
2. **Pick.** Take the hosts and personas from `personas.md` that the change touches; all of them for a full
   run. Each becomes one subagent with: the path to `brief.md`, its entry from `personas.md`, its own host
   directory under the scratch directory, and its own port range (`4300` upwards, ten per agent; never
   4173-4177, the demo servers').
3. **Dispatch in waves of at most eight.** The machine slows past that, and a timeout in a busy wave is
   rerun alone. Implementation-grade work, so the faster model is fine (see the user's memory). Keep the Mac
   awake (`caffeinate -i`) for the length of the run.
4. **Verify.** Every finding the coordinator reports as a defect is reproduced or confirmed in the source by
   the coordinating session itself, and marked ✓. A subagent's report is a lead, not a fact.
5. **Write down.** One file per package under `.scratch/shakedown/` (`core.md`, `table.md`, …) plus
   `cross-package.md`, `design-family.md`, `agent-docs.md`, `mobile-touch.md` and `wishes.md`, each with
   `Status: needs-triage`, the findings ranked, the wishes with their three proofs, and what held up. On a
   rerun, compare with the last run: what is fixed, what is new, what came back.
6. **Triage.** The files go through the issue tracker's triage (`docs/agents/triage-labels.md`); a fix
   starts from the host's red as its first test.
7. **Clean up.** Before the run, list what the global caches hold (`~/Library/Caches/ms-playwright`,
   `Cypress`, `electron`); after the last agent is done, delete only what the run added - extra Playwright
   browser builds, the Cypress binary, Electron downloads - and the hosts' `node_modules` in the scratch
   directory. The browser builds the repo's own Playwright needs stay (its `playwright-core/browsers.json`
   names them).

## Lessons from the first run

- Set `build.cssTarget: "chrome123"` (Vite) or a modern `browserslist` (Next) in every host except the one
  that checks the build itself, or the `light-dark()` collapse drowns everything else - until it is fixed.
- Playwright's Firefox does not launch in the job sandbox; Chromium and WebKit do. If the cached WebKit does
  not match the installed Playwright, `npx playwright install webkit chromium` inside the host.
- A persona that does not have to state wishes will not; ask for them explicitly (`brief.md`, "Wishes").
- Agents underreport what they skipped. The brief asks for "held up" and "not covered" lists; read them.
