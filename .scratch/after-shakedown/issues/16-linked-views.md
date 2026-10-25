# Linked views

Type:   grilling
Status: claimed

## Question

How do a table, a chart and a schedule on one screen follow each other - shared selection, cross-filter,
cross-highlight, drill-down, an active row?

Three personas built it by hand (`.scratch/shakedown/composed-app.md`, `reports-bi.md`, `core-screens.md`).
Already decided: a chart reports a range and holds no selection (ADR-0056, open-points-roadmap C1), and "a
chart filters a table" is a scenario, not a feature (X6, in `.scratch/chart-range-selection-and-navigator/`).

- After that spec, what is still missing: a row click / active row on the table that a chart can highlight,
  a highlight a chart takes from outside, drill-down along a time hierarchy (`reports-bi.md`, ~20 lines)?
- A feature (a shared key the views agree on) or more scenarios with recipes?
- Does any of it need a chart to hold state, against ADR-0056?
