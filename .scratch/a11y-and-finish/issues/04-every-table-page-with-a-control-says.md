# 04: Every table page with a control says its keys

Status: ready-for-agent
Blocked by: 02 (The silent-page check, with charts and calculation filled)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** The check wired into the table demo. First table, Column, Formats, Presets, Search, Filter, Pre-filter, Pagination, Aggregate, Selection, Row appearance, Toolbar, Toolbar controls, Export, View, Manual mode and VerdictColumn get a Keyboard section: own rows where the table binds a key itself (First table: Enter and Space on a sortable header, Escape closing a cut value's tip), otherwise `keysOf` the core control (Input, Select, Popover, Menu, Checkbox, Button). First table and AlarmList get Accessibility sections.

- [ ] The check passes on every table page, exceptions reasoned (Installation and Provider have no tabbable stage)
- [ ] Every `keysOf` to core resolves to core's page and its Keyboard anchor
- [ ] Screenshot baselines renewed for the pages that gained sections
