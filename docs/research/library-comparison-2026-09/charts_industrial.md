# React charting libraries and industrial / HMI design systems (2025–2026)

Scope: what umriss (canvas charts: line/area/bar/scatter/state band/matrix, limit lines & bands, control charts with Western Electric rules, Pareto, operating-time axis, controlled zoom/pan, cursor sync, 1M+ points with downsampling, keyboard & screen-reader walk; core components for limits, alarms, verdicts) lacks, and where it stands out. Research done 2026-09-24, about 20 tool calls. Vendor benchmark claims are marked as vendor claims.

## (A) What do the React charting libraries offer? (types, rendering, scale, interaction, export, accessibility, license)

### Takeaway
The market splits three ways. SVG libraries (Recharts, Nivo, Victory, visx, Observable Plot) are the most accessible and easiest to style, but slow down above roughly 10k marks. Broad canvas libraries (ECharts, AG Charts, Highcharts, MUI X, which is moving to WebGL) cover 20–30+ chart types plus zoom, navigator and export, and put the advanced features behind a commercial tier. WebGL specialists (SciChart, LightningChart) aim at 10M–100M points and are commercial. None of the general libraries ships SPC control charts with Western Electric rules, an operating-time axis that removes idle hours, or plant-state semantics. Those appear only in niche SPC products.

### Cited Findings

