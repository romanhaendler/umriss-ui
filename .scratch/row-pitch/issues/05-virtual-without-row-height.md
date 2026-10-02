# 05 — `virtual` without `rowHeight`; no measured heights

Status: done
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

## Comments

**Delivered, 2 Oct 2026.** c95570f. virtual is true or { overscan }; the window measures the head. 20,000 rows scroll 720,036 px in all three engines.
