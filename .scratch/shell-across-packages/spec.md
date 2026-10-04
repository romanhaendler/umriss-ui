# Spec: The shell connects the five packages

Status: done

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: ADR-0020 (one shell for all demos), ADR-0037 and `.scratch/search-visibility/spec.md` (addresses as paths, the title formula D8), `.scratch/demo-rework/spec.md` (the scenarios page opens every demo).
Blocked by: nothing
ADR: none
Tickets: `issues/01`–`05`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

A visitor who lands on any page of the site is inside one package and cannot get out. The header carries the package's brand, a search field and a theme button, nothing else: the brand leads back to the same package's scenarios page, and there is no way to the front page, to the four other packages, to GitHub, to npm or to `llms.txt`. The five demos are five islands that happen to share an address.

Moving inside one demo goes wrong in small, visible ways. After a click in the sidebar the browser tab keeps the title of the page one came from ("Select – React component · @umriss-ui/core" on the Button page), so the history and every bookmark say the wrong thing. On a page low in a long sidebar (`/core/tag/`) the active entry is out of sight; the sidebar always opens at its top. Sidebar entries are buttons, so a reader cannot open a page in a new tab or copy its link.

The theme does not stay. Each of the five demos has its own copy of the same theme hook, holds the choice in memory only, and starts from the system preference on every load, so dark turns back to light on every reload and on every switch of package. The front page has no switch at all.

The project has four names: "umriss" (the README's and `site/llms.txt`'s heading), "umriss-ui" (the front page), "Umriss UI", "Umriss Charts", "Umriss Table" … (the demo headers), and "Umriss UI – Component overview" (the title an unbuilt demo still carries). There is no favicon, so the tab shows the browser's blank page.

Every package's landing page is headed with the same generic word, "Scenarios". It never says which package one is looking at, how to install it, or where to start.

## Solution

The header becomes the same bar on every page of every demo: the wordmark **umriss-ui** on the left, leading to the site's front page; beside it the five packages as plain links (Core, Charts, Table, Schedule, Calculation), the current one marked; then the search; then the theme switch and three small links (GitHub, the current package on npm, the package's `llms.txt`). From any page, every package and the front page are one click away.

Moving inside a demo behaves like moving between documents: the tab title follows, the sidebar keeps the active entry in view, and every sidebar entry is a real link.

The theme is one choice for the whole site. The shell owns it, stores it in the browser under one key that all five demos and the front page read, and applies it before the first paint, so a dark reader never sees a light flash.

One name, **umriss-ui**, wherever a visitor reads the project's name; a favicon in every tab.

Each landing page names its package as its heading, shows the install command as a block one can copy, and points to the page to start with.

## User Stories

1. As a developer evaluating umriss-ui, I want the five packages listed in every page's header, so that I see what else the project offers without leaving the page.
2. As a developer evaluating umriss-ui, I want the wordmark to lead to the front page, so that I can always get back to the overview.
3. As a developer using the table, I want one click from the table's pages to the core's pages, so that I can look up the provider or a format without searching.
4. As a developer using the schedule, I want the current package marked in the header, so that I know which package's pages I am reading.
5. As a developer evaluating umriss-ui, I want a link to the source on GitHub in the header, so that I can judge the code and the activity of the project.
6. As a developer about to install, I want a link to the current package on npm, so that I can see its version, size and peer dependencies.
7. As a coding agent, I want a link to the package's `llms.txt` on every page, so that the text written for me is found from wherever a human sends me.
8. As a developer, I want the browser tab to show the page I am on after every click, so that my tabs, my history and my bookmarks are right.
9. As a screen-reader user, I want the document title to change with the page, so that the page change is announced and I know where I landed.
10. As a developer, I want to open a sidebar entry in a new tab with a middle click or Cmd-click, so that I can keep two pages open beside each other.
11. As a developer, I want to copy a sidebar entry's link, so that I can paste the address of a page into a ticket.
12. As a developer on a page low in a long sidebar, I want the active entry scrolled into view, so that I see where I am among the pages around it.
13. As a developer reading in the dark, I want my theme choice remembered across reloads, so that I do not switch it again on every page load.
14. As a developer moving from core to charts, I want the theme to stay the same, so that the site does not flash from dark to light between packages.
15. As a developer arriving on a prerendered page with a stored dark theme, I want the page dark from its first paint, so that I see no light flash before the demo starts.
16. As a developer with no stored choice, I want the site to follow my system preference, so that it looks right without any action.
17. As a developer whose browser blocks storage, I want the theme switch to work for the visit, so that blocked storage costs only the memory, not the switch.
18. As a screen-reader user, I want the theme switch to say what it will do ("Switch to dark theme"), so that I know its effect before pressing it.
19. As a developer evaluating umriss-ui, I want the project called by one name everywhere, so that I know the front page, the demos, the README and npm describe the same thing.
20. As a developer with many tabs open, I want a favicon, so that I find the umriss-ui tab among the others.
21. As a developer arriving on a package's landing page, I want its heading to name the package, so that I know at once which of the five I am looking at.
22. As a developer arriving on a package's landing page, I want the install command as a copyable block, so that I can try the package without hunting for the command.
23. As a developer arriving on a package's landing page, I want a "Start with" link to the first page to read, so that I know where the documentation begins.
24. As a phone visitor, I want the package links reachable at 390 px without the page scrolling sideways, so that switching packages works on a phone too.
25. As a phone visitor, I want GitHub, npm and `llms.txt` still reachable, so that the narrow header loses no destination.
26. As a keyboard user, I want the header's links in a sensible tab order (wordmark, packages, search, theme, links), so that I reach the search without passing through unrelated controls.
27. As a screen-reader user, I want the package links in a navigation landmark of their own, named "Packages", so that I can jump to it and tell it from the page navigation.
28. As a reader without JavaScript, I want the package links and the wordmark to be plain links in the prerendered page, so that the crawler and I can follow them.
29. As the maintainer, I want the theme logic in the shell once instead of five copies in the demos, so that a change to it is made once.
30. As the maintainer, I want the title formula in one function used by both the prerendering and the shell, so that the title after a click equals the title after a reload.
31. As the maintainer, I want the list of the five packages written once and read by the shell, the front page and the build, so that a sixth package is added in one place.
32. As the maintainer, I want the shell suite to prove the header, the title, the active entry and the theme in every demo, so that a regression in one demo is caught by the same checks as in the others.

