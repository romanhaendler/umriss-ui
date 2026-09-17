# 10 — Loose ends

Status: done
Type: task

Spec: `.scratch/demo-consolidation/spec.md`

## Scope

Two small things found while taking the inventory. Neither is urgent; both invite a wrong guess from the next reader.

**The gap at `Column/09`.** `packages/table/demo/examples/Column/` runs `01`–`08`, then `10`–`13`. The number orders the run and nothing else, so nothing is missing — but a gap reads as a deletion. Either renumber `10`–`13` to `09`–`12` (which touches four file names and, because the anchor is the name after the number, **no** baseline: the picture is named after the anchor) or leave it and write one line in the folder's first file saying the number only orders. Renumbering is preferred; verify the baseline claim before committing by running the charts and table projects.

**`packages/table/demo/ui-styles.css`** reaches into the neighbouring package by path (`@import "../../core/src/styles/tokens.css"`), which is exactly what `eslint.config.js` forbids for `.ts`/`.tsx` and cannot see in CSS. It is a build convenience with a real reason — the package stylesheet exists only after a build — and the same construction is about to appear in charts (ticket 04). So: keep it, and make the reason visible in one place instead of two. A sentence in each file naming the alias in `vite.demo.config.ts` that puts it there, and a line in `docs/testing.md` (or `TESTS.md`) under Conventions saying that a demo resolves the neighbouring package's stylesheet from source, deliberately, and that this is the one path exception.

## Acceptance

- `packages/table/demo/examples/Column/` has no gap in its numbering, or a sentence saying why one is harmless.
- `pnpm test:visual` is green with no baseline modified.
- The stylesheet exception is stated once in the conventions and referenced from the two demos that use it.

## Comments

**Delivered.** `Column/10`–`13` are `09`–`12`; the anchor after the number is
unchanged, so no baseline moved — the pictures are named `example-column--width`,
`--own-ordering`, `--presets`, `--wrapper` and still are.

The stylesheet exception is stated once, in `docs/testing.md` under Conventions,
and referenced from both `demo/ui-styles.css` files — table's and the one charts
gained with ticket 04.
