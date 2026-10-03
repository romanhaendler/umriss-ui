# Spec: The front page as an invitation

Status: ready-for-agent

Origin: session of 2-3 Oct 2026. The brief, in the words it was given in: "Unsere Demo-Seite gefällt mir noch immer nicht zu 100%. Die Startseite ist zwar funktional, aber nicht gerade einladend. ... State of the Art, sehr einladend, alles entdecken und benutzen zu wollen. Keine offenen Fragen." Research and gap analysis: `docs/research/component-docs-2026-10/` (six notes: landing_pages, component_api_reference, discoverability_interactivity, data_library_docs, asis_site_ux, asis_props_types). Roadmap of all sixteen specs: `.scratch/docs-roadmap/spec.md`.

Builds on: `.scratch/search-visibility/spec.md` (D9 the front page as the hub, D14 its own polish, revised 2 Oct: named umriss-ui, one preview image), ADR-0037.
Blocked by: `shell-across-packages` (the package list, the theme key `umriss-ui:theme`, the favicon and the wordmark come from there)
ADR: none
Tickets: `issues/01`–`02`; each names its blockers. The order across specs is in `.scratch/docs-roadmap/spec.md`.

## Problem Statement

The front page is the only page that a search for "umriss-ui" or a shared link lands on before any demo, and it reads like a sitemap. Its own comment says that is what it is for: "the links a crawler walks". It has a 1.6 rem heading "umriss-ui", one grey sentence, five cards of equal weight, and under each card a run of underlined links to every page of that package: 54 for core, about 130 in all. On a 1440 px screen about 65 % of the width is empty grey. On a phone the core card alone is a screen and a half of links before charts appears.

A visitor sees no component. The best picture the project has, a collage of an open date range picker, a multi-select, the command palette, a tree, a trend, an alarm table, a plan and an OEE calculation, exists as the share image (`og-image.png`) and is never shown on the page. There is no install command, no "get started", nothing that says what sets umriss-ui apart: the industrial standards (ISA-18.2 alarms, ISA-101 limits and verdicts), canvas charts measured by a benchmark, English and German wording, documentation for coding agents. None of it is visible; some of it sits only in the meta description and the JSON-LD. The five packages are not told apart: nothing says core is the start and the others build on it. The monospace package names fall back to a Courier-like face in some browsers. There is no theme switch and no favicon.

The research is consistent on what a front page in 2026 does. It makes one promise naming the category and the difference, offers exactly two ways in (get started, see it working) and shows real product instead of adjectives. A package family gets a stated starting point and one tile per package with a preview (React Aria, shadcn/ui, Tremor, MUI, Mantine). Testimonials, logo walls and superlatives are decoration for an open-source library and are left out.

## Solution

The front page becomes an invitation that still carries every link a crawler needs:

1. **Head:** the wordmark, the promise in one sentence, a second line naming the five packages, two buttons ("Get started", "Explore the scenarios") and the install command with a copy button.
2. **Proof:** the collage, shown large and linked to core's scenarios.
3. **Packages:** five tiles, each with a preview of its package's first scenario in the current theme, its name, npm name and version, its role, and what it needs. Core is marked "Start here".
4. **What sets it apart:** five short claims, each linked to the page that proves it.
5. **Every page:** the full index of all pages, folded inside a disclosure, so it stays in the HTML for crawlers and out of the reader's way.
6. **Foot:** GitHub, npm, `llms.txt`, licence.

Theme switch, favicon and the demos' typefaces come with it. The page stays static HTML with no JavaScript bundle.

## User Stories

