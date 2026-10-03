# Front pages of UI component library documentation sites (state of the art, 2025–2026)

Method note: the live sites were fetched on 2026-10-02 with a fetcher that turns HTML into text. Content rendered only on the client may therefore be missing. Base UI's "no live components" in particular may be an artifact of the fetch, and Tailwind Plus redirected to a login page. Observable Plot returned HTTP 429 twice, and visx (visx.airbnb.tech) returned an empty page. Where a description below comes from the fetch, it is cited. Anything from general knowledge is marked "(unverified)" or moved to Gaps.

## 1. How are the front pages of the leading libraries structured?

### Takeaway
The best front pages put real, working components in or right below the hero. They follow it with an opinionated one-line promise and two calls to action ("Get started" plus "View/Explore components" or "Demos"). Below that, a few sections each prove one capability with a live demo, then social proof, then a "start here" block. The weaker or older pages (MUI X, Highcharts, Bryntum, ECharts, AG Grid's landing) lean on screenshots, logos and adjectives.

### Cited Findings
**shadcn/ui** (https://ui.shadcn.com)
- Headline: "The Foundation for your Design System". Subheadline: "Composable, accessible components with thoughtful defaults. Build your own component library with code you can customize, extend, and make your own." — [shadcn/ui](https://ui.shadcn.com)
- Two calls to action: "Get Started" (→ /docs/installation) and "View Components" (→ /docs/components). — [shadcn/ui](https://ui.shadcn.com)
- Real live components are rendered (Button variants, Badge, Alert Dialog, Dialog). There is a full-page dashboard example in light and dark versions. — [shadcn/ui](https://ui.shadcn.com)
- Top navigation: Docs, Components, Blocks, Charts, Directory, Typeset, Create. GitHub star count "125k". A "New" badge and changelog callout point at the latest component ("Questionnaire"). — [shadcn/ui](https://ui.shadcn.com)
- No install command on the front page. Installation sits one click away. — [shadcn/ui](https://ui.shadcn.com)

**Mantine** (https://mantine.dev)
- Headline: "A fully featured React components library". Subheadline: "Build fully functional accessible web applications faster than ever – Mantine includes more than 120 customizable components and 70 hooks to cover you in any situation". Calls to action: "Get Started" and "GitHub". — [Mantine](https://mantine.dev)
- Live interactive component showcase (text/number input, date range picker, color input, tree select, file input, select/multiselect), grouped in tabs "Inputs", "Overlays", "Navigation". — [Mantine](https://mantine.dev)
- Hooks section: three hooks (use-move, use-resize-observer, use-hotkeys), each with a working demo and code you can expand. — [Mantine](https://mantine.dev)
- Styling section with a CSS code example (dark/light mixins, RTL). — [Mantine](https://mantine.dev)
- An "Extensions" grid of 5 packages (Rich text editor, Notifications, Spotlight, Carousel, Charts), each with a visual preview. A Form section has a live form and the claim "6.3kb minified + gzipped". — [Mantine](https://mantine.dev)
- A section on AI integration: documentation optimised for LLMs, agent skills, MCP server. — [Mantine](https://mantine.dev)
- Social proof: "30,000+ Stars on GitHub", "5M+ Monthly downloads", "12,000+ Discord members", and 6 developer testimonials. Framework templates: Vite, Next.js, React Router, Redwood, Gatsby. — [Mantine](https://mantine.dev)

**MUI** (https://mui.com)
- Headline: "Move faster with intuitive React UI tools". The subheadline names a starting point: "Start with Material UI, our fully-loaded component library, or bring your own design system to our production-ready components." One call to action: "Discover the Core libraries". — [MUI](https://mui.com)
- The family is shown as 4 groups: Material UI, MUI X ("advanced components for complex use cases"), Templates, Design kits. — [MUI](https://mui.com)
- "Why build with MUI": "Timeless aesthetics", "Intuitive customization", "Unrivaled documentation", "Dedicated to accessibility". — [MUI](https://mui.com)
- Social proof: logos (Spotify, Amazon, NASA, Netflix, Unity, Shutterstock), the figures 5.8M weekly npm downloads, 93.9k stars, 3.0k contributors, testimonials, sponsors. — [MUI](https://mui.com)

**MUI X** (https://mui.com/x/)
- Headline: "Performant advanced components". It uses screenshots and code snippets, not live demos. — [MUI X](https://mui.com/x/)
- A roadmap shown on the product page: 4 stable components (Data Grid, Date and Time Pickers, Charts, Tree View), 2 in preview (Scheduler, Chat), 3 future (Rich Text Editor, Upload, Gantt). — [MUI X](https://mui.com/x/)
- Tiers: Community "Free forever", Pro, Premium, with "Get started" / "Learn about licensing" / "Compare plans". — [MUI X](https://mui.com/x/)

**React Aria** (https://react-aria.adobe.com, moved off react-spectrum.adobe.com/react-aria with a 301)
- Headline: "Craft world-class accessible components with custom styles." Subheadline: "Over 50 components with built-in behavior, adaptive interactions, top-tier accessibility, and internationalization out of the box, ready for your styles." Calls to action: "Get started" and "Explore Components". — [React Aria](https://react-aria.adobe.com/)
- Hero showcase: a live example app inside a browser-window frame (a search interface). Annotations point to the components it is built from (Popover, Tooltip, SearchField, Table, Modal, Checkbox, ToggleButton, Menu), and there is a "View example source" link. — [React Aria](https://react-aria.adobe.com/)
- Six sections, each with a live proof: Styling ("Bring your own styles", with code for DatePicker/ComboBox/Slider in vanilla CSS, Tailwind and styled-components); Advanced features (a Kanban board with drag and drop); Interactions (touch, mouse, keyboard, focus cards); Accessibility (iPhone mockup demo); Internationalization ("translations in over 30 languages", several calendar systems); Customization (code cards you can scroll). — [React Aria](https://react-aria.adobe.com/)
- Closes with three cards: "Install and Setup", "View Components", "Explore Examples". — [React Aria](https://react-aria.adobe.com/)
- Release notes for the new site describe docs that are "more concise", that make "greater use of interactive examples using prop controls", that offer "real-world app examples", and that have a search "with image previews, category and library filtering", plus "AI-friendly page markdown, and MCP servers". — [React Spectrum releases (search summary)](https://react-spectrum.adobe.com/v3/releases/). I could not open the exact release page (v1.14.0) to verify the wording; see Gaps.

**Base UI** (https://base-ui.com)
- Headline: "Unstyled UI components for building accessible user interfaces". The credibility line is about the creators: "From the creators of Radix, Floating UI, and Material UI…". One call to action: "Documentation". — [Base UI](https://base-ui.com)
- Unusual, personable sections: "Made for the makers" (users: Paper, GitHub, Zed, Unsplash…), "So you know who to blame" (8 team members by name), and a FAQ titled "The fine print". The fetch showed no live components, possibly an artifact of the fetch. — [Base UI](https://base-ui.com)

**Radix** (https://www.radix-ui.com)
- The family is in the top navigation: Themes, Primitives, Icons, Colors. Headline: "Start building your app now". Copy: "Just import and go—no configuration required." The hero shows a 2-line import snippet. Calls to action: "Get started" and "Playground". Below that come realistic app compositions (team management, notifications, pricing, sign-up form). — [Radix](https://www.radix-ui.com)

**Chakra UI** (https://chakra-ui.com)
- Headline: "Chakra UI is a component system for building products with speed". Call to action: "Start Building". The install command `npm i @chakra-ui/react` is shown on the front page. — [Chakra UI](https://chakra-ui.com)
- Live components (Slider, Pin Input, Tabs, Menu, Switch). A "Design System" section with 3 pillars (Tokens, Typography, Recipes), each with code. A paid offer ("Chakra Pro"). Stats: 6.2M monthly downloads, 40.7K stars. — [Chakra UI](https://chakra-ui.com)

**Park UI** (https://park-ui.com)
- Headline: "Build your own Design System". Calls to action: "Get Started" and "Make it yours" (theme customisation). A banner reads "Park UI × Chakra — It's official!" — [Park UI](https://park-ui.com)

**HeroUI** (https://www.heroui.com)
- Positioned by comparison in the hero: "The modern alternative to MUI, Chakra UI, and shadcn/ui". A "Start here" block links to docs, React components, Native components and GitHub. There are prominent "Agent resources" and "MCP and skills" sections. — [HeroUI](https://www.heroui.com)

**Tremor** (https://tremor.so)
- Headline: "React components to build charts and dashboards". Subheadline: "35+ fully open-source, accessible components for dashboards and charts." Calls to action: "Get started" and "Blocks & Templates". — [Tremor](https://tremor.so)
- The hero is a collage of working dashboard parts (KPI card, payment metrics, date range picker, sliders, multi-select filters, uptime tracker 99.9%, spark charts, data bars, progress circles). "Live examples rather than static screenshots." — [Tremor](https://tremor.so)
- "Get started in seconds — Copy-and-paste or NPM package? We have it." Two install paths side by side, with a DonutChart code sample. Six template cards with images. Tweets as testimonials (Guillermo Rauch). A "Tremor is joining Vercel" banner. — [Tremor](https://tremor.so)

**AG Grid** (https://www.ag-grid.com)
- Headline: "The Best Grid in the World". Calls to action: Free Trial, Buy Now, See demos, View on GitHub. — [AG Grid](https://www.ag-grid.com)
- Numbers come first: "90% — Of the Fortune 500 use AG Grid", "5M+ Weekly NPM downloads", "13k+ GitHub Stars". A performance claim: "Handle millions of rows, and thousands of updates per second". — [AG Grid](https://www.ag-grid.com)
- Sections link to the Theme Builder, AG Charts integration, an industry showcase (Finance, AI, Aerospace) and the release cadence ("Minor releases every 6 weeks…"). The latest 3 versions with highlights. A FAQ covers licence, frameworks and competitors. No live grid in the fetched content. — [AG Grid](https://www.ag-grid.com)

**Highcharts** (https://www.highcharts.com)
- Headline: "Powerful Data Viz for real-world apps … trusted by 80 of the world's largest 100 companies". Calls to action: "Try for Free" and "Buy Now". Framework logos. The product family (Core, Stock, Maps, Gantt, Dashboards, Grid) appears only in the footer navigation. — [Highcharts](https://www.highcharts.com)

**Apache ECharts** (https://echarts.apache.org)
- Tagline: "An Open Source JavaScript Visualization Library". Calls to action: "Get Started" and "Demo" (the examples gallery). Six feature tiles (chart types, rendering of "10 million data in realtime", data analysis, visual design, community, accessibility). An academic paper as credibility. — [ECharts](https://echarts.apache.org/en/index.html)

**Bryntum** (https://bryntum.com)
- Headline: "World Class Web Components For Scheduling". Calls to action: "Download Trial" and "View Examples". Each product (Scheduler Pro, Gantt, Calendar, Grid, Task Board) has a one-sentence description, a "Read More" link and a simple SVG illustration. Framework logos, review-site badges (Capterra, GetApp), customer testimonials, "Schedule a 30 Minute Call". — [Bryntum](https://bryntum.com)

**FullCalendar** (https://fullcalendar.io)
- "The Most Popular JavaScript Calendar". Calls to action: "Get started" and "View demos". Per-framework install and code snippets (Angular, vanilla, React, Vue). Customer logos. "9M+ NPM downloads per month", "130M+ CDN downloads". An open-core promise: "will always have a free and open source core". — [FullCalendar](https://fullcalendar.io)

### Inferences
- The 2025–26 consensus hero has three parts: (a) a one-sentence promise that names the category and the differentiator; (b) exactly two calls to action, one to get started and one to explore (components, examples or demos); (c) proof you can interact with. shadcn, React Aria, Tremor, Mantine and Chakra all follow it. Commercial grid, chart and scheduler vendors (AG Grid, Highcharts, Bryntum) still lead with superlatives ("Best Grid in the World", "World Class") and Fortune-500 stats. That pattern is aimed at enterprise buyers, not at developers who want to explore.
- The strongest single pattern for a family of composable parts is React Aria's annotated example app: a realistic app in a browser frame, with each part labelled by its component name and linked to its source. It shows quality, the breadth of the catalogue and how the parts combine, all at once. It fits a library whose docs are its demos especially well.
- "Section = one capability + one live proof" (React Aria's 6 sections, Mantine's hooks/form/styling sections) beats grids of feature icons. ECharts and MUI's "Why build with MUI" tiles are the dated form: adjectives without demos.

### Gaps
- Tailwind Plus/Catalyst (redirected to login), Observable Plot (HTTP 429) and visx (empty render) could not be fetched. From general knowledge (unverified): Observable Plot's front page is a hero over a dense grid of real chart thumbnails linking to its gallery, and visx's front page is a gallery of live chart tiles.
- Ark UI, AG Charts' own front page and Highcharts' demo gallery were not fetched.

## 2. How do they present a family of several packages?

### Takeaway
The clear pattern is to name a default entry point and present the rest as additions, each with its own visual tile. Mantine (core + an "Extensions" grid with previews) and MUI ("Start with Material UI … or bring your own design system"; MUI X as "advanced components") do this best. Bryntum's per-product sections with one sentence each are clear but static. Highcharts hides its family in the footer, which is an anti-pattern.

### Cited Findings
- MUI's subheadline says where to start ("Start with Material UI, our fully-loaded component library…") and groups the family into 4 tiles: Material UI / MUI X / Templates / Design kits. — [MUI](https://mui.com)
- MUI X's product page shows maturity per component (stable / preview / future) and licence tiers. — [MUI X](https://mui.com/x/)
- Mantine shows its extension packages as a 5-tile grid with visual previews, after the core showcase. The form package gets its own section with a size claim. — [Mantine](https://mantine.dev)
- Radix puts its family (Themes, Primitives, Icons, Colors) in the top navigation. — [Radix](https://www.radix-ui.com)
- Bryntum gives each product a section with a one-sentence role ("supports inter-task dependencies, constraints and working time calendars"; "a full calendar solution with day, week, month, year and agenda views"), an illustration and "Read More". — [Bryntum](https://bryntum.com)
- Highcharts lists its product family only in the footer. The front page centres on framework logos. — [Highcharts](https://www.highcharts.com)
- AG Grid presents its sibling AG Charts as an integration feature inside the grid page, not as a peer. — [AG Grid](https://www.ag-grid.com)
- shadcn turns its sub-offerings (Components, Blocks, Charts, Directory) into top-level navigation items. — [shadcn/ui](https://ui.shadcn.com)

### Inferences
- For umriss (core, charts, table, schedule, calculation): one tile per package, each with a live miniature of the package's real output (a chart, a table, a Gantt strip, a calculation sheet), a one-line role and its dependency ("needs core"). Say "Start with core" explicitly, as MUI does. Bryntum's one-sentence-per-product copy is a good model for the descriptions. Its static SVG illustrations are not.
- Showing maturity or status per package (MUI X) builds trust when packages are at different versions (core 0.24 vs schedule 0.3).

### Gaps
- No library author post-mortem on presenting a package family was found within the budget.

## 3. What do component overview / gallery pages look like?

### Takeaway
The range runs from a bare alphabetical list (shadcn's components index) to visual search with image previews and filtering (React Aria's new docs). The richer state of the art is thumbnails per component plus categories, search with previews and filters, and separate galleries for "blocks" and "templates".

### Cited Findings
- shadcn's /docs/components is a "simple alphabetical list" of about 80+ plain-text links. It has no thumbnails or categories. Visual browsing is pushed to the separate Blocks and Charts galleries and a community "Directory" of registries. — [shadcn components](https://ui.shadcn.com/docs/components)
- React Aria's redesigned docs: a search "with image previews, category and library filtering", "more component examples", "real-world app examples", and examples made interactive with prop controls. — [React Spectrum releases (search summary)](https://react-spectrum.adobe.com/v3/releases/)
- Mantine's front page groups live components into categories shown as tabs ("Inputs", "Overlays", "Navigation"). — [Mantine](https://mantine.dev)
- Tremor and shadcn separate "Blocks & Templates" (300+ block examples at Tremor) from primitive components. — [Tremor](https://tremor.so); [shadcn/ui](https://ui.shadcn.com)

### Inferences
- shadcn gets away with a bare list because its front page and Blocks/Charts carry the visual load. A smaller or lesser-known library cannot. A thumbnail grid (ideally live miniatures rather than images) with categories and a filter is the stronger discovery surface.
- The command palette (⌘K) for search, as on Base UI, is now standard. Previews in search results (React Aria) are the 2025–26 upgrade.

### Gaps
- MUI's and Mantine's component overview pages were not fetched. React Aria's /components page was not fetched directly.

## 4. Which onboarding paths exist?

### Takeaway
Two calls to action ("Get started" → installation; "Explore/View components") are universal. The modern additions are: two install paths side by side (Tremor: copy-paste vs npm), per-framework templates (Mantine), "View example source" on showcase apps (React Aria), and resources for AI agents (llms.txt / markdown pages, MCP servers, agent skills: Mantine, HeroUI, React Aria).

### Cited Findings
- Tremor: "Get started in seconds — Copy-and-paste or NPM package? We have it." Two paths, with a code sample. — [Tremor](https://tremor.so)
- Chakra shows `npm i @chakra-ui/react` on the front page. Radix shows a 2-line import with the line "Just import and go—no configuration required". — [Chakra UI](https://chakra-ui.com); [Radix](https://www.radix-ui.com)
- FullCalendar shows per-framework install and usage snippets on the front page. — [FullCalendar](https://fullcalendar.io)
- Mantine lists starter templates per framework (Vite, Next.js, React Router, Redwood, Gatsby). — [Mantine](https://mantine.dev)
- React Aria ends with three cards: "Install and Setup", "View Components", "Explore Examples". Its hero app links to "View example source". — [React Aria](https://react-aria.adobe.com/)
- AI-agent onboarding is now a front-page feature: Mantine (documentation optimised for LLMs, agent skills, MCP), HeroUI ("Agent resources", "MCP and skills"), React Aria ("AI-friendly page markdown, and MCP servers"). — [Mantine](https://mantine.dev); [HeroUI](https://www.heroui.com); [React Spectrum releases](https://react-spectrum.adobe.com/v3/releases/)
- "Time to hello world" is the standard developer-experience metric for a developer's first impression. The common targets are a first success within ~5 minutes and a real task within ~30. Sample code is named as the main lever. — [Instruqt glossary](https://instruqt.com/glossary/time-to-hello-world); [Axway](https://blog.axway.com/learning-center/apis/enterprise-api-strategy/api-program-time-first-hello-world). These are vendor/industry sources, not controlled research.

### Inferences
- For a library whose docs are its demos, the shortest path to "hello world" is: copy the code of the live thing you are looking at. "View source" or "copy" on every showcase item matters more than a separate quick-start page.
- An "open in StackBlitz/CodeSandbox" button did not show up on any fetched front page. In 2025–26 it seems to have moved into the example pages, and "copy prompt / MCP" is partly replacing it.

### Gaps
- I did not verify which libraries currently offer StackBlitz/CodeSandbox buttons on example pages.

## 5. What do docs-UX experts and research say about first impressions and onboarding?

### Takeaway
Diátaxis supports separating the learning path (tutorial) from the goal paths (how-to), the facts (reference) and the "why" (explanation). A landing page should route visitors to each mode, not mix them. The developer-experience literature treats time-to-first-success as the main metric and code samples as the main lever. I found no direct NN/g study of component-library front pages.

### Cited Findings
- Diátaxis's four modes: "A tutorial is a lesson that takes a student by the hand through a learning experience"; "A how-to guide addresses a real-world goal or problem"; "Reference guides contain the technical description - facts"; "Explanatory guides provide context and background and help answer the question why?" — [Diátaxis](https://diataxis.fr/start-here/)
- NN/g heuristic #10 (help and documentation) and its studies of developers using UI standards: designers and developers "relied heavily on examples in the standard". In one study they caught only 4 of 12 deviations, and 53% found the rules hard to remember. — [NN/g: Assessing the Usability of a UI Standard](https://www.nngroup.com/articles/assessing-usability-user-interface-standard/) (an older study, via the search snippet)
- The importance of time-to-hello-world and sample code: see section 4. — [Instruqt](https://instruqt.com/glossary/time-to-hello-world)
- Tom Johnson / docsbydesign argue for going "from getting started to getting finished", i.e. supporting the real task after hello world. — [docsbydesign](https://docsbydesign.com/2018/02/25/fom-getting-started-to-getting-finished/) (title only, not fetched)

### Inferences
- The NN/g finding that people building interfaces rely on examples more than on rules supports "docs are demos". It also argues for making the examples copyable and realistic (the React Aria and Radix compositions of real apps), not abstract.
- Diátaxis mapping for a front page: "Get started" = tutorial; showcase and example apps = how-to; component index = reference; "why umriss / ink & paper / HMI principles" = explanation. A front page that sends people clearly to each mode is "inviting" in a functional sense.

### Gaps
- The NN/g article URL on developer docs I tried (/articles/developer-documentation/) returned 404. I found no current (2025–26) NN/g research specific to developer-docs landing pages.
- No developer survey (State of JS, Stack Overflow) data on how developers choose UI libraries was retrieved.
- No MUI, Mantine or Tailwind docs-redesign post-mortem was retrieved.

## 6. Which visual patterns read as state of the art in 2025–2026, and which patterns drive adoption versus decorate?

### Takeaway
State of the art means real components rendered on the page in a realistic composition, light/dark parity shown as such, one strong typographic hero line and little chrome. Discovery and adoption come from live proof, copyable code, visual catalogues, a stated starting point, a "New" or changelog signal and AI/agent resources. Decoration includes testimonial walls, superlative headlines, grids of feature icons with adjectives, and logo walls (these only matter to enterprise buyers).

### Cited Findings
- shadcn shows its dashboard example in both light and dark versions on the front page. — [shadcn/ui](https://ui.shadcn.com)
- Device and browser frames around live demos: React Aria (a browser window around the example app; an iPhone mockup for mobile accessibility). — [React Aria](https://react-aria.adobe.com/)
- Collage of dashboard parts as the hero (Tremor). — [Tremor](https://tremor.so)
- Signals of freshness: shadcn's "New" component callout; AG Grid's latest 3 versions; ECharts' "6.1 is out!" banner; Radix's "Read about Radix Themes 3.0". — [shadcn/ui](https://ui.shadcn.com); [AG Grid](https://www.ag-grid.com); [ECharts](https://echarts.apache.org/en/index.html); [Radix](https://www.radix-ui.com)
- A personal, human voice: Base UI's "So you know who to blame" (team) and "The fine print" (FAQ). — [Base UI](https://base-ui.com)
- Quantified claims tied to demos: Mantine "6.3kb minified + gzipped" next to a live form; AG Grid "millions of rows, thousands of updates per second". — [Mantine](https://mantine.dev); [AG Grid](https://www.ag-grid.com)

### Inferences
- **Drives discovery and adoption:** (1) live components in the hero, ideally a realistic annotated app (React Aria) or collage (Tremor); (2) one section per capability, each with an interactive proof (React Aria, Mantine); (3) a family tile grid with live previews and an explicit "start here" (Mantine Extensions, MUI); (4) a visual component catalogue with categories and search with previews (React Aria); (5) code you can copy next to every demo, plus "view source"; (6) a changelog or "New" signal; (7) AI/MCP/llms resources, now expected in 2026.
- **Mostly decoration for an open-source developer library:** walls of testimonials and tweets, superlative headlines, grids of icons with adjectives ("Timeless aesthetics"), Fortune-500 logo walls and sponsor tiers. These serve commercial and enterprise trust (AG Grid, Highcharts, Bryntum) or community signalling. Star counts are cheap, but at small numbers they can backfire.
- For umriss's "ink & paper" industrial/HMI identity, the main lever for "inviting" is a dense, realistic HMI or control-room composition built from all five packages, live and annotated. A playful one-thing-at-a-time animation would work against that identity.
- Motion, typography and density trends for 2025–26 were not measured from sources here. Any claims about them (e.g. subtle entrance animation, large display typography, tight grids) are unverified impressions.

### Gaps
- No source-backed analysis of 2025–26 visual trends (motion, typography, density) on docs sites was retrieved.
- The theme playgrounds (shadcn "Create"/themes, Park UI "Make it yours", Radix "Playground", AG Grid Theme Builder) are referenced on the front pages but their pages were not fetched.
