# The documentation runs where the code is, at its version

Status: ready-for-agent
Date:   2026-10-25
Origin: request by the user, 25 Oct 2026: take the GitHub Pages site down -
no website that would need an imprint (Impressum), legally on the safe side -
and give instead a documentation site that runs locally, with a README good
enough to see what umriss-ui is without it. The form was left to the agent.

## Problem Statement

The documentation of umriss-ui is a public website on GitHub Pages
(`romanhaendler.github.io/umriss-ui/`), built and deployed on every push to
`main`. A public website run by a person in Germany raises the question of an
imprint and of everything that hangs on it; the user does not want to publish
one and does not want to carry that risk. The site is also only ever the
documentation of `main`: whoever installed `0.39.0` reads pages describing
`0.41.0` or something not released yet, with no way to see their own version.

## Solution

There is no hosted documentation any more. The demos - the documentation of
the components, with the front page and the rendered documents (ADR-0046) -
are built and served on the reader's own machine with one command,
`pnpm docs`, from a checkout of the repository. Checked out at a release tag
(`core-v0.41.0`), the reader sees exactly the documentation of that version;
on `main` they see what comes next.

The repository's README becomes the place that shows what umriss-ui is before
anyone runs anything: the packages, a picture of each demo in light and dark,
and the three commands that open the documentation of a chosen version. Every
package README on npm points there and at the Markdown documentation that
already travels inside the package (`docs/llms-full.md`), which is version-exact
by construction.

The GitHub Pages workflow, everything that existed only for search engines and
link previews, and every live reference to the hosted address are removed. The
Pages site itself is switched off in the repository settings, by the user.

**Why this form and not another** (the decision the user delegated):

- **`pnpm docs` from a checkout** (chosen): no new artifact, no hosting, the
  version is the tag, the build is the one that exists. Cost: a clone and an
  install.
- **A published `@umriss-ui/docs` package run by `npx`**: one command, no
  clone - but about 26 MB per version on npm, an eighth package in the release
  and in Trusted Publishing, and a first publish that needs the user by hand.
  Kept as a possible follow-up (Further Notes).
- **The built site inside every package's tarball**: every install would carry
  the documentation of all six packages; rejected.
- **A zipped site attached to a GitHub Release**: the publish workflow sets
  tags and creates no releases, and a downloaded site still needs a server for
  its absolute paths; rejected.

## User Stories

1. As the maintainer, I want the GitHub Pages site gone, so that I run no public website that would need an imprint.
2. As the maintainer, I want no workflow that deploys a site, so that a push to `main` can never put the site back.
3. As the maintainer, I want to know exactly which settings I have to change by hand, and in which order, so that the site is really off and not merely no longer updated.
4. As the maintainer, I want the npm pages of the packages to stop pointing at the old address with the next release, so that no visitor follows a dead link from the current version.
5. As the maintainer, I want a test that fails when a live file names the old hosted address again, so that it does not creep back through a copied paragraph.
6. As the maintainer, I want the history - changelogs, journal, research, ADRs - left as it was written, so that the record stays truthful.
7. As the maintainer, I want the decision written as an ADR, so that the next agent does not rebuild a hosted site or a search-visibility effort.
8. As a developer evaluating umriss-ui on GitHub, I want the README to show each package with a picture of its demo, so that I can judge the look without running anything.
9. As a developer evaluating umriss-ui, I want the pictures to follow my light or dark GitHub theme, so that I see the theme I read in.
10. As a developer evaluating umriss-ui, I want three copy-paste commands that open the full documentation locally, so that I can try it in a few minutes.
11. As a developer evaluating umriss-ui, I want the README to say which Node and pnpm versions the command needs, so that it does not fail on my machine for a reason I have to guess.
12. As a developer evaluating umriss-ui, I want `pnpm docs` to print the address and say when it is ready, so that I know where to open it.
13. As a developer using umriss-ui at a given version, I want to open the documentation of exactly that version, so that every prop and example I read exists in what I installed.
14. As a developer using umriss-ui, I want the README to say which tag belongs to my version, so that I do not have to work out the tag scheme.
15. As a developer using umriss-ui, I want to know that `main` documents what is not released yet, so that I do not mistake an unreleased prop for one I have.
16. As a developer reading a package's README on npm, I want it to tell me how to open the documentation of this version, so that I am not sent to a site that is gone.
17. As a developer reading a package's README on npm, I want it to name the Markdown documentation inside the package, so that I can read the docs of my version without cloning anything.
18. As a developer on the local site, I want every page, example, props table, search (⌘K), API index, changelog page and rendered document to work as they did online, so that nothing is lost by running it locally.
19. As a developer on the local site, I want links between packages and to the rendered documents (ADR-0032, the design language, the standards) to stay inside the local site, so that I am never sent to the old address.
20. As a developer on the local site, I want links to other repository files to go to GitHub, so that I can still read an ADR that is not rendered.
21. As a developer, I want `pnpm docs` to build the site every time it runs, so that after checking out another tag I never see the documentation of the previous one.
22. As a developer, I want `pnpm docs` to stop with a clear message when the port is taken, so that I am not left with a silent failure.
23. As a coding agent working in an application that uses umriss-ui, I want the skill to point me at `docs/llms-full.md` in the installed package, so that I read the documentation of the version in the lockfile.
24. As a coding agent, I want the packaged `llms-full.md` to contain no links to a hosted site, so that every link I follow resolves.
25. As a coding agent working in this repository, I want `docs/README.md` to say where the documentation is and how it is run, so that I do not cite a URL that no longer answers.
26. As a contributor, I want the dev servers (`pnpm dev:<package>`) to stay as they are, so that working on one demo does not need the whole site.
27. As a contributor, I want the built-site guard to keep checking every page, so that a broken local site is caught by the build as the hosted one was.
28. As a contributor, I want the screenshot suites unchanged, so that no baseline moves for a change that is not visual.
29. As a contributor, I want the command that builds the site named for what it builds, not for a host it no longer serves, so that its name does not mislead.
30. As a contributor, I want `pnpm previews` to keep renewing the demo pictures from the built site, so that the README's pictures can be renewed by one command after a scenario changes.
31. As the maintainer, I want the open search-visibility work closed, so that nobody registers the old site with Search Console after it is gone.

