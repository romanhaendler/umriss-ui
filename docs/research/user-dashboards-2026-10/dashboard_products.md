# Dashboard arrangement in established monitoring, BI and business products (state: October 2026)

Reading notes for the report writer:

- "Verified" means the statement was read on the cited page in this research session (13 Oct 2026). Where only a search snippet or a secondary source was available, the bullet says so.
- Quotes are short and verbatim; everything else is paraphrase of the cited page.
- Products covered: Grafana, Datadog, Kibana/Elastic, Metabase, Apache Superset, Power BI, Azure Portal, Salesforce (Lightning dashboards, Lightning App Builder), Jira, ServiceNow, Notion, Linear, Geckoboard, plus Home Assistant (the clearest published coordinate-vs-flow argument) and a few products met in passing.
- Every key-question section is organised per product in the same order. The last section summarises patterns and holds a comparison table.

## 1. Grid: column count, fixed vs width-following columns, row height

### Takeaway
Almost every product fixes the number of columns and lets the columns scale with the window (Grafana custom grid 24, Kibana 48, Metabase 24, Superset 12, Datadog 12, Salesforce 12 or 9, Home Assistant 12 per section); rows have a fixed height unit. The only mainstream design in which the column count follows the width is Grafana's Auto grid (min column width + max columns, up to 10) and Home Assistant's section reflow; Notion sidesteps the grid with rows of at most 4 widgets.

### Cited Findings