## Implementation Decisions

**One list of packages.** The shell package gains one module that lists the five packages in their fixed order (core, charts, table, schedule, calculation). For each: the directory id, the display name (Core, Charts, Table, Schedule, Calculation), the npm name, a role of at most eight words, and the id of the page to start with. The roles are:

| Package | Role | Start with |
|---|---|---|
| Core | Controls, overlays and layout: the base of the others | Installation |
| Charts | Canvas charts for series, states and limits | Installation |
| Table | A typed data table for many rows | First table |
| Schedule | Work on lanes over time | First schedule |
| Calculation | A figure shown with how it came about | Installation |

Charts' and table's start pages carry the ids that `sidebar-tree` gives them (`installation`, `first-table`); until that spec lands, the list names today's ids. The module imports nothing, as the outlines already do, so the pages build can load it in Node without a bundler. The version stays read from each package's manifest, as today.

**The header.** Left to right: the wordmark "umriss-ui" (a link to the site root, a full page load since it leaves the demo); the package links, a plain `nav` named "Packages" with five anchors, the current one carrying `aria-current="page"` and the package version in small type beside its name; the search button (unchanged); the theme switch; three icon links with accessible names: "Source on GitHub", "`@umriss-ui/<package>` on npm", "`llms.txt` for coding agents". The shell is still built from plain elements and the design tokens, not from the library's components (the rule at the head of the shell stands; the palette remains its one exception). The theme button, today the library's `Button` in each demo's App, becomes a plain shell button like the rest of the header.

The `brand` prop of the shell goes; the shell takes the package id and reads name, version and links from the list. Each demo's App shrinks to handing the shell its demo and its landing sentence.

**Narrow widths.** At 900 px and less the header takes two lines: the first with wordmark, search and theme switch; the second with the five package links, scrolling sideways inside itself if it must (it fits at 390 px, at 13 px type). GitHub, npm and `llms.txt` leave the header at this width and stand at the foot of the sidebar, where `page-orientation` later puts them into its drawer. The page itself never scrolls sideways.

**Sidebar entries are links.** Every entry, "Scenarios" included, becomes an anchor with the page's real address. A plain click is still intercepted by the shell's existing click handler and moves without a reload; a modified click, a middle click and "copy link" are the browser's.