## Implementation Decisions

- **No hosted site.** The Pages workflow is deleted. Nothing in the repository
  deploys the site anywhere.
- **One command, `pnpm docs`.** It builds the site (the existing build of
  ADR-0037 and ADR-0046, unchanged in what it renders) and then serves the
  built directory on a fixed local port at the site's path, printing the
  address. It always builds; it never serves a site built from another
  checkout. The server comes from what is installed - Vite's preview server if
  it serves the site's directory pages and Markdown twins as they are, else a
  few lines of `node:http` - and adds no dependency. `/` answers with the
  site's front page or forwards to it. A taken port is an error with the port
  named, not a silent fallback.
- **The build command is renamed** from `build:pages` to `build:site`, with
  every mention in comments, test skip messages and documents. `pnpm docs` is
  the entry for readers; `build:site` is for contributors and for
  `pnpm previews`.
- **The site's address no longer comes from the manifests.** Today the site's
  root is derived from each package's `homepage`, and so is every absolute URL
  the site and the Markdown outputs write. The site's base path is kept as it
  is (`/umriss-ui/<package>/`, so the demos' builds, the forwarders and the
  document links do not move) and is stated once in the demo shell's package
  list, read by the build, the llms generator and the built-site probes alike.
  Nothing that is generated names a host: links inside the site are
  path-absolute; links the outlines spell out to the old address (the
  ADR-0032 page constant, the charts' link to core's Language page) become
  site addresses.
- **The packaged `llms-full.md` resolves on its own.** It travels inside each
  npm package and is read without any site: a link from one page to another
  inside it points into the same file, and a link to anything else points at
  GitHub. No link in it names a local or a hosted site address.
- **Each manifest's `homepage`** becomes the package's README on GitHub. The
  `repository` and `bugs` fields stay.
- **What existed only for search engines and link previews goes:** the site
  verification file and its copy step, the Open Graph tags and the share
  picture. The sitemap and the canonical links stay only if they are what the
  built-site guard takes its inventory of addresses from; removing them is not
  a goal of this work, rewriting the guard for it is not either.
