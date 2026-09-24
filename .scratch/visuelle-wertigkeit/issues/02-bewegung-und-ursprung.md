# 02 — A motion vocabulary and the origin of the overlays

Status: done

Blocked by: 01

Spec: `.scratch/visuelle-wertigkeit/spec.md`

## Scope

Two connected pieces: the token set for motion, and the motion itself that arises
from it.

**The vocabulary is extended before it is enforced.** The starting finding is
explicitly **not** a discipline problem: all 39 `transition` declarations
reference tokens. It concerns the token set itself.

- **`--u-transition: 120ms ease-out` bakes the CSS keyword in.** 28 of the 39
  transitions take this collective token and thereby run on the default curve,
  although `--u-ease-out: cubic-bezier(0.22, 1, 0.36, 1)` sits two lines above
  it and reaches only 8 transitions. The token has to carry the good curve.
- **The distinctions the library makes have no names.** That is why they stand
  raw in the code: `modalOut`/`backdropOut` with `160ms ease-in` — a finished
  exit motion, only unnamed —, `rotate 700ms linear`,
  `shimmer 1.6s ease-in-out`.

To be distinguished, at least:

- **Entry** and **exit**. Exit is shorter and takes a curve that starts
  immediately, instead of retracing the path backwards. The `160ms ease-in` of
  modal and backdrop are the starting point, not the invention.
- **Micro transition** (colour on hover) and **path transition** (something moves
  or unfolds). Today both collapse onto `--u-transition`.
- **Continuous process** — spinner, skeleton, progress. `linear` and the long
  duration stay permitted, but as named tokens.

After that, all 58 motion declarations are pulled onto it — the 39 transitions
onto the new names, the 6 raw values onto tokens — and the check for durations
and curves prepared in ticket 01 is activated.

**Careful with `--u-transition`:** switching the token to the good curve changes
28 transitions at once. That is intended and the most effective single move of
this ticket — but it belongs delivered as its own named step, so that its effect
stays judgeable.

**Overlays unfold from their trigger.** `position.ts` already exports `Side` and
`Align` and computes the panel's position relative to the anchor. From the same
information follows the origin from which the panel grows — as a **pure function
in exactly this module**. The library thereby gains no additional seam. The
result is a value that the stylesheet uses as `transform-origin`; the component
passes it through, it does not compute.

Affected: popover, menu, combobox list, select list, multiselect list, date
picker panel, modal, toast, tooltip.

The panel appears from its origin with a slight scaling down and opacity; it
disappears faster and without retracing the path backwards. Symmetrical
animation makes a surface feel sluggish.

## Acceptance

- The origin is a pure function in `position.ts`, checked by
  `tests-unit/position.test.ts`. What is checked are **properties of the mapping,
  not the formula** — the same style as in `skala.test.ts`:
  - The origin lies on the edge **opposite** the panel: a panel below the anchor
    grows from the top.
  - The alignment follows (`start` / `center` / `end`).
  - Every combination of `Side` and `Align` yields a valid value.
- All 58 motion declarations reference tokens; the six raw values are resolved.
  `--u-transition` carries the good curve. The check from ticket 01 is active
  for durations and curves, and green.
- Under reduced motion **the path is dropped, not the state change.** A panel
  then appears immediately — but it appears. A focus ring must not become
  invisible under reduced motion because it hung its appearance on an animation.
  Its own component test, prior art: `tests-unit/popover.test.tsx`.
- Screenshot baselines may move. **Every moved baseline is looked at individually
  and justified in the delivery.** A bulk rebuild is ruled out. (Static shots
  should move little here — motion is barely visible in a still image. If much
  moves, that is a sign of an unintended layout effect and is to be
  investigated, not adopted.)
- `tests-visual/barrierefreiheit.spec.ts` stays green.

## Notes

The second of five and the one with the greatest visible return. The difference
between a surface that feels cheap and one that feels expensive is mostly
interaction feel.

A menu that unfolds from its button at the bottom left, instead of fading in at
the centre, is the single biggest difference in this library's perceived value.
The information for it has been on hand since `popover-seam` and is simply not
used.

The second biggest is one line: switching `--u-transition` to `--u-ease-out`.
The curve was carefully chosen from the start and commented as "decisive,
landing softly" — today it reaches only a fifth of the transitions, because the
collective token that carries the other four fifths does not use it.

Order within the ticket: **first the vocabulary, then the sites.** The other way
round, an exception per site arises again — exactly what stands in the stock
today.

No runtime library for motion, no springs. The library animates in CSS; changing
that would be a different and larger decision.

## Comments

**Delivered** (75fb01c, 7793108, 9945ec9; docs in the commit that marks this
ticket done).

- `--u-transition` got `--u-ease-out` as its own commit (75fb01c). It was
  referenced 86 times across the stylesheets; the good curve 23 times.
- The vocabulary (7793108): `--u-ease-exit` (starts at once),
  `--u-duration-press`/`--u-transition-press`, `--u-transition-path`,
  `--u-duration-draw`/`--u-delay-draw`, `--u-duration-exit-fast`, and for
  continuous processes `--u-duration-spin`, `--u-duration-shimmer`,
  `--u-ease-steady`, `--u-ease-swell` (not zeroed under reduced motion). The
  charts' tooltip got `--uc-transition`. Every site is on a token; the curve
  check is on; the exception list holds only the five type values from 01.
  Beyond the ticket's six raw values, the checkbox tick (`320ms ... 60ms`) and
  the button's `80ms` press were named too. Glyph presses moved from 120 to
  80 ms, the table's sort arrow from 120 to 140 ms (a path).
- The origin (9945ec9): `computePosition` reports the side it took;
  `motionOrigin(side, align)` in `position.ts` maps it to a
  `transform-origin`; `position.test.ts` checks the properties the ticket
  names. Popover (and so Menu, ContextMenu, Combobox, MultiSelect, the four date
  pickers' panels) and Tooltip enter by scale 0.96 + opacity from it; Toast
  grows out of its corner (`motionOrigin("top", "end")`). Modal has no anchor
  and keeps its centre; its exit no longer retraces (fade only, on
  `--u-ease-exit`). `Select` is native - its list is the browser's, nothing to
  do.
- Popover and Tooltip had no exit: they unmounted at once. `usePresence` in
  `lib/motion.ts` keeps a closed surface, inert and `data-closing`, for
  `--u-duration-exit-fast` read off the element; under reduced motion or
  without the token it goes in the same pass. `popover.test.tsx` holds the
  origin, the exit's length, reopening during the exit and reduced motion
  (the panel appears, visible, and goes at once). `stylesheets.test.ts` holds
  that no focus style hangs on an animation.
- Screenshots: the core suite (ui-light/ui-dark) passed unchanged, 384 of
  384, the accessibility check included - no baseline moved, as the ticket
  expected of still images. The table, charts, schedule and calculation
  suites were not run here.
- Open: a panel clamped at the window's edge still grows from its aligned
  corner rather than from under its anchor (a `ponytail:` note in
  `position.ts`).
