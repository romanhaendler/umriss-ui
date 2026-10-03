# Spec: Every page as Markdown, and a "Copy page" menu

Status: ready-for-agent

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/ai-readable-docs/spec.md` (`llms.txt` and `llms-full.txt` per package, the full text in the npm package), `.scratch/search-visibility/spec.md` and ADR-0037 (every page a path, prerendered from the same text).
Blocked by: nothing.
ADR: none. This spec supersedes decision A3 of `ai-readable-docs` (an MCP server "if the full file passes ~200 kB"); the reason is given below and recorded there by a note under its Comments.
Tickets: `issues/01`–`03`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

A developer who works with a coding agent wants to hand the agent *one page* —
the Select page, with its examples and its props — and today cannot. The
choices are the HTML page, which an agent reads badly and which before the app
starts holds only the prerendered text, or `llms-full.txt`, which is the whole
package: 580 kB for core, 1.7 MB over the five. An agent that fetches 580 kB to
answer a question about one component spends its context on fifty other
components.

The ecosystem has settled this (`discoverability_interactivity`, §4):

- llmstxt.org proposes a clean Markdown version of each page at the page's
  address with `.md`, announced by `rel="alternate" type="text/markdown"`.
- Base UI links every page in its `llms.txt` as a `.md` URL; Mantine links
  per-page `.md` files; PostHog serves `.md` beside every docs page.
- A "Copy page" split button with "View as Markdown", "Open in Claude" and
  "Open in ChatGPT" has spread from PostHog and Fumadocs to small projects
  (ratatui, Warp Drive). All of it works on a static site: the files are
  written at build time and the "Open in" items are plain links.

umriss already writes exactly the right text — every page's part of
`llms-full.txt` is cut out for the prerendered HTML — and throws the Markdown
away after converting it.

The MCP threshold of `ai-readable-docs` measured the wrong thing. The size of
`llms-full.txt` matters only while it is the only way in; once every page is
its own `.md`, an agent fetches 5–20 kB, not 580.

## Solution

Every page of every demo gets a Markdown twin at its address with `.md`:
`/umriss-ui/core/select.md` beside `/umriss-ui/core/select/`, and
`/umriss-ui/core/index.md` for the scenarios page. The text is the page's own
part of `llms-full.txt`, cut at the same place the prerendered HTML is cut
from — one text, three media. The HTML page announces its twin in its head;
`llms.txt` links the twins instead of the HTML pages.

Every page head carries a **Copy page** split button. The main action copies
the page's Markdown to the clipboard. Its menu holds **View as Markdown**,
**Open in Claude** and **Open in ChatGPT**. No backend, no new service: the
`.md` is a static file, the "Open in" items are URLs with a prompt.

The MCP server stays out, and the reason changes: it comes when a user asks
for one, not when a file passes a size.

## User Stories

1. As a developer working with a coding agent, I want to copy the Select page as Markdown with one click, so that I can paste exactly that component's documentation into my agent's context.
2. As a developer, I want the copied text to contain the examples' source and the props tables, so that the agent sees what I see.
3. As a developer, I want "Open in Claude" to start a conversation that already points at the page, so that I can ask my question right away.
4. As a developer, I want "Open in ChatGPT" to do the same, so that I can use the assistant I already have.
5. As a developer, I want "View as Markdown" to open the raw file in a new tab, so that I can read or link what the agent will read.
6. As a coding agent, I want a `.md` address for every page, so that I fetch one component's documentation instead of the whole package.
7. As a coding agent, I want `llms.txt` to link the `.md` files, so that the index leads me straight to the text form.
8. As a coding agent arriving at an HTML page, I want a `rel="alternate" type="text/markdown"` link in its head, so that I can switch to the text form without guessing.
9. As a coding agent, I want each `.md` to name its package, version, and where the full text and the index stand, so that I know what version I am reading and where to look next.
10. As a coding agent, I want links inside a `.md` to be absolute, so that they still work after the text is copied out of its place.
11. As a coding agent, I want the scenarios page as a `.md` too, so that composed screens are reachable the same way as components.
12. As a maintainer, I want the `.md` cut from the same text as `llms-full.txt` and the prerendered HTML, so that the three can never say different things.
13. As a maintainer, I want the build guard to fail when a page has no `.md` or its head has no alternate link, so that a new page cannot ship without its twin.
14. As a maintainer, I want the menu to work in `pnpm dev` exactly as on the site, so that I can check it without building the pages.
15. As a maintainer, I want the `.md` files to stay generated and unversioned, so that nothing drifts.
16. As a keyboard user, I want the split button and its menu operable with the keys of core's menu, so that the menu is no exception in an accessible library.
17. As a screen-reader user, I want "Copy page" to announce that it copied, so that I know the action happened.
18. As a reader on a phone, I want the button to fit the page head without pushing the title, so that the head stays calm.
19. As a reader who never uses AI tools, I want the button small and quiet, so that it does not compete with the component.
20. As a developer navigating inside the app, I want the alternate link and the menu to follow the page I am on, so that I never copy the page I came from.
21. As a maintainer of the npm package, I want nothing about the shipped `docs/llms-full.md` to change, so that installed versions keep their text.
22. As a reader of the library's own showcase, I want the split button to be core's own `SplitButton` and `Menu`, so that the docs show the library at work.

## Implementation Decisions

**Addresses.** A page at `/<pkg>/<page>/` has its twin at `/<pkg>/<page>.md`;
the scenarios page at `/<pkg>/` has `/<pkg>/index.md`. The formats live where
the other address formats live — the outline's address functions — and
nowhere else.

**Content.** The `.md` of a page is that page's cut of the full text (the same
cut the prerendered HTML uses), with three differences:

- the heading levels are lifted so the page name is the document's `#`;
- a header block under it: a blockquote with the package name and version, the
  page's HTML address, and links to the package's `llms.txt` and
  `llms-full.txt`;
