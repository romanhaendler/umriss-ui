# 11: Stored dashboard views never crash and never lose widgets

Spec: `.scratch/shakedown-defects/spec.md` (Dashboard: readView, unknown widgets survive)
Findings: `dashboard.md` 2 and 3

**What to build:** the dashboard reads any stored value without throwing: a
value that is not an object with a widgets array reads as the default view,
and an entry that is not an object with a string `id` and `type` falls out as
an unknown type does. Widgets whose type is not declared right now stay in
the stored view: Done writes the edited arrangement followed by them in their
stored order; Cancel writes nothing; Reset writes the default view.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Red first (`useDashboard`'s suite): `{}`, `{widgets: null}`, `{widgets: "x"}`, `[]`, `5`, `{widgets: [null]}` and `{version: 1, items: []}` render the default view without throwing
- [ ] An entry without a string id or type falls out; the others stay
- [ ] A widget of an undeclared type survives a move, a resize, a removal of another widget and Done; it is still in the stored view
- [ ] Cancel and Reset behave as before
- [ ] `pnpm check dashboard` green
- [ ] Findings 2 and 3 struck from `.scratch/shakedown/dashboard.md`
