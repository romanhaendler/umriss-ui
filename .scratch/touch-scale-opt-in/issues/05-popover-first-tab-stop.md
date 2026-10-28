Status: done
Size: M
Blocked by: none

# A dialog Popover focuses its first tab stop

Spec: `../spec.md`, second part "A dialog Popover focuses its first tab stop" (all of it).

`packages/core/src/lib/firstTabStop.ts` with its jsdom unit tests (the seven
cases the spec lists; jsdom has no layout, so stub `checkVisibility` / the box
test where needed), `Popover.tsx` uses `firstTabStop(panel) ?? panel`, and the
browser test in core's demo (`packages/core/tests-visual/`; add an example to
the Popover page if none fits). You may not run Playwright; write the spec
carefully, the coordinator runs it.
