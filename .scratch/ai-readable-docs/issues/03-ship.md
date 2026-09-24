# 03 - Published and shipped

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/ai-readable-docs/spec.md`

## Scope

A2: pages build and the npm `files`; README of each package names it.

## Acceptance

- `npm pack` contains `docs/llms-full.md`; the pages serve `llms.txt`.

## Comments

Delivered: `docs/llms-full.md` in every package's `files`, written by a new
`prepack` (`pnpm run props`), so `pnpm pack` in the publish workflow packs the
text of that version - checked with `pnpm pack` on calculation after deleting
the file. Not checked in (`.gitignore`), like `props.json`. `pnpm build:pages`
copies `llms.txt` and `llms-full.txt` beside each demo and writes
`site/llms.txt`; the front page links it. Every package README names it;
every CHANGELOG has it under `## Unreleased`.