- every link is absolute; the "Demo page:" line stays (it is the HTML address).

The "every page" link list that the prerendered HTML appends for crawlers is
not part of the `.md`. The scenarios `.md` is the scenarios cut with the same
header. The text inherits every improvement of the full text automatically —
`props-to-examples`' "Shown in" lines, `types-without-holes`' definition
blocks — because it is the full text.

**Generation and serving.** The generator writes the `.md` files with its other
generated output; the pages build copies them into the site beside the HTML.
The dev server serves the same files at the same addresses, so the menu
behaves alike in development and on the site.

**The head.** Every prerendered HTML page carries
`<link rel="alternate" type="text/markdown" href="…/<page>.md">`. When the app
navigates, the shell updates that link together with the document title — in
the one place that follows navigation (introduced by `shell-across-packages`
for the title; if this spec lands first, it introduces that place and the
title joins it).

**`llms.txt`.** Each page line links its `.md` address instead of the HTML
address; the line's text stays. The site-wide `llms.txt` is unchanged apart
from the same switch. `llms-full.txt` and the npm package's `docs/llms-full.md`
are unchanged.

**The split button.** It sits in the page head, at the end of the rubric line
(the eyebrow above the title), so it shows on every page, including pages
without an import line, and moves nothing. It is core's `SplitButton`, small
size, plain variant.

- Main action **Copy page**: fetches the page's `.md` and writes it to the
  clipboard; the button's label turns to "Copied" (or "Failed", where
  there is no clipboard) for the same 1600 ms as the existing copy button, and
  the same word is put into a polite `role="status"` region of the page head,
  so that a screen reader hears it — the existing copy button only changes its
  label, which a screen reader does not reliably announce.
- Menu item **View as Markdown**: opens the `.md` address in a new tab.
- Menu item **Open in Claude**: opens `https://claude.ai/new?q=<prompt>` in a
  new tab.
- Menu item **Open in ChatGPT**: opens `https://chatgpt.com/?hints=search&q=<prompt>`
  in a new tab.
- The prompt, URL-encoded: `Read <absolute .md address> — the documentation of
  <Page name> in <package>@<version>. Then help me use it in my React app.`
  For the scenarios page, `<Page name>` is "the scenarios".

**MCP.** Not built. `ai-readable-docs` A3 is superseded: an MCP server becomes
a spec of its own when a user asks for one. A note saying so is appended under
that spec's Comments, and `docs/README.md`'s row on how a coding agent reads
the documentation names the `.md` twins.

## Testing Decisions

Tests assert what an agent fetches and what lands on the clipboard, not how
the cut is computed.

- **The llms generator's unit tests against the fixture package** (prior art:
  the llms tests that already check the cut of each prerendered page): every
  fixture page yields a `.md` whose body equals its cut of the full text after
  the lift; the header names package, version and both index files; links are
  absolute; the "every page" list is absent; the fixture's `llms.txt` links
  `.md` addresses.
- **The built-site guard** in the pages build: every sitemap address has its
  `.md` file, non-empty, starting with `# <page name>`; every HTML page's head
  has exactly one alternate link and it points at an existing file; every link
  in every `llms.txt` resolves to a file in the site.
- **The page suite in the browser** (prior art: the copy test that reads the
  real clipboard): "Copy page" puts on the clipboard exactly the text served at
  the page's `.md` address; after navigating to another page in the app, the
  alternate link and the copied text follow; the "Open in Claude" and "Open in
  ChatGPT" items carry the expected URLs with the encoded prompt; the menu
  opens and closes with the keys of core's menu.
- **Screenshot baselines** of the page heads move once, in the ticket that adds
  the button.

## Out of Scope

- An MCP server, agent skills, an "Ask AI" box, embeddings.
- Content negotiation by `Accept` header (GitHub Pages cannot vary on headers).
- A `.md` for the site's front page; it belongs to `site-front-page` (S1),
  which may add one through the same mechanism.
- Changing what the full text contains.
- Translations of the text.

## Further Notes

- Siblings: `shell-across-packages` (S2) owns the place that follows navigation
  in the head; `one-search` (S9) may index the same cuts; `concepts-and-changelog-pages`
  (S13) and `api-index` (S7) get their twins for free if they are written
  through the same generator.
- Sizes for orientation: core's full text is 580 kB, the five together 1.7 MB;
  a single component page is a few kilobytes up to the low tens.
- Acceptance:
  - every page and every scenarios page of the five demos is served as `.md`
    at its address, and the build fails if one is missing;
  - every HTML page announces its twin; `llms.txt` links the twins;
  - the split button copies exactly the served text, and its three menu items
    open the right addresses, in the demo and on the built site.
