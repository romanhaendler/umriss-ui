# P7 Mira (field service, touch) - 2026-10-28, 0.48.0
Host: p7-field-service (Vite 8, React 19, TS; core/table/alarms; Chromium 375x667 hasTouch isMobile pointer coarse). 170 interactive elements measured with/without touch-scale.css. Not covered: WebKit, dark, Tag/Tooltip overlays, 6x CPU, Toolbar size=md, ControlSizeProvider.

Findings:
1. Trap ✓: import order decides - touch-scale.css imported before core does nothing. tokens.css:172 and touch-scale.css both :root --u-control-height in layer umriss.tokens; core CSS injected by dist/core.js later wins. order-static.mjs: before 32px, after 44px; prod build same. README:107-111 / ADR-0079 say nothing about order.
2. Misfit: opt-in grows only md. Stay small: table toolbar Search/Columns/Export, row actions, Pagination, checkboxes, expand, filter buttons, column-menu buttons (24-26); alarms Ack/Open/Shelve/Unshelve (26); Menu/SplitButton items (32), Combobox options (36), calendar days 38x32, calendar nav, Month/Year selects, Today, Modal close (26), Toast close 22x17; Tabs 32 even though md; Checkbox/Switch/Radio, Slider, FileInput, Tag remove, NumberInput steppers, Breadcrumb links, Accordion headers. Grow to 44: Button/IconButton md, ButtonGroup, SplitButton, Menu triggers, Input, NumberInput, Select, MultiSelect, Date/DateRange/DateTime pickers, Modal/Confirm buttons. cmp.txt. partly documented (ADR-0079 sm/xs stay).
3. Misfit: opt-in hard to find - touch-scale only once in core README, 0 in llms-full of core/table/alarms.
4. Look: 44 px fields beside 32 px Tabs, 26 px toolbars, 38x32 calendar days in one screen.
Wishes: none new.
Held up: 24x24 hit areas hold without opt-in; touch fields 16 px text; Select native picker; token follows opt-in exactly; Modal/Confirm/Drawer footers grow without clipping; static CSS, no hydration issue.
