# 01 - The Markdown generator

Status: done
Type: task

Spec: `.scratch/ai-readable-docs/spec.md`

## Scope

A1 for one package (charts), from outline, props and example sources.

## Acceptance

- Output reviewed by hand once; unit test on a fixture outline.

## Comments

Delivered: `packages/demo/src/tooling/llms.ts`, run by each demo's
`demo/props.ts` right after the props tables (so `dev`, `build:demo`,
`typecheck` and now `prepack` all write it). It reads the outline, the tables
`generateProps` returns, the example files through `displaySource` (the
demo's own two string functions, so the text is the code that runs) and the
why pages' TSX, which it turns into Markdown with the compiler's parser - an
element or entity it does not know throws instead of vanishing. A file an
example shows beside itself (`data.ts`) stands once, at the end, not 35
times. Unit test on a fixture package: `packages/demo/tests-unit/llms.test.ts`.
Output read by hand for charts.

Beyond A1: a section "The rest of the API" carries every export of
`src/index.ts` that no page names, with its declaration as the `.d.ts` emits it
(bodies gone, JSDoc kept) - see ticket 04 for why.
