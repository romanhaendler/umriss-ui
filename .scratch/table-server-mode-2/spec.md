# The server mode, worked out

Status: needs-triage
Date:   2026-10-04
Origin: grilling of 2026-10-04 (Q26): the user wants the server mode worked out properly, after `.scratch/component-view/`.
Blocked by: `.scratch/component-view/` 04 (`server`, `onRequest`).

## Problem Statement

The server mode (`.scratch/table-server-mode/`, decided on standing trust,
never asked for in detail) shows one page a server answered. It leaves out
what the other grids offer: grouping and aggregates from the server, "select
all" and export beyond the page, list filter values only through
`filterOptions`, no caching of pages, no loading while scrolling, no tree rows
from the server.

## Next step

Research first - AG Grid's server-side row model, MUI X's data source,
TanStack's manual mode and what the archives and histories umriss is for
actually need (ADR-0035) - then a grilling, then this spec's decisions and
issues.
