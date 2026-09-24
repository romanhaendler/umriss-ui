# 02 - All five packages and the index

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/ai-readable-docs/spec.md`

## Scope

A1 for core, table, schedule, calculation; `llms.txt` per package and one workspace index.

## Acceptance

- Five `llms.txt`, five `llms-full.txt`, one index.

## Comments

Delivered: five `llms.txt` (`demo/.generated/`), five `llms-full.txt`
(`docs/llms-full.md`), and the workspace index `site/llms.txt`, written by
`scripts/build-pages.mjs`. Sizes of the full text: core 203 kB, table 195 kB,
charts 144 kB, schedule 144 kB, calculation 48 kB - core sits at the ~200 kB
line A3 names for an MCP server; nothing is split.
