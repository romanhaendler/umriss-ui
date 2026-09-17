# 03 — One dialog entrance and exit, shared

Status: done

Spec: `.scratch/command-palette/spec.md`

## Scope

The modal owns a small routine: call `showModal()` on open, run the exit
choreography, then close for real, and skip the choreography entirely under
reduced motion. The palette needs the same routine.

Lift it into one internal hook and have the modal use it. Behaviour-preserving:
the modal's timings, its cancel handling and its backdrop policy stay exactly as
they are.

Internal only. It is not added to the package's public interface — the same call
`popover-seam` made for its geometry function.

## Acceptance

- The modal behaves as before: entrance, exit timing, Escape through the
  choreography rather than a hard close, backdrop click.
- Existing modal tests pass unchanged.
- Screenshot baselines unchanged.
- The hook is not exported from the barrel.

## Notes

This is twenty-five lines and it would be entirely reasonable to ask why it needs
its own ticket. Because `popover-seam` exists: eleven modules, fifty-six
independent implementations of eight concerns, all of which began as a second
copy that nobody thought was worth a ticket. This is that second copy. Taking it
now costs an afternoon; taking it at the eighth costs a spec.

Do this before 04, so that the palette is written against the hook and never
against a copy.