- **The README of the repository** gets a section "See it running" high up,
  above the quick start: each package with its demo's picture, light and dark
  following the reader's GitHub theme, from the previews that are already
  checked in; then the commands - clone at the tag of a version (the tag
  scheme `<package>-v<version>`, all six sharing one number), `pnpm install`,
  `pnpm docs` - with the Node and pnpm versions they need; then what the
  documentation contains (today's paragraph "The demo **is** the
  documentation", kept). The "The demos" section loses the online links and
  the Pages sentence; the dev-server list stays, for contributors.
- **Each package README** replaces its "The demo: <online>" and "llms.txt
  <online>" lines with: the documentation of this version is
  `docs/llms-full.md` in the installed package, and the running documentation
  is opened as the repository README describes - an absolute GitHub link,
  because a relative one breaks on npm. The tag is written as a pattern, not
  as a number, so that no release has to touch it.
- **The skill** (ADR-0058) points at `node_modules/@umriss-ui/<package>/docs/llms-full.md`
  instead of the online `llms.txt` files. Its drift test stays a test of names.
- **The documents map** (`docs/README.md`): the row "how a component is used"
  names `pnpm docs` and the dev servers; the row "how a coding agent reads a
  package's documentation" names the packaged file and the local site's
  `llms.txt`; "What is deliberately not here" says there is no hosted site and
  why, and keeps "no prose copy of the demos". `docs/releasing.md` loses the
  Demos row and the sentence on how the demos reach GitHub Pages. The
  `.gitignore` comment on `site/` loses the workflow.
- **ADR-0065, "The documentation runs locally, at the version checked out"**:
  no hosted site, for the legal reason and for version-exactness; records the
  options above. It supersedes ADR-0037's hosting and search premise - the
  path addresses and the prerendering stay, because the page text, the twins,
  the search index and the shell's built-site probes are made from them - and
  names the consequences for ADR-0046 (the documents are pages of the local
  site) and ADR-0058 (the skill points at the packaged file). The ADR index
  gains the line; the superseded ADRs gain a "Superseded in part by" line and
  are otherwise left as written.
- **The open search-visibility work is closed:** its last open ticket
  (registering the site with the search consoles) is set to `wontfix` with a
  pointer to ADR-0065, and the folder is deleted, as a folder whose last
  ticket is closed is.
- **History stays as written:** changelog entries, the journal, the research
  under `docs/research/`, the archive and the ADRs' bodies keep the old
  address. The next release's changelog of each package says, once, that the
  documentation is no longer hosted, where the `homepage` now points, and how
  it is opened.
- **By the user, by hand, in this order** (a `ready-for-human` ticket):
  1. release the change (the next version, or a patch release), so that the
     npm pages of the current version show the new README and homepage;
  2. switch GitHub Pages off in the repository settings (Settings → Pages, or
     `gh api -X DELETE repos/romanhaendler/umriss-ui/pages`) - deleting the
     workflow does not take a deployed site down;
  3. delete the `github-pages` environment;
  4. remove the property from Google Search Console and Bing Webmaster Tools,
     optionally after requesting removal of the indexed addresses;
  5. confirm `https://romanhaendler.github.io/umriss-ui/` answers 404.
  Older versions on npm keep the old homepage and README; they cannot be
  changed, and lead to a 404 that hosts nothing.

## Testing Decisions

- **A good test here checks what a reader or an agent receives** - the built
  site, the files in a package, the files a visitor reads on GitHub or npm -
  never how the build is put together.
- **The built site is the main seam, and it exists:** the guard the site build
  runs over everything it wrote. It gains one rule: no file in the built site,
  HTML, Markdown twin, `llms.txt`, `llms-full.txt` or search index, names the
  old hosted address. Its existing rules - every page has a title, an h1, its
  links resolve, a link to a rendered document stays on the site - keep
  proving the local site whole. The unit tests of the site tooling and the
  documents (prior art: the existing `site` and `documents` unit tests of the
  demo shell) change only where they spell the old address.
- **One repository test** (prior art: the skill's drift test, which reads a
  repository file and checks it against the exports) reads the tracked live
  files - manifests, READMEs, the skill, `docs/README.md`, `docs/releasing.md`,
  the demo sources and outlines - and fails on any mention of the hosted
  address. Changelogs, the journal, `docs/research/`, `docs/archive/`,
  `docs/adr/` and `.scratch/` are excluded by name, as history.
- **The packaged documentation** is checked where packages are already checked
  before publishing (`check:dist`): the packed `llms-full.md` names no hosted
  address.
- **`pnpm docs` itself** is checked by running it once: the front page, a
  component page two levels deep, a Markdown twin and a rendered document load
  at the printed address, and an unknown path answers 404. If the server is
  hand-written rather than Vite's, one small unit test starts it on a free port
  over a temporary directory and checks exactly those four answers.
- **The screenshot suites are not touched:** they build each demo with the
  default base and never see the site. `pnpm check` and `pnpm check:site` stay
  green; the shell's built-site probes still run after `pnpm build:site`.

## Out of Scope

- An `npx`-run or otherwise published documentation package.
- Any other hosting - an own domain, Netlify, Vercel, a different static host.
- Removing the prerendering, the path addresses, the forwarders for old hash
  addresses, the sitemap or the canonical links; they cost nothing locally and
  the guards are built on them.
- Changing what the site renders or how it looks.
- Rewriting history: old changelog entries, the journal, research and ADR
  bodies.
- Changing the README and homepage of versions already on npm.
- A version picker inside the site; the version is the checkout.
- Legal advice: this removes the hosted site; whether the GitHub repository or
  the npm pages themselves need an imprint is not answered here.

## Further Notes

- If evaluators ask for docs without a clone, the `npx` package is the next
  step: the built site plus a small static server, versioned with the others,
  run as `npx @umriss-ui/docs@<version>`. It needs a first publish by the user
  before Trusted Publishing can take over.
- The legal motive is the user's own judgement; the spec takes it as given.
- The six packages share one version number (from `0.34.0`, the dashboard
  from `0.40.0`), so any package's tag opens the whole site at that version;
  the README may say so and show one tag.
