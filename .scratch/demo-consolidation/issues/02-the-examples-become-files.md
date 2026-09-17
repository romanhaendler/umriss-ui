# 02 — The charts examples become files

Status: done
Type: task

Blocked by: 01

Spec: `.scratch/demo-consolidation/spec.md`

## Scope

The one real defect in the demos: the charts examples are written down twice — thirteen entries in `demo/outline.ts` and thirteen `data-example` attributes by hand in the JSX. This ticket makes the file the list, as it is in the other two demos.

`Showcase.tsx` (547 lines) is decomposed into `packages/charts/demo/examples/<Page>/NN-<anchor>.tsx`, one file per example, each with a `title` export and a default export that renders. The rules are the shell's and are not re-invented here: `EXAMPLE_PATTERN` in `packages/demo/src/tooling/fileName.ts` fixes the name, the number orders the run, the folder is the page.

- **Every example id is carried over unchanged** — `basic`, `multi-series`, `mixed`, `configuration`, `axes`, `sizes`, `limits-and-state`, `control-chart`, `pareto`, `operating-time`, `matrix`, `schedule`, `benchmark`. The baselines are named after the example; a kept id is a kept picture.
- The folder names are provisional until ticket 03 fixes the pages. Use today's four (`Series`, `Axes`, `Operation`, `Performance`) and let 03 move the files; a folder that belongs to no page is refused at load time by `readExamples`, which is the check doing its job.
- The `data-example` attributes disappear from the JSX. The shell's `Example.tsx` writes them.
- The shared, seeded module-level data (`basicData`, `multiData`, `configData`, `axesData`, `mixedData`, `shiftData`, `measurementData`, `matrixData`, `weekData`) stays in `demo/data.ts` and is imported by the examples. R-6.2 — deterministic and identical across runs — is the reason; nobody inlines a second generator.
- `demo/examples.ts` is written as in the other two demos: `buildDemo` with the two globs. Ten lines.
- `Benchmark.tsx` becomes `examples/Performance/01-benchmark.tsx`, keeping the id `benchmark`. Its exclusion from the screenshots moves in ticket 05.

`Showcase.tsx` is deleted at the end of this ticket. `Shell.tsx` and `shell.css` stay for now — ticket 04 removes them.

## Acceptance

- `packages/charts/demo/examples/` holds thirteen files, each with a `title` export and a default export.
- `outline.ts` no longer lists examples; nothing in `demo/` writes a `data-example` attribute by hand.
- `pnpm test:visual --project=charts-light --project=charts-dark` is green with **no baseline updated** — same ids, same pictures.
- `Showcase.tsx` no longer exists.
