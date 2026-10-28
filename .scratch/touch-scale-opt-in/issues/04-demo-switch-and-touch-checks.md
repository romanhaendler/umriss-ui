Status: done
Size: M
Blocked by: 02

# Demo switch for `touch-scale.css`, and the two touch checks

Spec: `../spec.md`, Implementation steps 5 and 6, Acceptance.

- `@umriss-ui/demo`: a switch beside the theme switch (`packages/demo/src/ThemeSwitch.tsx`,
  `Shell.tsx`) that loads `@umriss-ui/core/touch-scale.css` (from core's source,
  the way the demos reach core) so the grown state can be seen from a desk. It
  must also be settable from the URL (e.g. `?touch-scale`) so a test can open a
  page with it. Since the stylesheet only acts under `(pointer: coarse)`, say in
  the switch's hint that it shows under touch emulation, or let the switch apply
  the 44 px regardless of the pointer - pick the simpler that still lets a desk
  user see it, and say which in the report. Follow the shell page rules
  (library components, English wording, `packages/demo/checks/*`).
- Without the import, under touch emulation: a `md` Button, Input, Select and
  SegmentedControl measure 32 px, same as under a fine pointer - a size
  assertion in `packages/core/tests-visual/` (see `features-sizes.spec.ts`,
  `features-touch-targets.spec.ts`).
- With the import: 44 px for the same four; and a check shared by all demos
  (beside `packages/demo/checks/floor.ts`, called from each package's
  `tests-visual` like `checkTargetFloor`) that opens every demo page under
  touch emulation with the stylesheet on and fails when a `md` control is
  clipped by or overflows its container. The 24 px floor check stays as it is,
  and also runs with the stylesheet on.
- You may not run Playwright; write the specs carefully, the coordinator runs them.
