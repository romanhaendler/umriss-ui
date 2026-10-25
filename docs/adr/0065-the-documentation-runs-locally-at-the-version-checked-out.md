# The documentation runs locally, at the version checked out

Status: accepted, supersedes ADR-0037 in part (the hosting and the search premise), names the consequences for ADR-0046 and ADR-0058
Date:   2026-10

The demos were a public website on GitHub Pages, built and deployed on every
push to `main`. A public website run by a person in Germany raises the question
of an imprint, and the maintainer does not want to publish one. The site also
showed only `main`: whoever installed `0.39.0` read pages for `0.41.0` or for
something not released yet, with no way to see their own version.

**There is no hosted documentation. `pnpm start` builds the demos and serves
them on the reader's machine at `http://localhost:4170/umriss-ui/`; checked out
at a release tag (`<package>-v<version>`, all six packages sharing one number),
the reader sees exactly the documentation of that version.** The README of the
repository shows what umriss-ui is before anyone runs anything - a picture of
each demo, light and dark, and the three commands - and every package README
leads there by an absolute link. The Markdown documentation that travels inside
each package, `docs/llms-full.md`, is version-exact by construction.

- **What stays of ADR-0037:** the path addresses and the prerendering. The page
  text, the Markdown twins, the search index and the shell's built-site probes
  are made from them. What goes is the premise that a search engine must read
  the pages, and with it everything that existed only for search engines and
  link previews.
- **ADR-0046:** the rendered documents (the design language, the standards,
  ADR-0032) are pages of the local site; their links stay inside it.
- **ADR-0058:** the skill points at
  `node_modules/@umriss-ui/<package>/docs/llms-full.md`, not at online
  `llms.txt` files.
- **The site's address** is one constant, the local one; no file names the old
  hosted address, and a repository test fails when a live file does. History -
  changelogs, the journal, research, the archive, ADR bodies - keeps it.
- **Switching Pages off** is the maintainer's, by hand: deleting the workflow
  does not take a deployed site down.

## Considered Options

- **A published `@umriss-ui/docs` package run by `npx`.** One command and no
  clone, but about 26 MB per version on npm, an eighth package in the release
  and in Trusted Publishing, and a first publish that needs the maintainer by
  hand. A possible follow-up if evaluators ask for docs without a clone.
- **The built site inside every package's tarball.** Every install would carry
  the documentation of all six packages.
- **A zipped site attached to a GitHub Release.** The publish workflow creates
  no releases, and a downloaded site still needs a server for its absolute
  paths.
- **Another host** (an own domain, Netlify, Vercel). The imprint question is
  the host's, not GitHub's.

## Consequences

- Seeing a demo needs a clone, an install and a build; the README's pictures
  carry the first look.
- Older versions on npm keep the old `homepage` and README and lead to an
  address that hosts nothing.
- The search-visibility work (Search Console, Bing) is closed; nobody registers
  an address that is gone.
- `pnpm start` always builds, so after checking out another tag the reader never
  sees the previous one.
