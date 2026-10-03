# 02: The first example starts with the component

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/facade-defects/spec.md`

**What to build:** The first example on every page (the one without a heading) loses its empty head row. Its card shows lead, stage, then a slim foot with the "Code" toggle at the right, styled like the head-row toggle. The hero keeps its accessible name from the example's title; the toggle follows the stage in the tab order. Titled examples are unchanged.

- [x] No example card on any page starts with an empty head row.
- [x] The first example's "Code" toggle sits after its stage, visually and in the tab order, and opens the code.
- [x] The first example is still named by its title for assistive technology.
- [x] The page suite asserts both, on every demo.
- [x] The page-head screenshot baselines of all five demos are renewed together.

## Comments

**Delivered (2026-10-03).**

- `packages/demo/src/Example.tsx`: the hero renders no `header`; the same toggle (chevron and "Code") stands in a new `.exampleFoot` after the stage, before the code block. The section keeps `aria-label` from the title. Titled examples are unchanged. `page.css`: `.exampleFoot`, a slim row (`--u-space-1` / `--u-space-4`) with a line above, the toggle at the right through its own `margin-left: auto`.
- Tests: `checkFirstExample` in `packages/demo/checks/page.ts`, called from all five `features-page.spec.ts` (core `button`, charts `installation`, table `manual-mode`, schedule `appearances`, calculation `installation`): the region named by the title is the page's first example and has no header and no heading; every other example head carries a non-empty heading; the toggle lies below the stage and follows it in document order; it opens the code. Five of five green.
- Four tests entered an example's stage by focusing its toggle and pressing Tab; on a hero the toggle now comes after the stage. New `focusBeforeStage(example)` in `packages/demo/checks/navigation.ts` (the stage takes `tabindex=-1` for one step and drops it on blur) replaces that in `ownBase.ts`, schedule `features-keyboard` and `forced-colors`, table `features-grid`.

**Baselines moved** (light and dark, all of first examples): the `example-*` image of every page's first example in the five demos (core 108, charts 28, table 60, schedule 52, calculation 16) and the forced-colours image of every first example (`forced-*`, core 108, table 60, schedule 52, calculation 16, charts 2), plus the state pictures taken on or over a first example: core `forced-combobox-cursor` and `palette-resting` (the hero stands behind the open palette), table `forced-focus-virtual-row` and `forced-selection--selection--ticked`, schedule `forced-focus-active` and `keyboard-active`, calculation `forced-hover-coupling`. Each card is shorter by the head row and taller by the foot. Samples of each package looked at. Every moved image was checked against the list of first examples; nothing else moved.

**Runs** (narrowed rule, under the lock): page suite in all five light projects; own-base, shell and page in ui-light and table-light; table `features-grid`, schedule `features-keyboard`; `screenshots.spec` filtered to the first examples, `forced-colors.spec`, table `pinning`/`grouping` and the screenshot spec's state pictures in all ten projects. All green after the update. `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green after the rebase onto main.

**Deviation:** the ticket's last box says page-head baselines; those images (`.pageHead`) end above the first example and do not change. The images that do change are the first examples' own, renewed together as above. Charts' `benchmark` has no example image by design (R-5.1). No CHANGELOG entry: demo only.
