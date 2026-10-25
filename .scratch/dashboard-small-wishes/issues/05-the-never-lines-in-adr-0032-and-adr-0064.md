# 05 - The "never" lines in ADR-0032 and ADR-0064

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/dashboard-small-wishes/spec.md`

## What to build

Documents only. Four answers of the triage become lines of the record, so that a request is answered by an
ADR (ADR-0032, "Consequences"). Each is a dated amendment: the text below, with "*Added <date>:*" or
"*Amended <date>:*" in front of it, the date of the change. ADR-0032's status line is not touched.

- **ADR-0032, "Everywhere"**, a new item after "Rich text, carousel":

  > **A mimic or P&ID layer.** Symbols for pumps, valves and tanks, the piping between them and a plant
  > picture to place them on are the operator interface itself, and screens, navigation and faceplates are
  > the application's (`docs/standards.md`). Every plant draws its own, to its own norms. *Instead:* the
  > application's own SVG, coloured with the verdict tokens, with a `Stat` beside or over each value.

- **ADR-0032, a new section "The calculation"**, after "The charts" and before "The schedule":

  > **Uncertainty propagation.** Carrying an error through a calculation needs a model of errors - whether
  > two inputs are correlated, how each is distributed - and operators the calculation does not have, such
  > as a root or a power. A calculation is written as it stands on paper (ADR-0027), and it does no unit
  > algebra either. *Instead:* an error the application computed, shown as a `Given` of its own or in a
  > line's `aside`.

- **ADR-0064, "Not yet, and never"**:
  - "dragging from the catalogue to a chosen place" leaves the *Not yet* list;
  - *Never* gets this item:

    > dragging from the catalogue to a chosen place. The catalogue is a drawer over the board, so a drag
    > from it reaches the grid with a pointer only, and only once the drawer is moved aside. Adding puts
    > the widget at the end, and its menu, the arrow keys and "to the start" place it from there.

  - "locking one widget" stays under *Not yet*. `.scratch/dashboard-locked-widget/` takes it out when the
    lock is built.
- **ADR-0064, "The application governs"**, after its sentence "a widget of a type that is gone falls out":

  > *Amended:* a widget of a type not declared is not drawn, and it stays in the stored arrangement through
  > "Done", after the widgets that are drawn. A role, a flag or a plugin loaded late never deletes it.

- **The dashboard's demo page**: its limits list "dragging from the catalogue to a chosen place" under
  "Never" with ADR-0064, no longer under "Not yet".

## Acceptance criteria

- [ ] ADR-0032 holds the mimic item under "Everywhere" and the section "The calculation" with the
      uncertainty item, both dated. Its decision and status line are unchanged.
- [ ] ADR-0064's "Not yet" no longer names dragging from the catalogue, its "Never" does, and its
      "falls out" sentence carries the amendment.
- [ ] The dashboard's demo page and ADR-0064 list the same "not yet" and "never" items.
- [ ] `pnpm check:site` passes.