1. As a developer evaluating umriss-ui, I want one sentence that says what umriss-ui is for and what sets it apart, so that I can decide in seconds whether to read on.
2. As a developer evaluating umriss-ui, I want to see real components on the first screen, so that I judge the quality by looking rather than by reading claims.
3. As a developer evaluating umriss-ui, I want the picture to lead to the scenarios it shows, so that I can see the same components running.
4. As a developer ready to try it, I want a "Get started" button, so that I reach the installation page in one click.
5. As a developer who wants to look before installing, I want an "Explore the scenarios" button, so that I see whole screens built from the library.
6. As a developer ready to try it, I want the install command on the front page with a copy button, so that I can start without opening the documentation.
7. As a reader without JavaScript, I want the install command as selectable text, so that copying works without the button.
8. As a developer evaluating umriss-ui, I want each package on its own tile with a preview, so that I see what each one draws before I open it.
9. As a developer new to the project, I want core marked as the place to start, so that I do not begin with a package that depends on another.
10. As a developer planning a dependency, I want each tile to say what it needs ("needs core", "needs core and charts", "stands alone"), so that I know what I install with it.
11. As a developer comparing versions, I want each tile to show the npm name and the current version, so that I know what is published.
12. As a developer in an industrial setting, I want the standards umriss-ui follows named on the front page and linked to a page that shows them, so that I can check the claim at once.
13. As a developer who needs German screens, I want "English and German" stated and linked to the Language page, so that I know the wording is part of the library.
14. As a developer worried about chart performance, I want the canvas claim linked to the benchmark, so that I see a measurement and not an adjective.
15. As a coding agent, I want `llms.txt` linked from the front page, so that the text written for me is found from the root.
16. As a developer reading in the dark, I want the front page to follow my stored theme and offer the same switch as the demos, so that the site does not flash between front page and demo.
17. As a developer reading in the dark, I want the package previews in the dark theme, so that the tiles do not glare.
18. As a phone visitor, I want the promise, both buttons and the install command on the first screen at 390 px, so that I can start on a phone too.
19. As a phone visitor, I want the tiles in one column without sideways scrolling, so that the page reads like a page.
20. As a search engine, I want a link to every page of every package in the HTML, so that the whole site is reachable from the root.
21. As a developer who wants the full list of pages, I want to open "Every page" and see all pages grouped by package, so that the index remains one click away.
22. As a screen-reader user, I want the page built from headings and landmarks (header, main, a heading per section, footer), so that I can move through it by structure.
23. As a screen-reader user, I want every picture to have an alternative text that says what it shows, so that the proof reaches me too.
24. As a keyboard user, I want each tile to be one link with a visible focus ring, so that a tile is one stop in the tab order.
25. As a developer, I want the page to load fast, so that a slow page does not make my first impression.
26. As a developer evaluating umriss-ui, I want the page set in the same typefaces as the demos, so that front page and demos look like one product.
27. As the maintainer, I want the front page in a template of its own instead of a string inside the build script, so that its markup can be read and changed like any page.
28. As the maintainer, I want the preview images made by a script, so that renewing them after a scenario changes is one command and not a manual screenshot session.
29. As the maintainer, I want the build to fail if a tile's preview, a button's target or a claim's target is missing, so that the front page never ships a broken promise.
30. As the maintainer, I want the five packages' names, roles and order read from the shell's package list, so that front page and header never disagree.

## Implementation Decisions

**Template.** The front page moves out of the string inside the pages build into an HTML template of its own beside the build. The build fills its slots: the package rows, the index of every page, the head tags as today (title, description, canonical, og, JSON-LD unchanged). It stays static HTML with a small inline style and two inline scripts, the theme script and the copy button, and no bundle.

**Words.** Fixed text, in this order:
- H1: `umriss-ui`.
- Promise, as the lede: "React components for data-dense screens – control rooms, dashboards, planning – built to the industrial standards for alarms and limits, in English and German."
- Second line: "Five packages: a component library, canvas charts, a typed data table, a Gantt-style schedule and a calculation view. TypeScript, MIT, light and dark."
- Buttons: "Get started" (primary, to core's Installation page) and "Explore the scenarios" (secondary, to core's landing page).
- Install block: `npm install @umriss-ui/core`, with a "Copy" button that turns into "Copied" for 1.6 s, as the demos' copy button does. npm is the lowest common denominator; the demos use the same form (`facade-defects`).
- The page's `<title>` and meta description stay as `search-visibility` set them.

**Proof.** The collage `og-image.png` is shown under the head at its natural ratio (1200 × 630), in a frame with the edge token, as one link to core's landing page. Its alternative text is the existing description of the image. Under it a caption: "Every picture on this site is a running component. The scenarios show them working." The collage has no dark variant and is shown in both themes, framed; it is renewed by hand, as it is today.

**Tiles.** Five tiles in the order of the package list: three columns at 1100 px and wider, two from 700 px, one below. Each tile is a single link to its package's landing page and holds:
- a preview of the package's first scenario, light and dark (see below), 1200 × 750 px, shown at the tile's width, with alternative text "<Display name>: <first scenario's title>";
- the display name as the tile's heading;
- the npm name and version in the monospace face;
- the role from the package list;
- what it needs: core "stands alone", charts "stands alone", table "needs core", schedule "needs core and charts", calculation "needs core". This is read from the manifest's `@umriss-ui` peer dependencies, not written by hand;
- on core only, a "Start here" label.

**The dark preview follows the stored theme, not only the system.** A `picture` element can only follow the system preference, so each tile carries two `img` elements instead, light and dark, both `loading="lazy"`. CSS shows one of them: by default the one matching `prefers-color-scheme`, and once the inline theme script has set a theme attribute on the root, the one matching that attribute. A hidden lazy image is not fetched, so only one is downloaded. Without JavaScript the system preference decides.

