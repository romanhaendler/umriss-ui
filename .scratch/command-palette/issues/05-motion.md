# 05 — Entrance, growth, exit

Status: done
Blocked by: 04

Spec: `.scratch/command-palette/spec.md`

## Scope

Three behaviours, deliberately not one setting:

- **Entrance**: opacity 0→1 with scale 0.96→1 over `--u-duration-fast`, on
  `--u-ease-out`.
- **Growth**: the list's height animates as the find count changes. Because the
  rest state is only the field, the first keystroke is a growth from nothing.
  This is the motion the whole choreography exists for and the single most
  characteristic thing about the window it is modelled on.
- **Exit**: none. The dialog closes on the frame it is dismissed.

Under reduced motion all three become instant, through the existing token
collapse and `prefersReducedMotion`.

Row-level stagger is **rejected**, not merely omitted. It photographs well and
types badly: every keystroke restarts it.

## Acceptance

- The panel is the height of the field alone at rest, and taller once results
  exist.
- Height changes are animated, and are instant under reduced motion.
- Dismissal produces no held frame — no exit timer, unlike the modal.
- Existing reduced-motion behaviour elsewhere unaffected.

## Notes

Animating height is the part with real technique in it. Whatever route is taken —
a measured height on a wrapper, or a `grid-template-rows` 0fr→1fr — it must
survive the find count changing on consecutive keystrokes without the animation
restarting from zero each time. Typing `tab`, `tabe`, `tabel` should read as one
continuous settle, not three.

The exit has no animation on purpose. A window that lingers on the way out feels
heavy, and the modal's 160ms exit is right for a sheet and wrong here. If that
looks abrupt in review, the answer is a shorter entrance, not a longer exit.