**Grafana**
- Classic/custom grid: `w` is "1-24 (the width of the dashboard is divided into 24 columns)"; `h` is "In grid height units. Each grid height unit represents 30 pixels"; `x`,`y` use the same units. — [Grafana docs, dashboard JSON model v13.0](https://grafana.com/docs/grafana/v13.0/dashboards/build-dashboards/view-dashboard-json-model/)
- Width scales, height does not: forum explanation that a dashboard "is split into 24 columns" and horizontal position and width follow the screen width, while panel height is an absolute number of pixels. (Search snippet of the thread; thread not opened.) — [Grafana community: Responsive Height of panels](https://community.grafana.com/t/responsive-height-of-panels/39240)
- Auto grid (schema v2 `AutoGridLayout`): `maxColumnCount` default 3; `columnWidthMode` one of `narrow | standard | wide | custom` (default `standard`); `rowHeightMode` one of `short | standard | tall | custom` (default `standard`); optional `columnWidth`/`rowHeight` numbers for `custom`; `fillScreen` default false. The page gives no pixel values for the named modes. — [Grafana docs v12.1, schema v2 layout schema](https://grafana.com/docs/grafana/v12.1/observability-as-code/schema-v2/layout-schema)
- Auto grid in the UI: min column width "Standard", "Narrow", "Wide" or "Custom" (pixels); max columns "Set a number up to 10"; row height "Standard", "Short", "Tall" or "Custom" (pixels); a "Fill screen" toggle. Panels resize and fit automatically and cannot be placed by hand. — [Grafana docs, create dashboard (latest)](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/)
- GA wording: with Auto grid panels resize to fit the screen and the author sets "a minimum column width, row height, and maximum columns per row". — [Grafana What's new, 2026-04-08](https://grafana.com/whats-new/2026-04-08-dynamic-dashboards-is-now-generally-available/)

**Datadog**
- "Dashboards in TV mode adhere to a fixed 12-column grid." "This can limit the flexibility in stretching content to fill the entire screen width." — [Datadog docs, TV mode guide](https://docs.datadoghq.com/dashboards/guide/tv_mode/)
- The grid layout has a maximum width of 12 grid squares. — [Datadog docs, Dashboards](https://docs.datadoghq.com/dashboards/)
- "In high-density mode, the dashboard is split into two grids of 12 columns". — [Datadog docs, TV mode guide](https://docs.datadoghq.com/dashboards/guide/tv_mode/)
- 2021 launch post: the layout is "built on top of a fully responsive grid that will scale to fit any screen size". — [Datadog blog, 20 May 2021](https://www.datadoghq.com/blog/datadog-dashboards)

**Kibana / Elastic**
- 48-column grid with fixed-height rows; panels snap to column and row boundaries; new panels are created at half width (24 columns). Reference widths: full 48, half 24, third 16, quarter 12, sixth 8. — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)
- Suggested sizes on that grid: metrics 12 columns and 4-6 rows; bar/gauge/pie 24 columns and 8-12 rows; time series 16-48 columns and 12-15 rows; tables 24-48 columns and 15+ rows; aim for 8-12 panels above the fold. — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)

**Metabase**
- Metabase 47 (19 Sep 2023) changed the grid, "taking the grid from 18 squares across to 24", for "more symmetry and precise placement". — [Metabase 47 release page](https://www.metabase.com/releases/Metabase-47)
- Width modes: fixed width (default) — "Metabase will restrict the layout to a fixed width in the center of the screen"; full width — "The layout and cards will expand to take up the full width of the screen". — [Metabase docs, Dashboards introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
- Community confirmation that full width keeps "the same number of grid points (24 wide)" and scales the cards (v0.62 thread; search snippet). — [Metabase Discourse: increase the dashboard canvas width](https://discourse.metabase.com/t/is-it-possible-to-increase-the-dashboard-canvas-width/314913)

**Apache Superset**
- Source constants: `GRID_COLUMN_COUNT = 12`, `GRID_BASE_UNIT = 8`, `GRID_GUTTER_SIZE = 2 * GRID_BASE_UNIT` (16), `GRID_MIN_COLUMN_COUNT = 1`, `GRID_MIN_ROW_UNITS = 5`, `GRID_MAX_ROW_UNITS = 100`, `GRID_DEFAULT_CHART_WIDTH = 4`. — [apache/superset, dashboard/util/constants.ts (master)](https://raw.githubusercontent.com/apache/superset/master/superset-frontend/src/dashboard/util/constants.ts)
- A third-party skill guide states 24 columns for Superset; this contradicts the source constant and is treated as wrong. — [Superset source](https://raw.githubusercontent.com/apache/superset/master/superset-frontend/src/dashboard/util/constants.ts); contradicted by [smithery.ai superset-dashboard-designer](https://smithery.ai/skills/jgtolentino/superset-dashboard-designer)

**Power BI (dashboards, not reports)**
- "You can make tiles many different sizes—from 1x1 tile units up to 5x5." — [Microsoft Learn, Create or edit a dashboard tile (ms.date 2025-11-01)](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboard-edit-tile)

**Azure Portal**
- Tile position is stored as `x`, `y`, `colSpan`, `rowSpan`: "The values are in terms of grid units. These grid units are visible when the dashboard is in editable mode". The example dashboard uses x up to 9 and colSpan up to 11. — [Microsoft Learn, The structure of Azure dashboards](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards-structure)

**Salesforce**
- Metadata API: `isGridLayout` "Specifies whether a dashboard uses the Lightning Experience layout"; Lightning Experience "allows dashboards with more than three columns with components that span multiple columns and multiple rows in size". — [Salesforce Metadata API, Dashboard](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_dashboard.htm)
- 12 vs 9 columns: a release note titled "Show More Data with 12-Column Dashboards" says 12-column dashboards give more control "but you can still make 9-" column dashboards; a search summary of the same note adds that rows of dashboards created from that release are half as tall as before, existing dashboards keep their row height. Only reached through a third-party copy labelled Spring '19 — not verified on help.salesforce.com. — [Scribd copy of the release notes](https://www.scribd.com/document/426278636/dfd)
- An older Trailhead module describes Lightning dashboards with up to nine columns and unlimited rows (search snippet). — [Trailhead, Explore Reports and Dashboards](https://trailhead.salesforce.com/lex_migration_whatsnew/lex_migration_whatsnew_analytics)
- CRM Analytics (a different Salesforce product) stores `numColumns` per layout ("The number of columns in the designer grid for this layout") and `colspan` per widget. — [Salesforce CRM Analytics dashboard JSON, gridLayouts](https://developer.salesforce.com/docs/analytics/bi-dev-guide-json/guide/bi-dbjson-gridlayoutproperties.html)
- Lightning App Builder is not a grid: a page template "defines the page's regions and what components the page includes"; regions declare a default width (Small, Medium, Large, Xlarge). — [Salesforce, Lightning Page Template Component Best Practices](https://developer.salesforce.com/docs/platform/aura-platform/guide/components-config-for-app-builder-template-component-tips.html)

**Jira**
- No grid: a dashboard has a chosen column layout ("Edit Layout"; the documented example is going from two columns to three); gadgets are stacked inside columns. — [Atlassian Support, Manage dashboards and gadgets](https://support.atlassian.com/jira-service-management-cloud/docs/manage-dashboards-and-gadgets/)

**ServiceNow**
- The Fluent Dashboard API places widgets inside tabs with height, width and x/y values; the example widget is 12 units wide (search summary of the ServiceNow docs page; not opened). — [ServiceNow docs, Dashboard API - ServiceNow Fluent](https://www.servicenow.com/docs/r/a3E8xg0zsiQLBPKbKO15Mg/Vpvq2tc2fi1F25O20lvBUA)

**Notion**
- Dashboard view: rows of widgets, "up to 4 widgets per row and 12 widgets total"; width is changed by dragging the handle between two widgets, row height by dragging the divider between rows. — [Notion Help, Dashboards view](https://www.notion.com/help/dashboards)

**Home Assistant (sections view)**
- "The sections are using a 12 columns grid." Custom cards declare `columns`, `rows`, `min_columns`, `min_rows` (example: 6, 2, 3, 2). — [Home Assistant developers blog, 6 Nov 2024](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support)
- Inside a section "the number of columns of cards within each section stays the same"; "the width of the columns remain constant for responsive design". — [Home Assistant blog, Dashboard chapter 1, 4 Mar 2024](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1)
- Theme variable for section width: `ha-view-sections-column-min-width`, default 320px (forum post, search snippet). — [HACF forum, Sections - alignement](https://forum.hacf.fr/t/sections-alignement/51334)

**Others met in passing (search snippets only)**
- GoodData: "the layouts of dashboards use a 12-column grid". — [GoodData help, Edit items on dashboards](https://help.gooddata.com/doc/growth/en/dashboards-and-insights/dashboards/edit-items-on-dashboards/)
- MongoDB Atlas Charts: a user request to move from a 10-column to a 12-column grid because 12 divides more evenly. — [MongoDB feedback: 12 column grid for Atlas Charts dashboards](https://feedback.mongodb.com/forums/923524-charts/suggestions/47087302-12-column-grid-for-atlas-charts-dashboards)

### Inferences
- The column counts cluster on highly divisible numbers: 12 (Datadog, Superset, Salesforce, Home Assistant sections, GoodData), 24 (Grafana, Metabase) and 48 (Kibana). Metabase's move from 18 to 24 and the Atlas Charts request from 10 to 12 are both arguments for divisibility by 2, 3 and 4 ("symmetry").
- Finer grids (24, 48) come with products whose authors are specialists building dense monitoring boards; coarser grids or named regions (Notion's 4 per row, Jira's columns, Lightning App Builder's regions) come with products whose readers arrange a personal page.
- "Fixed column count, columns scale with the window, row height in fixed pixels" means the aspect ratio of every widget changes with window width. This is the root of most complaints listed in section 2.

### Gaps
- Pixel values of Grafana's Auto grid presets (narrow/standard/wide, short/standard/tall) are not in the documentation read; they would have to be taken from the Grafana source.
- Datadog's row height unit and Power BI's tile unit in pixels were not found in the pages read.
- Salesforce's 12/9-column setting could not be confirmed on an official Salesforce page (help.salesforce.com is not fetchable as text); the release (Spring '19) is taken from a third-party copy.
- ServiceNow's column count for the responsive canvas is not stated in any source reached; the "12" is one API example.
- Linear and Geckoboard publish no grid parameters in the pages read. A third-party page claims Geckoboard lets the user choose a column count (about six for a TV) — [mydatascope.com](https://mydatascope.com/en/integration/dashboards/geckoboard?id=1351) — which describes an older Geckoboard generation and is not confirmed by current support articles.

## 2. Other screen sizes: narrow windows, wide monitors, phones, TV walls; complaints

### Takeaway
The dominant behaviour is "one arrangement, scaled": columns stretch on wide screens and collapse to a single stacked column below a small-screen threshold (about 768/769 px in Grafana). Complaints are consistent across products: a layout tuned on one monitor looks wrong on another, stacking order on phones cannot be controlled, and wide TVs leave empty margins. The published answers are three different ones: a separately arranged phone layout (Power BI), a fixed maximum width (Metabase 0.49, 2024) and width-following flow layouts (Grafana Auto grid 2025-2026, Home Assistant sections 2024).

### Cited Findings

**Grafana**
- Stated motive for the new layouts: "Some dashboard layouts are not responsive and struggle to adapt panel layouts for different screen sizes"; Auto grid is "a flexible panel layout that adapts to varying screen sizes and dynamic content". — [Grafana blog, Dynamic dashboards in Grafana 12 (May 2025)](https://grafana.com/blog/dynamic-dashboards-grafana-12/)
- Threshold: a forum reply states that when the screen width "is less than 769px (iPad portrait mode width)" Grafana switches to another layout. Search snippet; the exact thread among the results was not opened. — [Grafana community: Table panel layout and responsive design ok below 768px](https://community.grafana.com/t/table-panel-layout-and-responsive-design-ok-below-768px/38242)
- Complaint (same thread): three tables side by side stack below 768 px, but between that width and a wide screen they become too narrow; the user asks for an earlier stacking point. — [Grafana community thread 38242](https://community.grafana.com/t/table-panel-layout-and-responsive-design-ok-below-768px/38242)
- Complaint: a user wants different panel arrangements for desktop and mobile and finds panels misaligned and distorted. — [Grafana community: Flex System Issue](https://community.grafana.com/t/flex-system-issue-need-help-with-dashboard-layout-in-grafana/101134)
- Complaint: fixed pixel heights distort a wide desktop layout on a phone. — [Grafana community: Responsive Height of panels](https://community.grafana.com/t/responsive-height-of-panels/39240)
- Issue tracker (list sorted by thumbs-up, numbers beside the titles are unlabelled and most likely reaction counts): #12768 "Auto fit dashboard panels to optimize space for TV/monitor" (closed 14 Aug 2018, 21); #10325 "Support dynamic height panels in Grafana 5" (closed 23 Dec 2017, 20); #4529 "Dashboard panel layout is not responsive for mobile" (closed 1 Apr 2016); #9996 "New dashboard grid & responsive (mobile) handling" (closed 28 Nov 2017). — [GitHub grafana/grafana issue search](https://github.com/grafana/grafana/issues?q=is%3Aissue+dashboard+layout+responsive+sort%3Areactions-%2B1-desc)
- Accessibility findings filed against small viewports in 2026: #118782 "A11y: data truncated at 320×256 viewport" (closed 25 Feb 2026). — [GitHub grafana/grafana issue search](https://github.com/grafana/grafana/issues?q=is%3Aissue+dashboard+layout+responsive+sort%3Areactions-%2B1-desc)

**Datadog**
- "TV mode scales down the dashboard to fit everything on the screen without scrolling"; disproportionate dimensions leave "white spaces on the edges"; "Content may be centered on the screen rather than expanding to the edges." — [Datadog docs, TV mode guide](https://docs.datadoghq.com/dashboards/guide/tv_mode/)
- Recommended workarounds: match the dashboard's proportions to the TV; zoom the browser before entering TV mode (downside: zooming "can make some fonts smaller and difficult to read from a distance"); or use a screenboard, which "allows finer control over widget positioning" with "pixel precision placement". — [Datadog docs, TV mode guide](https://docs.datadoghq.com/dashboards/guide/tv_mode/)
- Wide screens: "High-density mode displays group widgets in a dashboard side-by-side for increased widget density"; it turns on by default on large screens for dashboards that use group widgets and is toggled under "Increase density". — [Datadog docs, Configure dashboards](https://docs.datadoghq.com/dashboards/configure/)
- 2021 description of the same feature: on wide screens the top and bottom halves of a dashboard are placed side by side; enabled by default on large monitors. — [Datadog blog, 20 May 2021](https://www.datadoghq.com/blog/datadog-dashboards)
- Phones: a separate mobile app shows dashboards "in a mobile-friendly format"; creating or editing requires the browser UI. — [Datadog docs, Dashboards](https://docs.datadoghq.com/dashboards/)

**Kibana / Elastic**
- Forum reports: a dashboard designed for desktop rearranges on a small portrait width, visualizations shown vertically below each other; an Elastic reply points to issue elastic/kibana#2563 on the mobile experience (search snippets; threads not opened). — [Elastic discuss: Responsive Kibana](https://discuss.elastic.co/t/responsive-kibana/141909); [Elastic discuss: Fluid layout for Kibana panel?](https://discuss.elastic.co/t/fluid-layout-for-kibana-panel/374241)
- The Arrange panels page does not describe small-screen behaviour. — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)

**Metabase**
- Issue #10364 "Fixed width dashboard option" (opened 17 Jul 2019, closed as completed 21 Feb 2024): auto-resizing makes dashboards look inconsistent at different browser sizes and undermines layout work; an optional fixed width was requested, also for executive reports and PDF export. Metabase staff: "We are working on this feature now." (27 Oct 2023); "This will be available in Metabase Version 0.49." (15 Feb 2024). — [GitHub metabase/metabase#10364](https://github.com/metabase/metabase/issues/10364)
- The migration added a dashboard `width` column, set existing dashboards to `full` to keep their behaviour and made `fixed` the default for new ones (commit "Update default sizes for new dash width (#38450)", read through a mirror; search snippet). — [Metabase commit mirror](https://code.umd.edu/eds/metabase/-/commit/ae68db40ae33f7384360a623d1a4543f10c3a5b5)
- Phones: cards are re-sorted into a single column; a commit (#33145) changed how cards are sorted for the mobile layout. A forum user asked for control over card order on phones and was told no such request existed (search snippets). — [Metabase commit mirror #33145](https://code.umd.edu/eds/metabase/-/commit/a47b7f813eaa93aeba26cc410cbae9daff32167e); [Metabase Discourse: Cards responsive design](https://discourse.metabase.com/t/cards-responsive-design/9999)
- Further mobile complaints (oversized cards, filter stacking, vertical title) reference issues #7778 and #10364. — [Metabase Discourse: Optimize Metabase Dashboard Mobile View](https://discourse.metabase.com/t/optimize-metabase-dashboard-mobile-view/14109)
- "Metabase will automatically update a question's display to make sure your data looks great at any size you choose." — [Metabase docs, Dashboards introduction](https://www.metabase.com/docs/latest/dashboards/introduction)

**Power BI**
- Default on a phone in portrait: "the dashboard tiles are laid out one after another, all the same size". — [Microsoft Learn, Optimize a dashboard for mobile phones](https://learn.microsoft.com/en-us/power-bi/create-reports/service-create-dashboard-mobile-phone-view)
- Separately arranged phone layout: Edit > Mobile layout, owner only ("If you aren't the dashboard owner, you won't see this option"); "you can unpin, resize, and rearrange tiles to fit the phone view. The web version of the dashboard doesn't change." Removed tiles go to an "Unpinned tiles" pane; "Reset tiles" restores the previous size and order. — [Microsoft Learn, Optimize a dashboard for mobile phones](https://learn.microsoft.com/en-us/power-bi/create-reports/service-create-dashboard-mobile-phone-view)
- No draft for the phone layout: "As you edit the phone view, anyone viewing the dashboard on a phone can see the changes you make in real time." — [Microsoft Learn, Optimize a dashboard for mobile phones](https://learn.microsoft.com/en-us/power-bi/create-reports/service-create-dashboard-mobile-phone-view)
- Landscape on a phone shows the web arrangement: "you see all of the dashboard's tiles just as they are in the Power BI service". — [Microsoft Learn, View dashboards in the mobile apps](https://learn.microsoft.com/en-us/power-bi/consumer/mobile/mobile-apps-view-dashboard)
- Power BI Embedded offers a one-column layout for dashboards on mobile devices; the predefined phone view was not supported in that release. — [Azure updates, Power BI Embedded mobile layout support](https://azure.microsoft.com/updates/mobile-layout-support/)

**Jira**
- Bug JSWCLOUD-17567 "Wallboards displayed incorrectly (size scaled down)": gadgets on wallboards were squeezed in some column layouts; marked fixed (search snippet). — [Atlassian JSWCLOUD-17567](https://jira.atlassian.com/browse/JSWCLOUD-17567)
- Wallboard mode: "View as wallboard" shows the dashboard "against a black background and will rotate gadgets if the user enables the slideshow option". — [Atlassian Support, Manage dashboards and gadgets](https://support.atlassian.com/jira-service-management-cloud/docs/manage-dashboards-and-gadgets/)

**Geckoboard**
- A TV-specific layout with a snapping grid is switched on by the toggle "Optimize layout for TV screens" when creating a dashboard; a "Dense layout" option in "Customize Appearance" fits more metrics; the dashboard can be previewed in the browser before it goes to the TV; described as public beta (search snippet of the product update). — [Geckoboard product updates #79](https://geckoboard.com/updates/79)
- A widget that is too small shows the message "too small to display". — [Geckoboard support, Arrange widgets on a dashboard](https://support.geckoboard.com/en/articles/6055766-arrange-widgets-on-a-dashboard)

**Home Assistant**
- Why position stability across screens matters: with masonry "the muscle memory of where users remember the cards will be lost every time the dashboard is displayed on another screen". — [Home Assistant blog, Dashboard chapter 1](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1)
- Sections reflow as units: "The Z-Grid works simply by laying out sections from left to right, and starting a new row when the row is full"; "The heights of the rows are determined by the tallest section on the row"; chosen "despite it may take up more space than other solutions". — [Home Assistant blog, Dashboard chapter 1](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1)
- Counter-complaint on wide screens: forum thread "Why won't section columns resize to fill the screen and there's no options to adjust?" (title only; not opened). — [Home Assistant community thread 1023526](https://community.home-assistant.io/t/why-wont-section-columns-resize-to-fill-the-screen-and-theres-no-options-to-adjust/1023526)

**Salesforce Lightning App Builder**
- Per-device behaviour is declared by the component: a `flexipage:formFactor` tag "specifies how much space the component takes on the page based on the type of device that it renders on". — [Salesforce, Lightning Page Template Component Best Practices](https://developer.salesforce.com/docs/platform/aura-platform/guide/components-config-for-app-builder-template-component-tips.html)

**Others (search snippets only)**
- SquaredUp changelog entry "Dashboards are now mobile friendly". — [SquaredUp changelog](https://feedback.squaredup.com/changelog/dashboards-are-now-mobile-friendly)

### Inferences
- Three distinct complaints recur and need different answers: (a) too wide — content stretches or leaves margins on a TV (Grafana #12768, Datadog TV mode); (b) too narrow but above the phone threshold — widgets get too thin before the one-column fallback triggers (Grafana table thread); (c) phone — stacking order and uniform sizes are not what the author wants (Metabase, Power BI's reason for a separate layout).
- No product among those read stores several independently arranged breakpoint layouts for desktop the way react-grid-layout's `Responsive` component allows; Power BI's phone layout is the only second arrangement, and it is a re-ordering/re-sizing of the same tiles, not a second coordinate set for desktop widths.
- Width-following layouts (Auto grid, sections) trade exact placement for stability; both Grafana and Home Assistant kept a manual alternative (Grafana "Custom", Home Assistant's other view types) rather than replacing it.
- Metabase's fixed width is the cheapest answer to "looks different on my monitor": it caps the width instead of changing the model.

### Gaps
- Kibana's small-screen breakpoint value and the exact stacking rule could not be confirmed from a primary source.
- Grafana's 769 px threshold comes from a forum reply seen as a snippet; it was not confirmed in documentation or source in this session.
- Datadog's width threshold for switching on high-density mode is not documented in the pages read.
- Salesforce Lightning dashboards on phones (Salesforce mobile app) and ServiceNow's responsive behaviour were not found.
- Notion's and Linear's dashboard behaviour on phones is not described in their help pages.
- Power BI / Fabric Ideas entries with vote counts on tile layout could not be read (the ideas portal is not fetchable as text).

## 3. Stored model: coordinates or flow; gaps or compaction; collisions; moves between models

### Takeaway
Monitoring and BI products store coordinates (x, y, w, h) on a fixed-column grid and compact upward; Superset and Notion store a tree of rows; Jira stores an order per column. Since 2024 three products published a move away from pure coordinates toward flow or grouped layouts — Home Assistant (sections, 2024), Grafana (Auto grid plus rows/tabs, experimental May 2025, GA April 2026) and Kibana (own engine for sections, 2025) — while none moved from flow to free coordinates; Datadog's 2021 move went from a free pixel canvas (screenboard) to a snapping grid, yet the free canvas still exists.

### Cited Findings

**Grafana**
- Classic model: `gridPos` with `x`, `y`, `w`, `h`; "The grid has a negative gravity that moves panels up if there is empty space above a panel." — [Grafana docs, dashboard JSON model v13.0](https://grafana.com/docs/grafana/v13.0/dashboards/build-dashboards/view-dashboard-json-model/)
- Schema v2 keeps both models side by side. `GridLayout` ("Custom" in the UI): items with `x`, `y`, `width`, `height`, a reference to an element, optional `repeat` (`direction` h/v, `maxPerRow`). `AutoGridLayout` ("Auto grid"): an ordered `items` list with no coordinates, plus per-layout column and row constraints. `RowsLayout` and `TabsLayout` each contain a nested layout of any of the four kinds. — [Grafana docs v12.1, layout schema](https://grafana.com/docs/grafana/v12.1/observability-as-code/schema-v2/layout-schema)
- Panels live in an `elements` map and layouts reference them, instead of the flat `panels[]` array; tools that assume `panels[]` see zero panels on v2 dashboards. — [GitHub grafana/mcp-grafana#712](https://github.com/grafana/mcp-grafana/issues/712)
- Reasons published for schema v2: noisy diffs, migration difficulties, unclear separation of panel and dashboard settings; the new schema is "Built around a common pattern used in a Kubernetes resources manifest". — [Grafana blog, Dynamic dashboards in Grafana 12](https://grafana.com/blog/dynamic-dashboards-grafana-12/)
- Status timeline: experimental 10 Apr 2025 (Grafana 12), public preview 14 Jan 2026 (Grafana 12.4), generally available and "now on by default for all Grafana Cloud users and self-managed Grafana instances" (What's new entry dated 8 Apr 2026; Grafana 13.0 per the 13.0 what's-new page). "V1 dashboards" are migrated to v2 when loaded. — [Grafana What's new, GA](https://grafana.com/whats-new/2026-04-08-dynamic-dashboards-is-now-generally-available/); [Grafana docs, What's new in v13.0](https://grafana.com/docs/grafana/latest/whatsnew/whats-new-in-v13-0/); [linuxiac on 12.4](https://linuxiac.com/grafana-12-4-observability-platform-released-with-dynamic-dashboards/)
- Conversion is one-way on the backend: once enabled, saved dashboards convert to v2 and this cannot be rolled back. — [Grafana blog, Dynamic dashboards in Grafana 12](https://grafana.com/blog/dynamic-dashboards-grafana-12/)
- Leaving the flow model is explicit: resizing a panel in Auto grid opens a dialog with "Edit auto layout" or "Switch to custom layout". — [Grafana docs, create dashboard](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/)
- Fallout of the model change: #122663 "Provisioning: dashboards saved in Grafana 13 cannot be provisioned" (closed 20 Apr 2026, 17). — [GitHub grafana/grafana issue search](https://github.com/grafana/grafana/issues?q=is%3Aissue+dashboard+layout+responsive+sort%3Areactions-%2B1-desc)

**Datadog**
- Before 2021: "Screenboards, for pixel-level control on a canvas, and Timeboards, for troubleshooting a specific point in time". The 2021 layout "combines the fine control of Screenboards with the quick, grid-based workflow of Timeboards". — [Datadog blog, 20 May 2021](https://www.datadoghq.com/blog/datadog-dashboards)
- Collision and fit: dragging and resizing "will automatically snap them into place on the grid"; a slightly oversized widget "will automatically 'squeeze' to fit"; adjacent widgets are swapped by dragging one over the other. — [Datadog blog, 20 May 2021](https://www.datadoghq.com/blog/datadog-dashboards)
- The merge is not complete in the documentation of 2026: three layout types are still listed — Dashboards ("A grid-based layout"), Timeboards ("Automatic layouts that represent a single point in time") and Screenboards ("Dashboards with free-form layouts"). — [Datadog docs, Dashboards](https://docs.datadoghq.com/dashboards/)

**Kibana / Elastic**
- Coordinates: with the Dashboards API "you specify x, y, w, and h as grid coordinates directly", and the editor's automatic packing does not apply there. — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)
- Engine change (blog of 22 Jan 2025, authors Teresa Alvarez Soler, Hannah Mudge, Nathaniel Reese): react-grid-layout was "missing critical features" for collapsible sections — nested panels and dragging panels between two layout instances; its maintainers are a small volunteer group; a Kibana fork was rejected for maintenance cost. The replacement `kbn-grid-layout` is, to the authors' knowledge, "the first layout engine available that makes use of the native CSS grid" to position panels, where other engines use pixel transforms or absolute positioning. — [Elastic Search Labs blog](https://www.elastic.co/search-labs/blog/kibana-dashboard-build-layout)
- Details of the engine: passive event handlers and minimal re-renders; auto-scroll when dragging near the top or bottom; grid height locked during resize. — [Elastic Search Labs blog](https://www.elastic.co/search-labs/blog/kibana-dashboard-build-layout)
- Duplicate: "The copy appears next to the original, and other panels shift to make room" (paraphrase of the page). — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)

**Metabase**
- Push, not swap: "click and drag the card. Other cards will move out of the way."; on resize "Nearby cards will move away to accommodate the new size." — [Metabase docs, Dashboards introduction](https://www.metabase.com/docs/latest/dashboards/introduction)

**Apache Superset**
- Tree, not coordinates: the layout elements are Tabs, Header, Text (Markdown), Divider, and "Rows and Columns", which are dragged from a "LAYOUT ELEMENTS" tab. — [Preset docs, Dashboard customization](https://docs.preset.io/docs/dashboard-customization)
- Size limit of the stored layout: `DASHBOARD_POSITION_DATA_LIMIT = 65535` (overridable by server config, per the comment). — [apache/superset constants.ts](https://raw.githubusercontent.com/apache/superset/master/superset-frontend/src/dashboard/util/constants.ts)

**Azure Portal**
- `properties.lenses[0].parts` is a map whose keys are numbers ("The number isn't significant"); each part has `position` (`x`, `y`, `colSpan`, `rowSpan`) and `metadata.type`. `lenses.order` is "always set to 0". — [Microsoft Learn, The structure of Azure dashboards](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards-structure)

**Jira**
- Order within columns: on the default dashboard gadgets "can be reordered and switched between the left and right columns". — [Atlassian Support, Manage dashboards and gadgets](https://support.atlassian.com/jira-service-management-cloud/docs/manage-dashboards-and-gadgets/)

**Notion**
- Rows of widgets; a widget is added with `+` on a row or at the bottom; no coordinates are exposed. — [Notion Help, Dashboards view](https://www.notion.com/help/dashboards)

**Home Assistant**
- Why flow-by-height failed for editing: masonry depends on card heights — "Even a difference in height of 1 pixel would mean a card one would guess to be displayed on the leftmost column" ends up elsewhere; "Masonry lays out cards in a logic that may not be immediately clear and predictable to many users." — [Home Assistant blog, Dashboard chapter 1](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1)
- The stated trilemma: "Masonry layout, compatibility with multiple screen sizes, and easy "drag and drop" rearrangement of cards" could not all be had together. — [Home Assistant blog, Dashboard chapter 1](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1)
- The answer: sections as "the base unit of the view"; inside a section "the relative positions of the cards within a section are not affected by changes in screen sizes"; cards of "regular row height and column width multiples". — [Home Assistant blog, Dashboard chapter 1](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1)
- Shipped experimentally in 2024.3 (6 Mar 2024); default view type since 2024.11 (secondary source). — [Home Assistant 2024.3 release](https://home-assistant.io/blog/2024/03/06/release-20243/); [peyanski.com](https://peyanski.com/sections-view-is-the-new-default-in-home-assistant/)

**Geckoboard**
- Moving shows a box where the widget can be dropped; dragging one widget onto another creates a group whose inner orientation (side by side or stacked) is a setting. — [Geckoboard support, Arrange widgets on a dashboard](https://support.geckoboard.com/en/articles/6055766-arrange-widgets-on-a-dashboard)

### Inferences
- Direction of travel 2021-2026: free pixel canvas -> snapping grid (Datadog 2021); grid of coordinates -> grid of coordinates plus an ordered flow option plus nested groups (Grafana 2025-26); flow by height -> sections with a fixed inner grid (Home Assistant 2024); library grid -> own CSS-grid engine to get nesting (Kibana 2025). The common endpoint is two levels: an ordered sequence of groups that reflow, and a stable inner arrangement.
- Nobody published a move from order/flow to free coordinates. Grafana kept coordinates as "Custom" but made the choice per dashboard, row or tab.
- Upward compaction ("negative gravity") is the rule for coordinate grids (Grafana verified; Kibana's "automatic packing" in the editor); permanent gaps are a property of free canvases (Datadog screenboard) and of Azure's tile grid, where the example JSON leaves cells empty.
- Collision handling is "push away" everywhere it is documented (Metabase, Kibana duplicate); Datadog adds swap for neighbours and "squeeze" for near-fits.
- Grafana needed a new schema to add flow layouts, and the conversion is one-way; a library that wants both models should make the stored model carry both from the start.

### Gaps
- Whether Azure Portal and Power BI dashboards compact or allow permanent gaps is not stated in the documentation read (the Azure example JSON suggests gaps are allowed; not verified in the UI).
- Power BI's stored dashboard model is not publicly documented in the pages read. Unverified recollection: moving a tile makes the others flow around it without overlap.
- Superset's stored `position_json` structure (a flat map of nodes with `children`, `meta.width`, `meta.height`) is recalled from the source but was not read in this session; only the constants were.
- ServiceNow: the primary page for editing responsive dashboards returned 404; the x/y/width/height model is taken from a search summary of the Fluent API page.
- Kibana's collision algorithm is not described in the blog or docs read.

## 4. Sizes: free resize or named sizes; minimums; snapping

### Takeaway
Free resize in grid steps with snapping is the norm (Grafana custom, Kibana, Metabase, Datadog, Superset, Geckoboard, Azure for tiles that support it); named or bounded sizes appear where the audience is less technical or the layout must reflow (Grafana Auto grid's narrow/standard/wide and short/standard/tall, Azure's size menu, Power BI's 1x1 to 5x5, Notion's at most 4 per row, Home Assistant's per-card min sizes).

### Cited Findings
- Grafana: resizing by dragging the lower-right corner exists only in the Custom layout; Auto grid offers named column widths and row heights for the whole layout, not per panel. — [Grafana docs, create dashboard](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/)
- Kibana: resize by the bottom-right corner; panels snap to the grid. — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)
- Metabase: "click the handle at the bottom right corner of the card, and drag to resize"; in edit mode "they'll snap to the grid". — [Metabase docs, Dashboards introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
- Superset: minimum 1 column and 5 row units, maximum 100 row units, default chart width 4 of 12 columns; base unit 8 px, gutter 16 px. — [apache/superset constants.ts](https://raw.githubusercontent.com/apache/superset/master/superset-frontend/src/dashboard/util/constants.ts)
- Datadog: widgets snap to the grid on drag and resize; near-fits "squeeze". — [Datadog blog, 20 May 2021](https://www.datadoghq.com/blog/datadog-dashboards)
- Power BI: sizes "from 1x1 tile units up to 5x5", by dragging the handle in the bottom-right corner. — [Microsoft Learn, Create or edit a dashboard tile](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboard-edit-tile)
- Power BI complaint: a community answer says the size of tiles "can't be controlled" beyond the offered steps, and a Microsoft support reply notes some visuals (table) do not support resizing (search snippets). — [Fabric community: Customize the Tile size in Dashboard](https://community.fabric.microsoft.com/t5/Service/Customize-the-Tile-size-in-Dashboard/m-p/2395762)
- Azure Portal: "Select the context menu in the upper right corner of a tile. Then, choose a tile size. Tiles that support any size also include a handle in the lower right corner that you can use to drag the tile to the size you want." — [Microsoft Learn, Create a dashboard in the Azure portal (ms.date 2026-05-26)](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards)
- Salesforce: Trailhead says a widget is clicked to resize it and positioned by dragging; a 2026 third-party guide says resized components snap to the 12-column grid (search snippets). — [Trailhead, Visualizing data](https://trailhead.salesforce.com/modules/lex_implementation_reports_dashboards/units/lex_implementation_reports_dashboards_visualizing_data); [usecarly.com 2026 guide](https://www.usecarly.com/blog/how-to-create-dashboard-in-salesforce/)
- Jira: gadget width is the column's width; "Edit Layout" gives limited control over column proportions (search snippet of the gadget docs). — [Atlassian gadget docs](https://confluence.atlassian.com/display/GADGETS/_Content+for+Changing+the+Layout+of+your+Dashboard)
- Notion: width by the handle between two widgets in a row, height per row by the divider between rows; at most 4 widgets per row. — [Notion Help, Dashboards view](https://www.notion.com/help/dashboards)
- Geckoboard: resize by dragging a widget's side (search snippet of the resize article: eight handles); a too-small widget shows "too small to display". — [Geckoboard support, Arrange widgets](https://support.geckoboard.com/en/articles/6055766-arrange-widgets-on-a-dashboard); [Geckoboard support, Resize widgets](https://support.geckoboard.com/en/articles/6055744-resize-widgets-on-a-dashboard)
- Home Assistant: a card declares default and minimum size (`columns: 6, rows: 2, min_columns: 3, min_rows: 2` in the example); at launch only Tile, Button and Sensor cards had standardised sizes and "other cards will occupy the full width of a section by default at the moment". — [Home Assistant developers blog, 6 Nov 2024](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support); [Home Assistant blog, Dashboard chapter 1](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1)
- Kibana gives recommended, not enforced, sizes per visualization type (see section 1). — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)

### Inferences
- Minimum sizes per widget type are declared by the widget in the two systems that have them explicitly (Home Assistant `getGridOptions`; Azure tiles that do or do not "support any size"). In the BI tools the minimum is global (Superset) and unreadable results are handled after the fact ("too small to display" in Geckoboard; Metabase adapting the display).
- Row-wise sizing (Notion: one height per row) removes the ragged-edge problem entirely at the cost of independent heights.
- Named sizes go together with flow layouts: once position is derived, size has to be a small vocabulary or a layout-wide setting.

### Gaps
- Per-visualization minimum sizes in Metabase, Grafana and Datadog are in source code, not in the documentation read. Unverified recollection: Metabase defines default and minimum card sizes per visualization type.
- Salesforce's minimum component size and its official resize rules were not verified on a Salesforce page.

## 5. Edit mode: explicit vs always editable; save/discard vs autosave; undo/redo; version history

### Takeaway
An explicit edit mode with Save and Cancel/Discard is the majority pattern (Grafana, Kibana, Metabase, Superset, Azure Portal, Salesforce, ServiceNow, Notion); Power BI dashboards and Jira are edited live with no draft. Version history is the usual safety net (Grafana, Datadog 30/90 days, Metabase 15 versions); real undo/redo inside the editor is rare and documented only for Superset (limit 50).

### Cited Findings
- Grafana: "Edit" enters edit mode, "Exit edit" leaves; saving is "Save", optional description, "Save" again; "Save as copy" copies the dashboard. The new side pane also allows some edits "without the need to enter full edit mode". — [Grafana docs, create dashboard](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/); [Grafana blog, Dynamic dashboards in Grafana 12](https://grafana.com/blog/dynamic-dashboards-grafana-12/)
- Grafana undo: no general undo/redo for manual edits was found in the 12.4 or 13.0 notes; the only undo is for the Assistant — "Undo turn" reverts the most recent Assistant request while the page stays open and is blocked after manual edits (Grafana 13.3.0, 21 Sep 2026). — [Grafana What's new, Assistant undo](https://grafana.com/whats-new/2026-09-21-try-dashboard-changes-confidently-with-grafana-assistant-undo/)
- Grafana version history: view history, compare two versions, restore — since v4.4. — [Grafana docs archive, What's new in v4.4](https://grafana.com/docs/grafana/v6.4/guides/whats-new-in-v4-4)
- Grafana bug report on draft handling: "Discard panel changes" stays disabled after a real panel edit (v11.6.8). — [Grafana community thread 164302](https://community.grafana.com/t/discard-panel-changes-stays-disabled-after-a-real-panel-edit-only-re-enables-after-switching-browser-tabs-no-network-activity/164302)
- Datadog: Version History "automatically tracks changes made to your dashboards"; "30 days worth of version history by default", 90 days with Audit Trail; preview "does not save any changes or impact what other users see until you actively choose to restore"; restore "updates the dashboard to that version for all users" and is itself a new entry; any version can be cloned. — [Datadog docs, Version history guide](https://docs.datadoghq.com/dashboards/guide/version_history/)
- Datadog has an edit mode at least for tabs (widgets are moved to a tab "in edit mode") and a keyboard-shortcut list in the Configure menu. — [Datadog docs, Configure dashboards](https://docs.datadoghq.com/dashboards/configure/)
- Kibana: arranging happens in Edit mode and is followed by Save; viewers see a collapsible section in the state it was saved in. — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)
- Metabase: edit mode by the pencil icon; Save; "Metabase keeps a version history for the previous fifteen versions of that item." — [Metabase docs, Dashboards introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
- Superset: "EDIT DASHBOARD" enters edit mode; the undo stack is capped by `UNDO_LIMIT = 50`. — [Preset docs, Dashboard customization](https://docs.preset.io/docs/dashboard-customization); [apache/superset constants.ts](https://raw.githubusercontent.com/apache/superset/master/superset-frontend/src/dashboard/util/constants.ts)
- Power BI: no edit mode for the web layout — a tile is dragged or resized directly on the dashboard; the phone layout is edited live for all viewers. — [Microsoft Learn, Create or edit a dashboard tile](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboard-edit-tile); [Microsoft Learn, Optimize a dashboard for mobile phones](https://learn.microsoft.com/en-us/power-bi/create-reports/service-create-dashboard-mobile-phone-view)
- Azure Portal: "Edit" in the header; "Save"; "You can also preview the changes without saving by selecting Preview. From the preview screen, select Save to keep the changes, Cancel to remove them, or Edit to go back". Tile configuration happens outside edit mode ("select Save or Cancel near the top of the page to exit edit mode"). — [Microsoft Learn, Create a dashboard in the Azure portal](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards)
- Jira: no draft; changes to the default dashboard apply to every user currently using it. — [Atlassian Support, Manage dashboards and gadgets](https://support.atlassian.com/jira-service-management-cloud/docs/manage-dashboards-and-gadgets/)
- ServiceNow: changes start by putting the dashboard into edit mode; edit rights on the dashboard do not give edit rights on its widgets (search summary). — [ServiceNow docs, Edit a responsive dashboard](https://www.servicenow.com/docs/r/now-intelligence/t_EditADashboard.html)
- Notion: creating a dashboard starts in Edit mode; View mode is the default for consumers; filter and sort changes made in View mode are stored locally by default, and "Save for everybody" (edit permission required) shares them. — [Notion Help, Dashboards view](https://www.notion.com/help/dashboards)
- Home Assistant released sections "early in its incomplete form as an experiment" and ran user tests before deciding further. — [Home Assistant blog, Dashboard chapter 1](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1)

### Inferences
- Explicit edit mode goes together with shared dashboards: where one author's change is everybody's change, products want a deliberate Save (Grafana, Kibana, Metabase, Azure) or a history that can be restored (Datadog). Live editing appears where the dashboard is treated as personal (Power BI My workspace tiles, Jira personal dashboards).
- Notion's split is worth noting for a reader-arranged dashboard: arrangement is a saved, shared thing; per-reader view tweaks (filters, sorts) are local until promoted with "Save for everybody".
- Undo/redo inside the editor is conspicuously absent from documentation outside Superset; products lean on Discard plus version history instead. For a library whose readers are not authors, undo is an open field rather than an established expectation.
- Azure's "Preview" between Edit and Save is the only documented draft preview of an arrangement.

### Gaps
- Datadog: whether layout edits are saved automatically or by an explicit Save, and whether Cmd/Ctrl+Z undoes them, is not stated in the pages read. Unverified recollection: Datadog supports Cmd/Ctrl+Z for dashboard edits.
- Kibana: unsaved-changes handling (unverified recollection: an "Unsaved changes" badge, with the draft kept in the browser session and a "Reset" action) was not read in this session.
- Metabase: a "Removed card — Undo" toast is recalled but not verified; the documentation page read does not mention undo.
- Salesforce: undo/redo in the Lightning dashboard builder could not be confirmed from any source; search found only "Save" as the final step.
- Grafana 12.2 and 12.3 release notes were not checked for a manual undo/redo.

## 6. Adding widgets: catalogue, drag vs click, landing position, configuration, duplication

### Takeaway
Two entry paths coexist everywhere: a catalogue inside the dashboard (Azure Tile Gallery, Jira gadget list, ServiceNow widget list, Grafana "Add new element", Superset's side tabs, Datadog "Add Widget") and "pin/add to dashboard" from the place where the content was made (Power BI, Azure pin icon, Linear "Add to dashboard"). Click-to-add with a default size and landing place plus optional drag-to-place is the common pair; landing places differ (top in ServiceNow, end in Kibana for sections, next to the original for duplicates).

### Cited Findings
- Grafana: "Add new element" (blue plus), then click or drag a panel onto the dashboard; hovering shows "Add panel" inside a grouping; sidebar actions Copy, Duplicate, Delete; a duplicate is "added next to the original one"; copy then "Paste panel", "Paste row" or "Paste tab" at the target; drag the title to move, a solid blue line marks the drop position; "With groupings, a panel can only move to another grouping." — [Grafana docs, create dashboard](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/)
- Datadog: "Click Add Widget. Choose from a variety of widget types such as timeseries, bar chart, table, or event stream."; preset dashboards can be cloned and customised; widgets can be copied and pasted between dashboards through the Datadog clipboard (Ctrl/Cmd+V pastes). — [Datadog docs, Widgets](https://docs.datadoghq.com/dashboards/widgets/); [Datadog blog, 20 May 2021](https://www.datadoghq.com/blog/datadog-dashboards); [Datadog docs, Configure dashboards](https://docs.datadoghq.com/dashboards/configure/)
- Kibana: a collapsible section is chosen from the add-panel menu and "appears at the end of the dashboard"; panel menu "Duplicate" (copy lands next to the original) and "Copy to dashboard" -> "Copy and go to dashboard"; new panels default to 24 of 48 columns. — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)
- Metabase: duplicate a card by the Duplicate icon on hover; replace a card's question ("Search for a question to swap in"), with the limit "You can only replace a question with another question, not another type of card"; move a card to another tab by the move icon; duplicate a tab with its cards; duplicate a dashboard (copies layout, filters, tabs and optionally questions; not subscriptions, actions, sharing). Saving a new question suggests the last viewed dashboard. — [Metabase docs, Dashboards introduction](https://www.metabase.com/docs/latest/dashboards/introduction); [Metabase 47 release page](https://www.metabase.com/releases/Metabase-47)
- Superset: layout elements are dragged from the "LAYOUT ELEMENTS" tab onto the dashboard; options appear on hover. — [Preset docs, Dashboard customization](https://docs.preset.io/docs/dashboard-customization)
- Power BI: content arrives by pinning a visual from a report ("Pinned to dashboard" -> "Go to dashboard"); "Pin tile" from a tile's menu pins "a duplicate of this tile to an existing dashboard or to a new dashboard"; "Edit details" changes title and link; "To change the visualization shown on the tile itself, delete the tile and add a new" one. — [Microsoft Learn, Create or edit a dashboard tile](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboard-edit-tile)
- Azure Portal: the Tile Gallery opens beside an empty grid; "Select Add to add the tile to the dashboard with a default size and location. Or, drag the tile to the grid and place it where you want."; the gallery has a search field; resource pages have a pin icon that pins to an existing or new, private or shared dashboard; "Copy" in a tile's context menu copies it to another dashboard or within the same one; unconfigured tiles show a banner ("Configure tile", "Edit in Metrics") until set up. — [Microsoft Learn, Create a dashboard in the Azure portal](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards)
- Jira: "select Add gadget on your dashboard and choose from the available gadgets". — [Atlassian Support, Manage dashboards and gadgets](https://support.atlassian.com/jira-service-management-cloud/docs/manage-dashboards-and-gadgets/)
- ServiceNow: pick a widget type (Performance Analytics, Report, Content Block), select the widget, review its preview, click Add; it appears at the top of the dashboard and is then dragged to move or resize (search summary). — [ServiceNow docs, Edit a responsive dashboard](https://www.servicenow.com/docs/r/now-intelligence/t_EditADashboard.html)
- Notion: in Edit mode the `+` on a row or at the bottom adds a widget; each widget shows a database view (existing or new); duplicate or delete from the widget menu; `/dash` creates a dashboard on a page; Notion Agent can draft one from a prompt. — [Notion Help, Dashboards view](https://www.notion.com/help/dashboards)
- Linear: from an existing insight, "Add to dashboard" creates a new dashboard or adds to an existing one; an insight can sit on several dashboards and is shown as chart, table or "metric block"; added insights "automatically inherit the dashboard-level filters". — [Linear docs, Dashboards](https://linear.app/docs/dashboards)
- Salesforce: after adding a widget, click it to resize, delete or change its source report (search snippet). — [Trailhead, Visualizing data](https://trailhead.salesforce.com/modules/lex_implementation_reports_dashboards/units/lex_implementation_reports_dashboards_visualizing_data)
- Limits on count: Notion 12 widgets; Salesforce up to 20 components per dashboard (classic builder documentation and a 2026 guide; search snippets); Kibana 1,000 top-level items, 1,000 panels per section, 100 pinned controls; Datadog up to 100 tabs; Azure 100 private dashboards per user. — [Notion Help](https://www.notion.com/help/dashboards); [usecarly.com 2026 guide](https://www.usecarly.com/blog/how-to-create-dashboard-in-salesforce/); [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels); [Datadog docs, Configure dashboards](https://docs.datadoghq.com/dashboards/configure/); [Microsoft Learn, Azure portal dashboards](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards)

### Inferences
- "Add with a default size and location, or drag to place" (Azure's wording) is the most complete statement of the pattern; a click-to-add path is also the keyboard path.
- A widget that needs configuration before it shows anything is handled by an in-place banner (Azure) rather than by a blocking dialog.
- Duplicates land next to the original and push neighbours (Grafana, Kibana); new widgets from a catalogue land at the top (ServiceNow) or at the end (Kibana sections) — there is no shared convention, so the landing rule should be stated.
- Small hard caps (Notion 12, Salesforce 20) are a product choice of business tools; monitoring tools set caps two orders of magnitude higher.

### Gaps
- Where a new panel lands in Grafana, Metabase, Datadog and Jira is not stated in the pages read.
- Datadog's widget tray and drag-from-tray behaviour were not on the pages fetched (the Widgets page read has no detail on it).
- Jira's maximum number of gadgets per dashboard (unverified recollection: 20) was not on the page read.

## 7. Organisation: rows, sections, groups, tabs, lists, templates, defaults, sharing

### Takeaway
Grouping inside a dashboard is where the products invested most in 2023-2026: tabs arrived in Metabase 47 (2023), Grafana (2025-26, nestable three levels with rows) and Datadog (up to 100 tabs); collapsible sections arrived in Kibana 9.1; Home Assistant made the section its base unit. Personal-versus-shared is modelled explicitly in Azure (private by default, shared as a resource), Linear (workspace/team/personal) and Jira (admin-owned default dashboard).

### Cited Findings
- Grafana: tabs are "a first-class layout option, alongside rows", nestable up to "three levels deep"; each tab or row can have its own variables; show/hide rules on panels, rows or tabs by variable value, query result ("Has data"/"No data") or time range, combinable with "Match all"/"Match any", available only in Auto grid; hidden elements show an icon or overlay in edit mode; a content outline shows the structure as a tree. Rows can `collapse`, `hideHeader`, `fullScreen` and `repeat` per variable. — [Grafana What's new, GA](https://grafana.com/whats-new/2026-04-08-dynamic-dashboards-is-now-generally-available/); [Grafana docs, create dashboard](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/); [Grafana docs v12.1, layout schema](https://grafana.com/docs/grafana/v12.1/observability-as-code/schema-v2/layout-schema)
- Grafana motive: with many data sources users had to scroll and expand or collapse to find information; tabs let authors "segment dashboards by context, user group, or use case"; "panels or even entire rows can be shown or hidden based on variable selections or whether the panel has data to show". — [Grafana blog, Dynamic dashboards in Grafana 12](https://grafana.com/blog/dynamic-dashboards-grafana-12/)
- Datadog: the 2021 layout "enables users to arrange widgets in groups", which follow the grid, can be edited in bulk and can sit side by side at partial width; tabs "organize widgets into named sections within a single dashboard", up to 100 tabs, names up to 100 characters, reorder by dragging; moving a group to a tab moves its nested widgets; a nested widget moved alone becomes top-level in the destination. Editing can be limited to roles, teams or users; view restrictions need Datadog support. Dashboard lists and preset dashboards exist. — [Datadog blog, 20 May 2021](https://www.datadoghq.com/blog/datadog-dashboards); [Datadog docs, Configure dashboards](https://docs.datadoghq.com/dashboards/configure/); [Datadog docs, Dashboards](https://docs.datadoghq.com/dashboards/)
- Kibana: collapsible sections (Elastic Stack since 9.1) — added in Edit mode, appended at the end, must be expanded to accept panels, draggable as a whole; only expanded sections load their content; controls inside a section filter only that section (since 9.4). The blog gives the purposes: group panels by theme, hide or show them, collapse by default, reduce load time. — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels); [Elastic Search Labs blog](https://www.elastic.co/search-labs/blog/kibana-dashboard-build-layout)
- Metabase: tabs ("Chunk dashboards down into smaller sections to keep them easier to browse and absorb"), full-width headings, and Sections — "templates with headings and pre-arranged cards" (KPI Grid; large chart with KPIs to the right; KPIs with a large chart below); a dashboard can be set as the home page. — [Metabase 47 release page](https://www.metabase.com/releases/Metabase-47); [Metabase docs, Dashboards introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
- Superset: Tabs, Header, Divider, Rows and Columns as layout elements; rows, columns and headers can have a transparent or white background. — [Preset docs, Dashboard customization](https://docs.preset.io/docs/dashboard-customization)
- Azure Portal: "The Azure portal provides a default dashboard as a starting point."; "All dashboards are private when created, and each user can create up to 100 private dashboards."; a published dashboard "is implemented as an Azure resource in your subscription" and shared through Azure role-based access control; Clone opens "Clone of (your dashboard name)" in edit mode; a dashboard switcher with "Browse all dashboards" and a "Shared dashboard" type filter. — [Microsoft Learn, Create a dashboard in the Azure portal](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards)
- Power BI: owners have more options than consumers; "if someone has shared a dashboard with you, you aren't the owner, and you'll have fewer options". — [Microsoft Learn, Create or edit a dashboard tile](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboard-edit-tile)
- Jira: "Only Jira admins can customize the default dashboard."; "Copy dashboard" from the list; starred dashboards appear in the Dashboards menu; shared dashboards show owner and shares; gadgets a user may not see do not appear for them. — [Atlassian Support, Manage dashboards and gadgets](https://support.atlassian.com/jira-service-management-cloud/docs/manage-dashboards-and-gadgets/)
- ServiceNow: quick layouts in the Configuration pane that widgets snap to; tabs via "Create Tab" (the original panel becomes the first tab); existing tabs cannot be linked into another dashboard; tabs are reordered by dragging in edit mode (search summary). — [ServiceNow docs, Edit a responsive dashboard](https://www.servicenow.com/docs/r/now-intelligence/t_EditADashboard.html)
- Salesforce Lightning App Builder: templates with named regions, e.g. "Header and Three Regions" (secondary source). — [Salesforce Ben, Lightning templates](https://www.salesforceben.com/how-to-modify-the-salesforce-lightning-experience-using-templates/)
- Notion: dashboards follow the permissions of the underlying database; edit access allows creating dashboards and editing layouts; global filters ("Filter multiple sources") apply to widgets whose views have the property; Business and Enterprise plans only; launched March 2026 (secondary source for the date). — [Notion Help, Dashboards view](https://www.notion.com/help/dashboards); [alternativeto.net news, March 2026](https://alternativeto.net/news/2026/3/notion-introduces-dashboard-views-to-turn-any-database-into-a-customizable-control-center)
- Linear: Enterprise plans; each dashboard has an owner; "Move to…" moves it to a team, the workspace or Personal; personal dashboards "remain visible only to you"; "By default, workspace-level dashboards do not include data from private teams." — [Linear docs, Dashboards](https://linear.app/docs/dashboards)
- Home Assistant: grouping cards into sections makes finding a card quicker by scanning section titles first (search summary of the 2024.3 release post). — [Home Assistant 2024.3 release](https://home-assistant.io/blog/2024/03/06/release-20243/)

### Inferences
- Groups serve three separate purposes that the products conflate under one feature: reading order and scanning (headings, sections), performance (collapsed sections not loaded — Kibana), and layout stability (the group as the reflow unit — Home Assistant, Datadog high-density mode, which moves groups side by side).
- Group-scoped filters (Grafana section variables, Kibana section controls since 9.4) follow grouping within a release or two; a library that adds groups should expect that request.
- Pre-arranged starting layouts exist at three scales: a section template (Metabase), a quick layout for the whole canvas (ServiceNow), a whole starter dashboard (Azure default, Datadog presets, Jira default).
- Azure's rule — private first, sharing is a separate, deliberate publication with its own permissions — is the clearest published model for reader-owned arrangements.

### Gaps
- Default dashboards per role: only Jira (admin-owned default for everyone) and Azure (one default) were documented in the pages read; ServiceNow and Salesforce role-based defaults (e.g. Lightning home pages assigned per profile) were not verified.
- Grafana folders, dashboard lists and permissions were not re-read in this session.
- Whether Kibana sections can be nested: not stated on the page (the blog names nested panels as the missing capability of the old engine, not nested sections).

## 8. Keyboard accessibility of arranging

### Takeaway
Documented keyboard arrangement is rare. Kibana is the only product read that documents a full keyboard interaction for moving and resizing panels (since 9.1); elsewhere the keyboard path is indirect — menus such as "Move to tab", a size menu, click-to-add — or undocumented.

### Cited Findings
- Kibana (Elastic Stack since 9.1): Tab to the move or resize action, Enter or Space to lock it, arrow keys to move or resize, Enter or Space to release, Escape at any time to cancel; then save. — [Elastic docs, Arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels)
- Kibana before that: in January 2025 the team was "adding keyboard support for dragging and resizing (which is not currently supported by Kibana dashboards)". — [Elastic Search Labs blog](https://www.elastic.co/search-labs/blog/kibana-dashboard-build-layout)
- Azure Portal: a size menu in each tile's context menu offers named sizes without dragging; "Add" places a tile without dragging. — [Microsoft Learn, Create a dashboard in the Azure portal](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards)
- Metabase: moving a card to another tab is a menu action (move icon, then choose the tab). — [Metabase docs, Dashboards introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
- Datadog: "Move to tab" from the widget's share menu; a list of keyboard shortcuts is offered under the Configure menu; paste with Ctrl/Cmd+V. — [Datadog docs, Configure dashboards](https://docs.datadoghq.com/dashboards/configure/)
- Notion: "If no move option appears, use the widget menu (right-click the widget or click its title)" (paraphrase) — a menu path for moving exists beside dragging. — [Notion Help, Dashboards view](https://www.notion.com/help/dashboards)
- Grafana: the create-dashboard page documents no keyboard way to move or resize panels; the content outline lets a user jump to any panel, row or tab by click or search. Accessibility issues filed in 2026 concern reflow and zoom (#118782 at 320×256, #118644 at 200% zoom), not arranging. — [Grafana docs, create dashboard](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/); [GitHub grafana/grafana issue search](https://github.com/grafana/grafana/issues?q=is%3Aissue+dashboard+layout+responsive+sort%3Areactions-%2B1-desc)

### Inferences
- Kibana's pattern is the grab-move-drop model (activate, arrows, confirm, Escape cancels) and it became possible only after Elastic owned the layout engine; the react-grid-layout generation of dashboards (Grafana classic, Metabase, older Kibana) shipped without it.
- Products with an ordered model get a keyboard path almost for free (menu: move up/down, move to tab, pick a size); coordinate grids need a dedicated interaction.
- This is an area where a new library can exceed the state of the art rather than merely match it.

### Gaps
- No documentation of keyboard arrangement was found for Grafana, Datadog (beyond shortcuts list, contents not read), Metabase, Superset, Power BI, Salesforce, Jira, ServiceNow, Linear or Geckoboard. Absence in the pages read is not proof of absence in the product.
- Screen-reader announcements during a move are not documented by any product read, including Kibana.

## 9. Most upvoted feature requests and complaints about dashboard layout

### Takeaway
The best-documented long-running demand is Jira's "Dashboard layout should be more flexible" (746 votes, open since 2010, declined in 2016). Across products the recurring themes are: more flexible placement where the model is rigid (Jira), stability across screens where the model is fluid (Metabase #10364, Grafana TV and mobile issues), hiding empty widgets (Grafana #4470, 146), and custom sizes (Power BI tiles).

### Cited Findings
- Jira — JRACLOUD-21201 "Dashboard layout should be more flexible": status Gathering Interest, unresolved, 746 votes, 274 watchers, created 30 Apr 2010; request for rows spanning the full width beside column gadgets ("It would be great that the dashboard layout would be more flexible or more types"). Atlassian (Dave Meyer, Product Manager, 4 Jan 2016): no plans to support this "for the foreseeable future"; Confluence pages or Atlasboard recommended instead. — [Atlassian JRACLOUD-21201](https://jira.atlassian.com/browse/JRACLOUD-21201)
- Jira — JRASERVER-73136 / JRACLOUD-81250 "Adjustable width column Filter result gadget": 152 votes on the Server ticket, unresolved (search snippet). JRACLOUD-18349 "Selecting your own columns for the gadgets needs improvements": 25 votes, columns cut off at the gadget edge with no scroll cue (search snippet). — [Atlassian JRASERVER-73136](https://jira.atlassian.com/browse/JRASERVER-73136); [Atlassian JRACLOUD-18349](https://jira.atlassian.com/browse/JRACLOUD-18349)
- Grafana — list sorted by thumbs-up for "dashboard layout responsive" (counts as shown beside the titles, unlabelled): #4470 "Hide empty / no data panels" (146, closed 23 Jan 2026 — met by show/hide rules); #31374 "Can't edit panel in Chrome in Grafana 7.3.5 and later" (124); #12768 "Auto fit dashboard panels to optimize space for TV/monitor" (21, closed 14 Aug 2018); #10325 "Support dynamic height panels in Grafana 5" (20, closed 23 Dec 2017); #114411 "New Group Layout Option: Container" (open since 25 Nov 2025). — [GitHub grafana/grafana issue search](https://github.com/grafana/grafana/issues?q=is%3Aissue+dashboard+layout+responsive+sort%3Areactions-%2B1-desc)
- Grafana — community threads: "Responsive Height of panels", "Disable panel resize on browser window resize", "Panel auto fit in vertical mode", "Table panel: layout and responsive design: ok below 768px", "Flex System Issue: Need Help with Dashboard Layout in Grafana" (titles from search; no vote counts). — [thread 39240](https://community.grafana.com/t/responsive-height-of-panels/39240); [thread 66016](https://community.grafana.com/t/disable-panel-resize-on-browser-window-resize/66016); [thread 55173](https://community.grafana.com/t/panel-auto-fit-in-vertical-mode/55173); [thread 38242](https://community.grafana.com/t/table-panel-layout-and-responsive-design-ok-below-768px/38242); [thread 101134](https://community.grafana.com/t/flex-system-issue-need-help-with-dashboard-layout-in-grafana/101134)
- Metabase — #10364 "Fixed width dashboard option" (17 Jul 2019 - 21 Feb 2024, shipped in 0.49); forum: "Customise the width of a dashboard" (user notes the grid is 18 squares across and asks for a per-dashboard setting; reply links issue #6218), "Is it possible to increase the dashboard canvas width?" (v0.62), "Cards responsive design", "Optimize Metabase Dashboard Mobile View", "Mobile UI problems". — [GitHub metabase/metabase#10364](https://github.com/metabase/metabase/issues/10364); [Discourse 21749](https://discourse.metabase.com/t/customise-the-width-of-a-dashboard/21749); [Discourse 314913](https://discourse.metabase.com/t/is-it-possible-to-increase-the-dashboard-canvas-width/314913); [Discourse 9999](https://discourse.metabase.com/t/cards-responsive-design/9999); [Discourse 14109](https://discourse.metabase.com/t/optimize-metabase-dashboard-mobile-view/14109); [Discourse 14042](https://discourse.metabase.com/t/mobile-ui-problems/14042)
- Power BI — community threads "Customize the Tile size in Dashboard" and "Customize the size of a tile": answers say tile size cannot be set freely; a support reply points to an idea to vote on (search snippets; the idea itself not read). — [Fabric community thread 2395762](https://community.fabric.microsoft.com/t5/Service/Customize-the-Tile-size-in-Dashboard/m-p/2395762); [Fabric community thread 2395841](https://community.fabric.microsoft.com/t5/Desktop/Customize-the-size-of-a-tile/td-p/2395841)
- Kibana — forum threads "Responsive Kibana", "Fluid layout for Kibana panel?", "Autosize Kibana pages"; GitHub elastic/kibana#2563 on the mobile experience (referenced in a forum reply; not opened). — [discuss 141909](https://discuss.elastic.co/t/responsive-kibana/141909); [discuss 374241](https://discuss.elastic.co/t/fluid-layout-for-kibana-panel/374241); [discuss 223325](https://discuss.elastic.co/t/autosize-kibana-pages/223325)
- Home Assistant — "Why won't section columns resize to fill the screen and there's no options to adjust?"; "Lovelace Sections and grids, columns and column-span" (titles from search). — [community 1023526](https://community.home-assistant.io/t/why-wont-section-columns-resize-to-fill-the-screen-and-theres-no-options-to-adjust/1023526); [community 1015022](https://community.home-assistant.io/t/lovelace-sections-and-grids-columns-and-column-span/1015022)
- Others (search snippets): Redash "Even more flexible grid in dashboards"; Cumulocity "Fine-grained positioning of widgets on dashboards" (6 Dec 2023); MongoDB Atlas Charts "12 column grid for Atlas Charts dashboards"; AppSignal changelog 23 Feb 2026 adding drag-and-drop repositioning and edge-handle resizing. — [Redash forum](https://discuss.redash.io/t/even-more-flexible-grid-in-dashboards/5044); [Cumulocity community](https://community.cumulocity.com/t/december-6-2023-fine-grained-positioning-of-widgets-on-dashboards/11783); [MongoDB feedback](https://feedback.mongodb.com/forums/923524-charts/suggestions/47087302-12-column-grid-for-atlas-charts-dashboards); [AppSignal changelog](https://www.appsignal.com/changelog/app/2026-02-23-dashboard-layout)

### Inferences
- Complaints point in opposite directions depending on where a product sits: rigid column or region models draw "more flexible" requests for sixteen years (Jira), fluid coordinate grids draw "keep it the same on every screen" requests (Metabase, Grafana), and section models draw "fill my wide screen" requests (Home Assistant). No single model silences its users; each product ends up offering a second mode.
- "Hide when empty" is, by reaction count, a stronger demand in Grafana than any pure layout request; a flow layout is what makes it cheap, because hiding an item in a coordinate grid leaves a hole.
- Atlassian's 2016 refusal shows that a rigid model can be commercially sustainable for a general business tool — the demand is loud, the product kept its columns.

### Gaps
- Vote-ranked lists could not be produced for Metabase, Superset, Kibana, Power BI / Fabric Ideas, Salesforce IdeaExchange, ServiceNow, Datadog (no public tracker), Notion, Linear or Geckoboard: GitHub searches by reaction were only run for Grafana, and the ideas portals are not readable as text. The thumbs-up count of Metabase #10364 itself is not shown on the page read.
- The Grafana counts are unlabelled on the list page; they are most likely thumbs-up counts because the list was sorted by them, and should be re-checked on the individual issues before being quoted as votes.
- Salesforce IdeaExchange entries on dashboard components (limit of 20, layout) were not found.

## 10. Patterns across products (summary and comparison table)

### Takeaway
State of the art in October 2026 is a two-level arrangement: an ordered sequence of groups (rows, sections, tabs) that carries reading order and reflow, and inside each group either a coordinate grid with a fixed, divisible column count and upward compaction (authors, dense boards) or a flow of items with a small size vocabulary (readers, many screen sizes). Explicit edit mode with Save/Discard plus version history is standard; undo, keyboard arrangement and reader-specific layouts for other screens are the underserved parts.

### Cited Findings

Comparison table (every cell is backed by the citations in sections 1-9; "n/f" = not found in the sources read):

| Product | Columns | Column count vs width | Stored model | Sizes | Edit / save | Groups | Other screens |
|---|---|---|---|---|---|---|---|
| Grafana custom grid | 24, row unit 30 px | fixed count, columns scale | x, y, w, h; compacts upward | free, grid steps | Edit mode, Save | rows, tabs (3 levels) | single column below about 769 px (forum) |
| Grafana Auto grid (GA Apr 2026) | max columns up to 10, default 3 | count follows width (min column width) | ordered items | named: narrow/standard/wide, short/standard/tall, custom px | same | same; show/hide rules only here | reflows |
| Datadog | 12 (2 x 12 in high-density) | fixed count, scales | grid; screenboard = free pixels | free, snap, "squeeze" | version history 30/90 days | groups, tabs (100) | TV mode scales to fit; high-density on large screens; mobile app |
| Kibana | 48, fixed row height | fixed count, scales | x, y, w, h; editor packs | free, snap; default 24 wide | Edit mode, Save | collapsible sections (9.1) | stacks on small screens (forum) |
| Metabase | 24 (18 before v47, Sep 2023) | fixed count; fixed max width default since 0.49 | grid, cards pushed away | free, snap | Edit mode, Save; 15 versions | tabs, section templates, headings | cards re-sorted to one column on phones |
| Superset | 12; unit 8 px, gutter 16 px | fixed count, scales | tree of rows/columns/tabs | 1-12 columns, 5-100 row units | Edit mode; undo limit 50 | tabs, rows, columns, headers, dividers | n/f |
| Power BI dashboard | tile units | n/f | n/f | 1x1 to 5x5 | live, no edit mode | none | separate owner-made phone layout; portrait stack by default |
| Azure Portal | grid units | n/f | x, y, colSpan, rowSpan | size menu; free where supported | Edit, Preview, Save/Cancel | none | n/f |
| Salesforce Lightning dashboard | 12 or 9 (secondary) | n/f | grid (`isGridLayout`) | drag/resize, snap (secondary) | Save | none; max 20 components (secondary) | n/f |
| Jira | 1-3 columns by layout | fixed layout | order per column | column width only | live | none | wallboard mode |
| ServiceNow | n/f (12 in an API example) | n/f | x, y, width, height per tab | drag | Edit mode | tabs, quick layouts | n/f |
| Notion (Mar 2026) | up to 4 per row | rows | rows of widgets | width by divider, height per row | Edit mode vs View mode | none; max 12 widgets | n/f |
| Linear | n/f | n/f | n/f | n/f | n/f | personal / team / workspace | n/f |
| Geckoboard | n/f | n/f | drag with drop indicator, groups | free, side handles | n/f | groups with orientation | TV-optimised layout toggle, dense layout |
| Home Assistant sections | 12 per section | sections reflow, inner count fixed | sections in order, cards in grid | per-card default and min | Edit mode | section is the base unit | Z-grid reflow |

- Sources for the table rows: [Grafana JSON model](https://grafana.com/docs/grafana/v13.0/dashboards/build-dashboards/view-dashboard-json-model/), [Grafana create dashboard](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/), [Grafana layout schema](https://grafana.com/docs/grafana/v12.1/observability-as-code/schema-v2/layout-schema), [Datadog TV mode](https://docs.datadoghq.com/dashboards/guide/tv_mode/), [Datadog version history](https://docs.datadoghq.com/dashboards/guide/version_history/), [Datadog configure](https://docs.datadoghq.com/dashboards/configure/), [Elastic arrange panels](https://www.elastic.co/docs/explore-analyze/dashboards/arrange-panels), [Metabase 47](https://www.metabase.com/releases/Metabase-47), [Metabase docs](https://www.metabase.com/docs/latest/dashboards/introduction), [Superset constants](https://raw.githubusercontent.com/apache/superset/master/superset-frontend/src/dashboard/util/constants.ts), [Power BI tiles](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboard-edit-tile), [Power BI phone view](https://learn.microsoft.com/en-us/power-bi/create-reports/service-create-dashboard-mobile-phone-view), [Azure dashboards](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards), [Azure structure](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards-structure), [Salesforce Metadata API](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_dashboard.htm), [Jira docs](https://support.atlassian.com/jira-service-management-cloud/docs/manage-dashboards-and-gadgets/), [Notion help](https://www.notion.com/help/dashboards), [Linear docs](https://linear.app/docs/dashboards), [Geckoboard support](https://support.geckoboard.com/en/articles/6055766-arrange-widgets-on-a-dashboard), [Home Assistant chapter 1](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1), [Home Assistant developers blog](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support).

Published reasons for changing a layout model, in the teams' own words:
- Grafana (2025): "Some dashboard layouts are not responsive and struggle to adapt panel layouts for different screen sizes". — [Grafana blog](https://grafana.com/blog/dynamic-dashboards-grafana-12/)
- Home Assistant (2024): "the muscle memory of where users remember the cards will be lost every time the dashboard is displayed on another screen". — [Home Assistant blog](https://home-assistant.io/blog/2024/03/04/dashboard-chapter-1)
- Elastic (2025): react-grid-layout was "missing critical features" (nesting, dragging between layout instances). — [Elastic Search Labs blog](https://www.elastic.co/search-labs/blog/kibana-dashboard-build-layout)
- Metabase (2023): 24 columns for "more symmetry and precise placement"; (2024) fixed width because auto-resizing made dashboards look inconsistent across browser sizes. — [Metabase 47](https://www.metabase.com/releases/Metabase-47); [metabase#10364](https://github.com/metabase/metabase/issues/10364)
- Datadog (2021): a layout that "combines the fine control of Screenboards with the quick, grid-based workflow of Timeboards". — [Datadog blog](https://www.datadoghq.com/blog/datadog-dashboards)

### Inferences
- For a library in which END USERS (readers, not dashboard authors) arrange their own page, the closest precedents are not Grafana custom or Kibana but Notion (rows, 4 per row, 12 total), Home Assistant sections (order plus a small inner grid, per-card minimum sizes), Azure Portal (tile gallery, size menu, private by default, Edit/Preview/Save), Jira (columns and order) and Grafana Auto grid (order plus min column width and max columns). All of them constrain placement more than the monitoring tools do.
- The products that store an order can render one stored arrangement at any width; the products that store coordinates need a fallback rule (stack below a threshold) or a second arrangement (Power BI phone layout), and both draw complaints. Storing order with sizes, and deriving coordinates, is the direction the two published redesigns of 2024-2026 took.
- A width cap (Metabase fixed width) and a "fill screen"/dense option (Grafana `fillScreen`, Datadog high-density, Geckoboard dense layout) are the two cheap answers to very wide screens and are complementary: cap for reading, densify for walls.
- Expected baseline features by now: explicit edit mode with Save and Discard, duplicate landing next to the original, click-to-add with default size plus drag-to-place, groups with headings (collapsible), tabs for large dashboards, hide-when-empty. Differentiators still open: undo/redo, documented keyboard move/resize (only Kibana), reader control over stacking order on narrow screens.
- Hard caps on widget count (Notion 12, Salesforce 20) are a legitimate product decision in business tools and keep a reader-arranged page legible.

### Gaps
- The table's "n/f" cells are genuine gaps of this research, not confirmed absences. The weakest rows are Salesforce (no official page readable), ServiceNow (primary page 404), Linear (documentation silent on arrangement) and Geckoboard (current grid parameters unpublished).
- Customizable home pages as distinct from dashboards (Linear, Notion Home, Salesforce Lightning Home assigned per profile, ServiceNow workspaces) were only touched; no source on Linear or Notion offering a user-arranged home was found.
- Research budget note: the scope (15 products, 9 questions) was covered with about 60 search and fetch calls; engineering detail from source code (Grafana Auto grid pixel presets, Metabase per-visualization minimum sizes, Kibana's collision and breakpoint rules, Superset's `position_json`) was not read and would need a follow-up pass against the repositories.
