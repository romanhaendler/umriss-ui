# Loading, empty and filling the parent, for every view

Type:   grilling
Status: claimed

## Question

Do Chart, Schedule and a dashboard widget get the loading and empty states the table has, and do table,
chart and schedule fill their parent?

- Loading and empty states (`.scratch/shakedown/design-family.md`, `dashboard.md`): the same props and wording
  as the table's, per view?
- Fill-parent sizing for table, chart and schedule (`composed-app.md`, `design-family.md`, `charts.md`):
  ADR-0050 says a chart fills its frame, never below its floor - what is missing for the table and the
  schedule, and is "fill the parent" a prop or the default?
- The widget's pixel size handed to its render prop (`dashboard.md`).
- Per-widget Suspense and an error hook with retry (`dashboard.md`; the Suspense part was fixed in
  `.scratch/shakedown-defects/` - what is left?).
