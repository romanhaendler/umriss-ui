# Discoverability, navigation and interactivity in UI library docs (state of 2026)

Scope: features that make a component library's docs explorable, for umriss-ui (React + TS, five packages, five prerendered static demo sites on GitHub Pages, one llms.txt per demo, English + German wording). Research done 2026-10-02 with about 20 search and fetch calls. Where a claim comes from background knowledge and was not checked in this session, it sits under Gaps or is marked as an inference.

## 1. Search: what works for a static, prerendered site without a backend?

### Takeaway
Two options fit GitHub Pages. **Pagefind** is fully static: it indexes the built HTML after the build, needs no server, returns section-level results and filters, and can merge several separately built indexes into one search. That last point fits five demo sites well. **Algolia DocSearch** is hosted and free for open-source docs, and now adds "Ask AI". It is the more polished choice but brings an outside dependency and a crawler schedule.

### Cited Findings
- Pagefind "runs after your static generator, and outputs a static search bundle to your generated site". No server is needed. A sample run indexed 2,496 pages and 22,852 words in 2.357 s into 27 index chunks — [Pagefind docs](https://pagefind.app/docs/)
- Pagefind's payload: "a full-text search on a 10,000 page site with a total network payload under 300kB, including the Pagefind library itself. For most sites, this will be closer to 100kB." — [pagefind.app](https://pagefind.app/)
- Pagefind features: section-level results (headings), custom metadata for tagging and sorting, "Zero-config support for multilingual websites", "Fine-grained configuration for the relevance of your content" (weighting), a "Rich filtering engine for knowledge bases or faceted search", multi-domain search, and indexing of JSON/PDF via Node and Python APIs — [pagefind.app](https://pagefind.app/)
- Pagefind v1.5.0 added a "Component UI" that "replaces the Default UI" and "includes a search modal, better accessibility and customization" — [Pagefind docs](https://pagefind.app/docs/)
- Filters are declared in markup with `data-pagefind-filter`. The value can come from an element's content (`<span data-pagefind-filter="author">bglw</span>`), from an attribute (`author[content]`) or be written inline (`author:value`). One page can carry several values — [Pagefind filtering](https://pagefind.app/docs/filtering/)
- Multisite: "Pagefind can be configured to search across multiple sites, merging results and filters into a single response", through `mergeIndex: [{ bundlePath: "https://docs.example.com/pagefind" }]` or `pagefind.mergeIndex(url)`. Options are `indexWeight` (ranking per index), `mergeFilter` (one filter per index, e.g. "package"), and `language`. Indexes on another origin need CORS headers — [Pagefind multisite](https://pagefind.app/docs/multisite/)
- Algolia DocSearch: "Free for open-source and technical docs", 9,000+ projects, a crawler that "automatically indexes your docs on a schedule", Ctrl/Cmd+K, WAI-ARIA compliant, a command-palette modal and a side-panel UI, recent and favourite searches, an MCP server for agents, and "Ask AI" ("Instant AI answers straight from your own docs" via Algolia Agent Studio). The stable version is 5.0.0 — [DocSearch](https://docsearch.algolia.com/)
- DocSearch v4 brought switching between keyword search and the conversational Ask AI mode, with source citations — [Algolia blog: DocSearch reimagined](https://www.algolia.com/blog/product/docsearch-reimagined); v4 is no longer maintained in favour of v5 — [DocSearch v4 docs](https://docsearch.algolia.com/docs/v4/docsearch/)
- Mantine shows a Ctrl+K search shortcut in its header — [Mantine Button docs](https://mantine.dev/core/button/)

### Inferences
- For umriss, Pagefind with `mergeIndex` is the most natural fit. Each of the five demos builds its own `/pagefind/` bundle, and each demo's search merges the other four, with `mergeFilter: { package: "table" }` and so on. The result is one search across all packages, faceted by package. If all five demos share the same GitHub Pages origin, no CORS setup is needed.
- Searching **props and examples, not just titles**: Pagefind indexes whatever HTML is prerendered. If the props tables and example code are in the static HTML (not loaded on the client after hydration), they become searchable for free. `data-pagefind-meta` / `data-pagefind-filter` can tag each page with a kind (component / guide / recipe) and a status (new / beta). Section-level results then point straight to a prop's anchor, provided each prop row has a heading or an id.
- DocSearch with Ask AI is the better choice only if a hosted AI answer box is wanted. It does not fit a "no server, no outside dependency" philosophy.
- Orama was not checked in this session (see Gaps).

### Gaps
- Orama (in-browser full-text and vector search) was not researched. Its current pricing and model for static sites are unverified.
- No benchmark comparing search *quality* between Pagefind and DocSearch was found.
- Whether Pagefind's Component UI has an exact Cmd+K binding by default was not confirmed in the fetched pages.

## 2. Navigation: sidebar, TOC and scroll-spy, prev/next, breadcrumbs, cross-links, status badges, versions, "since" info

### Takeaway
The 2026 baseline, which every docs framework now ships, is: a grouped sidebar, a right-hand "on this page" TOC with scroll-spy, prev/next links at the page bottom, Cmd+K search, and a dark mode toggle. Component libraries add per-component header links (Source / npm / Docs-as-markdown) and tabbed sub-pages (Usage, Props, Styles API). Status badges and "since" versions are common in mature libraries but were not verified page by page in this session.

### Cited Findings
- A Mantine component page has configurator demos, header links to "Source" (GitHub), the LLM docs and the npm package, a Props table section, a Styles API tab listing the inner elements ("root", "loader", "inner", "section", "label"), an on-this-page TOC with anchors (#usage, #full-width, #disabled-state), prev/next links (ActionIcon / CloseButton), a colour-scheme toggle, Ctrl+K search and "Expand code" on demos — [Mantine Button](https://mantine.dev/core/button/)
- Starlight's built-ins: "Site navigation, search, internationalization, SEO, easy-to-read typography, code highlighting, dark mode and more", plus frontmatter validated by TypeScript — [Starlight](https://starlight.astro.build/)
- Base UI's llms.txt sorts its pages into Overview / Handbook / Components / Utilities. That is a working sidebar taxonomy that separates guides ("Handbook") from reference ("Components") — [base-ui.com/llms.txt](https://base-ui.com/llms.txt)
- shadcn's Blocks page groups blocks into "Featured", "Sidebar", "Login", "Signup" with "Browse all blocks" — [shadcn blocks](https://ui.shadcn.com/blocks)

### Inferences
- Must-haves for a site that is "explorable": (1) an overview page of all components with a thumbnail of each (React Aria's "overview of all of the components and hooks" is an example of this, see §3); (2) a TOC with scroll-spy; (3) prev/next; (4) "Related" / "See also" links at the end of each component page; (5) header links to source, npm and `.md`.
- Status badges (new / beta / deprecated) and "since x.y" cost little when written as frontmatter. They help most after releases (umriss ships often: core 0.24, table 0.11…). A per-package changelog page with anchors per version can feed both.
- A version selector is YAGNI for a 0.x library with one live version. A "you are viewing docs for vX.Y" line in the header is enough.
- Cross-package navigation (the five demos) is umriss's special problem. One shared top-bar package switcher plus merged search (§1) matter more than any feature inside one package.

### Gaps
- Not verified this session: status badges in Starlight's sidebar, breadcrumbs in Docusaurus/Fumadocs, "since" badges in Mantine and MUI, and how Radix and Ark UI handle these. I know of them from background knowledge but did not fetch them.
- No source was found that measures the effect of breadcrumbs or prev/next on engagement in docs.

## 3. Interactivity: playgrounds, configurators, theme editors, density/RTL/locale switches, editable code, sandboxes, copy code

### Takeaway
The highest-value interaction is the **configurator demo**: a live component next to knobs (variant, size, colour, radius) whose generated code updates as you change them. Mantine makes this the core of every page. Editable code in the browser (Sandpack) and "open in StackBlitz/CodeSandbox" are common but cost more to maintain. MUI has had repeated breakage with sandbox exports and moved to StackBlitz WebContainers.

### Cited Findings
- Mantine's Button page has "Configurator demos with knobs" (Variant, Color, Size, Radius selectors) and live code beside each demo — [Mantine Button](https://mantine.dev/core/button/)
- Sandpack embeds live code editing. Its bundler "runs entirely in the browser — no external service is required for code execution", it can export to CodeSandbox in one action, its bundler can be self-hosted, and it ships a theme builder. Its building blocks are SandpackProvider, CodeEditor, Preview and Console — [Sandpack docs](https://sandpack.codesandbox.io/docs/)
  - Caveat: by default Sandpack loads its bundler iframe from CodeSandbox's CDN unless you self-host. The "no external service" wording above is the docs' own and refers to code execution, not to where assets are hosted. Treat it with care.
- MUI demo toolbar: a JS/TS source switcher, "Edit in Chat", and sandbox export that flattens a demo into `src/Demo` for StackBlitz and CodeSandbox — [MUI PR #48842](https://github.com/mui/material-ui/pull/48842). MUI moved to StackBlitz WebContainer sandboxes running real Vite apps, calling the old StackBlitz/CodeSandbox links "obsolete and too unstable" — [MUI PR #45924](https://github.com/mui/material-ui/pull/45924); for an example of the breakage, see [issue #42733 "CodeSandbox/StackBlitz broken for demos with relative imports"](https://github.com/mui/material-ui/issues/42733)
- MUI added StackBlitz/CodeSandbox buttons to its template cards too — [MUI PR #44253](https://github.com/mui/material-ui/pull/44253); Instructure UI replaced its CodeSandbox button with StackBlitz — [instructure-ui PR #2711](https://github.com/instructure/instructure-ui/pull/2711)
- React Aria's home page shows a fully styled example app in a browser frame with callouts on each component (Popover, Tooltip, SearchField, Table, Modal…). It shows the same component styled with CSS, Tailwind and CSS-in-JS, and has an examples gallery (Kanban board, CRUD app) with source links — [react-aria.adobe.com](https://react-aria.adobe.com/)
- shadcn Blocks: a Preview/Code toggle on each block, a copyable install command (`npx shadcn add dashboard-01`), and "Open in v0" — [shadcn blocks](https://ui.shadcn.com/blocks)

### Inferences
- For umriss, ranked by value per effort:
  1. **Copy button on every code block**: near-zero effort, expected everywhere.
  2. **Configurator knobs on the main demo of each component**, with generated code. This is the feature that most directly makes people "want to try everything". It is built from the existing component props, with no sandbox runtime needed.
  3. **A dark mode toggle, plus a locale switch EN/DE** that re-renders the demos with `@umriss-ui/core/wording/de`. Few libraries ship two wordings, so this shows off a differentiator for free.
  4. **A density/size switch**, if the library has density tokens. Otherwise skip it.
  5. **Open in StackBlitz**: StackBlitz's POST-a-form API needs no backend and works from a static page, but MUI's history shows it breaks with relative imports. Do it only for self-contained examples.
  6. **Fully editable code (Sandpack / react-live)**: the most expensive. react-live is lighter (no bundler) but only handles JSX scope injection. Add it only if a playground page is planned.
- A theme editor is worth it only if umriss has a theme/token system that people are meant to customise. Otherwise it is speculative.
- RTL: show it only if the components claim RTL support. A toggle that reveals broken layouts hurts more than it helps.

### Gaps
- react-live's current maintenance status was not checked.
- The details of the StackBlitz SDK (`openProject` via form POST, no server) come from background knowledge and were not fetched.
- No source was found that compares Tailwind's, Radix's or Ark UI's playground features.

## 4. AI-era docs: llms.txt, llms-full.txt, .md URLs, "Copy page", "Open in ChatGPT/Claude", MCP

### Takeaway
By 2026 the expected set is: `/llms.txt` (an index), `/llms-full.txt` (everything), a `.md` URL for every page, and a "Copy page" split button whose menu has "View as Markdown / Open in ChatGPT / Open in Claude". An MCP server is the next tier (shadcn, Mantine, Fumadocs, DocSearch). All but MCP work on a static site, because the `.md` files can be written at build time.

### Cited Findings
- The llms.txt spec: placed at `/llms.txt` or a subpath (`/docs/llms.txt`). "An H1 with the name of the project or site. This is the only required section", followed by an optional blockquote summary, optional details, and H2 file lists. It proposes "a clean markdown version of those pages at the same URL as the original page, either with `.md` appended (`page.html.md`) or with the extension replaced by `.md`", with `index.md` for directories, and suggests `rel="alternate" type="text/markdown"` links. The spec itself does **not** define `llms-full.txt`; that is community convention — [llmstxt.org](https://llmstxt.org/)
- Mantine: an `llms.txt` index that links per-page `.md` files under `/llms`, and an `llms-full.txt` of about 1.8 MB, "updated with each release". There is an experimental `@mantine/mcp-server` with tools `list_items, get_item_doc, get_item_props, search_docs`, plus Cursor `@Docs` instructions and a `mantinedev/skills` repo (mantine-combobox, mantine-form, mantine-custom-components) — [Mantine LLMs guide](https://mantine.dev/guides/llms/)
- Base UI's llms.txt links every page as a `.md` URL (e.g. `https://base-ui.com/react/components/accordion.md`), grouped Overview / Handbook / Components / Utilities — [base-ui.com/llms.txt](https://base-ui.com/llms.txt)
- shadcn MCP server: browse, search and install components from registries in natural language. It is set up with `pnpm dlx shadcn@latest mcp init --client claude` and has namespaced registries (`@namespace/component`). The docs also have llms.txt, "Copy Page" and "Open in v0" — [shadcn MCP](https://ui.shadcn.com/docs/mcp)
- Fumadocs (as a framework baseline): generated `llms.txt` ("the index of all pages, generated from the page tree") and `llms-full.txt` ("the content of all pages in a single file"), `.md` routes for each page with `Accept`-header content negotiation, a `MarkdownCopyButton`, and a `ViewOptionsPopover` ("view on GitHub", the markdown version). It also offers an optional Ask AI dialog, an MCP server, and an experimental WebMCP with `search_docs` / `read_page` — [Fumadocs LLM integration](https://www.fumadocs.dev/docs/integrations/llms)
- PostHog: appending `.md` to any docs URL "serves the raw MDX we write our docs in". A dropdown offers copy Markdown, view raw, "Open a prompt in ChatGPT to read the page" and a Claude option. `/llms.txt` is the directory — [PostHog](https://posthog.com/docs/ai-engineering/markdown-llms-txt)
- The pattern is spreading to smaller projects: ratatui's site added Copy page / View as Markdown / Open in ChatGPT / Open in Claude as a dropdown — [ratatui-website PR #1200](https://github.com/ratatui/ratatui-website/pull/1200); Warp Drive has a "Copy page" split button whose main action copies markdown and whose menu has "View as Markdown" and "Open in Claude" — [warp-drive PR #11229](https://github.com/warp-drive-data/warp-drive/pull/11229)
- DocSearch v5 offers an MCP server for agents — [DocSearch](https://docsearch.algolia.com/)

### Inferences
- umriss already has an llms.txt per demo. The cheap next steps are: (a) a `.md` file next to every prerendered page (write it at build time from the same source that drives the page, and add `<link rel="alternate" type="text/markdown">`); (b) an `llms-full.txt` per package; (c) a split button "Copy page", with a menu for View as Markdown / Open in ChatGPT / Open in Claude. The "Open in" links are plain URLs with a prompt query such as "Read <md-url> and answer questions about it", so no backend is needed.
- Content negotiation through the `Accept` header (Fumadocs) is impossible on GitHub Pages, which cannot vary on headers. Static `.md` URLs are the GitHub Pages way to do it.
- An MCP server needs either a running process or an npm package that the user runs locally (Mantine's `@mantine/mcp-server` model). The local npm-package version fits umriss, since the package can read the published llms files. It is optional and comes after `.md`/llms-full. Mantine's "skills" repo is a cheaper middle step: a few markdown skill files for the hardest topics.
- A "copy prompt" on each example ("Use umriss-ui's <X> to build…") is a smaller variant that few libraries offer. No source was found for it.

### Gaps
- No usage data (how often people press "Copy page" or open `.md` URLs) was found in public sources.
- Whether MUI, Radix and React Aria ship llms.txt or MCP in 2026 was not verified this session.

## 5. Guides beyond component pages: getting started, theming, recipes, migration, FAQ, blocks and templates

### Takeaway
Mature libraries separate "Handbook / Guides" from "Components" and add a third layer of **composed examples**: blocks, templates and example apps. The composed layer is what makes visitors want to use everything, because it shows the components working together in a believable product.

### Cited Findings
- Base UI's top-level split is Overview (quick start), Handbook (e.g. `handbook/styling.md`), Components and Utilities — [base-ui.com/llms.txt](https://base-ui.com/llms.txt)
- React Aria: a getting-started entry point, an overview of all components and hooks, and "fully styled examples showing what is possible", such as Kanban and CRUD apps with source — [react-aria.adobe.com](https://react-aria.adobe.com/)
- shadcn Blocks: "Clean, modern building blocks. Copy and paste into your apps.", grouped by category, each with Preview/Code and a CLI install — [shadcn blocks](https://ui.shadcn.com/blocks)
- MUI ships templates with StackBlitz/CodeSandbox buttons on each template card — [MUI PR #44253](https://github.com/mui/material-ui/pull/44253)
- Mantine ships agent skills for its hardest topics (combobox, forms, custom components). These are effectively "how-to" guides written for agents — [Mantine LLMs guide](https://mantine.dev/guides/llms/)

### Inferences
- umriss's control room page (core's demo, which pulls in all packages) is already a "composed template" in spirit. Turning it into a named, linked "Examples" or "Blocks" section, with source per block, probably gives the best discoverability per effort, because it is cross-package by nature.
- Order of guides to write: Getting started, then Theming/customisation, then Localisation (EN/DE and custom wording; this is unique to umriss), then Recipes (3–5 cross-package patterns, e.g. a schedule fed by a calculation), then Migration notes per breaking 0.x release, then FAQ/Troubleshooting once real questions pile up (do not write it ahead of time).

### Gaps
- Tremor blocks and Mantine UI (ui.mantine.dev) were not fetched this session.
- No source was found on the share of traffic that blocks/templates get compared with component pages.

## 6. Docs quality frameworks and measuring docs (Diátaxis, rubrics, feedback widgets)

### Takeaway
Diátaxis is the common vocabulary. A component library's pages are mostly *reference*, and the gaps are usually *tutorials* and *explanation*. Measurement in practice means a "Was this page helpful?" yes/no widget at the bottom of the page plus search analytics. On a static site the widget needs a third-party endpoint or a link to a GitHub issue.

### Cited Findings
- Diátaxis has four modes: Tutorials (learning-oriented), How-to guides (task-oriented), Reference (information-oriented), Explanation (understanding-oriented). They sit on two axes: action vs cognition, and acquisition vs application. It "prescribes approaches to content, architecture and form that emerge from a systematic approach to understanding the needs of documentation users" — [diataxis.fr](https://diataxis.fr/)
- A page-feedback widget is "a small inline form at the bottom of a content page that asks readers 'Was this page helpful?'", with a yes/no rating and an optional comment. It is used by GitHub Docs, Stripe Docs and Google developer docs — [Forminit blog](https://forminit.com/blog/was-this-page-helpful-feedback-widget/) (a vendor blog, so moderate trust)
- PushFeedback provides such a widget for Docusaurus, Starlight and other platforms — [PushFeedback](https://docs.pushfeedback.com/installation/docusaurus); Starlight's Footer component override is the place to inject one — [LogRocket: Starlight vs Docusaurus](https://blog.logrocket.com/starlight-vs-docusaurus-building-documentation/)

### Inferences
- Mapping for umriss: component pages = Reference (props, wording keys) + a small How-to (demos); a Getting started = Tutorial; ADR-backed "why" pages = Explanation. umriss already has ADRs, and a curated public "Concepts" page drawn from them would fill the Explanation quadrant cheaply.
- The cheapest static feedback is a "Was this helpful? / Suggest an edit" link that opens a prefilled GitHub issue with the page URL. No third party is involved.
- Pagefind has no built-in analytics, so search-query logging would need a custom hook. That is optional.

### Gaps
- Google's developer documentation style guide, GitLab's docs guidelines and Write the Docs' rubric were not fetched. Their specific checklists are not cited here.
- No published effectiveness data for "Was this helpful" widgets was found.

## 7. Accessibility and performance of the docs site itself

### Takeaway
Prerendered static HTML with progressive hydration is already the performance best practice. The remaining risks are a search modal and a theme toggle that are not accessible, and demos that are only rendered on the client (bad for no-JS users and for search indexing).

### Cited Findings
- DocSearch advertises "WAI-ARIA compliant" accessibility — [DocSearch](https://docsearch.algolia.com/)
- Pagefind 1.5's Component UI was introduced partly for "better accessibility" — [Pagefind docs](https://pagefind.app/docs/)
- Pagefind loads index chunks on demand (about 100 kB typical per search, under 300 kB on 10k pages) instead of shipping the whole index up front — [pagefind.app](https://pagefind.app/)

### Inferences
- Checklist for umriss: a skip-link to the content; a visible focus ring; a search modal that traps focus and returns it to the trigger; a TOC that is a `<nav aria-label>`; scroll-spy that does not steal focus; a theme toggle that respects `prefers-color-scheme` with no flash (an inline script in `<head>`); copy buttons that announce "Copied" via `aria-live`; and demo knobs that are real labelled form controls.
- Prerender props tables and code into HTML (not only after hydration). This serves no-JS readers, Pagefind indexing and `.md` generation at the same time.

### Gaps
- No 2026 audit comparing the accessibility of major library docs sites was found.

## 8. Which features matter most (prioritised for umriss)

### Takeaway
Ranked by impact over effort for a static, five-site, 0.x library: (1) one search across all five packages; (2) a component overview gallery and a package switcher; (3) configurator knobs plus copy code on the demos; (4) a `.md` per page plus a Copy page / Open in Claude/ChatGPT menu plus llms-full.txt; (5) composed examples/blocks; (6) "see also" links and new/beta badges; (7) a feedback link. Defer: a version selector, a theme editor, fully editable Sandpack code, and an MCP server.

### Cited Findings
- The search basis (multisite merge with per-package filter) — [Pagefind multisite](https://pagefind.app/docs/multisite/)
- The configurator pattern as the core of a component page — [Mantine Button](https://mantine.dev/core/button/)
- The AI-menu pattern, which is now widespread — [PostHog](https://posthog.com/docs/ai-engineering/markdown-llms-txt), [Fumadocs](https://www.fumadocs.dev/docs/integrations/llms), [ratatui PR #1200](https://github.com/ratatui/ratatui-website/pull/1200)
- Composed examples as a showcase — [shadcn blocks](https://ui.shadcn.com/blocks), [react-aria.adobe.com](https://react-aria.adobe.com/)
- The maintenance cost of sandbox exports — [MUI PR #45924](https://github.com/mui/material-ui/pull/45924), [MUI issue #42733](https://github.com/mui/material-ui/issues/42733)

### Inferences
- The ranking is a judgement, not measured data. It favours features that need no runtime service and reuse what the build already produces (prerendered HTML → Pagefind index, `.md`, llms-full).
- The EN/DE locale switch on demos is a cheap differentiator that no surveyed library could offer the same way. Surface it prominently.

### Gaps
- No quantitative study ranking docs features by user engagement was found. The prioritisation above is reasoned, not evidenced.
