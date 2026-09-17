# 04 — Removable tag

Status: done

Spec: `.scratch/foundation-primitives/spec.md`

## Scope

Add a removable tag as its own component. One is fully built today — welded
inside the multi-select, reachable only by using a multi-select.

Behaviour:

- A label, an optional removal action, an optional tone.
- When rendered in a group: arrow-key navigation with a single tab stop for the
  group, and the removal action reachable by keyboard.
- Distinct from the status badge, which is a label rather than a control.

## Acceptance

- Demo tile with a single tag, a group of tags, tags with and without removal,
  and a group demonstrating keyboard navigation.
- Interaction tests: the removal action fires by mouse and by keyboard; arrow
  keys move between tags in a group.
- Screenshot baselines in both themes.
- The multi-select is **not** touched.

## Notes

Build this fresh rather than lifting it out of the multi-select, and leave the
multi-select's internal chip alone. Rebuilding the multi-select on this component
is a sensible follow-up and explicitly out of scope: the multi-select's chip row
measures its own available width and collapses the overflow into a counter, and
that behaviour is not something this ticket should risk.

Downstream consumer: the active-filter strip in
`.scratch/table-surface/issues/03-active-filter-strip.md` depends on this.
