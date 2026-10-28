# Security hardening: the release path, the build tools and the DOM

Status: ready-for-human
Date:   2026-10-28

## Problem Statement

The maintainer wants the library to be as safe as it can be made, and to be able
to say so to the people who install it. The packages take no foreign runtime
dependency (ADR-0073), so what an application installs is only umriss, and
umriss's sources write no HTML into the DOM, evaluate no strings, filter the
breadcrumb's addresses and neutralise formulas in the CSV. That is the strong
half.

The weak half is everything around the sources. The workspace's development
tools bring roughly 750 packages into the lockfile, pnpm 9 runs their install
scripts, and the publish workflow installs and runs all of them in the same job
that holds the OIDC token npm trusts. One compromised development package can
therefore publish an umriss version under the maintainer's name, with valid
provenance. The workflows also name their actions by tag, which the actions'
owners can move. And nothing keeps the sources clean of DOM sinks except that
nobody has written one yet: no check fails the day someone does.

## Solution

Four changes, each closing one of these gaps:

1. **Publishing holds the token only where nothing foreign runs.** The publish
   workflow builds, checks and packs in one job without the token, and hands the
   tarballs to a second job that holds the token, installs nothing and only
   uploads them.
2. **Installing runs no stranger's script and takes no day-old version.** The
   workspace moves to the current pnpm major (at least 10.16), where install
   scripts run only for packages on an allowlist, and versions younger than a
   few days are not installed.
3. **Every workflow names its actions by commit.** Each action is pinned to a
   full commit SHA with its version as a comment, and Dependabot keeps those
   pins current, for GitHub Actions only.
