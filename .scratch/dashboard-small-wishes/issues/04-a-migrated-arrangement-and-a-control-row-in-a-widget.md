# 04 - A migrated arrangement and a control row in a widget

Status: ready-for-agent
Type: task
Size: S

Blocked by: `02-stored-options-are-read-over-the-types-defaults.md`
Spec: `.scratch/dashboard-small-wishes/spec.md`

## What to build

No new API. Two examples on the dashboard's page answer two wishes in the application's own few lines.

- **"An arrangement from an older release."**
  - The application keeps `{ version, view }` in its own storage, never a field of umriss's.
  - A stored value of version 1, in a shape of the application's own, is migrated to the current one by a
    plain function before it reaches `initialView`. `onViewChange` writes the current version back.
  - The example's lead says what needs no migration of the application's: a type's new option (ticket
    02), a size no longer offered, and a type that is gone.
  - The value is written out in the example, so it runs on its own; no browser storage.
- **"Controls of the widget's own."**
  - One widget's content starts with a row of the application's controls, a period switch, above a chart
    that fills the rest of the body.
  - The content is a column at the body's full height: the row at its natural height, the chart in the
    room left. So the row never scrolls away with the content.
  - The lead says why the head takes no controls: it is the grip, takes the arrow keys and carries the one
    menu. It also says that the row rests with the content in the editing mode.
- **The unshown props.** If the props gate now counts `initialView` as shown, its entry in the demo's
  unshown list goes.

## Acceptance criteria

- [ ] Both examples render in the demo's smoke test, have a screenshot each (new baselines, looked at), and
      the accessibility suite passes on the page.
- [ ] In the migration example, the dashboard shows the migrated arrangement, and after a move and "Done"
      the sentence under it shows the current version written back.
- [ ] In the control-row example, at rest the period switch changes the chart. In the editing mode it
      takes neither focus nor a click. Nothing in the widget scrolls at its starting size.
- [ ] `pnpm check dashboard`, `pnpm check:site` and `pnpm test:visual:quick dashboard` pass, and `API.md`
      is unchanged.
