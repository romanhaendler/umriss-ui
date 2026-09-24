# React scheduling / Gantt / resource-planning components and DX features (2025–2026)

Research date: 2026-09-24. Scope: (1) what scheduling components offer, to position umriss/schedule (subtasks on machine lanes, lane groups, transports, findings like overlaps and late transports, ripple/push, controlled drag editing, operating calendar, zoom/pan, local-time snapping incl. DST); (2) DX/ecosystem features that drive adoption.

## Q1: What do the leading scheduling/Gantt components offer, and where does umriss/schedule stand?

### Takeaway
The commercial leaders (Bryntum, DHTMLX, Syncfusion, DevExtreme, Kendo) all ship a full constraint/dependency engine (FS/SS/FF/SF with lags), critical path, baselines, resource histograms, undo/redo, working calendars, heavy export (PDF/PNG/Excel/MS Project, DHTMLX even Primavera P6) and virtualisation; nearly all are wrappers around framework-agnostic JS cores, not pure React. The free/MIT tier (SVAR core, DHTMLX Community, frappe-gantt, react-big-calendar, Planby free, MUI X Scheduler Community) deliberately withholds the engine features (auto-scheduling, resources, calendars, export) behind paid tiers. Time-zone/DST handling is a known weak spot even at Bryntum, and "findings" (typed diagnostics like late transports) are not a named first-class concept anywhere — conflict detection is the closest analogue.

### Cited Findings