4. **The sources are checked, not trusted.** Semgrep runs in CI over the seven
   published packages and the workflows and fails on any finding. Every demo
   page is opened under a Trusted Types policy, so any HTML sink in library
   code makes a check fail. The three escapers the library has (the
   breadcrumb's address filter, the CSV writer and the XLSX writer) are tested
   with hostile input.

## User Stories

1. As the maintainer, I want the job that holds npm's OIDC token to run no third-party code, so that a compromised development package cannot publish under my name.
2. As the maintainer, I want the tarball that is published to be exactly the one that passed lint, types, unit tests, the site checks and `check:dist`, so that what was checked is what ships.
3. As the maintainer, I want the publish job to run only after the build job succeeded, so that a failing check still stops a release.
4. As the maintainer, I want the tags `<dir>-v<version>` set and pushed as today, so that the release history keeps its shape.
5. As the maintainer, I want an existing version on npm still treated as "already published, only tag it", so that a push right after a release does not fail.
6. As the maintainer, I want the dependency order of publishing (core and charts before the packages that depend on them) kept, so that no package goes out before its peer.
7. As the maintainer, I want the publish workflow to keep its `contents: read` default and give `id-token: write` and `contents: write` only to the publish job, so that no other job can mint a token or push.
8. As the maintainer, I want `pnpm install` to run no package's lifecycle scripts unless that package is on an explicit allowlist, so that a new or changed transitive dependency cannot run code on my machine or in CI by being installed.
9. As the maintainer, I want the allowlist to hold only what the build actually needs, so that every exception is visible and justified.
10. As the maintainer, I want versions published less than a few days ago to be refused by `pnpm install`, so that a hijacked release is usually discovered and yanked before it reaches me.
11. As the maintainer, I want the pnpm upgrade to change no installed version beyond what the new major requires, so that the upgrade does not hide a dependency change.
12. As the maintainer, I want the `packageManager` field, the lockfile and CI to agree on one pnpm version, so that local and CI installs behave alike.
13. As the maintainer, I want every action in every workflow pinned to a full commit SHA, so that a moved or hijacked tag cannot change what runs.
14. As the maintainer, I want the version beside each pin as a comment, so that I can still read which release a SHA is.
15. As the maintainer, I want Dependabot to propose updates to those pins, so that pinning does not freeze me on old actions with known flaws.
16. As the maintainer, I want Dependabot limited to GitHub Actions, so that it opens no pull requests about npm packages (the workspace's development dependencies are updated by hand).
17. As the maintainer, I want Semgrep to run on every push to `main` and every pull request, so that a dangerous pattern is caught before release.
18. As the maintainer, I want Semgrep to fail the run on any finding, so that a finding cannot be ignored by scrolling past it.
19. As the maintainer, I want Semgrep to cover the sources of the seven published packages and the workflow files, so that both the shipped code and the release path are checked.
20. As the maintainer, I want Semgrep to run at a pinned version with pinned rule sets, so that a run's result changes only when the code or a deliberate update changes.
21. As the maintainer, I want an accepted Semgrep finding to be silenced at its line with a reason, so that every exception is a named exception in the sense of CONTEXT.md.
22. As the maintainer, I want the Semgrep job to have read-only permissions and no secrets, so that the scanner itself cannot become a way in.
23. As the maintainer, I want every page of every demo opened under a Content Security Policy that requires Trusted Types, so that any `innerHTML`-like sink reached in library code fails a test.
24. As the maintainer, I want that check to fail on any Trusted Types violation, not only on a thrown error, so that a sink swallowed by a try/catch is caught as well.
25. As the maintainer, I want the check written once in the demo shell's checks and called by each package's visual tests, like the silent-page and forced-colours checks, so that a new demo gets it by one call.
26. As the maintainer, I want the demo shell's own HTML (the highlighted source and the API tables) to go through one named policy that only the shell creates, so that the shell keeps working and the library still may not write HTML.
27. As the maintainer, I want the CSP to allow only that one policy name, so that library code creating its own policy also fails.
28. As the maintainer, I want the check to run in Chromium, so that it runs where Trusted Types are enforced and where the suite already runs.
29. As the maintainer, I want the check tagged `@quick`, so that `pnpm test:visual:quick <package>` runs it.
30. As an application developer, I want umriss to work under `require-trusted-types-for 'script'`, so that I can run my application under a strict CSP.
31. As an application developer, I want to read in the documentation that umriss writes no HTML and works under Trusted Types, so that I know it without testing it myself.
32. As an application developer, I want a breadcrumb entry with a `javascript:`, `data:` or `vbscript:` address to do nothing, however it is spelled (upper case, mixed case, leading whitespace or control characters, line breaks inside the scheme), so that an address from user data cannot run script.
33. As an application developer, I want breadcrumb entries with `http:`, `https:`, `mailto:`, `tel:` and relative addresses to work as before, so that the filter takes nothing legitimate away.
34. As an application developer, I want a CSV cell that a spreadsheet would run as a formula neutralised in all its spellings (leading `=`, `+`, `-`, `@`, tab, carriage return, and those after the quoting a separator forces), so that an exported file cannot run a formula on the person who opens it.
35. As an application developer, I want an XLSX cell starting with `=` to arrive as text, never as a formula, so that the XLSX export is as safe as the CSV.
36. As an application developer, I want an XLSX cell with `<`, `&`, `]]>`, control characters or lone surrogates to produce a file that opens, with the text intact where XML allows it, so that hostile data cannot break or inject into the workbook.
37. As an application developer, I want a sheet name with forbidden characters still to produce a valid workbook, so that a name from user data cannot break the file.
38. As the maintainer, I want the settings that only a person can make in the GitHub and npm web interfaces listed in this spec, so that I can do them once and know they are done.

## Implementation Decisions

**The publish workflow.**
- It splits into three jobs: `find` (unchanged), `build` and `publish`.
- `build` runs with `contents: read` only, outside the `npm` environment. It installs with the frozen lockfile, runs lint, typecheck, `check:site`, unit tests, build, and per package to be published `check:dist` and `pnpm pack` (pnpm packs because it rewrites the `workspace:` ranges). It uploads the tarballs as one workflow artifact.
- `publish` needs `build`, runs in the `npm` environment with `id-token: write` and `contents: write`. It checks out (for tagging), sets up Node 24 (npm ≥ 11.5.1 for Trusted Publishing), downloads the artifact, and for each package in the order `find` gave runs `npm publish <tarball> --tag <dist-tag>`, with the existing "already published → only tag" handling and the existing tagging. It does not set up pnpm, does not run `pnpm install`, and runs no `npm` command that installs.
- The tarball names come from the package name and version; the publish job finds each package's tarball from the directory list `find` produced, not by globbing every tarball, so the order stays the dependency order.
- The comment heading the workflow states the rule: the job with the token runs no third-party code.

**pnpm.**
- The workspace moves to the current pnpm major, at least 10.16 (where `minimumReleaseAge` exists). `packageManager` names it with its hash, as now.
- pnpm's settings go in `pnpm-workspace.yaml`: `onlyBuiltDependencies` lists exactly the packages whose install scripts the build needs (find them with `pnpm ignored-builds` after a clean install; if the build and the tests pass with none, the list is empty), and `minimumReleaseAge` is 4320 minutes (three days).
- The lockfile is regenerated only as far as the new major requires; a version change of any dependency in that diff is a fault of the upgrade.
- CI keeps reading the pnpm version from `packageManager` through `pnpm/action-setup`.

**Action pins.**
- Every `uses:` in `ci.yml`, `visual.yml` and `publish.yml` names a full 40-character commit SHA followed by `# vX.Y.Z`, the release that SHA is. The SHA is the one the release tag points to at the time of pinning, taken from the action's repository, not from a third party.
- A Dependabot configuration covers the `github-actions` ecosystem only, monthly, grouped into one pull request.

**Semgrep.**
- A job `semgrep` in `ci.yml` (or its own workflow beside it, whichever keeps `ci.yml` readable), on push to `main` and on pull requests, `permissions: contents: read`, no secrets.
- It runs Semgrep at a pinned version in its official container image, pinned by digest, offline from the Semgrep app (no login, no upload of results).
- Rule sets: `p/javascript`, `p/typescript`, `p/react`, `p/xss`, `p/secrets`, `p/github-actions`. They are fetched at the pinned Semgrep version; if the registry cannot pin them, the rule sets are vendored into the repo as YAML files and the job reads those, so a result changes only with a commit.
- Targets: `packages/{core,charts,table,schedule,calculation,dashboard,alarms}/src` and `.github/workflows`. Tests, demos, the demo shell and scripts are excluded (the demo shell's sinks are governed by the Trusted Types policy below).
- Any finding fails the job. A finding that is accepted gets an inline `nosemgrep: <rule-id>` with a reason on the same or preceding line; the first run's findings are each either fixed or accepted this way, nothing is excluded wholesale.
- The job is added to the checking list in CLAUDE.md under "Checking a change" only if it can be run locally in one command; otherwise CONTRIBUTING.md names how to run it.

**Trusted Types.**
- The demo shell creates exactly one Trusted Types policy, named `umriss-demo`, and passes every HTML it sets (the highlighted example source, the API index, the API and reference tables) through it as `TrustedHTML`. Where Trusted Types do not exist (other browsers, the unit tests' jsdom), the shell's helper returns the string unchanged.
- A new shared check `checkTrustedTypes({ open, pages })` in the demo shell's checks, beside `checkSilentPages`. For each page it serves the demo document with the header `Content-Security-Policy: require-trusted-types-for 'script'; trusted-types umriss-demo` (set by intercepting the document request in Playwright, so the demos' Vite configs and the dev server stay unchanged), opens the page, lets it settle, and fails if any `securitypolicyviolation` event fired or any console error names Trusted Types. The failure message names the page and the violated directive with its sample.
- Each of the seven packages gets a `trusted-types.spec.ts` in its visual tests that calls the check with all its pages, tagged `@quick`, Chromium only.
- Opening a page is not enough for a sink behind an interaction; the check opens each page's examples as the page renders them, which covers what is rendered on load. Interactions are covered by the existing interaction specs only where they run under the same header, which this spec does not add (see Out of Scope).
- The core README and each package's README (wherever the README states what a package installs, next to ADR-0073's claim) gains one sentence: umriss writes no HTML into the document and runs under `require-trusted-types-for 'script'`.

**Hostile-input tests.** No source change is expected; if a test fails, the escaper is fixed at the escaper, where all callers route through.
- Breadcrumb: rendered as an application renders it, an entry is followed through the folded menu (the path that navigates by script). Addresses that must do nothing: `javascript:alert(1)`, `JaVaScRiPt:…`, `" javascript:…"`, `"\tjavascript:…"`, `"java\nscript:…"`, `"\u0000javascript:…"`, `data:text/html,…`, `vbscript:…`. Addresses that must navigate: an `https:` URL, a `mailto:`, a `tel:`, a relative path, a fragment.
- CSV: the formula cases already tested stay; added are a formula after leading spaces, a formula whose text forces quoting (contains the separator or a line break), a full-width `＝`, and a label with each of these.
- XLSX: written through the public export and read back as the existing tests do: a cell `=1+1` is a string cell, not a formula; `<`, `&`, `"`, `]]>` survive as text; control characters below U+0020 other than tab, LF, CR and lone surrogates do not make the XML invalid; a sheet name made only of forbidden characters falls back to the default name.

**Settings only a person can make** (listed here, done by the maintainer, not by the agent):
- GitHub, environment `npm`: required reviewer is the maintainer; deployment branches limited to `main`.
- npm, each `@umriss-ui/*` package: publishing access "Require two-factor authentication and disallow tokens", so that only Trusted Publishing can publish.
- GitHub, branch `main`: protection with the CI and Semgrep checks required.
- GitHub, Actions settings: "Require actions to be pinned to a full-length commit SHA", if the account offers it.

## Testing Decisions

- A good test here checks behaviour from the outside: what a browser does when it opens a page under the policy, what a spreadsheet would read from an exported file, where a click on a breadcrumb entry goes. It never inspects how an escaper is written.
- **Trusted Types**: the shared check is the one test for every HTML sink; prior art is `checkSilentPages` and `checkForcedColours` in the demo shell's checks, each called from a one-file spec per package. Before relying on it, it is shown to fail once: a deliberate `innerHTML` assignment in one library component makes the check red, and the assignment is then removed (this proof is not committed).
- **CSV**: extends the existing CSV formula tests in the table's unit tests (prior art: the test that neutralises `=`, `+`, `-`, `@`, tab and carriage return).
- **XLSX**: extends the existing XLSX writer and export tests, which unzip the result and read it back (ADR-0073).
- **Breadcrumb**: extends core's existing breadcrumb unit test, rendering the component and following an entry; navigation is observed, not the filter function called.
- **Workflows, pnpm and Semgrep** carry no unit tests: their check is CI itself. The pnpm change is verified by `pnpm check` and `pnpm test:visual:quick` for every package after a clean install; the publish split by one run of the workflow with `workflow_dispatch` on a commit that publishes nothing (the `find` job reports every version as on npm, `build` and `publish` are skipped) and by reading the job graph; the next real release is the end-to-end test.

## Out of Scope

- Running the interaction tests (keys, overlays, exports) under the Trusted Types header. The page-load check covers what renders; an interaction-only sink is the Semgrep rules' to catch. Add it if a sink ever slips through.
- ESLint rules against DOM sinks: Semgrep covers them, and two tools for one rule is one too many.
- Semgrep over the demo shell, the tests and the scripts.
- Updating npm development dependencies automatically (Dependabot or Renovate for npm). They are updated by hand; `minimumReleaseAge` guards each update.
- Fuzzing frameworks or property-based test libraries; the hostile-input tests are lists of cases.
- A Content Security Policy for the hosted documentation site.
- Signing commits or tags.
- A `SECURITY.md` with a disclosure policy (worth doing; a separate, smaller change).

## Further Notes

- The reason for this order: the publish split closes the one path by which a stranger's code can release umriss; pnpm 10 and the release-age floor make that path rarer to reach in the first place; the pins close the same path through the actions; Semgrep and Trusted Types keep the sources as clean as they are now.
- Security cannot be guaranteed by any of this; what it gives is that every way in named above has a check that fails when it opens.
- The publish split changes a release-critical workflow. The memory "Release from a worktree job" still holds: the job prepares, the maintainer merges and pushes `main`. The first release after this change is watched in the Actions tab until both jobs are green.
- Trusted Types in WebKit: Safari has shipped them; the check stays in Chromium because the visual suite's Chromium project is the one every package runs.
