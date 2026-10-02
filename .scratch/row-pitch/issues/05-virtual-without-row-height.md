# 05 — `virtual` without `rowHeight`; no measured heights

Status: ready-for-agent
Type: refactor
Blocked by: 01

## What

- `virtual: { overscan? }` - the window reads the pitch from the rendered
  head row; 36 until it is measured.
- Manual mode keeps the previous page's column widths for its placeholders
  but no longer measures or sets their heights.
- Changelog: a migration line for `rowHeight`.

## Acceptance

- Typecheck: `rowHeight` is no longer accepted.
- The virtualisation suite stays green.
