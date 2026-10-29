# P16 Migrating team - 2026-10-28, 0.48.0 (first run)
Host: p16-migration (src/before MUI 13 + AG Grid + Highcharts 36; src/after core/table/charts). Vite 8.3.5, React 19.3.1, TS strict.
Lines before/after: 112 / 119 (form+dialog+snackbar 42/48, table 32/23, charts 16/23, app bar+root 22/25). Time 12 / 25 min.
Not covered: WebKit, Next, jsdom/Vitest, server mode, axe.

Habits that broke: NumberInput number|null, DatePicker Date; Select native options; FormField error; onSelectionChanged -> t.selection state (lifting during render froze tab); variant contained->primary; Chip->Badge, tone info->accent; maxHeight string only; CSV raw values (50,2026-01-01 vs "€50.00","01/01/2026"); no chart title prop; no CssBaseline (8px body margin).

Findings (unverified until ✓):
1. Break: Vite build with target es2022 / no cssTarget lowers light-dark() -> table light on dark page. Known, still there. shots/cs-after-1280-dark.png.
2. Misfit: Playwright check()/click() on row-selection checkbox times out - input 1x1 opacity 0, box SVG intercepts pointer. node chk.mjs. force:true works.
3. Misfit: click on sortable th does nothing; only the button inside sorts. node sortfilter.mjs.
4. Trap: pageSize without Pagination shows all rows (dev warning exists; documented).
5. Trap: selection lifted into parent state during render freezes tab, no warning (user bug, API invites it).
6. Look: bar chart y axis ends exactly at data max, bars touch plot top.

Wishes: AppBar/header bar (unlisted, MUI AppBar); Table onSelectionChange (unlisted, AG Grid onSelectionChanged); export formatted values option (unlisted, AG Grid processCellCallback; exportValue per column exists); chart title prop (unlisted); CssBaseline (never ADR-0021, Instead holds 1 line).
Held up: type errors named wrong values; dev warnings; selection survives added row; dialog focus, FormField states; toast; CSV BOM + ISO; shift-click range select; 375 no overflow; console clean.

Verified by coordinator: 2 ✓ (Checkbox.module.css:19-24 input 1x1 opacity 0; same as last run qa.md #1 - still open), 3 ✓ (headerCell.tsx:166 th has no click handler, only the label button sorts; APG-conform, a misfit for AG Grid migrants).
