# General-purpose React component libraries: catalogues and cross-cutting features (as of September 2026)

Versions checked on npm, 2026-09-24: `@mui/material` 9.4.0, MUI X 9.14.0, `@mantine/core` 9.6.2, `@chakra-ui/react` 3.37.0, `antd` 6.6.5, `@fluentui/react-components` 9.74.9, `@carbon/react` 1.117.0, `@blueprintjs/core` 6.20.0, `primereact` 11.1.0, Syncfusion EJ2 34.2.9 ([npm registry](https://registry.npmjs.org/)).

Method: the catalogues come from each library's machine-readable docs index (llms.txt) and from the component source folders in each GitHub repo (GitHub contents API, fetched 2026-09-24). A folder name is not always one public component, but it is the most complete list available. Items marked "(prior knowledge, unverified)" were not re-checked this session.

## Q1: The full component catalogue of each library, grouped

### Takeaway
Ant Design and Mantine have the largest free catalogues (about 70–80 components in core, and Mantine adds packages for dates, charts, schedule, rich text, spotlight, dropzone and carousel). MUI's core is smaller, but MUI X adds a data grid, pickers, charts, a tree view, a scheduler and chat, with the advanced features paid. Chakra v3 has caught up in breadth (about 115 folders, now including a date picker, splitter, tree view, color picker and file upload). Fluent v9, Carbon and Blueprint are narrower but deeper enterprise/product sets: Carbon is full of UI-shell, AI and "Fluid" form variants, and Blueprint is desktop-dense (hotkeys, omnibar, a spreadsheet-style table).

### Cited findings

**MUI: Material UI v9 (stable since 2026-04-07) and MUI X v9**
- Material UI core, grouped as the docs group it. **Inputs:** TextField, Checkbox, RadioGroup, Select, Autocomplete, Slider, Switch, ToggleButton, Rating, NumberField (new in v9). **Data display:** Table, List, ImageList, Masonry, Timeline, Pagination, Badge, Chip, Avatar, Icon. **Feedback:** Alert, Snackbar, Skeleton, Progress, Tooltip, Dialog, Modal. **Surfaces:** Paper, Card, AppBar, Drawer. **Navigation:** Tabs, Breadcrumbs, Stepper, SpeedDial, BottomNavigation, Menu, Menubar (new in v9). **Layout:** Box, Container, Stack, Grid, Divider. **Utilities:** Portal, NoSsr, CssBaseline, ClickAwayListener, InitColorSchemeScript, useMediaQuery — [MUI llms.txt](https://mui.com/material-ui/llms.txt)
- v9 was released on 2026-04-07. Material UI added NumberField and Menubar; MUI X added a Scheduler (alpha, "resource-aware calendars and timelines") and Chat (alpha, with LLM adapters and streaming). From v9 on, Material UI and MUI X share their major version numbers — [MUI blog: Introducing v9](https://mui.com/blog/introducing-mui-v9/)
- The `@mui/lab` source still contains Timeline*, Masonry, TabContext/TabList/TabPanel, LoadingButton and legacy picker and TreeView folders. Timeline still lives in lab — [GitHub mui/material-ui packages/mui-lab/src](https://github.com/mui/material-ui/tree/master/packages/mui-lab/src)
- MUI X packages in the repo: x-data-grid (-pro, -premium), x-date-pickers (-pro), x-charts (-pro, -premium), x-tree-view (-pro), x-scheduler (-premium), x-chat (plus x-chat-headless), x-virtualizer, and also `mcp` and `x-agent-tools` — [GitHub mui/mui-x packages](https://github.com/mui/mui-x/tree/master/packages)
- The free (MIT) tier covers the Data Grid, Date and Time Pickers, Charts, Tree View and Scheduler. **Pro** adds multi-filter/sort, column resizing and pinning (grid), the Time Range Picker, advanced charts, and drag-and-drop reordering in Tree View. **Premium** adds row grouping and Excel export (grid), Charts Premium and Scheduler Premium — [MUI X licensing](https://mui.com/x/introduction/licensing/). Date **range** pickers are in the Pro package `x-date-pickers-pro` — [GitHub mui/mui-x](https://github.com/mui/mui-x/tree/master/packages)

**Mantine v9 (latest 9.6.2)**
- **Core, layout:** Affix, AppShell, AspectRatio, Box, Center, Container, Flex, Grid, Group, Paper, SimpleGrid, Space, Stack. **Navigation:** Anchor, Breadcrumbs, Burger, Menu, Menubar, NavLink, Tabs. **Inputs:** Autocomplete, Checkbox, Chip, ColorInput, Combobox, FileButton, FileInput, Input, JsonInput, MaskInput, MultiSelect, NativeSelect, NumberInput, PasswordInput, PinInput, Radio, SegmentedControl, Select, Switch, TagsInput, Textarea, TextInput. **Data display:** Avatar, Badge, Code, DataList, Highlight, Image, Indicator, Kbd, List, Loader, Mark, NumberFormatter, Pagination, Progress, RingProgress, Skeleton, Table, Text, ThemeIcon, Timeline, Title, Tooltip, Tree, TreeSelect. **Feedback:** Alert, EmptyState, LoadingOverlay, Notification, Overlay. **Overlays/actions:** ActionBar, ActionIcon, Button, Card, CloseButton, CopyButton, Dialog, Drawer, FocusTrap, HoverCard, Modal, Popover, Portal, Spoiler, Transition. **Other:** Accordion, AlphaSlider, AngleSlider, Cascader, ColorPicker, ColorSwatch, Collapse, FloatingIndicator, FloatingWindow, HueSlider, OverflowList, RangeSlider, Rating, RollingNumber, ScrollArea, Scroller, SemiCircleProgress, Slider, Splitter, Stepper, VisuallyHidden — [Mantine llms.txt](https://mantine.dev/llms.txt)
- **@mantine/dates:** Calendar, DateInput, DatePicker, DatePickerInput, DateTimePicker, InlineDateTimePicker, MiniCalendar, MonthPicker(Input), TimeGrid, TimeInput, TimePicker, TimeValue, YearPicker(Input). **@mantine/form:** use-form, use-field, validation, nested fields, schema validation, form context. **@mantine/hooks:** more than 90 hooks (useHotkeys, useClipboard, useLocalStorage and so on). **@mantine/charts:** AreaChart, BarChart, BarsList, BubbleChart, BulletChart, CandlestickChart, CompositeChart, DonutChart, FunnelChart, GaugeChart, Heatmap, LineChart, MatrixChart, PieChart, RadarChart, RadialBarChart, SankeyChart, ScatterChart, Sparkline, SunburstChart, Treemap, WaffleChart. **@mantine/schedule:** AgendaView, DayView, WeekView, MonthView, MobileMonthView, YearView, Resources{Day,Week,Month}View, ResourcesSchedule, Schedule. **Extensions:** Carousel, CodeHighlight, Dropzone, Lightbox, Modals manager, NavigationProgress, Notifications, RichTextEditor (Tiptap), Spotlight — [Mantine llms.txt](https://mantine.dev/llms.txt)
- @mantine/schedule shipped in 9.0 with drag-and-drop event management. Splitter came in 9.3, with pointer drag, keyboard support following the WAI-ARIA Window Splitter pattern, collapsible panes and min/max limits. 9.4 added resetOnDoubleClick — [Mantine 9.0 changelog](https://mantine.dev/changelog/9-0-0/), [9.3.0](https://mantine.dev/changelog/9-3-0/), [9.4.0](https://mantine.dev/changelog/9-4-0/)

**Chakra UI v3 (3.37.0)**
- Component folders (119): absolute-center, accordion, action-bar, alert, aspect-ratio, avatar, badge, bleed, blockquote, box, breadcrumb, button, card, carousel, center, checkbox, checkbox-card, clipboard, code, code-block, collapsible, color-picker, color-swatch, combobox, container, data-list, date-input, date-picker, dialog, download-trigger, drawer, editable, empty-state, field, fieldset, file-upload, flex, float, floating-panel, focus-trap, format, grid, group, heading, highlight, hover-card, icon, image, input(-group/-addon/-element), kbd, link, list, listbox, loader, locale, mark, marquee, menu, native-select, number-input, pagination, pin-input, popover, portal, progress, progress-circle, qr-code, quote, radio-card, radio-group, rating-group, scroll-area, segment-group, select, separator, show, simple-grid, skeleton, skip-nav, slider, spacer, spinner, splitter, stack, stat, status, steps, sticky, switch, table, tabs, tag, tags-input, text, textarea, timeline, toast, toggle, tooltip, tree-view, visually-hidden, wrap — [GitHub chakra-ui packages/react/src/components](https://github.com/chakra-ui/chakra-ui/tree/main/packages/react/src/components)
- The docs group these as Layout, Typography, Forms, Collections (Combobox, Listbox, Select, TreeView), Overlays, Data Display, Feedback, Date/Time (Calendar, Date Picker, Date Input) and Utilities & i18n (FormatNumber, LocaleProvider). The docs link to "Premium Chakra UI Components" (a paid tier) and to "Charts" — [Chakra docs overview](https://www.chakra-ui.com/docs/components/concepts/overview)
- Built on Ark UI primitives and Zag.js state machines. Styling uses recipes (`defineRecipe`) and style props — [Chakra llms-components.txt](https://chakra-ui.com/llms-components.txt). Runtime dependencies are `@ark-ui/react` and the `@emotion/*` packages — [npm @chakra-ui/react 3.37.0](https://registry.npmjs.org/@chakra-ui/react/3.37.0)

**Ant Design v6 (6.6.5)**
- **General:** Button, Icon, Typography, Watermark, FloatButton. **Layout:** Grid (Row/Col), Layout (Header/Sider/Content/Footer), Space, Flex, Divider, Splitter. **Navigation:** Menu, Breadcrumb, Pagination, Anchor, Affix, Steps, Dropdown. **Data entry:** Form, Input, InputNumber, Select, Cascader, TreeSelect, DatePicker, TimePicker, Upload, Checkbox, Radio, Switch, Rate, Mentions, AutoComplete, ColorPicker, Segmented, Slider. **Data display:** Table, List, Card, Carousel, Collapse, Descriptions, Empty, Image, Progress, Result, Skeleton, Statistic, Tag, Timeline, Tooltip, Tour, Transfer, Tree, Calendar, Avatar, Badge, QRCode. **Feedback:** Modal, Drawer, Alert, Message, Notification, Popconfirm, Popover, Spin. **Other:** Masonry, Listy, BorderBeam, App, ConfigProvider — [Ant Design llms.txt](https://ant.design/llms.txt), [GitHub ant-design/components](https://github.com/ant-design/ant-design/tree/master/components)
- v6: React 18 or newer only. `@ant-design/cssinjs` now defaults to pure CSS variables (IE dropped, modern browsers only). Semantic DOM (`classNames`/`styles`) on every component. React Compiler enabled in the UMD bundles. Moving up from v5 needs no compat package or codemod — [antd migration v5→v6](https://ant.design/docs/react/migration-v6/), [Ant Design 6.0 announcement](https://github.com/ant-design/ant-design/issues/55804)

**Fluent UI React v9 (9.74.9)**
- The stable packages bundled into `@fluentui/react-components` are Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Card, Carousel, Checkbox, ColorPicker, Combobox (Combobox/Dropdown), Dialog, Divider, Drawer, Field, Image, InfoButton, InfoLabel, Input, Label, Link, List, Menu, MessageBar, Nav, Overflow, Persona, Popover, Portal, Progress, Radio, Rating, SearchBox, Select, Skeleton, Slider, SpinButton, Spinner, SwatchPicker, Switch, Table (incl. DataGrid), Tabs, Tags, TagPicker, TeachingPopover, Text, Textarea, Toast, Toolbar, Tooltip, Tree and Virtualizer, plus the Tabster focus management and positioning packages. There is also an `unstable` export path — [npm @fluentui/react-components 9.74.9 dependencies](https://registry.npmjs.org/@fluentui/react-components/latest)
- Peer dependency: `react >=16.14.0 <20.0.0` — [npm](https://registry.npmjs.org/@fluentui/react-components/latest)
- Charts ship separately as `@fluentui/react-charts`, "built using D3 and fluent v9" — [npm @fluentui/react-charts](https://www.npmjs.com/package/@fluentui/react-charts?activeTab=code)

**IBM Carbon React (1.117.0)**
- Component folders (145), grouped: **Inputs:** TextInput, TextArea, PasswordInput, NumberInput, Checkbox(Group), RadioButton(Group), RadioTile, Select, Dropdown, ComboBox, MultiSelect, Search, ExpandableSearch, Slider, Toggle, DatePicker, TimePicker, FileUploader, Form/FormGroup/FormItem/FormLabel, EditInPlace, and "Fluid*" variants of most inputs. **Navigation:** Breadcrumb, Tabs, ContentSwitcher, Pagination, PaginationNav, ProgressIndicator (the stepper), UIShell (header, side nav), Menu, MenuButton, ComboButton, OverflowMenu, ContextMenu, Link. **Overlays:** Modal, ComposedModal, Dialog, Popover, Tooltip, Toggletip, SidePanel, Tearsheet, Coachmark, Guidebanner. **Feedback:** Notification (inline, toast, actionable), NotificationsPanel, InlineLoading, Loading, ProgressBar, Skeleton*, FullPageError, InterstitialScreen. **Data display:** DataTable, StructuredList, ContainedList, OrderedList/UnorderedList, Tag, TagOverflow, Tile/TileGroup, Card, TreeView, CodeSnippet, BigNumber, UserAvatar, BadgeIndicator, IconIndicator, ShapeIndicator, TruncatedText, PageHeader. **Layout:** Grid, FlexGrid, Stack, AspectRatio, Layer, Theme, Resizer, HideAtBreakpoint, LayoutDirection. **AI:** AILabel, AISkeleton, ChatButton — [GitHub carbon packages/react/src/components](https://github.com/carbon-design-system/carbon/tree/main/packages/react/src/components)
- Dependencies include `flatpickr` (date picker), `downshift` (combobox/select), `@floating-ui/react`, `@carbon/styles` and `@ibm/telemetry-js` — [npm @carbon/react](https://registry.npmjs.org/@carbon/react/1.117.0)

**Blueprint (6.20.0)**
- **@blueprintjs/core** folders: alert, breadcrumbs, button, callout, card, card-list, collapse, context-menu, control-card, dialog, divider, drawer, editable-text, entity-title, forms, hotkeys, html-select, html-table, icon, link, menu, navbar, non-ideal-state, overflow-list, overlay/overlay2, panel-stack, popover, portal, progress-bar, resize-sensor, section, segmented-control, skeleton, slider, spinner, tabs, tag, tag-input, text, toast, tooltip, tree — [GitHub blueprint core components](https://github.com/palantir/blueprint/tree/develop/packages/core/src/components)
- **@blueprintjs/select:** Select, MultiSelect, Suggest, Omnibar, QueryList. **@blueprintjs/datetime:** DateInput, DatePicker, DateRangeInput, DateRangePicker, TimePicker, TimezoneSelect, shortcuts, localisation through date-fns. Other packages: table, icons, colors, labs (Box, Flex) — [GitHub blueprint select](https://github.com/palantir/blueprint/tree/develop/packages/select/src/components), [datetime](https://github.com/palantir/blueprint/tree/develop/packages/datetime/src/components), [packages](https://github.com/palantir/blueprint/tree/develop/packages)

**Breadth references**
- PrimeReact v11 has "75+ accessible UI components" in Styled and Tailwind variants. It is "4 libraries in 1" (Styled, Tailwind, Primitive, Headless). Of v10's 101 components, 54 keep their name in v11 — [PrimeReact components](https://v11.primereact.org/components), [Updating to v11](https://primereact.dev/docs/styled/guides/migration/updating-to-v11)
- Syncfusion markets "50+" React components (its grid, scheduler, gantt and others are sold as one suite). Its free Community License requires under US$1M revenue, 5 or fewer developers, 10 or fewer employees and no more than US$3M outside capital — [Syncfusion Community License](https://www.syncfusion.com/products/communitylicense), [search summary of Syncfusion pages](https://www.syncfusion.com/sales/products/react)

### Inferences
- In 2026 the big libraries have moved beyond plain widgets into complex surfaces. MUI X and Mantine both ship a scheduler/calendar. MUI X, Mantine and Fluent all ship charts. MUI X and Carbon have AI/chat components. For umriss this means its charts and schedule packages are no longer rare. MUI X, Mantine and (per its docs) Chakra each ship both.
- Carbon's "Fluid" input variants, Layer and the UIShell are the closest thing to an industrial or dense-enterprise idiom among these libraries. Blueprint's hotkeys, omnibar, panel-stack and table are the closest to desktop-app density.

### Gaps
- I could not render the Fluent v9 storybook (it redirects to storybooks.fluentui.dev and is JS-rendered). So preview components under `unstable`, and whether a Fluent v9 DatePicker/Calendar exists (historically a separate `@fluentui/react-datepicker-compat`, prior knowledge, unverified), were not confirmed.
- PrimeReact v11 and Syncfusion component names were not listed one by one (only counts).
- Carbon: folder names include internals (ClassPrefix, FeatureFlags) and deprecated items. Which of them are public or stable was not checked.

## Q2: Which components (nearly) all of them have: the "table stakes" set

### Takeaway
Across MUI(+X MIT), Mantine, Chakra, antd, Fluent, Carbon and Blueprint (7 libraries), about 30 components are universal. They are: Button, text input, textarea, checkbox, radio, switch, select, combobox/autocomplete, multi-select/tag input, number input, slider, date picker, dialog/modal, drawer/side panel, popover, tooltip, menu, tabs, breadcrumbs, alert/inline message, toast, progress bar, spinner, skeleton, table, tree, card, list, tag/chip, badge, accordion/collapse and divider. Nearly universal (5–6 of 7): avatar, pagination, stepper, app shell/side nav, file upload, rating, segmented control, empty state, layout primitives (grid/stack). Differentiators (4 or fewer): timeline, carousel, color picker, splitter/resizable panes, tour/onboarding, descriptions/key-value list, statistic, transfer, mentions, cascader, rich text, command palette, virtual list as a public component, charts, scheduler.

### Cited findings (presence matrix; Y = in the catalogue per the Q1 sources)

| Component | MUI (+X MIT) | Mantine | Chakra v3 | antd v6 | Fluent v9 | Carbon | Blueprint |
|---|---|---|---|---|---|---|---|
| Number input | NumberField | NumberInput | number-input | InputNumber | SpinButton | NumberInput | forms (NumericInput)* |
| Combobox / autocomplete | Autocomplete | Combobox, Autocomplete | combobox | AutoComplete | Combobox | ComboBox | Suggest |
| Multi-select / tags | (Autocomplete multiple)* | MultiSelect, TagsInput | tags-input | (Select mode)* | TagPicker | MultiSelect | MultiSelect, TagInput |
| Slider / range | Slider | Slider, RangeSlider | slider | Slider | Slider | Slider | slider |
| Rating | Rating | Rating | rating-group | Rate | Rating | – | – |
| Color picker | – | ColorPicker, ColorInput | color-picker | ColorPicker | ColorPicker, SwatchPicker | – | – |
| File upload | – (core) | FileInput, Dropzone | file-upload | Upload | – | FileUploader | forms (FileInput)* |
| Date picker | X Pickers | @mantine/dates | date-picker | DatePicker | (compat pkg)* | DatePicker | datetime |
| Date range | X Pro (paid) | yes* | ? | RangePicker* | ? | flatpickr range* | DateRangePicker |
| Time picker | X Pickers | TimePicker | ? | TimePicker | ? | TimePicker | TimePicker |
| Segmented control | ToggleButton | SegmentedControl | segment-group | Segmented | – | ContentSwitcher | SegmentedControl |
| Pin / OTP input | – | PinInput | pin-input | (Input.OTP)* | – | – | – |
| Cascader / TreeSelect | – | Cascader, TreeSelect | – | Cascader, TreeSelect | – | – | – |
| Transfer | – | – | – | Transfer | – | – | – |
| Dialog, Drawer, Popover, Tooltip, Menu | Y | Y | Y | Y | Y | Y (Drawer = SidePanel/Tearsheet) | Y |
| Context menu | (Menu)* | – | – | (Dropdown trigger)* | – | ContextMenu | ContextMenu |
| Command palette | – | Spotlight | – | – | – | – | Omnibar |
| Tour / onboarding | – | – | – | Tour | TeachingPopover | Coachmark, Guidebanner | – |
| Tabs, Breadcrumbs | Y | Y | Y | Y | Y | Y | Y |
| Pagination | Y | Y | Y | Y | – | Y | – |
| Stepper | Stepper | Stepper | steps | Steps | – | ProgressIndicator | – |
| App shell / side nav | AppBar+Drawer | AppShell, NavLink | – | Layout+Sider+Menu | Nav | UIShell | Navbar |
| Menubar | Menubar (v9) | Menubar | – | Menu (horizontal) | – | – | – |
| Toolbar | – | – | action-bar | – | Toolbar | – | – |
| Alert / inline message | Alert | Alert | alert | Alert | MessageBar | InlineNotification | Callout |
| Toast | Snackbar | Notifications | toast | message, notification | Toast | ToastNotification | Toast |
| Progress / spinner / skeleton | Y | Y | Y | Y | Y | Y | Y |
| Empty state | – | EmptyState | empty-state | Empty, Result | – | – | NonIdealState |
| Table | Table + X DataGrid | Table | table | Table | Table, DataGrid | DataTable | HTMLTable + @blueprintjs/table |
| Tree | X TreeView | Tree | tree-view | Tree | Tree | TreeView | Tree |
| Timeline | Lab Timeline | Timeline | timeline | Timeline | – | – | – |
| Avatar | Avatar | Avatar | avatar | Avatar | Avatar, Persona | UserAvatar | – |
| Badge / tag / chip | Badge, Chip | Badge, Chip | badge, tag | Badge, Tag | Badge, Tag | Tag, BadgeIndicator | Tag |
| Card / list | Y | Y | Y | Y | Y | Tile/Card, StructuredList | Card, CardList |
| Descriptions / key-value | – | DataList | data-list | Descriptions | – | StructuredList (approx.) | – |
| Statistic / KPI | – | NumberFormatter, RollingNumber | stat | Statistic | – | BigNumber | – |
| Carousel | – | Carousel (ext.) | carousel | Carousel | Carousel | – | – |
| Accordion / collapse | Y | Y | Y | Collapse | Y | Y | Collapse, Section |
| Layout primitives | Box, Stack, Grid | Grid, Stack, Group, Flex | many | Grid, Flex, Space | – | Grid, FlexGrid, Stack | labs Box/Flex |
| Splitter / resizable panes | – | Splitter (9.3) | splitter | Splitter | – | Resizer | – |
| Scroll area | – | ScrollArea | scroll-area | – | – | – | – |
| Virtualized list (public) | x-virtualizer | – | – | (virtual prop)* | Virtualizer | – | (table) |
| Overflow handling | – | OverflowList | – | – | Overflow | OverflowHandler | OverflowList |
| Hotkeys | – | useHotkeys | – | – | – | – | hotkeys |
| Rich text | – | Tiptap RichTextEditor | – | – | – | – | – |
| Copy / code | – | CopyButton, CodeHighlight | clipboard, code-block | Typography copyable* | – | CodeSnippet, CopyButton | – |
| QR code / watermark | – | – | qr-code | QRCode, Watermark | – | – | – |
| Charts | X Charts | @mantine/charts | (docs "Charts")* | separate @ant-design/charts* | @fluentui/react-charts | separate @carbon/charts* | – |
| Scheduler / calendar views | X Scheduler (alpha) | @mantine/schedule | – | Calendar (month grid) | – | – | – |
| AI / chat | X Chat (alpha) | – | – | (@ant-design/x)* | – | AILabel, AISkeleton, ChatButton | – |

`*` = prior knowledge or inferred from a folder name, not verified this session. `?` = not determined. Sources: see the Q1 citations for each library.

- Drag and drop as a general feature is not a component in any core catalogue. It appears inside components: MUI X Tree View Pro reordering ([MUI X licensing](https://mui.com/x/introduction/licensing/)) and drag-and-drop in @mantine/schedule ([Mantine 9.0 changelog](https://mantine.dev/changelog/9-0-0/)).

### Inferences
- A catalogue gap check for umriss should compare against the "universal ~30" row set first. Anything in that set that umriss lacks will be the first thing evaluators notice.
- Splitter has become common only recently (Mantine 9.3 in 2026, and antd, Chakra and Carbon's Resizer). It is on its way to table stakes.

### Gaps
- Starred (`*`) cells need a docs check before publication. Chakra's date-range and time-picker support was not confirmed.

## Q3: Cross-cutting capabilities (forms, theming, CSS approach, dark mode, RTL, i18n, a11y, SSR/RSC, bundle, license)

### Takeaway
The CSS approaches differ widely: Emotion runtime CSS-in-JS (MUI, Chakra), CSS modules (Mantine), CSS-variable CSS-in-JS (antd v6), atomic CSS-in-JS with an optional build step (Fluent/Griffel), Sass (Carbon, Blueprint), and Tailwind or unstyled modes (PrimeReact). Only Mantine (`@mantine/form`) and antd (`Form`) ship their own form-state and validation layer. antd has the widest locale coverage (about 73 locale files). Carbon makes the most explicit accessibility claim (IBM checklist, WCAG 2.1 AA, Equal Access Checker). The major libraries are MIT or Apache-2.0 at their core, and paid tiers exist for MUI X Pro/Premium, Chakra Premium components and Syncfusion.

### Cited findings
- **Forms:** Mantine has `@mantine/form` (use-form, use-field, nested fields, schema validation) — [Mantine llms.txt](https://mantine.dev/llms.txt). antd has a built-in Form in "Data Entry" — [antd llms.txt](https://ant.design/llms.txt). Carbon has Form, FormGroup, FormItem and FormLabel components — [Carbon repo](https://github.com/carbon-design-system/carbon/tree/main/packages/react/src/components). Chakra has field and fieldset components — [Chakra repo](https://github.com/chakra-ui/chakra-ui/tree/main/packages/react/src/components). Fluent has Field — [npm deps](https://registry.npmjs.org/@fluentui/react-components/latest).
- **CSS approach:**
  - MUI: Emotion remains the engine in v9. The v9 theme extends CSS variables using `color-mix()`, and MUI states it aims for "independence from Emotion" in future — [MUI v9 blog](https://mui.com/blog/introducing-mui-v9/)
  - Mantine: CSS modules by default, with Emotion, Vanilla Extract and Sass integrations documented — [Mantine llms.txt](https://mantine.dev/llms.txt)
  - Chakra v3: Emotion packages plus a Panda-style prop validator, and recipes — [npm @chakra-ui/react](https://registry.npmjs.org/@chakra-ui/react/3.37.0)
  - antd v6: `@ant-design/cssinjs` in pure CSS-variables mode by default — [migration v6](https://ant.design/docs/react/migration-v6/)
  - Fluent: Griffel, atomic CSS-in-JS with runtime and build-time modes — [Fluent styles handbook](https://github.com/microsoft/fluentui/blob/master/docs/react-v9/contributing/rfcs/react-components/styles-handbook.md)
  - Carbon: `@carbon/styles` (Sass) — [npm @carbon/react](https://registry.npmjs.org/@carbon/react/1.117.0). Blueprint: Sass — [blueprintjs docs](https://blueprintjs.com/docs/)
  - PrimeReact v11: Styled, Tailwind, Primitive and Headless variants — [Updating to v11](https://primereact.dev/docs/styled/guides/migration/updating-to-v11)
- **Dark mode:**
  - MUI: light/dark palettes, with InitColorSchemeScript against the flash of the wrong theme — [MUI llms.txt](https://mui.com/material-ui/llms.txt)
  - Mantine: color schemes, with ColorSchemeScript against the flash — [Mantine llms.txt](https://mantine.dev/llms.txt)
  - antd: dark via theme algorithms, and runtime switching is lighter with CSS variables — [antd v6 announcement](https://github.com/ant-design/ant-design/issues/55804)
  - Carbon: the Theme component and themes (white, g10, g90, g100 are prior knowledge) — [Carbon repo](https://github.com/carbon-design-system/carbon/tree/main/packages/react/src/components). Blueprint: dark theme — [blueprintjs docs](https://blueprintjs.com/docs/)
- **RTL:**
  - MUI supports RTL (Arabic, Persian, Hebrew) — [MUI llms.txt](https://mui.com/material-ui/llms.txt)
  - Mantine documents RTL — [Mantine llms.txt](https://mantine.dev/llms.txt)
  - Fluent/Griffel flips styles automatically from the FluentProvider direction — [Fluent styles handbook](https://github.com/microsoft/fluentui/blob/master/docs/react-v9/contributing/rfcs/react-components/styles-handbook.md)
  - Carbon has a LayoutDirection component — [Carbon repo](https://github.com/carbon-design-system/carbon/tree/main/packages/react/src/components)
- **i18n / locales:**
  - antd ships about 73 locale files (ar_EG … zh_TW, including de_DE) — [GitHub antd components/locale](https://github.com/ant-design/ant-design/tree/master/components/locale)
  - MUI date handling uses adapters (date-fns, Day.js, Luxon, Moment), per the lab folder names — [mui-lab src](https://github.com/mui/material-ui/tree/master/packages/mui-lab/src)
  - Blueprint datetime localises through date-fns (`dateFnsLocalizedComponent`) — [blueprint datetime](https://github.com/palantir/blueprint/tree/develop/packages/datetime/src/components)
  - Chakra has LocaleProvider and FormatNumber (Intl-based) — [Chakra docs overview](https://www.chakra-ui.com/docs/components/concepts/overview)
- **Accessibility:**
  - Carbon follows the IBM Accessibility Checklist (WCAG AA, Section 508, European standards) and tests components automatically, manually and with screen readers against WCAG 2.1 A/AA, using the IBM Equal Access Checker — [Carbon accessibility overview](https://carbondesignsystem.com/guidelines/accessibility/overview/)
  - Fluent says it has had accessibility "from the start" and uses Tabster for focus management — [Fluent v9 release wiki](https://github.com/microsoft/fluentui/blob/master/docs/react-wiki-archive/Fluent-UI-React-v9-Release.md)
  - MUI v9 lists accessibility and keyboard fixes (keyboard navigation on by default in Charts, Pickers calendar keyboard navigation) but names no WCAG level — [MUI v9 blog](https://mui.com/blog/introducing-mui-v9/)
  - Chakra builds on Ark UI/Zag primitives — [Chakra llms-components.txt](https://chakra-ui.com/llms-components.txt)
  - PrimeReact markets "accessible UI components" — [PrimeReact](https://v11.primereact.org/components)
- **SSR/RSC:** Mantine components need `"use client"`, and RSC support is limited by their dependence on React context — [Mantine llms.txt](https://mantine.dev/llms.txt). Chakra examples also carry `"use client"` — [Chakra llms-components.txt](https://chakra-ui.com/llms-components.txt). The MUI v9 announcement does not address RSC — [MUI v9 blog](https://mui.com/blog/introducing-mui-v9/).
- **React versions:** antd v6 needs React 18 or newer — [migration v6](https://ant.design/docs/react/migration-v6/). Fluent accepts React ≥16.14 and <20 — [npm](https://registry.npmjs.org/@fluentui/react-components/latest).
- **Bundle size (third-party, low confidence):** one 2026 comparison puts MUI at 100–200 KB gzipped and says antd's build output of 1.3 MB is "more than double" others. Another says Mantine's CSS modules remove runtime styling overhead — [PkgPulse](https://www.pkgpulse.com/guides/best-react-ui-libraries-2026), [Untitled UI](https://www.untitledui.com/blog/react-component-libraries), [woodcp dashboard comparison](https://www.woodcp.com/2026/03/react-ui-library-comparison/). The methods are unclear, so treat these only as directional.
- **Licences:**
  - MIT: @mui/material and MUI X community, Mantine, Chakra, antd, Fluent. Apache-2.0: Carbon, Blueprint — [npm registry / GitHub API](https://registry.npmjs.org/)
  - MUI X Pro/Premium are commercial. Since 2026-04-08 they are licensed per application, and Enterprise has a 15-seat minimum — [MUI v9 blog](https://mui.com/blog/introducing-mui-v9/), [MUI X licensing](https://mui.com/x/introduction/licensing/)
  - primereact 11.1.0's npm license field reads "SEE LICENSE IN LICENSE.md", while the GitHub repo reports MIT (conflict, not resolved). Syncfusion is commercial, with a free community licence under conditions — [npm](https://registry.npmjs.org/primereact/latest), [Syncfusion Community License](https://www.syncfusion.com/products/communitylicense)
- **Telemetry:** @carbon/react depends on `@ibm/telemetry-js`, and MUI X has an `x-telemetry` package — [npm @carbon/react](https://registry.npmjs.org/@carbon/react/1.117.0), [mui-x packages](https://github.com/mui/mui-x/tree/master/packages)
- **AI tooling:** Mantine, MUI, antd and Chakra all publish llms.txt docs indexes, and MUI X has `mcp` and `x-agent-tools` packages — [MUI llms.txt](https://mui.com/material-ui/llms.txt), [mui-x packages](https://github.com/mui/mui-x/tree/master/packages)

### Inferences
- In 2026, "docs readable by LLMs" (llms.txt, MCP servers) is becoming an expected feature of a library alongside Storybook and playgrounds.
- Built-in form validation (Mantine, antd) and a broad locale set (antd) are where the big libraries clearly lead a small library. A German-plus-English wording set is narrow next to antd's 73 locales.

### Gaps
- Figma kits: not verified this session. From prior knowledge, MUI, antd, Carbon, Fluent and Mantine have official or community Figma kits.
- TypeScript quality: no objective source found. All are written in TypeScript according to their repos (prior knowledge).
- No reliable numbers on tree-shaking or gzip size per component from a primary source (a bundlephobia check would be needed).
- I found no WCAG conformance level claimed by MUI, Mantine, Chakra or antd in the sources I checked.

## Q4: Adoption signals

### Takeaway
By npm downloads MUI leads by far (about 7.4M/week for @mui/material), followed by antd (about 2.9M), Mantine (about 1.7M) and Chakra (about 1.2M). Fluent, Blueprint, PrimeReact and Carbon each have under 0.4M. On GitHub stars, antd and MUI are level at about 99k each.

### Cited findings
- npm weekly downloads for the week ending 2026-09-21: @mui/material 7,436,757; @mui/x-date-pickers 3,509,838; @mui/x-data-grid 2,106,672; antd 2,856,563; @mantine/core 1,662,415; @mantine/dates 779,172; @chakra-ui/react 1,183,469; @fluentui/react-components 373,013; @blueprintjs/core 306,928; primereact 240,647; @carbon/react 94,456; @syncfusion/ej2-react-grids 21,094 — [npm downloads API](https://api.npmjs.org/downloads/point/last-week/@mui/material)
- GitHub stars (2026-09-24): ant-design 99,606; mui/material-ui 99,095; chakra-ui 40,668; mantine 31,763; blueprint 22,091; fluentui 20,293 (the repo also hosts v8 and web components); carbon 9,489; primereact 8,312; mui-x 5,853 — [GitHub API](https://api.github.com/repos/mui/material-ui)
- A 2026 comparison article claims "MUI has 1.4 million weekly downloads. Mantine has 1.35 million" — [PkgPulse](https://www.pkgpulse.com/guides/best-react-ui-libraries-2026). **This contradicts the npm API** (MUI about 7.4M) and should not be used.

### Inferences
- Carbon's low npm count comes with heavy IBM-internal use, and Blueprint's with Palantir. Downloads understate enterprise design-system use.

### Gaps
- Download trends over time (growth or decline) were not pulled.
