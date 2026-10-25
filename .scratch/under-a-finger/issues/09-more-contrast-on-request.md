# 09 - More contrast when the reader asks for it

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/under-a-finger/spec.md`

## What to build

A reader who turns on "Increase contrast" gets stronger quiet text and edges. It is one token block, as
reduced motion has one.

- **Core's tokens** get a block under `@media (prefers-contrast: more)`. In both themes, through
  `light-dark()`, it sets:
  - the secondary and muted text tones to at least 7:1 (WCAG 1.4.6) on the page and on every surface they
    stand on;
  - the field edge, its hover and the hairlines to at least 3:1 (1.4.11).
- **Its comment** says what it raises and why the accent and status colours stay, if they already reach
  the bound.
- **Forced colours** stay as they are.

## Acceptance criteria

- [ ] The contrast unit test also reads the `prefers-contrast: more` block. In both themes it asserts 7:1
      for the text tones and 3:1 for the edges, on the pairs the test already knows.
- [ ] A feature test with `contrast: 'more'` emulation shows a muted hint's computed colour differs from
      the default.
- [ ] Without the preference, the existing screenshots are unchanged.
- [ ] `pnpm check core` passes.
