# AS-IS: umriss-ui documentation/demo site, as a visitor sees it

Date: 2026-10-02. Basis: `pnpm build:pages` on `main` @ 3b2fa14 (built locally, served under `/umriss-ui/`, Playwright/Chromium), live site spot-checked (title and `/core/select/` identical, HTTP 200). Screenshots: `screenshots/` beside this file (59 PNGs; naming `<page>_<desktop|mobile>_<light|dark>_<fold|full>.png`, plus `core-button_desktop_light_code-open.png`, `core-palette_desktop_light.png`, `core-select_nojs_prerendered.png`, `table-home_mobile_light_scrolled.png`). The screenshots were taken locally and are not kept in the repository.

## 0. What shapes it (intent, deliberately decided)

- **"No documentation website beside the demos."** `docs/README.md` ("What is deliberately not here"): "The demos are the documentation for the components … the demos, prerendered, are the website. A site that hosts this prose beside them is still a product decision with a spec of its own." Same in `.scratch/docs-structure/spec.md:120`.
- **"No prose copy of the demos."** (`docs/README.md`) – a component is described only where it runs; props tables generated from `src/`.
- **ADR-0037 / `.scratch/search-visibility/spec.md`**: every page a path with prerendered text (heading, lead, every example's source, props tables) inside `#root`; app replaces it via `createRoot` (no hydration). Front page = "hub": title, link to every page, sitemap, canonical, og, JSON-LD. D14: "The demos look exactly as before." Revised 2 Oct: front page named `umriss-ui`, one og-image for all pages. Out of scope: own domain, blog, translated pages, backlinks.
- **`.scratch/demo-rework/spec.md`** (+ `research-component-pages.md`, MUI/React Aria/Polaris/AG Grid/… survey): Scenarios page first in every demo (Polaris pattern: job-titled screens, numbered callouts, "Built from", code collapsed); component page skeleton rubric · H1 · lede (≤60 words, no praise) · import line · about (≤3 paragraphs) · first example w/o heading · Examples · When to use something else · Keyboard · API · Known limits (→ ADR-0032). No "Why" section. Five invented worlds (operations, logistics, controlling, planning, plant). Positioning ADR-0035.
- **`.scratch/demo-as-documentation/spec.md`** (origin brief: "wie zB bei MUI … Ausführliche Beispiele inklusive Code. Bessere Strukturierung"): refused a TS/JS toggle, **refused "the component-gallery landing page (it answers the same question as the sidebar, more expensively)"**, refused colourful syntax theme.
- **`.scratch/demo-consolidation/spec.md`** / ADR-0020: one shell (`packages/demo`) for all five demos.
- **`.scratch/ai-readable-docs/spec.md`**: `llms.txt` + `llms-full.txt` per package, `docs/llms-full.md` shipped in npm; no MCP server.
- **`.scratch/visuelle-wertigkeit/spec.md`**: "the goal is … a library that looks high-grade" (component design language, not the site).
- Shell code comment `packages/demo/src/Shell.tsx:16-18`: "The shell is built from plain elements and not from the building blocks it shows: surroundings made of the exhibit itself blur what is being examined." (Exception: the Cmd-K palette is the library's `CommandPalette`.)

## 1. Front page (site root `/umriss-ui/`)

Generated inline as a template string in `scripts/build-pages.mjs:143-189` (no component, no shared styles with the demos; own 15-line `<style>`).

**Exact content, in order** (screenshots `front_desktop_light_full.png`, `front_mobile_light_fold.png`, `front_desktop_dark_fold.png`):

- `<title>`: "umriss-ui – React component library, canvas charts, data table and Gantt schedule for data-dense dashboards"
- meta description: "Open-source React components for data-dense applications: a component library, canvas charts, a typed data table, a Gantt-style schedule and a calculation view. TypeScript, MIT, light and dark." (not visible on page)
- `<h1>umriss-ui</h1>` (1.6rem, weight 600 – modest)
- One grey paragraph: "React components for data-dense applications - dashboards, monitoring, planning. Each demo is the documentation of its package: running examples, their source, and the props generated from the code."
- Five white cards, one per package, all identical in weight, in fixed order core → charts → table → schedule → calculation. Each: `<h2>` link = monospace package name + version (`@umriss-ui/core 0.24.0`), the package.json description, then a wrapped run of underlined links to **every** page of that package (core: 54 links in 7 lines; table 30; schedule 26; charts 15; calculation 8). Descriptions verbatim:
  - core: "React component library for data-dense dashboards and tools - forms, date pickers, overlays, a tree view and a command palette. Precise, quiet, professional."
  - charts: "React canvas chart library for data-dense dashboards - line, area, bar, box plot, scatter, control and Pareto charts. Few chart kinds, drawn well, fast."
  - table: "React data table for data-dense applications - sorting, filtering, grouping, aggregates, virtualisation. Declared the way it reads: columns as JSX, typed against their rows."
  - schedule: "React Gantt-style schedule for data-dense applications - work on lanes over time, with dependencies, blocked time, findings and controlled editing."
  - calculation: "React calculation view for data-dense applications - a derivation written as it is shown, evaluated by the library, folded and read line by line."
- Footer: "Source on GitHub · llms.txt, for coding agents"

**What is NOT there:** no hero visual / screenshot / live component (the og-image `scripts/og-image.png` – a good-looking collage of date-range picker, multi-select, command palette, tree, kiln trend, alarm table, plan, OEE – exists but is used only as `og:image`, never shown on the page); no install command (`pnpm add …`) anywhere on the front page; no CTA button ("Get started", "Browse components"); no feature/value bullets (TypeScript, MIT, a11y, ISA-18.2/101, light/dark, German wording, canvas charts, llms.txt are only in meta/JSON-LD or not at all); no statement who it is for beyond "data-dense applications"; no differentiation vs MUI/AG Grid etc.; no npm/license/version badges; no link to npm; no changelog; no "what umriss is not" (ADR-0032); no theme toggle (follows `prefers-color-scheme` only); no favicon; no logo/wordmark; no navigation header. Package names are shown as npm scope strings, not product names ("Umriss Table" is what the demo header calls it). The page is effectively a sitemap for crawlers (comment `build-pages.mjs:140-141`: "every package, and under it every one of its pages - the links a crawler walks").

**Visual impression:** Clean, legible, calm – and empty of persuasion. 44rem column centred on a 1440 screen leaves ~65% of the viewport blank grey. All visual weight goes to ~130 underlined blue-grey links, which read as an index/footer, not as an invitation. Nothing moves, nothing shows what the components look like; a visitor must click into a demo to see a single pixel of UI. On mobile the core card alone is ~1.5 screens of links before charts appears. Dark mode works (system preference). Monospace package names render in a Courier-like fallback in some captures (`front_*_fold.png`) – font stack `ui-monospace, monospace` has no named font.

## 2. Per-package demo (shared shell)

### 2.1 Chrome (all five identical) – `packages/demo/src/Shell.tsx`, `shell.css`

- **Header** (sticky, 56px, translucent blur, `shell.css:35-49`): left brand + version ("Umriss UI 0.24.0", "Umriss Charts 0.9.0", "Umriss Table 0.11.2", "Umriss Schedule 0.3.16", "Umriss Calculation 0.4.8"); a search button "Search … ⌘K" (`Shell.tsx:221-229`); right a single core `Button` "Dark theme"/"Light theme" (`packages/*/demo/App.tsx`). **Nothing else**: brand links to the package's own Scenarios page (`Shell.tsx:210-220`), not to the site front page; no link to the other four packages, GitHub, npm, changelog, llms.txt (verified: the only header link is `/umriss-ui/core/`).
- **Sidebar** (244px, sticky, `shell.css:152-170`): "Scenarios" entry on top, then rubrics as uppercase headings with page counts (non-clickable by design, `Shell.tsx:11-14`), pages as buttons with a left track line; active = accent line + medium weight.
- **Content column**: max 1080px, centred.
- **Search**: Cmd-K / Ctrl-K / "/" opens the library's `CommandPalette` over pages + examples (~180 candidates in core), grouped by rubric/page, prefix-highlighting, hints "select / jump / close" (`core-palette_desktop_light.png`). Searches titles only, not prose/props.
- **Theme**: manual toggle per demo, initial = OS preference; **not persisted** (no storage; `App.tsx` `useTheme`) and not shared between packages/front page.
- **Locale switch**: none on the site (German wording exists as `@umriss-ui/core/wording/de` but is only shown on the core "Language" page). **Density/size switch**: none globally (shown per page: "Sizes", UmrissProvider).
- **On-this-page TOC**: none. **Prev/next links**: none. **Breadcrumbs**: only the rubric eyebrow above the H1. **Edit on GitHub / last updated**: none. **Playground/sandbox (StackBlitz/CodeSandbox)**: none. **Live prop editor**: none.
- **Cross-package links**: only (a) the "Built from" line under a scenario may link a neighbour package's page (`Scenarios.tsx:75-82`, `href.ts:25-27`), and (b) prose links like table First table's "→ Stat from @umriss-ui/core" (plain text, not linked). No package switcher.
- **Mobile (≤900px, `shell.css:262-282`; ≤560px `:285-304`)**: no hamburger/drawer – the sidebar is moved *below* the page content (`order: 1`); header keeps brand, a shortened search field and the theme button; version and ⌘K hint hidden. No horizontal page scroll (scrollWidth 390 on Select and Table home). On Select mobile the full page is 5445px; the 54-entry navigation follows the props table (`core-select_mobile_light_full.png`).
- **Document title** on client-side navigation is **not updated** (verified: load `/core/select/`, click "Button" → URL `/core/button/`, title still "Select – React component · @umriss-ui/core"). Titles are correct only on full loads (prerendered).
- **Sidebar does not scroll to the active entry** (verified: on `/core/tag/` the active "Tag" entry is below the rail's visible area). On desktop the visitor sees the first ~25 entries regardless of the page.
- **No favicon** (`packages/core/demo/index.html` has none; nothing in build-pages).
- **No-JS / crawler view**: legible unstyled prose with all examples' full source (`core-select_nojs_prerendered.png`), hidden via `visibility:hidden` once JS runs (`build-pages.mjs:93`).

### 2.2 Scenarios page = every package's landing (`packages/demo/src/Scenarios.tsx`)

Anatomy: eyebrow (brand, e.g. "UMRISS UI") · H1 **"Scenarios"** · package sentence · then per scenario: H2 job title · one lead sentence (persona at invented company) · live screen in a bordered stage with teal numbered badges · numbered list explaining the badges · "Built from" links · a bare "Code" toggle (no chevron, unlike examples, `Scenarios.tsx:117-125`).

Sentences (from `packages/*/demo/App.tsx`):
- core: "Whole screens of data-dense applications, built from these components as a product would ship them. Each is named after the job it serves, and its numbered marks point to the parts that do the work."
- charts: "Charts for data-dense applications: series, states and limits on shared axes, the marks on canvas and every label a reader has to read in the DOM. Each screen below is one a product could ship, built from them."
- table: "Tables for data-dense applications, where people search, filter, total and act on many rows: columns declared as elements and typed against their rows. Four screens from four worlds, each built from the pages in the sidebar."
- schedule: "Work on lanes over time, for the screens where people plan who does what and when: rotas, tours, sprints. Each scenario below is a screen as an application would ship it, with its dependencies, blocked time and findings, and the code that builds it."
- calculation: "A calculation shows how a figure on a data-dense screen came about - … Below, screens in which a reader checks a number before acting on it."

Scenarios: core 5 (Resolve an incident · Dispatch a tour · Approve spending against a budget · Set up a team · Watch a kiln line over a shift), charts 5, table 4, schedule 4, calculation 4. Page heights at 1440: core 6553px, charts 6169, table 4231, schedule 4239, calculation 3586.

Impression: **this is the strongest part of the site.** Real, dense, credible product screens (incident console with stepper, stat tiles, latency chart with objective; Gantt rota with leave hatching; calculation with alarm-tinted tiles) – far more convincing than the front page. But: the landing has no install line, no import, no "start here" pointer, and the H1 is the generic word "Scenarios" rather than the package's name/value. The first scenario sits directly under 3 lines of text, so above the fold you do see product UI (good).

### 2.3 Rubrics and page counts (from `packages/*/demo/outline.ts`)

| Package | Rubrics (pages) | Pages | Examples (files) |
|---|---|---|---|
| core | Getting started (3: Installation · UmrissProvider · Language) · Layout (5) · Typography (2) · Actions (3) · Forms (17) · Feedback (6) · Overlays (8) · Navigation (5) · Data display (5) | 54 | 228 |
| charts | Getting started (1) · Chart (2: Chart · Axis) · Series (7: Line · Area · Bar · BoxPlot · Scatter · StateBand · Matrix) · Limits and alarms (3: LimitLine · ControlChart · Pareto) · Around the chart (2: Tooltip & Legend · Benchmark) | 15 | 58 |
| table | Getting started (3: Installation · First table · Provider) · Columns (4) · Finding rows (5) · Grouping (3) · Rows (4) · Around the table (5) · Many rows (2) · Editing (2) · Limits and alarms (2) | 30 | 108 |
| schedule | Getting started (1) · Plan (9) · Time (4) · Reading (5) · Editing (6) · Findings (1) | 26 | 70 |
| calculation | Getting started (1) · Writing a calculation (5) · In practice (2) | 8 | 33 |

Total 133 pages, 139 sitemap addresses. Optional sections present (about / alternatives / keyboard / limits): core 49/50/31/48 of 54; charts 14/7/1/5 of 15; table 25/15/11/15 of 30; schedule 24/11/5/11 of 26; calculation 7/4/1/4 of 8. Pages without props tables: table 15 of 30, schedule 17 of 26 (feature/topic pages).

### 2.4 Component page anatomy (`packages/demo/src/Page.tsx:58-178`)

In order: rubric eyebrow (teal caps) → H1 name → lede → import line with "Copy" (`Page.tsx:25-36`) → "about" paragraphs → **hero example** (card with an *empty* header row containing only "› Code" (`Example.tsx:98-99`), lead sentence, live stage) → "EXAMPLES" section heading with checkbox "all examples with code" → example cards (title H3, "› Code" toggle, lead, stage; code collapsed) → "WHEN TO USE SOMETHING ELSE" (bullets "situation → Link") → "KEYBOARD" (Key/Action table with `<kbd>`) → "API" (one table per type) → "KNOWN LIMITS" bullets + fixed line "What umriss deliberately does not build, and why: ADR-0032." (link to GitHub markdown).

- **Example code**: collapsed by default; per-example toggle, page-wide toggle; when open: grey block, "TSX" label, Copy button, `sugar-high` highlighting in muted teal/green, full runnable file (imports + `export default function`) (`core-button_desktop_light_code-open.png`). No line numbers, no file tabs, no "open in sandbox", no TS/JS toggle (deliberately refused).
- **Copy**: `CopyButton.tsx` – "Copy" → "Copied"/"Failed" for 1.6s.
- **Props table** (`PropsTable.tsx:66-108`): columns **Name · Type · Default · Description**; required marked `*`; types in teal mono; default "—" when none; events split into a separate "Events" table only for table and schedule (`eventsApart`); inherited attributes as one sentence ("Also takes every attribute of `<select>` – without `size`."). No search/filter in the table, no anchors per prop, no collapsible long types.
- **Prose voice**: precise, terse, unusual English ("Starts one action when pressed: save, send, deploy, delete. Its variant says how much weight the action carries beside its neighbours…"; Select: "One choice from a short, known list (dropdown). Under a mouse and the keys it opens the Combobox's list; under a finger the system's picker, a wheel on the phone."). Synonyms in parentheses for search. Internal references leak into user text: ADR numbers ("(ADR-0021)", "(ADR-0036)", "(ADR-0042)") and requirement IDs in charts props ("Y value; null/undefined/NaN/±Infinity means a gap (R-2.5)", "Binding to an x axis (R-4.12)" – `charts-line_desktop_light_full.png`).

Example pages observed:
- **core/select** (2260px): lede, import, 2 about paragraphs, hero (one empty Select), 2 examples (States; Clear the choice), 3 alternatives, 5-row keyboard table, SelectProps (5 rows), 1 known limit. Only 3 examples for a central form control.
- **core/button** (2730px): similar.
- **table/table ("First table")** (4602px): one hero example (4-row table), alternatives, then API = `TableProps<Z>` (~25 rows) + Events + `TableOptions<Z>` (~12) + `TableSnapshot<Z>` (~50 rows) – the page is ~80% props tables; no further examples. Note the URL is `/table/table/` while the sidebar says "First table".
- **charts/line** (3188px): hero + 3 examples with real-looking data, 2 alternatives, LineProps (13 rows), 1 limit. Charts look good.

## 3. Getting started / installation / theming / guides

- Exists only **inside each demo** as the rubric "Getting started": core `/core/installation/`, `/core/umrissprovider/`, `/core/language/`; charts `/charts/getting-started/`; table `/table/installation/`, `/table/table/` (First table), `/table/provider/`; schedule `/schedule/installation/`; calculation `/calculation/installation/`.
- core Installation (`core-installation_desktop_light_full.png`): the install command appears **only as inline code inside a paragraph** ("Install with `pnpm add @umriss-ui/core` (React 18 or newer)"), not as a copyable block; no npm/yarn variants; then tokens/fonts/light-dark paragraphs, a hero ("Acknowledge the incident" button), examples "Override tokens" and "Light and dark", known limits (browsers Chrome 123/Firefox 120/Safari 17.5).
- **Theming**: no dedicated page; covered in core Installation ("Override tokens", "Light and dark"), the token list itself is not browsable on the site (`docs/design-language.md` is GitHub-only). No colour/spacing/typography token reference page.
- **Guides/tutorials, migration, FAQ, changelog, accessibility statement, standards (ISA-18.2/101), "what umriss is not"**: not on the site; they live in the repo (`docs/standards.md`, `docs/adr/0032-…`, `packages/*/CHANGELOG.md`, `README.md` Quick start) and are reachable only via the GitHub footer link or the ADR-0032 link at page bottoms.
- The repo `README.md` has a proper "Quick start" (`pnpm add @umriss-ui/core` + `import { Button, Card }` + token override CSS) – this content is absent from the front page.

## 4. AI docs

- `site/llms.txt` (root): "# umriss" + blockquote "React components for data-dense applications - dashboards, monitoring, planning: a component library, canvas charts, a table, a schedule and calculations, in English and German. Each package's demo is its documentation…", note that each npm package carries `docs/llms-full.md`, then one line per package linking its `llms.txt` and `llms-full.txt`. (Heading says "umriss", front page says "umriss-ui".)
- `/<pkg>/llms.txt` (4–17 kB): title, description, "Version 0.24.0. Install with `pnpm add @umriss-ui/core`…", then "## Scenarios" (one line each, anchor links) and one `##` per rubric with every page "[Name](url): lede".
- `/<pkg>/llms-full.txt` (core 580 kB, table 362 kB, charts 362 kB, schedule 258 kB, calculation 130 kB; 1.7 MB total): every scenario (callouts, "Built from", full source) and page (lede, import, about, every example's full source, props tables, limits), generated by `packages/demo/src/tooling/llms.ts`. Same file ships in npm as `docs/llms-full.md`. No MCP server (deliberate, ai-readable-docs A3: "A later spec if the full file passes ~200 kB" – core is now 580 kB).
- Linked from the front page footer only; not linked from inside the demos.

## 5. Visual impression (from the screenshots)

**Front page** – honest verdict: tidy but uninviting. Reads like an auto-generated index (it is one). No image, no colour beyond grey, no motion, no hierarchy among packages, no "why should I care". A first-time visitor arriving from search gets one sentence and a wall of 133 links. The strongest asset (the og-image collage and the scenario screens) is invisible here. Large empty margins at 1440px.

**Package landings (Scenarios)** – inviting. Dense, realistic, consistent UI with a restrained palette (near-black primary, teal accent, red/amber only for state). Teal numbered callout badges give a guided-tour feel. Good typographic hierarchy (eyebrow → 32px H1 → sentence → H2). Weaknesses: the H1 "Scenarios" is the same on five sites; very long pages (4–6.5k px) with no in-page nav; callout badge 5 overlaps the "Checkout slow…" title on mobile (`core-home_mobile_light_fold.png`); table scenario shows a red "No connection · 199 days ago" freshness warning (`table-home_desktop_light_fold.png`) because data is pinned to March 2026 while freshness is computed against now (`packages/table/demo/scenarios/01-work-through-the-alerts.tsx:7` `new Date(2026, 2, …)`, `:158` `freshness={{ stale: 5*MIN, lost: 30*MIN }}`) – looks like a broken demo. Mobile tables are clipped/horizontal-scroll inside the stage with pinned action column overlapping (`table-home_mobile_light_scrolled.png`).

**Component pages** – professional, quiet, Linear/Vercel-docs-like; generous whitespace; good dark mode (`core-select_desktop_dark_fold.png`). But: (1) the hero example card starts with an empty header bar containing only "› Code" – a dead strip at the most prominent spot; (2) examples are small and sparse (Select: 3), with lots of white card area; (3) code is hidden by default so the page shows little code at first glance (contrary to the MUI model the original brief asked for, though deliberate); (4) section headings ("EXAMPLES", "API") are tiny 11px caps – weak scanability without a TOC; (5) props tables dominate data-heavy pages (table First table ≈ 80% API); (6) no imagery/illustration/icons anywhere in the chrome; no motion beyond the 1.4s highlight on deep-link jump.

## 6. Concrete weaknesses (with locations)

1. **Front page has no value proposition, visual, install command or CTA** – `scripts/build-pages.mjs:177-188` (single `<p>`, cards with link runs, footer). og-image exists (`scripts/og-image.png`) but is not displayed.
2. **Front page is a link dump** – every page of every package listed (`build-pages.mjs:183`), 54 links for core; mobile scroll ~4 screens before calculation.
3. **No way back from a demo to the site front page or to sibling packages** – brand link goes to own Scenarios (`packages/demo/src/Shell.tsx:210-220`); header has no package switcher/GitHub/npm (`Shell.tsx:209-231`).
4. **Document title not updated on client navigation** – `Shell.tsx:121-129` `goTo` pushes history only; no `document.title` anywhere in `packages/demo/src`.
5. **Active sidebar entry not scrolled into view** – `Shell.tsx:234-267`; no `scrollIntoView` for the rail.
6. **No on-this-page TOC, no prev/next** – `Page.tsx` renders sections only; research doc noted "with a table of contents keeps Ctrl+F working" (`research-component-pages.md:131`).
7. **Mobile: no nav drawer; navigation sits after the whole page** – `shell.css:262-282`. Only path to another page on a phone is the search field.
8. **Hero example has an empty header row** – `Example.tsx:98-99` renders `<span className="exampleTitle" />` beside the Code toggle.
9. **Scenario "Code" toggle lacks the chevron and card styling of example toggles** – `Scenarios.tsx:117-125` (visually a stray word "Code").
10. **Theme choice not persisted and per-demo** – `packages/*/demo/App.tsx` `useTheme` (state only); front page has no toggle at all. Five copies of the same `useTheme` code.
11. **Landing H1 is the generic "Scenarios"** for all five packages – `Scenarios.tsx:138-140`; package name only as eyebrow.
12. **Install command not a copyable block**; only inline in prose – `packages/core/demo/outline.ts` Installation `about[0]`. Front page: none.
13. **Stale-time artefact in table scenario** ("No connection · 199 days ago" in red) – `packages/table/demo/scenarios/01-work-through-the-alerts.tsx:7,158`. Likely similar risk wherever `freshness` + fixed dates are combined.
14. **Internal IDs leak into user-facing docs** – requirement IDs "R-2.5", "R-4.12" in charts props descriptions (from JSDoc in `packages/charts/src`), ADR numbers in prose and props.
15. **Naming inconsistency**: "umriss" (`site/llms.txt` H1, README H1), "umriss-ui" (front page), "Umriss UI / Umriss Charts …" (demo headers), "@umriss-ui/core" (front page cards); demo `index.html` default title "Umriss UI – Component overview" (`packages/core/demo/index.html:6`).
16. **"First table" lives at `/table/table/`** – page id `table` vs. name "First table" (`packages/table/demo/outline.ts`).
17. **No favicon, no logo/wordmark** anywhere.
18. **Theming/tokens/design language, accessibility, standards, changelog, ADR-0032 not on the site** – only GitHub (`docs/design-language.md`, `docs/standards.md`, `packages/*/CHANGELOG.md`).
19. **Palette searches names/titles only**, not ledes, props or prose – `Shell.tsx:60-83`.
20. **No playground / sandbox / live prop controls**; examples are fixed files.
21. **llms-full grew past the self-set 200 kB MCP threshold** (core 580 kB) – `.scratch/ai-readable-docs/spec.md` A3; llms.txt not linked from inside the demos.
22. **Front-page monospace falls back to a Courier-like font** – `build-pages.mjs:163` `code { font: 600 .95rem ui-monospace, monospace }`.

## Strengths worth keeping (for the comparison)

- Prerendered, crawlable per-page URLs with canonical/og/JSON-LD/sitemap and a build guard (`build-pages.mjs:239-265`).
- Consistent, disciplined page skeleton across 133 pages; "When to use something else", "Keyboard" and "Known limits" sections are above-average vs. most libraries.
- Props tables generated from source; examples are runnable single files, copyable as-is.
- Scenario pages with numbered callouts and "Built from" – genuinely distinctive and convincing.
- Cmd-K palette over pages + examples; deep-linkable examples with highlight on jump.
- Solid dark mode; mobile has no horizontal page overflow.
- llms.txt / llms-full per package, version-pinned copy in npm.