**The title follows.** The title formula of `search-visibility` D8 (`<Page> – React <noun> · @umriss-ui/<package>`, the landing's title as written for it) moves into one function of the shell tooling. The prerendering calls it to write each page's `<title>`, and the shell calls it on every place change and sets `document.title`. An example anchor does not change the title.

**The active entry stays in view.** On every place change, if the active entry lies outside the sidebar's visible box, the sidebar alone is scrolled so that the entry stands in its middle; the page's own scroll position is not touched. On the first load the same rule applies, without animation.

**One theme.** The theme hook moves from the five Apps into the shell. Two states, light and dark, applied as today through `color-scheme` on the root (the tokens follow through `light-dark()`, ADR-0021). The storage key is `umriss-ui:theme`, holding `light` or `dark`. With no stored value the theme follows the system preference, and keeps following it live while nothing is stored. A press on the switch stores the choice from then on. There is no third "system" state: one key removed from storage restores it, and a third state costs a menu for a choice almost nobody makes. Every read and write of storage is guarded, because storage can throw (private windows, blocked site data). When it throws, the switch works for the visit and nothing is remembered.

The site is one origin, so the five demos and the front page share the key. In development each demo runs on its own port, a different origin, and shares nothing; that is accepted.

**Before the first paint.** Each demo's `index.html` gains a short inline script in its head that reads the key and sets `color-scheme` on the root before anything renders. Because the prerendered pages are made from that same `index.html`, they inherit it. The front page carries the same script (`site-front-page`). The script is the only place besides the shell that knows the key, and it is tested together with it.

**The switch's name.** The button shows a sun or moon glyph (the glyph rules apply: one stroke width, `currentColor`, `aria-hidden`) and is named by what it does: "Switch to dark theme" / "Switch to light theme".

**One name.** "umriss-ui" is the project's name wherever a visitor reads it: the header wordmark, every title, the front page, the site's `llms.txt` heading, each demo's `index.html` default title ("umriss-ui – Core" and so on), the README's heading. npm names stay `@umriss-ui/<package>`. The repository's internal documents (CLAUDE.md, CONTEXT.md, the ADRs, the journal) keep "umriss", which is the workspace's name, not the product's.

**Favicon.** One SVG favicon, linked from every demo's `index.html` (and so from every prerendered page) and from the front page: the letter "u" in an outlined rounded square, drawn in the ink colour, with a `prefers-color-scheme` rule inside the SVG that inverts it for dark tabs. There is no PNG fallback set; current browsers take an SVG favicon.

**The landing page's head.** The scenarios page keeps its place and address. Its eyebrow becomes "Scenarios", its heading the npm name (`@umriss-ui/table`), then the package's sentence as today. Below the sentence:
- the install command as a copyable block, using the one install-command function described in `facade-defects` (npm, with the package's `@umriss-ui` peers). Whichever of the two specs lands first writes that function, and the other uses it;
- one link, "Start with <page name> →", to the start page from the package list.

## Testing Decisions

A good test here drives the built demo as a visitor does (clicks, reloads, reads the tab title, looks at what is in view) and asserts what is visible or announced, never the shell's internal state.

- **Seam: the shell suite** (`checkShell`, called by each demo's `features-shell` spec, Playwright). It gains, for every demo:
  - the header has the wordmark linking to the site root and five package links, the current one with `aria-current`;
  - after a click on a sidebar entry `document.title` equals the title the prerendering writes for that page (the same function), and after a back navigation the previous title returns;
  - sidebar entries are anchors whose `href` is the page's address;
  - on a page whose entry lies below the sidebar's fold (core: Tag; the other demos: their last page) the active entry is inside the sidebar's visible box after load and after a palette jump;
  - pressing the theme switch sets `color-scheme` and stores `umriss-ui:theme`; a reload keeps it, with the root dark before the app script runs (checked by reading `color-scheme` in an init script, as soon as the document exists); with storage cleared the emulated system scheme decides;
  - with storage throwing (an init script that replaces `localStorage` with one that throws) the switch still toggles;
  - at 390 px the five package links are reachable and the page has no horizontal overflow.
- **Seam: the tooling unit tests** for the title function: the formula for a component page, a feature page and the landing, against the fixture package.
- **Seam: the built-site guard** gains one check: every page links the favicon.
- **Prior art:** the existing shell suite's address and palette checks (forwarding of an old hash), and its axe run, which also covers the new header.
- **Screenshot baselines** that show the shell header or the landing's head change once, in the ticket that changes the header. The page-head baselines of the five demos are renewed together.

## Out of Scope

- The on-this-page table of contents, prev/next and the mobile drawer (`page-orientation`).
- The language switch in the header (`language-switch`); this spec leaves room for it beside the theme switch.
- The front page itself (`site-front-page`), apart from sharing the package list, the theme key and the favicon.
- Search across packages (`one-search`); the palette still searches its own demo.
- Address changes of any page (`sidebar-tree`).
- A "system" third theme state, a theme editor, an accent-colour picker.

## Further Notes

- Siblings: `site-front-page` (blocked by this spec: it reads the package list, the theme key and the favicon), `page-orientation` and `language-switch` (both build on the header), `concepts-and-changelog-pages` (its document pages reuse the header's look).
- Research: Radix and shadcn make the package family the top navigation; Mantine's header carries Source, npm and "LLM docs" links (landing_pages, discoverability_interactivity). The defects are recorded in asis_site_ux, sections 2.1 and 6 (items 3, 4, 5, 10, 11, 15, 17).
- Acceptance:
  - [ ] From every page of every demo, every other package and the front page are one click away.
  - [ ] `document.title` equals the prerendered title after every in-app navigation.
  - [ ] The active sidebar entry is visible after load and after every jump.
  - [ ] Every sidebar entry is a link that opens in a new tab.
  - [ ] The theme survives reloads and package switches on the built site and is applied before the first paint.
  - [ ] Five `useTheme` copies are gone; the shell holds the only one.
  - [ ] "umriss-ui" in every visible title and heading of the site; a favicon on every page.
  - [ ] Each landing page is headed by its npm name, shows a copyable install command and a "Start with" link.

## Comments

Delivered on `main` on 4 Oct 2026: every ticket under `issues/` is `Status: done` and carries its own delivery report. The whole effort was checked once more on `main` afterwards — lint, typecheck, unit and the full visual suite green.
