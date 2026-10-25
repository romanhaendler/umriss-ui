# 03 - The layer order for Tailwind v4 and a wrapper library

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/theming-recipe/spec.md`

## What to build

A host's or a wrapper's layered CSS works with umriss whichever stylesheet loads first. Core's README says
how, and a visual check proves it (`core.md` B7, `design-system.md` 5).

- **Core's README, Styles section.** After "Everything can be overridden", add:
  - **Tailwind v4.** `@layer theme, base, umriss.tokens, umriss.base, umriss.components, components, utilities;`
    as the first CSS the page reads, before `@import "tailwindcss"`. With it, utilities win over umriss and
    preflight stays below it.
  - **A wrapper library.** `@layer umriss.tokens, umriss.base, umriss.components, <its layer>;` as its
    stylesheet's first statement. That holds in either load order.
  - Unlayered CSS always wins. A classic unlayered reset (Bootstrap and the like) is not fixed by layer
    order.
- **The Theming page.** Its line "Inside a layer of your own it wins only if that layer was named after the
  library's" points at the README section; it does not repeat the declarations.
- **The proof.** It is a `@quick` check in core, light only, with no Tailwind dependency.
  - Two layered rules stand in for Tailwind:
    - `base`, standing in for preflight, sets a button's padding and background to nothing;
    - `utilities` gives a probe class a background.
  - One rule stands in for a wrapper: its own layer overrides `--u-color-accent`.
  - Each is placed once before core's stylesheet (through an init script that writes it at the document's
    start) and once after it (an added style tag).

## Acceptance criteria

- [ ] With the Tailwind declaration first, in both orders, a Button keeps its own padding and background
      under the `base` rule, and a Button given the probe class takes the utility's background.
- [ ] With the wrapper declaration, in both orders, an accent-coloured element takes the wrapper's accent.
- [ ] The control: without a declaration, a wrapper layer placed before core does not take effect. This
      proves the check is not green by accident.
- [ ] The README holds both declarations as the check uses them, and the check uses nothing the README does
      not say besides the stand-in rules.
- [ ] `pnpm check core` and `pnpm check:site` pass, and `pnpm test:visual:quick core` passes.
- [ ] The changelog notes the README section.