**Apache ECharts (echarts-for-react)**
- ECharts 6.0 was released on 2025-07-30 with 12 major upgrades — [ECharts handbook v6](https://echarts.apache.org/handbook/en/basics/release-note/v6-feature/); [Apache ECharts on X](https://x.com/ApacheECharts/status/1952629667443466453)
- v6 adds: a new default theme built on design tokens; dynamic theme switching without re-init; dark mode that follows the system; chord, beeswarm and scatter jitter; **broken axis** ("torn-paper effect", click to expand); better stock/trading charts; a **matrix coordinate system** (covariance matrices, periodic tables); reusable custom series published via npm; new custom charts (violin, contour, stage, bar range, line range); smarter axis-label layout — [ECharts handbook v6](https://echarts.apache.org/handbook/en/basics/release-note/v6-feature/)
- ARIA: the `aria` component generates aria-labels (v6 adds `aria.data.excludeDimensionId` and `role="img"` on the container). **Decal patterns** give a second, non-colour encoding through `aria.decal.show` — [ECharts ARIA handbook](https://echarts.apache.org/handbook/en/best-practices/aria/); [ECharts changelog](https://echarts.apache.org/en/changelog.html)
- dataZoom gained `handleLabel.show` — [ECharts changelog](https://echarts.apache.org/en/changelog.html)
- A 2026 accessibility ranking (secondary source) puts ECharts third: MUI X > Recharts > ECharts > Chart.js > ApexCharts > visx > Nivo > Victory — [Disability World 2026](https://www.disabilityworld.org/articles/accessible-data-viz-tooling-2026/) (via search summary, not independently verified)

**Recharts**
- v3 turns `accessibilityLayer` on by default. It adds ARIA labels and roles, and arrow keys move between points and tooltips — [Recharts 3.0 migration guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide); [Recharts and accessibility](https://github.com/recharts/recharts/wiki/Recharts-and-accessibility)
- SVG only. It is described as "slow above 10K points". The usual production pattern is to aggregate on the server — [LogRocket 2026](https://blog.logrocket.com/best-react-chart-libraries-2026/); [PkgPulse 2026](https://www.pkgpulse.com/guides/recharts-vs-chartjs-vs-nivo-vs-visx-react-charting-2026)

**Nivo, visx, Victory, Observable Plot**
- Nivo renders SVG, Canvas and HTML. Victory is SVG (web and React Native). visx is low-level D3 + React primitives. Observable Plot gives per-mark ARIA labels and clean SVG — [Querio 2026](https://querio.ai/articles/top-react-chart-libraries-data-visualization); [Disability World 2026](https://www.disabilityworld.org/articles/accessible-data-viz-tooling-2026/)
- "SVG libraries … hit a ceiling in the low thousands of individual marks. Canvas and WebGL libraries win at high data density and pay for it in inspectability" — [Disability World 2026](https://www.disabilityworld.org/articles/accessible-data-viz-tooling-2026/)

**MUI X Charts**
- The Community tier is MIT (core types, axes, legends, theming, tooltips, highlights). The commercial Pro/Premium tiers add advanced charts (funnel, **heatmap**, sankey) plus **zoom, pan and export** — [MUI X Charts](https://mui.com/x/react-charts/); [MUI X zoom & pan](https://mui.com/x/react-charts/zoom-and-pan/)
- Zoom (Pro/Premium) covers line, bar, scatter and heatmap, with a range slider under the axis and an optional preview — [MUI X zoom & pan](https://mui.com/x/react-charts/zoom-and-pan/)
- v8 added keyboard navigation step by step (heatmap in Pro; radar in v8.25.0) — [v8.25.0 release](https://newreleases.io/project/github/mui/mui-x/release/v8.25.0); [MUI X v8 highlights](https://mui.com/blog/mui-x-end-v8/)
- **v9**: "Keyboard navigation is on by default in v9 … across all licensing tiers". It adds a **WebGL candlestick** and a range-bar chart (Premium), and says "continued WebGL-backed chart types for large datasets" are planned — [Introducing MUI X Charts v9](https://mui.com/blog/introducing-mui-x-charts-v9/)

**Highcharts (Core, Stock, Gantt, Maps)**
- The accessibility module is included with every license and is based on WCAG 2.2. It provides keyboard navigation, screen-reader support through ARIA, a chart-as-data-table view, export for tactile printers, **sonification (audio charts)**, low-vision and voice-input support, and internationalised a11y strings. Highcharts advises always loading it — [Highcharts accessibility module](https://www.highcharts.com/docs/accessibility/accessibility-module)
- The new official React integration `@highcharts/react` (v4) replaces `highcharts-react-official`. It has a JSX-native API with `<StockChart>`, `<MapChart>` and `<GanttChart>`, and needs React ≥18.3.1 and Highcharts ≥12.2 — [npm @highcharts/react](https://www.npmjs.com/package/@highcharts/react); [Highcharts React integration](https://www.highcharts.com/integrations/react/)
- Commercial use needs a paid license; non-commercial use is free. From 2025-01-06, public website deployments fall under a SaaS license — [Highcharts download/licensing](https://www.highcharts.com/download/) (via search summary)
- Stock and Gantt are separate products — [Highcharts Stock](https://www.highcharts.com/products/stock/); [Highcharts Gantt](https://www.highcharts.com/products/gantt/)

**AG Charts**
- Canvas rendering "optimised for large data with the **M4 algorithm**" — [AG Charts enterprise](https://www.ag-grid.com/charts/enterprise-charts/) (via search summary)
- 30+ types: bar, line, area, scatter, pie, donut, radar, treemap, sunburst, heatmap, candlestick, OHLC, maps, gauges and more — [AG Charts React](https://www.ag-grid.com/charts/react-charts/)
- Enterprise adds maps, sankey, radar, waterfall, gauges, **zoom, navigator (mini-chart overview), annotations, crosshairs, context menus, synchronisation** and Financial Charts (toolbar, range buttons, technical-analysis annotations). Community is free for production use; Enterprise shows a watermark without a key — [npm ag-charts-enterprise](https://www.npmjs.com/package/ag-charts-enterprise); [AG Charts licensing](https://www.ag-grid.com/charts/react/licensing/)

**uPlot**
- MIT, Canvas 2D, about 50 KB. Handles time series, lines, areas, OHLC and bars. "166,650 data points in 25ms from a cold start, scaling linearly at ~100,000 pts/ms". Strong zoom and cursor performance, with no WebGL or WASM — [uPlot README](https://github.com/leeoniya/uPlot/blob/master/README.md)

**SciChart.js and LightningChart JS (WebGL specialists)**
- SciChart.js: WebGL, WebGPU and WebAssembly, with React demos. Commercial, with a free Community Edition for non-commercial, academic and non-profit use. The Community Edition must stay on the latest version or it stops working after six months — [npm scichart](https://www.npmjs.com/package/scichart); [SciChart.js licensing](https://www.scichart.com/licensing-scichart-js/)
- LightningChart JS: built on WebGL, with React, Vue and Angular templates. Free non-commercial license; commercial use is paid — [LightningChart pricing](https://lightningchart.com/js-charts/pricing/)
- Vendor claim (SciChart): about 100 ms to load 10M points versus 400–500 ms for LightningChart, and 100M points in 11 s. LightningChart publishes opposite results. **Both are vendor benchmarks and conflict** — [SciChart vs LightningChart](https://www.scichart.com/blog/alternatives-to-lightningchart/); [LightningChart vs SciChart](https://lightningchart.com/net-charts/performance/lightningchart-vs-scichart/)
- A SciChart benchmark (2026) compares SciChart, Highcharts, Chart.js, Plotly.js, ECharts, uPlot, ChartGPU and LightningChart — [SciChart chart-bench 2026](https://www.scichart.com/blog/chart-bench-compare-javascript-chart-libraries/)

**SPC / control charts in JS**
- Quinn-Curtis QCSPCChart (commercial JS/TS): computes Western Electric rules WE1–4 plus Nelson, Juran, Hughes, Gitlow, AAIG, Westgard and Duncan rule sets — [Quinn-Curtis](https://quinn-curtis.com/index.php/qcspcchartjsts/)
- microcharts `ControlStrip` (React): a Western Electric subset (WE-1, WE-2, WE-4) — [microcharts ControlStrip](https://microcharts.dev/docs/charts/control-strip)
- Plotly.js documents SPC control charts as a recipe/example, with violations highlighted, not as a rule engine — [Plotly SPC](https://plotly.com/javascript/spc-control-charts/)

### Inferences
- **Where umriss stands out:** Western Electric rules built into a React canvas chart, an operating-time axis that removes idle hours, state bands, and limit lines/bands as first-class concepts. Among the general libraries these are either missing (SPC rules, operating-time axis) or reachable only through custom work: ECharts' broken axis (v6) is the closest relative of the operating-time axis, but it is a visual break, not a time model; Grafana's state timeline is the closest relative of the state band. SPC rule engines exist only in commercial niche tools (Quinn-Curtis) or as a partial React subset (microcharts).
- **A11y parity:** keyboard walk plus screen reader is now table stakes (on by default in Recharts 3 and MUI X v9). Highcharts sets the ceiling: data-table view, sonification, internationalised strings. umriss has its own wording (per commit history), but a data-table fallback and non-colour encoding (like ECharts decals) are likely gaps.
- **Performance:** 1M+ points with downsampling puts umriss in the uPlot / AG Charts (M4) class on Canvas 2D. That is above the SVG libraries, below the WebGL specialists (10M–100M) and the WebGL direction of MUI X.
- **Likely gaps compared with the broad libraries:** heatmap as a named type (umriss "matrix" may cover it), boxplot, candlestick, radar, sankey, treemap, gauges, maps, 3D, a navigator/overview mini-chart, annotations beyond limits, PNG/SVG/CSV export, streaming append APIs.
- **License position:** most features comparable to umriss (zoom, navigator, sync, heatmap, export) sit behind commercial tiers in MUI X, AG Charts and Highcharts. A permissively licensed library that has these features stands out, if umriss is published that way (license not checked here).

### Gaps
- Could not fetch AG Charts' per-feature Community/Enterprise matrix (the licensing page doesn't list it). Accessibility details for AG Charts were not verified.
- Not verified in this session (prior knowledge only, **do not cite without checking**): Chart.js decimation plugin (LTTB / min-max) and its canvas-only rendering; Plotly `scattergl` WebGL traces and PNG export through the modebar; Victory/Nivo export options; ECharts `large`/`progressive` modes and `saveAsImage` toolbox; ECharts' built-in boxplot/candlestick/heatmap/sankey/treemap/gauge/map support (widely known, not re-fetched).
- No neutral, third-party benchmark of 1M-point performance was found. The available numbers come from vendors.
- Observable Plot has no official React wrapper (not verified).

## (B) What do industrial / HMI design systems and UI kits offer, and how do they treat colour and alarm states?

### Takeaway
Siemens iX is the only major open-source (MIT) industrial design system with React bindings. Its charts come from an ECharts integration, plus KPI tiles, pills and event lists. SCADA platforms (Ignition Perspective, FactoryTalk Optix, AVEVA) provide alarm tables, trend "power charts" and sparklines, but inside closed platforms, not as React libraries. The conventions umriss would follow come from ISA-101 (greyscale base, colour reserved for abnormal states) and ISA-18.2 (the alarm state machine).

### Cited Findings

**Siemens iX (Industrial Experience)**
- MIT license. Built as web components with Stencil, with React, Vue and Angular wrappers. About 376 stars and 141 forks at fetch time — [GitHub siemens/ix](https://github.com/siemens/ix)
- Components include line, bar, gauge and pie charts, 3D charts and special types "via ECharts integration"; **KPI** ("measured values together with a status indicator"); pills for counters and statuses; **event lists**; application header; AG Grid integration for tables; toasts and message bars — [iX components overview](https://ix.siemens.io/docs/components/overview)

**Inductive Automation Ignition Perspective (closed platform)**
- **Alarm Status Table**: view, filter and interact with live alarms; Shelve and Acknowledge actions; a shared polling engine across sessions — [Ignition docs: Alarm Status Table](https://www.docs.inductiveautomation.com/docs/8.1/appendix/components/perspective-components/perspective-display-palette/perspective-alarm-status-table)
- **Power Chart**: time-series charts configurable at runtime from Tag Historian, with panels for Browse Tags, Pen Control and Chart Settings — [Ignition docs: Power Chart](https://www.docs.inductiveautomation.com/docs/8.1/appendix/components/perspective-components/perspective-chart-palette/perspective-power-chart)
- **Sparkline**: minimal recent-history line for a single data point — [Ignition docs: Sparkline](https://www.docs.inductiveautomation.com/docs/8.1/appendix/components/perspective-components/perspective-display-palette/perspective-sparkline)

**Rockwell FactoryTalk Optix / AVEVA / others**
- FactoryTalk Optix: reusable content libraries and templates for navigation, login, **alarms and notifications**; alarms on Boolean or analog high/low thresholds; thick client or HTML5 web client — [Rockwell FactoryTalk Optix](https://www.rockwellautomation.com/en-us/products/software/factorytalk/optix.html); [ASEM Optix](https://www.asem.it/en/products/251/factorytalk-optix.html)
- AVEVA sells Citect (SCADA) — [Wikipedia: Citect](https://en.wikipedia.org/wiki/Citect)
- OpenWebHMI: an open-source web HMI (Rust gateway, browser runtime, form designer, history, alarms, auth, scripting). It is a platform, not a React kit — [openwebhmi.com](https://openwebhmi.com/)

**Grafana (monitoring UX reference)**
- **State timeline**: each series is a horizontal band of discrete states. Thresholds turn numeric series into coloured state regions — [Grafana state timeline](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/state-timeline/)
- **Thresholds** can be drawn as lines or regions in time series, bar chart, candlestick and trend panels. They are sorted automatically, and the legend can show threshold brackets — [Grafana configure thresholds](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/configure-thresholds/)

**ISA-101 (high-performance HMI)**
- Colour is reserved for abnormal and alarm states on a low-saturation, mostly grey base, so red alarms stand out in peripheral vision — [HMI Library: ISA-101](https://hmilibrary.com/standards/isa-101); [Industrial Monitor Direct](https://industrialmonitordirect.com/blogs/knowledgebase/isa-101-high-performance-hmi-design-principles-color-strategy)
- "ISA-101 does not specify the colors". A typical field mapping is P1 red, P2 amber, P3 yellow, P4 blue/cyan. Suppressed and shelved alarms get their own neutral icon ("not absent, just deliberately hidden") — [HMI Library: ISA-101](https://hmilibrary.com/standards/isa-101) (secondary sources; the standard itself is paywalled)
- Vendor guide for implementing ISA-101 in a SCADA product — [Tatsoft FrameworX ISA-101 guide](https://docs.tatsoft.com/display/FX/ISA-101+HMI+Compliance+How-to+Guide)

**ISA-18.2 (alarm management)**
- States: Normal, Unacknowledged, Acknowledged, Returned-to-Normal (unacknowledged), Latched. Special states that can be entered from any state: **Shelved** (operator-initiated, tracked), **Suppressed by Design** (logic-driven), **Out of Service** — [ISA PAS white paper: Understanding ISA-18.2](https://www.isa.org/getmedia/55b4210e-6cb2-4de4-89f8-2b5b6b46d954/PAS-Understanding-ISA-18-2.pdf); [ICONICS ISA-18.2 state diagram](https://documentation.iconics.com/v10.97.3/Content/Alarming/Alarm%20Server/Alarm%20References/alarm-state-transition-diagram.htm); [Siemens ISA-18.2 white paper](https://support.industry.siemens.com/cs/attachments/109772836/WP_Alarm_Management_ISA_18.pdf)

### Inferences
- **Open-source competition in React industrial UI is thin.** Siemens iX is the main one, and it delegates charts to ECharts. It has no SPC, operating-time axis or limit-band semantics as far as its overview page shows. umriss sits in a gap between general chart libraries and closed SCADA platforms.
- **Patterns umriss probably lacks** compared with Ignition, Optix and iX: an alarm list/table with ack/shelve actions and filtering, a runtime-configurable trend (pen browser), sparkline/KPI tiles with status, gauges, faceplates, and shift/OEE views. None of these were verified as present or absent in the umriss repo during this research.
- **Standards alignment is a differentiator worth claiming:** if the umriss alarm/verdict components model the full ISA-18.2 state set (including shelved, suppressed and out-of-service as visually distinct, never invisible) and follow ISA-101's grey base with reserved colour, that is more rigorous than iX's generic pills and KPI statuses.

### Gaps
- No public ABB design system with an open component library was found (the search surfaced nothing concrete). The same goes for AVEVA web components.
- No dedicated open-source OPC UA / MQTT React dashboard component library was found in this session. Only OpenWebHMI (a platform) came up. Not searched deeply.
- No React HMI kits with ISA-101 faceplates were found.
- iX's per-component a11y and its exact alarm-colour tokens were not checked. The ISA-101 and ISA-18.2 primary texts are paywalled, so colour mappings rely on secondary sources.
- OEE / shift-view components in any open library: not found.
