# 04 — Loading over rows keeps the rows

Status: done
Type: feature
Blocked by: 01

## What

- `loading` with rows: the rows stay; the body dims after 200 ms (a short
  answer never dims it) and takes no pointer; `aria-busy` as before.
- `loading` without rows: placeholders.
- The manual-mode demo keeps the previous page while the next is on its way,
  as TanStack Query's `keepPreviousData` does.

## Acceptance

- Unit: rows stay rendered and the body is marked stale while loading; no
  placeholders then; placeholders without rows.

## Comments

**Delivered, 2 Oct 2026.** c7c08ec. data-stale, dimmed after --u-delay-stale (91a70c9). Manual mode keeps its placeholders' widths, measures no heights.