**Bryntum (Scheduler / Scheduler Pro / Gantt)**
- Scheduler Pro: scheduling engine that "organizes tasks based on how they relate to each other and the rules you've defined"; dependencies auto-update successors when a leading task moves; built-in resource histogram; skill-based assignment; nested events; travel-time accounting; conflict detection/resolution; resource shifts in hierarchical calendars; heatmap; task editor incl. predecessors/successors/constraints; undo/redo; virtualisation; accessibility; React/Vue/Angular/vanilla; time-zone support; export; multiple calendars. Latest release 7.3.7 (Sep 24, 2026) — [Bryntum Scheduler Pro](https://bryntum.com/products/schedulerpro/)
- Non-working time demo: working-hours calendar plus time-axis filtering (hiding non-working time); per-resource non-working time demo — [Bryntum non-working-time demo](https://bryntum.com/products/schedulerpro/examples/non-working-time/); [resource non-working time](https://bryntum.com/products/schedulerpro/examples/resource-non-working-time/)
- Time-zone limitation (Bryntum staff on forum): support uses normal JS `Date` (always client TZ); "if the client time zone has a DST gap there will also be one in the converted time zone"; DST switches of target vs. browser zone may be shown incorrectly — [Bryntum forum: timezone inconsistency](https://forum.bryntum.com/viewtopic.php?t=28449); [forum: DST shift](https://forum.bryntum.com/viewtopic.php?t=25296) (forum threads; date of the limitation statement not verified against current 7.x)
- Pricing: Gantt $940/developer (Small Team, 3+ devs), $900/dev (Large Team, 10+) — [Bryntum blog, 8 Jul 2026](https://bryntum.com/blog/top-5-javascript-gantt-chart-libraries/); Small Team license "starts at USD 2820 (3 developers)" — [Bryntum store](https://bryntum.com/store/). Perpetual End-User license with 1-year Support & Updates subscription auto-renewing at original price; separate OEM license — [Bryntum store](https://bryntum.com/store/schedulerpro/)
- Experimental "Bryntum AI" feature: chat panel to interact with components in natural language — [Bryntum MCP blog, 18 Mar 2026](https://bryntum.com/blog/building-with-ai-agents-using-the-bryntum-mcp-server/)

**DHTMLX Gantt & Scheduler**
- Gantt: all four dependency types (FS/SS/FF/SF), critical path with slack, auto-scheduling, constraints, lag/lead, baselines, multiple resources per task, load charts/histograms, export to PDF/PNG/Excel/MS Project/Primavera P6/iCal (server-side export modules available locally), 8 CSS-variable themes, smart rendering, accessibility/keyboard, time zones, undo — [DHTMLX Gantt product page](https://dhtmlx.com/docs/products/dhtmlxGantt/)
- Editions: Community edition now MIT (auto-scheduling, resources, constraints, advanced export are PRO-only); PRO annual prices Individual $799, Commercial $1,599, Enterprise $2,999, Ultimate $5,999 — [DHTMLX Gantt product page](https://dhtmlx.com/docs/products/dhtmlxGantt/)
- Handles 30,000+ tasks; React version is a wrapper — [SVAR comparison, 2026](https://svar.dev/blog/top-react-gantt-charts/) (competitor-authored)
- React Gantt from 9.0.12 is SSR-compatible (Next.js, Remix) via placeholder + client hydration — [DHTMLX React Gantt docs](https://docs.dhtmlx.com/gantt/integrations/react/overview/)
- Scheduler timeline view: bar/cell/tree/days modes, sections (resources) incl. tree, second X-axis, events in multiple sections, `round_position` stretching, autoscroll at edges while dragging, variable section heights, smart rendering by default; **timeline is PRO-only** — [DHTMLX Scheduler timeline docs](https://docs.dhtmlx.com/scheduler/views/timeline/)

**Syncfusion Gantt / Scheduler**
- React Gantt: drag-and-drop, dependencies, resource view, split/merge tasks, filtering, undo/redo, critical path, export PDF/CSV/Excel; wrapper around EJ2 — [SVAR comparison](https://svar.dev/blog/top-react-gantt-charts/)
- Pricing quote-based bundles, min. one-year subscription; free Community License for orgs < $1M revenue, ≤5 devs, ≤10 employees — [Syncfusion pricing](https://www.syncfusion.com/sales/pricing); [Bryntum comparison](https://bryntum.com/blog/top-5-javascript-gantt-chart-libraries/)
- Only one of the five compared with a GUI theme builder — [Bryntum comparison](https://bryntum.com/blog/top-5-javascript-gantt-chart-libraries/)

**DevExtreme (DevExpress)**
- Scheduler: timeline views, resources with grouping into parallel timelines, recurrence via iCalendar RRULE, per-scheduler or per-appointment time zones, virtual scrolling (removes off-screen DOM) — [DevExtreme Scheduler overview](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Scheduler/Overview/); [Timelines demo](https://js.devexpress.com/Demos/WidgetsGallery/Demo/Scheduler/Timelines/React/Light/); [Time zone demo](https://js.devexpress.com/Demos/WidgetsGallery/Demo/Scheduler/TimeZonesSupport/React/Light/); [Virtual scrolling demo](https://js.devexpress.com/Demos/WidgetsGallery/Demo/Scheduler/VirtualScrolling/React/Light/)
- Gantt: from $899.99/dev; export PDF only; task relationship validation — [SVAR comparison](https://svar.dev/blog/top-react-gantt-charts/)

**KendoReact (Telerik)**
- Gantt and Scheduler with drag-and-drop; Gantt from $749/dev/year — [SVAR comparison](https://svar.dev/blog/top-react-gantt-charts/); 2025 Q4 exported `GanttHandle` interface — [ComponentSource release notes](https://www.componentsource.com/product/kendoreact/releases/2918596)

**FullCalendar (resource timeline)**
- Timeline view (resources as rows, timelineDay/Week/Month/Year) and vertical resource view are Premium — [FullCalendar timeline docs](https://fullcalendar.io/docs/timeline-view); [Pricing](https://fullcalendar.io/pricing)
- Premium from $480/year, 1–10 seats; standard MIT; 50% renewal discount before expiry; printer-friendly rendering in Premium — [FullCalendar pricing](https://fullcalendar.io/pricing)
- v7: AGPLv3 replaces GPLv3 for open-source use of premium — [FullCalendar v7 changelog](https://fullcalendar.io/docs/upgrading-from-v6)

**MUI X Scheduler (and Gantt)**
- Scheduler v9 alpha released 8 Apr 2026: Event Calendar (day/week/month/agenda) and Event Timeline (resource-centric, **Premium**); recurrence (daily/weekly/monthly/custom rules), timezone-aware evaluation for DST, drag-to-move/resize; Community (MIT) = core calendar, resource layouts, drag/drop; Premium = recurrence, lazy loading, timeline virtualisation (planned). Roadmap: timeline virtualisation, infinite loading, mobile, ICS/Google sync. Targeted stable "early July" 2026 — [MUI blog](https://mui.com/blog/introducing-mui-x-scheduler-v9-alpha/)
- MUI "What's new" page still lists Scheduler as [Alpha] at time of research (stable not confirmed) — [MUI X what's new](https://mui.com/x/whats-new/)
- Gantt in development inside scheduler-premium: FS auto-scheduling engine where moving/resizing a predecessor reschedules successors (issue/PRs mid-2026); print support tracked as an issue — [mui-x #22857](https://github.com/mui/mui-x/issues/22857); [PR #23439](https://github.com/mui/mui-x/pull/23439); [PR #22452 Gantt vs scheduler](https://github.com/mui/mui-x/pull/22452); [print issue #21577](https://github.com/mui/mui-x/issues/21577)

**SVAR React Gantt**
- Pure React; MIT core: timeline, drag-and-drop, dependency linking, filtering, virtualisation — [SVAR docs](https://docs.svar.dev/react/gantt/overview/)
- PRO (from $749, perpetual + 1 year updates, 30-day trial): work-days calendar, FS auto-scheduling (blocks moves that break dependencies), critical path, baselines, markers, split tasks, unscheduled tasks, undo/redo, export PDF/PNG/Excel/MS Project XML — [SVAR 2.4 blog](https://svar.dev/blog/react-gantt-pro-2-4-released/); [SVAR comparison](https://svar.dev/blog/top-react-gantt-charts/)
- Resource planning announced for v2.7 (future, not shipped per source) — [SVAR search result / dev.to](https://dev.to/olga_tash/svar-gantt-24-a-free-modern-gantt-chart-for-react-svelte-2e07)

**Open-source/lighter**
- frappe-gantt v1 (Feb 2025): full rewrite, ~2x options, fixed header, more time views, edit access, export; MIT; no large-dataset handling, no framework wrappers, no TS per Bryntum matrix — [Frappe blog](https://frappe.io/blog/product-updates/gantt-v1-is-out); [Bryntum comparison](https://bryntum.com/blog/top-5-javascript-gantt-chart-libraries/)
- react-big-calendar: month/week/day/agenda, DnD add-on, multiple date-lib adapters; v1.20.0 — [npm](https://www.npmjs.com/package/react-big-calendar); [Builder.io 2026](https://www.builder.io/blog/best-react-calendar-component-ai); Storybook docs — [RBC Storybook](https://jquense.github.io/react-big-calendar/examples/index.html?path=/story/addons-drag-and-drop--example-3)
- Planby: React-native (hooks, TS, JSX render), custom virtual view for 10k+ events free; PRO one-time $400/dev (DnD, advanced timezone handling, priority support) — [Planby](https://planby.app/why-planby); [npm](https://www.npmjs.com/package/planby)

### Inferences
- Feature parity on the Gantt axis (four dependency types + lags, critical path, baselines, MS Project export, histograms) is table stakes for commercial tools; umriss/schedule does not need to compete there unless it targets project management — its domain (machine lanes, transports, operational findings) is closer to Bryntum Scheduler Pro (travel time, conflicts, shifts) than to Gantt tools.
- Likely gaps for umriss vs. leaders: resource histogram/utilisation, undo/redo, export/print, recurrence, multi-level resource trees, constraint types beyond push/ripple, virtualisation for very large sets, dependency types other than FS (if transports are FS-only).
- Likely differentiators: (a) correct local-time snapping across DST — Bryntum openly documents DST gaps from `Date`-based TZ conversion, and MUI only just added timezone/DST awareness in alpha; (b) "findings" as typed, first-class diagnostics (late transport, overlap) — competitors expose conflict detection/validation but not a named findings model; (c) transports as first-class entities (only Bryntum's "travel time" is analogous); (d) controlled (React state-driven) editing — most leaders are imperative wrappers around JS cores (DHTMLX, Bryntum, Syncfusion, Kendo per SVAR classification), only SVAR/DevExtreme/Planby/MUI are "pure React"; (e) no license cost, where timeline/resource views are paywalled in FullCalendar, DHTMLX Scheduler, MUI X and Planby DnD.
- MUI X's in-progress FS auto-scheduling engine means ripple/push will soon be available in the dominant React ecosystem (Premium tier).

### Gaps
- No verified stable-release date for MUI X Scheduler; pricing of MUI Premium not fetched.
- Syncfusion/Kendo scheduler timeline specifics (resource hierarchy depth, DST behaviour) not verified.
- Accessibility depth (WCAG conformance claims, screen-reader behaviour of timelines) not verified for any library beyond "accessibility support" marketing statements.
- No npm download or GitHub-star figures collected (neither comparison article lists them).
- Whether Bryntum 7.x fixed the forum-reported DST limitations is unknown.

## Q2: Which DX/ecosystem features do top libraries use to win adoption?

### Takeaway
In 2025–2026 the dominant new DX lever is AI-agent readiness: Bryntum, DHTMLX, Syncfusion, Kendo, SVAR, MUI and shadcn all ship an MCP server (plus llms.txt and/or "agent skills") so coding agents get version-correct docs; vendors even market "build X with Claude Code" tutorials. Classic levers persist: live demos per feature, Storybook (react-big-calendar), theme builders tied to Figma kits (Telerik ThemeBuilder, Syncfusion Theme Studio), codemods for majors (MUI), generous free tiers (MIT cores, Syncfusion community license).

### Cited Findings
- Bryntum MCP server (18 Mar 2026): public `https://mcp.bryntum.com`, no auth; one tool `search_bryntum_docs` (query, product, version from package.json, limit) + four resources; returns version-specific docs, source, config and links to live examples; supported in Claude Code, Codex, Cursor, VS Code, Lovable — [Bryntum blog](https://bryntum.com/blog/building-with-ai-agents-using-the-bryntum-mcp-server/); [Bryntum MCP docs](https://bryntum.com/agents/mcp-server/)
- Bryntum publishes "Build a Gantt dashboard with Claude Code" and "Lessons from agentic AI coding" posts — [Bryntum blog](https://bryntum.com/blog/build-a-project-management-dashboard-with-bryntum-gantt-ag-grid-ag-charts-and-claude-code/); [Lessons](https://bryntum.com/blog/lessons-from-agentic-ai-coding-with-bryntum-and-ag-grid/)
- DHTMLX: MCP server for up-to-date docs/API, paired with a React Gantt "Agent Skill" for coding assistants — [DHTMLX MCP docs](https://docs.dhtmlx.com/gantt/integrations/ai-tools/mcp-server/); [DHTMLX Agent Skills blog](https://dhtmlx.com/blog/dhtmlx-react-gantt-agent-skill/)
- SVAR: tried llms.txt, "didn't scale"; generic RAG not accurate; custom RAG too slow; ended with a stripped-down MCP — [SVAR on ITNEXT](https://itnext.io/how-we-built-mcp-server-for-our-react-gantt-component-854f895a856f); MCP works with Cursor, Claude Code, Gemini — [SVAR 2.4 blog](https://svar.dev/blog/react-gantt-pro-2-4-released/)
- Syncfusion: React MCP server + AI skills in IDE — [Syncfusion MCP docs](https://ej2.syncfusion.com/react/documentation/mcp)
- KendoReact: single MCP server with "Agentic UI Generator" orchestration and specialised assistants; 2025 Q3 improved accuracy (MCP + Copilot extension) — [KendoReact MCP docs](https://www.telerik.com/kendo-react-ui/components/ai-tools/ai-assistant/mcp-server); [Telerik MCP servers](https://www.telerik.com/mcp-servers)
- MUI: `@mui/mcp` server; `useMuiDocs` tool takes llms.txt URLs; version pairing (`muiPairing`) so v7 projects don't get v9 code — [MUI MCP docs](https://mui.com/material-ui/getting-started/mcp/); [mui-x MCP README](https://github.com/mui/mui-x/blob/master/packages/mcp/README.md). Codemods for majors, e.g. `npx @mui/codemod@latest v9.0.0/system-props` — [MUI v9 upgrade](https://mui.com/material-ui/migration/upgrade-to-v9/). MUI X v9 also ships a Data Grid AI Assistant (Premium) for end users — [MUI what's new](https://mui.com/x/whats-new/)
- shadcn: llms.txt, MCP server that lets agents browse/search/install components from any shadcn-compatible registry, CLI v4 (Mar 2026) — [shadcn MCP](https://ui.shadcn.com/docs/registry/mcp); [llms.txt](https://ui.shadcn.com/llms.txt); [CLI v4 changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)
- In the Bryntum 2026 matrix, Bryntum/DHTMLX/Syncfusion all tick "AI chat feature" and "MCP server"; only Syncfusion ticks "theme builder GUI" — [Bryntum comparison](https://bryntum.com/blog/top-5-javascript-gantt-chart-libraries/)
- Telerik ThemeBuilder: import Figma tokens, preview on real components, AI-powered theme generation; four Figma UI kits for KendoReact (Material, Bootstrap, Fluent, Default) — [Telerik ThemeBuilder](https://www.telerik.com/themebuilder); [KendoReact Figma kits](https://www.telerik.com/kendo-react-ui/components/styling/figma-ui-kits)
- Live demos per feature are standard (DevExtreme per-feature React demos; Bryntum examples; Planby site) — [DevExtreme demos](https://js.devexpress.com/Demos/WidgetsGallery/Demo/Scheduler/Timelines/React/Light/); [Bryntum example](https://bryntum.com/products/schedulerpro/examples/non-working-time/)
- Free tiers as funnel: DHTMLX Community MIT, SVAR MIT core, FullCalendar MIT standard, MUI Community, Syncfusion community license — sources above.

### Inferences
- For a new library like umriss, an llms.txt plus a small docs-search MCP (Bryntum's one-tool design is the minimal pattern) is now expected, and version-pinned docs matter (MUI's pairing lesson). SVAR's experience suggests llms.txt alone is insufficient for large APIs but is cheap as a start.
- Pure-React, controlled API + MIT + agent-ready docs is exactly the positioning SVAR and MUI are chasing; umriss competes there rather than with Bryntum's engine depth.
- Theme builders/Figma kits are enterprise differentiators; low priority for a small workspace library, but CSS-variable theming (as DHTMLX/Bryntum use) is table stakes.

### Gaps
- No hard data on how much MCP/llms.txt actually moves adoption (only vendor claims; one third-party claim about shadcn "velocity multiplier" not sourced to data, omitted).
- Community-size metrics (npm weekly downloads, GitHub stars, Discord sizes) not collected.
- CLI scaffolding/starter templates for scheduling libraries specifically not researched (Bryntum/DHTMLX demo repos exist, e.g. [DHTMLX react-gantt-demo](https://github.com/DHTMLX/react-gantt-demo), but no CLI found).
