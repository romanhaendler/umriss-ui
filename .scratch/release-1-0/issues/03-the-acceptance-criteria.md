# The acceptance criteria

Type:   grilling
Status: resolved
Blocked by: 12, 13

## Question

What is `1.0.0` measured by? A list a session can check without asking: which gates must be green
(`pnpm check`, the visual suite, Semgrep, `check:dist`), which browsers are named as supported and how each is
checked, what accessibility is promised, what the documentation must hold, and whether a last shakedown
against the candidate is one of the gates.

Fixed already by "How breaking changes reach 1.0": the maintainer's own applications run on the candidate
without one deprecation warning. Known from "Accessibility and browsers: claimed and checked": CI runs no
browser, Firefox runs nowhere though it is claimed, no conformance level is promised, no screen reader run is
recorded.

## Answer

The maintainer answered twelve questions (2026-11-23). `1.0.0` appears when all of this holds on the
candidate (the last `0.x` minor):

**Gates** *(agent)*
1. `pnpm check`, `pnpm check:site`, `pnpm typecheck`, Semgrep, `check:dist` and the full visual suite, light
   and dark, are green, run in a fresh worktree by the steps of `ci.yml`.

**Callers**
2. The maintainer's own applications run on the candidate without one deprecation warning.

**Browsers**
3. Chrome, Firefox and Safari stay promised. Each runs at least the `@quick` layout checks of all seven
   demos.
4. Those checks run in CI in the three engines. The full visual suite, with its baselines, stays local
   before a release.
5. The three floors are derived from what the source uses (`:has()`, `popover`, `@starting-style`, ...) and
   written wherever a floor is stated; the present "Firefox 120" is not taken on trust.

**Accessibility**
6. The documents state the aim and the check - built to WCAG 2.1 AA, checked with axe on every demo page -
   and declare no conformance. Axe runs on every page, not on a sample.
7. The muted text token reaches 4.5:1 and the list of tolerated colour pairs is empty. It changes the look
   everywhere: the maintainer sees before and after first.
8. One pass with VoiceOver in Safari over a written list, by the maintainer, its result recorded. That pair
   is the one named as checked; NVDA and JAWS are not.
9. Every open keyboard item of the shakedown records is fixed or expressly declined. Which still stand:
   "Which keyboard items of the shakedowns still stand".
10. The README says that right-to-left is not supported.

**Documents and demos**
11. `API.md` lists every member of the surface; no entry of `unshown.json` says "not shown yet"; the guide
    from `0.56.0` and a `SECURITY.md` exist.
12. The maintainer has looked through each of the seven demos on the candidate, light and dark, from
    prepared screenshots of every page; each finding is fixed or declined.
13. A small shakedown on the candidate, two tasks: build an application from the README and `API.md` alone;
    move a `0.56` application with the guide. Not the full set of personas.

**Housekeeping**
14. `.scratch/` holds this map only. The two tickets only a person can close are closed: the Search Console
    removal; the settings at GitHub and npm, with the Trusted Publisher of each package.
