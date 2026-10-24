# Shakedown: every wish, gathered (2026-10-24)

Status: needs-triage

What the hosts and personas reached for and did not find. Each wish in the source files carries its three
proofs (task, workaround with lines, where it exists elsewhere). Here they are grouped: first the "never"
decisions as they fared in practice, then the wishes several personas had independently (the count is the
signal), then the rest by package. Alarm management has its own requirements:
`.scratch/alarm-management/requirements.md`.

## 1. The "never" list, tested

Every persona who wished for something on the never list built the ADR's own *Instead*.

| Never (ADR) | Instead | Verdict | Who |
|---|---|---|---|
| Chart export (0032: "a canvas already exports itself") | `canvas.toDataURL()` | **fails, three times**: axes, ticks, labels and legend are DOM, the picture holds only the lines; printing to PDF cuts charts | `charts.md`, `operator-screens.md`, `reports-bi.md` |
| Pivot (0032) | compute pivoted rows, declare their columns | **holds until the columns are not known at compile time** - `Column` is typed per field, so years as columns are hard-coded | `reports-bi.md` |
| Pie / donut (0032) | `pareto()` + `Bar` (+ `Line`) | holds; shares need the cumulative line and a second axis | `design-family.md`, Lena (`table.md`/`charts.md`), `reports-bi.md` |
| Log scale (0032/0059) | `Math.log10` in the accessor, `10^n` ticks | holds; no minor ticks | `charts.md`, `data-science.md` |
| Dependency types, critical path (0032) | negative lag for SS; `ripple()` for cascades | holds with caveats; SS is not marked in the picture; the path itself untested | `schedule.md` |
| Form validation (0060) | own validation through `FormField error` | holds (about 20 lines); the announcement and error summary are missing | `core-screens.md`, `accessibility.md` |
| Content that scrolls in a widget (0064) | `height: 100%` for charts | holds for charts; **fails for a scroll box**, which is `inert` in edit mode | `dashboard.md` |
| Part hooks / class names (0045) | a token per need | holds for 5 of 7; **fails** for the modal width, text-transform, press scale - no token | `design-system.md` |
| Right-to-left (0032) | a general library | not built; hurts operator tools with Arabic or Hebrew staff | `audit-family.md` |

## 2. Wished by several personas independently

| Wish | Personas | Files |
|---|---|---|
| **Number formats**: currency, scientific / engineering / SI notation, significant digits, percent with decimals, a plain integer (a year), consistent minus sign | 6 - Lena, Kai, Frank, Nele, Mara, calculation host | `composed-app.md`, `reports-bi.md`, `data-science.md`, `design-family.md`, `calculation.md` |
| **Linked views**: shared selection, cross-filter and cross-highlight, drill-down, a row click / active row on the table | 3 - Kai, Frank, core screens | `composed-app.md`, `reports-bi.md` |
| **DatePicker: year/month jump and typed entry** | 5 - Jonas, Jule, keyboard (P11), Mira, beginner | `core.md` E, `mobile-native.md`, `accessibility.md` |
| **Touch**: a touch size of 44 px, a bottom sheet, a breakpoint / media hook, close and copy buttons for touch | 5 - Mira, Jule, kiosk, Sven (4K wall), Jonas | `mobile-touch.md`, `mobile-native.md`, `kiosk.md`, `operator-screens.md` |
| **Loading and empty states** on Chart, Schedule and a dashboard widget, as the table has | 2 - Mara, dashboard host | `design-family.md`, `dashboard.md` |
| **Fill-parent sizing** for table, chart and schedule, and the widget's pixel size in its render prop | 3 - Kai, Mara, Lena | `composed-app.md`, `design-family.md`, `charts.md` |
| **Imperative handles**: scroll to a row, focus a cell, zoom/fit and scroll to a lane in the schedule | 3 - Petra, schedule host, Sven | `audit-family.md`, `schedule.md`, `operator-screens.md` |
| **Server search with debounce** (and a cancel token) | 2 - table host, Petra | `table.md`, `audit-family.md` |
| **An Excel-friendly export**: XLSX (spec exists, `.scratch/table-xlsx/`), dates as dates, injection-safe | 4 - Lena, Frank, table host, security | `table.md`, `table-export.md`, `security.md` |
| **Server-renderable read-only views** of table, chart, schedule, calculation | 1 host + Petra's root-prop finding | `cross-package.md` |
| **DEV warnings** for silent traps (wrong data shape, stale accessors, series beyond the palette, missing `Pagination`, below the browser floor) - and DEV warnings that fire at all in Vite | 6 - Lena, Kai, Petra, Frank, Nele, upgrader | `cross-package.md` 15, `composed-app.md`, `audit-family.md`, `reports-bi.md`, `data-science.md`, `upgrade.md` |
| **A testing aid**: polyfills, a sized ResizeObserver, the Jest recipe | 2 - test host, QA | `cross-package.md` |
| **A theme object** instead of ~50 lines of tokens; stable part hooks | 2 - design system, Kai (theming) | `design-system.md`, `core.md` B9 |
| **A deprecation and support policy** | 2 - Petra, upgrader | `audit-family.md`, `upgrade.md` |

## 3. By package (one persona each)

- **core**: password field with reveal, an icon set (a "more" glyph), Pagination in core, Avatar, inline
  edit, AppShell / NavLink / bottom navigation, a list item row, per-file progress in `FileInput`, a
  clickable Stepper, a signature pad, a photo-capture field with thumbnails, a touch route to Tooltip text, a
  long-press helper for ContextMenu, TabList overflow, an open button for the CommandPalette, a remappable
  palette shortcut, a Popover that moves focus in (a defect really: `accessibility.md`), a `FormField` label
  slot, Button `lg` / full width, an async or virtualised Combobox, a form error summary.
- **charts**: legend left/right, a brush, a fixed time zone, follow the live edge with pause, error bars, a
  fit line with band, point opacity or density, a colour bar and cell labels for `Matrix`, a shared y domain
  for small multiples, a gap threshold, typed arrays and Arrow as input, a waterfall, drill-down, a per-month
  aggregation helper, a month tick unit, a tag-aware trend (pens).
- **table**: Shift-click row ranges, a sticky-header offset below an app bar, drag reorder of columns,
  conditional formatting as rules, named custom aggregates (median, std), bookmarks / URL state that survive
  JSON (dates).
- **schedule**: zoom and fit buttons and keyboard zoom, touch editing, validity findings for malformed data, a
  findings list, a data-table alternative for screen readers, undo (in app state), a plant time zone.
- **calculation**: per-line rounding, currency-aware numbers, a negative format, a print stylesheet, a total
  that skips missing values, uncertainty propagation (non-goal in spirit).
- **dashboard**: hide a widget without losing it, a schema version and migration, per-widget Suspense and an
  error hook with retry, lock a widget, drag from the catalogue, widget chrome (head slot, heading level).
- **operator screens** (beyond alarm management): data quality (good/uncertain/bad), alarm sound/flash/hotkeys,
  a symbol / P&ID mimic layer.
