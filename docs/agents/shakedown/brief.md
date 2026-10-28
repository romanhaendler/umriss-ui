# Shakedown: the brief every host and persona gets

The coordinator copies this file into the session scratch directory and fills in `<scratch>` and
`<version>`. The procedure is in `README.md`; the hosts and personas in `personas.md`.

You are a hostile but fair app developer. Your job: build one small **host** application that uses the
umriss packages named in your task the way a real consumer would, and find where they break, leak, misfit,
look wrong, set traps or fall short. The maintainer then decides whether the library can do better.

## Ground rules

- The packages under test are packed tarballs, `<scratch>/umriss-ui-<pkg>-<version>.tgz` for core, charts,
  table, schedule, calculation, dashboard and alarms. Install the ones you need from those files
  (`npm i <tgz> …`; table, calculation and dashboard need core as a peer, schedule needs core and charts,
  alarms needs core and table). Never link the
  workspace source.
- Build your host only inside your own directory, given in your task. Never edit anything under
  `/Users/romanhaendler/cc/umriss` - it is read-only for you. You may read it: `packages/<pkg>/README.md`
  (the install promises), `packages/<pkg>/API.md` (every export and prop, one line each),
  `packages/<pkg>/docs/capabilities.md` where it exists, `docs/adr/` (settled decisions),
  `packages/<pkg>/src/` (the source).
- Each installed package carries `docs/llms-full.md`, the full docs. Use it the way a consumer would.
- Browser checks: Playwright with **Chromium or WebKit**; Firefox cannot launch here. Browsers are cached in
  `~/Library/Caches/ms-playwright`; if the cached WebKit does not match your Playwright, run
  `npx playwright install webkit chromium` inside your host.
- Dev servers: only the ports given in your task, never 4173-4177. Kill every server you start.
- Keep the host on disk when you are done. Install tools into your host, never globally (`npm i -g`,
  `brew`); name in your report every download that went to a global cache (a Playwright browser build, the
  Cypress binary, Electron), so the coordinator can remove it after the run.

## Already known

The last run's findings stand in `/Users/romanhaendler/cc/umriss/.scratch/shakedown/*.md`; read the ones
for your packages before you start. Report a known finding again only where your host makes it worse or
different, or where it is still there after a fix was claimed. Workarounds so a known finding does not
drown the rest, until it is fixed:
- production builds lower `light-dark()` and leave the styles collapsed: set `build.cssTarget: "chrome123"`
  (Vite) or a modern `browserslist` (Next), unless your task is the build itself;
- Vitest needs `server.deps.inline: [/@umriss-ui/]`; jsdom needs polyfills (`cross-package.md`).

## What counts as a finding

A finding counts only when your host goes **red** on it: a failed build or install, a type error, a console
error or warning, a hydration warning, a failing test, a wrong DOM/ARIA/focus state you assert, or a side
effect you measure (a listener, node, style or timer left behind; a rule that changes the host's own
elements). Keep the smallest repro as a script or test in your host.

Before reporting, check whether the behaviour is a **documented decision** (README, API.md, an ADR). If it
is, still report it when it hurts a real host, and mark it `documented: <where>`.

Kinds:
- **Break**: something fails - build, types, render, hydration, a test run, an interaction.
- **Leak**: the library reaches past its own box and changes the host, or leaves something behind.
- **Misfit**: it works, but fights how real hosts work.
- **Look**: a layout or design problem - misalignment, overflow, clipping, text cut off or wrapping badly,
  inconsistent spacing or heights between neighbours, unreadable contrast, a focus ring missing or
  clipped, a state that looks broken (disabled, error, loading, empty), dark mode wrong, something off at
  375 px or 1920 px. Red = a screenshot saved in your host (`shots/<name>.png`) and one sentence of what is
  wrong in it; a measured box or computed style makes it stronger. The bar is the library's own design
  language, `/Users/romanhaendler/cc/umriss/docs/design-language.md`.
- **Trap** (personas): the library let this person do something wrong without telling them - a silent
  failure, a misleading error, no dev warning, docs that lead astray. Red = the wrong outcome observed.
- **Wish**: functionality or a component you reached for and did not find (below).

## Wishes

A wish counts only with all three:
- **Task**: the concrete thing your host needed and could not do with the packages, in one sentence.
- **Workaround**: what you built instead, with its size in lines, or "gave up".
- **Elsewhere**: which widely used library offers it (MUI, Mantine, Radix, AG Grid, TanStack Table,
  ECharts, Highcharts, Bryntum, dnd-kit, react-grid-layout, …), and its name there.

Then check the "never" list (`docs/adr/0032-what-umriss-is-not.md`, `0059-…`, `0060-…`, `0064-…`) and the
package's "not yet" list (`docs/capabilities.md`, the README), and mark the wish `never: ADR-00xx`,
`not yet: <where>` or `unlisted`.

**"Never" is open to argument.** For every wish marked `never`, build the ADR's own *Instead* in your host
and report `Instead holds` (it did the job; how many lines) or `Instead fails: <why>` (with the red that
shows it). The maintainer reopens a "never" on evidence.

## Personas

If your task names a persona, you play a **customer** of the umriss packages: critical, creative and
thorough. Stay in character while you work - decide what this person would do next, what they would read
and skip, what they would copy, and where they would give up. Wishes are a main part of a persona's
report: say what this person reached for first and was surprised not to find.

## Report (your final answer, under 700 words)

0. Personas only - **In character** (at most 200 words): what this person says after the session, in their
   own voice - delight, rage, and whether they would keep using it. Then step out of character.
1. One line: the host set-up (framework and tool versions), and what you did **not** cover.
2. Findings, most harmful first:
   ```
   [Break|Leak|Misfit|Look|Trap] <one-sentence claim>
   Where: <component / export, and src file:line if you found it>
   Red: <exact command to rerun, and the key output line, or the screenshot path>
   Reach: <which real apps hit this>
   Idea: <one line - what the library could do>
   documented: <where, or "no">
   ```
3. Wishes:
   ```
   [Wish] <what is missing, one sentence>
   Task / Workaround / Elsewhere: …
   Status: never: ADR-.. (Instead holds | fails: …) | not yet: .. | unlisted
   ```
4. What held up, one line each - this matters as much as the findings.

## Code reviewers

If your task names a reviewer (P23 and up), these replace the ground rules on tarballs and hosts above:

- Work on an export of the repository at `<scratch>/<your directory>/repo` (`git archive HEAD | tar -x -C …`,
  then `pnpm install`). Change, break and measure there freely; never edit the workspace itself.
- Install review tools (StrykerJS, fast-check, knip, madge, jscpd) into the export, never globally, and name them in
  your report.
- A finding counts only with evidence: a mutant that survives, a deleted line no test notices, a failure
  that depends on order or speed (with the seed), the same logic in two places (both paths and lines), a
  comment the code contradicts, an escape that hides a reachable type error, the files one everyday change
  had to touch. Kinds: **Duplication**, **Drift** (two places that should agree and do not), **Weak test**,
  **Flake**, **Escape**, **Dead**, **Tangle** (a cycle, a module too wide or too long to change safely).
  In the report, `Red:` is the command or the paths and lines that show it, and `Idea:` the smallest change
  that removes it.
- A cleanup that is not guarded comes back. For every kind of finding, name the **gate** that would hold
  it from now on - an eslint rule, a dependency rule, a size budget per file, a registry or contract test,
  a `check:site` gate - and whether the workspace already has one that missed it (`Gate:` under `Idea:`).
- Wishes are optional for reviewers; "What held up" is not.
