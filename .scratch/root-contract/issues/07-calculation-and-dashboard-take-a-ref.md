# 07 - Calculation and dashboard take a ref

Status: ready-for-agent
Type: task
Size: S

Blocked by: `04-the-table-is-a-composite.md`
Spec: `.scratch/root-contract/spec.md`

## What to build

The last two packages join the contract.

- **`Calculation`** is a composite.
  - `ref`, `className`, `style` and the rest reach its surface. Today the rest reaches the list inside it.
  - `aria-label`, `aria-labelledby` and `aria-describedby` go to the list.
  - It takes `RefProp` at the surface's element.
- **`Dashboard`** is an element. It takes `RefProp<HTMLDivElement>`, and the `ref` reaches the root
  `role="group"` that already takes its rest.
- **The guard.** Both packages call the shared guard:
  - Calculation: `Calculation` in the composite shape; the operators, givens, `Chain`, `Interim` and `Ref`
    as exceptions, because the calculation reads them.
  - Dashboard: the `Dashboard` that a `useDashboard` harness hands back, as an element; `WidgetType` and
    `HeadingType` as exceptions, because they declare types.
- **README.** One line each on the shape. Regenerate both `API.md`.
- **Changelog** (Changed): calculation, the rest and `ref` now reach the surface, and the name still
  reaches the list; dashboard, it takes a `ref`.

## Acceptance criteria

- [ ] `<Calculation data-testid="oee" aria-label="OEE">` puts the test id on the surface and the name on
      the list.
- [ ] A `ref` on `Calculation` and on `Dashboard` is typed at its element and reaches it: the surface, and
      the root group.
- [ ] Both guards pass, and fail if the probes are split again.
- [ ] `pnpm check calculation`, `pnpm check dashboard`, `pnpm typecheck` and `pnpm check:site` pass.
- [ ] The changelogs carry one migration line per change.
