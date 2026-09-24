# Headless / accessibility-first React libraries (2025–2026) as the benchmark for umriss

Research date: 2026-09-24. The sources are mostly primary: vendor docs, release notes and changelogs. Secondary comparisons are marked as such. WebFetch summaries were produced by a small model, so any quote marked "quoted" is reproduced as returned.

## 1. Component and pattern coverage

### Takeaway
React Aria covers the most complex patterns by a wide margin: date and time, colour, Table and Tree with virtualisation and drag and drop, TagGroup, GridList, Toast. Base UI and Radix cover the "overlay + form control" core well but have no date, table, tree or DnD. Ark UI is the only one besides React Aria that has a date picker, a colour picker and a tree view. shadcn/ui is a distribution layer on top of these libraries.

### Cited Findings
- React Aria: "Over 50 components with built-in behavior, adaptive interactions, top-tier accessibility, and internationalization out of the box"; accessible drag and drop, with a Kanban example — [React Aria home](https://react-aria.adobe.com/)
- React Aria, March 2025: Toast, Tree and Virtualizer introduced. A later 2025 release made Tree and Virtualizer GA, with Toast in alpha — [React Spectrum release 2025-03-05](https://react-spectrum.adobe.com/v3/releases/2025-03-05.html); [release 2025-06-05](https://react-spectrum.adobe.com/v3/releases/2025-06-05.html)
- React Aria v1.17.0 added expandable Table rows ("macOS Finder-like file trees by designating a `treeColumn`"), window scrolling in the Virtualizer and horizontal virtualisation for GridList/ListBox. It also cut dependencies by 90% by consolidating into monopackages with subpath imports such as `react-aria-components/Button`, and shipped codemods — [React Aria v1.17.0](https://react-aria.adobe.com/releases/v1-17-0)
- Gap analysis (secondary, Untitled UI, 2026-09-17). Base UI has no Calendar/DatePicker/TimeField, no colour components (React Aria has 7), no Table/Tree/GridList, no DnD, and no Breadcrumbs/Link/SearchField/TagGroup. React Aria has no Avatar, OTP field, Menubar, NavigationMenu, ScrollArea, dedicated AlertDialog or Drawer — [Untitled UI: Base UI vs React Aria](https://www.untitledui.com/blog/base-ui-vs-react-aria)
- Base UI v1.0.0 shipped on 11 Dec 2025 with 35 unstyled components. Additions since then: Toast (Apr 2025), Menubar/NavigationMenu/ContextMenu (May–Jul 2025), Combobox + Autocomplete (Sep 2025), Drawer (Feb/Mar 2026), OTPField (Apr/Jun 2026), and a `createItems` collection API for Combobox in v1.8.0 (4 Sep 2026) — [Base UI releases](https://base-ui.com/react/overview/releases). InfoQ covered v1 in Feb 2026 and gives the date as 6 Feb 2026, which conflicts with the changelog. The changelog and [Colm Tuite on X](https://x.com/colmtuite/status/1999160526539006215) support December 2025 — [InfoQ](https://www.infoq.com/news/2026/02/baseui-v1-accessible/)
- Radix Primitives, 2025–2026: `unstable_OneTimePasswordField` (Apr 2025), `unstable_PasswordToggleField` (May 2025), a controlled Context Menu plus unstable composition parts (Jun 2026), and fixes for React 19 infinite loops and memory leaks (Jun–Jul 2026). The latest release is 20 Jul 2026 — [Radix releases](https://www.radix-ui.com/primitives/docs/overview/releases)
- Radix Themes 3.0 brought a new layout engine and 11 new components. A unified tree-shakable `radix-ui` package now bundles all primitives — [Radix Themes releases](https://www.radix-ui.com/themes/docs/overview/releases); [radix-ui on npm](https://www.npmjs.com/package/radix-ui)
- Ark UI: "more than 40+ components and tools", including Date Picker, Color Picker, Tree View, Tour, Signature Pad, QR Code, Carousel, Hotkeys, JSON Tree View and Focus Trap — [Ark UI about](https://ark-ui.com/docs/overview/about). It is built on Zag.js finite state machines and supports React, Solid, Vue and Svelte with the same behaviour — [Ark UI GitHub](https://github.com/chakra-ui/ark)
- Headless UI v2.0 (May 2024) added anchor positioning via Floating UI (with `--anchor-gap` and `--anchor-padding` CSS variables) and a `virtual` prop on Combobox backed by TanStack Virtual — [Tailwind blog: Headless UI v2.0](https://tailwindcss.com/blog/headless-ui-v2). I found no significant 2025–2026 feature release; see Gaps.
- Ariakit is at v0.4.40 and describes itself as an "open-source library with unstyled, primitive components", with "59+ examples" (Dialog, Combobox, Menu, Select, Form, Command Menu…) — [ariakit.com](https://ariakit.com/)
- shadcn/ui components, 2025–2026: Calendar (Jun 2025), new components (Oct 2025), Toast rework (Jul 2026), Chat components (Jun 2026), Questionnaire (Aug 2026) — [shadcn changelog](https://ui.shadcn.com/docs/changelog)

### Inferences
- umriss already has a roving-focus tree, a combobox with `aria-activedescendant`, date pickers and a keyboard-walkable chart. That puts it in the pattern class of React Aria and Ark UI, not of Radix, Base UI or Headless UI. The fair benchmark for the tree, the date pickers and the table is React Aria.
- In React Aria, Tree and Table are converging: a Table can hold expandable rows. If the umriss table and tree stay separate, it should be a deliberate choice.
- No headless library ships an accessible **chart**. A keyboard-walkable canvas chart is a place where umriss can go beyond all of them. The closest precedent in this group is React Aria's collection and virtualiser model.

### Gaps
- No complete enumerated component list could be fetched for React Aria. The home page gives only "over 50".
- I found no Headless UI release notes for 2025–2026. Its status (maintenance mode or active) is unconfirmed.

## 2. Accessibility practice: AT testing, pointer normalisation, focus, announcements, RTL, forced colours, reduced motion

### Takeaway
React Aria documents the deepest accessibility engineering: tests against screen readers on desktop and mobile, usePress normalisation of pointer, touch, keyboard and virtual clicks, ariaHideOutside, LiveAnnouncer and workarounds for iOS keyboards. The others mostly claim WAI-ARIA and WCAG compliance and publish no test matrix. None of them publishes a current, per-component AT × browser matrix.

### Cited Findings
- The React Aria docs say components are "extensively tested using many popular screen readers and devices" and that React Aria "normalizes differing behavior between browsers and assistive technologies" — [React Aria home](https://react-aria.adobe.com/)
- The ComboBox case study found that NVDA did not announce character deletion or cursor movement, and that VoiceOver had limited `aria-activedescendant` support in Safari and Chrome: it did not announce option count, section titles or selection state. Fixes: **ariaHideOutside** (TreeWalker + MutationObserver setting `aria-hidden` on everything except the input and listbox), a **LiveAnnouncer** (a visually hidden `aria-live` region with announcements written for the component), **VisualViewport** height so the tray fits above the iOS keyboard, and **usePreventScroll** — [React Aria blog: Building a ComboBox](https://react-aria.adobe.com/blog/building-a-combobox)
- usePress unifies mouse, touch, keyboard and screen-reader "virtual" clicks. It listens to both touch and mouse events and ignores the synthetic mouse event after a touch. It did its own hit-testing with pointermove because iOS 13 Safari had broken pointerenter/pointerleave — [Building a Button Part 1](https://react-aria.adobe.com/blog/building-a-button-part-1); parts 2 (hover) and 3 (keyboard focus behaviour) — [Part 2](https://react-spectrum.adobe.com/blog/building-a-button-part-2.html), [Part 3](https://react-spectrum.adobe.com/blog/building-a-button-part-3.html)
- Ariakit's `virtualFocus`: "the composite element will act as an aria-activedescendant container instead of roving tabindex. DOM focus will remain on the composite element while its items receive virtual focus". The same Composite primitive powers Combobox, Toolbar and Select — [Ariakit Composite](https://ariakit.com/reference/composite); [ComboboxProvider](https://ariakit.com/reference/combobox-provider)
- Base UI claims "WCAG compliance out of the box" and handles "complex interaction patterns, keyboard navigation, focus management, and ARIA attributes" — [InfoQ](https://www.infoq.com/news/2026/02/baseui-v1-accessible/). It added `DirectionProvider` for RTL in v1.1.0 — [Base UI releases](https://base-ui.com/react/overview/releases)
- RTL in shadcn (Jan 2026): the CLI rewrites physical classes to logical ones at install time (`left-*`→`start-*`, `ml-*`→`ms-*`, `text-left`→`text-start`, slide animations become logical) and flips icons with `rtl:rotate-180`, controlled by `--rtl` or `migrate rtl` — [shadcn RTL changelog](https://ui.shadcn.com/docs/changelog/2026-01-rtl)
- Radix fixes in 2026 are still largely accessibility and focus: Dialog ARIA references, Toast Escape handling, Slider `focusVisible` — [Radix releases](https://www.radix-ui.com/primitives/docs/overview/releases)
- Forced-colours background: the browser picks system colours from element semantics, not from ARIA roles — [MDN forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors); [Smashing Magazine](https://www.smashingmagazine.com/2022/03/windows-high-contrast-colors-mode-css-custom-properties/)

### Inferences
- The React Aria combobox findings apply directly to umriss's `aria-activedescendant` combobox. VoiceOver is weak on activedescendant, so the best-in-class answer is a supplementary live announcement (option count, selection) plus hiding the outside content while the list is open. umriss should test for this, especially on macOS/iOS VoiceOver.
- Forced-colours and reduced-motion handling are styling concerns. The headless libraries leave them to the user. umriss ships its own CSS modules and tokens, so it can do better by building `@media (forced-colors: active)` and `prefers-reduced-motion` into the tokens. A canvas chart especially needs a forced-colours strategy, because canvas pixels ignore system colours.
- The pressable/pointer normalisation that umriss needs for touch on the chart and the date grid has a documented reference implementation: usePress.

### Gaps
- No library publishes a current (2025–2026) AT × browser test matrix per component. React Aria's detailed evidence comes from older blog posts, which are undated in the fetched copy (originally about 2020).
- I found no primary documentation of forced-colours or reduced-motion support in React Aria Components, Base UI, Radix or Ark. The search returned only generic articles.
- The Ariakit and Ark UI testing methodology was not documented in the pages I fetched.

## 3. i18n depth: locales, calendars, time zones, numbers, plurals, RTL

### Takeaway
React Aria with @internationalized/date and @internationalized/number is the only library with serious i18n: translations in 30+ languages, 13 calendar systems, 5 numbering systems, time-zone-aware types and RTL. Base UI, Radix and Headless UI ship no translated strings; the user supplies them.

### Cited Findings
- React Aria: "translations in over 30 languages", "support for 13 calendar systems", "5 numbering systems", "right-to-left layout" — [React Aria home](https://react-aria.adobe.com/)
- In detail: "React Aria ships 34 locale bundles covering 32 languages inside the package". Base UI provides no localised strings — [Untitled UI (secondary)](https://www.untitledui.com/blog/base-ui-vs-react-aria)
- @internationalized/date covers "13 calendar systems used around the world, including Gregorian, Buddhist, Islamic, Persian, and more". It has immutable types (Calendar, CalendarDate, CalendarDateTime, ZonedDateTime, Time) and explicit DST arithmetic. It is 8 kB minified and Brotli-compressed, and tree-shakes down to 2.8 kB — [@internationalized/date](https://react-aria.adobe.com/internationalized/date/)
- Ark UI offers a "Locale" utility (a locale provider); details were not given on the overview page — [Ark UI about](https://ark-ui.com/docs/overview/about)
- Base UI's RTL support is a `DirectionProvider` (v1.1.0) — [Base UI releases](https://base-ui.com/react/overview/releases). shadcn's RTL support is class conversion in the CLI — [shadcn RTL](https://ui.shadcn.com/docs/changelog/2026-01-rtl)

### Inferences
- umriss ships English by default plus a German wording subpath. That is a deliberate, narrow model (two locales, wording injected), comparable to Base UI's bring-your-own-strings but with one bundled translation. Next to React Aria it lacks: non-Gregorian calendars, time-zone-aware date types and locale-aware number parsing. For an industrial DE/EN tool this is probably acceptable, but it should be an explicit statement in the ADRs, not a silent gap.
- Where umriss can match React Aria cheaply: date formatting and week start through `Intl.DateTimeFormat` / `Intl.Locale.getWeekInfo`, plurals through `Intl.PluralRules`, numbers through `Intl.NumberFormat`. React Aria's 2.8–8 kB footprint shows how small a calendar abstraction can be.

### Gaps
- The full list of the 13 calendars (the docs name Gregorian, Buddhist, Islamic, Persian "and more"; Japanese, Hebrew, Indian, Ethiopic and Taiwan are expected but not confirmed in the fetched text) and of the 5 numbering systems was not retrieved.
- @internationalized/number details (parsing, units) and plural handling were not fetched.

## 4. Composition model, theming, Tailwind, and support for AI coding tools

### Takeaway
The field has converged on unstyled compound components with data-attribute state styling, plus either render props (React Aria) or a `render` prop / `asChild` (Base UI, Radix). shadcn/ui has turned into a registry and CLI for distributing code on top of Base UI (default since Jul 2026), Radix or React Aria (first-class since Jul 2026). AI-readiness through llms.txt, MCP servers and agent skills is now standard for React Aria, shadcn and Ark.

### Cited Findings
- React Aria offers "render props to customize children based on state", "slots", data attributes (`[data-pressed]`, `[data-selected]`), vanilla CSS and Tailwind starter kits, and installation through the shadcn CLI — [React Aria home](https://react-aria.adobe.com/); [Getting started](https://react-aria.adobe.com/getting-started). A hooks layer (`useSelect`, `useComboBox`, `useTable`) sits underneath. There is a first-party Tailwind plugin (~392k weekly downloads, secondary) — [Untitled UI](https://www.untitledui.com/blog/base-ui-vs-react-aria)
- React Aria AI tooling: an MCP server, installable Agent Skills, llms.txt, and a per-page "copy / open in AI" menu — [Getting started](https://react-aria.adobe.com/getting-started)
- Base UI: a `render` prop that takes an element or a function. Data attributes `[data-open]`, `[data-checked]`, `[data-highlighted]` plus CSS variables for popups. `eventDetails` on change handlers carries a reason, the native event, `cancel()` and `allowPropagation()`, with 35 typed reasons — [Untitled UI](https://www.untitledui.com/blog/base-ui-vs-react-aria). It also has "detached triggers" — [InfoQ](https://www.infoq.com/news/2026/02/baseui-v1-accessible/)
- shadcn has made Base UI the default for new projects (Jul 2026): "Base UI is stable. It's at 1.6.0 with 6M+ weekly downloads". Projects on shadcn/create pick Base UI over Radix "2 to 1". "Radix is not being deprecated… every update and new component will ship for both libraries." An AI skill, not a codemod, handles migration — [shadcn: Base UI default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)
- shadcn + React Aria (Jul 2026): "Choose React Aria anywhere you can choose Base UI or Radix", with `shadcn init --base aria`. It works across 8 design systems (Vega, Nova, Maia, Lyra, Mira, Luma, Rhea, Sera) — [shadcn: React Aria](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)
- shadcn registry model: an MCP server for any registry (Apr 2025, `npx shadcn registry:mcp`), CLI 3.0 with namespaced registries, auth and an MCP server (Aug 2025), a registry index and directory (Sep–Oct 2025), `shadcn create` (Dec 2025), CLI v4 (Mar 2026), presets / `apply` / `eject` (Apr–May 2026), GitHub and private GitHub registries (Jun–Aug 2026), a unified `cn` package (Sep 2026) — [shadcn changelog](https://ui.shadcn.com/docs/changelog); [CLI 3.0 + MCP](https://ui.shadcn.com/docs/changelog/2025-08-cli-3-mcp); [MCP docs](https://ui.shadcn.com/docs/registry/mcp)
- Ark UI provides an MCP server and llms.txt under "AI for agents"; styled examples come from Park UI — [Ark UI about](https://ark-ui.com/docs/overview/about)
- Radix Themes has an AGENTS.md in its repo — [radix-ui/themes AGENTS.md](https://github.com/radix-ui/themes/blob/main/AGENTS.md)
- Headless UI: the Combobox `virtual` prop plus a render-prop option template, and anchor CSS variables — [Headless UI v2](https://tailwindcss.com/blog/headless-ui-v2)

### Inferences
- For umriss, being "LLM-friendly" now means at minimum: an llms.txt, per-page markdown, and ideally an MCP server or agent skill. Its competitors' docs are consumed by coding agents, so a small library without these is at a disadvantage when an AI tool generates code.
- Data-attribute state hooks (`data-selected`, `data-focus-visible`…) are the shared styling contract across all of them. If umriss's CSS modules expose the same states as data attributes, it becomes easy to learn for anyone who knows these libraries.
- umriss is packaged, not copied in. The shadcn "copy the code" / registry model is the dominant distribution idea, but it depends on the library being unstyled underneath. umriss's own tokens and CSS modules make it closer to Radix Themes or React Spectrum (styled packages), which is the right comparison for theming.

### Gaps
- I did not verify whether Base UI, Radix or Ariakit publish llms.txt or MCP servers. Ariakit's home page mentioned no AI support.
- I found no quantitative data (downloads, AI-codegen accuracy) on how LLM-friendliness affects adoption.

## 5. Weaknesses and criticisms

### Takeaway
React Aria is criticised for verbosity and bundle weight. Radix for stagnant maintenance after the WorkOS acquisition, which caused the exodus to Base UI. Base UI for its narrower coverage and lack of i18n. Ariakit for still being pre-1.0. Headless UI for its small component set and low recent activity. shadcn for being a copy-paste surface whose quality depends on the primitive underneath.

### Cited Findings
- React Aria: "the hardest sell" on bundle size; more verbose, which is "a real tax" (secondary comparisons) — [PkgPulse: React Aria vs Headless UI vs Radix](https://www.pkgpulse.com/guides/react-aria-vs-headless-ui-vs-radix-primitives-2026); community question on bundle size — [adobe/react-spectrum discussion #5636](https://github.com/adobe/react-spectrum/discussions/5636). Needs "more lines than in Base UI or Radix UI" — [Untitled UI](https://www.untitledui.com/blog/base-ui-vs-react-aria). Base UI maintainers say React Aria "renders a large number of context providers" — [InfoQ](https://www.infoq.com/news/2026/02/baseui-v1-accessible/). The v1.17 dependency consolidation (−90%) is a response to this — [v1.17.0](https://react-aria.adobe.com/releases/v1-17-0)
- Radix: built by Modulz and acquired by WorkOS. Maintainers left and contributions slowed. Co-creator Colm Tuite reportedly called it a "liability". There were `setState` "update depth exceeded" bugs. WorkOS has since re-invested (a Medium opinion piece, secondary) — [Mashuk Tamim, Medium](https://mashuktamim.medium.com/is-your-shadcn-ui-project-at-risk-a-deep-dive-into-radixs-future-91af267c4bec). Community sentiment — [Adam Rackis on X](https://x.com/AdamRackis/status/1936124548027760959). Counter-evidence: Radix releases continued through Jul 2026 with React 19 fixes — [Radix releases](https://www.radix-ui.com/primitives/docs/overview/releases). New primitives still carry the `unstable_` prefix — same source.
- Base UI: no date/time, table, tree, colour or DnD, and no localised strings — [Untitled UI](https://www.untitledui.com/blog/base-ui-vs-react-aria)
- Ariakit is still pre-1.0 (v0.4.40) — [ariakit.com](https://ariakit.com/)
- Headless UI: the latest major is v2.0 (May 2024). I found no 2025–2026 features — [Tailwind blog](https://tailwindcss.com/blog/headless-ui-v2)
- shadcn: its own changelog shows it moving away from Radix as the default (Base UI default, Jul 2026) and needing an AI migration skill — [shadcn: Base UI default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)

### Inferences
- The strongest move for umriss is to take React Aria's depth where it matters for industrial users (combobox announcements, date grid, tree and table keyboard walks, pointer normalisation) without its verbosity. It should also cover what none of them cover: an accessible chart, and forced colours built into the tokens.
- Radix's history is a warning about bus factor for small libraries. For umriss, good docs and ADRs (already in place) plus LLM-friendly docs are the mitigation.

### Gaps
- The Medium and PkgPulse criticisms are secondary and opinionated. The Colm Tuite "liability" quote was not verified at its primary source.
- I found no primary-source criticism of Ark UI/Zag.js (for example state-machine overhead or bundle size).
