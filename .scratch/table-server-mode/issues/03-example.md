# 03 - A fake server example

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/table-server-mode/spec.md`

## Scope

A demo example with latency over 1,000,000 generated rows.

## Acceptance

- Screenshot; the README names the mode.

## Comments

- 2026-09-25: `Table/15-a-million-rows-on-a-server.tsx`: a fake server over 1,000,000 rows computed from their index, 400 ms per answer, a late answer dropped. The first page comes with the document (the answer to the first view is computed at mount and a view already answered is not asked again), so the screenshot shows a settled page. Baselines light and dark, stable on repeat; no other baseline moved.
- The README names the mode under "What it can do"; `why/table.tsx` says why the table does less over a server.
