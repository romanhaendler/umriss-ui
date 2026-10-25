# 03 - A widget hidden by role stays in the arrangement

Status: ready-for-agent
Type: task
Size: S

Blocked by: `02-stored-options-are-read-over-the-types-defaults.md`,
`.scratch/views-in-their-frame/issues/04-the-dashboards-readme-says-what-fills-a-widget.md`
Spec: `.scratch/dashboard-small-wishes/spec.md`

## What to build

No new API. An application hides a widget from a role by not declaring its type for that role, and the
documents say that the widget is kept. Since `.scratch/shakedown-defects/`, a widget of a type not declared
stays in the stored arrangement through "Done", after the widgets that are drawn. The README still says that
it "falls out".

- **The README's bullet "A kept arrangement is read leniently"** says what the dashboard does:
  - a widget of a type not declared is not drawn and stays in the stored arrangement. "Done" keeps it after
    the widgets that are drawn, so a widget behind a role, a flag or a plugin loaded late is never lost;
  - a size a type no longer offers falls back to its starting size;
  - options a stored widget lacks come from its type's default options (ticket 02).

  The lines that `.scratch/views-in-their-frame/` writes beside the same bullet stay as they are.
- **The example** "A widget for one role" on the dashboard's page:
  - a switch between two roles;
  - a cost widget whose `WidgetType` is declared only for the role that may see it;
  - the other role arranges and presses "Done", and on switching back the cost widget is there again, at
    the end. A sentence under the dashboard shows what the application was told, and says why the widget
    comes back at the end.
- **The scenario's "Load an old arrangement"** says that the weather widget is not drawn and stays in the
  stored value, where it now says that it fell out.

## Acceptance criteria

- [ ] The README and the scenario name no behaviour the dashboard does not have. The stored-arrangement unit
      test of undeclared types is the proof the sentence points at.
- [ ] The example renders in the demo's smoke test, has a screenshot of its own (a new baseline, looked
      at), and the accessibility suite passes on the page.
- [ ] In the example, switching roles, moving a widget and pressing "Done", then switching back, shows the
      cost widget again.
- [ ] `pnpm check dashboard`, `pnpm check:site` and `pnpm test:visual:quick dashboard` pass, and `API.md`
      is unchanged.
