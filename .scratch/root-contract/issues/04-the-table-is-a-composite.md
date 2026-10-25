# 04 - The table is a composite

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr-one-root-contract.md`, `02-the-pass-through-guard-is-shared.md`
Spec: `.scratch/root-contract/spec.md`

## What to build

The tracer bullet for the composite shape, end to end in the table.

- **`Table`.**
  - Its props take the HTML attributes of a `<div>` and `RefProp<HTMLDivElement>`. `ref`, `className`,
    `style` and the rest (`id`, `data-*`) reach the outer frame.
  - `aria-label`, `aria-labelledby` and `aria-describedby` are taken out of the rest and put on the
    `<table>`.
  - `ariaLabel` stays for one further minor as a deprecated alias, and it warns once in development. The
    warning uses the mechanism that the upgrade-promise spec defines.
- **The exported parts.** `Toolbar`, `Pagination`, `Export` and `ColumnMenu` take the element shape on the
  element they render. `Search` takes the field shape, as the `Input` it is.
- **The guard, composite shape.** The shared guard gains the composite shape. A case names how to find its
  named element. The guard passes the three name probes as well, and asserts that they stand on the named
  element and on no other.

  The table calls the guard with:
  - its exports;
  - the `Table` that a `useTable` harness hands back;
  - its exceptions with their reasons: the `Column` family, `RowDetail`, `RowActions`, `Action`, `GroupBy`.
- **README.** One line says which shape the table's components have and that the name goes to the
  `<table>`. Every `ariaLabel` in the table's README, demo, tests and in core's control-room page moves to
  `aria-label`. Regenerate `API.md`.
- **Changelog** (Changed):
  - `ariaLabel` becomes `aria-label`, deprecated, with the release that removes it;
  - `Table` takes `ref`, `id`, `style` and `data-*` on its frame;
  - the parts take their rest.

## Acceptance criteria

- [ ] `<t.Table data-testid="orders" id="orders" style={{ marginTop: 8 }} ref={r}>` puts all four on the
      frame, and `r.current` is that `<div>`.
- [ ] `<t.Table aria-labelledby="h">` names the `<table>` (or the grid) by the heading. The frame carries no
      name.
- [ ] `ariaLabel` on `Table` still names the `<table>`, warns once in development, and is marked deprecated
      in its type.
- [ ] The guard covers `Table` and every exported part, and fails if the name lands on the frame.
- [ ] `pnpm check table`, `pnpm typecheck` and `pnpm check:site` pass, and `pnpm test:visual:quick table`
      passes.
- [ ] The changelog carries one migration line per change.
