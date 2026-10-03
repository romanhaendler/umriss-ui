# The site renders the workspace's own documents

Status: accepted
Date:   2026-10

The site documented components and nothing around them. What a developer needs
to understand the library as a whole - the design language, the industrial
standards umriss follows and where it departs, what it deliberately does not
build - stood only on GitHub, in markdown files a visitor of the site never
found. Every component page ended its "Known limits" with a link to ADR-0032,
which dropped the reader out of the site onto a GitHub blob. `docs/README.md`
ruled out "a documentation website beside the demos" and left a site that
hosts the workspace's prose to "a product decision with a spec of its own"
(`.scratch/concepts-and-changelog-pages/spec.md` is that spec).

**The pages build renders a fixed list of the workspace's own markdown
documents as pages of the same site, from their files, at build time.** The
list stands in one place (`packages/demo/src/tooling/documents.ts`): the design
language at `/design-language/`, the standards at `/standards/`, ADR-0032 at
`/what-umriss-ui-is-not/`. A page wears the front page's layout - header,
theme, type and token colours - around a reading column; its h1 is the
document's first heading, its description the first paragraph. A relative link
to another rendered document becomes that document's address on the site, a
link to any other file of the repository its address on GitHub, and a link to
a file that does not exist fails the build. No rendered output is checked in.

This is not the "website beside the demos" `docs/README.md` rules out. That
rule is against a second text: a description that is written once more,
somewhere else, and drifts from the first within a month. A rendered document
has no second text - the markdown in the repository is read when the site is
built, so the page cannot say anything the file does not. "No prose copy of the
demos" stands unchanged.

ADR-0032 is the one ADR on the list, because it is the one written for
callers: it answers "not yet, or never?" for a reader deciding whether to use
umriss. The other ADRs, the journal, `CONTEXT.md` and the contributor documents
are written for the people who change the code, and stay on GitHub.

## Alternatives that were real

**Leave the documents on GitHub and link them.** It is the state this replaces:
the site has reference and how-to, and the explanation a reader needs to
judge the library lies one context switch away, in a file viewer built for
code, and every page's "Known limits" sends the reader out of the site.

**A documentation site of its own** - Docusaurus, VitePress, Starlight - beside
the demos. A second build, a second look and a second navigation for three
documents, and a standing invitation to write the components' documentation
there too, which is exactly what "no prose copy of the demos" forbids.

**Copy the documents into the demos' outlines as pages.** The text would then
exist twice, once in `docs/` and once as outline prose, and one of the two
would be stale by the next release.

**Render every markdown file of the repository.** The contributor documents
speak to someone changing the code - specs under `.scratch/`, test conventions,
the release procedure - and on the site they would answer questions no
caller asks while burying the three that matter. A list, extended one line at a
time, keeps each document's presence a decision.

## Consequences

- Adding a document to the site is one line in the list and a decision to
  make; a document not on the list is not on the site, whatever it links.
- Renaming or moving a rendered document, or a file one of them links, is
  caught by the build, not by a reader.
- A link to ADR-0032 anywhere on the site - the "Known limits" of every
  component page, each mention of its number - leads to its page on the site;
  the built-site guard fails on a page that links it on GitHub.
- The documents are written for two readers now: GitHub renders them as
  before, the site renders them in its own dress. A document keeps to plain
  markdown - relative links, headings, tables, code - and gains no markup only
  one of the two understands.