**Previews are made by a script.** A script beside the build, run by hand as `pnpm previews` after a first scenario changes, serves the built site from a minimal static server on `node:http`. It opens each package's landing page in Playwright at a 1280 × 800 viewport, light and dark, and photographs the first scenario's stage clipped to 1200 × 750. It writes ten PNGs into a previews directory beside `og-image.png`, all checked in. The build copies them into the site. Playwright is already installed; nothing is added.

**What sets it apart.** One row of five claims, each a link to the page that proves it:

| Claim | Target |
|---|---|
| ISA-18.2 alarm lists | table: AlarmList |
| ISA-101 limits and verdicts | charts: LimitLine |
| Canvas charts, measured | charts: Benchmark |
| English and German wording | core: Language |
| Written for coding agents too | the site's `llms.txt` |

There are no stars, download counts, logos or testimonials.

**Every page.** Below the claims, one `details` element, closed by default, summary "Every page (<count>)". Inside it, per package, a heading and the run of page links as today. The links stay in the HTML for the crawler; the reader sees fewer than twenty links without opening it.

**What's new.** Not part of this spec. `concepts-and-changelog-pages` adds the latest version per package once changelogs are pages.

**Foot.** "Source on GitHub" · "npm" (the `@umriss-ui` scope) · "`llms.txt`, for coding agents" · "MIT licence". `concepts-and-changelog-pages` later adds Design language, Standards and What umriss-ui is not.

**Header, theme, favicon, type.** The page has the same top bar as the demos in a static form: wordmark, the five package links and the theme switch. The search button is left out, because the palette lives in the demos (`one-search` may add it later). It uses the theme key `umriss-ui:theme` and the before-paint script of `shell-across-packages`, and links the shared favicon. Its typefaces are the demos' own, Geist Sans and Geist Mono. The build copies the woff2 files the demos already use from the installed font packages into the site and declares them with `font-display: swap`; there is no third-party font host. This removes the Courier fallback.

**Colours.** The template's private palette (`--ink`, `--paper`, …) is replaced by the values of the design tokens, light and dark, copied from the token stylesheet at build time. The front page then cannot drift from the demos' colours.

## Testing Decisions

A good test reads the built page as a crawler or a visitor would: what text, links and pictures are there and where they lead. It never tests the template's internals.

- **Seam: the built-site guard** in the pages build (prior art: its sitemap, title, description, canonical and h1 checks). It gains, for the front page:
  - exactly one h1, "umriss-ui";
  - the promise sentence;
  - the two buttons, each linking to an address that is in the sitemap;
  - the install command;
  - five tiles, each linking to a landing page in the sitemap, each with both preview files present in the site and each file under 300 kB;
  - each claim linking to an address in the sitemap or to `llms.txt`;
  - fewer than 20 links outside the `details` element;
  - every sitemap address linked inside it;
  - the theme script and the favicon link present.
- **Seam: the tooling unit tests** for the dependency line: a manifest with no `@umriss-ui` peers gives "stands alone", one with core gives "needs core", one with core and charts gives "needs core and charts".
- **No new browser suite.** The first-screen acceptance at 1440 × 900 and 390 × 844 is checked once by the maintainer on the rendered page, as `search-visibility` D14 accepted the front page "on the rendered picture"; the guard keeps its structure from regressing.
- **Screenshot baselines:** none exist for the front page and none are added.

## Out of Scope

- A live component or an interactive playground on the front page. The collage and the previews are pictures of running components, and the scenarios are one click away.
- Testimonials, GitHub stars, download counts, logo walls.
- A changelog strip and links to the rendered documents (`concepts-and-changelog-pages`).
- Search on the front page (`one-search`).
- A per-package front page beyond the landing pages (`shell-across-packages` gives them their head).
- An own domain (search-visibility D3 stands).

## Further Notes

- Siblings: `shell-across-packages` (blocks this one), `concepts-and-changelog-pages` (adds the changelog strip and foot links), `one-search`.
- Research: the consensus hero (shadcn/ui, React Aria, Tremor), the package family with a stated start and preview tiles (MUI "Start with Material UI", Mantine's extensions grid), and install on the front page (Chakra, Radix) are in landing_pages. The as-is front page, about 130 links with no picture, CTA or install command, is in asis_site_ux section 1.
- Acceptance:
  - [ ] At 1440 × 900 the first screen shows the promise, both buttons, the install command and the top of the collage.
  - [ ] At 390 × 844 the first screen shows the promise, both buttons and the install command, with no sideways scroll.
  - [ ] Five tiles with previews in the current theme; core marked "Start here"; each tile says what it needs.
  - [ ] Five claims, each linked to the page that proves it.
  - [ ] Fewer than 20 visible links before "Every page" is opened; every sitemap address linked inside it.
  - [ ] Theme switch shared with the demos, favicon, Geist faces, token colours.
  - [ ] `pnpm previews` renews the ten preview images; the build fails if one is missing or too large.
